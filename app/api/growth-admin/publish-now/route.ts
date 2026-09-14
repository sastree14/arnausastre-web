import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getContentItem, insertGrowthRow, isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow, type GrowthApproval } from '@/lib/growth-admin'

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData()
  const contentId = String(form.get('content_id') || '').trim()
  if (!contentId) return new NextResponse('Missing content_id', { status: 400 })

  const item = await getContentItem(contentId)
  if (!item) return new NextResponse('Content not found', { status: 404 })
  if (item.status === 'published') return NextResponse.redirect(new URL('/growth-admin/content', request.url), 303)

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

  const taskId = `task_${randomUUID().replaceAll('-', '').slice(0, 12)}`
  await insertGrowthRow('tasks', {
    task_id: taskId,
    tenant_id: 'sc-analytics',
    type: item.content_type === 'article' ? 'OPERATOR_PUBLISH_ARTICLE' : 'OPERATOR_PUBLISH_LINKEDIN',
    scheduled_for: new Date().toISOString(),
    status: 'queued',
    requires_approval: false,
    inputs: { content_id: contentId },
    outputs: {},
    created_at: new Date().toISOString(),
  })

  const url = new URL('/growth-admin/content', request.url)
  url.searchParams.set('queued', taskId)
  return NextResponse.redirect(url, 303)
}
