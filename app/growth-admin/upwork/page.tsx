import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import CommercialViewRefresh from '@/components/growth-admin/CommercialViewRefresh'
import { PageHeader, formatDate } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated, queryGrowthTable, type GrowthOpportunity } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const labels: Record<string, string> = { Accepted: 'Enviada', Offered: 'Oferta recibida', Hired: 'Contratada', Declined: 'Rechazada', Withdrawn: 'Retirada', Archived: 'Oferta cerrada' }
const text = (value: unknown) => typeof value === 'string' ? value : ''

export default async function UpworkPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params = await searchParams
  const status = text(params.status)
  const q = text(params.q).trim().toLowerCase()
  const applications = await queryGrowthTable<GrowthOpportunity>('crm_opportunities', {
    tenant_id: 'eq.sc-analytics', source: 'eq.upwork', order: 'created_at.desc', limit: '1000',
  }, { cacheSeconds: 0 })
  const visible = applications.filter(item => (!status || item.metadata?.upwork_status === status) && (!q || item.name.toLowerCase().includes(q)))
  const syncedAt = applications.map(item => text(item.metadata?.synced_at)).sort().at(-1)

  return <AdminShell active="upwork">
    <PageHeader eyebrow="CMI · Comercial" title="Upwork" description="Candidaturas de Arnau, fechas, términos y estados comprobados. El envío y el seguimiento se trabajan desde el chat; aquí consultamos el historial."/>
    <CommercialViewRefresh/>
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      {[['Registradas', applications.length], ['Enviadas', applications.filter(item => item.metadata?.upwork_status === 'Accepted').length], ['Oferta o contratación', applications.filter(item => ['Offered', 'Hired'].includes(text(item.metadata?.upwork_status))).length]].map(([label, count]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold">{count}</p></div>)}
    </div>
    <p className="mb-5 text-xs leading-5 text-slate-500">Última comprobación de Upwork: {syncedAt ? formatDate(syncedAt, true) : 'pendiente'}. «Enviada» significa que Upwork recibió la propuesta; no que el cliente haya aceptado contratarte. El historial de ofertas cerradas puede ser parcial.</p>
    <form method="get" className="mb-5 flex flex-wrap gap-3">
      <label className="text-sm">Estado <select name="status" defaultValue={status} className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-2"><option value="">Todos</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="text-sm">Título <input name="q" defaultValue={text(params.q)} className="ml-2 rounded-lg border border-slate-200 px-3 py-2"/></label>
      <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Filtrar</button>
    </form>
    <div className="space-y-2">
      {!visible.length && <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No hay candidaturas con estos filtros.</p>}
      {visible.map((item, index) => {
        const meta = item.metadata || {}
        const remoteStatus = text(meta.upwork_status)
        const amount = Number(meta.proposal_amount)
        const url = text(meta.job_url)
        const validUrl = /^https:\/\/(?:www\.)?upwork\.com\//.test(url)
        return <details key={item.opportunity_id} className={`group overflow-hidden rounded-xl border border-slate-200 ${index % 2 ? 'bg-slate-50' : 'bg-white'}`}>
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-4 focus-visible:outline-2 focus-visible:outline-indigo-600">
            <div className="min-w-0"><h2 className="text-sm font-semibold">{item.name}</h2><p className="mt-1 text-xs text-slate-500">{formatDate(text(meta.applied_at) || item.created_at, true)} · {meta.upwork_account === 'agency' ? 'SC-Analytics' : 'Arnau Sastre'}</p></div>
            <div className="flex items-center gap-3"><span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold">{labels[remoteStatus] || item.stage}</span><span aria-hidden="true" className="text-lg text-indigo-600 group-open:rotate-45">+</span></div>
          </summary>
          <div className="grid gap-5 border-t border-slate-200 px-5 py-5 md:grid-cols-2">
            <dl className="space-y-2 text-sm"><div><dt className="inline text-slate-500">Tarifa / importe propuesto: </dt><dd className="inline font-medium">{Number.isFinite(amount) ? `${amount} ${item.currency}` : 'No registrado'}</dd></div><div><dt className="inline text-slate-500">Visualización por el cliente: </dt><dd className="inline">{typeof meta.viewed_by_client === 'boolean' ? meta.viewed_by_client ? 'Visualizada' : 'Sin visualización registrada' : 'Sin datos'}</dd></div><div><dt className="inline text-slate-500">ID de propuesta: </dt><dd className="inline font-mono text-xs">{text(meta.upwork_proposal_id) || 'No registrado'}</dd></div><div><dt className="inline text-slate-500">Boost: </dt><dd className="inline">{meta.boosted === true ? 'Sí' : meta.boosted === false ? 'No' : 'Sin datos'}</dd></div></dl>
            <div className="text-sm leading-6 text-slate-600">{text(meta.decline_reason) && <p>Motivo registrado: {text(meta.decline_reason)}</p>}<p>Estado comercial: {item.stage === 'applied' ? 'Candidatura enviada; sin oferta registrada' : item.stage}. Las respuestas se confirman en Upwork; no se deducen de Gmail.</p>{validUrl && <a href={url} target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-lg border border-indigo-200 bg-white px-3 py-2 font-semibold text-indigo-700">Ver oferta en Upwork ↗</a>}</div>
          </div>
        </details>
      })}
    </div>
  </AdminShell>
}
