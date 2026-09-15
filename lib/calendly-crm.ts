import 'server-only'

import { randomUUID } from 'node:crypto'
import { insertGrowthRow, queryGrowthTable, updateGrowthRow } from '@/lib/supabase-growth'

type Json = Record<string, any>

const TENANT_ID = 'sc-analytics'
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com','googlemail.com','outlook.com','hotmail.com','live.com','icloud.com','me.com','yahoo.com','proton.me','protonmail.com','gmx.com','gmx.es'
])

function token() {
  const value = (process.env.CALENDLY_ACCESS_TOKEN || '').trim()
  if (!value) throw new Error('CALENDLY_ACCESS_TOKEN is not configured')
  return value
}

function headers(extra: Record<string,string> = {}) {
  return {
    Authorization: `Bearer ${token()}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

async function calendlyFetch(pathOrUrl: string, init: RequestInit = {}) {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `https://api.calendly.com${pathOrUrl}`
  const response = await fetch(url, { ...init, headers: { ...headers(), ...(init.headers || {}) }, cache: 'no-store' })
  const text = await response.text()
  let body: any = null
  try { body = text ? JSON.parse(text) : null } catch { body = text }
  if (!response.ok) throw new Error(`Calendly ${response.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`)
  return body
}

function uuidFromUri(uri?: string) {
  return String(uri || '').split('/').filter(Boolean).pop() || ''
}

function websiteDomain(website?: string) {
  try { return new URL(String(website || '')).hostname.toLowerCase().replace(/^www\./, '') } catch { return '' }
}

function emailDomain(email?: string) {
  return String(email || '').trim().toLowerCase().split('@')[1] || ''
}

function meetingJoinUrl(location: any): string {
  return String(
    location?.join_url ||
    location?.actual_instance?.join_url ||
    location?.location ||
    ''
  )
}

async function findCompanyForInvitee(email: string, companies: Json[]) {
  const domain = emailDomain(email)
  if (!domain || FREE_EMAIL_DOMAINS.has(domain)) return null
  return companies.find((company) => {
    const companyDomain = websiteDomain(company.website)
    return companyDomain && (domain === companyDomain || domain.endsWith(`.${companyDomain}`))
  }) || null
}

async function findOrCreatePerson(invitee: Json, company: Json | null) {
  const email = String(invitee.email || '').trim().toLowerCase()
  const name = String(invitee.name || `${invitee.first_name || ''} ${invitee.last_name || ''}`).trim() || email || 'Calendly invitee'

  let rows: Json[] = []
  if (email) rows = await queryGrowthTable<Json>('people', { tenant_id: `eq.${TENANT_ID}`, email: `eq.${email}`, limit: '1' }, { cacheSeconds: 0 })
  if (!rows.length && name) rows = await queryGrowthTable<Json>('people', { tenant_id: `eq.${TENANT_ID}`, name: `eq.${name}`, limit: '1' }, { cacheSeconds: 0 })

  if (rows[0]) {
    const row = rows[0]
    const updated = await updateGrowthRow<Json>('people', 'person_id', row.person_id, {
      email: email || row.email || '',
      company_id: row.company_id || company?.company_id || null,
      status: 'discovery_booked',
      source: row.source || 'calendly',
      completed_at: null,
    })
    return updated || { ...row, email, company_id: row.company_id || company?.company_id || null, status: 'discovery_booked' }
  }

  const personId = `person_${randomUUID().replaceAll('-', '').slice(0, 12)}`
  return await insertGrowthRow<Json>('people', {
    person_id: personId,
    tenant_id: TENANT_ID,
    company_id: company?.company_id || null,
    name,
    role: '',
    email,
    linkedin_url: '',
    public_source_url: '',
    relevance_score: 0,
    status: 'discovery_booked',
    evidence: 'Calendly booking received from the connected SC-Analytics scheduling account.',
    notes: '',
    recommended_message: '',
    outreach_angle: '',
    connection_note: '',
    follow_up_message: '',
    recommended_action: 'meeting_booked',
    sc_analytics_action: 'none',
    contact_reason: 'Booked a meeting with SC-Analytics through Calendly.',
    research_context: {},
    source: 'calendly',
    completed_at: null,
    created_at: new Date().toISOString(),
  }) || { person_id: personId, name, email, company_id: company?.company_id || null }
}

async function findOrCreateOpportunity(person: Json, company: Json | null, event: Json) {
  const rows = await queryGrowthTable<Json>('crm_opportunities', {
    tenant_id: `eq.${TENANT_ID}`,
    primary_person_id: `eq.${person.person_id}`,
    order: 'updated_at.desc',
    limit: '1',
  }, { cacheSeconds: 0 })
  const now = new Date().toISOString()
  const changes = {
    company_id: rows[0]?.company_id || company?.company_id || null,
    primary_person_id: person.person_id,
    stage: 'discovery_booked',
    probability: Math.max(Number(rows[0]?.probability || 0), 40),
    source: rows[0]?.source || 'calendly',
    next_action_at: event.start_time || null,
    metadata: {
      ...(rows[0]?.metadata || {}),
      calendly_event_uri: event.uri || '',
      calendly_event_type: event.event_type || '',
      meeting_name: event.name || '',
    },
    updated_at: now,
  }
  if (rows[0]) {
    return await updateGrowthRow<Json>('crm_opportunities', 'opportunity_id', rows[0].opportunity_id, changes) || { ...rows[0], ...changes }
  }
  const opportunityId = `opportunity_${randomUUID().replaceAll('-', '').slice(0, 12)}`
  return await insertGrowthRow<Json>('crm_opportunities', {
    opportunity_id: opportunityId,
    tenant_id: TENANT_ID,
    company_id: company?.company_id || null,
    primary_person_id: person.person_id,
    source_content_id: null,
    name: `${company?.name || person.name || 'Calendly lead'} · Discovery`,
    stage: 'discovery_booked',
    value: 0,
    currency: 'EUR',
    probability: 40,
    source: 'calendly',
    next_action_at: event.start_time || null,
    metadata: changes.metadata,
    created_at: now,
    updated_at: now,
  }) || { opportunity_id: opportunityId }
}

async function upsertMeeting(event: Json, invitee: Json | null, person: Json | null, company: Json | null, opportunity: Json | null) {
  const externalId = uuidFromUri(event.uri)
  const existing = await queryGrowthTable<Json>('crm_meetings', {
    tenant_id: `eq.${TENANT_ID}`,
    provider: 'eq.calendly',
    external_id: `eq.${externalId}`,
    limit: '1',
  }, { cacheSeconds: 0 })
  const status = String(event.status || 'active').toLowerCase()
  const metadata = {
    event_name: event.name || '',
    event_uri: event.uri || '',
    event_type: event.event_type || '',
    end_time: event.end_time || null,
    invitee_name: invitee?.name || '',
    invitee_email: invitee?.email || '',
    reschedule_url: invitee?.reschedule_url || '',
    cancel_url: invitee?.cancel_url || '',
    join_url: meetingJoinUrl(event.location),
    timezone: invitee?.timezone || '',
  }
  const changes = {
    company_id: company?.company_id || null,
    person_id: person?.person_id || null,
    opportunity_id: opportunity?.opportunity_id || null,
    starts_at: event.start_time || null,
    status,
    booking_url: invitee?.reschedule_url || meetingJoinUrl(event.location) || '',
    metadata,
  }
  if (existing[0]) return await updateGrowthRow<Json>('crm_meetings', 'meeting_id', existing[0].meeting_id, changes)

  return await insertGrowthRow<Json>('crm_meetings', {
    meeting_id: `meeting_${randomUUID().replaceAll('-', '').slice(0, 12)}`,
    tenant_id: TENANT_ID,
    provider: 'calendly',
    external_id: externalId,
    ...changes,
    created_at: new Date().toISOString(),
  })
}

async function recordConnection(user: Json, synced: number) {
  const existing = await queryGrowthTable<Json>('integration_connections', {
    tenant_id: `eq.${TENANT_ID}`,
    provider: 'eq.calendly',
    limit: '1',
  }, { cacheSeconds: 0 })
  const now = new Date().toISOString()
  const changes = {
    account_type: 'host',
    provider_subject: user.uri || '',
    display_name: user.name || user.email || 'Calendly',
    metadata: {
      email: user.email || '',
      scheduling_url: user.scheduling_url || '',
      timezone: user.timezone || '',
      organization: user.current_organization || '',
      last_synced_at: now,
      meetings_synced: synced,
    },
    updated_at: now,
  }
  if (existing[0]) return updateGrowthRow('integration_connections', 'connection_id', existing[0].connection_id, changes)
  return insertGrowthRow('integration_connections', {
    connection_id: randomUUID(),
    tenant_id: TENANT_ID,
    provider: 'calendly',
    ...changes,
    scopes: [],
    connected_at: now,
  })
}

export async function syncCalendlyCrm() {
  const current = await calendlyFetch('/users/me')
  const user = current?.resource || current
  if (!user?.uri) throw new Error('Calendly current user could not be resolved')

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const qs = new URLSearchParams({ user: user.uri, count: '100', sort: 'start_time:desc', min_start_time: ninetyDaysAgo })
  const eventResponse = await calendlyFetch(`/scheduled_events?${qs.toString()}`)
  const events: Json[] = Array.isArray(eventResponse?.collection) ? eventResponse.collection : []
  const companies = await queryGrowthTable<Json>('companies', { tenant_id: `eq.${TENANT_ID}`, limit: '500' }, { cacheSeconds: 0 })

  let synced = 0
  let peopleLinked = 0
  let opportunitiesLinked = 0
  for (const event of events) {
    const inviteeResponse = await calendlyFetch(`${event.uri}/invitees?count=100`)
    const invitees: Json[] = Array.isArray(inviteeResponse?.collection) ? inviteeResponse.collection : []
    const invitee = invitees.find((row) => String(row.status || '').toLowerCase() !== 'canceled') || invitees[0] || null
    const company = invitee ? await findCompanyForInvitee(String(invitee.email || ''), companies) : null
    let person: Json | null = null
    let opportunity: Json | null = null

    if (invitee && String(event.status || 'active').toLowerCase() !== 'canceled') {
      person = await findOrCreatePerson(invitee, company)
      if (person) peopleLinked += 1
      if (person) {
        opportunity = await findOrCreateOpportunity(person, company, event)
        if (opportunity) opportunitiesLinked += 1
      }
    } else if (invitee) {
      const byEmail = invitee.email ? await queryGrowthTable<Json>('people', { tenant_id: `eq.${TENANT_ID}`, email: `eq.${String(invitee.email).toLowerCase()}`, limit: '1' }, { cacheSeconds: 0 }) : []
      person = byEmail[0] || null
    }

    await upsertMeeting(event, invitee, person, company, opportunity)
    synced += 1
  }

  await recordConnection(user, synced)
  return {
    user: { name: user.name || '', email: user.email || '', scheduling_url: user.scheduling_url || '', timezone: user.timezone || '' },
    meetings_synced: synced,
    people_linked: peopleLinked,
    opportunities_linked: opportunitiesLinked,
  }
}

export async function ensureCalendlyWebhook(callbackUrl: string) {
  const current = await calendlyFetch('/users/me')
  const user = current?.resource || current
  const organization = String(user?.current_organization || '')
  const userUri = String(user?.uri || '')
  if (!organization || !userUri) throw new Error('Calendly organization/user could not be resolved')

  try {
    const qs = new URLSearchParams({ organization, user: userUri, scope: 'user', count: '100' })
    const existing = await calendlyFetch(`/webhook_subscriptions?${qs.toString()}`)
    const match = (existing?.collection || []).find((row: Json) => row.callback_url === callbackUrl || row.url === callbackUrl)
    if (match) return { status: 'existing', uri: match.uri || '' }
  } catch (error) {
    console.warn('Calendly webhook list failed; attempting create', error)
  }

  const signingKey = (process.env.CALENDLY_WEBHOOK_SIGNING_KEY || '').trim()
  const body: Json = {
    url: callbackUrl,
    events: ['invitee.created', 'invitee.canceled'],
    organization,
    user: userUri,
    scope: 'user',
  }
  if (signingKey) body.signing_key = signingKey

  try {
    const created = await calendlyFetch('/webhook_subscriptions', { method: 'POST', body: JSON.stringify(body) })
    return { status: 'created', uri: created?.resource?.uri || '' }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('409')) return { status: 'existing', uri: '' }
    throw error
  }
}
