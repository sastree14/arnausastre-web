import { NextResponse } from 'next/server'
import { insertGrowthRow, isGrowthAdminAuthenticated, updateGrowthRow } from '@/lib/growth-admin'

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const form = await request.formData()
  const approvalId = String(form.get('approval_id') || '')
  if (!approvalId) return new NextResponse('Missing approval_id', { status: 400 })

  const executedAt = new Date().toISOString()
  const approval: any = await updateGrowthRow('approvals', 'approval_id', approvalId, {
    status: 'executed',
    executed_at: executedAt,
  })
  if (!approval) return new NextResponse('Approval not found', { status: 404 })

  const payload = approval.payload || {}
  await insertGrowthRow('interactions', {
    interaction_id: `interaction_${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`,
    tenant_id: approval.tenant_id,
    company_id: payload.company_id || null,
    person_id: payload.person?.person_id || null,
    channel: 'linkedin',
    direction: 'outbound',
    kind: approval.action_type,
    content: payload.message || '',
    occurred_at: executedAt,
  })

  return NextResponse.redirect(new URL('/growth-admin', request.url), 303)
}
