import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, EmptyState, PageHeader, SectionHeading, StatCard, adminButtonPrimary, adminInput, adminPanel, statusTone } from '@/components/growth-admin/AdminUi'
import { getOpportunities, getTasks, getTopCompanies, isGrowthAdminAuthenticated, queryGrowthTable } from '@/lib/growth-admin'

export const dynamic='force-dynamic'
export const revalidate=0

type Project={project_id:string;company_id?:string|null;opportunity_id?:string|null;name:string;status:string;owner?:string;start_date?:string;end_date?:string;budget:number|string;currency:string;created_at?:string}

export default async function OperationsPage(){
  if(!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const [tasks,projects,companies,opportunities]=await Promise.all([getTasks(),queryGrowthTable<Project>('operations_projects',{order:'created_at.desc',limit:'250'}),getTopCompanies(),getOpportunities()])
  const companyById=new Map(companies.map(c=>[c.company_id,c]))
  const openTasks=tasks.filter(t=>!['completed','done','executed'].includes(t.status))
  const failed=tasks.filter(t=>t.status==='failed')
  const operator=tasks.filter(t=>t.type.startsWith('OPERATOR_'))

  return <AdminShell active="operations">
    <PageHeader eyebrow="CRM · Operations" title="Operaciones" description="Delivery y automatización forman parte del mismo CRM: una oportunidad ganada se convierte en proyecto, ejecución y después en resultados y finanzas."/>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Proyectos" value={projects.length}/><StatCard label="Tareas abiertas" value={openTasks.length} tone="blue"/><StatCard label="Operator runs" value={operator.length} tone="violet"/><StatCard label="Fallos" value={failed.length} tone={failed.length?'amber':'green'}/></div>

    <section className="mt-12 rounded-3xl border border-indigo-100 bg-indigo-50/60 p-5 md:p-7"><SectionHeading eyebrow="CRM · Delivery" title="Crear proyecto" description="Cada proyecto puede vincularse a cliente y oportunidad para mantener continuidad desde venta hasta ejecución y facturación."/><form action="/api/growth-admin/project" method="post" className={`${adminPanel} grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4`}><input name="name" required placeholder="Nombre del proyecto" className={adminInput}/><select name="company_id" className={adminInput}><option value="">Cliente</option>{companies.map(c=><option key={c.company_id} value={c.company_id}>{c.name}</option>)}</select><select name="opportunity_id" className={adminInput}><option value="">Oportunidad</option>{opportunities.map(o=><option key={o.opportunity_id} value={o.opportunity_id}>{o.name}</option>)}</select><input name="owner" placeholder="Owner" className={adminInput}/><input type="date" name="start_date" className={adminInput}/><input type="date" name="end_date" className={adminInput}/><input name="budget" placeholder="Budget" className={adminInput}/><div className="flex gap-2"><select name="status" className={`min-w-0 flex-1 ${adminInput}`}><option value="planned">Planned</option><option value="active">Active</option><option value="paused">Paused</option></select><button className={adminButtonPrimary}>Crear</button></div></form></section>

    <section className="mt-14"><SectionHeading eyebrow="CRM · Portfolio" title="Proyectos" count={projects.length}/>{projects.length===0?<EmptyState>No hay proyectos en el sistema todavía.</EmptyState>:<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.map(p=><article key={p.project_id} className={`${adminPanel} p-5`}><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-slate-950">{p.name}</p><p className="mt-1 text-xs text-slate-500">{p.company_id?companyById.get(p.company_id)?.name||'Cliente':'Interno'} · {p.owner||'Sin owner'}</p></div><Badge tone={statusTone(p.status)}>{p.status}</Badge></div><div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500"><span>{p.start_date||'—'} → {p.end_date||'—'}</span><span className="text-right font-medium text-slate-700">{Number(p.budget||0).toLocaleString('es-ES')} {p.currency}</span></div></article>)}</div>}</section>

    <section className="mt-14 pb-12"><SectionHeading eyebrow="CRM · Automation" title="Tareas y agentes" description="Cada acción manual o automática conserva input, output y estado para poder auditar el trabajo del sistema." count={tasks.length}/><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"><table className="min-w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Inputs</th><th className="px-4 py-3">Outputs</th><th className="px-4 py-3">Creada</th></tr></thead><tbody>{tasks.slice(0,100).map(t=><tr key={t.task_id} className="border-t border-slate-200"><td className="px-4 py-3"><Badge tone={statusTone(t.status)}>{t.status}</Badge></td><td className="px-4 py-3 font-medium text-slate-700">{t.type}</td><td className="max-w-sm px-4 py-3 text-slate-500"><span className="line-clamp-2">{JSON.stringify(t.inputs||{})}</span></td><td className="max-w-sm px-4 py-3 text-slate-500"><span className="line-clamp-2">{JSON.stringify(t.outputs||{})}</span></td><td className="px-4 py-3 text-slate-500">{t.created_at||'—'}</td></tr>)}</tbody></table></div></section>
  </AdminShell>
}
