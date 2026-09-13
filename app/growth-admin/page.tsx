import Image from 'next/image'
import { redirect } from 'next/navigation'
import {
  GrowthApprovalPayload,
  GrowthContentItem,
  getInteractions,
  getMetrics,
  getPendingApprovals,
  getPeople,
  getReadyManualActions,
  getRecentContent,
  getRecentEditorialBriefs,
  getRecentPlans,
  getTasks,
  getTopCompanies,
  isGrowthAdminAuthenticated,
} from '@/lib/growth-admin'
import { getLinkedInConnection, linkedInConnectionStatus } from '@/lib/growth-integrations'
import {
  addDaysToDateKey,
  controlCenterDateKey,
  formatCalendarDateKey,
  formatControlCenterDate,
  toControlCenterDateTimeLocal,
} from '@/lib/control-center-time'

function Badge({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'slate' | 'green' | 'amber' | 'blue' | 'violet' | 'rose' }) {
  const tones = {
    slate: 'border-slate-700 bg-slate-900 text-slate-300',
    green: 'border-emerald-800 bg-emerald-950/60 text-emerald-300',
    amber: 'border-amber-800 bg-amber-950/50 text-amber-300',
    blue: 'border-sky-800 bg-sky-950/50 text-sky-300',
    violet: 'border-violet-800 bg-violet-950/50 text-violet-300',
    rose: 'border-rose-900 bg-rose-950/40 text-rose-300',
  }
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${tones[tone]}`}>{children}</span>
}

function StatCard({ label, value, note, tone = 'slate', href }: { label: string; value: number | string; note?: string; tone?: 'slate' | 'blue' | 'amber' | 'green' | 'violet'; href?: string }) {
  const tones = {
    slate: 'border-slate-800 bg-slate-900/60',
    blue: 'border-sky-900/60 bg-sky-950/20',
    amber: 'border-amber-900/60 bg-amber-950/15',
    green: 'border-emerald-900/60 bg-emerald-950/15',
    violet: 'border-violet-900/60 bg-violet-950/20',
  }
  const body = <div className={`h-full rounded-2xl border p-5 transition ${tones[tone]} ${href ? 'hover:-translate-y-0.5 hover:border-slate-600' : ''}`}><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold text-white">{value}</p>{note && <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>}</div>
  return href ? <a href={href}>{body}</a> : body
}

function SectionHeading({ eyebrow, title, description, count }: { eyebrow: string; title: string; description?: string; count?: number | string }) {
  return <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p><h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2>{description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>}</div>{count !== undefined && <Badge>{count}</Badge>}</div>
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 p-7 text-center text-sm leading-6 text-slate-600">{children}</div>
}

function assetUrl(item: GrowthContentItem) {
  return item.visual_path?.startsWith('supabase://') ? `/api/growth-admin/asset?ref=${encodeURIComponent(item.visual_path)}` : null
}

function formatDate(value?: string | null, withTime = false) {
  return formatControlCenterDate(value, withTime)
}

function scheduleInputValue(value?: string | null) {
  return toControlCenterDateTimeLocal(value)
}

function statusTone(status: string): 'slate' | 'green' | 'amber' | 'blue' | 'violet' | 'rose' {
  if (status === 'published' || status === 'executed' || status === 'done') return 'green'
  if (status === 'approved' || status === 'scheduled') return 'blue'
  if (status === 'needs_review' || status === 'pending') return 'amber'
  if (status === 'rejected' || status === 'failed') return 'rose'
  return 'slate'
}

function publicationLabel(item: GrowthContentItem) {
  return item.content_type === 'article' ? 'Artículo web' : 'LinkedIn'
}

function ActionLinks({ payload }: { payload: GrowthApprovalPayload }) {
  const sources = Array.isArray(payload.source_urls) ? payload.source_urls : []
  return <div className="mt-4 flex flex-wrap gap-3 text-xs">
    {payload.person?.linkedin_url && <a className="font-medium text-sky-300 hover:text-sky-200" href={payload.person.linkedin_url} target="_blank" rel="noreferrer">Abrir LinkedIn ↗</a>}
    {!payload.person?.linkedin_url && typeof payload.linkedin_search_url === 'string' && payload.linkedin_search_url && <a className="text-sky-300 hover:text-sky-200" href={payload.linkedin_search_url} target="_blank" rel="noreferrer">Buscar en LinkedIn ↗</a>}
    {typeof payload.website === 'string' && payload.website && <a className="text-slate-400 hover:text-slate-200" href={payload.website} target="_blank" rel="noreferrer">Web empresa ↗</a>}
    {sources.slice(0, 4).map((url, index) => <a key={url} className="text-slate-400 hover:text-slate-200" href={url} target="_blank" rel="noreferrer">Fuente {index + 1} ↗</a>)}
  </div>
}

function ContentPreview({ item }: { item?: GrowthContentItem }) {
  if (!item) return null
  const image = assetUrl(item)
  return <div className="mt-5 grid gap-5 lg:grid-cols-[240px_1fr]">
    <div>
      {image ? <img src={image} alt={item.title} className="max-h-60 w-full rounded-xl border border-slate-800 bg-slate-950 object-contain" /> : <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-slate-700 p-5 text-center text-xs leading-5 text-slate-500">Todavía no hay visual adjuntado. Puedes publicar texto solo o abrir Visual Studio y crear uno.</div>}
      <div className="mt-3 flex flex-wrap gap-2"><Badge>{item.visual_type || 'sin visual'}</Badge><Badge>{(item.language || '—').toUpperCase()}</Badge>{item.quality_score && <Badge tone="violet">quality {Number(item.quality_score).toFixed(1)}</Badge>}</div>
    </div>
    <div className="max-h-60 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-5 text-sm leading-7 text-slate-300">{item.body}</div>
  </div>
}

function buildCalendarDays(content: GrowthContentItem[], days = 14) {
  const startKey = controlCenterDateKey(new Date())
  return Array.from({ length: days }, (_, index) => {
    const key = addDaysToDateKey(startKey, index)
    const items = content.filter((item) => controlCenterDateKey(item.scheduled_at || '') === key || controlCenterDateKey(item.published_at || '') === key)
    return { key, items, weekday: formatCalendarDateKey(key, 'weekday'), dateLabel: formatCalendarDateKey(key, 'date') }
  })
}

export default async function GrowthAdminPage() {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')

  const [approvals, readyActions, content, editorialBriefs, companies, people, tasks, interactions, metrics, plans, linkedinConnection] = await Promise.all([
    getPendingApprovals(), getReadyManualActions(), getRecentContent(), getRecentEditorialBriefs(), getTopCompanies(), getPeople(), getTasks(), getInteractions(), getMetrics(), getRecentPlans(), getLinkedInConnection(),
  ])

  const currentPlan = plans[0]
  const linkedin = linkedInConnectionStatus(linkedinConnection)
  const linkedinMeta = linkedinConnection?.metadata || {}
  const companyById = new Map(companies.map((company) => [company.company_id, company]))
  const contentById = new Map(content.map((item) => [item.content_id, item]))
  const publishApprovals = approvals.filter((approval) => ['publish_post', 'publish_article'].includes(approval.action_type))
  const scheduled = content.filter((item) => item.scheduled_at && ['approved', 'scheduled', 'published'].includes(item.status))
  const visuals = content.filter((item) => item.visual_path).slice(0, 12)
  const needsVisual = content.filter((item) => ['linkedin_post', 'article'].includes(item.content_type) && !item.visual_path && !['published', 'rejected', 'failed', 'superseded_test'].includes(item.status))
  const openTasks = tasks.filter((task) => !['done', 'completed', 'executed'].includes(task.status))
  const targetPeople = people.filter((person) => !['done', 'rejected', 'ignored'].includes(person.status || '')).slice(0, 20)
  const calendar = buildCalendarDays(content)
  const published = content.filter((item) => item.status === 'published')

  return (
    <main className="min-h-screen bg-[#050816] text-slate-100">
      <div className="mx-auto grid max-w-[1760px] lg:grid-cols-[280px_1fr]">
        <aside className="hidden min-h-screen border-r border-slate-800/80 bg-slate-950/90 p-6 lg:block">
          <div className="sticky top-6">
            <a href="/growth-admin" className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <Image src="/brand/logo-white.png" alt="SC-Analytics" width={210} height={70} className="h-14 w-48 object-contain object-left" priority />
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Control Center · privado</p>
            </a>

            <a href="/growth-admin/visual-studio" className="mt-4 flex items-center justify-between rounded-xl border border-sky-900/60 bg-sky-950/30 px-4 py-3 text-sm font-semibold text-sky-200 transition hover:border-sky-700"><span>Visual Studio</span><span>→</span></a>

            <nav className="mt-7 space-y-1 text-sm">
              {[['#overview', 'Inicio'], ['#calendar', 'Calendario editorial'], ['#approvals', 'Pendientes de aprobar'], ['#content', 'Publicaciones y visuals'], ['#outreach', 'Acciones comerciales'], ['#intelligence', 'Ideas y research'], ['#system', 'Sistema e integraciones']].map(([href, label]) => <a key={href} href={href} className="block rounded-lg px-3 py-2.5 text-slate-400 transition hover:bg-slate-900 hover:text-white">{label}</a>)}
            </nav>

            <div className="mt-7 rounded-xl border border-violet-900/50 bg-violet-950/20 p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300">Regla del sistema</p><p className="mt-2 text-xs leading-5 text-slate-500">Los agentes pueden investigar, redactar y preparar. Publicar, contactar o ejecutar una acción externa sigue pasando por tu control.</p></div>

            <div className="mt-7 border-t border-slate-800 pt-5"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">Próximos módulos</p><div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600"><span>Finance</span><span>Operations</span><span>Knowledge</span><span>Agents</span></div></div>
          </div>
        </aside>

        <div className="min-w-0 px-5 py-6 md:px-8 lg:px-10 lg:py-8">
          <header className="mb-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-sky-950/20 p-6 md:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2"><Badge tone="violet">PRIVADO</Badge><Badge tone={linkedin.connected ? 'green' : 'amber'}>LinkedIn {linkedin.connected ? 'conectado' : 'requiere atención'}</Badge></div>
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">SC-Analytics Operating System</p>
                <h1 className="mt-2 text-3xl font-semibold text-white md:text-5xl">Centro de Control</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Tu punto único para revisar qué han preparado los agentes, diseñar las piezas, aprobar lo importante, programar publicaciones y ejecutar las acciones manuales que todavía requieren tu intervención.</p>
              </div>
              <div className="flex flex-wrap gap-2"><a href="/growth-admin/visual-studio" className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">Crear / editar visual</a><a href="#calendar" className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300">Planificar contenido</a><a href="/" target="_blank" className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300">Ver web pública ↗</a><form action="/api/growth-admin/logout" method="post"><button type="submit" className="rounded-lg border border-slate-800 px-4 py-2.5 text-sm text-slate-500">Salir</button></form></div>
            </div>
          </header>

          <section id="overview" className="scroll-mt-6">
            <SectionHeading eyebrow="Ahora mismo" title="Qué necesita tu atención" description="Empieza aquí cuando tengas poco tiempo. Cada tarjeta te lleva directamente a la cola correspondiente." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard label="Pendientes de aprobar" value={approvals.length} note="Decisión humana necesaria" tone="amber" href="#approvals" />
              <StatCard label="Sin visual" value={needsVisual.length} note="Piezas listas para diseñar" tone="blue" href="#content" />
              <StatCard label="Programadas" value={scheduled.length} note="Con fecha de publicación" tone="green" href="#calendar" />
              <StatCard label="Acciones manuales" value={readyActions.length} note="LinkedIn / outreach" tone="violet" href="#outreach" />
              <StatCard label="Tareas abiertas" value={openTasks.length} note="Cola operativa interna" href="#system" />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Flujo normal</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-5">
                  {[['1', 'Investigar', 'Automático'], ['2', 'Redactar', 'Automático'], ['3', 'Diseñar', 'Tú eliges'], ['4', 'Aprobar', 'Tú decides'], ['5', 'Publicar', 'Automático al llegar la hora']].map(([n, title, note]) => <div key={n} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><span className="text-xs font-semibold text-sky-300">{n}</span><p className="mt-2 text-sm font-semibold text-white">{title}</p><p className="mt-1 text-[10px] leading-4 text-slate-600">{note}</p></div>)}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Objetivo semanal</p>{currentPlan ? <><p className="mt-3 text-lg font-semibold text-white">{currentPlan.primary_goal}</p><div className="mt-4 flex flex-wrap gap-2"><Badge>{currentPlan.week_start}</Badge>{currentPlan.commercial_focus?.channel && <Badge tone="violet">{currentPlan.commercial_focus.channel}</Badge>}{currentPlan.content_focus?.objective && <Badge tone="blue">{currentPlan.content_focus.objective}</Badge>}</div></> : <p className="mt-3 text-sm text-slate-600">Aún no hay un plan semanal cargado.</p>}</div>
            </div>
          </section>

          <section id="calendar" className="mt-12 scroll-mt-6">
            <SectionHeading eyebrow="Planificación" title="Calendario editorial · 14 días" description="Aquí ves qué se publica, por qué canal y cuándo. Todo se interpreta en Europe/Madrid." count={scheduled.length} />
            <div className="overflow-x-auto pb-2"><div className="grid min-w-[1260px] grid-cols-7 gap-3">
              {calendar.map(({ key, items, weekday, dateLabel }, index) => <div key={key} className={`min-h-44 rounded-2xl border p-4 ${index === 0 ? 'border-sky-800 bg-sky-950/20' : 'border-slate-800 bg-slate-900/50'}`}><div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{weekday}</p><p className="mt-1 text-lg font-semibold text-white">{dateLabel}</p></div>{index === 0 && <Badge tone="blue">HOY</Badge>}</div><div className="mt-4 space-y-2">{items.length === 0 && <p className="text-xs text-slate-700">Sin publicación</p>}{items.map((item) => <div key={item.content_id} className="rounded-lg border border-slate-800 bg-slate-950 p-2.5"><p className="line-clamp-2 text-xs font-medium text-slate-200">{item.title}</p><div className="mt-2 flex flex-wrap gap-1"><Badge tone={item.channel.includes('linkedin') ? 'blue' : 'violet'}>{publicationLabel(item)}</Badge><Badge>{(item.language || '—').toUpperCase()}</Badge>{item.visual_path && <Badge tone="green">visual</Badge>}</div></div>)}</div></div>)}
            </div></div>
            <p className="mt-3 text-xs leading-5 text-slate-600">Supabase guarda el instante en UTC. La interfaz lo convierte a hora de Madrid para que puedas planificar sin pensar en zonas horarias.</p>
          </section>

          <section id="approvals" className="mt-12 scroll-mt-6">
            <SectionHeading eyebrow="Human-in-the-loop" title="Pendientes de aprobar" description="Esta es la barrera final. Adjuntar un visual o guardar una fecha no publica nada por sí solo." count={approvals.length} />
            <div className="space-y-5">
              {approvals.length === 0 && <EmptyState>No hay nada esperando tu aprobación.</EmptyState>}
              {approvals.map((approval) => {
                const payload = approval.payload || {}
                const item = contentById.get(approval.target_id)
                const isPublish = approval.action_type === 'publish_post' || approval.action_type === 'publish_article'
                const image = item ? assetUrl(item) : null
                return <article key={approval.approval_id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                  <div className="grid lg:grid-cols-[220px_1fr]">
                    {isPublish && item ? <div className="border-b border-slate-800 bg-slate-950/70 p-4 lg:border-b-0 lg:border-r">{image ? <img src={image} alt={item.title} className="h-48 w-full rounded-xl border border-slate-800 object-contain" /> : <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-700 p-4 text-center text-xs leading-5 text-slate-600">Sin visual adjuntado</div>}<a href={`/growth-admin/visual-studio?content=${encodeURIComponent(item.content_id)}`} className="mt-3 block rounded-lg border border-sky-800 px-3 py-2 text-center text-xs font-medium text-sky-300">{image ? 'Editar visual' : 'Diseñar visual'}</a></div> : <div className="hidden lg:block" />}
                    <div className="p-5 md:p-6">
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><Badge tone={approval.action_type === 'publish_article' ? 'violet' : approval.action_type === 'publish_post' ? 'blue' : 'slate'}>{approval.action_type === 'publish_article' ? 'PUBLICAR ARTÍCULO' : approval.action_type === 'publish_post' ? 'PUBLICAR LINKEDIN' : approval.action_type}</Badge>{payload.family && <Badge>{payload.family}</Badge>}{payload.language && <Badge>{String(payload.language).toUpperCase()}</Badge>}{typeof payload.quality_score === 'number' && <Badge tone="green">quality {payload.quality_score.toFixed(1)}</Badge>}</div><h3 className="mt-4 text-lg font-semibold text-white">{item?.title || approval.summary}</h3>{typeof payload.message === 'string' && payload.message && <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-400">{payload.message}</p>}<ActionLinks payload={payload} /></div>
                        <div className="flex shrink-0 gap-2"><form action="/api/growth-admin/decide" method="post"><input type="hidden" name="approval_id" value={approval.approval_id}/><input type="hidden" name="decision" value="approved"/><button type="submit" className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-100">Aprobar</button></form><form action="/api/growth-admin/decide" method="post"><input type="hidden" name="approval_id" value={approval.approval_id}/><input type="hidden" name="decision" value="rejected"/><button type="submit" className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm text-slate-300 hover:border-slate-500">Rechazar</button></form></div>
                      </div>
                      {isPublish && item && <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4"><form action="/api/growth-admin/schedule" method="post" className="flex flex-col gap-3 sm:flex-row sm:items-end"><input type="hidden" name="content_id" value={item.content_id}/><label className="flex-1 text-xs text-slate-500">Fecha y hora · Europe/Madrid<input name="scheduled_at" type="datetime-local" defaultValue={scheduleInputValue(item.scheduled_at)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"/></label><button type="submit" className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500">Guardar fecha</button></form><p className="mt-2 text-[11px] text-slate-600">Actual: {item.scheduled_at ? formatDate(item.scheduled_at, true) : 'se publicará cuando esté aprobado y el publisher esté habilitado'}</p></div>}
                      {isPublish && item && <details className="mt-4"><summary className="cursor-pointer text-xs font-medium text-sky-300">Ver texto completo y visual</summary><ContentPreview item={item}/></details>}
                    </div>
                  </div>
                </article>
              })}
            </div>
          </section>

          <section id="content" className="mt-12 scroll-mt-6">
            <SectionHeading eyebrow="Biblioteca" title="Publicaciones y visuals" description="Todo lo generado y guardado en Supabase. Desde aquí puedes abrir directamente cada pieza en Visual Studio." count={content.length} />
            {needsVisual.length > 0 && <div className="mb-5 rounded-2xl border border-sky-900/50 bg-sky-950/15 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-white">{needsVisual.length} piezas todavía no tienen visual</p><p className="mt-1 text-xs text-slate-500">No todas necesitan imagen. Si quieres visual-first o un artículo con hero, empieza por aquí.</p></div><a href="/growth-admin/visual-studio" className="rounded-lg border border-sky-800 px-4 py-2 text-xs font-medium text-sky-300">Abrir Visual Studio</a></div></div>}
            <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-3">{content.slice(0, 24).map((item) => <article key={item.content_id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap gap-2"><Badge tone={statusTone(item.status)}>{item.status}</Badge><Badge tone={item.content_type === 'article' ? 'violet' : 'blue'}>{publicationLabel(item)}</Badge><Badge>{(item.language || '—').toUpperCase()}</Badge>{item.visual_path ? <Badge tone="green">visual</Badge> : <Badge tone="amber">sin visual</Badge>}</div><p className="mt-3 font-medium text-white">{item.title}</p><p className="mt-2 text-xs text-slate-600">{item.channel} · {item.publication_mode || 'text_with_visual'} · {item.scheduled_at ? formatDate(item.scheduled_at, true) : 'sin fecha'}</p></div><div className="flex shrink-0 gap-2"><a href={`/growth-admin/visual-studio?content=${encodeURIComponent(item.content_id)}`} className="rounded-lg border border-sky-800 px-3 py-2 text-xs text-sky-300">Diseñar</a>{item.external_post_url && <a href={item.external_post_url} target="_blank" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300">Ver público ↗</a>}</div></div></article>)}</div>
              <div><h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Visual library</h3><div className="grid grid-cols-2 gap-3">{visuals.length === 0 && <div className="col-span-2"><EmptyState>Todavía no hay assets visuales.</EmptyState></div>}{visuals.map((item) => { const image = assetUrl(item); return image ? <a key={item.content_id} href={`/growth-admin/visual-studio?content=${encodeURIComponent(item.content_id)}`} className="group rounded-xl border border-slate-800 bg-slate-900/30 p-2 transition hover:border-slate-600"><img src={image} alt={item.title} className="aspect-square w-full rounded-lg bg-slate-950 object-contain"/><p className="mt-2 line-clamp-1 text-xs text-slate-500">{item.title}</p><p className="mt-1 text-[10px] text-slate-700">{item.visual_type} · {item.language}</p></a> : null })}</div></div>
            </div>
          </section>

          <section id="outreach" className="mt-12 scroll-mt-6">
            <SectionHeading eyebrow="Comercial" title="Acciones manuales y prospecting" description="LinkedIn sigue siendo human-in-the-loop: el sistema puede preparar quién y qué hacer, pero tú ejecutas follows, connects e invites." count={readyActions.length + targetPeople.length} />
            <div className="grid gap-5 xl:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-white">Checklist listo para ejecutar</h3>
                <div className="space-y-3">{readyActions.length === 0 && <EmptyState>No hay acciones manuales listas ahora mismo.</EmptyState>}{readyActions.map((approval) => { const payload = approval.payload || {}; return <article key={approval.approval_id} className="rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-4"><div className="flex items-start justify-between gap-4"><div><Badge tone="green">LISTO</Badge><h4 className="mt-3 font-semibold text-white">{approval.summary}</h4>{payload.person?.name && <p className="mt-2 text-sm text-slate-400">{payload.person.name} · {payload.person.role}</p>}<ActionLinks payload={payload}/></div><form action="/api/growth-admin/mark-executed" method="post"><input type="hidden" name="approval_id" value={approval.approval_id}/><button type="submit" className="rounded-lg border border-emerald-800 px-3 py-2 text-xs text-emerald-300">Marcar hecho</button></form></div></article> })}</div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold text-white">Personas objetivo</h3>
                <div className="space-y-3">{targetPeople.length === 0 && <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 p-6"><p className="text-sm font-semibold text-slate-300">Todavía no hay personas cargadas.</p><p className="mt-2 text-xs leading-5 text-slate-600">Aquí es donde entrará Apollo: descubrirá empresas y decisores, enriquecerá los perfiles y alimentará esta cola para que tú solo tengas que revisar y abrir LinkedIn.</p></div>}{targetPeople.map((person) => { const company = person.company_id ? companyById.get(person.company_id) : undefined; return <article key={person.person_id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-medium text-white">{person.name}</p><p className="mt-1 text-sm text-slate-500">{person.role || 'Rol desconocido'}{company ? ` · ${company.name}` : ''}</p><div className="mt-2 flex gap-2"><Badge>{person.status || 'new'}</Badge>{person.relevance_score && <Badge tone="violet">fit {Number(person.relevance_score).toFixed(1)}</Badge>}</div></div>{person.linkedin_url ? <a href={person.linkedin_url} target="_blank" rel="noreferrer" className="rounded-lg border border-sky-800 px-3 py-2 text-xs text-sky-300">LinkedIn ↗</a> : person.public_source_url ? <a href={person.public_source_url} target="_blank" rel="noreferrer" className="text-xs text-slate-400">Fuente ↗</a> : null}</div></article> })}</div>
              </div>
            </div>

            {companies.length > 0 && <div className="mt-5"><h3 className="mb-3 text-sm font-semibold text-white">Empresas detectadas</h3><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{companies.slice(0, 12).map((company) => <article key={company.company_id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-medium text-white">{company.name}</p><p className="mt-1 text-xs text-slate-500">{company.industry || 'Industria desconocida'} · {company.country || '—'}</p></div><Badge tone="violet">{Number(company.score || 0).toFixed(1)}</Badge></div><p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-600">{company.score_reason}</p><div className="mt-3 flex gap-3 text-xs">{company.linkedin_url && <a href={company.linkedin_url} target="_blank" className="text-sky-300">LinkedIn ↗</a>}{company.website && <a href={company.website} target="_blank" className="text-slate-400">Web ↗</a>}</div></article>)}</div></div>}
          </section>

          <section id="intelligence" className="mt-12 scroll-mt-6">
            <SectionHeading eyebrow="Editorial" title="Ideas y research recientes" description="Son briefs internos, no publicaciones. Aquí ves por qué el sistema cree que una idea merece convertirse en contenido." count={editorialBriefs.length} />
            <div className="grid gap-4 md:grid-cols-2">{editorialBriefs.slice(0, 10).map((brief) => { const sources = brief.research?.source_urls || []; return <article key={brief.brief_id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><div className="flex flex-wrap gap-2"><Badge>{brief.family}</Badge><Badge tone="violet">{Number(brief.weighted_score || 0).toFixed(1)}/10</Badge><Badge>{brief.output_decision}</Badge></div><h3 className="mt-4 font-semibold text-white">{brief.canonical_title}</h3>{brief.thesis && <p className="mt-3 text-sm leading-6 text-slate-400">{brief.thesis}</p>}<div className="mt-4 flex gap-3 text-xs">{sources.slice(0, 3).map((url, index) => <a key={url} href={url} target="_blank" className="text-sky-300">Fuente {index + 1} ↗</a>)}</div></article> })}</div>
          </section>

          <section id="system" className="mt-12 scroll-mt-6 pb-14">
            <SectionHeading eyebrow="Sistema" title="Integraciones y estado de los datos" description="Esta zona explica qué está conectado y qué papel cumple cada pieza. No necesitas entrar en Supabase para operar el día a día." />
            <div className="grid gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">LinkedIn</p><p className="mt-2 font-semibold text-white">{linkedinConnection?.display_name || 'No conectado'}</p></div><Badge tone={linkedin.connected ? 'green' : 'amber'}>{linkedin.connected ? 'CONECTADO' : 'ATENCIÓN'}</Badge></div><p className="mt-3 text-xs leading-5 text-slate-600">Publica contenido aprobado mediante la API oficial. Follows, connects e invites siguen siendo manuales.</p>{linkedinConnection && <div className="mt-4 space-y-2 text-xs text-slate-500"><p>Scopes: {(linkedinConnection.scopes || []).join(', ')}</p><p>Expira: {formatDate(linkedinConnection.token_expires_at)}</p><p>Email: {typeof linkedinMeta.email === 'string' ? linkedinMeta.email : '—'}</p></div>}<div className="mt-5 flex gap-2"><a href="/api/linkedin/connect" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300">{linkedin.connected ? 'Reconectar' : 'Conectar'}</a>{linkedinConnection && <form action="/api/linkedin/disconnect" method="post"><button type="submit" className="rounded-lg border border-slate-800 px-3 py-2 text-xs text-slate-500">Desconectar</button></form>}</div></div>

              <div className="rounded-2xl border border-amber-900/40 bg-amber-950/10 p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Apollo</p><p className="mt-2 font-semibold text-white">Prospecting y enriquecimiento</p></div><Badge tone="amber">PENDIENTE</Badge></div><p className="mt-3 text-xs leading-5 text-slate-600">Servirá para encontrar empresas y decisores que encajan con el ICP de SC-Analytics. Sus resultados alimentarán People, Companies y la checklist comercial de arriba.</p><p className="mt-4 text-[11px] text-amber-300/70">No está conectado todavía; no bloquea contenido, web ni LinkedIn.</p></div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Supabase · snapshot</p><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-2xl font-semibold text-white">{content.length}</p><p className="text-xs text-slate-500">contenidos</p></div><div><p className="text-2xl font-semibold text-white">{editorialBriefs.length}</p><p className="text-xs text-slate-500">briefs</p></div><div><p className="text-2xl font-semibold text-white">{people.length}</p><p className="text-xs text-slate-500">personas</p></div><div><p className="text-2xl font-semibold text-white">{companies.length}</p><p className="text-xs text-slate-500">empresas</p></div><div><p className="text-2xl font-semibold text-white">{published.length}</p><p className="text-xs text-slate-500">publicados</p></div><div><p className="text-2xl font-semibold text-white">{visuals.length}</p><p className="text-xs text-slate-500">visuals cargados</p></div></div></div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"><p className="text-xs text-slate-500">Tareas</p><p className="mt-2 text-2xl font-semibold text-white">{tasks.length}</p></div><div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"><p className="text-xs text-slate-500">Interacciones</p><p className="mt-2 text-2xl font-semibold text-white">{interactions.length}</p></div><div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"><p className="text-xs text-slate-500">Métricas</p><p className="mt-2 text-2xl font-semibold text-white">{metrics.length}</p></div></div>
          </section>
        </div>
      </div>
    </main>
  )
}
