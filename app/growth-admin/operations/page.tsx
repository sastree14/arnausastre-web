import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, EmptyState, PageHeader, SectionHeading, StatCard, statusTone } from '@/components/growth-admin/AdminUi'
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
    <PageHeader eyebrow="Delivery & Automation" title="Operaciones" description="Proyectos, tareas automáticas y ejecución interna. Esta capa enlaza oportunidades comerciales con delivery y después con Finance."/>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Proyectos" value={projects.length}/><StatCard label="Tareas abiertas" value={openTasks.length} tone="blue"/><StatCard label="Operator runs" value={operator.length} tone="violet"/><StatCard label="Fallos" value={failed.length} tone={failed.length?'amber':'green'}/></div>

    <section className="mt-10"><SectionHeading eyebrow="Delivery" title="Crear proyecto"/><form action="/api/growth-admin/project" method="post" className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 md:grid-cols-2 xl:grid-cols-4"><input name="name" required placeholder="Nombre del proyecto" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"/><select name="company_id" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"><option value="">Cliente</option>{companies.map(c=><option key={c.company_id} value={c.company_id}>{c.name}</option>)}</select><select name="opportunity_id" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"><option value="">Oportunidad</option>{opportunities.map(o=><option key={o.opportunity_id} value={o.opportunity_id}>{o.name}</option>)}</select><input name="owner" placeholder="Owner" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"/><input type="date" name="start_date" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"/><input type="date" name="end_date" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"/><input name="budget" placeholder="Budget" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"/><div className="flex gap-2"><select name="status" className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"><option value="planned">Planned</option><option value="active">Active</option><option value="paused">Paused</option></select><button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950">Crear</button></div></form></section>

    <section className="mt-12"><SectionHeading eyebrow="Portfolio" title="Proyectos" count={projects.length}/>{projects.length===0?<EmptyState>No hay proyectos en el sistema todavía.</EmptyState>:<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{projects.map(p=><article key={p.project_id} className="rounded-xl border border-slate-800 bg-slate-900/45 p-4"><div className="flex items-start justify-between"><div><p className="font-medium text-white">{p.name}</p><p className="mt-1 text-xs text-slate-600">{p.company_id?companyById.get(p.company_id)?.name||'Cliente':'Interno'} · {p.owner||'Sin owner'}</p></div><Badge tone={statusTone(p.status)}>{p.status}</Badge></div><div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500"><span>{p.start_date||'—'} → {p.end_date||'—'}</span><span className="text-right">{Number(p.budget||0).toLocaleString('es-ES')} {p.currency}</span></div></article>)}</div>}</section>

    <section className="mt-12 pb-12"><SectionHeading eyebrow="Automation" title="Tareas y agentes" description="Cada acción manual/automática conserva input, output y estado; no desaparece después de ejecutarse." count={tasks.length}/><div className="overflow-x-auto rounded-xl border border-slate-800"><table className="min-w-full text-left text-xs"><thead className="bg-slate-950 text-slate-600"><tr><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Inputs</th><th className="px-4 py-3">Outputs</th><th className="px-4 py-3">Creada</th></tr></thead><tbody>{tasks.slice(0,100).map(t=><tr key={t.task_id} className="border-t border-slate-800 bg-slate-900/40"><td className="px-4 py-3"><Badge tone={statusTone(t.status)}>{t.status}</Badge></td><td className="px-4 py-3 text-slate-300">{t.type}</td><td className="max-w-sm px-4 py-3 text-slate-600"><span className="line-clamp-2">{JSON.stringify(t.inputs||{})}</span></td><td className="max-w-sm px-4 py-3 text-slate-600"><span className="line-clamp-2">{JSON.stringify(t.outputs||{})}</span></td><td className="px-4 py-3 text-slate-600">{t.created_at||'—'}</td></tr>)}</tbody></table></div></section>
  </AdminShell>
}
