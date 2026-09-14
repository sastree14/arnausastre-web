import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, SectionHeading, adminPanel } from '@/components/growth-admin/AdminUi'
import { getMeetings, getOpportunities, getPeople, getReadyManualActions, getRecentContent, getTopCompanies, isGrowthAdminAuthenticated } from '@/lib/growth-admin'

function ModuleCard({ href, title, description, status = 'Disponible', tone = 'violet' }: { href?: string; title: string; description: string; status?: string; tone?: 'violet' | 'blue' | 'green' | 'amber' | 'slate' }) {
  const body = <div className={`${adminPanel} h-full p-5 transition ${href ? 'hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md' : ''}`}>
    <div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold text-slate-950">{title}</h3><Badge tone={tone}>{status}</Badge></div>
    <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    {href && <p className="mt-5 text-xs font-semibold text-indigo-600">Abrir módulo →</p>}
  </div>
  return href ? <a href={href}>{body}</a> : body
}

export default async function CommercialPage() {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const [companies, people, opportunities, meetings, actions, content] = await Promise.all([
    getTopCompanies(), getPeople(), getOpportunities(), getMeetings(), getReadyManualActions(), getRecentContent(),
  ])
  const activeContent = content.filter((item) => !['published', 'rejected', 'failed', 'superseded_test'].includes(item.status))

  return <AdminShell active="commercial">
    <header className="overflow-hidden rounded-[2rem] border border-indigo-950 bg-indigo-950 text-white shadow-sm">
      <div className="grid gap-8 px-6 py-9 md:px-10 md:py-12 xl:grid-cols-[1fr_auto] xl:items-end">
        <div className="max-w-4xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-300">Cuadro de Mando Integral · Comercial</p>
          <h1 className="mt-4 text-4xl md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>Comercial</h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-indigo-100/80 md:text-base">Todo lo que genera y desarrolla negocio: cuentas, personas, oportunidades, discovery, propuestas, mercado, competencia y contenido que alimenta el funnel.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl border border-white/10 bg-white/[0.05] p-3"><p className="text-indigo-200/70">Oportunidades</p><p className="mt-1 text-2xl font-semibold">{opportunities.length}</p></div><div className="rounded-xl border border-white/10 bg-white/[0.05] p-3"><p className="text-indigo-200/70">Reuniones</p><p className="mt-1 text-2xl font-semibold">{meetings.length}</p></div></div>
      </div>
    </header>

    <section className="mt-8">
      <SectionHeading eyebrow="Módulos" title="Ciclo comercial completo" description="La automatización no es un requisito. Los procesos que hoy haces manualmente quedan ubicados y visibles para que el sistema escale sin inventar integraciones." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ModuleCard href="/growth-admin/crm" title="Pipeline, empresas y personas" description={`${companies.length} empresas, ${people.length} personas y ${actions.length} acciones preparadas. Accounts, contactos, reuniones y oportunidades en una sola vista.`} />
        <ModuleCard href="/growth-admin/crm" title="Prospecting & follow-up" description="Búsqueda, priorización y seguimiento de leads. El contacto por email, LinkedIn, portales, partners o referencias puede seguir siendo manual." tone="blue" />
        <ModuleCard href="/growth-admin/content" title="Editorial & contenido" description={`${activeContent.length} piezas activas. Research, artículos, LinkedIn, CTA, visuals y aprendizaje comercial forman parte del área Comercial.`} tone="green" />
        <ModuleCard href="/growth-admin/calendar" title="Calendario y distribución" description="Planificación de publicaciones, reprogramación, publicación inmediata e histórico de contenido." tone="blue" />
        <ModuleCard href="/growth-admin/approvals" title="Aprobaciones" description="Human-in-the-loop para contenido y acciones externas. Autorizar no equivale a ejecutar." tone="amber" />
        <ModuleCard href="/growth-admin/research" title="Research editorial" description="Señales, evidencia, briefs e ideas que alimentan publicaciones y artículos con criterio de negocio." />
      </div>
    </section>

    <section className="mt-12" id="competition">
      <SectionHeading eyebrow="Mercado" title="Competencia y oportunidades" description="Este bloque existe desde ya aunque la investigación siga siendo manual. La prioridad es tener un lugar estable donde revisar y documentar el mercado." />
      <div className="grid gap-5 xl:grid-cols-2">
        <div className={`${adminPanel} p-6`}><div className="flex items-center justify-between"><h3 className="text-xl font-semibold text-slate-950">Competencia</h3><Badge>Manual</Badge></div><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600"><li>- Competidores directos e indirectos.</li><li>- Servicios, pricing, posicionamiento y casos.</li><li>- Contenido, campañas y cambios relevantes.</li><li>- Fortalezas, debilidades y huecos de mercado.</li><li>- Revisión breve semanal y revisión profunda mensual.</li></ul></div>
        <div className={`${adminPanel} p-6`}><div className="flex items-center justify-between"><h3 className="text-xl font-semibold text-slate-950">Fuentes de oportunidades</h3><Badge>Manual</Badge></div><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600"><li>- Upwork y plataformas especializadas.</li><li>- Outreach directo a empresas objetivo.</li><li>- Partners, recruitment/staffing y canales B2B.</li><li>- LinkedIn personal y página de SC-Analytics.</li><li>- Referencias, networking y oportunidades inbound.</li></ul></div>
      </div>
    </section>

    <section className="mt-12" id="proposals">
      <SectionHeading eyebrow="Conversión" title="Discovery, proposals y presupuesto" description="De momento la generación de documentos puede seguir en Google Drive/Docs/Slides. El CRM solo fija la estructura y el punto del proceso donde deben existir." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ModuleCard title="Discovery call" description="Identificar oportunidades, cuellos de botella, déficits, riesgos, escalabilidad y mejoras antes de proponer una solución." status="Proceso" tone="green" />
        <ModuleCard title="Qualification" description="Problema, impacto, urgencia, presupuesto, decisor, datos/sistemas y siguiente paso comercial." status="Proceso" tone="blue" />
        <ModuleCard title="Proposal builder" description="Estructura futura para alcance, entregables, fases, timings, supuestos, riesgos y condiciones." status="Manual" tone="amber" />
        <ModuleCard title="Budget helper" description="Estimación de horas, perfiles, margen, costes, contingencia y precio final. Se automatizará solo cuando aporte valor." status="Manual" tone="amber" />
      </div>
    </section>

    <section className="mt-12 pb-12">
      <SectionHeading eyebrow="Rutina comercial" title="Checklist semanal" />
      <div className={`${adminPanel} grid gap-3 p-6 md:grid-cols-2 xl:grid-cols-4`}>
        {['Revisar pipeline y siguientes acciones', 'Buscar nuevas oportunidades y cuentas', 'Revisar propuestas y follow-ups', 'Comprobar discovery calls próximas', 'Mirar competencia y mercado', 'Revisar rendimiento de contenido', 'Actualizar contactos/reuniones relevantes', 'Elegir prioridades comerciales de la semana'].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600"><span className="mr-2 text-indigo-600">□</span>{item}</div>)}
      </div>
    </section>
  </AdminShell>
}
