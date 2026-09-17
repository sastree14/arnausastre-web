import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import FinanceNav from '@/components/growth-admin/FinanceNav'
import { Badge, EmptyState, PageHeader, SectionHeading, StatCard, adminPanel } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getFinanceBundle } from '@/lib/growth-admin-performance'

export const dynamic='force-dynamic'
type Row=Record<string,unknown>
const n=(value:unknown)=>Number(value||0)
const money=(value:unknown,currency='EUR')=>new Intl.NumberFormat('es-ES',{style:'currency',currency:currency||'EUR',maximumFractionDigits:2}).format(n(value))
const date=(value:unknown)=>String(value||'').slice(0,10)||'—'

export default async function FinanceHistoryPage(){
  if(!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const bundle=await getFinanceBundle()
  const counterparties=bundle.counterparties
  const invoices=bundle.invoices as Row[]
  const expenses=bundle.expenses as Row[]
  const payments=bundle.payments as Row[]
  const invoiceById=new Map(invoices.map(row=>[String(row.invoice_id||''),row]))
  const expenseById=new Map(expenses.map(row=>[String(row.expense_id||''),row]))
  const paymentCounterparty=(row:Row)=>{
    if(row.invoice_id) return String(invoiceById.get(String(row.invoice_id))?.counterparty_id||'')
    if(row.expense_id) return String(expenseById.get(String(row.expense_id))?.counterparty_id||'')
    return String(row.counterparty_id||'')
  }
  const cards=counterparties.map(cp=>{
    const id=String(cp.counterparty_id)
    const cpInvoices=invoices.filter(row=>String(row.counterparty_id||'')===id)
    const cpExpenses=expenses.filter(row=>String(row.counterparty_id||'')===id)
    const cpPayments=payments.filter(row=>paymentCounterparty(row)===id)
    const invoiced=cpInvoices.filter(row=>!['void','cancelled'].includes(String(row.status||''))).reduce((sum,row)=>sum+n(row.amount_eur||row.total),0)
    const spent=cpExpenses.filter(row=>!['void','cancelled'].includes(String(row.status||''))).reduce((sum,row)=>sum+n(row.amount_eur||row.total),0)
    const collected=cpPayments.filter(row=>String(row.direction)==='inflow').reduce((sum,row)=>sum+n(row.amount_eur||row.amount),0)
    const paid=cpPayments.filter(row=>String(row.direction)==='outflow').reduce((sum,row)=>sum+n(row.amount_eur||row.amount),0)
    const events=[
      ...cpInvoices.map(row=>({at:String(row.issue_date||row.created_at||''),kind:'Factura',label:String(row.invoice_number||row.invoice_id||'Factura'),amount:n(row.amount_eur||row.total),currency:String(row.currency||'EUR'),status:String(row.status||'')})),
      ...cpExpenses.map(row=>({at:String(row.expense_date||row.created_at||''),kind:'Gasto',label:String(row.invoice_number||row.vendor||row.expense_id||'Gasto'),amount:n(row.amount_eur||row.total),currency:String(row.currency||'EUR'),status:String(row.status||'')})),
      ...cpPayments.map(row=>({at:String(row.payment_date||row.created_at||''),kind:String(row.direction)==='inflow'?'Cobro':'Pago',label:String(row.reference||row.method||row.payment_id||'Movimiento'),amount:n(row.amount_eur||row.amount),currency:String(row.currency||'EUR'),status:String(row.status||'')})),
    ].sort((a,b)=>b.at.localeCompare(a.at))
    return {cp,invoiced,spent,collected,paid,events}
  }).filter(item=>item.events.length||item.invoiced||item.spent||item.collected||item.paid)
  const totalOpen=invoices.filter(row=>!['paid','void','cancelled'].includes(String(row.status||''))).reduce((sum,row)=>sum+Math.max(0,n(row.amount_eur||row.total)-n(row.paid_amount_eur||row.paid_amount)),0)
  return <AdminShell active="finance">
    <PageHeader eyebrow="Finanzas · Counterparty ledger" title="Histórico por cliente y proveedor" description="Una vista única de facturas, gastos, cobros y pagos agrupados por contraparte. No duplica datos: deriva el histórico de los libros operativos existentes."/>
    <FinanceNav active="/growth-admin/finance/history"/>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Contrapartes con actividad" value={cards.length}/><StatCard label="Facturas" value={invoices.length} tone="blue"/><StatCard label="Gastos" value={expenses.length} tone="violet"/><StatCard label="Pendiente de cobro" value={money(totalOpen)} tone={totalOpen>0?'amber':'green'}/></div>
    <section className="mt-12"><SectionHeading eyebrow="Histórico" title="Clientes y proveedores" description="El saldo se calcula con documentos y movimientos registrados; si una contraparte no está vinculada al documento, aparecerá fuera de este agrupado hasta que se asigne." count={cards.length}/>{cards.length===0?<EmptyState>No hay todavía actividad financiera vinculada a clientes/proveedores. Esto no significa 0 € de actividad: revisa si existen documentos sin contraparte.</EmptyState>:<div className="space-y-5">{cards.map(({cp,invoiced,spent,collected,paid,events})=><details key={cp.counterparty_id} className={`${adminPanel} overflow-hidden`}><summary className="cursor-pointer list-none p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-950">{cp.legal_name}</p><Badge>{cp.kind}</Badge></div><p className="mt-1 text-xs text-slate-500">{cp.tax_id||cp.vat_id||'Sin NIF/VAT'} · {cp.billing_email||cp.email||'Sin email'}</p></div><div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4"><div><p className="text-slate-400">Facturado</p><p className="font-semibold">{money(invoiced,cp.currency)}</p></div><div><p className="text-slate-400">Cobrado</p><p className="font-semibold text-emerald-700">{money(collected,cp.currency)}</p></div><div><p className="text-slate-400">Gasto</p><p className="font-semibold">{money(spent,cp.currency)}</p></div><div><p className="text-slate-400">Pagado</p><p className="font-semibold">{money(paid,cp.currency)}</p></div></div></div></summary><div className="border-t border-slate-200"><div className="overflow-x-auto"><table className="min-w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Referencia</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Importe</th></tr></thead><tbody>{events.slice(0,100).map((event,index)=><tr key={`${event.kind}-${event.at}-${index}`} className="border-t border-slate-100"><td className="px-4 py-3">{date(event.at)}</td><td className="px-4 py-3"><Badge tone={event.kind==='Cobro'?'green':event.kind==='Pago'?'amber':'slate'}>{event.kind}</Badge></td><td className="px-4 py-3 font-medium text-slate-800">{event.label}</td><td className="px-4 py-3 text-slate-500">{event.status||'—'}</td><td className="px-4 py-3 text-right font-semibold">{money(event.amount,event.currency)}</td></tr>)}</tbody></table></div></div></details>)}</div>}</section>
  </AdminShell>
}
