import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, EmptyState, PageHeader, SectionHeading, adminInput, adminPanel, formatDate, publicationLabel } from '@/components/growth-admin/AdminUi'
import { controlCenterDateKey } from '@/lib/control-center-time'
import { getMeetings, isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { collapseWebsiteArticleFamilies, getWorkspaceContent, isCanonicalEditorialItem } from '@/lib/editorial-workspace'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function monthKeys(months: number) {
  const now = new Date()
  return Array.from({ length: months }, (_, offset) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1, 12)))
}

function daysForMonth(start: Date) {
  const year = start.getUTCFullYear()
  const month = start.getUTCMonth()
  const count = new Date(Date.UTC(year, month + 1, 0, 12)).getUTCDate()
  const first = new Date(Date.UTC(year, month, 1, 12))
  const mondayOffset = (first.getUTCDay() + 6) % 7
  return [...Array.from({ length: mondayOffset }, () => null), ...Array.from({ length: count }, (_, index) => new Date(Date.UTC(year, month, index + 1, 12)))]
}

const MONTHS: Record<number,string> = {1:'enero',2:'febrero',3:'marzo',4:'abril',5:'mayo',6:'junio',7:'julio',8:'agosto',9:'septiembre',10:'octubre',11:'noviembre',12:'diciembre'}
const WEEK = ['L','M','X','J','V','S','D']

