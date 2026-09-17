import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { insertGrowthRow, queryGrowthTable, updateGrowthRow, upsertGrowthRow } from '@/lib/supabase-growth'

type Row = Record<string, any>
const text = (form: FormData, name: string) => String(form.get(name) || '').trim()
const number = (form: FormData, name: string, fallback = 0) => { const n = Number(String(form.get(name) || fallback).replace(',', '.')); return Number.isFinite(n) ? n : fallback }
const jsonSection = (form: FormData, names: string[]) => Object.fromEntries(names.map((name) => [name, text(form, name)]).filter(([, value]) => value !== ''))

async function createOpportunity(request: Request, company: Row, companyId: string, primaryPersonId: string | null, currency: string, now: string, source = 'deal_desk') {
  const opportunityId = `opp_${randomUUID().replaceAll('-', '').slice(0, 16)}`
  const recommendedOffer = String(company.recommended_offer || company.recommended_service || '').trim()
  const metadata = {
    recommended_offer: company.recommended_offer || null,
    recommended_service: company.recommended_service || null,
    requested_service: company.recommended_service || '',
    offered_services: recommendedOffer || '',
    origin: source,
    company_size: '',
    company_type: '',
    sector: company.industry || '',
    created_from: 'deal_desk',
    timeline: [{ at: now, event: 'Expediente creado', detail: `Origen: ${source}` }],
  }
  const opportunity = await insertGrowthRow<Row>('crm_opportunities', {
    opportunity_id: opportunityId, tenant_id: 'sc-analytics', company_id: companyId, primary_person_id: primaryPersonId,
    name: `${company.name} · ${recommendedOffer || 'Proyecto potencial'}`, stage: 'qualification', value: 0, currency: currency || 'EUR', probability: 15,
    source, next_action_at: null, metadata, created_at: now, updated_at: now,
  })
  if (!opportunity) throw new Error('Could not create opportunity')
  await insertGrowthRow('crm_deal_workspaces', { opportunity_id: opportunityId, tenant_id: 'sc-analytics', status: 'qualification', qualification: { recommended_offer: company.recommended_offer || '', recommended_service: company.recommended_service || '' }, discovery: {}, proposal: {}, budget: {}, created_at: now, updated_at: now })
  return NextResponse.redirect(new URL(`/growth-admin/deal-desk?opportunity=${encodeURIComponent(opportunityId)}&created=1`, request.url), 303)
}

