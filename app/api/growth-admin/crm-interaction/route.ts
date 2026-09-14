import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { insertGrowthRow, isGrowthAdminAuthenticated, updateGrowthRow } from '@/lib/growth-admin'

const STATUS_BY_KIND: Record<string, string | null> = {
  followed: 'followed',
  connection_requested: 'connection_requested',
  connected: 'connected',
  message_sent: 'contacted',
  replied: 'replied',
  follow_up: 'follow_up',
  discovery_proposed: 'discovery_proposed',
  discovery_booked: 'discovery_booked',
  not_interested: 'not_interested',
  discarded: 'discarded',
  note: null,
  company_invite_sent: null,
}

const ALLOWED_KINDS = new Set(Object.keys(STATUS_BY_KIND))

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const form = await request.formData()
  const personId = String(form.get('person_id') || '').trim()
  const companyId = String(form.get('company_id') || '').trim()
  const kind = String(form.get('kind') || '').trim()
  const content = String(form.get('content') || '').trim()
  const nextActionRaw = String(form.get('next_action_at') || '').trim()
  const channel = String(form.get('channel') || 'linkedin').trim() || 'linkedin'

  if (!personId) return new NextResponse('Missing person_id', { status: 400 })
  if (!ALLOWED_KINDS.has(kind)) return new NextResponse('Unsupported interaction kind', { status: 400 })

  let nextActionAt: string | null = null
  if (nextActionRaw) {
    const parsed = new Date(nextActionRaw)
    if (Number.isNaN(parsed.getTime())) return new NextResponse('Invalid next_action_at', { status: 400 })
    nextActionAt = parsed.toISOString()
  }

  const occurredAt = new Date().toISOString()
  const direction = kind === 'replied' ? 'inbound' : 'outbound'

  await insertGrowthRow('interactions', {
    interaction_id: `interaction_${randomUUID().replaceAll('-', '').slice(0, 12)}`,
    tenant_id: 'sc-analytics',
    company_id: companyId || null,
    person_id: personId,
    channel,
    direction,
    kind,
    content,
    occurred_at: occurredAt,
    next_action_at: nextActionAt,
  })

  const personStatus = STATUS_BY_KIND[kind]
  if (personStatus) {
    await updateGrowthRow('people', 'person_id', personId, { status: personStatus })
  }

  const returnTo = String(form.get('return_to') || '/growth-admin/crm')
  const url = new URL(returnTo.startsWith('/') ? returnTo : '/growth-admin/crm', request.url)
  url.searchParams.set('interaction_saved', kind)
  return NextResponse.redirect(url, 303)
}
