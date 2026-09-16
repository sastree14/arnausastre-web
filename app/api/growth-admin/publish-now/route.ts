import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getContentItem, insertGrowthRow, isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow, type GrowthApproval, type GrowthTask } from '@/lib/growth-admin'
import { dispatchOperatorQueue } from '@/lib/github-actions'

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData()
  const contentId = String(form.get('content_id') || '').trim()
  if (!contentId) return new NextResponse('Missing content_id', { status: 400 })

  const item = await getContentItem(contentId)
  if (!item) return new NextResponse('Content not found', { status: 404 })
  if (item.status === 'published') return NextResponse.redirect(new URL('/growth-admin/content?filter=published', request.url), 303)

  const approvals = await queryGrowthTable<GrowthApproval>('approvals', {
    target_id: `eq.${contentId}`,
    status: 'eq.approved',
    order: 'decided_at.desc',
    limit: '10',
  })
  const expectedType = item.content_type === 'article' ? 'publish_article' : 'publish_post'
  if (!approvals.some((row) => row.action_type === expectedType)) {
    return new NextResponse('Content has not been approved for publication', { status: 409 })
  }

  await updateGrowthRow('content_items', 'content_id', contentId, {
    scheduled_at: null,
    status: 'approved',
  })

  const taskType = item.content_type === 'article' ? 'OPERATOR_PUBLISH_ARTICLE' : 'OPERATOR_PUBLISH_LINKEDIN'
  const recent = await queryGrowthTable<GrowthTask>('tasks', {
    tenant_id: 'eq.sc-analytics',
    type: `eq.${taskType}`,
    order: 'created_at.desc',
    limit: '5',
  }, { cacheSeconds: 0 })
  const duplicate = recent.find((task) => {
    if (!['queued', 'pending', 'running'].includes(String(task.status || ''))) return false
    if (String(task.inputs?.content_id || '') !== contentId) return false
    const created = task.created_at ? Date.parse(task.created_at) : NaN
    return Number.isFinite(created) && Date.now() - created <= 30_000
  })

  const taskId = duplicate?.task_id || `task_${randomUUID().replaceAll('-', '').slice(0, 12)}`
  if (!duplicate) {
    const now = new Date().toISOString()
    await insertGrowthRow('tasks', {
      task_id: taskId,
      tenant_id: 'sc-analytics',
      type: taskType,
      scheduled_for: now,
      status: 'queued',
      requires_approval: false,
      inputs: { content_id: contentId },
      outputs: {},
      created_at: now,
    })
  }

  const dispatch = await dispatchOperatorQueue()
  const url = new URL('/growth-admin/content', request.url)
  url.searchParams.set('queued', taskId)
  url.searchParams.set('dispatched', dispatch.dispatched ? '1' : '0')
  url.searchParams.set('deduplicated', duplicate ? '1' : '0')
  if (!dispatch.dispatched) url.searchParams.set('dispatch_reason', dispatch.reason)
  return NextResponse.redirect(url, 303)
}
