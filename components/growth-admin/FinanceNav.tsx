import Link from 'next/link'

const modules = [
  { href:'/growth-admin/finance', label:'Resumen', description:'KPIs, caja, fiscalidad y alertas' },
  { href:'/growth-admin/finance/invoices', label:'Facturación', description:'Clientes, borradores, revisión y emisión' },
  { href:'/growth-admin/finance/expenses', label:'Gastos', description:'Manual + detección semanal desde Gmail' },
  { href:'/growth-admin/finance/cash', label:'Caja y banco', description:'Cobros, pagos y conciliación' },
  { href:'/growth-admin/finance/accounting', label:'Contabilidad', description:'Asientos, IVA, IRPF y trazabilidad' },
  { href:'/growth-admin/finance/reports', label:'Informes', description:'Mes, trimestre, semestre y año' },
  { href:'/growth-admin/finance/integrations', label:'Integraciones', description:'Drive, Gmail, Revolut y automatizaciones' },
]

export default function FinanceNav({active}:{active:string}){
  return <nav className="mb-8 grid gap-2 sm:grid-cols-2 xl:grid-cols-7">
    {modules.map((item)=>{
      const selected=active===item.href
      return <Link key={item.href} href={item.href} prefetch={false} className={`rounded-xl border px-3 py-3 transition hover:-translate-y-0.5 hover:shadow-sm ${selected?'border-emerald-300 bg-emerald-50 text-emerald-900':'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>
        <span className="block text-xs font-semibold">{item.label}</span>
        <span className="mt-1 block text-[10px] leading-4 opacity-70">{item.description}</span>
      </Link>
    })}
  </nav>
}
