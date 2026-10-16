import AdminShell from '@/components/growth-admin/AdminShell'
import CalendarModeSelect from '@/components/growth-admin/CalendarModeSelect'
import { Badge, PageHeader, SectionHeading, adminPanel } from '@/components/growth-admin/AdminUi'
import { getMeetingAgenda, type BusinessMeeting } from '@/lib/commercial-meeting-agenda'

const fmt = (date: string) => new Intl.DateTimeFormat('es-ES', {dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Madrid'}).format(new Date(date))
const localKey = (date: string) => new Intl.DateTimeFormat('sv-SE', {year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Madrid'}).format(new Date(date))
const cat = (title: string) => /partner|partnership|colaboraci[oó]n|ecosystem|kodah|allion|network/i.test(title)
  ? 'Partner' : /interview|entrevista|recruit|upwork|candidat/i.test(title) ? 'Selección' : /client|cliente|discovery|sales|venta|project/i.test(title) ? 'Cliente / oportunidad' : 'Otra reunión'
const responseLabel = (r: BusinessMeeting['response']) => r === 'accepted' ? 'Aceptada' : r === 'needsAction' ? 'Respuesta pendiente' : r === 'tentative' ? 'Tentativa' : r === 'declined' ? 'Rechazada' : 'Sin respuesta comprobada'
function MeetingRow({item}:{item:BusinessMeeting}) {
  return <article id={'meet-' + item.id.replace(/[^a-zA-Z0-9]/g,'-')} className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex flex-wrap items-center gap-2"><Badge tone="blue">{cat(item.title)}</Badge>
      <Badge tone={item.response === 'accepted' ? 'green' : item.response === 'needsAction' ? 'amber' : 'slate'}>{responseLabel(item.response)}</Badge>
      <Badge>{item.source === 'google_calendar' ? 'Google Calendar' : 'CMI'}</Badge></div>
    <h3 className="mt-3 text-base font-semibold text-slate-900">{item.title}</h3>
    <p className="mt-1 text-sm text-slate-600">{fmt(item.starts_at)} · {item.account}</p>
    {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-indigo-700">Abrir convocatoria ↗</a>}
  </article>
}
function Month({first,meetings}:{first:Date;meetings:BusinessMeeting[]}) {
  const year=first.getUTCFullYear(), month=first.getUTCMonth()
  const firstWeekday=(new Date(Date.UTC(year,month,1,12)).getUTCDay()+6)%7
  const total=new Date(Date.UTC(year,month+1,0,12)).getUTCDate()
  const days=Array.from({length:firstWeekday+total},(_,i)=>i-firstWeekday+1)
  const monthTitle=new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric',timeZone:'UTC'}).format(first)
  const counts=new Map<string,number>()
  for(const e of meetings) counts.set(localKey(e.starts_at),(counts.get(localKey(e.starts_at))||0)+1)
  return <section className={adminPanel + ' p-4'}>
    <h3 className="mb-4 text-lg font-semibold capitalize text-slate-900">{monthTitle}</h3>
    <div className="grid grid-cols-7 gap-1 text-center text-xs">
      {['L','M','X','J','V','S','D'].map(d=><span key={d} className="p-1 font-semibold text-slate-400">{d}</span>)}
      {days.map((d,i)=>{if(d<1)return <div key={'blank'+i}/>;const k=year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');const n=counts.get(k)||0;return <div key={k} className={'rounded-lg border p-2 '+(n?'border-indigo-300 bg-indigo-50 text-indigo-800':'border-slate-100 text-slate-500')}><div>{d}</div>{n>0&&<div className="mt-1 text-[10px] font-bold">{n} reunión{n>1?'es':''}</div>}</div>})}
    </div>
  </section>
}

export default async function MeetingCalendarView() {
  const data = await getMeetingAgenda()
  const current = new Date()
  const upcoming = data.meetings.filter(m=>new Date(m.starts_at).getTime() >= current.getTime())
  const past = data.meetings.filter(m=>new Date(m.starts_at).getTime() < current.getTime()).reverse()
  const months=[0,1].map(n=>new Date(Date.UTC(current.getUTCFullYear(),current.getUTCMonth()+n,1,12)))
  const reloadUrl='/growth-admin/calendar?view=meetings&refresh='+Date.now()
  return <AdminShell active="calendar">
    <CalendarModeSelect value="meetings"/>
    <PageHeader eyebrow="CMI · Agenda comercial" title="Reuniones y seguimiento" description="Vista unificada de reuniones de Google Calendar y del CMI. Gmail aporta pistas para revisar, nunca reservas confirmadas por sí solo."
      actions={<a href={reloadUrl} className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">Actualizar Google Calendar y Gmail ↻</a>}/>
    <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ['Próximas reuniones',upcoming.length],['Reuniones anteriores',past.length],
        ['Invitaciones por revisar',data.mail_signals.length],['Cuentas Google consultadas',data.checked_accounts]
      ].map(([label,value])=><div key={label} className={adminPanel+' p-4'}><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}
    </section>
    {data.calendar_reconnect.length>0&&<section className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
      <strong>Para leer directamente Google Calendar hay que autorizar el permiso de calendario.</strong>
      <p className="mt-2">Las cuentas {data.calendar_reconnect.join(', ')} aún no permiten verificar todos sus eventos. Los registros del CMI y las señales de Gmail siguen visibles. La reconexión solicitará consentimiento y conservará el acceso a Gmail.</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <a className="font-semibold underline" href="/api/growth-admin/google/connect?account=corporate&return_to=%2Fgrowth-admin%2Fcalendar%3Fview%3Dmeetings">Autorizar calendario corporativo ↗</a>
        <a className="font-semibold underline" href="/api/growth-admin/google/connect?account=personal&return_to=%2Fgrowth-admin%2Fcalendar%3Fview%3Dmeetings">Autorizar calendario personal ↗</a>
      </div>
    </section>}
    {data.errors.length>0&&<section className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Lectura parcial.</strong> {data.errors.join(' ')}</section>}
    <p className="mb-5 text-xs text-slate-500">Europe/Madrid · Última consulta: {fmt(data.checked_at)}. Actualizar realiza una nueva lectura; no inventa reuniones ni escribe al calendario.</p>
    <div className="mb-8 grid gap-4 lg:grid-cols-2">{months.map(m=><Month key={m.toISOString()} first={m} meetings={data.meetings}/>)}</div>
    <section className="mb-9">
      <SectionHeading eyebrow="Agenda" title="Próximas reuniones" description="La confirmación del evento y tu respuesta a la invitación son estados diferentes." count={upcoming.length}/>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">{upcoming.length?upcoming.map(item=><MeetingRow key={item.id} item={item}/>):<p className="text-sm text-slate-500">No aparecen próximas reuniones en las fuentes disponibles. Si no has autorizado Calendar, la lista puede ser incompleta.</p>}</div>
    </section>
    <section className="mb-9">
      <SectionHeading eyebrow="Histórico" title="Reuniones anteriores" description="Últimos 90 días de las fuentes disponibles; no se deduce el resultado comercial de una reunión." count={past.length}/>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">{past.slice(0,24).map(item=><MeetingRow key={item.id} item={item}/>)}</div>
    </section>
    <section className="pb-10">
      <SectionHeading eyebrow="Gmail" title="Conversaciones e invitaciones para revisar" description="Señales detectadas en los correos recientes. Comprueba cada hilo: recibir una invitación o proponer una llamada no significa tener una reunión confirmada." count={data.mail_signals.length}/>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">{data.mail_signals.length?data.mail_signals.map(mail=><div key={mail.id} className={adminPanel+' p-4'}>
        <Badge tone="amber">Revisar en Gmail</Badge><h3 className="mt-3 text-sm font-semibold text-slate-900">{mail.subject}</h3>
        <p className="mt-1 text-xs text-slate-500">{mail.account} · {fmt(mail.received_at)}</p>
        <a className="mt-3 inline-block text-sm font-semibold text-indigo-700" href={mail.url} target="_blank" rel="noreferrer">Abrir conversación ↗</a>
      </div>):<p className="text-sm text-slate-500">No se han detectado nuevas pistas de reunión en los mensajes examinados.</p>}</div>
      <p className="mt-4 text-xs text-slate-500">Se revisa una muestra acotada de correos recientes, no todo el histórico. Confirma la hora y la aceptación en Google Calendar antes de tratar la reunión como cerrada.</p>
    </section>
  </AdminShell>
}
