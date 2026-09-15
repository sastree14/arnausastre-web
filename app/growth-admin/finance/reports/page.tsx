import Link from 'next/link'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import FinanceNav from '@/components/growth-admin/FinanceNav'
import { PageHeader, SectionHeading, StatCard, adminButtonPrimary, adminButtonSecondary, adminInput, adminPanel } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { financePeriodComparison, reportComparisonRows, resolveFinancePeriod, type PeriodKind } from '@/lib/finance-reporting'

export const dynamic='force-dynamic'
const n=(value:unknown)=>Number(value||0)
const euro=(value:unknown)=>`${n(value).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})} €`
const delta=(value:unknown)=>value===null?'n/a':`${n(value)>=0?'+':''}${n(value).toLocaleString('es-ES',{maximumFractionDigits:1})}%`

export default async function ReportsPage({searchParams}:{searchParams:Promise<{kind?:string;anchor?:string;closure?:string}>}){
  if(!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params=await searchParams
  const rawKind=params.kind||'quarter'
  const kind=(['month','quarter','semester','year'].includes(rawKind)?rawKind:'quarter') as PeriodKind
  const anchor=params.anchor||new Date().toISOString().slice(0,10)
  const period=resolveFinancePeriod(kind,anchor)
  const {current,previous}=await financePeriodComparison(period)
  const rows=reportComparisonRows(current,previous)
  const result=n(current.invoiced)-n(current.expenses)
  const previousResult=n(previous.invoiced)-n(previous.expenses)
  const previousAnchor=period.previousStart
  return <AdminShell active="finance">
    <PageHeader eyebrow="Finanzas · Management reporting" title="Informes y cierres" description="Comparativa mensual, trimestral, semestral y anual para controlar crecimiento, gastos, caja, margen e impuestos estimados." actions={<form action="/api/growth-admin/finance/closure" method="post"><input type="hidden" name="kind" value={kind}/><input type="hidden" name="anchor" value={anchor}/><button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15">Generar cierre Sheet + PDF</button></form>}/>
    <FinanceNav active="/growth-admin/finance/reports"/>

    <section className={`${adminPanel} p-5`}><form method="get" className="flex flex-col gap-3 md:flex-row md:items-end"><label className="flex-1 text-xs font-semibold text-slate-600">Periodicidad<select name="kind" defaultValue={kind} className={`mt-2 w-full ${adminInput}`}><option value="month">Mensual</option><option value="quarter">Trimestral</option><option value="semester">Semestral</option><option value="year">Anual</option></select></label><label className="flex-1 text-xs font-semibold text-slate-600">Fecha dentro del periodo<input type="date" name="anchor" defaultValue={anchor.slice(0,10)} className={`mt-2 w-full ${adminInput}`}/></label><button className={adminButtonPrimary}>Actualizar informe</button></form></section>

    <section className="mt-10"><SectionHeading eyebrow="Periodo actual" title={period.label} description={`${period.start} → ${period.end} · comparación con ${period.previousStart} → ${period.previousEnd}`}/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Facturado" value={euro(current.invoiced)} tone="blue"/><StatCard label="Gastos" value={euro(current.expenses)} tone="violet"/><StatCard label="Resultado" value={euro(result)} tone={result>=0?'green':'amber'} note={`Anterior ${euro(previousResult)}`}/><StatCard label="Caja neta" value={euro(n(current.cash_in)-n(current.cash_out))} tone="green" note={`${euro(current.cash_in)} entra · ${euro(current.cash_out)} sale`}/></div></section>

    <section className="mt-12"><SectionHeading eyebrow="Comparativa" title="Periodo vs periodo anterior"/><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="min-w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3">Métrica</th><th className="px-4 py-3">Actual</th><th className="px-4 py-3">Anterior</th><th className="px-4 py-3">Variación</th></tr></thead><tbody>{rows.map(([label,now,before,change])=><tr key={String(label)} className="border-t border-slate-200"><td className="px-4 py-3 font-medium text-slate-900">{String(label)}</td><td className="px-4 py-3">{euro(now)}</td><td className="px-4 py-3 text-slate-500">{euro(before)}</td><td className={`px-4 py-3 font-semibold ${change!==null&&n(change)>=0?'text-emerald-700':'text-rose-600'}`}>{delta(change)}</td></tr>)}</tbody></table></div></section>

    <section className="mt-12"><SectionHeading eyebrow="Navegación histórica" title="Moverse entre periodos"/><div className="flex flex-wrap gap-2"><Link href={`/growth-admin/finance/reports?kind=${kind}&anchor=${encodeURIComponent(previousAnchor)}`} className={adminButtonSecondary}>← Periodo anterior</Link><Link href={`/growth-admin/finance/reports?kind=${kind}&anchor=${encodeURIComponent(new Date().toISOString().slice(0,10))}`} className={adminButtonSecondary}>Periodo actual</Link><form action="/api/growth-admin/finance/sync-registers" method="post"><input type="hidden" name="year" value={period.start.slice(0,4)}/><button className={adminButtonSecondary}>Sincronizar libros {period.start.slice(0,4)}</button></form></div></section>

    <section className="mt-12 pb-12"><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs leading-6 text-amber-900"><strong>Interpretación:</strong> esta vista es control financiero interno. La posición de IVA, IRPF, devengo y deducibilidad debe revisarse antes de usarla en declaraciones oficiales. El sistema conserva esa revisión como parte del doble check.</div></section>
  </AdminShell>
}
