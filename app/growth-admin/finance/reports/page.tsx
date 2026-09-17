import Link from 'next/link'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import FinanceNav from '@/components/growth-admin/FinanceNav'
import { PageHeader, SectionHeading, StatCard, adminButtonPrimary, adminButtonSecondary, adminInput, adminPanel } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { financePeriodComparison, reportComparisonRows, resolveFinancePeriod, type PeriodKind } from '@/lib/finance-reporting'
import { getFinanceBundle } from '@/lib/growth-admin-performance'

export const dynamic='force-dynamic'
const n=(value:unknown)=>Number(value||0)
const euro=(value:unknown)=>`${n(value).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})} €`
const delta=(value:unknown)=>value===null?'n/a':`${n(value)>=0?'+':''}${n(value).toLocaleString('es-ES',{maximumFractionDigits:1})}%`
const width=(value:number,max:number)=>max>0?Math.max(value?2:0,Math.min(100,(Math.abs(value)/max)*100)):0
const inPeriod=(value:unknown,start:string,end:string)=>{const date=String(value||'').slice(0,10);return Boolean(date&&date>=start&&date<=end)}

export default async function ReportsPage({searchParams}:{searchParams:Promise<{kind?:string;anchor?:string;closure?:string}>}){
  if(!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params=await searchParams
  const rawKind=params.kind||'quarter'
  const kind=(['month','quarter','semester','year'].includes(rawKind)?rawKind:'quarter') as PeriodKind
  const anchor=params.anchor||new Date().toISOString().slice(0,10)
  const period=resolveFinancePeriod(kind,anchor)
  const [{current,previous},bundle]=await Promise.all([financePeriodComparison(period),getFinanceBundle()])
  const rows=reportComparisonRows(current,previous)
  const result=n(current.invoiced)-n(current.expenses)
  const previousResult=n(previous.invoiced)-n(previous.expenses)
  const previousAnchor=period.previousStart
  const confirmedInvoices=bundle.invoices.filter(row=>['reviewed','confirmed'].includes(String(row.review_status||''))&&inPeriod(row.issue_date,period.start,period.end))
  const confirmedExpenses=bundle.expenses.filter(row=>['reviewed','confirmed'].includes(String(row.review_status||''))&&inPeriod(row.expense_date,period.start,period.end))
  const confirmedPayments=bundle.payments.filter(row=>['reviewed','confirmed'].includes(String(row.review_status||''))&&inPeriod(row.payment_date,period.start,period.end))
  const currentDocs=confirmedInvoices.length+confirmedExpenses.length+confirmedPayments.length
  const hasCurrentData=currentDocs>0
  const display=(value:unknown)=>hasCurrentData?euro(value):'—'
  const chartRows=[['Facturado',n(current.invoiced),n(previous.invoiced)],['Gastos',n(current.expenses),n(previous.expenses)],['Resultado',result,previousResult],['Cobros',n(current.cash_in),n(previous.cash_in)],['Pagos',n(current.cash_out),n(previous.cash_out)]] as const
  const chartMax=Math.max(1,...chartRows.flatMap(([,now,before])=>[Math.abs(now),Math.abs(before)]))
  return <AdminShell active="finance">
    <PageHeader eyebrow="Finanzas · Management reporting" title="Informes y cierres" description="Mes, trimestre, semestre y año usan la misma función SQL y las fechas reales de factura, gasto y movimiento confirmado." actions={<form action="/api/growth-admin/finance/closure" method="post"><input type="hidden" name="kind" value={kind}/><input type="hidden" name="anchor" value={anchor}/><button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15">Generar cierre Sheet + PDF</button></form>}/>
    <FinanceNav active="/growth-admin/finance/reports"/>
    <section className={`${adminPanel} p-5`}><form method="get" className="flex flex-col gap-3 md:flex-row md:items-end"><label className="flex-1 text-xs font-semibold text-slate-600">Periodicidad<select name="kind" defaultValue={kind} className={`mt-2 w-full ${adminInput}`}><option value="month">Mensual</option><option value="quarter">Trimestral</option><option value="semester">Semestral</option><option value="year">Anual</option></select></label><label className="flex-1 text-xs font-semibold text-slate-600">Fecha dentro del periodo<input type="date" name="anchor" defaultValue={anchor.slice(0,10)} className={`mt-2 w-full ${adminInput}`}/></label><button className={adminButtonPrimary}>Actualizar informe</button></form></section>
    {!hasCurrentData&&<div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Este periodo no tiene movimientos confirmados.</strong> Por eso los KPIs aparecen como “—” y no como 0 €. Si esperabas actividad, revisa facturas/gastos pendientes de doble check y la conciliación bancaria.</div>}
    <section className="mt-10"><SectionHeading eyebrow="Periodo actual" title={period.label} description={`${period.start} → ${period.end} · ${currentDocs} registros confirmados · comparación con ${period.previousStart} → ${period.previousEnd}`}/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Facturado" value={display(current.invoiced)} tone="blue"/><StatCard label="Gastos" value={display(current.expenses)} tone="violet"/><StatCard label="Resultado" value={display(result)} tone={hasCurrentData&&result<0?'amber':'green'} note={hasCurrentData?`Anterior ${euro(previousResult)}`:'Sin base confirmada'}/><StatCard label="Caja neta" value={hasCurrentData?euro(n(current.cash_in)-n(current.cash_out)):'—'} tone="green" note={hasCurrentData?`${euro(current.cash_in)} entra · ${euro(current.cash_out)} sale`:'Sin movimientos confirmados'}/></div></section>
    {hasCurrentData&&<section className="mt-12"><SectionHeading eyebrow="Gráficos" title="Actual vs periodo anterior" description="Escala común para facturación, gasto, resultado y caja."/><div className={`${adminPanel} p-5`}><div className="space-y-5">{chartRows.map(([label,now,before])=><div key={label}><div className="mb-2 flex justify-between gap-4 text-xs"><span className="font-semibold text-slate-700">{label}</span><span className="text-slate-500">{euro(now)} · anterior {euro(before)}</span></div><div className="space-y-1.5"><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{width:`${width(now,chartMax)}%`}}/></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-300" style={{width:`${width(before,chartMax)}%`}}/></div></div></div>)}</div></div></section>}
    <section className="mt-12"><SectionHeading eyebrow="Comparativa" title="Periodo vs periodo anterior"/><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="min-w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3">Métrica</th><th className="px-4 py-3">Actual</th><th className="px-4 py-3">Anterior</th><th className="px-4 py-3">Variación</th></tr></thead><tbody>{rows.map(([label,now,before,change])=><tr key={String(label)} className="border-t border-slate-200"><td className="px-4 py-3 font-medium text-slate-900">{String(label)}</td><td className="px-4 py-3">{hasCurrentData?euro(now):'—'}</td><td className="px-4 py-3 text-slate-500">{euro(before)}</td><td className={`px-4 py-3 font-semibold ${change!==null&&n(change)>=0?'text-emerald-700':'text-rose-600'}`}>{hasCurrentData?delta(change):'—'}</td></tr>)}</tbody></table></div></section>
    <section className="mt-12"><SectionHeading eyebrow="Navegación histórica" title="Moverse entre periodos"/><div className="flex flex-wrap gap-2"><Link href={`/growth-admin/finance/reports?kind=${kind}&anchor=${encodeURIComponent(previousAnchor)}`} className={adminButtonSecondary}>← Periodo anterior</Link><Link href={`/growth-admin/finance/reports?kind=${kind}&anchor=${encodeURIComponent(new Date().toISOString().slice(0,10))}`} className={adminButtonSecondary}>Periodo actual</Link><form action="/api/growth-admin/finance/sync-registers" method="post"><input type="hidden" name="year" value={period.start.slice(0,4)}/><button className={adminButtonSecondary}>Sincronizar libros {period.start.slice(0,4)}</button></form></div></section>
    <section className="mt-12 pb-12"><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs leading-6 text-amber-900"><strong>Interpretación:</strong> solo entran documentos confirmados. La posición de IVA, IRPF, devengo y deducibilidad debe revisarse antes de declaraciones oficiales.</div></section>
  </AdminShell>
}