function timeline(metadata: Row, event: string, detail: string, now: string) {
  const rows = Array.isArray(metadata.timeline) ? metadata.timeline.slice(-30) : []
  return [...rows, { at: now, event, detail }]
}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData()
  const action = text(form, 'action') || 'save'
  const returnTo = text(form, 'return_to') || '/growth-admin/deal-desk'
  const now = new Date().toISOString()

  if (action === 'create') {
    const companyId = text(form, 'company_id')
    if (!companyId) return new NextResponse('Missing company_id', { status: 400 })
    const company = (await queryGrowthTable<Row>('companies', { tenant_id: 'eq.sc-analytics', company_id: `eq.${companyId}`, limit: '1' }, { cacheSeconds: 0 }))[0]
    if (!company) return new NextResponse('Company not found', { status: 404 })
    return createOpportunity(request, company, companyId, text(form, 'primary_person_id') || null, text(form, 'currency') || 'EUR', now, text(form, 'origin') || 'crm')
  }

  if (action === 'create_manual') {
    const companyName = text(form, 'company_name')
    if (!companyName) return new NextResponse('Missing company_name', { status: 400 })
    const companyId = `company_${randomUUID().replaceAll('-', '').slice(0, 16)}`
    const company = await insertGrowthRow<Row>('companies', { company_id: companyId, tenant_id: 'sc-analytics', name: companyName, website: text(form, 'website'), country: text(form, 'country'), industry: text(form, 'industry'), fit_type: 'lead', score: 0, status: 'candidate', notes: text(form, 'company_notes'), created_at: now })
    if (!company) return new NextResponse('Could not create company', { status: 500 })
    let personId: string | null = null
    const contactName = text(form, 'contact_name')
    if (contactName) {
      personId = `person_${randomUUID().replaceAll('-', '').slice(0, 16)}`
      await insertGrowthRow('people', { person_id: personId, tenant_id: 'sc-analytics', company_id: companyId, name: contactName, role: text(form, 'contact_role') || 'Primary contact', email: text(form, 'contact_email'), status: 'candidate', source: 'manual', created_at: now })
    }
    return createOpportunity(request, company, companyId, personId, text(form, 'currency') || 'EUR', now, text(form, 'origin') || 'manual')
  }

  const opportunityId = text(form, 'opportunity_id')
  if (!opportunityId) return new NextResponse('Missing opportunity_id', { status: 400 })
  const opportunity = (await queryGrowthTable<Row>('crm_opportunities', { tenant_id: 'eq.sc-analytics', opportunity_id: `eq.${opportunityId}`, limit: '1' }, { cacheSeconds: 0 }))[0]
  if (!opportunity) return new NextResponse('Opportunity not found', { status: 404 })
  const current = (await queryGrowthTable<Row>('crm_deal_workspaces', { tenant_id: 'eq.sc-analytics', opportunity_id: `eq.${opportunityId}`, limit: '1' }, { cacheSeconds: 0 }))[0] || {}
  const metadata = { ...(opportunity.metadata || {}) }

  if (action === 'profile') {
    const companyId = String(opportunity.company_id || '')
    const personId = String(opportunity.primary_person_id || '')
    const companyChanges: Row = {}
    if (text(form, 'company_name')) companyChanges.name = text(form, 'company_name')
    if (form.has('website')) companyChanges.website = text(form, 'website')
    if (form.has('industry')) companyChanges.industry = text(form, 'industry')
    if (form.has('country')) companyChanges.country = text(form, 'country')
    if (companyId && Object.keys(companyChanges).length) await updateGrowthRow('companies', 'company_id', companyId, companyChanges)
    if (personId) {
      const personChanges: Row = {}
      if (form.has('contact_name')) personChanges.name = text(form, 'contact_name')
      if (form.has('contact_role')) personChanges.role = text(form, 'contact_role')
      if (form.has('contact_email')) personChanges.email = text(form, 'contact_email')
      if (form.has('contact_phone')) personChanges.phone = text(form, 'contact_phone')
      if (Object.keys(personChanges).length) await updateGrowthRow('people', 'person_id', personId, personChanges)
    }
    const profile = jsonSection(form, ['origin', 'company_type', 'company_size', 'sector', 'requested_service', 'offered_services', 'deal_notes'])
    const nextMetadata = { ...metadata, ...profile, timeline: timeline(metadata, 'Ficha actualizada', `${profile.requested_service || 'Deal'} · ${profile.origin || opportunity.source || 'sin origen'}`, now) }
    await updateGrowthRow('crm_opportunities', 'opportunity_id', opportunityId, { currency: text(form, 'currency') || opportunity.currency || 'EUR', source: text(form, 'origin') || opportunity.source || 'deal_desk', metadata: nextMetadata, updated_at: now })
    const url = new URL(returnTo, request.url); url.searchParams.set('opportunity', opportunityId); url.searchParams.set('saved', 'profile'); return NextResponse.redirect(url, 303)
  }

  let section = 'qualification'
  let payload: Record<string, unknown> = {}
  let opportunityChanges: Record<string, unknown> = { updated_at: now }

  if (action === 'qualification') {
    const scores = ['problem_score', 'impact_score', 'urgency_score', 'authority_score', 'budget_score', 'data_score'].map((name) => Math.max(0, Math.min(5, number(form, name, 0))))
    const qualificationScore = Math.round((scores.reduce((a, b) => a + b, 0) / (scores.length * 5)) * 100)
    payload = { ...jsonSection(form, ['problem', 'impact', 'decision_maker', 'budget_range', 'data_readiness', 'qualification_notes']), problem_score: scores[0], impact_score: scores[1], urgency_score: scores[2], authority_score: scores[3], budget_score: scores[4], data_score: scores[5], qualification_score: qualificationScore, updated_at: now }
    opportunityChanges = { ...opportunityChanges, stage: 'qualification', probability: qualificationScore >= 70 ? 30 : qualificationScore >= 45 ? 20 : 10, metadata: { ...metadata, timeline: timeline(metadata, 'Qualification actualizada', `Score ${qualificationScore}%`, now) } }
  } else if (action === 'discovery') {
    section = 'discovery'
    payload = { ...jsonSection(form, ['current_process', 'desired_state', 'business_value', 'systems_data', 'constraints', 'budget_timing', 'decision_process', 'discovery_notes', 'next_action']), updated_at: now }
    const nextActionAt = text(form, 'next_action_at')
    if (nextActionAt) payload.next_action_at = nextActionAt
    opportunityChanges = { ...opportunityChanges, stage: 'discovery', probability: 40, next_action_at: nextActionAt || null, metadata: { ...metadata, timeline: timeline(metadata, 'Discovery guardada', String(payload.next_action || 'Sin siguiente acción'), now) } }
  } else if (action === 'proposal') {
    section = 'proposal'
    payload = { ...(current.proposal || {}), ...jsonSection(form, ['objective', 'executive_summary', 'scope', 'deliverables', 'approach', 'exclusions', 'timeline', 'acceptance_criteria', 'assumptions', 'open_items', 'proposal_notes']), manual_edited_at: now, updated_at: now }
    opportunityChanges = { ...opportunityChanges, stage: 'proposal', probability: 60, metadata: { ...metadata, timeline: timeline(metadata, 'Propuesta actualizada', String(payload.objective || ''), now) } }
  } else if (action === 'budget') {
    section = 'budget'
    const estimatedHours = Math.max(0, number(form, 'estimated_hours'))
    const internalRate = Math.max(0, number(form, 'internal_rate'))
    const externalCosts = Math.max(0, number(form, 'external_costs'))
    const contingencyPct = Math.max(0, number(form, 'contingency_pct', 10))
    const targetMarginPct = Math.max(0, Math.min(95, number(form, 'target_margin_pct', 35)))
    const baseCost = estimatedHours * internalRate + externalCosts
    const contingency = baseCost * contingencyPct / 100
    const costWithContingency = baseCost + contingency
    const suggestedPrice = targetMarginPct >= 95 ? costWithContingency : costWithContingency / (1 - targetMarginPct / 100)
    const finalPrice = Math.max(0, number(form, 'final_price', Math.round(suggestedPrice * 100) / 100))
    const currency = text(form, 'currency') || opportunity.currency || 'EUR'
    payload = { ...(current.budget || {}), estimated_hours: estimatedHours, internal_rate: internalRate, external_costs: externalCosts, contingency_pct: contingencyPct, target_margin_pct: targetMarginPct, base_cost: Math.round(baseCost * 100) / 100, contingency: Math.round(contingency * 100) / 100, suggested_price: Math.round(suggestedPrice * 100) / 100, final_price: finalPrice, currency, pricing_notes: text(form, 'pricing_notes'), updated_at: now }
    opportunityChanges = { ...opportunityChanges, value: finalPrice, currency, metadata: { ...metadata, timeline: timeline(metadata, 'Presupuesto actualizado', `${finalPrice} ${currency}`, now) } }
  } else if (action === 'stage') {
    const stage = text(form, 'stage')
    const probabilities: Record<string, number> = { contacted: 10, qualification: 20, discovery: 40, discovery_booked: 45, proposal: 60, negotiation: 80, won: 100, lost: 0 }
    const nextMetadata = { ...metadata, timeline: timeline(metadata, `Etapa → ${stage}`, text(form, 'stage_note') || '', now) }
    await updateGrowthRow('crm_opportunities', 'opportunity_id', opportunityId, { stage, probability: probabilities[stage] ?? number(form, 'probability', 0), metadata: nextMetadata, updated_at: now })
    const url = new URL(returnTo, request.url); url.searchParams.set('opportunity', opportunityId); url.searchParams.set('saved', 'stage'); return NextResponse.redirect(url, 303)
  } else {
    return new NextResponse('Unsupported deal desk action', { status: 400 })
  }

  await upsertGrowthRow('crm_deal_workspaces', { opportunity_id: opportunityId, tenant_id: 'sc-analytics', qualification: section === 'qualification' ? payload : (current.qualification || {}), discovery: section === 'discovery' ? payload : (current.discovery || {}), proposal: section === 'proposal' ? payload : (current.proposal || {}), budget: section === 'budget' ? payload : (current.budget || {}), status: section, created_at: current.created_at || now, updated_at: now }, 'opportunity_id')
  await updateGrowthRow('crm_opportunities', 'opportunity_id', opportunityId, opportunityChanges)
  const url = new URL(returnTo, request.url); url.searchParams.set('opportunity', opportunityId); url.searchParams.set('saved', section); return NextResponse.redirect(url, 303)
}
