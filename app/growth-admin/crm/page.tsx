import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import CopyButton from '@/components/growth-admin/CopyButton'
import PersonQuickActions from '@/components/growth-admin/PersonQuickActions'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getCrmBundle } from '@/lib/growth-admin-performance'

export const dynamic = 'force-dynamic'

type Tone = 'slate' | 'indigo' | 'sky' | 'green' | 'amber' | 'rose'

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
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600">{eyebrow}</p>
        <h2 className="mt-2 text-3xl text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h2>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>}
      </div>
      {count !== undefined && <Pill>{count}</Pill>}
    </div>
  )
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
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <span className={`absolute inset-y-0 left-0 w-1 ${accents[tone]}`} />
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      {note && <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>}
    </div>
  )
}

function EmptyPanel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center text-sm leading-6 text-slate-500">{children}</div>
}

function statusTone(status?: string | null): Tone {
  if (status === 'published' || status === 'executed' || status === 'done' || status === 'completed') return 'green'
  if (status === 'approved' || status === 'scheduled' || status === 'queued' || status === 'running') return 'sky'
  if (status === 'needs_review' || status === 'pending') return 'amber'
  if (status === 'rejected' || status === 'failed') return 'rose'
  return 'slate'
}

const secondaryLink = 'inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50'

export default async function CrmPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params = await searchParams
  const bundle = await getCrmBundle()
  const { companies, people, actions, interactions, opportunities, meetings } = bundle
  const prospectTasks = bundle.prospect_tasks
  const companyById = new Map(companies.map((row)=>[row.company_id,row]))
  const queued = typeof params.queued==='string'?params.queued:''
  const interactionSaved = typeof params.interaction_saved==='string'?params.interaction_saved:''

  return <AdminShell active="crm" surface="light">
    <div className="pb-10">
      <header className="overflow-hidden rounded-[2rem] border border-slate-900 bg-slate-950 text-white shadow-sm">
        <div className="grid gap-8 px-6 py-8 md:px-8 md:py-10 xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="max-w-4xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-300">Commercial OS</p>
            <h1 className="mt-4 text-4xl leading-tight md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>CRM y prospecting</h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">Una vista comercial clara para pasar de empresas detectadas a personas, conversaciones, reuniones y oportunidades sin perder trazabilidad. Supabase sigue siendo la fuente de verdad; Apollo se añadirá como capa de discovery y enrichment.</p>
          </div>
          <form action="/api/growth-admin/operator-task" method="post" className="shrink-0">
            <input type="hidden" name="action" value="prospect"/>
            <input type="hidden" name="mode" value="lead"/>
            <input type="hidden" name="limit" value="10"/>
            <input type="hidden" name="return_to" value="/growth-admin/crm"/>
            <button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100">Buscar 10 leads ahora</button>
          </form>
        </div>
        <div className="border-t border-white/10 bg-white/[0.035] px-6 py-4 md:px-8">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400"><span><strong className="font-semibold text-slate-200">Discovery</strong> → empresas y personas</span><span><strong className="font-semibold text-slate-200">Human-in-the-loop</strong> → contacto manual</span><span><strong className="font-semibold text-slate-200">Pipeline</strong> → reuniones y oportunidades</span></div>
        </div>
      </header>

      {bundle.degraded&&<div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 shadow-sm">CRM cargado en modo seguro porque el backend tardó demasiado. La interfaz sigue disponible; refresca para recuperar el detalle cuando Supabase responda.</div>}
      {queued&&<div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800 shadow-sm">Prospecting encolado ({queued}). La tarea queda persistida en Supabase. El worker horario actúa como red de seguridad; mañana conectaremos el disparo inmediato para que “ahora” sea realmente inmediato.</div>}
      {interactionSaved&&<div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 shadow-sm">Acción comercial guardada en Supabase: <strong>{interactionSaved}</strong>. El historial de la persona y las interacciones recientes ya quedan trazados.</div>}

      {prospectTasks.length>0&&<section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-semibold text-slate-900">Estado del prospecting</p><p className="mt-1 text-xs text-slate-500">Las tareas no desaparecen: puedes comprobar si están en cola, ejecutándose, completadas o fallidas.</p></div>
          <div className="flex flex-wrap gap-2">{prospectTasks.slice(0,4).map((task)=><Pill key={task.task_id} tone={statusTone(task.status)}>{task.status} · {task.task_id}</Pill>)}</div>
        </div>
      </section>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Empresas" value={companies.length} note="Accounts detectadas"/>
        <MetricCard label="Personas" value={people.length} tone="indigo" note="Contactos identificados"/>
        <MetricCard label="Acciones listas" value={actions.length} tone="amber" note="Pendientes de ejecución"/>
        <MetricCard label="Oportunidades" value={opportunities.length} tone="green" note="Pipeline comercial"/>
        <MetricCard label="Reuniones" value={meetings.length} tone="sky" note="Meetings vinculadas"/>
      </div>

      <section className="mt-12 rounded-3xl border border-indigo-100 bg-indigo-50/60 p-5 md:p-7">
        <SectionTitle eyebrow="LinkedIn · human-in-the-loop" title="Checklist para ejecutar" description="El sistema prepara a quién contactar y el mensaje; tú mantienes el control de la acción externa. La idea es que esto se sienta como una bandeja de trabajo, no como una tabla técnica." count={actions.length}/>
        <div className="space-y-4">
          {actions.length===0&&<EmptyPanel>No hay acciones manuales aprobadas ahora mismo. Ejecuta prospecting o aprueba una acción comercial para que aparezca aquí.</EmptyPanel>}
          {actions.map((action)=>{const payload=action.payload||{};const person=payload.person;const msg=typeof payload.message==='string'?payload.message:'';const company=typeof payload.company==='string'?payload.company:'';return <article key={action.approval_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)] md:p-6"><div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between"><div className="min-w-0"><div className="flex flex-wrap gap-2"><Pill tone="indigo">{action.action_type}</Pill>{company&&<Pill>{company}</Pill>}</div><h3 className="mt-4 text-lg font-semibold text-slate-950">{person?.name||action.summary}</h3>{person?.role&&<p className="mt-1 text-sm text-slate-500">{person.role}</p>}{msg&&<div className="mt-4 max-w-3xl whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">{msg}</div>}</div><div className="flex shrink-0 flex-wrap gap-2">{person?.linkedin_url&&<a href={person.linkedin_url} target="_blank" rel="noreferrer" className={secondaryLink}>Abrir perfil ↗</a>}{!person?.linkedin_url&&typeof payload.linkedin_search_url==='string'&&payload.linkedin_search_url&&<a href={payload.linkedin_search_url} target="_blank" rel="noreferrer" className={secondaryLink}>Buscar LinkedIn ↗</a>}{msg&&<CopyButton text={msg}/>}<form action="/api/growth-admin/mark-executed" method="post"><input type="hidden" name="approval_id" value={action.approval_id}/><button className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800">Marcar ejecutado</button></form></div></div></article>})}
        </div>
      </section>

      <section className="mt-14">
        <div className="grid gap-8 xl:grid-cols-[1.25fr_.75fr]">
          <div>
            <SectionTitle eyebrow="Arnau Sastre" title="Personas objetivo" description="Candidatos para seguir, conectar o contactar desde el perfil personal. Cada acción que marques aquí se guarda directamente en Supabase y alimenta el historial comercial." count={people.length}/>
            <div className="grid gap-3 md:grid-cols-2">
              {people.length===0&&<div className="md:col-span-2"><EmptyPanel>Aún no hay personas. El prospecting público actual puede empezar a llenar esta cola; Apollo la enriquecerá después.</EmptyPanel></div>}
              {people.slice(0,30).map((person)=>{const company=person.company_id?companyById.get(person.company_id):undefined;return <article key={person.person_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition hover:border-slate-300 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="font-semibold text-slate-950">{person.name||'Persona por identificar'}</p><p className="mt-1 text-sm leading-5 text-slate-500">{person.role||'Rol desconocido'}{company?` · ${company.name}`:''}</p><div className="mt-3 flex flex-wrap gap-2"><Pill tone={statusTone(person.status)}>{person.status||'candidate'}</Pill>{person.relevance_score&&<Pill tone="indigo">fit {Number(person.relevance_score).toFixed(1)}</Pill>}</div></div>{person.linkedin_url?<a href={person.linkedin_url} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800">LinkedIn ↗</a>:person.public_source_url?<a href={person.public_source_url} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-slate-500 hover:text-slate-800">Fuente ↗</a>:null}</div><PersonQuickActions personId={person.person_id} companyId={person.company_id} currentStatus={person.status}/></article>})}
            </div>
          </div>
          <div>
            <SectionTitle eyebrow="SC-Analytics" title="Invitaciones a seguir" description="Una cola separada para no mezclar relaciones personales con crecimiento de página."/>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4"><p className="text-sm font-semibold text-slate-900">Preparado para activarse con Apollo</p></div>
              <div className="p-5 text-sm leading-7 text-slate-600"><p>Mañana Apollo añadirá el enrichment y la clasificación por ICP para decidir quién tiene sentido seguir/conectar desde Arnau y quién conviene invitar a seguir SC-Analytics.</p><p className="mt-4">Mientras tanto, en cada tarjeta de persona ya puedes registrar manualmente <strong>“Invitado a seguir SC-Analytics”</strong>; quedará guardado como interacción sin alterar el estado personal.</p><p className="mt-4 font-medium text-slate-800">La ejecución seguirá siendo manual mientras LinkedIn no ofrezca una vía oficial adecuada.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14 border-y border-slate-200 bg-white px-5 py-10 md:px-7">
        <SectionTitle eyebrow="Accounts" title="Empresas detectadas" description="Accounts priorizadas para investigar, enriquecer y convertir en oportunidades comerciales." count={companies.length}/>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {companies.slice(0,36).map((company)=><article key={company.company_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition hover:border-indigo-200 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="font-semibold text-slate-950">{company.name}</p><p className="mt-1 text-xs text-slate-500">{company.industry||'Industria desconocida'} · {company.country||'—'}</p></div><Pill tone="indigo">{Number(company.score||0).toFixed(1)}</Pill></div><p className="mt-4 line-clamp-3 text-xs leading-5 text-slate-500">{company.score_reason}</p><div className="mt-4 flex gap-4 text-xs font-semibold">{company.linkedin_url&&<a href={company.linkedin_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800">LinkedIn ↗</a>}{company.website&&<a href={company.website} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-800">Web ↗</a>}</div></article>)}
        </div>
      </section>

      <section className="mt-14">
        <div className="grid gap-8 xl:grid-cols-2">
          <div>
            <SectionTitle eyebrow="Pipeline" title="Oportunidades" count={opportunities.length}/>
            {opportunities.length===0?<EmptyPanel>La tabla CRM ya existe. Cuando conectemos leads, discovery calls y propuestas, aparecerán aquí con valor, probabilidad y siguiente acción.</EmptyPanel>:<div className="space-y-3">{opportunities.map((op)=><div key={op.opportunity_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><p className="font-semibold text-slate-950">{op.name}</p><Pill tone="green">{op.stage}</Pill></div><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500"><span><strong className="font-semibold text-slate-800">{Number(op.value||0).toLocaleString('es-ES')} {op.currency}</strong> valor</span><span><strong className="font-semibold text-slate-800">{Number(op.probability||0)}%</strong> probabilidad</span></div></div>)}</div>}
          </div>
          <div>
            <SectionTitle eyebrow="Calendly / reuniones" title="Meetings" count={meetings.length}/>
            {meetings.length===0?<EmptyPanel>Preparado para Calendly. Las reservas se vincularán a persona, empresa y oportunidad.</EmptyPanel>:<div className="space-y-3">{meetings.map((meeting)=><div key={meeting.meeting_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><p className="font-semibold text-slate-950">{meeting.provider}</p><Pill tone={statusTone(meeting.status)}>{meeting.status}</Pill></div><p className="mt-3 text-xs text-slate-500">{meeting.starts_at||'Sin fecha'}</p></div>)}</div>}
          </div>
        </div>
      </section>

      <section className="mt-14 pb-4">
        <SectionTitle eyebrow="Activity" title="Interacciones recientes" description="Historial operativo de contacto y actividad comercial. Aquí aparecerán tanto las acciones manuales que marques en esta pantalla como las integraciones futuras que sean comercialmente relevantes." count={interactions.length}/>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500"><tr><th className="px-5 py-3.5 font-semibold">Canal</th><th className="px-5 py-3.5 font-semibold">Tipo</th><th className="px-5 py-3.5 font-semibold">Contenido</th><th className="px-5 py-3.5 font-semibold">Fecha</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{interactions.slice(0,40).map((row)=><tr key={row.interaction_id} className="bg-white transition hover:bg-slate-50"><td className="px-5 py-4 font-medium text-slate-700">{row.channel||'—'}</td><td className="px-5 py-4 text-slate-600">{row.kind||'—'}</td><td className="max-w-xl px-5 py-4 leading-5 text-slate-600">{row.content||'—'}</td><td className="whitespace-nowrap px-5 py-4 text-slate-400">{row.occurred_at||'—'}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </AdminShell>
}
