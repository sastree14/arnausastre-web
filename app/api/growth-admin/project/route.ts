import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { insertGrowthRow, isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { queryGrowthTable, updateGrowthRow } from '@/lib/supabase-growth'

type OpportunityRow = {
  opportunity_id: string
  company_id?: string | null
  name?: string | null
  stage?: string | null
  value?: number | string | null
  currency?: string | null
  metadata?: Record<string, unknown> | null
}
type ProjectRow = { project_id: string }

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData()
  const opportunityId = String(form.get('opportunity_id') || '').trim()
  let opportunity: OpportunityRow | undefined
  if (opportunityId) {
    opportunity = (await queryGrowthTable<OpportunityRow>('crm_opportunities', { tenant_id: 'eq.sc-analytics', opportunity_id: `eq.${opportunityId}`, limit: '1' }, { cacheSeconds: 0 }))[0]
    if (!opportunity) return new NextResponse('Opportunity not found', { status: 404 })
    if (String(opportunity.stage || '').toLowerCase() !== 'won') return new NextResponse('Only won opportunities can be converted into delivery projects', { status: 409 })
    const existing = await queryGrowthTable<ProjectRow>('operations_projects', { tenant_id: 'eq.sc-analytics', opportunity_id: `eq.${opportunityId}`, limit: '1' }, { cacheSeconds: 0 })
    if (existing[0]) return NextResponse.redirect(new URL(`/growth-admin/operations?project=${encodeURIComponent(String(existing[0].project_id))}#delivery`, request.url), 303)
  }

  const name = String(form.get('name') || opportunity?.name || '').trim()
  if (!name) return new NextResponse('Missing project name', { status: 400 })
  const now = new Date().toISOString()
  const projectId = `project_${randomUUID().replaceAll('-', '').slice(0, 12)}`
  const metadata = opportunity ? { created_from: 'won_opportunity', opportunity_stage: opportunity.stage, opportunity_metadata: opportunity.metadata || {} } : {}
  await insertGrowthRow('operations_projects', {
    project_id: projectId,
    tenant_id: 'sc-analytics',
    company_id: String(form.get('company_id') || opportunity?.company_id || '') || null,
    opportunity_id: opportunityId || null,
    name,
    status: String(form.get('status') || 'planned'),
    owner: String(form.get('owner') || ''),
    start_date: String(form.get('start_date') || '') || null,
    end_date: String(form.get('end_date') || '') || null,
    budget: Number(String(form.get('budget') || opportunity?.value || '0').replace(',', '.')) || 0,
    currency: String(form.get('currency') || opportunity?.currency || 'EUR'),
    metadata,
    created_at: now,
    updated_at: now,
  })
  if (opportunity) {
    const previousMeta = opportunity.metadata || {}
    const previousTimeline = Array.isArray(previousMeta.timeline) ? previousMeta.timeline : []
    await updateGrowthRow('crm_opportunities', 'opportunity_id', opportunityId, {
      stage: 'won', probability: 100, updated_at: now,
      metadata: { ...previousMeta, delivery_project_id: projectId, converted_to_project_at: now, timeline: [...previousTimeline, { at: now, event: 'Proyecto creado', detail: projectId }] },
    })
  }
  return NextResponse.redirect(new URL(`/growth-admin/operations?project=${encodeURIComponent(projectId)}#delivery`, request.url), 303)
}