import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { getCommercialIntelligenceBundle } from '@/lib/growth-admin-performance'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'

type SearchParams = Record<string, string | string[] | undefined>

function Metric({ label, value, note }: { label: string; value: number | string; note: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>
  </div>
}

function Status({ value }: { value?: string }) {
  const active = value === 'active'
  const planned = value === 'planned'
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : planned ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>{value || 'new'}</span>
}

function money(value?: number | string | null, currency = 'EUR') {
  const number = Number(value || 0)
  if (!number) return '—'
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 0 }).format(number)
}

export default async function CommercialIntelligencePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params = await searchParams
  const bundle = await getCommercialIntelligenceBundle()
  const signals = bundle.signals || []
  const offers = bundle.offers || []
  const channels = bundle.channels || []
  const tasks = bundle.tasks || []
  const queued = typeof params.queued === 'string' ? params.queued : ''
  const dispatched = params.dispatched === '1'
  const dispatchAttempted = typeof params.dispatched === 'string'
  const highPriority = signals.filter((signal) => Number(signal.strength || 0) >= 8).length
  const phoneSignals = signals.filter((signal) => Boolean(signal.phone)).length

  return <AdminShell active="intelligence" surface="light">
    <div className="pb-12">
      <header className="overflow-hidden rounded-[2rem] border border-slate-900 bg-slate-950 text-white shadow-sm">
        <div className="grid gap-8 px-6 py-9 md:px-10 md:py-12 xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="max-w-4xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-300">Commercial OS · Intelligence engine</p>
            <h1 className="mt-4 text-4xl leading-tight md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>Señales, ofertas y canales</h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">Este módulo no sustituye Clientes ni Partners. Responde tres preguntas anteriores: <strong className="text-white">¿por qué ahora?</strong>, <strong className="text-white">¿con qué oferta entramos?</strong> y <strong className="text-white">¿por qué canal distribuimos?</strong>.</p>
          </div>
          <form action="/api/growth-admin/operator-task" method="post" className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
            <input type="hidden" name="action" value="commercial_signals"/>
            <input type="hidden" name="return_to" value="/growth-admin/intelligence"/>
            <select name="limit" defaultValue="12" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm font-semibold text-white outline-none"><option value="12">12</option><option value="20">20</option><option value="30">30</option><option value="40">40</option></select>
            <button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100">Buscar señales ahora</button>
          </form>
        </div>
        <div className="border-t border-white/10 bg-white/[0.035] px-6 py-4 md:px-10">
          <div className="grid gap-2 text-xs text-slate-400 md:grid-cols-4"><span><strong className="text-slate-200">Trigger Engine</strong> → detecta el evento</span><span><strong className="text-slate-200">Offer Engine</strong> → selecciona la entrada</span><span><strong className="text-slate-200">Channel Engine</strong> → decide distribución</span><span><strong className="text-slate-200">CRM</strong> → ejecuta y aprende</span></div>
        </div>
      </header>

      {bundle.degraded && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">La inteligencia comercial se ha cargado en modo seguro porque Supabase ha tardado en responder.</div>}
      {queued && <div className={`mt-5 rounded-2xl border px-5 py-4 text-sm ${dispatched ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-sky-200 bg-sky-50 text-sky-800'}`}>{dispatched ? <>Búsqueda lanzada ahora en GitHub Actions: <strong>{queued}</strong>. Cuando termine, las señales aparecerán aquí.</> : <>Tarea guardada: <strong>{queued}</strong>. {dispatchAttempted ? 'No se pudo lanzar el workflow al instante; el barrido diario queda como red de seguridad.' : 'Queda en la cola.'}</>}</div>}

      {tasks.length > 0 && <div className="mt-5 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-sm"><span className="font-semibold text-slate-700">Últimos scans:</span>{tasks.slice(0, 5).map((task) => <span key={task.task_id} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">{task.status} · {String(task.inputs?.limit || '?')}</span>)}</div>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Señales" value={signals.length} note="Eventos observables guardados en Supabase"/><Metric label="Alta prioridad" value={highPriority} note="Strength ≥ 8/10"/><Metric label="Ofertas empaquetadas" value={offers.length} note="Entradas comerciales concretas"/><Metric label="Teléfono público" value={phoneSignals} note="Solo cuando existe una fuente empresarial pública"/></div>

      <section className="mt-12">
        <div className="mb-6"><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600">1 · Trigger Engine</p><h2 className="mt-2 text-3xl" style={{ fontFamily: 'var(--font-playfair)' }}>Por qué contactar ahora</h2><p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">Hiring, financiación, expansión, nuevo almacén, cambio de management, migración ERP, crecimiento de capacidad o cualquier señal pública que cambie la probabilidad de necesidad.</p></div>
        {signals.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Todavía no hay señales. Ejecuta el primer scan.</div> : <div className="grid gap-4 xl:grid-cols-2">{signals.slice(0, 30).map((signal) => <article key={signal.signal_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap gap-2"><span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700">{signal.signal_type.replaceAll('_', ' ')}</span><Status value={signal.status}/></div><h3 className="mt-3 text-lg font-semibold text-slate-950">{signal.company_name}</h3><p className="mt-1 text-sm text-slate-500">{signal.title}</p></div><span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">{Number(signal.strength || 0).toFixed(1)}/10</span></div>
          {signal.summary && <p className="mt-4 text-sm leading-6 text-slate-600">{signal.summary}</p>}
          {signal.evidence && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600"><strong className="text-slate-800">Evidencia:</strong> {signal.evidence}</div>}
          <div className="mt-3 grid gap-2 sm:grid-cols-2"><div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-900"><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-emerald-600">Servicio</p><p className="mt-1 font-semibold">{signal.recommended_service || 'Por decidir'}</p></div><div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-900"><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-indigo-600">Oferta de entrada</p><p className="mt-1 font-semibold">{signal.recommended_offer || 'Por decidir'}</p></div></div>
          {signal.suggested_roles?.length ? <p className="mt-3 text-xs text-slate-500"><strong>Decisores sugeridos:</strong> {signal.suggested_roles.join(' · ')}</p> : null}
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold">{signal.website && <a href={signal.website} target="_blank" rel="noreferrer" className="text-slate-700">Web ↗</a>}<a href={signal.source_url} target="_blank" rel="noreferrer" className="text-indigo-600">Fuente ↗</a>{signal.phone && <a href={`tel:${signal.phone}`} className="text-emerald-700">Llamar {signal.phone}</a>}{signal.phone_source_url && <a href={signal.phone_source_url} target="_blank" rel="noreferrer" className="text-slate-400">Fuente teléfono ↗</a>}</div>
        </article>)}</div>}
      </section>

      <section className="mt-12">
        <div className="mb-6"><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600">2 · Offer Engine</p><h2 className="mt-2 text-3xl" style={{ fontFamily: 'var(--font-playfair)' }}>Qué vendemos primero</h2><p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">SC-Analytics puede hacer muchas cosas por detrás. Hacia fuera entramos con una propuesta concreta, comprensible y ligada a una decisión económica.</p></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{offers.map((offer) => <article key={offer.offer_key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-slate-950">{offer.name}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{offer.promise}</p><div className="mt-4 space-y-2 text-xs leading-5 text-slate-600"><p><strong>Ideal para:</strong> {offer.ideal_for}</p><p><strong>Duración:</strong> {offer.duration || '—'}</p><p><strong>Entrada:</strong> {offer.entry_scope || '—'}</p><p><strong>Rango orientativo:</strong> {money(offer.price_min, offer.currency)} – {money(offer.price_max, offer.currency)}</p></div><div className="mt-4 rounded-xl bg-indigo-50 p-3 text-xs leading-5 text-indigo-800">{offer.cta}</div></article>)}</div>
      </section>

      <section className="mt-12">
        <div className="mb-6"><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600">3 · Distribution Engine</p><h2 className="mt-2 text-3xl" style={{ fontFamily: 'var(--font-playfair)' }}>Por dónde llega la demanda</h2><p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">No buscamos un canal mágico. Construimos una cartera de distribución: outbound por señales, partners, white-label, brokers, marketplaces, ecosistemas, PE/search funds, procurement e inbound.</p></div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-100">{channels.map((channel) => <div key={channel.channel_key} className="grid gap-3 p-4 md:grid-cols-[1.2fr_90px_110px_1.8fr]"><div><p className="text-sm font-semibold text-slate-900">{channel.label}</p><p className="mt-1 text-xs text-slate-500">{channel.objective}</p></div><div><p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Prioridad</p><p className="mt-1 text-sm font-semibold">{Number(channel.priority || 0).toFixed(1)}/10</p></div><div><Status value={channel.status}/><p className="mt-2 text-xs text-slate-400">{channel.cadence}</p></div><div className="text-xs leading-5 text-slate-600">{channel.motion}</div></div>)}</div></div>
      </section>

      <section className="mt-12 rounded-3xl border border-indigo-100 bg-indigo-50/60 p-6 md:p-8"><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600">Cómo se conectan los motores</p><div className="mt-5 grid gap-3 md:grid-cols-4 xl:grid-cols-8">{['Señal','Cuenta','Decisor','Oferta','LinkedIn / email / teléfono','Discovery','Oportunidad','Proyecto / expansión'].map((item, index) => <div key={item} className="rounded-xl border border-indigo-100 bg-white p-3 text-center text-xs font-semibold text-slate-700"><span className="mr-1 text-indigo-400">{index + 1}.</span>{item}</div>)}</div></section>
    </div>
  </AdminShell>
}
