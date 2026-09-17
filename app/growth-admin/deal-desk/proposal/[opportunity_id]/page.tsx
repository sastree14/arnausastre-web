import { redirect } from 'next/navigation'
import PrintButton from '@/components/growth-admin/PrintButton'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getDealDeskBundle } from '@/lib/growth-admin-performance'

export const dynamic = 'force-dynamic'
type Row = Record<string, unknown>
const text = (value: unknown) => Array.isArray(value) ? value.join('\n') : String(value ?? '').trim()
const blocks: Array<[string, string]> = [
  ['executive_summary', 'Resumen ejecutivo'],
  ['objective', 'Objetivo'],
  ['scope', 'Alcance'],
  ['deliverables', 'Entregables'],
  ['approach', 'Enfoque'],
  ['timeline', 'Fases y timing'],
  ['acceptance_criteria', 'Criterios de aceptación'],
  ['exclusions', 'Fuera de alcance'],
  ['assumptions', 'Supuestos'],
  ['open_items', 'Puntos abiertos'],
]

export default async function ProposalDocumentPage({ params }: { params: Promise<{ opportunity_id: string }> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const { opportunity_id: opportunityId } = await params
  const bundle = await getDealDeskBundle()
  const opportunity = bundle.opportunities.find((row) => row.opportunity_id === opportunityId)
  if (!opportunity) redirect('/growth-admin/deal-desk')
  const workspace = bundle.workspaces.find((row) => String(row.opportunity_id) === opportunityId) as Row | undefined
  const proposal = (workspace?.proposal || {}) as Row
  const budget = (workspace?.budget || {}) as Row
  const company = bundle.companies.find((row) => String(row.company_id) === String(opportunity.company_id))
  const person = bundle.people.find((row) => String(row.person_id) === String(opportunity.primary_person_id))
  const currency = text(budget.currency || opportunity.currency || 'EUR')
  const finalPrice = Number(budget.final_price || opportunity.value || 0)
  const driveUrl = text(proposal.drive_url)

  return <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 print:bg-white print:p-0">
    <div className="mx-auto mb-4 flex max-w-4xl flex-wrap justify-between gap-2 print:hidden"><a href={`/growth-admin/deal-desk?opportunity=${encodeURIComponent(opportunityId)}&step=proposal#proposal`} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">← Volver al Deal Desk</a><div className="flex flex-wrap gap-2"><a href={`/growth-admin/deal-desk/budget/${encodeURIComponent(opportunityId)}`} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">Ver Budget</a>{driveUrl ? <a href={driveUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">Abrir Google Doc ↗</a> : <form action="/api/growth-admin/deal-desk/proposal/drive" method="post"><input type="hidden" name="opportunity_id" value={opportunityId}/><button className="rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-800">Guardar en Drive</button></form>}<PrintButton/></div></div>
    <article className="mx-auto max-w-4xl bg-white p-10 shadow-sm print:max-w-none print:p-10 print:shadow-none">
      <header className="border-b border-slate-200 pb-8"><div className="flex items-start justify-between gap-8"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">SC-Analytics · Proposal</p><h1 className="mt-3 text-4xl font-semibold leading-tight">{text(proposal.objective || opportunity.name || 'Propuesta de colaboración')}</h1></div><div className="text-right text-xs text-slate-500"><p className="font-semibold text-slate-900">SC-Analytics</p><p>Mejores decisiones. Mejores resultados empresariales.</p></div></div><div className="mt-8 grid gap-4 text-sm sm:grid-cols-3"><div><p className="text-xs uppercase text-slate-400">Cliente</p><p className="mt-1 font-semibold">{company?.name || opportunity.company_name || '—'}</p></div><div><p className="text-xs uppercase text-slate-400">Contacto</p><p className="mt-1 font-semibold">{person?.name || opportunity.person_name || '—'}</p></div><div><p className="text-xs uppercase text-slate-400">Inversión</p><p className="mt-1 font-semibold">{finalPrice ? new Intl.NumberFormat('es-ES',{style:'currency',currency:currency||'EUR',maximumFractionDigits:0}).format(finalPrice) : 'Por definir'}</p></div></div></header>
      <div className="mt-8 space-y-8">{blocks.map(([key,label]) => { const value=text(proposal[key]); return value ? <section key={key}><h2 className="text-lg font-semibold">{label}</h2><div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{value}</div></section> : null })}</div>
      <footer className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-500"><p>Documento generado desde el expediente operativo del Deal Desk. Puedes editar el contenido en el CRM antes de volver a generar/guardar esta versión.</p></footer>
    </article>
  </main>
}
