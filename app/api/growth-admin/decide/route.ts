import { NextResponse } from 'next/server'
import {
  GrowthApproval,
  getContentItem,
  isGrowthAdminAuthenticated,
  queryGrowthTable,
  updateGrowthRow,
} from '@/lib/growth-admin'
import { getContentPublicationReadiness } from '@/lib/growth-approval'

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const form = await request.formData()
  const approvalId = String(form.get('approval_id') || '')
  const decision = String(form.get('decision') || '')
  if (!approvalId || !['approved', 'rejected'].includes(decision)) return new NextResponse('Invalid approval request', { status: 400 })

  const approvals = await queryGrowthTable<GrowthApproval>('approvals', { approval_id: `eq.${approvalId}`, limit: '1' })
  const current = approvals[0]
  if (!current) return new NextResponse('Approval not found', { status: 404 })

  const isPublish = current.action_type === 'publish_post' || current.action_type === 'publish_article'
  if (decision === 'approved' && isPublish) {
    const gate = await getContentPublicationReadiness(current.target_id)
    if (!gate) return new NextResponse('Content item not found', { status: 404 })
    if (!gate.readiness.ready) {
      const url = new URL('/growth-admin/approvals', request.url)
      url.searchParams.set('blocked', gate.readiness.issues.join(' '))
      return NextResponse.redirect(url, 303)
    }
  }

  const decidedAt = new Date().toISOString()
  const approval = await updateGrowthRow<GrowthApproval>('approvals', 'approval_id', approvalId, {
    status: decision,
    decided_at: decidedAt,
  })
  if (!approval) return new NextResponse('Approval not found', { status: 404 })

  if (approval.action_type === 'publish_post') {
    await updateGrowthRow('content_items', 'content_id', approval.target_id, {
      status: decision === 'approved' ? 'approved' : 'rejected',
    })
  }

  if (approval.action_type === 'publish_article') {
    if (decision === 'rejected') {
      await updateGrowthRow('content_items', 'content_id', approval.target_id, { status: 'rejected' })
    } else {
      const item = await getContentItem(approval.target_id)
      if (!item) return new NextResponse('Content item not found', { status: 404 })
      const scheduled = item.scheduled_at ? new Date(item.scheduled_at) : null
      const isFuture = Boolean(scheduled && scheduled.getTime() > Date.now())
      await updateGrowthRow('content_items', 'content_id', approval.target_id, {
        status: isFuture ? 'scheduled' : 'approved',
        published_at: null,
        external_post_url: null,
      })
    }
  }

  return NextResponse.redirect(new URL('/growth-admin/approvals', request.url), 303)
}
