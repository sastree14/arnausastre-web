import Link from 'next/link'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import DailyVoiceNote from '@/components/growth-admin/DailyVoiceNote'
import DailyTaskBoard from '@/components/growth-admin/DailyTaskBoard'
import DailyRelationships, { type DailyRelation } from '@/components/growth-admin/DailyRelationships'
import { Badge, PageHeader, adminPanel } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated, queryGrowthTable } from '@/lib/growth-admin'
import { getMeetingAgenda, type BusinessMeeting } from '@/lib/commercial-meeting-agenda'
import { getGmailConnections } from '@/lib/growth-integrations'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type DayTask = {
  id: string
  title: string
  details: string
  lane: string
  status: string
  source: string
  due_on?: string|null
  scheduled_on?: string|null
  waiting_until?: string|null
  priority: number
  followup_count: number
  contact_email?: string|null
  related_url?: string|null
  related_document_url?: string|null
  metadata?: Record<string,unknown>|null
  completed_at?: string|null
}
type DayMeetingSnapshot = {id:string;title:string;starts_at:string;ends_at:string;status:string;calendar_url:string;source_checked_at:string;notes?:string}
type DayNote = {id:string;title:string;body:string;contact_email?:string|null;audio_path?:string|null;transcription_state?:string;created_at:string}
type DaySettings = {max_meetings_per_day:number;default_meeting_minutes:number;max_tasks_per_day:number;timezone:string}
type GmailConnection = {provider_subject:string;account_type?:string;metadata?:Record<string,unknown>}
const input = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400'
const primary = 'rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800'
const action = '/api/growth-admin/dia-a-dia'
function todayInMadrid() {
  return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
}
function addDays(value:string,n:number) {
  const d=new Date(value+'T12:00:00Z')
  d.setUTCDate(d.getUTCDate()+n)
  return d.toISOString().slice(0,10)
}
function localDay(datetime:string) {return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(datetime))}
function localTime(datetime:string){return new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(datetime))}
function localDate(datetime:string){return new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',weekday:'short',day:'numeric',month:'short'}).format(new Date(datetime))}

function Empty({children}:{children:React.ReactNode}) {return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">{children}</div>}

export default async function DayToDayPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params=await searchParams
  const date=todayInMadrid(), weekEnd=addDays(date,7)
  const [taskRows,noteRows,settingRows,agendaResult,connections,snapshotRows,relationRows]=await Promise.all([
    queryGrowthTable<DayTask>('day_tasks',{tenant_id:'eq.sc-analytics',order:'created_at.desc',limit:'500'},{cacheSeconds:0}).catch(()=>[] as DayTask[]),
    queryGrowthTable<DayNote>('day_notes',{tenant_id:'eq.sc-analytics',order:'created_at.desc',limit:'16'},{cacheSeconds:0}).catch(()=>[] as DayNote[]),
    queryGrowthTable<DaySettings>('day_settings',{tenant_id:'eq.sc-analytics',limit:'1'},{cacheSeconds:0}).catch(()=>[] as DaySettings[]),
    getMeetingAgenda().catch(()=>null),
    getGmailConnections().catch(()=>[] as GmailConnection[]),
    queryGrowthTable<DayMeetingSnapshot>('day_meetings',{tenant_id:'eq.sc-analytics',order:'starts_at.asc',limit:'200'},{cacheSeconds:0}).catch(()=>[] as DayMeetingSnapshot[]),
    queryGrowthTable<DailyRelation>('day_relationships',{tenant_id:'eq.sc-analytics',order:'display_name.asc',limit:'120'},{cacheSeconds:0}).catch(()=>[] as DailyRelation[]),
  ])
  const settings=settingRows[0]||{max_meetings_per_day:3,default_meeting_minutes:30,max_tasks_per_day:6,timezone:'Europe/Madrid'}
  const active=taskRows.filter(t=>t.status==='open'||t.status==='in_progress')
  const waits=taskRows.filter(t=>t.status==='waiting')
  const dueFollowups=waits.filter(t=>Boolean(t.waiting_until)&&String(t.waiting_until)<=date&&Number(t.followup_count||0)<2)
  const dueWork=active.filter(t=>
    (t.scheduled_on && t.scheduled_on<=date)
    ||(t.due_on&&t.due_on<=date)
    ||(t.lane==='today'&&!t.scheduled_on&&!t.due_on)
  )
  const todayTasks=[...dueFollowups,...dueWork].sort((a,b)=>
    Number(a.priority)-Number(b.priority)
    || String(a.scheduled_on||a.waiting_until||'').localeCompare(String(b.scheduled_on||b.waiting_until||''))
  )
  const week=active.filter(t=>!todayTasks.some(x=>x.id===t.id)&&((t.scheduled_on&&t.scheduled_on<=weekEnd)||(t.due_on&&t.due_on<=weekEnd)||t.lane==='week'))
  const waiting=waits.filter(t=>!dueFollowups.some(x=>x.id===t.id)).sort((a,b)=>String(a.waiting_until||'').localeCompare(String(b.waiting_until||'')))
  // Calendar-authorized live items take precedence, otherwise use a verified snapshot.
  // A stale CRM meeting never overrides the most recent authenticated calendar observation.
  const liveCalendar=(agendaResult?.meetings||[]).filter(m=>m.source==='google_calendar'&&m.response!=='declined')
  const liveIds=new Set(liveCalendar.map(m=>m.calendar_event_id).filter(Boolean))
  const snapshots=snapshotRows.filter(s=>s.status!=='cancelled'&&!liveIds.has(s.id)).map(s=>({
    id:'snapshot:'+s.id, title:s.title, starts_at:s.starts_at, ends_at:s.ends_at,
    url:s.calendar_url, account:'Agenda verificada', source:'google_calendar' as const,
    status:s.status, calendar_event_id:s.id,
    response:(s.status==='needs_reschedule'?'tentative':'accepted') as BusinessMeeting['response'],
  }))
  const snapshotIds=new Set(snapshotRows.map(s=>s.id))
  const snapshotTimes=new Set(snapshots.map(s=>s.starts_at+'|'+s.title.toLowerCase()))
  const crmOnly=(agendaResult?.meetings||[]).filter(m=>
    m.source==='crm'&&m.response!=='declined'
    &&(!m.calendar_event_id||!snapshotIds.has(m.calendar_event_id))
    &&!snapshotTimes.has(m.starts_at+'|'+m.title.toLowerCase())
  )
  const meetings=[...liveCalendar,...snapshots,...crmOnly].filter(m=>localDay(m.starts_at)>=date&&localDay(m.starts_at)<=weekEnd)
    .sort((a,b)=>a.starts_at.localeCompare(b.starts_at))
  const newestSnapshot=snapshotRows.reduce((latest,s)=>s.source_checked_at>latest?s.source_checked_at:latest,'')
  const snapshotsStale=!newestSnapshot||!Number.isFinite(Date.parse(newestSnapshot))||Date.now()-Date.parse(newestSnapshot)>36*60*60*1000
  const meetingsToday = meetings.filter(m=>localDay(m.starts_at)===date)
  const gmailState=connections.filter(c=>c.provider_subject&&c.provider_subject.includes('@')).map(c=>{
    const meta=(c.metadata?.gmail_sync||{}) as Record<string,unknown>
    const success=String(meta.last_success_at||'')
    const stale=!success||Date.now()-Date.parse(success)>24*60*60*1000
    return {account:c.provider_subject,last:success,stale,error:String(meta.last_error||'')}
  })

  return <AdminShell active="day-to-day">
    <PageHeader eyebrow="Trabajo diario · SC-Analytics" title="Día a día" description="Trabajo diario sin ruido: las reuniones, las tareas, las relaciones profesionales y el buzón tienen sus propios espacios." actions={<Link href="/growth-admin/inbox" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950">Buzón</Link>}/>
    {typeof params.result==='string'&&<p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Cambio guardado correctamente.</p>}
    {typeof params.error==='string'&&<p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">No se ha podido completar la acción: {params.error}</p>}
    <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ['Para hoy',todayTasks.length,'Incluye tareas de días anteriores'],
        ['Esta semana',week.length,'Preparación y trabajo planificado'],
        ['Esperando',waiting.length,'Sin presión hasta su fecha'],
        ['Reuniones 7 días',meetings.length,'Según las fuentes de agenda disponibles'],
      ].map(([label,count,sub])=><div key={String(label)} className={adminPanel+' p-4'}><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-3xl font-semibold text-slate-950">{count}</p><p className="mt-1 text-xs text-slate-500">{sub}</p></div>)}
    </section>
    {(gmailState.some(c=>c.stale)||!gmailState.length)&&<section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-semibold text-amber-900">El correo del CMI no está actualizado</p>
      <p className="mt-1 text-xs leading-5 text-amber-800">No generamos seguimientos automáticos a partir de mensajes antiguos. Puedes consultar Gmail directamente mientras se restablece la sincronización.</p>
      {gmailState.map(c=><p key={c.account} className="mt-1 text-xs text-amber-800">{c.account}: {c.last?'última revisión '+localDate(c.last):'sin revisión confirmada'} {c.error?'· error en conexión':''}</p>)}
      <Link href="/growth-admin/inbox" className="mt-2 inline-block text-xs font-semibold text-amber-900 underline">Revisar conexiones de Gmail</Link>
    </section>}
    <section id="reuniones" className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Agenda · Independiente de las tareas</p><h2 className="mt-1 text-2xl font-semibold text-slate-950">Reuniones</h2></div>
        <Badge tone="blue">Límite preferido: {settings.max_meetings_per_day}/día</Badge>
      </div>
      <p className="mt-2 text-xs text-slate-500">Aquí solo se muestra cuándo y con quién tienes una reunión, sin enlaces de acceso ni casillas de tareas. Para conectarte, utiliza Google Calendar.</p>
      {agendaResult?.calendar_authorized===0&&<p className="mt-2 text-xs text-amber-700">El CMI usa reuniones verificadas desde ChatGPT porque su conexión propia no tiene aún permiso de Calendar.</p>}
      {snapshotsStale&&<p className="mt-1 text-xs text-amber-700">La copia de Google Calendar tiene más de 36 horas: verifica cualquier cambio directamente en tu calendario.</p>}
      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div><h3 className="mb-3 text-sm font-semibold text-slate-900">Hoy · {meetingsToday.length}</h3>
          <div className="space-y-2">{meetingsToday.length?meetingsToday.map(m=><div key={m.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-900">{m.title}</p>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-indigo-700">{localTime(m.starts_at)}</span>
          </div>):<Empty>No hay reuniones registradas hoy.</Empty>}</div>
        </div>
        <div><h3 className="mb-3 text-sm font-semibold text-slate-900">Próximos siete días</h3>
          <div className="space-y-2">{meetings.filter(m=>localDay(m.starts_at)>date).length?meetings.filter(m=>localDay(m.starts_at)>date).map(m=><div key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3">
            <div><p className="text-sm font-medium text-slate-900">{m.title}</p><p className="mt-1 text-xs text-slate-500">{localDate(m.starts_at)}{m.status==='needs_reschedule'?' · Fecha pendiente de reprogramar':''}</p></div>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-indigo-700">{localTime(m.starts_at)}</span>
          </div>):<Empty>No hay reuniones próximas verificadas.</Empty>}</div>
        </div>
      </div>
    </section>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,1fr)]">
      <div><DailyTaskBoard initialTasks={taskRows} today={date} maxTasks={settings.max_tasks_per_day}/></div>
      <aside className="space-y-6">
        <section className={adminPanel+' p-5'}>
          <h2 className="text-lg font-semibold text-slate-950">Crear una tarea</h2>
          <p className="mb-4 mt-1 text-xs text-slate-500">Solo lo que requiere acción. Las esperas se programan sin cargar el día de mañana.</p>
          <form action={action} method="post" className="space-y-3">
            <input type="hidden" name="action" value="create"/>
            <input name="title" required maxLength={240} placeholder="¿Qué tengo que hacer?" className={input}/>
            <textarea name="details" rows={2} placeholder="Contexto, siguiente paso, compromiso…" className={input}/>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-slate-600">Dónde aparece<select name="lane" defaultValue="today" className={input+' mt-1'}><option value="today">Hoy</option><option value="week">Semana</option><option value="waiting">En espera</option></select></label>
              <label className="text-xs text-slate-600">Prioridad<select name="priority" defaultValue="2" className={input+' mt-1'}><option value="1">Alta</option><option value="2">Normal</option><option value="3">Baja</option></select></label>
              <label className="text-xs text-slate-600">Trabajar el<input name="scheduled_on" type="date" className={input+' mt-1'}/></label>
              <label className="text-xs text-slate-600">Fecha límite<input name="due_on" type="date" className={input+' mt-1'}/></label>
              <label className="text-xs text-slate-600">Revisar respuesta el<input name="waiting_until" type="date" className={input+' mt-1'}/></label>
              <label className="text-xs text-slate-600">Correo del contacto<input name="contact_email" type="email" className={input+' mt-1'}/></label>
            </div>
            <input type="url" name="related_url" placeholder="Enlace al correo o reunión" className={input}/>
            <input type="url" name="related_document_url" placeholder="Enlace a presentación o documento" className={input}/>
            <button className={primary}>Añadir tarea</button>
          </form>
        </section>
        <section className={adminPanel+' p-5'}>
          <h2 className="text-lg font-semibold text-slate-950">Preferencias de agenda</h2>
          <form action={action} method="post" className="mt-3 space-y-3">
            <input type="hidden" name="action" value="settings"/>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs text-slate-600">Reuniones/día<input type="number" name="max_meetings" min={1} max={10} defaultValue={settings.max_meetings_per_day} className={input+' mt-1'}/></label>
              <label className="text-xs text-slate-600">Minutos/reunión<select name="meeting_minutes" defaultValue={settings.default_meeting_minutes} className={input+' mt-1'}>{[15,20,30,45,60].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
              <label className="text-xs text-slate-600">Tareas/día<input type="number" name="max_tasks" min={1} max={20} defaultValue={settings.max_tasks_per_day} className={input+' mt-1'}/></label>
            </div>
            <p className="text-xs text-slate-500">Estas preferencias regulan el planificador y las recomendaciones. No modifican todavía las restricciones nativas de Calendly.</p>
            <button className={button}>Guardar preferencias</button>
          </form>
        </section>
      </aside>
    </div>
    <section className="mt-10 border-t border-slate-200 pt-8"><DailyRelationships initialRelations={relationRows}/></section>
    <section className="mt-8 grid gap-5 xl:grid-cols-2">
      <div className={adminPanel+' p-5'}>
        <h2 className="mb-3 text-xl font-semibold text-slate-950">Notas después de una reunión</h2>
        <DailyVoiceNote/>
      </div>
      <div className={adminPanel+' p-5'}>
        <h2 className="mb-3 text-xl font-semibold text-slate-950">Historial de notas</h2>
        <div className="space-y-3">{noteRows.length?noteRows.map(note=><article key={note.id} className="rounded-xl border border-slate-200 p-3">
          <p className="text-sm font-semibold text-slate-900">{note.title}</p>
          <p className="mt-1 text-xs text-slate-500">{localDate(note.created_at)} {note.contact_email&&'· '+note.contact_email}</p>
          {note.body&&<p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-600">{note.body}</p>}
          {note.audio_path&&<audio controls preload="none" className="mt-3 w-full" src={'/api/growth-admin/dia-a-dia/voice?id='+encodeURIComponent(note.id)}/>}
          {note.transcription_state==='needs_text'&&<p className="mt-1 text-xs text-amber-700">Audio guardado. Para extraer compromisos hace falta una transcripción o resumen.</p>}
        </article>):<Empty>Todavía no se han guardado notas.</Empty>}</div>
      </div>
    </section>
  </AdminShell>
}
