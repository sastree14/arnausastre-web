import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, PageHeader, SectionHeading, StatCard, adminButtonPrimary, adminButtonSecondary, adminInput, adminPanel, statusTone } from '@/components/growth-admin/AdminUi'
import {
  getInteractions,
  getMeetings,
  getMetrics,
  getOpportunities,
  getPendingApprovals,
  getPeople,
  getReadyManualActions,
  getRecentContent,
  getRecentPlans,
  getTasks,
  getTopCompanies,
  getWebAnalyticsDaily,
  isGrowthAdminAuthenticated,
} from '@/lib/growth-admin'
import { getLinkedInConnection, linkedInConnectionStatus } from '@/lib/growth-integrations'

export default async function GrowthAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params = await searchParams
  const [approvals, readyActions, content, companies, people, tasks, interactions, metrics, plans, linkedinConnection, opportunities, meetings, webAnalytics] = await Promise.all([
    getPendingApprovals(), getReadyManualActions(), getRecentContent(), getTopCompanies(), getPeople(), getTasks(), getInteractions(), getMetrics(), getRecentPlans(), getLinkedInConnection(), getOpportunities(), getMeetings(), getWebAnalyticsDaily(),
  ])
  const linkedin = linkedInConnectionStatus(linkedinConnection)
  const currentPlan = plans[0]
  const actionableVisuals = content.filter((item) => !item.visual_path && ['draft', 'needs_review', 'approved', 'scheduled'].includes(item.status) && item.status !== 'alternate')
  const scheduled = content.filter((item) => item.scheduled_at && ['approved', 'scheduled'].includes(item.status))
  const published = content.filter((item) => item.status === 'published')
  const openTasks = tasks.filter((task) => !['completed', 'done', 'executed'].includes(task.status))
  const recentOperatorTasks = tasks.filter((task) => task.type.startsWith('OPERATOR_')).slice(0, 6)

  return <AdminShell active="home">
    <PageHeader
      eyebrow="SC-Analytics CRM · Business Operating System"
      title="Centro de Mando"
      description="El CRM es la capa central. Comercial, editorial, analytics, finanzas y operaciones son ramas conectadas del mismo sistema y comparten trazabilidad, datos y contexto de negocio."
      actions={<><a href="/growth-admin/crm" className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">Abrir comercial</a><a href="/growth-admin/content" className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white">Editorial</a><form action="/api/growth-admin/logout" method="post"><button className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300">Salir</button></form></>}
    />

    {params.queued && <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800">Acción enviada a la cola operativa. El worker la procesa y conservará el resultado en Tareas.</div>}

    <SectionHeading eyebrow="Ahora mismo" title="Qué necesita tu atención" description="Una vista ejecutiva del trabajo que requiere decisión humana dentro del CRM." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Pendientes" value={approvals.length} note="Aprobación humana" tone="amber" href="/growth-admin/approvals" />
      <StatCard label="Visual pendiente" value={actionableVisuals.length} note="Piezas accionables" tone="blue" href="/growth-admin/content?filter=visual" />
      <StatCard label="Programadas" value={scheduled.length} note="Con fecha futura" tone="green" href="/growth-admin/calendar" />
      <StatCard label="Acciones comerciales" value={readyActions.length} note="Follow / connect / outreach" tone="violet" href="/growth-admin/crm" />
      <StatCard label="Tareas abiertas" value={openTasks.length} note="Automatización y operadores" href="/growth-admin/operations" />
    </div>

    <section className="mt-10 rounded-3xl border border-indigo-100 bg-indigo-50/60 p-5 md:p-7">
      <SectionHeading eyebrow="CRM · Editorial" title="Crear contenido" description="La generación editorial forma parte del CRM porque su objetivo es atraer, educar, convertir y alimentar el funnel comercial." />
      <div className="grid gap-5 lg:grid-cols-2">
        <form action="/api/growth-admin/operator-task" method="post" className={`${adminPanel} p-5`}>
          <input type="hidden" name="action" value="editorial_run"/><input type="hidden" name="return_to" value="/growth-admin"/>
          <p className="text-sm font-semibold text-slate-950">Buscar oportunidades editoriales</p><p className="mt-2 text-xs leading-5 text-slate-500">Brave → evaluación → research → brief → variantes.</p>
          <textarea name="theme_hint" placeholder="Tema opcional: pricing retail, riesgo bancario, automatización..." className={`mt-4 min-h-24 w-full ${adminInput}`} />
          <div className="mt-3 flex flex-wrap gap-2"><input type="number" name="max_signals" defaultValue="30" className={`w-24 ${adminInput}`}/><input type="number" name="max_briefs" defaultValue="1" className={`w-20 ${adminInput}`}/><button className={`ml-auto ${adminButtonPrimary}`}>Generar</button></div>
        </form>
        <form action="/api/growth-admin/operator-task" method="post" className={`${adminPanel} p-5`}>
          <input type="hidden" name="action" value="editorial_url"/><input type="hidden" name="return_to" value="/growth-admin"/>
          <p className="text-sm font-semibold text-slate-950">Crear desde una URL</p><p className="mt-2 text-xs leading-5 text-slate-500">La fuente entra en el mismo pipeline editorial y conserva evidencia.</p>
          <input name="url" type="url" required placeholder="https://..." className={`mt-4 w-full ${adminInput}`} />
          <input name="title" placeholder="Título opcional" className={`mt-2 w-full ${adminInput}`} />
          <button className={`mt-3 ${adminButtonPrimary}`}>Investigar y generar</button>
        </form>
      </div>
    </section>

    <section className="mt-10">
      <SectionHeading eyebrow="CRM · Ramas" title="Una única arquitectura" description="No son aplicaciones separadas: cada módulo usa el mismo contexto de cliente, contenido, oportunidad, proyecto y resultado." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <a href="/growth-admin/crm" className={`${adminPanel} p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md`}><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Comercial</p><h3 className="mt-3 text-lg font-semibold text-slate-950">Accounts y pipeline</h3><p className="mt-2 text-sm leading-6 text-slate-500">Empresas, personas, conversaciones, reuniones y oportunidades.</p></a>
        <a href="/growth-admin/content" className={`${adminPanel} p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md`}><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Editorial</p><h3 className="mt-3 text-lg font-semibold text-slate-950">Contenido y distribución</h3><p className="mt-2 text-sm leading-6 text-slate-500">Research, briefs, posts, artículos, visuales, calendario y aprobación.</p></a>
        <a href="/growth-admin/analytics" className={`${adminPanel} p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md`}><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Intelligence</p><h3 className="mt-3 text-lg font-semibold text-slate-950">Analytics y atribución</h3><p className="mt-2 text-sm leading-6 text-slate-500">LinkedIn, GA4, SEO, funnel y aprendizaje editorial.</p></a>
        <a href="/growth-admin/finance" className={`${adminPanel} p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md`}><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Finance</p><h3 className="mt-3 text-lg font-semibold text-slate-950">Facturación y caja</h3><p className="mt-2 text-sm leading-6 text-slate-500">Facturas, cobros, gastos y futura contabilidad operativa.</p></a>
        <a href="/growth-admin/operations" className={`${adminPanel} p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md`}><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Operations</p><h3 className="mt-3 text-lg font-semibold text-slate-950">Delivery y automatización</h3><p className="mt-2 text-sm leading-6 text-slate-500">Proyectos, tareas, workers y ejecución.</p></a>
      </div>
    </section>

    <div className="mt-10 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <section className={`${adminPanel} p-6`}>
        <SectionHeading eyebrow="Automatización" title="Últimas acciones operativas" count={recentOperatorTasks.length} />
        <div className="grid gap-3 md:grid-cols-2">{recentOperatorTasks.length === 0 ? <div className="text-sm text-slate-500">Todavía no hay acciones iniciadas desde el CRM.</div> : recentOperatorTasks.map((task) => <div key={task.task_id} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-slate-950">{task.type.replace('OPERATOR_', '').replaceAll('_', ' ')}</p><Badge tone={statusTone(task.status)}>{task.status}</Badge></div>{task.outputs && Object.keys(task.outputs).length > 0 && <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-500">{JSON.stringify(task.outputs)}</p>}</div>)}</div>
      </section>
      <section className={`${adminPanel} p-6`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">Objetivo semanal</p>
        {currentPlan ? <><p className="mt-3 text-xl font-semibold text-slate-950">{currentPlan.primary_goal}</p><div className="mt-4 flex flex-wrap gap-2"><Badge>{currentPlan.week_start}</Badge>{currentPlan.commercial_focus?.channel && <Badge tone="violet">{currentPlan.commercial_focus.channel}</Badge>}{currentPlan.content_focus?.objective && <Badge tone="blue">{currentPlan.content_focus.objective}</Badge>}</div></> : <p className="mt-3 text-sm text-slate-500">Aún no hay plan semanal cargado.</p>}
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xl font-semibold text-slate-950">{published.length}</p><p className="text-xs text-slate-500">publicados</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xl font-semibold text-slate-950">{opportunities.length}</p><p className="text-xs text-slate-500">oportunidades</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xl font-semibold text-slate-950">{meetings.length}</p><p className="text-xs text-slate-500">reuniones</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xl font-semibold text-slate-950">{webAnalytics.length}</p><p className="text-xs text-slate-500">filas analytics web</p></div></div>
      </section>
    </div>

    <section className="mt-10 pb-12">
      <SectionHeading eyebrow="Estado" title="Sistema conectado" />
      <div className="grid gap-4 md:grid-cols-4"><StatCard label="LinkedIn" value={linkedin.connected ? 'OK' : 'Atención'} note={linkedinConnection?.display_name || 'No conectado'} tone={linkedin.connected ? 'green' : 'amber'} href="/growth-admin/system"/><StatCard label="Empresas" value={companies.length} note={`${people.length} personas`} href="/growth-admin/crm"/><StatCard label="Interacciones" value={interactions.length} note={`${readyActions.length} por ejecutar`} href="/growth-admin/crm"/><StatCard label="Métricas legacy" value={metrics.length} note="Nueva capa en Analytics" href="/growth-admin/analytics"/></div>
      <div className="mt-5"><a href="/growth-admin/system" className={adminButtonSecondary}>Revisar integraciones</a></div>
    </section>
  </AdminShell>
}
