import Link from 'next/link'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import DailyWorkspaceTabs from '@/components/growth-admin/DailyWorkspaceTabs'
import DailyTaskBoard from '@/components/growth-admin/DailyTaskBoard'
import DailyRelationships, { type DailyRelation, type DailyRelationNote } from '@/components/growth-admin/DailyRelationships'
import { PageHeader, adminPanel } from '@/components/growth-admin/AdminUi'
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
  updated_at?: string|null
}
type DayMeetingSnapshot = {id:string;title:string;starts_at:string;ends_at:string;status:string;calendar_url:string;source_checked_at:string;notes?:string}
type DaySettings = {max_meetings_per_day:number;default_meeting_minutes:number;max_tasks_per_day:number;timezone:string}
type GmailConnection = {provider_subject:string;account_type?:string;metadata?:Record<string,unknown>}
const button = 'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50'
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

function isSnapshotOlderThan(value:string,hours:number){const stamp=Date.parse(value);return !Number.isFinite(stamp)||Date.now()-stamp>hours*60*60*1000}

function Empty({children}:{children:React.ReactNode}) {return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">{children}</div>}

export default async function DayToDayPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params=await searchParams
  const date=todayInMadrid(), weekEnd=addDays(date,7)
  const [taskRows,settingRows,agendaResult,connections,snapshotRows,relationRows,noteRows]=await Promise.all([
    queryGrowthTable<DayTask>('day_tasks',{tenant_id:'eq.sc-analytics',order:'created_at.desc',limit:'500'},{cacheSeconds:0}).catch(()=>[] as DayTask[]),
    queryGrowthTable<DaySettings>('day_settings',{tenant_id:'eq.sc-analytics',limit:'1'},{cacheSeconds:0}).catch(()=>[] as DaySettings[]),
    getMeetingAgenda().catch(()=>null),
    getGmailConnections().catch(()=>[] as GmailConnection[]),
    queryGrowthTable<DayMeetingSnapshot>('day_meetings',{tenant_id:'eq.sc-analytics',order:'starts_at.asc',limit:'200'},{cacheSeconds:0}).catch(()=>[] as DayMeetingSnapshot[]),
    queryGrowthTable<DailyRelation>('day_relationships',{tenant_id:'eq.sc-analytics',order:'display_name.asc',limit:'120'},{cacheSeconds:0}).catch(()=>[] as DailyRelation[]),
    queryGrowthTable<DailyRelationNote>('day_notes',{tenant_id:'eq.sc-analytics',order:'created_at.desc',limit:'200'},{cacheSeconds:0}).catch(()=>[] as DailyRelationNote[]),
  ])
  const settings=settingRows[0]||{max_meetings_per_day:3,default_meeting_minutes:30,max_tasks_per_day:6,timezone:'Europe/Madrid'}
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
  const snapshotsStale=!newestSnapshot||isSnapshotOlderThan(newestSnapshot,36)
  const meetingDays=Array.from({length:8},(_,index)=>{const day=addDays(date,index);return {day,index,rows:meetings.filter(m=>localDay(m.starts_at)===day)}}).filter(d=>d.index===0||d.rows.length>0)
  const gmailState=connections.filter(c=>c.provider_subject&&c.provider_subject.includes('@')).map(c=>{
    const meta=(c.metadata?.gmail_sync||{}) as Record<string,unknown>
    const success=String(meta.last_success_at||'')
    const stale=!success||isSnapshotOlderThan(success,24)
    return {account:c.provider_subject,last:success,stale,error:String(meta.last_error||'')}
  })

  return <AdminShell active="day-to-day">
    <PageHeader eyebrow="Trabajo diario · SC-Analytics" title="Día a día" description="Urgentes para hoy y mañana, pendientes adicionales y relaciones actualizadas. Solo aparece trabajo que requiere una acción." actions={<Link href="/growth-admin/inbox" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950">Buzón</Link>}/>
    {typeof params.result==='string'&&<p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Cambio guardado correctamente.</p>}
    {typeof params.error==='string'&&<p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">No se ha podido completar la acción: {params.error}</p>}
    <DailyWorkspaceTabs
      tasks={<>
    {(gmailState.some(c=>c.stale)||!gmailState.length)&&<details className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      <summary className="cursor-pointer font-semibold">Aviso de sincronización: el buzón propio del CMI está desactualizado · ver detalles</summary>
      <p className="mt-2 leading-5">No se generan acciones a partir de mensajes antiguos. Las conexiones Gmail de ChatGPT se comprueban por separado.</p>
      {gmailState.map(s=><p key={s.account} className="mt-1">{s.account}: {s.last?'última revisión '+localDate(s.last):'sin revisión confirmada'}</p>)}
      <Link href="/growth-admin/inbox" className="mt-2 inline-block underline">Revisar sincronización</Link>
    </details>}
    <div className="space-y-6">
      <div><DailyTaskBoard key={taskRows.reduce((latest,t)=>t.updated_at&&t.updated_at>latest?t.updated_at:latest,'')+':'+taskRows.length} initialTasks={taskRows} today={date} maxTasks={settings.max_tasks_per_day}/></div>
      <aside className="grid gap-4 lg:grid-cols-2">
        <details id="crear-tarea" className={adminPanel+' p-5'}>
          <summary className="cursor-pointer text-sm font-semibold text-slate-950">+ Crear una tarea</summary>
          <p className="mb-4 mt-1 text-xs text-slate-500">Solo acciones concretas. Esperar respuestas se gestiona en Clientes y colaboradores.</p>
          <form action={action} method="post" className="space-y-3">
            <input type="hidden" name="action" value="create"/>
            <input name="title" required maxLength={240} placeholder="¿Qué tengo que hacer?" className={input}/>
            <textarea name="details" rows={2} placeholder="Contexto, siguiente paso, compromiso…" className={input}/>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-slate-600">Tipo de tarea
                <select name="task_bucket" defaultValue="pending" className={input+' mt-1'}>
                  <option value="pending">Pendiente adicional</option>
                  <option value="urgent">Urgente / priorizar hoy</option>
                </select>
              </label>
              <label className="text-xs text-slate-600">Prioridad<select name="priority" defaultValue="2" className={input+' mt-1'}><option value="1">Alta</option><option value="2">Normal</option><option value="3">Baja</option></select></label>
              <label className="text-xs text-slate-600">Trabajar el<input name="scheduled_on" type="date" className={input+' mt-1'}/></label>
              <label className="text-xs text-slate-600">Fecha límite<input name="due_on" type="date" className={input+' mt-1'}/></label>
              <label className="text-xs text-slate-600">Correo del contacto<input name="contact_email" type="email" className={input+' mt-1'}/></label>
            </div>
            <input type="url" name="related_url" placeholder="Enlace al correo o reunión" className={input}/>
            <input type="url" name="related_document_url" placeholder="Enlace a presentación o documento" className={input}/>
            <button className={primary}>Añadir tarea</button>
          </form>
        </details>
        <details id="preferencias-dia" className={adminPanel+' p-5'}>
          <summary className="cursor-pointer text-sm font-semibold text-slate-950">+ Preferencias de agenda</summary>
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
        </details>
      </aside>
    </div>
      </>}
      meetings={<>
    <section id="reuniones" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Reuniones</h2>
      {agendaResult?.calendar_authorized===0&&<p className="mt-1 text-xs text-amber-700">Sin permiso de Calendar en el CMI: se usan las últimas reuniones verificadas disponibles.</p>}
      {snapshotsStale&&<p className="mt-1 text-xs text-amber-700">La copia de Calendar tiene más de 36 horas: comprueba los posibles cambios.</p>}
      <div className="mt-4 space-y-5">
        {meetingDays.map(({day,index,rows})=><section key={day} className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">{index===0?'Hoy · '+localDate(day+'T12:00:00Z'):index===1?'Mañana · '+localDate(day+'T12:00:00Z'):localDate(day+'T12:00:00Z')}</h3>
          {rows.length?rows.map(m=><div key={m.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">{m.title}</p>
              {m.status==='needs_reschedule'&&<p className="mt-1 text-xs text-amber-700">Pendiente de reprogramar</p>}
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-indigo-700">{localTime(m.starts_at)}</span>
          </div>):<Empty>No tienes reuniones previstas para hoy.</Empty>}
        </section>)}
      </div>
    </section>
      </>}
      clients={<DailyRelationships key={relationRows.reduce((s,r)=>s+':'+r.id+':'+r.last_interaction_on+':'+r.status,'')+':'+noteRows.length+':'+taskRows.reduce((s,t)=>s+':'+t.id+':'+t.status,'')} initialRelations={relationRows} initialTasks={taskRows} initialNotes={noteRows}/>}
    />
  </AdminShell>
}
