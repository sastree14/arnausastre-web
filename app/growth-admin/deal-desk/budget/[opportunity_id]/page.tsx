import { redirect } from 'next/navigation'
import PrintButton from '@/components/growth-admin/PrintButton'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getDealDeskBundle } from '@/lib/growth-admin-performance'

export const dynamic = 'force-dynamic'
type Row = Record<string, unknown>
const text = (value: unknown) => String(value ?? '').trim()
const money = (value: unknown, currency: string) => new Intl.NumberFormat('es-ES',{style:'currency',currency:currency||'EUR',maximumFractionDigits:2}).format(Number(value||0))

export default async function BudgetDocumentPage({ params }: { params: Promise<{ opportunity_id: string }> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const { opportunity_id: opportunityId } = await params
  const bundle = await getDealDeskBundle()
  const opportunity = bundle.opportunities.find((row) => row.opportunity_id === opportunityId)
  if (!opportunity) redirect('/growth-admin/deal-desk')
  const workspace = bundle.workspaces.find((row) => String(row.opportunity_id) === opportunityId) as Row | undefined
  const budget = (workspace?.budget || {}) as Row
  const company = bundle.companies.find((row) => String(row.company_id) === String(opportunity.company_id))
  const currency = text(budget.currency || opportunity.currency || 'EUR') || 'EUR'
  const driveUrl = text(budget.drive_url)
  const rows: Array<[string, unknown, boolean]> = [
    ['Horas estimadas', budget.estimated_hours, false],
    ['Coste interno / h', budget.internal_rate, true],
    ['Costes externos', budget.external_costs, true],
    ['Coste base', budget.base_cost, true],
    ['Contingencia %', budget.contingency_pct, false],
    ['Contingencia', budget.contingency, true],
    ['Margen objetivo %', budget.target_margin_pct, false],
    ['Precio sugerido', budget.suggested_price, true],
    ['Precio final', budget.final_price || opportunity.value, true],
  ]
  return <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 print:bg-white print:p-0"><div className="mx-auto mb-4 flex max-w-4xl flex-wrap justify-between gap-2 print:hidden"><a href={`/growth-admin/deal-desk?opportunity=${encodeURIComponent(opportunityId)}&step=budget#budget`} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">← Volver al Deal Desk</a><div className="flex flex-wrap gap-2"><a href={`/growth-admin/deal-desk/proposal/${encodeURIComponent(opportunityId)}`} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">Ver Proposal</a>{driveUrl?<a href={driveUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">Abrir Google Sheet ↗</a>:<form action="/api/growth-admin/deal-desk/budget/drive" method="post"><input type="hidden" name="opportunity_id" value={opportunityId}/><button className="rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-800">Guardar en Drive</button></form>}<PrintButton label="Imprimir / guardar PDF"/></div></div><article className="mx-auto max-w-4xl bg-white p-10 shadow-sm print:max-w-none print:shadow-none"><header className="border-b border-slate-200 pb-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">SC-Analytics · Budget</p><h1 className="mt-3 text-4xl font-semibold">{company?.name || opportunity.company_name || opportunity.name}</h1><p className="mt-2 text-sm text-slate-500">Presupuesto asociado al expediente {opportunityId}</p></header><div className="mt-8 overflow-hidden rounded-xl border border-slate-200"><table className="w-full text-sm"><tbody>{rows.map(([label,value,isMoney])=><tr key={label} className="border-b border-slate-100 last:border-0"><td className="px-5 py-4 text-slate-500">{label}</td><td className="px-5 py-4 text-right font-semibold">{isMoney?money(value,currency):(value===undefined||value===null||value===''?'—':String(value))}</td></tr>)}</tbody></table></div>{budget.pricing_notes&&<section className="mt-8"><h2 className="text-lg font-semibold">Notas de pricing</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{text(budget.pricing_notes)}</p></section>}<footer className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-500">Documento interno/comercial generado desde Deal Desk.</footer></article></main>
}
