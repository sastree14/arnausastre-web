import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, PageHeader, SectionHeading, StatCard, statusTone } from '@/components/growth-admin/AdminUi'
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
  const actionableVisuals = content.filter((item) => !item.visual_path && ['draft', 'needs_review', 'approved', 'scheduled'].includes(item.status) && item.content_type !== 'linkedin_post' ? true : (!item.visual_path && ['draft', 'needs_review', 'approved', 'scheduled'].includes(item.status) && item.status !== 'alternate'))
  const scheduled = content.filter((item) => item.scheduled_at && ['approved', 'scheduled'].includes(item.status))
  const published = content.filter((item) => item.status === 'published')
  const openTasks = tasks.filter((task) => !['completed', 'done', 'executed'].includes(task.status))
  const recentOperatorTasks = tasks.filter((task) => task.type.startsWith('OPERATOR_')).slice(0, 6)

  return <AdminShell active="home">
    <PageHeader
      eyebrow="SC-Analytics Operating System"
      title="Centro de Mando"
      description="Resumen ejecutivo de crecimiento, contenido, CRM, analytics y operaciones. Cada módulo tiene ahora su propia pantalla; este inicio sirve para decidir qué requiere atención."
      actions={<><a href="/growth-admin/content" className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">Crear contenido</a><a href="/growth-admin/crm" className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300">CRM</a><form action="/api/growth-admin/logout" method="post"><button className="rounded-lg border border-slate-800 px-4 py-2.5 text-sm text-slate-500">Salir</button></form></>}
    />

    {params.queued && <div className="mb-6 rounded-xl border border-sky-900 bg-sky-950/30 px-4 py-3 text-sm text-sky-200">Acción enviada a la cola operativa. El worker la procesa como máximo en unos minutos y conservará el resultado en Tareas.</div>}

    <SectionHeading eyebrow="Ahora mismo" title="Qué necesita tu atención" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Pendientes" value={approvals.length} note="Aprobación humana" tone="amber" href="/growth-admin/approvals" />
      <StatCard label="Visual pendiente" value={actionableVisuals.length} note="Piezas realmente accionables" tone="blue" href="/growth-admin/content?filter=visual" />
      <StatCard label="Programadas" value={scheduled.length} note="Con fecha futura" tone="green" href="/growth-admin/calendar" />
      <StatCard label="Acciones comerciales" value={readyActions.length} note="Connect / follow / outreach" tone="violet" href="/growth-admin/crm" />
      <StatCard label="Tareas abiertas" value={openTasks.length} note="Automatización y operadores" href="/growth-admin/operations" />
    </div>

    <div className="mt-8 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Creación manual</p><h2 className="mt-2 text-xl font-semibold text-white">Generar contenido sin entrar en GitHub</h2></div><Badge tone="green">cola 5 min</Badge></div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <form action="/api/growth-admin/operator-task" method="post" className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <input type="hidden" name="action" value="editorial_run"/><input type="hidden" name="return_to" value="/growth-admin"/>
            <p className="text-sm font-semibold text-white">Buscar oportunidades ahora</p><p className="mt-1 text-xs leading-5 text-slate-500">Brave → evaluación → research → brief → variantes.</p>
            <textarea name="theme_hint" placeholder="Tema opcional: pricing retail, riesgo bancario, automatización..." className="mt-4 min-h-20 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200" />
            <div className="mt-3 flex gap-2"><input type="number" name="max_signals" defaultValue="30" className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"/><input type="number" name="max_briefs" defaultValue="1" className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"/><button className="ml-auto rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950">Generar</button></div>
          </form>
          <form action="/api/growth-admin/operator-task" method="post" className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <input type="hidden" name="action" value="editorial_url"/><input type="hidden" name="return_to" value="/growth-admin"/>
            <p className="text-sm font-semibold text-white">Crear desde una URL</p><p className="mt-1 text-xs leading-5 text-slate-500">La fuente entra en el mismo pipeline editorial y conserva evidencia.</p>
            <input name="url" type="url" required placeholder="https://..." className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200" />
            <input name="title" placeholder="Título opcional" className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200" />
            <button className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950">Investigar y generar</button>
          </form>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Objetivo semanal</p>
        {currentPlan ? <><p className="mt-3 text-lg font-semibold text-white">{currentPlan.primary_goal}</p><div className="mt-4 flex flex-wrap gap-2"><Badge>{currentPlan.week_start}</Badge>{currentPlan.commercial_focus?.channel && <Badge tone="violet">{currentPlan.commercial_focus.channel}</Badge>}{currentPlan.content_focus?.objective && <Badge tone="blue">{currentPlan.content_focus.objective}</Badge>}</div></> : <p className="mt-3 text-sm text-slate-600">Aún no hay plan semanal cargado.</p>}
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl border border-slate-800 p-3"><p className="text-xl font-semibold">{published.length}</p><p className="text-xs text-slate-500">publicados</p></div><div className="rounded-xl border border-slate-800 p-3"><p className="text-xl font-semibold">{opportunities.length}</p><p className="text-xs text-slate-500">oportunidades</p></div><div className="rounded-xl border border-slate-800 p-3"><p className="text-xl font-semibold">{meetings.length}</p><p className="text-xs text-slate-500">reuniones CRM</p></div><div className="rounded-xl border border-slate-800 p-3"><p className="text-xl font-semibold">{webAnalytics.length}</p><p className="text-xs text-slate-500">filas analytics web</p></div></div>
      </section>
    </div>

    <div className="mt-8 grid gap-5 lg:grid-cols-3">
      <a href="/growth-admin/content" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-sky-700"><p className="text-sm font-semibold text-white">Contenido</p><p className="mt-2 text-xs leading-5 text-slate-500">Research, drafts, previews, Visual Studio, publicación e historial.</p></a>
      <a href="/growth-admin/crm" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-violet-700"><p className="text-sm font-semibold text-white">CRM y prospecting</p><p className="mt-2 text-xs leading-5 text-slate-500">Empresas, personas, mensajes, oportunidades, interacciones y reuniones.</p></a>
      <a href="/growth-admin/analytics" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-emerald-700"><p className="text-sm font-semibold text-white">Analytics</p><p className="mt-2 text-xs leading-5 text-slate-500">LinkedIn, GA4, atribución y aprendizaje editorial.</p></a>
    </div>

    <section className="mt-10">
      <SectionHeading eyebrow="Automatización" title="Últimas acciones operativas" count={recentOperatorTasks.length} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{recentOperatorTasks.length === 0 ? <div className="text-sm text-slate-600">Todavía no hay acciones iniciadas desde el nuevo Control Center.</div> : recentOperatorTasks.map((task) => <div key={task.task_id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-white">{task.type.replace('OPERATOR_', '').replaceAll('_', ' ')}</p><Badge tone={statusTone(task.status)}>{task.status}</Badge></div>{task.outputs && Object.keys(task.outputs).length > 0 && <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-500">{JSON.stringify(task.outputs)}</p>}</div>)}</div>
    </section>

    <section className="mt-10 pb-12">
      <SectionHeading eyebrow="Estado" title="Sistema conectado" />
      <div className="grid gap-4 md:grid-cols-4"><StatCard label="LinkedIn" value={linkedin.connected ? 'OK' : 'Atención'} note={linkedinConnection?.display_name || 'No conectado'} tone={linkedin.connected ? 'green' : 'amber'} href="/growth-admin/system"/><StatCard label="Empresas" value={companies.length} note={`${people.length} personas`} href="/growth-admin/crm"/><StatCard label="Interacciones" value={interactions.length} note={`${readyActions.length} por ejecutar`} href="/growth-admin/crm"/><StatCard label="Métricas legacy" value={metrics.length} note="Nueva capa en Analytics" href="/growth-admin/analytics"/></div>
    </section>
  </AdminShell>
}
