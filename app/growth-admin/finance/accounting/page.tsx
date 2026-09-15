/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import FinanceNav from '@/components/growth-admin/FinanceNav'
import { Badge, EmptyState, PageHeader, SectionHeading, StatCard, adminPanel } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated, queryGrowthTable } from '@/lib/growth-admin'
import { getFinanceBundle } from '@/lib/growth-admin-performance'

export const dynamic='force-dynamic'
const n=(value:unknown)=>Number(value||0)
const euro=(value:unknown)=>`${n(value).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})} €`

type JournalLine={journal_line_id:string;journal_entry_id:string;account_code:string;description?:string;debit:number|string;credit:number|string;currency:string}

export default async function AccountingPage(){
  if(!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const [bundle,lines]=await Promise.all([
    getFinanceBundle(),
    queryGrowthTable<JournalLine>('finance_journal_lines',{tenant_id:'eq.sc-analytics',order:'created_at.desc',limit:'600'},{cacheSeconds:5}),
  ])
  const linesByEntry=new Map<string,JournalLine[]>()
  for(const line of lines){const list=linesByEntry.get(line.journal_entry_id)||[];list.push(line);linesByEntry.set(line.journal_entry_id,list)}
  const accountByCode=new Map(bundle.accounts.map((a)=>[String(a.account_code),a]))
  const vatPosition=n(bundle.vat_output)-n(bundle.vat_input)
  const operatingResult=n(bundle.invoiced)-n(bundle.spent)
  return <AdminShell active="finance">
    <PageHeader eyebrow="Finanzas · Accounting" title="Contabilidad e impuestos" description="Capa contable de doble partida, posición fiscal estimada y auditoría. Sirve para control empresarial; las declaraciones oficiales siguen requiriendo revisión fiscal/gestoría."/>
    <FinanceNav active="/growth-admin/finance/accounting"/>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Ingresos registrados" value={euro(bundle.invoiced)} tone="blue"/><StatCard label="Gastos registrados" value={euro(bundle.spent)} tone="violet"/><StatCard label="Resultado operativo" value={euro(operatingResult)} tone={operatingResult>=0?'green':'amber'}/><StatCard label="IVA neto estimado" value={euro(vatPosition)} tone="amber" note={`${euro(bundle.vat_output)} repercutido · ${euro(bundle.vat_input)} soportado`}/></div>

    <section className="mt-12"><SectionHeading eyebrow="Fiscalidad" title="Posición estimada" description="Estos importes se derivan de los documentos confirmados en el sistema; no sustituyen una liquidación tributaria ni validan por sí solos la deducibilidad de un gasto."/><div className="grid gap-4 md:grid-cols-3"><div className={`${adminPanel} p-5`}><p className="text-xs uppercase tracking-wider text-slate-400">IVA repercutido</p><p className="mt-2 text-2xl font-semibold">{euro(bundle.vat_output)}</p></div><div className={`${adminPanel} p-5`}><p className="text-xs uppercase tracking-wider text-slate-400">IVA soportado</p><p className="mt-2 text-2xl font-semibold">{euro(bundle.vat_input)}</p></div><div className={`${adminPanel} p-5`}><p className="text-xs uppercase tracking-wider text-slate-400">Retenciones facturas</p><p className="mt-2 text-2xl font-semibold">{euro(bundle.withholding_total)}</p></div></div></section>

    <section className="mt-14"><SectionHeading eyebrow="Plan contable" title="Cuentas" count={bundle.accounts.length}/><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{bundle.accounts.map((account)=><div key={String(account.account_code)} className={`${adminPanel} p-4`}><div className="flex items-center justify-between gap-3"><p className="font-mono text-sm font-semibold text-slate-950">{String(account.account_code)}</p><Badge>{String(account.account_type)}</Badge></div><p className="mt-2 text-sm text-slate-700">{String(account.name)}</p><p className="mt-1 text-[11px] text-slate-400">Saldo natural: {String(account.normal_balance)}</p></div>)}</div></section>

    <section className="mt-14"><SectionHeading eyebrow="Libro diario" title="Asientos automáticos" description="Se crean al emitir facturas y confirmar gastos/cobros/pagos. Un mismo documento no se contabiliza dos veces." count={bundle.journal_entries.length}/>{bundle.journal_entries.length===0?<EmptyState>Todavía no hay asientos. Los históricos importados mantienen sus datos pero no se han posteado retroactivamente sin revisión.</EmptyState>:<div className="space-y-4">{bundle.journal_entries.map((entry)=>{const entryLines=linesByEntry.get(String(entry.journal_entry_id))||[];return <div key={String(entry.journal_entry_id)} className={`${adminPanel} overflow-hidden`}><div className="flex flex-col gap-2 bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-semibold text-slate-950">{String(entry.description)}</p><p className="text-xs text-slate-500">{String(entry.entry_date)} · {String(entry.source_type)} · {String(entry.source_id||'')}</p></div><Badge tone="green">{String(entry.status)}</Badge></div><div className="overflow-x-auto"><table className="min-w-full text-left text-xs"><thead><tr className="text-slate-400"><th className="px-5 py-2">Cuenta</th><th className="px-5 py-2">Debe</th><th className="px-5 py-2">Haber</th></tr></thead><tbody>{entryLines.map((line)=><tr key={line.journal_line_id} className="border-t border-slate-100"><td className="px-5 py-2.5">{line.account_code} · {String(accountByCode.get(line.account_code)?.name||'')}</td><td className="px-5 py-2.5">{n(line.debit)?euro(line.debit):'—'}</td><td className="px-5 py-2.5">{n(line.credit)?euro(line.credit):'—'}</td></tr>)}</tbody></table></div></div>})}</div>}
    </section>

    <section className="mt-14 pb-12"><SectionHeading eyebrow="Audit trail" title="Trazabilidad financiera" description="Cada doble check, emisión y conciliación relevante deja rastro para no perder el contexto de cambios." count={bundle.audit_events.length}/>{bundle.audit_events.length===0?<EmptyState>Sin eventos de auditoría.</EmptyState>:<div className="space-y-2">{bundle.audit_events.slice(0,50).map((event)=><div key={String(event.audit_event_id)} className={`${adminPanel} flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between`}><div><p className="text-sm font-semibold text-slate-900">{String(event.action)}</p><p className="text-xs text-slate-500">{String(event.entity_type)} · {String(event.entity_id)}</p></div><p className="text-xs text-slate-400">{new Date(String(event.occurred_at)).toLocaleString('es-ES')}</p></div>)}</div>}
    </section>
  </AdminShell>
}