export default async function CalendarPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params = await searchParams
  const monthsRaw = typeof params.months === 'string' ? Number(params.months) : 1
  const months = [1,3,6].includes(monthsRaw) ? monthsRaw : 1

  const [rawContent, meetings] = await Promise.all([getWorkspaceContent(), getMeetings()])
  const content = collapseWebsiteArticleFamilies(rawContent.filter(isCanonicalEditorialItem))
  const scheduled = content
    .filter((item) => item.scheduled_at && ['approved','scheduled'].includes(item.status))
    .sort((a,b)=>String(a.scheduled_at).localeCompare(String(b.scheduled_at)))
  const upcomingMeetings = meetings
    .filter((item) => item.starts_at && item.status !== 'cancelled' && new Date(item.starts_at).getTime() >= Date.now())
    .sort((a,b)=>String(a.starts_at).localeCompare(String(b.starts_at)))

  const byDate = new Map<string, typeof scheduled>()
  scheduled.forEach((item) => {
    const key = controlCenterDateKey(item.scheduled_at || '')
    if (key) byDate.set(key,[...(byDate.get(key)||[]),item])
  })

  const meetingsByDate = new Map<string, typeof upcomingMeetings>()
  upcomingMeetings.forEach((item) => {
    const key = controlCenterDateKey(item.starts_at || '')
    if (key) meetingsByDate.set(key,[...(meetingsByDate.get(key)||[]),item])
  })

  return <AdminShell active="calendar">
    <PageHeader
      eyebrow="CMI · Agenda"
      title="Calendario"
      description="Publicaciones y reuniones en una sola vista. El contenido viene del sistema editorial; las citas pueden añadirse manualmente o llegar desde integraciones."
      actions={<a href="/growth-admin/content?publication=all" className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">Biblioteca</a>}
    />

    <section id="nuevo-evento" className={adminPanel + ' mb-8 p-5 md:p-6'}>
      <SectionHeading eyebrow="Agenda" title="Añadir reunión o evento" description="Para llamadas con clientes, discovery calls, reuniones internas o cualquier cita que quieras ver junto al calendario editorial."/>
      <form action="/api/growth-admin/meeting" method="post" className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_0.8fr_1.4fr_auto]">
        <input name="title" required placeholder="Título · Reunión con cliente X" className={adminInput}/>
        <input name="starts_at" type="datetime-local" required className={adminInput}/>
        <input name="notes" placeholder="Notas opcionales" className={adminInput}/>
        <button className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Añadir</button>
      </form>
    </section>

    <div className="mb-8 flex flex-wrap gap-2">
      {[[1,'1 mes'],[3,'3 meses'],[6,'6 meses']].map(([value,label]) =>
        <a key={String(value)} href={'/growth-admin/calendar?months=' + value} className={'rounded-full border px-4 py-2 text-xs font-semibold transition ' + (months===value?'border-indigo-200 bg-indigo-50 text-indigo-700':'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800')}>{label}</a>
      )}
    </div>

    <div className="space-y-8">
      {monthKeys(months).map((start) => {
        const cells=daysForMonth(start)
        return <section key={start.toISOString()} className={adminPanel + ' p-4 md:p-6'}>
          <h2 className="mb-5 text-2xl capitalize text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{MONTHS[start.getUTCMonth()+1]} {start.getUTCFullYear()}</h2>
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {WEEK.map((d)=><div key={d} className="px-1 py-2 text-center text-[10px] font-semibold text-slate-400">{d}</div>)}
            {cells.map((date,index)=>{
              if(!date) return <div key={'blank-' + index} className="min-h-24 rounded-xl bg-slate-50"/>
              const key=date.toISOString().slice(0,10)
              const items=byDate.get(key)||[]
              const dayMeetings=meetingsByDate.get(key)||[]
              const today=key===controlCenterDateKey(new Date())
              return <div key={key} className={'min-h-28 rounded-xl border p-2.5 ' + (today?'border-indigo-200 bg-indigo-50':'border-slate-200 bg-white')}>
                <div className="flex items-center justify-between">
                  <span className={'text-xs font-semibold ' + (today?'text-indigo-700':'text-slate-500')}>{date.getUTCDate()}</span>
                  {today&&<span className="text-[8px] font-semibold uppercase tracking-wide text-indigo-600">hoy</span>}
                </div>
                <div className="mt-2 space-y-1.5">
                  {items.slice(0,2).map((item)=><a key={item.content_id} href={'/growth-admin/preview/' + item.content_id} className={'block rounded-md border px-2 py-1.5 text-[9px] leading-3 ' + (item.content_type==='article'?'border-indigo-200 bg-indigo-50 text-indigo-700':'border-sky-200 bg-sky-50 text-sky-700')}><span className="line-clamp-2">{item.title}</span></a>)}
                  {dayMeetings.slice(0,2).map((item)=><div key={item.meeting_id} className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[9px] leading-3 text-emerald-800"><span className="line-clamp-2">● {String(item.metadata?.event_name || item.metadata?.name || 'Reunión')}</span></div>)}
                  {items.length + dayMeetings.length > 4 && <p className="text-[9px] text-slate-400">+{items.length + dayMeetings.length - 4}</p>}
                </div>
              </div>
            })}
          </div>
        </section>
      })}
    </div>

    <div className="mt-12 grid gap-8 xl:grid-cols-2">
      <section>
        <SectionHeading eyebrow="Editorial" title="Próximas publicaciones" description="Acceso directo al preview de cada pieza." count={scheduled.length}/>
        <div className="space-y-3">
          {scheduled.length===0&&<EmptyState>No hay publicaciones programadas.</EmptyState>}
          {scheduled.slice(0,20).map((item)=><a key={item.content_id} href={'/growth-admin/preview/' + item.content_id} className={adminPanel + ' block p-5 transition hover:border-indigo-200'}>
            <div className="flex flex-wrap gap-2"><Badge tone={item.content_type==='article'?'violet':'blue'}>{publicationLabel(item)}</Badge><Badge>{(item.language||'—').toUpperCase()}</Badge></div>
            <p className="mt-3 font-semibold text-slate-950">{item.title}</p>
            <p className="mt-1 text-xs text-slate-500">{formatDate(item.scheduled_at,true)}</p>
          </a>)}
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Agenda" title="Próximas reuniones" description="Citas manuales y reuniones sincronizadas." count={upcomingMeetings.length}/>
        <div className="space-y-3">
          {upcomingMeetings.length===0&&<EmptyState>No hay reuniones futuras guardadas.</EmptyState>}
          {upcomingMeetings.slice(0,20).map((item)=><div key={item.meeting_id} className={adminPanel + ' p-5'}>
            <div className="flex flex-wrap gap-2"><Badge tone="green">Reunión</Badge><Badge>{item.provider || 'manual'}</Badge></div>
            <p className="mt-3 font-semibold text-slate-950">{String(item.metadata?.event_name || item.metadata?.name || 'Reunión')}</p>
            <p className="mt-1 text-xs text-slate-500">{formatDate(item.starts_at,true)}</p>
            {item.metadata?.notes && <p className="mt-3 text-sm leading-6 text-slate-600">{String(item.metadata.notes)}</p>}
          </div>)}
        </div>
      </section>
    </div>
  </AdminShell>
}
