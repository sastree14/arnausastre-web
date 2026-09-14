import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, EmptyState, PageHeader, SectionHeading, StatCard, adminButtonPrimary, adminInput, adminPanel, statusTone } from '@/components/growth-admin/AdminUi'
import { getOpportunities, getTasks, getTopCompanies, isGrowthAdminAuthenticated, queryGrowthTable } from '@/lib/growth-admin'

export const dynamic='force-dynamic'
export const revalidate=0

type Project={project_id:string;company_id?:string|null;opportunity_id?:string|null;name:string;status:string;owner?:string;start_date?:string;end_date?:string;budget:number|string;currency:string;created_at?:string}

function OpsModule({ href, title, description, status, tone='violet' }: { href?:string; title:string; description:string; status:string; tone?:'violet'|'blue'|'green'|'amber'|'slate' }) {
  const body=<div className={`${adminPanel} h-full p-5 transition ${href?'hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md':''}`}><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold text-slate-950">{title}</h3><Badge tone={tone}>{status}</Badge></div><p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>{href&&<p className="mt-5 text-xs font-semibold text-violet-700">Abrir →</p>}</div>
  return href?<a href={href}>{body}</a>:body
}

export default async function OperationsPage(){
  if(!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const [tasks,projects,companies,opportunities]=await Promise.all([getTasks(),queryGrowthTable<Project>('operations_projects',{order:'created_at.desc',limit:'250'}),getTopCompanies(),getOpportunities()])
  const companyById=new Map(companies.map(c=>[c.company_id,c]))
  const openTasks=tasks.filter(t=>!['completed','done','executed'].includes(t.status))
  const failed=tasks.filter(t=>t.status==='failed')
  const operator=tasks.filter(t=>t.type.startsWith('OPERATOR_'))

  return <AdminShell active="operations">
    <PageHeader eyebrow="Cuadro de Mando Integral · Operaciones" title="Operaciones" description="Delivery, proyectos, tareas, automatizaciones, knowledge, Google Drive, SOPs, plantillas e integraciones. Es la infraestructura interna que permite ejecutar lo vendido y mantener ordenada la empresa."/>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Proyectos" value={projects.length}/><StatCard label="Tareas abiertas" value={openTasks.length} tone="blue"/><StatCard label="Operator runs" value={operator.length} tone="violet"/><StatCard label="Fallos" value={failed.length} tone={failed.length?'amber':'green'}/></div>

    <section className="mt-12" id="knowledge">
      <SectionHeading eyebrow="Mapa operativo" title="Módulos de Operaciones" description="Algunos módulos son enlaces o procesos manuales por ahora. La estructura queda preparada sin forzar automatizaciones que todavía no aportan valor." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <OpsModule title="Delivery & proyectos" description="Paso de oportunidad ganada a proyecto, owner, fechas, presupuesto, ejecución y posteriormente facturación." status="Activo" tone="green" />
        <OpsModule title="Tareas & workflows" description="Cola operativa, workers, automatizaciones y trazabilidad de inputs/outputs de agentes y procesos." status="Activo" tone="blue" />
        <OpsModule href="/growth-admin/system" title="Integraciones & sistema" description="LinkedIn, GA4, Apollo, Calendly y salud de los conectores. Cada integración debe alimentar un proceso concreto." status="Activo / roadmap" tone="violet" />
        <OpsModule href="https://drive.google.com/" title="Google Drive & Knowledge" description="Repositorio documental principal para manuales, propuestas, presentaciones, documentación, entregables y conocimiento interno." status="Manual" tone="amber" />
        <OpsModule title="Manuales & SOPs" description="Procesos repetibles, checklists, estándares de delivery y documentación de cómo se trabaja. Se guardan en Drive y se enlazarán desde aquí." status="Manual" tone="amber" />
        <OpsModule title="Assets & plantillas" description="Plantillas de propuestas, budgets, PowerPoints, informes, documentos comerciales y materiales internos reutilizables." status="Manual" tone="amber" />
      </div>
    </section>

    <section className="mt-12 rounded-3xl border border-violet-100 bg-violet-50/60 p-5 md:p-7"><SectionHeading eyebrow="Delivery" title="Crear proyecto" description="Cada proyecto puede vincularse a cliente y oportunidad para mantener continuidad desde venta hasta ejecución y facturación."/><form action="/api/growth-admin/project" method="post" className={`${adminPanel} grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4`}><input name="name" required placeholder="Nombre del proyecto" className={adminInput}/><select name="company_id" className={adminInput}><option value="">Cliente</option>{companies.map(c=><option key={c.company_id} value={c.company_id}>{c.name}</option>)}</select><select name="opportunity_id" className={adminInput}><option value="">Oportunidad</option>{opportunities.map(o=><option key={o.opportunity_id} value={o.opportunity_id}>{o.name}</option>)}</select><input name="owner" placeholder="Owner" className={adminInput}/><input type="date" name="start_date" className={adminInput}/><input type="date" name="end_date" className={adminInput}/><input name="budget" placeholder="Budget" className={adminInput}/><div className="flex gap-2"><select name="status" className={`min-w-0 flex-1 ${adminInput}`}><option value="planned">Planned</option><option value="active">Active</option><option value="paused">Paused</option></select><button className={adminButtonPrimary}>Crear</button></div></form></section>

    <section className="mt-14"><SectionHeading eyebrow="Portfolio" title="Proyectos" count={projects.length}/>{projects.length===0?<EmptyState>No hay proyectos en el sistema todavía.</EmptyState>:<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.map(p=><article key={p.project_id} className={`${adminPanel} p-5`}><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-slate-950">{p.name}</p><p className="mt-1 text-xs text-slate-500">{p.company_id?companyById.get(p.company_id)?.name||'Cliente':'Interno'} · {p.owner||'Sin owner'}</p></div><Badge tone={statusTone(p.status)}>{p.status}</Badge></div><div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500"><span>{p.start_date||'—'} → {p.end_date||'—'}</span><span className="text-right font-medium text-slate-700">{Number(p.budget||0).toLocaleString('es-ES')} {p.currency}</span></div></article>)}</div>}</section>

    <section className="mt-14"><SectionHeading eyebrow="Rutina operativa" title="Checklist semanal"/><div className={`${adminPanel} grid gap-3 p-6 md:grid-cols-2 xl:grid-cols-4`}>{['Revisar proyectos, bloqueos y próximos hitos','Revisar tareas fallidas o atascadas','Actualizar documentación/SOPs relevantes','Ordenar entregables y archivos en Drive','Comprobar integraciones críticas','Revisar capacidad y carga de trabajo','Identificar tareas repetitivas automatizables','Archivar o cerrar procesos terminados'].map(item=><div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600"><span className="mr-2 text-violet-600">□</span>{item}</div>)}</div></section>

    <section className="mt-14 pb-12"><SectionHeading eyebrow="Automation" title="Tareas y agentes" description="Cada acción manual o automática conserva input, output y estado para poder auditar el trabajo del sistema." count={tasks.length}/><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"><table className="min-w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Inputs</th><th className="px-4 py-3">Outputs</th><th className="px-4 py-3">Creada</th></tr></thead><tbody>{tasks.slice(0,100).map(t=><tr key={t.task_id} className="border-t border-slate-200"><td className="px-4 py-3"><Badge tone={statusTone(t.status)}>{t.status}</Badge></td><td className="px-4 py-3 font-medium text-slate-700">{t.type}</td><td className="max-w-sm px-4 py-3 text-slate-500"><span className="line-clamp-2">{JSON.stringify(t.inputs||{})}</span></td><td className="max-w-sm px-4 py-3 text-slate-500"><span className="line-clamp-2">{JSON.stringify(t.outputs||{})}</span></td><td className="px-4 py-3 text-slate-500">{t.created_at||'—'}</td></tr>)}</tbody></table></div></section>
  </AdminShell>
}
