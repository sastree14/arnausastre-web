import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { insertGrowthRow, isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow } from '@/lib/growth-admin'

const PERSON_STATUS_BY_KIND: Record<string, string | null> = {
  followed: 'followed',
  connection_requested: 'connection_requested',
  connected: 'connected',
  message_sent: 'contacted',
  replied: 'replied',
  follow_up: 'follow_up',
  discovery_proposed: 'discovery_proposed',
  discovery_booked: 'discovery_booked',
  proposal_sent: 'proposal_sent',
  negotiation: 'negotiation',
  won: 'completed',
  lost: 'completed',
  completed: 'completed',
  not_interested: 'not_interested',
  discarded: 'discarded',
  note: null,
  company_invite_sent: null,
}

const COMPANY_STATUS_BY_KIND: Record<string, string | null> = {
  company_researching: 'researching',
  company_followed: 'followed',
  company_contact_identified: 'contact_identified',
  company_contacted: 'contacted',
  company_completed: 'completed',
  company_discarded: 'discarded',
  company_note: null,
}

const OPPORTUNITY_MILESTONES: Record<string, { stage: string; probability: number }> = {
  discovery_proposed: { stage: 'discovery', probability: 25 },
  discovery_booked: { stage: 'discovery_booked', probability: 40 },
  proposal_sent: { stage: 'proposal', probability: 60 },
  negotiation: { stage: 'negotiation', probability: 80 },
  won: { stage: 'won', probability: 100 },
  lost: { stage: 'lost', probability: 0 },
}

const ALLOWED_KINDS = new Set([
  ...Object.keys(PERSON_STATUS_BY_KIND),
  ...Object.keys(COMPANY_STATUS_BY_KIND),
])

const TERMINAL_STATUSES = new Set(['completed', 'not_interested', 'discarded'])

async function syncOpportunity(personId: string, companyId: string, kind: string, nextActionAt: string | null, occurredAt: string) {
  const milestone = OPPORTUNITY_MILESTONES[kind]
  if (!milestone) return

  const people = await queryGrowthTable<any>('people', { person_id: `eq.${personId}`, limit: '1' })
  const person = people[0]
  if (!person) return

  const resolvedCompanyId = companyId || person.company_id || ''
  const companies = resolvedCompanyId ? await queryGrowthTable<any>('companies', { company_id: `eq.${resolvedCompanyId}`, limit: '1' }) : []
  const company = companies[0]
  const existing = await queryGrowthTable<any>('crm_opportunities', {
    primary_person_id: `eq.${personId}`,
    order: 'updated_at.desc',
    limit: '1',
  })

  const changes = {
    company_id: resolvedCompanyId || null,
    primary_person_id: personId,
    name: `${company?.name || person.name || 'Lead'} · ${person.name || 'Opportunity'}`,
    stage: milestone.stage,
    probability: milestone.probability,
    source: existing[0]?.source || 'linkedin',
    next_action_at: nextActionAt,
    metadata: {
      ...(existing[0]?.metadata || {}),
      last_milestone: kind,
      last_milestone_at: occurredAt,
    },
    updated_at: occurredAt,
  }

  if (existing[0]) {
    await updateGrowthRow('crm_opportunities', 'opportunity_id', existing[0].opportunity_id, changes)
    return
  }

  await insertGrowthRow('crm_opportunities', {
    opportunity_id: `opportunity_${randomUUID().replaceAll('-', '').slice(0, 12)}`,
    tenant_id: 'sc-analytics',
    source_content_id: null,
    value: 0,
    currency: 'EUR',
    created_at: occurredAt,
    ...changes,
  })
}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const form = await request.formData()
  const personId = String(form.get('person_id') || '').trim()
  const companyId = String(form.get('company_id') || '').trim()
  const kind = String(form.get('kind') || '').trim()
  const content = String(form.get('content') || '').trim()
  const nextActionRaw = String(form.get('next_action_at') || '').trim()
  const channel = String(form.get('channel') || (personId ? 'linkedin' : 'crm')).trim() || 'crm'
  const actor = String(form.get('actor') || (kind === 'company_invite_sent' ? 'sc_analytics' : 'arnau')).trim() || 'arnau'

  if (!personId && !companyId) return new NextResponse('Missing person_id/company_id', { status: 400 })
  if (!ALLOWED_KINDS.has(kind)) return new NextResponse('Unsupported interaction kind', { status: 400 })

  let nextActionAt: string | null = null
  if (nextActionRaw) {
    const parsed = new Date(nextActionRaw)
    if (Number.isNaN(parsed.getTime())) return new NextResponse('Invalid next_action_at', { status: 400 })
    nextActionAt = parsed.toISOString()
  }

  const occurredAt = new Date().toISOString()
  const internalKinds = new Set(['note', 'company_note', 'company_researching', 'discovery_proposed', 'discovery_booked', 'negotiation', 'won', 'lost', 'completed'])
  const direction = kind === 'replied' ? 'inbound' : (internalKinds.has(kind) ? 'internal' : 'outbound')

  await insertGrowthRow('interactions', {
    interaction_id: `interaction_${randomUUID().replaceAll('-', '').slice(0, 12)}`,
    tenant_id: 'sc-analytics',
    company_id: companyId || null,
    person_id: personId || null,
    channel,
    direction,
    kind,
    actor,
    content,
    occurred_at: occurredAt,
    next_action_at: nextActionAt,
  })

  if (personId) {
    const personStatus = PERSON_STATUS_BY_KIND[kind]
    if (personStatus) {
      await updateGrowthRow('people', 'person_id', personId, {
        status: personStatus,
        completed_at: TERMINAL_STATUSES.has(personStatus) ? occurredAt : null,
      })
    }
    await syncOpportunity(personId, companyId, kind, nextActionAt, occurredAt)
  } else if (companyId) {
    const companyStatus = COMPANY_STATUS_BY_KIND[kind]
    if (companyStatus) {
      await updateGrowthRow('companies', 'company_id', companyId, {
        status: companyStatus,
        completed_at: TERMINAL_STATUSES.has(companyStatus) ? occurredAt : null,
      })
    }
  }

  const returnTo = String(form.get('return_to') || '/growth-admin/crm')
  const url = new URL(returnTo.startsWith('/') ? returnTo : '/growth-admin/crm', request.url)
  url.searchParams.set('interaction_saved', kind)
  return NextResponse.redirect(url, 303)
}
