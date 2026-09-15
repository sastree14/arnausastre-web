import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import FinanceNav from '@/components/growth-admin/FinanceNav'
import { Badge, PageHeader, SectionHeading, adminButtonPrimary, adminButtonSecondary, adminInput, adminPanel } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getFinanceBundle } from '@/lib/growth-admin-performance'
import { financeGoogleReadiness } from '@/lib/google-drive-finance'
import { gmailOAuthReadiness } from '@/lib/google-oauth-finance'
import { revolutReadiness } from '@/lib/revolut-finance'

export const dynamic='force-dynamic'

function Missing({names}:{names:string[]}){return names.length?<div className="mt-3 flex flex-wrap gap-1.5">{names.map((name)=><code key={name} className="rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-600">{name}</code>)}</div>:null}

export default async function IntegrationsPage(){
  if(!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const bundle=await getFinanceBundle()
  const settings=bundle.settings as Record<string,unknown>
  const drive=financeGoogleReadiness(),gmail=gmailOAuthReadiness(),revolut=revolutReadiness()
  const cronConfigured=Boolean((process.env.CRON_SECRET||'').trim())
  const googleAccounts=bundle.gmail_connections
  return <AdminShell active="finance">
    <PageHeader eyebrow="Finanzas · System" title="Configuración e integraciones" description="Un único lugar para los datos fiscales de SC-Analytics y las conexiones que activan Drive, Gmail, Revolut y automatizaciones. Las credenciales nunca se muestran en la UI."/>
    <FinanceNav active="/growth-admin/finance/integrations"/>

    <section><SectionHeading eyebrow="Emisor" title="Datos de SC-Analytics para facturación" description="Completa estos datos manualmente. El sistema no rellena NIF, domicilio ni banco desde memoria o fuentes no verificadas."/><form action="/api/growth-admin/finance" method="post" className={`${adminPanel} grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3`}>
      <input type="hidden" name="type" value="settings"/><input type="hidden" name="return_to" value="/growth-admin/finance/integrations"/>
      <label className="text-xs font-semibold text-slate-600">Razón social / nombre fiscal<input required name="legal_name" defaultValue={String(settings.legal_name||'')} className={`mt-2 w-full ${adminInput}`}/></label>
      <label className="text-xs font-semibold text-slate-600">NIF / Tax ID<input required name="tax_id" defaultValue={String(settings.tax_id||'')} className={`mt-2 w-full ${adminInput}`}/></label>
      <label className="text-xs font-semibold text-slate-600">Email facturación<input type="email" name="billing_email" defaultValue={String(settings.billing_email||'')} className={`mt-2 w-full ${adminInput}`}/></label>
      <label className="text-xs font-semibold text-slate-600 md:col-span-2">Dirección fiscal<textarea required name="billing_address" defaultValue={String(settings.billing_address||'')} className={`mt-2 min-h-20 w-full ${adminInput}`}/></label>
      <label className="text-xs font-semibold text-slate-600">Teléfono<input name="phone" defaultValue={String(settings.phone||'')} className={`mt-2 w-full ${adminInput}`}/></label>
      <label className="text-xs font-semibold text-slate-600">Web<input name="website" defaultValue={String(settings.website||'https://sc-analytics.io')} className={`mt-2 w-full ${adminInput}`}/></label>
      <label className="text-xs font-semibold text-slate-600">Serie facturas<input name="invoice_series" defaultValue={String(settings.invoice_series||'SC')} className={`mt-2 w-full ${adminInput}`}/></label>
      <label className="text-xs font-semibold text-slate-600">Plazo cobro por defecto<input type="number" min="0" name="default_payment_terms_days" defaultValue={String(settings.default_payment_terms_days||30)} className={`mt-2 w-full ${adminInput}`}/></label>
      <label className="text-xs font-semibold text-slate-600">Divisa base<select name="default_currency" defaultValue={String(settings.default_currency||'EUR')} className={`mt-2 w-full ${adminInput}`}><option>EUR</option><option>USD</option></select></label>
      <label className="text-xs font-semibold text-slate-600 md:col-span-2 xl:col-span-3">Datos de cobro que aparecerán en factura<textarea name="bank_details" defaultValue={String(settings.bank_details||'')} placeholder="IBAN / SWIFT / instrucciones de pago" className={`mt-2 min-h-20 w-full ${adminInput}`}/></label>
      <div className="xl:col-span-3"><button className={adminButtonPrimary}>Guardar configuración fiscal</button></div>
    </form></section>

    <section className="mt-14"><SectionHeading eyebrow="Documentos" title="Google Drive + Sheets" description="Al activarlo, emitir una factura creará Google Sheet editable, PDF y XLSX en la estructura de Drive ya creada."/><div className={`${adminPanel} p-5`}><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><div className="flex items-center gap-2"><p className="font-semibold text-slate-950">Service Account de Finanzas</p><Badge tone={drive.configured?'green':'amber'}>{drive.configured?'Configurada':'Pendiente credenciales'}</Badge></div><p className="mt-2 text-xs leading-5 text-slate-500">Raíz documental: 04 Finanzas / Facturación. La Service Account solo necesita acceso Editor a esta carpeta, no a todo tu Drive.</p><Missing names={drive.missing}/></div><a href="https://drive.google.com/drive/folders/1la-zseMKNF1Byk1ErH2yAvYuZeqlnl5B" target="_blank" rel="noreferrer" className={adminButtonSecondary}>Abrir carpeta ↗</a></div></div></section>

    <section className="mt-14"><SectionHeading eyebrow="Captura de gastos" title="Gmail" description="Cada cuenta se autoriza de forma independiente con acceso de solo lectura. Los correos generan candidatos; nunca gastos definitivos sin doble check."/><div className="grid gap-4 xl:grid-cols-2"><div className={`${adminPanel} p-5`}><div className="flex items-center gap-2"><p className="font-semibold text-slate-950">OAuth Gmail</p><Badge tone={gmail.configured?'green':'amber'}>{gmail.configured?'Credenciales listas':'Pendiente credenciales'}</Badge></div><Missing names={gmail.missing}/><div className="mt-4 flex flex-wrap gap-2">{gmail.configured&&<><a href="/api/growth-admin/google/connect?account=corporate" className={adminButtonPrimary}>Conectar Gmail SC-Analytics</a><a href="/api/growth-admin/google/connect?account=personal" className={adminButtonSecondary}>Conectar Gmail personal</a></>}</div></div><div className={`${adminPanel} p-5`}><p className="font-semibold text-slate-950">Cuentas autorizadas</p>{googleAccounts.length===0?<p className="mt-3 text-xs text-slate-500">Ninguna todavía.</p>:<div className="mt-3 space-y-2">{googleAccounts.map((connection)=><div key={String(connection.connection_id)} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><span className="text-xs font-medium text-slate-800">{String(connection.display_name||connection.provider_subject)}</span><Badge tone="green">{String(connection.account_type)}</Badge></div>)}</div>}<p className="mt-4 text-[11px] leading-5 text-slate-400">Automatización preparada: lunes 06:00 UTC + ejecución manual desde Gastos.</p></div></div></section>

    <section className="mt-14"><SectionHeading eyebrow="Bank feed" title="Revolut Business" description="Integración diseñada con scope READ. Importa cuentas/transacciones y propone conciliaciones, pero el CRM no puede ordenar transferencias."/><div className={`${adminPanel} p-5`}><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><div className="flex items-center gap-2"><p className="font-semibold text-slate-950">Revolut Business API</p><Badge tone={bundle.revolut_connections.length?'green':revolut.configured?'blue':'amber'}>{bundle.revolut_connections.length?'Conectado':revolut.configured?'Credenciales listas':'Pendiente credenciales'}</Badge></div><Missing names={revolut.missing}/><p className="mt-3 text-xs leading-5 text-slate-500">Sin permisos WRITE/PAY. Las coincidencias bancarias siempre pasan por confirmación antes de contabilizarse.</p></div><div className="flex flex-wrap gap-2">{revolut.configured&&!bundle.revolut_connections.length&&<a href="/api/growth-admin/revolut/connect" className={adminButtonPrimary}>Autorizar Revolut READ</a>}{bundle.revolut_connections.length>0&&<form action="/api/growth-admin/revolut/sync" method="post"><input type="hidden" name="days" value="90"/><button className={adminButtonPrimary}>Sincronizar ahora</button></form>}</div></div></div></section>

    <section className="mt-14 pb-12"><SectionHeading eyebrow="Automatización" title="Workers preparados"/><div className="grid gap-4 md:grid-cols-2"><div className={`${adminPanel} p-5`}><div className="flex items-center gap-2"><p className="font-semibold">Gmail + libros</p><Badge tone={cronConfigured?'green':'amber'}>{cronConfigured?'Cron autorizado':'Falta CRON_SECRET'}</Badge></div><p className="mt-2 text-xs leading-5 text-slate-500">Semanal: busca facturas/recibos nuevos, crea candidatos y actualiza libros de registro cuando Google Drive esté disponible.</p></div><div className={`${adminPanel} p-5`}><div className="flex items-center gap-2"><p className="font-semibold">Banco + conciliación</p><Badge tone={cronConfigured?'green':'amber'}>{cronConfigured?'Cron autorizado':'Falta CRON_SECRET'}</Badge></div><p className="mt-2 text-xs leading-5 text-slate-500">Diario: lee Revolut Business si está conectado, persiste transacciones y propone matches. No confirma ninguno automáticamente.</p></div></div></section>
  </AdminShell>
}
