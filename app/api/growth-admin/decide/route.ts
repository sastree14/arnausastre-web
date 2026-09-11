import { NextResponse } from 'next/server'
import {
  GrowthApproval,
  isGrowthAdminAuthenticated,
  updateGrowthRow,
} from '@/lib/growth-admin'

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const form = await request.formData()
  const approvalId = String(form.get('approval_id') || '')
  const decision = String(form.get('decision') || '')
  if (!approvalId || !['approved', 'rejected'].includes(decision)) {
    return new NextResponse('Invalid approval request', { status: 400 })
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

  return NextResponse.redirect(new URL('/growth-admin', request.url), 303)
}
