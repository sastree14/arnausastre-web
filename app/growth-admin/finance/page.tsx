import Link from 'next/link'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import FinanceNav from '@/components/growth-admin/FinanceNav'
import { Badge, PageHeader, SectionHeading, StatCard, adminButtonPrimary, adminInput, adminPanel } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getFinanceBundle } from '@/lib/growth-admin-performance'
import { financeGoogleReadiness } from '@/lib/google-drive-finance'
import { gmailOAuthReadiness } from '@/lib/google-oauth-finance'
import { revolutReadiness } from '@/lib/revolut-finance'
import { financePeriodComparison, resolveFinancePeriod, type PeriodKind } from '@/lib/finance-reporting'

export const dynamic='force-dynamic'
const n=(value:unknown)=>Number(value||0)
const euro=(value:unknown)=>`${n(value).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})} €`
const pct=(value:number,total:number)=>total>0?Math.max(2,Math.min(100,(Math.abs(value)/total)*100)):0

type FinanceOverviewProps={searchParams?:Promise<{kind?:string;anchor?:string}>}

export default async function FinanceOverview({searchParams}:FinanceOverviewProps){
  if(!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params=(await searchParams)||{}
  const rawKind=String(params.kind||'quarter')
  const kind=(['month','quarter','semester','year'].includes(rawKind)?rawKind:'quarter') as PeriodKind
  const anchor=String(params.anchor||new Date().toISOString().slice(0,10))
  const period=resolveFinancePeriod(kind,anchor)
  const [bundle,comparison]=await Promise.all([getFinanceBundle(),financePeriodComparison(period)])
  const current=comparison.current
  const previous=comparison.previous
  const invoiced=n(current.invoiced),received=n(current.cash_in),spent=n(current.expenses)
  const outstanding=Math.max(0,invoiced-received),result=invoiced-spent,vatPosition=n(current.vat_output)-n(current.vat_input)
  const pendingReview=[...bundle.invoices,...bundle.expenses,...bundle.payments].filter((row)=>String(row.review_status||'')==='pending_review').length + bundle.import_candidates.length
  const settings=bundle.settings as Record<string,unknown>
  const issuerReady=Boolean(settings.legal_name&&settings.tax_id&&settings.billing_address)
  const google=financeGoogleReadiness(),gmail=gmailOAuthReadiness(),revolut=revolutReadiness()
  const chartMax=Math.max(invoiced,spent,received,n(current.cash_out),1)
  const previousResult=n(previous.invoiced)-n(previous.expenses)

  return <AdminShell active="finance">
    <PageHeader eyebrow="Cuadro de Mando Integral · Finanzas" title="Finance OS" description="Fuente de verdad financiera de SC-Analytics: facturación, gastos, caja, conciliación, fiscalidad, contabilidad, documentación y reporting conectados al mismo CRM." actions={<a href="https://drive.google.com/drive/folders/1la-zseMKNF1Byk1ErH2yAvYuZeqlnl5B" target="_blank" rel="noreferrer" className="rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15">Abrir Drive financiero ↗</a>}/>
    <FinanceNav active="/growth-admin/finance"/>
    {bundle.degraded&&<div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">Finanzas ha cargado en modo seguro porque Supabase tardó demasiado. Refresca antes de tomar decisiones.</div>}

    <section className={`${adminPanel} mb-8 p-5`}>
      <form method="get" className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="text-xs font-semibold text-slate-600">Periodo<select name="kind" defaultValue={kind} className={`mt-2 w-full ${adminInput}`}><option value="month">Mensual</option><option value="quarter">Trimestral</option><option value="semester">Semestral</option><option value="year">Anual</option></select></label>
        <label className="text-xs font-semibold text-slate-600">Fecha de referencia<input type="date" name="anchor" defaultValue={anchor.slice(0,10)} className={`mt-2 w-full ${adminInput}`}/></label>
        <button className={adminButtonPrimary}>Aplicar periodo</button>
      </form>
      <p className="mt-3 text-xs text-slate-500"><strong className="text-slate-700">{period.label}</strong> · {period.start} → {period.end} · comparado con {period.previousStart} → {period.previousEnd}</p>
    </section>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Facturado" value={euro(invoiced)} tone="blue" note={`Periodo anterior ${euro(previous.invoiced)}`}/>
      <StatCard label="Cobrado" value={euro(received)} tone="green" note={`${euro(outstanding)} pendiente aprox.`}/>
      <StatCard label="Gastos" value={euro(spent)} tone="violet" note={`Periodo anterior ${euro(previous.expenses)}`}/>
      <StatCard label="Resultado operativo" value={euro(result)} tone={result>=0?'green':'amber'} note={`Anterior ${euro(previousResult)}`}/>
      <StatCard label="IVA estimado" value={euro(vatPosition)} tone="amber" note={`${euro(current.vat_output)} repercutido · ${euro(current.vat_input)} soportado`}/>
      <StatCard label="IRPF retenido" value={euro(current.withholding)} tone="slate" note="Estimación desde facturas revisadas"/>
      <StatCard label="Pendiente doble check" value={pendingReview} tone={pendingReview?'amber':'green'} note="Movimientos + candidatos Gmail"/>
      <StatCard label="Banco sin conciliar" value={bundle.bank_transactions.filter((row)=>row.reconciliation_status==='unmatched').length} tone="blue" note="Transacciones pendientes de asociación"/>
    </div>

    <section className="mt-10"><SectionHeading eyebrow="Finance OS · Gráfico" title={`Actividad de ${period.label}`} description="Comparación visual de devengo y caja del periodo seleccionado."/><div className={`${adminPanel} p-5`}><div className="space-y-5">{[
      ['Facturado',invoiced,'bg-blue-600'],['Gastos',spent,'bg-violet-600'],['Cobros',received,'bg-emerald-600'],['Pagos',n(current.cash_out),'bg-slate-700'],
    ].map(([label,value,tone])=><div key={String(label)}><div className="mb-2 flex items-center justify-between gap-4 text-xs"><span className="font-semibold text-slate-700">{String(label)}</span><span className="tabular-nums text-slate-500">{euro(value)}</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${String(tone)}`} style={{width:`${pct(n(value),chartMax)}%`}}/></div></div>)}</div></div></section>

    <section className="mt-12"><SectionHeading eyebrow="Finance OS · Estado" title="Preparación del sistema" description="Lo estructural ya está construido. Las credenciales activan las automatizaciones sin cambiar el modelo financiero."/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[
        {label:'Datos fiscales SC-Analytics',ok:issuerReady,note:issuerReady?'Listos para emitir':'Completa razón social, NIF y dirección en Integraciones'},
        {label:'Drive + Sheets',ok:google.configured,note:google.configured?'Generación PDF/XLSX/Sheets disponible':`Pendiente: ${google.missing.join(', ')}`},
        {label:'Gmail financiero',ok:gmail.configured&&bundle.gmail_connections.length>0,note:bundle.gmail_connections.length?`${bundle.gmail_connections.length} cuenta(s) conectada(s)`:gmail.configured?'Credenciales listas; falta autorizar cuentas':`Pendiente: ${gmail.missing.join(', ')}`},
        {label:'Banco',ok:bundle.bank_transactions.length>0||bundle.revolut_connections.length>0,note:bundle.bank_transactions.length?`${bundle.bank_transactions.length} movimiento(s) importado(s)`:revolut.configured?'Revolut Business opcional; Revolut Personal funciona por CSV/XLSX':'Revolut Personal listo mediante importación CSV/XLSX'},
      ].map((item)=><div key={item.label} className={`${adminPanel} p-5`}><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-slate-950">{item.label}</p><Badge tone={item.ok?'green':'amber'}>{item.ok?'Listo':'Pendiente'}</Badge></div><p className="mt-3 text-xs leading-5 text-slate-500">{item.note}</p></div>)}
    </div></section>

    <section className="mt-12 pb-12"><SectionHeading eyebrow="Finance OS · Flujo" title="Qué alimenta cada módulo"/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[
        ['/growth-admin/finance/invoices','Facturación','Cliente → borrador → doble check → factura numerada → Google Sheet + XLSX + PDF → Drive → asiento → cobro.'],
        ['/growth-admin/finance/expenses','Gastos','Manual o Gmail semanal → candidato → revisión → gasto contabilizado → justificante en Drive → libro registro.'],
        ['/growth-admin/finance/cash','Caja y banco','Cobro/pago manual o extracto bancario → matching → propuesta de conciliación → confirmación → factura/gasto liquidado.'],
        ['/growth-admin/finance/accounting','Contabilidad e impuestos','Asientos automáticos de doble partida, IVA, retenciones, trazabilidad y posición fiscal estimada.'],
        ['/growth-admin/finance/reports','Informes','Mensual, trimestral, semestral y anual: P&L, cash flow, impuestos, gráficos y comparativas.'],
        ['/growth-admin/finance/integrations','Integraciones','Configuración fiscal, Drive, Gmail y estado de automatizaciones.'],
      ].map(([href,title,description])=><Link key={href} href={href} className={`${adminPanel} p-5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md`}><p className="font-semibold text-slate-950">{title}</p><p className="mt-2 text-xs leading-5 text-slate-500">{description}</p></Link>)}
    </div></section>
  </AdminShell>
}
