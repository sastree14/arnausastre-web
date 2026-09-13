import { NextResponse } from 'next/server'
import {
  GrowthApproval,
  getContentItem,
  isGrowthAdminAuthenticated,
  updateGrowthRow,
} from '@/lib/growth-admin'

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const form = await request.formData()
  const approvalId = String(form.get('approval_id') || '')
  const decision = String(form.get('decision') || '')
  if (!approvalId || !['approved', 'rejected'].includes(decision)) return new NextResponse('Invalid approval request', { status: 400 })

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
      const publicSlug = item.brief_id || item.content_id
      await updateGrowthRow('content_items', 'content_id', approval.target_id, {
        status: isFuture ? 'scheduled' : 'published',
        published_at: isFuture ? null : decidedAt,
        external_post_url: `/knowledge/${publicSlug}`,
      })
    }
  }

  return NextResponse.redirect(new URL('/growth-admin#approvals', request.url), 303)
}
