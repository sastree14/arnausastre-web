import Link from 'next/link'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import FinanceNav from '@/components/growth-admin/FinanceNav'
import { Badge, PageHeader, SectionHeading, StatCard, adminPanel } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getFinanceBundle } from '@/lib/growth-admin-performance'
import { financeGoogleReadiness } from '@/lib/google-drive-finance'
import { gmailOAuthReadiness } from '@/lib/google-oauth-finance'
import { revolutReadiness } from '@/lib/revolut-finance'

export const dynamic='force-dynamic'
const n=(value:unknown)=>Number(value||0)
const euro=(value:unknown)=>`${n(value).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})} €`

export default async function FinanceOverview(){
  if(!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const bundle=await getFinanceBundle()
  const invoiced=n(bundle.invoiced),received=n(bundle.received),spent=n(bundle.spent)
  const outstanding=Math.max(0,invoiced-received),result=invoiced-spent,vatPosition=n(bundle.vat_output)-n(bundle.vat_input)
  const pendingReview=[...bundle.invoices,...bundle.expenses,...bundle.payments].filter((row)=>String(row.review_status||'')==='pending_review').length + bundle.import_candidates.length
  const settings=bundle.settings as Record<string,unknown>
  const issuerReady=Boolean(settings.legal_name&&settings.tax_id&&settings.billing_address)
  const google=financeGoogleReadiness(),gmail=gmailOAuthReadiness(),revolut=revolutReadiness()

  return <AdminShell active="finance">
    <PageHeader eyebrow="Cuadro de Mando Integral · Finanzas" title="Finance OS" description="Fuente de verdad financiera de SC-Analytics: facturación, gastos, caja, conciliación, fiscalidad, contabilidad, documentación y reporting conectados al mismo CRM." actions={<a href="https://drive.google.com/drive/folders/1la-zseMKNF1Byk1ErH2yAvYuZeqlnl5B" target="_blank" rel="noreferrer" className="rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15">Abrir Drive financiero ↗</a>}/>
    <FinanceNav active="/growth-admin/finance"/>
    {bundle.degraded&&<div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">Finanzas ha cargado en modo seguro porque Supabase tardó demasiado. Refresca antes de tomar decisiones.</div>}

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Facturado" value={euro(invoiced)} tone="blue" note="Devengo registrado"/>
      <StatCard label="Cobrado" value={euro(received)} tone="green" note={`${euro(outstanding)} pendiente`}/>
      <StatCard label="Gastos" value={euro(spent)} tone="violet" note="Gasto registrado"/>
      <StatCard label="Resultado operativo" value={euro(result)} tone={result>=0?'green':'amber'} note="Antes de impuestos y ajustes de cierre"/>
      <StatCard label="IVA estimado" value={euro(vatPosition)} tone="amber" note={`${euro(bundle.vat_output)} repercutido · ${euro(bundle.vat_input)} soportado`}/>
      <StatCard label="IRPF retenido" value={euro(bundle.withholding_total)} tone="slate" note="Estimación desde facturas registradas"/>
      <StatCard label="Pendiente doble check" value={pendingReview} tone={pendingReview?'amber':'green'} note="Movimientos + candidatos Gmail"/>
      <StatCard label="Banco sin conciliar" value={bundle.bank_transactions.filter((row)=>row.reconciliation_status==='unmatched').length} tone="blue" note="Transacciones pendientes de asociación"/>
    </div>

    <section className="mt-12"><SectionHeading eyebrow="Finance OS · Estado" title="Preparación del sistema" description="Lo estructural ya está construido. Las credenciales activan las automatizaciones sin cambiar el modelo financiero."/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[
        {label:'Datos fiscales SC-Analytics',ok:issuerReady,note:issuerReady?'Listos para emitir':'Completa razón social, NIF y dirección en Integraciones'},
        {label:'Drive + Sheets',ok:google.configured,note:google.configured?'Generación PDF/XLSX/Sheets disponible':`Pendiente: ${google.missing.join(', ')}`},
        {label:'Gmail financiero',ok:gmail.configured&&bundle.gmail_connections.length>0,note:bundle.gmail_connections.length?`${bundle.gmail_connections.length} cuenta(s) conectada(s)`:gmail.configured?'Credenciales listas; falta autorizar cuentas':`Pendiente: ${gmail.missing.join(', ')}`},
        {label:'Revolut Business',ok:revolut.configured&&bundle.revolut_connections.length>0,note:bundle.revolut_connections.length?'Conectado para lectura y conciliación':revolut.configured?'Credenciales listas; falta consentimiento':`Pendiente: ${revolut.missing.join(', ')}`},
      ].map((item)=><div key={item.label} className={`${adminPanel} p-5`}><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-slate-950">{item.label}</p><Badge tone={item.ok?'green':'amber'}>{item.ok?'Listo':'Pendiente'}</Badge></div><p className="mt-3 text-xs leading-5 text-slate-500">{item.note}</p></div>)}
    </div></section>

    <section className="mt-12 pb-12"><SectionHeading eyebrow="Finance OS · Flujo" title="Qué alimenta cada módulo"/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[
        ['/growth-admin/finance/invoices','Facturación','Cliente → borrador → doble check → factura numerada → Google Sheet + XLSX + PDF → Drive → asiento → cobro.'],
        ['/growth-admin/finance/expenses','Gastos','Manual o Gmail semanal → candidato → revisión → gasto contabilizado → justificante en Drive → libro registro.'],
        ['/growth-admin/finance/cash','Caja y banco','Cobro/pago manual o Revolut → matching → propuesta de conciliación → confirmación → factura/gasto liquidado.'],
        ['/growth-admin/finance/accounting','Contabilidad e impuestos','Asientos automáticos de doble partida, IVA, retenciones, trazabilidad y posición fiscal estimada.'],
        ['/growth-admin/finance/reports','Informes','Mensual, trimestral, semestral y anual: P&L, cash flow, impuestos y comparativas.'],
        ['/growth-admin/finance/integrations','Integraciones','Configuración fiscal, Drive, Gmail, Revolut y estado de automatizaciones.'],
      ].map(([href,title,description])=><Link key={href} href={href} className={`${adminPanel} p-5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md`}><p className="font-semibold text-slate-950">{title}</p><p className="mt-2 text-xs leading-5 text-slate-500">{description}</p></Link>)}
    </div></section>
  </AdminShell>
}
