import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import FinanceNav from '@/components/growth-admin/FinanceNav'
import { Badge, EmptyState, PageHeader, SectionHeading, adminButtonPrimary, adminButtonSecondary, adminInput, adminPanel, statusTone } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getFinanceBundle } from '@/lib/growth-admin-performance'

export const dynamic='force-dynamic'
const n=(v:unknown)=>Number(v||0)

export default async function InvoicesPage(){
  if(!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const bundle=await getFinanceBundle()
  const clients=bundle.counterparties.filter((c)=>c.kind==='client'||c.kind==='both')
  const projects=bundle.projects
  return <AdminShell active="finance">
    <PageHeader eyebrow="Finanzas · Accounts receivable" title="Facturación" description="Crear borradores, aplicar tratamiento fiscal sugerido, hacer doble check y emitir documentos inmutables en Google Sheet, XLSX y PDF."/>
    <FinanceNav active="/growth-admin/finance/invoices"/>

    <section><SectionHeading eyebrow="Maestros" title="Clientes de facturación" description="El cliente financiero conserva razón social, NIF/VAT, país, dirección, divisa y perfil fiscal independientemente del CRM comercial." count={clients.length}/><div className="grid gap-5 xl:grid-cols-[1.1fr_1.9fr]">
      <form action="/api/growth-admin/finance" method="post" className={`${adminPanel} p-5`}>
        <input type="hidden" name="type" value="counterparty"/><input type="hidden" name="kind" value="client"/><input type="hidden" name="return_to" value="/growth-admin/finance/invoices"/>
        <p className="font-semibold text-slate-950">Nuevo cliente fiscal</p>
        <input required name="legal_name" placeholder="Razón social / nombre legal" className={`mt-4 w-full ${adminInput}`}/>
        <div className="mt-2 grid grid-cols-2 gap-2"><input name="tax_id" placeholder="NIF / Tax ID" className={adminInput}/><input name="vat_id" placeholder="VAT ID si aplica" className={adminInput}/></div>
        <div className="mt-2 grid grid-cols-2 gap-2"><input name="country_code" placeholder="País: ES, NL, US..." className={adminInput}/><select name="tax_profile" className={adminInput}><option value="spain_b2b">España B2B</option><option value="eu_b2b_vat">UE B2B + VAT</option><option value="non_eu_b2b">Fuera UE B2B</option><option value="manual_review">Revisión manual</option></select></div>
        <textarea name="billing_address" placeholder="Dirección fiscal" className={`mt-2 min-h-20 w-full ${adminInput}`}/>
        <div className="mt-2 grid grid-cols-2 gap-2"><input type="email" name="email" placeholder="Email facturación" className={adminInput}/><input name="phone" placeholder="Teléfono" className={adminInput}/></div>
        <div className="mt-2 grid grid-cols-2 gap-2"><select name="currency" className={adminInput}><option>EUR</option><option>USD</option></select><input type="number" name="payment_terms_days" defaultValue="30" min="0" placeholder="Días pago" className={adminInput}/></div>
        <button className={`mt-3 ${adminButtonPrimary}`}>Guardar cliente</button>
      </form>
      <div className={`${adminPanel} overflow-hidden`}>
        {clients.length===0?<div className="p-6"><EmptyState>Aún no hay clientes fiscales.</EmptyState></div>:<div className="overflow-x-auto"><table className="min-w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">NIF/VAT</th><th className="px-4 py-3">País</th><th className="px-4 py-3">Perfil</th><th className="px-4 py-3">Moneda</th></tr></thead><tbody>{clients.map((c)=><tr key={c.counterparty_id} className="border-t border-slate-200"><td className="px-4 py-3 font-medium text-slate-900">{c.legal_name}</td><td className="px-4 py-3 text-slate-600">{c.vat_id||c.tax_id||'—'}</td><td className="px-4 py-3 text-slate-600">{c.country_code||'—'}</td><td className="px-4 py-3"><Badge>{c.tax_profile}</Badge></td><td className="px-4 py-3">{c.currency}</td></tr>)}</tbody></table></div>}
      </div>
    </div></section>

    <section className="mt-14"><SectionHeading eyebrow="Factura · Paso 1" title="Crear borrador" description="Deja IVA vacío para usar la sugerencia del motor fiscal. Toda sugerencia queda marcada para revisión humana antes de emitir."/><form action="/api/growth-admin/finance" method="post" className={`${adminPanel} grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4`}>
      <input type="hidden" name="type" value="invoice"/><input type="hidden" name="return_to" value="/growth-admin/finance/invoices"/>
      <select required name="counterparty_id" className={adminInput}><option value="">Cliente fiscal</option>{clients.map((c)=><option key={c.counterparty_id} value={c.counterparty_id}>{c.legal_name}</option>)}</select>
      <select name="project_id" className={adminInput}><option value="">Proyecto opcional</option>{projects.map((p)=><option key={p.project_id} value={p.project_id}>{p.name}</option>)}</select>
      <input type="date" required name="issue_date" className={adminInput}/><input type="date" name="due_date" className={adminInput}/>
      <input required name="concept" placeholder="Concepto / servicio" className={`${adminInput} md:col-span-2`}/>
      <input type="number" step="0.01" min="0" name="subtotal" required placeholder="Base imponible" className={adminInput}/>
      <select name="currency" className={adminInput}><option>EUR</option><option>USD</option></select>
      <input type="number" step="0.01" name="vat_rate" placeholder="IVA % (vacío = sugerir)" className={adminInput}/>
      <input type="number" step="0.01" name="withholding_rate" placeholder="IRPF/retención %" className={adminInput}/>
      <input type="number" step="0.000001" name="fx_rate" placeholder="Cambio a EUR si USD" className={adminInput}/><input type="date" name="fx_date" className={adminInput}/>
      <textarea name="notes" placeholder="Notas internas / factura" className={`${adminInput} min-h-20 md:col-span-2 xl:col-span-4`}/>
      <div className="xl:col-span-4"><button className={adminButtonPrimary}>Guardar borrador</button></div>
    </form></section>

    <section className="mt-14 pb-12"><SectionHeading eyebrow="Factura · Paso 2 y 3" title="Revisar y emitir" description="Una factura emitida no se edita silenciosamente. Si hay un error posterior, debe rectificarse y conservar trazabilidad." count={bundle.invoices.length}/>
      {bundle.invoices.length===0?<EmptyState>No hay facturas registradas.</EmptyState>:<div className="space-y-3">{bundle.invoices.map((invoice)=>{
        const reviewed=['reviewed','confirmed'].includes(String(invoice.review_status||'')); const issued=Boolean(invoice.issued_at)||invoice.status==='issued'||invoice.status==='paid'
        return <div key={invoice.invoice_id} className={`${adminPanel} p-5`}><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-950">{invoice.invoice_number||'Borrador sin numerar'}</p><Badge tone={statusTone(String(invoice.status||''))}>{String(invoice.status||'draft')}</Badge><Badge tone={reviewed?'green':'amber'}>{String(invoice.review_status||'pending_review')}</Badge></div><p className="mt-2 text-xs text-slate-500">{invoice.issue_date||'Sin fecha'} · {invoice.recipient_legal_name||'Cliente'} · {n(invoice.total).toLocaleString('es-ES',{minimumFractionDigits:2})} {invoice.currency||'EUR'}</p><p className="mt-1 text-[11px] text-slate-400">{invoice.tax_rule_key||invoice.tax_profile||'Fiscalidad pendiente'} · IVA {n(invoice.vat_rate)}% · retención {n(invoice.withholding_rate)}%</p></div><div className="flex flex-wrap gap-2">
          {!reviewed&&!issued&&<form action="/api/growth-admin/finance" method="post"><input type="hidden" name="type" value="review"/><input type="hidden" name="entity" value="invoice"/><input type="hidden" name="entity_id" value={String(invoice.invoice_id)}/><input type="hidden" name="decision" value="reviewed"/><input type="hidden" name="return_to" value="/growth-admin/finance/invoices"/><button className={adminButtonSecondary}>✓ Doble check</button></form>}
          {reviewed&&!issued&&<form action="/api/growth-admin/finance/invoice/issue" method="post"><input type="hidden" name="invoice_id" value={String(invoice.invoice_id)}/><input type="hidden" name="return_to" value="/growth-admin/finance/invoices"/><button className={adminButtonPrimary}>Emitir + generar documentos</button></form>}
          {invoice.sheet_drive_file_id&&<a target="_blank" rel="noreferrer" href={`https://docs.google.com/spreadsheets/d/${invoice.sheet_drive_file_id}/edit`} className={adminButtonSecondary}>Google Sheet ↗</a>}
          {invoice.pdf_drive_file_id&&<a target="_blank" rel="noreferrer" href={`https://drive.google.com/file/d/${invoice.pdf_drive_file_id}/view`} className={adminButtonSecondary}>PDF ↗</a>}
          {invoice.xlsx_drive_file_id&&<a target="_blank" rel="noreferrer" href={`https://drive.google.com/file/d/${invoice.xlsx_drive_file_id}/view`} className={adminButtonSecondary}>XLSX ↗</a>}
        </div></div>{invoice.tax_notes&&<p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">{String(invoice.tax_notes)}</p>}</div>
      })}</div>}
    </section>
  </AdminShell>
}
