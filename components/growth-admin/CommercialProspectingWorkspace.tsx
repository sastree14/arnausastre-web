import AdminShell from '@/components/growth-admin/AdminShell'
import CompanyQuickActions from '@/components/growth-admin/CompanyQuickActions'
import CopyButton from '@/components/growth-admin/CopyButton'
import PersonQuickActions from '@/components/growth-admin/PersonQuickActions'
import { getCrmBundle } from '@/lib/growth-admin-performance'

type WorkspaceMode = 'lead' | 'partner'
type Tone = 'slate' | 'indigo' | 'sky' | 'green' | 'amber' | 'rose'

type CrmPerson = {
  person_id: string
  company_id?: string | null
  name: string
  role?: string
  linkedin_url?: string
  public_source_url?: string
  relevance_score?: number | string
  status?: string
  evidence?: string
  recommended_message?: string
  outreach_angle?: string
  connection_note?: string
  follow_up_message?: string
  contact_reason?: string
  personal_hook?: string
  open_question?: string
  recommended_service?: string
}

type CrmCompany = {
  company_id: string
  name: string
  website?: string
  linkedin_url?: string
  source_url?: string
  score?: number | string
  score_reason?: string
  fit_type?: string
  country?: string
  industry?: string
  employee_range?: string
  capabilities?: string[]
  capability_gaps?: string[]
  status?: string
  recommended_service?: string
  partnership_model?: string
  partnership_value?: string
}

type SearchParams = Record<string, string | string[] | undefined>

const PERSON_TERMINAL = new Set(['completed', 'not_interested', 'discarded'])
const COMPANY_TERMINAL = new Set(['completed', 'discarded'])
const CONTACTED = new Set(['connection_requested', 'connected', 'contacted', 'replied', 'follow_up', 'discovery_proposed', 'discovery_booked', 'proposal_sent', 'negotiation'])
const CONVERSATION = new Set(['replied', 'follow_up', 'discovery_proposed', 'discovery_booked', 'proposal_sent', 'negotiation'])

const STATUS_LABELS: Record<string, string> = {
  candidate: 'Pendiente',
  researching: 'Investigando',
  followed: 'Seguido',
  contact_identified: 'Contacto identificado',
  connection_requested: 'Invitación enviada',
  connected: 'Conectado',
  contacted: 'Mensaje enviado',
  replied: 'Ha respondido',
  follow_up: 'Follow-up',
  discovery_proposed: 'Discovery propuesta',
  discovery_booked: 'Discovery agendada',
  proposal_sent: 'Propuesta enviada',
  negotiation: 'Negociación',
  completed: 'Finalizado',
  not_interested: 'No interesado',
  discarded: 'Descartado',
  queued: 'En cola',
  running: 'Ejecutando',
  failed: 'Fallido',
}

