import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import CompanyQuickActions from '@/components/growth-admin/CompanyQuickActions'
import CopyButton from '@/components/growth-admin/CopyButton'
import PersonQuickActions from '@/components/growth-admin/PersonQuickActions'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getCrmBundle } from '@/lib/growth-admin-performance'

export const dynamic = 'force-dynamic'

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
  notes?: string
  recommended_message?: string
  outreach_angle?: string
  completed_at?: string | null
  created_at?: string
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
  notes?: string
  completed_at?: string | null
  created_at?: string
}

const PERSON_TERMINAL = new Set(['completed', 'not_interested', 'discarded'])
const COMPANY_TERMINAL = new Set(['completed', 'discarded'])
const CONTACTED = new Set(['connection_requested', 'connected', 'contacted', 'replied', 'follow_up', 'discovery_proposed', 'discovery_booked'])
const CONVERSATION = new Set(['replied', 'follow_up', 'discovery_proposed', 'discovery_booked'])

const STATUS_LABELS: Record<string, string> = {
  candidate: 'Pendiente',
  researching: 'Investigando',
  followed: 'Seguido',
  contact_identified: 'Contacto identificado',
  connection_requested: 'Invitación enviada',
  connected: 'Conectado',
  contacted: 'Contactado',
  replied: 'Ha respondido',
  follow_up: 'Follow-up',
  discovery_proposed: 'Discovery propuesta',
  discovery_booked: 'Discovery agendada',
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

function SectionTitle({ eyebrow, title, description, count }: { eyebrow: string; title: string; description?: string; count?: number | string }) {
  return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600">{eyebrow}</p>
      <h2 className="mt-2 text-3xl text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h2>
      {description && <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{description}</p>}
    </div>
    {count !== undefined && <Pill>{count}</Pill>}
  </div>
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

function EmptyPanel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center text-sm leading-6 text-slate-500">{children}</div>
}

function statusTone(status?: string | null): Tone {
  if (status === 'completed' || status === 'discovery_booked') return 'green'
  if (status === 'replied' || status === 'connected' || status === 'running') return 'sky'
  if (status === 'follow_up' || status === 'contacted' || status === 'connection_requested' || status === 'researching' || status === 'queued') return 'amber'
  if (status === 'rejected' || status === 'failed' || status === 'not_interested' || status === 'discarded') return 'rose'
  if (status === 'discovery_proposed' || status === 'contact_identified' || status === 'followed') return 'indigo'
  return 'slate'
}

function roleAngle(role = '', industry = '') {
  const normalized = role.toLowerCase()
  if (/ceo|founder|owner|managing|director general/.test(normalized)) return 'Decisión, crecimiento y escalabilidad'
  if (/operations|supply|logistic|planning|inventory|procurement/.test(normalized)) return 'Forecasting, planificación y eficiencia operativa'
  if (/cfo|finance|financial|controller|risk/.test(normalized)) return 'Visibilidad financiera, riesgo y control'
  if (/data|analytics|ai|technology|cto|cio|it /.test(`${normalized} `)) return 'Data/AI, automatización e integración'
  if (/sales|marketing|growth|commercial/.test(normalized)) return 'Forecasting comercial, segmentación y automatización'
  return industry ? `Mejora de decisiones en ${industry}` : 'Mejora de decisiones con Data/AI'
}

function fallbackMessage(person: CrmPerson, company?: CrmCompany) {
  const firstName = person.name?.split(/\s+/)[0] || person.name || 'Hola'
  const companyName = company?.name || 'tu empresa'
  const industry = company?.industry ? ` en ${company.industry}` : ''
  const role = (person.role || '').toLowerCase()
  let value = 'identificar oportunidades concretas de mejora en decisiones, procesos y automatización'
  if (/operations|supply|logistic|planning|inventory|procurement/.test(role)) value = 'detectar mejoras en forecasting, planificación, inventario y eficiencia operativa'
  else if (/cfo|finance|financial|controller|risk/.test(role)) value = 'mejorar forecasting, reporting, control y toma de decisiones financieras'
  else if (/data|analytics|ai|technology|cto|cio|it /.test(`${role} `)) value = 'acelerar iniciativas Data/AI y automatización sin añadir complejidad innecesaria'
  else if (/ceo|founder|owner|managing|director general/.test(role)) value = 'detectar cuellos de botella y oportunidades de escalabilidad con Data, AI y optimización'
  return `Hola ${firstName}, he estado revisando ${companyName}${industry}. Desde SC-Analytics ayudamos a ${value}. Si te encaja, podemos hacer una discovery call sin coste para entender el contexto y ver si hay alguna oportunidad real de mejora. Si no vemos valor claro, te lo diría directamente.`
}

export default async function CrmPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params = await searchParams
  const bundle = await getCrmBundle()
  const companies = bundle.companies as unknown as CrmCompany[]
  const people = bundle.people as unknown as CrmPerson[]
  const { actions, interactions, opportunities, meetings } = bundle
  const prospectTasks = bundle.prospect_tasks
  const companyById = new Map(companies.map((row)=>[row.company_id,row]))
  const actionMessageByTarget = new Map<string, string>()
  for (const action of actions) {
    const msg = typeof action.payload?.message === 'string' ? action.payload.message : ''
    if (msg && !actionMessageByTarget.has(action.target_id)) actionMessageByTarget.set(action.target_id, msg)
  }

  const activeCompanies = companies.filter((row)=>!COMPANY_TERMINAL.has(row.status || 'candidate'))
  const activePeople = people.filter((row)=>!PERSON_TERMINAL.has(row.status || 'candidate'))
  const contactedPeople = people.filter((row)=>CONTACTED.has(row.status || ''))
  const conversationPeople = people.filter((row)=>CONVERSATION.has(row.status || ''))
  const closedPeople = people.filter((row)=>PERSON_TERMINAL.has(row.status || ''))
  const activeMeetings = meetings.filter((row)=>!['canceled','cancelled'].includes(String(row.status || '').toLowerCase()))

  const queued = typeof params.queued==='string'?params.queued:''
  const interactionSaved = typeof params.interaction_saved==='string'?params.interaction_saved:''
  const personSaved = typeof params.person_saved==='string'?params.person_saved:''

  return <AdminShell active="crm" surface="light">
    <div className="pb-10">
      <header className="overflow-hidden rounded-[2rem] border border-slate-900 bg-slate-950 text-white shadow-sm">
        <div className="grid gap-8 px-6 py-8 md:px-8 md:py-10 xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="max-w-4xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-300">Commercial OS</p>
            <h1 className="mt-4 text-4xl leading-tight md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>CRM y prospecting</h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">Motor propio de discovery público, clasificación y seguimiento comercial. Supabase es la fuente de verdad; Apollo queda como enrichment opcional, no como dependencia del sistema.</p>
          </div>
          <form action="/api/growth-admin/operator-task" method="post" className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
            <input type="hidden" name="action" value="prospect"/>
            <input type="hidden" name="mode" value="lead"/>
            <input type="hidden" name="return_to" value="/growth-admin/crm"/>
            <select name="limit" defaultValue="10" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm font-semibold text-white outline-none">
              <option value="10">10 leads</option>
              <option value="20">20 leads</option>
              <option value="30">30 leads</option>
              <option value="50">50 leads</option>
            </select>
            <button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100">Buscar leads</button>
          </form>
        </div>
        <div className="border-t border-white/10 bg-white/[0.035] px-6 py-4 md:px-8">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400"><span><strong className="font-semibold text-slate-200">Discovery</strong> → empresas + decisores</span><span><strong className="font-semibold text-slate-200">Clasificación</strong> → qué hacer con cada lead</span><span><strong className="font-semibold text-slate-200">Outreach</strong> → mensaje recomendado + acción manual</span><span><strong className="font-semibold text-slate-200">Pipeline</strong> → reuniones y oportunidades</span></div>
        </div>
      </header>

      {bundle.degraded&&<div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 shadow-sm">CRM cargado en modo seguro porque el backend tardó demasiado. Refresca para recuperar el detalle cuando Supabase responda.</div>}
      {queued&&<div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800 shadow-sm">Prospecting encolado: <strong>{queued}</strong>. La tarea queda persistida en Supabase y el estado aparece justo debajo.</div>}
      {interactionSaved&&<div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 shadow-sm">Acción guardada en Supabase: <strong>{interactionSaved}</strong>. Los contadores y el historial se actualizan con la clasificación.</div>}
      {personSaved&&<div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 shadow-sm">Contacto guardado en Supabase: <strong>{personSaved}</strong>. Ya aparece como persona vinculada a la empresa.</div>}

      {prospectTasks.length>0&&<section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-xs font-semibold text-slate-900">Estado de las búsquedas</p><p className="mt-1 text-xs text-slate-500">Cada búsqueda queda registrada: número solicitado, estado y resultado/error.</p></div>
          <div className="flex flex-wrap gap-2">{prospectTasks.slice(0,5).map((task)=>{
            const requested = Number(task.inputs?.limit || 0)
            const resultCount = Array.isArray(task.outputs) ? task.outputs.length : 0
            return <Pill key={task.task_id} tone={statusTone(task.status)}>{STATUS_LABELS[task.status] || task.status} · {requested || '?'} solicitados{task.status==='completed'?` · ${resultCount} encontrados`:''}</Pill>
          })}</div>
        </div>
      </section>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Empresas activas" value={activeCompanies.length} note="Por investigar o contactar"/>
        <MetricCard label="Personas activas" value={activePeople.length} tone="indigo" note="En la bandeja comercial"/>
        <MetricCard label="Contactadas" value={contactedPeople.length} tone="amber" note="Conexión o mensaje iniciado"/>
        <MetricCard label="Conversaciones" value={conversationPeople.length} tone="sky" note="Respuesta / follow-up / discovery"/>
        <MetricCard label="Reuniones" value={activeMeetings.length} tone="green" note="Calendly / meetings activas"/>
        <MetricCard label="Cerradas" value={closedPeople.length} tone="rose" note="Finalizadas, descartadas o no interés"/>
      </div>

      <section className="mt-12 rounded-3xl border border-indigo-100 bg-indigo-50/60 p-5 md:p-7">
        <SectionTitle eyebrow="Bandeja comercial" title="Personas por trabajar" description="Esta es la cola diaria. Ves quién es, por qué encaja, el enfoque recomendado, un mensaje inicial y un único desplegable para registrar lo que has hecho. Finalizar o descartar saca a la persona de esta bandeja, pero conserva todo el historial en Supabase." count={activePeople.length}/>
        <div className="grid gap-4 xl:grid-cols-2">
          {activePeople.length===0&&<div className="xl:col-span-2"><EmptyPanel>No hay personas activas todavía. Ejecuta una búsqueda o añade manualmente un CEO/decisor desde una empresa detectada.</EmptyPanel></div>}
          {activePeople.slice(0,40).map((person)=>{
            const company=person.company_id?companyById.get(person.company_id):undefined
            const message = person.recommended_message || actionMessageByTarget.get(person.person_id) || fallbackMessage(person, company)
            const angle = person.outreach_angle || roleAngle(person.role, company?.industry)
            return <article key={person.person_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><Pill tone={statusTone(person.status)}>{STATUS_LABELS[person.status || 'candidate'] || person.status || 'Pendiente'}</Pill>{person.relevance_score!==undefined&&<Pill tone="indigo">fit {Number(person.relevance_score || 0).toFixed(1)}</Pill>}</div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-950">{person.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{person.role || 'Rol por confirmar'}{company?` · ${company.name}`:''}</p>
                </div>
                <div className="flex shrink-0 gap-3 text-xs font-semibold">{person.linkedin_url&&<a href={person.linkedin_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800">LinkedIn ↗</a>}{person.public_source_url&&<a href={person.public_source_url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-800">Fuente ↗</a>}</div>
              </div>
              {person.evidence&&<p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600"><strong className="text-slate-800">Qué sabemos:</strong> {person.evidence}</p>}
              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">Enfoque recomendado</p><p className="mt-1 text-xs font-semibold text-slate-800">{angle}</p></div><CopyButton text={message}/></div>
                <p className="mt-3 whitespace-pre-wrap text-xs leading-6 text-slate-700">{message}</p>
                <p className="mt-3 text-[10px] leading-4 text-slate-400">Personalización por contexto empresarial y cargo. El sistema evita presión artificial o inferencias personales sensibles.</p>
              </div>
              <PersonQuickActions personId={person.person_id} companyId={person.company_id} currentStatus={person.status}/>
            </article>
          })}
        </div>
      </section>

      <section className="mt-14">
        <SectionTitle eyebrow="Accounts" title="Empresas por trabajar" description="Cada empresa puede investigarse, seguirse, marcarse como contactada, finalizarse o archivarse. Si averiguas quién es el CEO/decisor, añádelo aquí y pasará automáticamente a la bandeja de personas." count={activeCompanies.length}/>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeCompanies.length===0&&<div className="md:col-span-2 xl:col-span-3"><EmptyPanel>No hay empresas activas todavía.</EmptyPanel></div>}
          {activeCompanies.slice(0,36).map((company)=><article key={company.company_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition hover:border-indigo-200 hover:shadow-md">
            <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap gap-2"><Pill tone={statusTone(company.status)}>{STATUS_LABELS[company.status || 'candidate'] || company.status || 'Pendiente'}</Pill>{company.fit_type&&<Pill>{company.fit_type}</Pill>}</div><p className="mt-3 font-semibold text-slate-950">{company.name}</p><p className="mt-1 text-xs text-slate-500">{company.industry||'Industria desconocida'} · {company.country||'—'}{company.employee_range?` · ${company.employee_range}`:''}</p></div><Pill tone="indigo">fit {Number(company.score||0).toFixed(1)}</Pill></div>
            {company.score_reason&&<p className="mt-4 text-xs leading-5 text-slate-600">{company.score_reason}</p>}
            {Array.isArray(company.capability_gaps)&&company.capability_gaps.length>0&&<div className="mt-3 flex flex-wrap gap-1.5">{company.capability_gaps.slice(0,3).map((gap)=><Pill key={gap} tone="amber">{gap}</Pill>)}</div>}
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold">{company.linkedin_url&&<a href={company.linkedin_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800">LinkedIn ↗</a>}{company.website&&<a href={company.website} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-900">Web ↗</a>}{company.source_url&&<a href={company.source_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-700">Fuente ↗</a>}</div>
            <CompanyQuickActions companyId={company.company_id} currentStatus={company.status}/>
          </article>)}
        </div>
      </section>

      <section className="mt-14 grid gap-8 xl:grid-cols-2">
        <div>
          <SectionTitle eyebrow="Registro" title="Personas detectadas" description="Histórico completo. Las personas finalizadas o descartadas desaparecen de la bandeja de trabajo, no de la base de datos." count={people.length}/>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto"><table className="min-w-full text-left text-xs"><thead className="border-b border-slate-200 bg-slate-50 text-slate-500"><tr><th className="px-4 py-3 font-semibold">Persona</th><th className="px-4 py-3 font-semibold">Empresa</th><th className="px-4 py-3 font-semibold">Estado</th><th className="px-4 py-3 font-semibold">Fit</th></tr></thead><tbody className="divide-y divide-slate-100">{people.slice(0,100).map((person)=>{const company=person.company_id?companyById.get(person.company_id):undefined;return <tr key={person.person_id} className="hover:bg-slate-50"><td className="px-4 py-3"><div className="font-semibold text-slate-800">{person.name}</div><div className="mt-0.5 text-slate-500">{person.role||'—'}</div></td><td className="px-4 py-3 text-slate-600">{company?.name||'—'}</td><td className="px-4 py-3"><Pill tone={statusTone(person.status)}>{STATUS_LABELS[person.status||'candidate']||person.status||'Pendiente'}</Pill></td><td className="px-4 py-3 text-slate-600">{Number(person.relevance_score||0).toFixed(1)}</td></tr>})}</tbody></table></div>
          </div>
        </div>
        <div>
          <SectionTitle eyebrow="Registro" title="Empresas detectadas" description="Histórico de accounts con su clasificación actual. Descartar equivale a archivar: mantenemos trazabilidad en lugar de borrar información comercial." count={companies.length}/>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto"><table className="min-w-full text-left text-xs"><thead className="border-b border-slate-200 bg-slate-50 text-slate-500"><tr><th className="px-4 py-3 font-semibold">Empresa</th><th className="px-4 py-3 font-semibold">Industria</th><th className="px-4 py-3 font-semibold">Estado</th><th className="px-4 py-3 font-semibold">Fit</th></tr></thead><tbody className="divide-y divide-slate-100">{companies.slice(0,100).map((company)=><tr key={company.company_id} className="hover:bg-slate-50"><td className="px-4 py-3 font-semibold text-slate-800">{company.name}</td><td className="px-4 py-3 text-slate-600">{company.industry||'—'}</td><td className="px-4 py-3"><Pill tone={statusTone(company.status)}>{STATUS_LABELS[company.status||'candidate']||company.status||'Pendiente'}</Pill></td><td className="px-4 py-3 text-slate-600">{Number(company.score||0).toFixed(1)}</td></tr>)}</tbody></table></div>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="grid gap-8 xl:grid-cols-2">
          <div>
            <SectionTitle eyebrow="Pipeline" title="Oportunidades" count={opportunities.length}/>
            {opportunities.length===0?<EmptyPanel>Cuando una conversación pase a discovery/propuesta, la convertiremos en oportunidad con valor, probabilidad y siguiente acción.</EmptyPanel>:<div className="space-y-3">{opportunities.map((op)=><div key={op.opportunity_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><p className="font-semibold text-slate-950">{op.name}</p><Pill tone="green">{op.stage}</Pill></div><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500"><span><strong className="font-semibold text-slate-800">{Number(op.value||0).toLocaleString('es-ES')} {op.currency}</strong> valor</span><span><strong className="font-semibold text-slate-800">{Number(op.probability||0)}%</strong> probabilidad</span></div></div>)}</div>}
          </div>
          <div>
            <SectionTitle eyebrow="Calendly / reuniones" title="Meetings" count={meetings.length}/>
            {meetings.length===0?<EmptyPanel>Calendly alimentará este bloque cuando alguien acepte una discovery o reunión comercial.</EmptyPanel>:<div className="space-y-3">{meetings.map((meeting)=><div key={meeting.meeting_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><p className="font-semibold text-slate-950">{meeting.provider}</p><Pill tone={statusTone(meeting.status)}>{meeting.status}</Pill></div><p className="mt-3 text-xs text-slate-500">{meeting.starts_at||'Sin fecha'}</p></div>)}</div>}
          </div>
        </div>
      </section>

      <section className="mt-14 pb-4">
        <SectionTitle eyebrow="Activity" title="Interacciones recientes" description="Timeline operativa. Seguimientos, invitaciones, mensajes, respuestas, notas, reuniones y futuras interacciones de Gmail terminan aquí sin duplicar el CRM." count={interactions.length}/>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-full text-left text-xs"><thead className="border-b border-slate-200 bg-slate-50 text-slate-500"><tr><th className="px-5 py-3.5 font-semibold">Canal</th><th className="px-5 py-3.5 font-semibold">Tipo</th><th className="px-5 py-3.5 font-semibold">Contenido</th><th className="px-5 py-3.5 font-semibold">Fecha</th></tr></thead><tbody className="divide-y divide-slate-100">{interactions.slice(0,60).map((row)=><tr key={row.interaction_id} className="bg-white transition hover:bg-slate-50"><td className="px-5 py-4 font-medium text-slate-700">{row.channel||'—'}</td><td className="px-5 py-4 text-slate-600">{row.kind||'—'}</td><td className="max-w-xl px-5 py-4 leading-5 text-slate-600">{row.content||'—'}</td><td className="whitespace-nowrap px-5 py-4 text-slate-400">{row.occurred_at||'—'}</td></tr>)}</tbody></table></div></div>
      </section>
    </div>
  </AdminShell>
}
