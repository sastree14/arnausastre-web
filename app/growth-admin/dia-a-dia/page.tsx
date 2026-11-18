import Link from 'next/link'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import DailyVoiceNote from '@/components/growth-admin/DailyVoiceNote'
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
type DayNote = {id:string;title:string;body:string;contact_email?:string|null;audio_path?:string|null;transcription_state?:string;created_at:string}
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
function safeLink(value:string|null|undefined) {
  if(!value)return ''
  try{return new URL(value).protocol==='https:'?value:''}catch{return ''}
}
const sourceLabel:Record<string,string> = {manual:'Manual',gmail:'Correo',calendar:'Agenda',chat:'Chat',meeting_note:'Reunión',automation:'Automatización'}

function TaskCard({task,today}:{task:DayTask;today:string}) {
  const waiting=task.status==='waiting'
  const readyToFollowUp=waiting && Boolean(task.waiting_until) && String(task.waiting_until)<=today && Number(task.followup_count)<2
  const late=task.status==='open'&&Boolean(task.scheduled_on)&&String(task.scheduled_on)<today
  const link=safeLink(task.related_url)
  const doc=safeLink(task.related_document_url)
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {task.priority===1&&<Badge tone="amber">Prioridad alta</Badge>}
          {late&&<Badge tone="violet">Arrastrada de otro día</Badge>}
          {readyToFollowUp&&<Badge tone="amber">Toca seguimiento</Badge>}
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{sourceLabel[task.source]||task.source}</span>
        </div>
        <p className="text-sm font-semibold leading-6 text-slate-900">{task.title}</p>
        {task.details&&<p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-600">{task.details}</p>}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          {task.due_on&&<span>Fecha límite: {task.due_on}</span>}
          {task.scheduled_on&&<span>Trabajo: {task.scheduled_on}</span>}
          {task.waiting_until&&waiting&&<span>Revisar el: {task.waiting_until}</span>}
          {task.contact_email&&<span>{task.contact_email}</span>}
          {waiting&&<span>Seguimientos: {task.followup_count}/2</span>}
        </div>
        {(link||doc)&&<div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-indigo-700">
          {link&&<a href={link} target="_blank" rel="noreferrer">Abrir conversación / evento ↗</a>}
          {doc&&<a href={doc} target="_blank" rel="noreferrer">Abrir documento ↗</a>}
        </div>}
      </div>
      <div className="flex flex-wrap justify-end gap-1.5">
        {task.status==='done'||task.status==='archived'?
          <form action={action} method="post"><input type="hidden" name="id" value={task.id}/><button name="action" value="reopen" className={button}>Reabrir</button></form>:
          <>
            {!waiting&&<form action={action} method="post"><input type="hidden" name="id" value={task.id}/><button name="action" value="done" className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white">✓ Hecha</button></form>}
            {!waiting&&<form action={action} method="post"><input type="hidden" name="id" value={task.id}/><button name="action" value="tomorrow" className={button}>Mañana</button></form>}
            {!waiting&&<form action={action} method="post"><input type="hidden" name="id" value={task.id}/><button name="action" value="wait" className={button}>En espera</button></form>}
            {waiting&&<form action={action} method="post"><input type="hidden" name="id" value={task.id}/><button name="action" value="reply_received" className={button}>Han respondido</button></form>}
            {readyToFollowUp&&<form action={action} method="post"><input type="hidden" name="id" value={task.id}/><button name="action" value="followup_sent" className={button}>Follow-up enviado</button></form>}
            <form action={action} method="post"><input type="hidden" name="id" value={task.id}/><button name="action" value="archive" className={button}>Archivar</button></form>
          </>}
      </div>
    </div>
  </div>
}
function Empty({children}:{children:React.ReactNode}) {return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">{children}</div>}

export default async function DayToDayPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params=await searchParams
  const date=todayInMadrid(), weekEnd=addDays(date,7)
  const [taskRows,noteRows,settingRows,agendaResult,connections]=await Promise.all([
    queryGrowthTable<DayTask>('day_tasks',{tenant_id:'eq.sc-analytics',order:'created_at.desc',limit:'500'},{cacheSeconds:0}).catch(()=>[] as DayTask[]),
    queryGrowthTable<DayNote>('day_notes',{tenant_id:'eq.sc-analytics',order:'created_at.desc',limit:'16'},{cacheSeconds:0}).catch(()=>[] as DayNote[]),
    queryGrowthTable<DaySettings>('day_settings',{tenant_id:'eq.sc-analytics',limit:'1'},{cacheSeconds:0}).catch(()=>[] as DaySettings[]),
    getMeetingAgenda().catch(()=>null),
    getGmailConnections().catch(()=>[] as GmailConnection[]),
  ])
  const settings=settingRows[0]||{max_meetings_per_day:3,default_meeting_minutes:30,max_tasks_per_day:6,timezone:'Europe/Madrid'}
  const active=taskRows.filter(t=>t.status==='open')
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
  const focus=todayTasks.slice(0,settings.max_tasks_per_day)
  const overflow=todayTasks.slice(settings.max_tasks_per_day)
  const week=active.filter(t=>!todayTasks.some(x=>x.id===t.id)&&((t.scheduled_on&&t.scheduled_on<=weekEnd)||(t.due_on&&t.due_on<=weekEnd)||t.lane==='week'))
  const waiting=waits.filter(t=>!dueFollowups.some(x=>x.id===t.id)).sort((a,b)=>String(a.waiting_until||'').localeCompare(String(b.waiting_until||'')))
  const done=taskRows.filter(t=>t.status==='done').sort((a,b)=>String(b.completed_at||'').localeCompare(String(a.completed_at||''))).slice(0,8)
  const meetings=(agendaResult?.meetings||[]).filter(m=>m.response!=='declined'&&localDay(m.starts_at)>=date&&localDay(m.starts_at)<=weekEnd)
    .sort((a,b)=>a.starts_at.localeCompare(b.starts_at))
  const meetingsToday = meetings.filter(m=>localDay(m.starts_at)===date)
  const meetingCountByDay = meetings.reduce<Record<string,number>>((acc,m)=>{const key=localDay(m.starts_at);acc[key]=(acc[key]||0)+1;return acc},{})
  const activeContacts=Array.from(new Map(taskRows.filter(t=>t.metadata?.active_conversation===true&&t.status!=='archived'&&t.contact_email).map(t=>[t.contact_email,t])).values())
  const gmailState=connections.filter(c=>c.provider_subject&&c.provider_subject.includes('@')).map(c=>{
    const meta=(c.metadata?.gmail_sync||{}) as Record<string,unknown>
    const success=String(meta.last_success_at||'')
    const stale=!success||Date.now()-Date.parse(success)>24*60*60*1000
    return {account:c.provider_subject,last:success,stale,error:String(meta.last_error||'')}
  })

  return <AdminShell active="day-to-day">
    <PageHeader eyebrow="Trabajo diario · SC-Analytics" title="Día a día" description="Una agenda para ejecutar: lo urgente hoy, el trabajo de la semana, las conversaciones en espera y las reuniones. Sin LinkedIn ni búsquedas comerciales." actions={<Link href="/growth-admin/inbox" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950">Buzón</Link>}/>
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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,1fr)]">
      <div className="space-y-8">
        <section>
          <div className="mb-3 flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">{date}</p><h2 className="mt-1 text-2xl font-semibold text-slate-950">Hoy</h2></div><Badge tone={overflow.length?'amber':'green'}>{focus.length}/{settings.max_tasks_per_day} tareas en foco</Badge></div>
          {meetingsToday.length>0&&<div className="mb-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Reuniones de hoy · {meetingsToday.length}</p>
            {meetingsToday.map(m=><div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
              <div><p className="text-sm font-semibold text-indigo-950">{localTime(m.starts_at)} · {m.title}</p><p className="mt-1 text-xs text-indigo-700">{m.source==='google_calendar'?'Verificada en Google Calendar':'Anotada en CMI (verificar)'}</p></div>
              {safeLink(m.url)&&<a href={m.url} className="text-xs font-semibold text-indigo-700 underline">Abrir convocatoria</a>}
            </div>)}
          </div>}
          <div className="space-y-2">{focus.length?focus.map(t=><TaskCard key={t.id} task={t} today={date}/>):<Empty>No hay tareas urgentes. Añade una tarea o registra los compromisos de tu última reunión.</Empty>}</div>
          {overflow.length>0&&<div className="mt-3 space-y-2"><p className="text-xs font-semibold text-amber-800">Exceso de capacidad · {overflow.length} tareas más. No se pierden; puedes aplazarlas al siguiente día.</p>{overflow.map(t=><TaskCard key={t.id} task={t} today={date}/>)}</div>}
        </section>
        <section>
          <div className="mb-3 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Próximos siete días</p><h2 className="mt-1 text-2xl font-semibold text-slate-950">Esta semana</h2></div><Badge>{week.length}</Badge></div>
          <div className="space-y-2">{week.length?week.map(t=><TaskCard key={t.id} task={t} today={date}/>):<Empty>No hay tareas planificadas para esta semana.</Empty>}</div>
        </section>
        <section>
          <div className="mb-3 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Respuestas y dependencias</p><h2 className="mt-1 text-2xl font-semibold text-slate-950">En espera</h2></div><Badge>{waiting.length}</Badge></div>
          <p className="mb-3 text-xs text-slate-500">Un correo inicial no se persigue al día siguiente. El seguimiento aparece después de la fecha de revisión; tras dos intentos sin respuesta, se archiva.</p>
          <div className="space-y-2">{waiting.length?waiting.map(t=><TaskCard key={t.id} task={t} today={date}/>):<Empty>No hay respuestas pendientes registradas.</Empty>}</div>
        </section>
        {done.length>0&&<section><h2 className="mb-3 text-xl font-semibold text-slate-950">Hechas recientemente</h2><div className="space-y-2">{done.map(t=><TaskCard key={t.id} task={t} today={date}/>)}</div></section>}
      </div>
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
          <div className="flex items-center justify-between gap-2"><h2 className="text-lg font-semibold text-slate-950">Reuniones</h2><Badge tone="blue">Máx. {settings.max_meetings_per_day} al día</Badge></div>
          <p className="mb-3 mt-1 text-xs leading-5 text-slate-500">La agenda se consulta desde tus integraciones. Las citas de CRM sin verificación de Calendar no equivalen a una reserva confirmada.</p>
          {agendaResult&&agendaResult.calendar_authorized===0&&<p className="mb-3 text-xs font-semibold text-amber-700">El CMI no puede verificar ahora mismo el calendario directamente. Comprueba la invitación en Google Calendar antes de actuar.</p>}
          <div className="space-y-3">
            {meetings.slice(0,12).map((m:BusinessMeeting)=><div key={m.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2"><p className="text-sm font-semibold text-slate-900">{m.title}</p><Badge tone={m.source==='google_calendar'?'green':'amber'}>{m.source==='google_calendar'?'Calendar':'CMI'}</Badge></div>
              <p className="mt-1 text-xs text-slate-500">{localDate(m.starts_at)} · {localTime(m.starts_at)} · {m.account}</p>
              {meetingCountByDay[localDay(m.starts_at)]>=settings.max_meetings_per_day&&<p className="mt-1 text-xs font-medium text-amber-700">Límite diario alcanzado: no proponer más reuniones este día.</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                {safeLink(m.url)&&<a className="text-xs font-semibold text-indigo-700 underline" href={m.url}>Abrir reunión</a>}
                <form action={action} method="post"><input type="hidden" name="action" value="create"/><input type="hidden" name="lane" value="week"/><input type="hidden" name="title" value={'Preparar reunión: '+m.title}/><input type="hidden" name="scheduled_on" value={addDays(localDay(m.starts_at),-1)}/><input type="hidden" name="due_on" value={localDay(m.starts_at)}/><input type="hidden" name="related_url" value={m.url||''}/><button className="text-xs font-semibold text-indigo-700 underline">Añadir preparación</button></form>
              </div>
            </div>)}
            {meetings.length===0&&<Empty>No hay reuniones próximas verificadas en las fuentes disponibles.</Empty>}
          </div>
        </section>
        <section className={adminPanel+' p-5'}>
          <h2 className="text-lg font-semibold text-slate-950">Clientes activos</h2>
          <p className="mb-3 mt-1 text-xs text-slate-500">Solo conversaciones marcadas como respondidas. Un correo enviado sin respuesta no activa al contacto.</p>
          {activeContacts.length?activeContacts.map(c=><div key={c.id} className="border-t border-slate-100 py-2 text-xs"><p className="font-semibold text-slate-800">{c.contact_email}</p><p className="text-slate-500">{c.title}</p></div>):<Empty>No hay conversaciones activas confirmadas en el planificador. La sincronización del correo debe recuperarse para detectar respuestas automáticamente.</Empty>}
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
