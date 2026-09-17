import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getDealDeskBundle } from '@/lib/growth-admin-performance'
import { createBudgetSheet } from '@/lib/google-drive-operations'
import { updateGrowthRow } from '@/lib/supabase-growth'

type Row = Record<string, unknown>
const csv = (value: unknown) => `"${String(value ?? '').replaceAll('"','""')}"`

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData()
  const opportunityId = String(form.get('opportunity_id') || '').trim()
  if (!opportunityId) return new NextResponse('Missing opportunity_id', { status: 400 })
  try {
    const bundle = await getDealDeskBundle()
    const opportunity = bundle.opportunities.find((row) => row.opportunity_id === opportunityId)
    const workspace = bundle.workspaces.find((row) => String(row.opportunity_id) === opportunityId) as Row | undefined
    if (!opportunity || !workspace) throw new Error('Deal workspace not found')
    const budget = (workspace.budget || {}) as Row
    const company = bundle.companies.find((row) => String(row.company_id) === String(opportunity.company_id))
    const name = `Budget · ${company?.name || opportunity.company_name || opportunity.name || opportunityId}`
    const rows: Array<[string, unknown]> = [
      ['Cliente', company?.name || opportunity.company_name || ''],
      ['Horas estimadas', budget.estimated_hours],
      ['Coste interno / h', budget.internal_rate],
      ['Costes externos', budget.external_costs],
      ['Contingencia %', budget.contingency_pct],
      ['Margen objetivo %', budget.target_margin_pct],
      ['Coste base', budget.base_cost],
      ['Contingencia', budget.contingency],
      ['Precio sugerido', budget.suggested_price],
      ['Precio final', budget.final_price || opportunity.value],
      ['Moneda', budget.currency || opportunity.currency || 'EUR'],
      ['Notas', budget.pricing_notes],
    ]
    const body = ['Concepto,Valor', ...rows.map(([label,value]) => `${csv(label)},${csv(value)}`)].join('\n')
    const file = await createBudgetSheet(name, body)
    const updatedBudget = { ...budget, drive_file_id: file.id, drive_url: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`, drive_saved_at: new Date().toISOString() }
    await updateGrowthRow('crm_deal_workspaces', 'opportunity_id', opportunityId, { budget: updatedBudget, updated_at: new Date().toISOString() })
    const url = new URL('/growth-admin/deal-desk', request.url); url.searchParams.set('opportunity', opportunityId); url.searchParams.set('step','budget'); url.searchParams.set('saved','budget_drive'); url.hash='budget'; return NextResponse.redirect(url,303)
  } catch (error) {
    const url = new URL('/growth-admin/deal-desk', request.url); url.searchParams.set('opportunity', opportunityId); url.searchParams.set('step','budget'); url.searchParams.set('drive_error', error instanceof Error ? error.message : 'Drive export failed'); url.hash='budget'; return NextResponse.redirect(url,303)
  }
}
