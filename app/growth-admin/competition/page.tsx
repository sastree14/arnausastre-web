import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, EmptyState, SectionHeading, adminInput, adminPanel } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getCompetitorEvents, getCompetitors, getCompetitionTasks, type CompetitorEventRow, type CompetitorRow } from '@/lib/competition-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Params = Record<string, string | string[] | undefined>

function date(value?: string | null) {
  if (!value) return 'Nunca'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Madrid' }).format(parsed)
}

function score(value?: number | string) {
  const number = Number(value || 0)
  return Number.isFinite(number) ? number.toFixed(1) : '0.0'
}

function eventTone(significance?: number | string) {
  const value = Number(significance || 0)
  if (value >= 8) return 'border-rose-200 bg-rose-50 text-rose-700'
  if (value >= 6) return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-slate-200 bg-slate-50 text-slate-600'
}

function CompetitorCard({ competitor, events }: { competitor: CompetitorRow; events: CompetitorEventRow[] }) {
  const monitored = Boolean(competitor.is_monitored)
  return <article className={`${adminPanel} overflow-hidden`}>
    <div className="p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Badge tone={competitor.category === 'direct' ? 'violet' : 'blue'}>{competitor.category === 'direct' ? 'Directa' : 'Adyacente'}</Badge>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${monitored ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>{monitored ? '● Monitorización activa' : '○ Sin monitorizar'}</span>
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">{competitor.name}</h2>
          <p className="mt-1 text-xs text-slate-500">{[competitor.city, competitor.country, competitor.employee_range].filter(Boolean).join(' · ') || 'Tamaño por verificar'}</p>
        </div>
        <div className="flex gap-2 text-center">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2"><p className="text-[9px] font-semibold uppercase tracking-wide text-indigo-500">Filosofía</p><p className="mt-1 text-lg font-semibold text-indigo-800">{score(competitor.philosophy_fit)}</p></div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"><p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Solape</p><p className="mt-1 text-lg font-semibold text-slate-800">{score(competitor.market_overlap)}</p></div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2"><p className="text-[9px] font-semibold uppercase tracking-wide text-amber-600">Relevancia</p><p className="mt-1 text-lg font-semibold text-amber-800">{score(competitor.relevance_score)}</p></div>
        </div>
      </div>

      {competitor.positioning && <p className="mt-5 text-sm leading-6 text-slate-700">{competitor.positioning}</p>}
      {competitor.services?.length ? <div className="mt-4 flex flex-wrap gap-1.5">{competitor.services.slice(0, 8).map((service) => <span key={service} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-600">{service}</span>)}</div> : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-600">Por qué vigilarla</p><p className="mt-2 text-xs leading-5 text-indigo-950">{competitor.why_relevant || 'Competidor guardado para contexto de mercado.'}</p></div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Diferencia / hueco</p><p className="mt-2 text-xs leading-5 text-emerald-950">{competitor.differentiation || 'Pendiente de ampliar tras próximas revisiones.'}</p></div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <form action="/api/growth-admin/competition/monitor" method="post">
          <input type="hidden" name="competitor_id" value={competitor.competitor_id}/>
          <input type="hidden" name="enabled" value={monitored ? '0' : '1'}/>
          <input type="hidden" name="monitoring_frequency" value="daily"/>
          <button className={`rounded-lg border px-4 py-2.5 text-xs font-semibold ${monitored ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>{monitored ? 'Pausar monitorización' : 'Monitorizar movimientos'}</button>
        </form>
        <form action="/api/growth-admin/operator-task" method="post">
          <input type="hidden" name="action" value="competitor_refresh"/>
          <input type="hidden" name="competitor_id" value={competitor.competitor_id}/>
          <input type="hidden" name="return_to" value="/growth-admin/competition"/>
          <button className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">Actualizar movimientos ahora</button>
        </form>
        <a href={competitor.website} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600">Web ↗</a>
        {competitor.primary_source_url && <a href={competitor.primary_source_url} target="_blank" rel="noreferrer" className="px-2 py-2.5 text-xs font-semibold text-slate-400">Fuente base ↗</a>}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-slate-400"><span>Último check: <strong className="text-slate-600">{date(competitor.last_checked_at)}</strong></span><span>Último movimiento: <strong className="text-slate-600">{date(competitor.last_change_at)}</strong></span><span>Detectada: <strong className="text-slate-600">{date(competitor.last_discovered_at || competitor.created_at)}</strong></span></div>
    </div>

    {events.length > 0 && <div className="border-t border-slate-200 bg-slate-50/70 p-5 md:p-6"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Últimos movimientos</p><div className="mt-3 space-y-3">{events.slice(0,3).map((event) => <div key={event.event_id} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold text-slate-900">{event.title}</p><p className="mt-1 text-[11px] leading-5 text-slate-500">{event.summary}</p></div><span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-semibold ${eventTone(event.significance)}`}>{score(event.significance)}/10</span></div><div className="mt-2 flex flex-wrap gap-3 text-[10px]"><span className="font-semibold uppercase tracking-wide text-slate-400">{event.event_type.replaceAll('_',' ')}</span><a href={event.source_url} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600">Fuente ↗</a></div></div>)}</div></div>}
  </article>
}

export default async function CompetitionPage({ searchParams }: { searchParams: Promise<Params> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params = await searchParams
  const [competitors, events, tasks] = await Promise.all([getCompetitors(), getCompetitorEvents(), getCompetitionTasks()])
  const queued = typeof params.queued === 'string' ? params.queued : ''
  const queuedTask = queued ? tasks.find((task) => task.task_id === queued) : undefined
  const view = typeof params.view === 'string' ? params.view : 'all'
  const eventByCompetitor = new Map<string, CompetitorEventRow[]>()
  events.forEach((event) => eventByCompetitor.set(event.competitor_id, [...(eventByCompetitor.get(event.competitor_id) || []), event]))
  const monitored = competitors.filter((item) => item.is_monitored)
  const direct = competitors.filter((item) => item.category === 'direct')
  const highImpact = events.filter((item) => Number(item.significance || 0) >= 8).length
  const visible = competitors.filter((item) => view === 'monitored' ? item.is_monitored : view === 'direct' ? item.category === 'direct' : view === 'adjacent' ? item.category === 'adjacent' : true)

  return <AdminShell active="competition">
    <header className="overflow-hidden rounded-[2rem] border border-slate-900 bg-slate-950 text-white shadow-sm">
      <div className="grid gap-8 px-6 py-9 md:px-10 md:py-12 xl:grid-cols-[1fr_auto] xl:items-end">
        <div className="max-w-4xl"><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-300">Commercial OS · Competitive Intelligence</p><h1 className="mt-4 text-4xl leading-tight md:text-6xl" style={{fontFamily:'var(--font-playfair)'}}>Radar competitivo</h1><p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">Una lista persistente de consultoras comparables a SC-Analytics. Buscamos firmas boutique o de tamaño razonable, con filosofía business-first y solape real; después decides cuáles monitorizar de forma continua.</p></div>
        <form action="/api/growth-admin/operator-task" method="post" className="rounded-2xl border border-white/10 bg-white/5 p-2"><input type="hidden" name="action" value="competitor_refresh_all"/><input type="hidden" name="return_to" value="/growth-admin/competition"/><input type="hidden" name="limit" value="30"/><button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm hover:bg-slate-100">Actualizar monitorizadas</button></form>
      </div>
      <div className="border-t border-white/10 bg-white/[0.035] px-6 py-4 md:px-10"><div className="grid gap-2 text-xs text-slate-400 md:grid-cols-4"><span><strong className="text-slate-200">Descubrimiento</strong> → encuentra peers razonables</span><span><strong className="text-slate-200">Watchlist</strong> → la lista permanece</span><span><strong className="text-slate-200">Monitor</strong> → busca movimientos públicos</span><span><strong className="text-slate-200">Respuesta</strong> → interpreta huecos para SC</span></div></div>
    </header>

    {queued && <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800"><strong>Tarea lanzada:</strong> {queued} · {queuedTask?.status || 'en cola'}. La página conservará las empresas existentes y añadirá o actualizará información cuando termine.</div>}
    {params.monitor && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">Monitorización {params.monitor === 'on' ? 'activada' : 'pausada'} correctamente.</div>}

    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className={`${adminPanel} p-5`}><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Empresas fijas</p><p className="mt-2 text-3xl font-semibold text-slate-950">{competitors.length}</p><p className="mt-1 text-xs text-slate-500">No desaparecen al volver a buscar</p></div>
      <div className={`${adminPanel} p-5`}><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Monitorizadas</p><p className="mt-2 text-3xl font-semibold text-emerald-700">{monitored.length}</p><p className="mt-1 text-xs text-slate-500">Revisión automática diaria</p></div>
      <div className={`${adminPanel} p-5`}><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Competencia directa</p><p className="mt-2 text-3xl font-semibold text-indigo-700">{direct.length}</p><p className="mt-1 text-xs text-slate-500">Solape relevante de servicios</p></div>
      <div className={`${adminPanel} p-5`}><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Movimientos registrados</p><p className="mt-2 text-3xl font-semibold text-amber-700">{events.length}</p><p className="mt-1 text-xs text-slate-500">{highImpact} de impacto ≥ 8/10</p></div>
    </section>

    <section className="mt-8 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <form action="/api/growth-admin/operator-task" method="post" className={`${adminPanel} p-6`}>
        <input type="hidden" name="action" value="competitor_discover"/><input type="hidden" name="return_to" value="/growth-admin/competition"/>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-600">Descubrir</p><h2 className="mt-2 text-2xl font-semibold text-slate-950">Buscar competidores comparables</h2><p className="mt-2 text-sm leading-6 text-slate-600">Cada búsqueda enriquece la watchlist existente. No sustituye ni borra empresas ya guardadas. Puedes orientar la búsqueda a un servicio concreto o dejarla abierta.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_110px_auto]"><input name="focus" className={adminInput} placeholder="Ej. forecasting, optimización, Data & BI, AI automation…"/><select name="limit" defaultValue="8" className={adminInput}><option value="6">6</option><option value="8">8</option><option value="12">12</option><option value="16">16</option></select><button className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Buscar y añadir</button></div>
      </form>
      <div className={`${adminPanel} p-6`}><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Criterio</p><h2 className="mt-2 text-xl font-semibold text-slate-950">Qué entra en este radar</h2><div className="mt-4 space-y-2 text-sm leading-6 text-slate-600"><p>✓ Boutique, especialista o firma pequeña/mediana comparable.</p><p>✓ Data, Analytics, IA, forecasting, optimización o automatización con impacto de negocio.</p><p>✓ Filosofía cercana: entender contexto, construir a medida, medir valor y ejecutar.</p><p>✕ Big Four, integradores globales y gigantes como Deloitte, Accenture o Capgemini.</p></div></div>
    </section>

    <section className="mt-10">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><SectionHeading eyebrow="Watchlist persistente" title="Empresas a seguir" description="Volver a ejecutar la búsqueda puede mejorar sus datos o encontrar nuevas empresas, pero esta lista no se reemplaza." count={visible.length}/><div className="flex flex-wrap gap-2">{[['all','Todas'],['monitored','Monitorizadas'],['direct','Directas'],['adjacent','Adyacentes']].map(([key,label])=><a key={key} href={`/growth-admin/competition?view=${key}`} className={`rounded-full border px-3 py-2 text-xs font-semibold ${view===key?'border-indigo-200 bg-indigo-50 text-indigo-700':'border-slate-200 bg-white text-slate-500'}`}>{label}</a>)}</div></div>
      <div className="grid gap-5 xl:grid-cols-2">{visible.length===0&&<div className="xl:col-span-2"><EmptyState>No hay empresas en este filtro. Ejecuta una búsqueda para construir la primera watchlist.</EmptyState></div>}{visible.map((competitor)=><CompetitorCard key={competitor.competitor_id} competitor={competitor} events={eventByCompetitor.get(competitor.competitor_id)||[]}/>)}</div>
    </section>

    <section className="mt-14 pb-12"><SectionHeading eyebrow="Movement feed" title="Movimientos competitivos" description="Solo hechos públicos con fuente. La interpretación para SC-Analytics se mantiene separada de la evidencia." count={events.length}/><div className="space-y-3">{events.length===0&&<EmptyState>Todavía no hay movimientos registrados. Activa monitorización o pulsa “Actualizar movimientos ahora” en una empresa.</EmptyState>}{events.slice(0,80).map((event)=>{const company=competitors.find((item)=>item.competitor_id===event.competitor_id);return <article key={event.event_id} className={`${adminPanel} p-5`}><div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"><div className="min-w-0"><div className="flex flex-wrap gap-2"><Badge>{company?.name||'Competidor'}</Badge><Badge tone="blue">{event.event_type.replaceAll('_',' ')}</Badge><span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${eventTone(event.significance)}`}>{score(event.significance)}/10</span></div><h3 className="mt-3 text-lg font-semibold text-slate-950">{event.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{event.summary}</p>{event.evidence&&<p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600"><strong className="text-slate-800">Evidencia:</strong> {event.evidence}</p>}</div><div className="w-full shrink-0 space-y-2 xl:w-80"><div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs leading-5 text-indigo-900"><strong>Implicación para SC:</strong> {event.impact_for_sc||'—'}</div><div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs leading-5 text-emerald-900"><strong>Respuesta sugerida:</strong> {event.recommended_response||'—'}</div></div></div><div className="mt-4 flex flex-wrap gap-4 text-[11px] text-slate-400"><span>{date(event.observed_at||event.created_at)}</span><a href={event.source_url} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600">Abrir fuente ↗</a></div></article>})}</div></section>
  </AdminShell>
}