function Pill({ children, tone = 'slate' }: { children: React.ReactNode; tone?: Tone }) {
  const tones: Record<Tone, string> = {
    slate: 'border-slate-200 bg-slate-50 text-slate-600',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
  }
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${tones[tone]}`}>{children}</span>
}

function MetricCard({ label, value, note, tone = 'slate' }: { label: string; value: number | string; note?: string; tone?: Tone }) {
  const accents: Record<Tone, string> = {
    slate: 'bg-slate-950',
    indigo: 'bg-indigo-600',
    sky: 'bg-sky-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  }
  return <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
    <span className={`absolute inset-y-0 left-0 w-1 ${accents[tone]}`} />
    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
    {note && <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>}
  </div>
}

function SectionTitle({ eyebrow, title, description, count }: { eyebrow: string; title: string; description?: string; count?: number }) {
  return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600">{eyebrow}</p>
      <h2 className="mt-2 text-3xl text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h2>
      {description && <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{description}</p>}
    </div>
    {count !== undefined && <Pill>{count}</Pill>}
  </div>
}

function statusTone(status?: string | null): Tone {
  if (status === 'completed' || status === 'discovery_booked') return 'green'
  if (status === 'replied' || status === 'connected' || status === 'running') return 'sky'
  if (status === 'follow_up' || status === 'contacted' || status === 'connection_requested' || status === 'researching' || status === 'queued') return 'amber'
  if (status === 'failed' || status === 'not_interested' || status === 'discarded') return 'rose'
  if (status === 'discovery_proposed' || status === 'contact_identified' || status === 'followed' || status === 'proposal_sent' || status === 'negotiation') return 'indigo'
  return 'slate'
}

function fallbackMessage(person: CrmPerson, company: CrmCompany | undefined, mode: WorkspaceMode) {
  const firstName = person.name?.split(/\s+/)[0] || person.name || 'Hola'
  const companyName = company?.name || 'tu empresa'
  if (mode === 'partner') {
    return `Hola ${firstName}, soy Arnau Sastre, matemático y estadístico y fundador de SC-Analytics. He estado revisando ${companyName} y creo que puede existir una complementariedad interesante entre vuestra relación con clientes y nuestra capacidad técnica en Data Science, forecasting, optimización y AI. La idea no sería competir, sino cubrir proyectos o capas técnicas que no compense asumir internamente. Si tiene sentido, podemos hacer una llamada breve, sin coste ni compromiso, para ver si existe encaje real. ¿Qué tipo de proyectos de datos os llegan que hoy preferís derivar, rechazar o cubrir con especialistas externos?`
  }
  return `Hola ${firstName}, soy Arnau Sastre, matemático y estadístico y fundador de SC-Analytics. He estado revisando ${companyName} y, por tu rol, veo una hipótesis concreta donde analítica avanzada podría ayudar a mejorar decisiones. Si tiene sentido, podemos hacer una llamada breve, sin coste ni compromiso, para contrastarlo y ver si existe valor real. ¿Qué decisión de negocio u operación os resulta más difícil anticipar o sistematizar ahora mismo?`
}

function modeOfCompany(company: CrmCompany) {
  return company.fit_type === 'partner' ? 'partner' : 'lead'
}

export default async function CommercialProspectingWorkspace({ mode, searchParams }: { mode: WorkspaceMode; searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const bundle = await getCrmBundle()
  const allCompanies = bundle.companies as unknown as CrmCompany[]
  const allPeople = bundle.people as unknown as CrmPerson[]
  const companies = allCompanies.filter((company) => modeOfCompany(company) === mode)
  const companyIds = new Set(companies.map((company) => company.company_id))
  const people = allPeople.filter((person) => Boolean(person.company_id && companyIds.has(person.company_id)))
  const companyById = new Map(companies.map((company) => [company.company_id, company]))
  const personIds = new Set(people.map((person) => person.person_id))
  const activeCompanies = companies.filter((company) => !COMPANY_TERMINAL.has(company.status || 'candidate'))
  const activePeople = people
    .filter((person) => !PERSON_TERMINAL.has(person.status || 'candidate'))
    .sort((a, b) => Number(b.relevance_score || 0) - Number(a.relevance_score || 0))
  const contactedPeople = people.filter((person) => CONTACTED.has(person.status || ''))
  const conversationPeople = people.filter((person) => CONVERSATION.has(person.status || ''))
  const opportunities = bundle.opportunities.filter((item) => Boolean(item.company_id && companyIds.has(item.company_id)))
  const meetings = bundle.meetings.filter((item) => Boolean((item.company_id && companyIds.has(item.company_id)) || (item.person_id && personIds.has(item.person_id))))
  const tasks = bundle.prospect_tasks.filter((task) => String(task.inputs?.mode || 'lead') === mode)
  const interactions = bundle.interactions.filter((item) => Boolean((item.company_id && companyIds.has(item.company_id)) || (item.person_id && personIds.has(item.person_id))))
  const actionMessageByTarget = new Map<string, string>()
  for (const action of bundle.actions) {
    if (!personIds.has(action.target_id)) continue
    const message = typeof action.payload?.message === 'string' ? action.payload.message : ''
    if (message && !actionMessageByTarget.has(action.target_id)) actionMessageByTarget.set(action.target_id, message)
  }

  const isPartner = mode === 'partner'
  const returnTo = isPartner ? '/growth-admin/partners' : '/growth-admin/crm'
  const queued = typeof params.queued === 'string' ? params.queued : ''
  const interactionSaved = typeof params.interaction_saved === 'string' ? params.interaction_saved : ''
  const personSaved = typeof params.person_saved === 'string' ? params.person_saved : ''

  return <AdminShell active={isPartner ? 'partners' : 'crm'} surface="light">
    <div className="pb-12">
      <header className="overflow-hidden rounded-[2rem] border border-slate-900 bg-slate-950 text-white shadow-sm">
        <div className="px-6 pt-6 md:px-8 md:pt-8">
          <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 text-xs font-semibold">
            <a href="/growth-admin/crm" className={`rounded-lg px-4 py-2 transition ${!isPartner ? 'bg-white text-slate-950' : 'text-slate-300 hover:text-white'}`}>Clientes potenciales</a>
            <a href="/growth-admin/partners" className={`rounded-lg px-4 py-2 transition ${isPartner ? 'bg-white text-slate-950' : 'text-slate-300 hover:text-white'}`}>Partners & canales</a>
          </div>
        </div>
        <div className="grid gap-8 px-6 py-8 md:px-8 md:py-10 xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="max-w-4xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-300">Commercial OS · {isPartner ? 'Partnership engine' : 'Client acquisition'}</p>
            <h1 className="mt-4 text-4xl leading-tight md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>{isPartner ? 'Partners estratégicos' : 'Clientes potenciales'}</h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">{isPartner
              ? 'Consultoras, boutiques de datos, recruitment/staffing y proveedores complementarios que pueden vender más, cubrir proyectos que hoy no asumen o derivar demanda especializada a SC-Analytics.'
              : 'Empresas finales donde SC-Analytics puede resolver una decisión o proceso concreto. Una cuenta, un decisor, un servicio prioritario y una conversación personalizada.'}</p>
          </div>
          <form action="/api/growth-admin/operator-task" method="post" className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
            <input type="hidden" name="action" value="prospect"/>
            <input type="hidden" name="mode" value={mode}/>
            <input type="hidden" name="return_to" value={returnTo}/>
            <select name="limit" defaultValue="10" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm font-semibold text-white outline-none">
              <option value="10">10</option><option value="20">20</option><option value="30">30</option><option value="50">50</option>
            </select>
            <button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100">{isPartner ? 'Buscar partners' : 'Buscar clientes'}</button>
          </form>
        </div>
        <div className="border-t border-white/10 bg-white/[0.035] px-6 py-4 md:px-8">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
            <span><strong className="font-semibold text-slate-200">Contrato 1:1</strong> → {isPartner ? 'partner + decisor' : 'empresa + decisor'}</span>
            <span><strong className="font-semibold text-slate-200">LinkedIn</strong> → persona + empresa</span>
            <span><strong className="font-semibold text-slate-200">Personalización</strong> → detalle profesional + servicio + pregunta abierta</span>
            <span><strong className="font-semibold text-slate-200">CTA</strong> → conversación informativa sin coste ni compromiso</span>
          </div>
        </div>
      </header>

      {bundle.degraded && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">El CRM se ha cargado en modo seguro porque Supabase ha tardado en responder. Refresca para recuperar el detalle.</div>}
      {queued && <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800">Búsqueda encolada: <strong>{queued}</strong>. El resultado quedará guardado en Supabase.</div>}
      {interactionSaved && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">Acción guardada: <strong>{interactionSaved}</strong>.</div>}
      {personSaved && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">Contacto guardado: <strong>{personSaved}</strong>.</div>}

      {tasks.length > 0 && <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-sm">
        <span className="font-semibold text-slate-800">Últimas búsquedas</span>
        {tasks.slice(0, 4).map((task) => {
          const requested = Number(task.inputs?.limit || 0)
          const resultCount = Array.isArray(task.outputs) ? task.outputs.length : 0
          return <Pill key={task.task_id} tone={statusTone(task.status)}>{STATUS_LABELS[task.status] || task.status} · {requested || '?'}{task.status === 'completed' ? ` → ${resultCount}` : ''}</Pill>
        })}
      </div>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label={isPartner ? 'Partners activos' : 'Empresas activas'} value={activeCompanies.length} note="Cuentas por trabajar"/>
        <MetricCard label="Decisores" value={activePeople.length} tone="indigo" note="Una persona prioritaria por cuenta"/>
        <MetricCard label="Contactados" value={contactedPeople.length} tone="amber" note="Seguimiento o mensaje iniciado"/>
        <MetricCard label="Conversaciones" value={conversationPeople.length} tone="sky" note="Respuesta, follow-up o discovery"/>
        <MetricCard label={isPartner ? 'Acuerdos / pipeline' : 'Oportunidades'} value={opportunities.length} tone="green" note="Discovery, propuesta o negociación"/>
      </div>

      <section className="mt-10 rounded-3xl border border-indigo-100 bg-indigo-50/55 p-5 md:p-7">
        <SectionTitle eyebrow={isPartner ? 'Partner outreach' : 'Outreach directo'} title="A quién contactar ahora" description={isPartner
          ? 'Cada recomendación combina el hueco complementario del partner, un decisor, un detalle profesional público, el modelo de colaboración, una pregunta abierta y el mensaje sugerido.'
          : 'Cada recomendación combina el contexto real de la empresa, el decisor, un detalle profesional público, el servicio con mejor encaje, una pregunta abierta y el mensaje sugerido.'} count={activePeople.length}/>
        {activePeople.length === 0 ? <div className="rounded-2xl border border-dashed border-indigo-200 bg-white/60 p-8 text-center text-sm text-slate-500">No hay contactos activos en este motor. Ejecuta una búsqueda para generar pares 1:1.</div> : <div className="grid gap-4 xl:grid-cols-2">
          {activePeople.slice(0, 30).map((person, index) => {
            const company = person.company_id ? companyById.get(person.company_id) : undefined
            const message = person.recommended_message || actionMessageByTarget.get(person.person_id) || fallbackMessage(person, company, mode)
            return <article key={person.person_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">{index < 3 && <Pill tone="rose">Prioridad</Pill>}<Pill tone={statusTone(person.status)}>{STATUS_LABELS[person.status || 'candidate'] || person.status || 'Pendiente'}</Pill><Pill tone="indigo">fit {Number(person.relevance_score || 0).toFixed(1)}</Pill></div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-950">{person.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{person.role || 'Rol por confirmar'}{company ? ` · ${company.name}` : ''}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 text-xs font-semibold">
                  {person.linkedin_url && <a href={person.linkedin_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800">LinkedIn persona ↗</a>}
                  {company?.linkedin_url && <a href={company.linkedin_url} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-900">LinkedIn empresa ↗</a>}
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {person.contact_reason && <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600 sm:col-span-2"><strong className="text-slate-800">Por qué esta persona:</strong> {person.contact_reason}</div>}
                {person.personal_hook && <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-3 text-xs leading-5 text-sky-900"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-600">Detalle profesional personal</p><p className="mt-1">{person.personal_hook}</p></div>}
                {person.recommended_service && <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs leading-5 text-emerald-900"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600">{isPartner ? 'Capacidad a complementar' : 'Servicio a priorizar'}</p><p className="mt-1 font-semibold">{person.recommended_service}</p></div>}
                {person.open_question && <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-xs leading-5 text-amber-950 sm:col-span-2"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">Pregunta abierta</p><p className="mt-1">{person.open_question}</p></div>}
              </div>

              <details className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/45">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-indigo-700"><span>Ver plan y mensaje personalizado</span><CopyButton text={message}/></summary>
                <div className="border-t border-indigo-100 px-4 py-4"><p className="whitespace-pre-wrap text-xs leading-6 text-slate-700">{message}</p>{person.connection_note && <p className="mt-4 text-xs leading-5 text-slate-600"><strong>Nota de conexión:</strong> {person.connection_note}</p>}{person.follow_up_message && <p className="mt-3 text-xs leading-5 text-slate-600"><strong>Follow-up:</strong> {person.follow_up_message}</p>}</div>
              </details>
              <PersonQuickActions personId={person.person_id} companyId={person.company_id} currentStatus={person.status} returnTo={returnTo}/>
            </article>
          })}
        </div>}
      </section>

      <section className="mt-12">
        <SectionTitle eyebrow={isPartner ? 'Partner accounts' : 'Target accounts'} title={isPartner ? 'Partners recomendados' : 'Empresas objetivo'} description={isPartner
          ? 'El motor busca complementariedad: qué les falta, cómo podrían ampliar ticket/capacidad y qué tipo de relación tendría más sentido.'
          : 'Solo empresas finales. El objetivo es entender dónde podemos mejorar una decisión concreta, no vender todo el catálogo a todo el mundo.'} count={activeCompanies.length}/>
        {activeCompanies.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No hay cuentas activas en este motor.</div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeCompanies.slice(0, 36).map((company) => <article key={company.company_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition hover:border-indigo-200 hover:shadow-md">
            <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap gap-2"><Pill tone={statusTone(company.status)}>{STATUS_LABELS[company.status || 'candidate'] || company.status || 'Pendiente'}</Pill>{isPartner && company.partnership_model && <Pill tone="sky">{company.partnership_model.replaceAll('-', ' ')}</Pill>}</div><p className="mt-3 font-semibold text-slate-950">{company.name}</p><p className="mt-1 text-xs text-slate-500">{company.industry || 'Industria por confirmar'} · {company.country || '—'}{company.employee_range ? ` · ${company.employee_range}` : ''}</p></div><Pill tone="indigo">fit {Number(company.score || 0).toFixed(1)}</Pill></div>
            {company.score_reason && <p className="mt-4 text-xs leading-5 text-slate-600">{company.score_reason}</p>}
            {company.recommended_service && <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800"><strong>{isPartner ? 'Gap a complementar:' : 'Servicio prioritario:'}</strong> {company.recommended_service}</div>}
            {isPartner && company.partnership_value && <div className="mt-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs leading-5 text-indigo-800"><strong>Valor para ellos:</strong> {company.partnership_value}</div>}
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold">{company.linkedin_url && <a href={company.linkedin_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800">LinkedIn empresa ↗</a>}{company.website && <a href={company.website} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-900">Web ↗</a>}{company.source_url && <a href={company.source_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-700">Fuente ↗</a>}</div>
            <CompanyQuickActions companyId={company.company_id} currentStatus={company.status} returnTo={returnTo}/>
          </article>)}
        </div>}
      </section>

      {(opportunities.length > 0 || meetings.length > 0) && <section className="mt-12">
        <SectionTitle eyebrow="Pipeline real" title={isPartner ? 'Conversaciones, reuniones y acuerdos' : 'Oportunidades y reuniones'} description="Este bloque solo aparece cuando existe actividad real; no mostramos paneles vacíos como relleno." />
        <div className="grid gap-5 xl:grid-cols-2">
          {opportunities.length > 0 && <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-950">Oportunidades</p><div className="mt-4 space-y-3">{opportunities.slice(0, 12).map((item) => <div key={item.opportunity_id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3 text-xs"><div><p className="font-semibold text-slate-800">{item.name}</p><p className="mt-1 text-slate-500">{item.stage} · siguiente acción {item.next_action_at ? new Date(item.next_action_at).toLocaleString('es-ES') : 'sin fecha'}</p></div><Pill tone="green">{Number(item.probability || 0)}%</Pill></div>)}</div></div>}
          {meetings.length > 0 && <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-950">Meetings</p><div className="mt-4 space-y-3">{meetings.slice(0, 12).map((item) => <div key={item.meeting_id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3 text-xs"><div><p className="font-semibold text-slate-800">{String(item.metadata?.event_name || 'Reunión')}</p><p className="mt-1 text-slate-500">{item.starts_at ? new Date(item.starts_at).toLocaleString('es-ES') : 'Sin fecha'} · {item.provider}</p></div>{item.booking_url && <a href={item.booking_url} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600">Abrir ↗</a>}</div>)}</div></div>}
        </div>
      </section>}

      {interactions.length > 0 && <section className="mt-12">
        <SectionTitle eyebrow="Trazabilidad" title="Últimas acciones" description="Solo actividad real registrada en Supabase." />
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-100">{interactions.slice(0, 14).map((item) => <div key={item.interaction_id} className="grid gap-2 px-4 py-3 text-xs md:grid-cols-[150px_1fr_auto]"><span className="font-semibold text-slate-700">{item.kind || 'acción'}</span><span className="text-slate-600">{item.content || 'Sin nota'}</span><span className="text-slate-400">{item.occurred_at ? new Date(item.occurred_at).toLocaleString('es-ES') : ''}</span></div>)}</div></div>
      </section>}
    </div>
  </AdminShell>
}
