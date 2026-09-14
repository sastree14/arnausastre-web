import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, EmptyState, PageHeader, SectionHeading, formatDate, publicationLabel, scheduleInputValue } from '@/components/growth-admin/AdminUi'
import { controlCenterDateKey } from '@/lib/control-center-time'
import { getRecentContent, isGrowthAdminAuthenticated } from '@/lib/growth-admin'

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
  return [
    ...Array.from({ length: mondayOffset }, () => null),
    ...Array.from({ length: count }, (_, index) => new Date(Date.UTC(year, month, index + 1, 12))),
  ]
}

const MONTHS: Record<number,string> = {1:'enero',2:'febrero',3:'marzo',4:'abril',5:'mayo',6:'junio',7:'julio',8:'agosto',9:'septiembre',10:'octubre',11:'noviembre',12:'diciembre'}
const WEEK = ['L','M','X','J','V','S','D']

export default async function CalendarPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params = await searchParams
  const monthsRaw = typeof params.months === 'string' ? Number(params.months) : 1
  const months = [1,3,6].includes(monthsRaw) ? monthsRaw : 1
  const content = await getRecentContent()
  const scheduled = content.filter((item) => item.scheduled_at && ['approved','scheduled'].includes(item.status)).sort((a,b)=>String(a.scheduled_at).localeCompare(String(b.scheduled_at)))
  const published = content.filter((item) => item.status==='published' && item.published_at).slice(0,20)
  const byDate = new Map<string, typeof scheduled>()
  scheduled.forEach((item) => { const key=controlCenterDateKey(item.scheduled_at||''); if(key) byDate.set(key,[...(byDate.get(key)||[]),item]) })

  return <AdminShell active="calendar">
    <PageHeader eyebrow="Planificación editorial" title="Calendario" description="Planifica a meses vista. Una fecha es editable, se puede quitar y cualquier pieza ya aprobada puede publicarse inmediatamente sin perder trazabilidad." actions={<a href="/growth-admin/content" className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300">Biblioteca de contenido</a>}/>
    <div className="mb-7 flex flex-wrap gap-2">{[[1,'1 mes'],[3,'3 meses'],[6,'6 meses']].map(([value,label])=><a key={value} href={`/growth-admin/calendar?months=${value}`} className={`rounded-full border px-4 py-2 text-xs ${months===value?'border-sky-700 bg-sky-950/40 text-sky-200':'border-slate-800 text-slate-500'}`}>{label}</a>)}</div>

    <div className="space-y-8">{monthKeys(months).map((start) => { const cells=daysForMonth(start); return <section key={start.toISOString()} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-5"><h2 className="mb-4 text-xl font-semibold capitalize text-white">{MONTHS[start.getUTCMonth()+1]} {start.getUTCFullYear()}</h2><div className="grid grid-cols-7 gap-1 md:gap-2">{WEEK.map((d)=><div key={d} className="px-1 py-2 text-center text-[10px] font-semibold text-slate-600">{d}</div>)}{cells.map((date,index)=>{ if(!date) return <div key={`blank-${index}`} className="min-h-24 rounded-lg bg-slate-950/20"/>; const key=date.toISOString().slice(0,10); const items=byDate.get(key)||[]; const today=key===controlCenterDateKey(new Date()); return <div key={key} className={`min-h-24 rounded-xl border p-2 ${today?'border-sky-800 bg-sky-950/20':'border-slate-800 bg-slate-950/50'}`}><div className="flex items-center justify-between"><span className={`text-xs font-semibold ${today?'text-sky-300':'text-slate-500'}`}>{date.getUTCDate()}</span>{today&&<span className="text-[8px] text-sky-400">HOY</span>}</div><div className="mt-2 space-y-1">{items.slice(0,3).map((item)=><a key={item.content_id} href={`#item-${item.content_id}`} className={`block rounded-md border px-2 py-1.5 text-[9px] leading-3 ${item.content_type==='article'?'border-violet-900 bg-violet-950/30 text-violet-200':'border-sky-900 bg-sky-950/30 text-sky-200'}`}><span className="line-clamp-2">{item.title}</span></a>)}{items.length>3&&<p className="text-[9px] text-slate-600">+{items.length-3}</p>}</div></div>})}</div></section> })}</div>

    <section className="mt-12"><SectionHeading eyebrow="Agenda editable" title="Programaciones activas" description="Reprograma, quita la fecha o publica ahora. Estas acciones sí modifican el estado operativo." count={scheduled.length}/><div className="space-y-3">{scheduled.length===0&&<EmptyState>No hay publicaciones programadas.</EmptyState>}{scheduled.map((item)=><article id={`item-${item.content_id}`} key={item.content_id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div className="min-w-0"><div className="flex flex-wrap gap-2"><Badge tone={item.content_type==='article'?'violet':'blue'}>{publicationLabel(item)}</Badge><Badge>{(item.language||'—').toUpperCase()}</Badge>{item.visual_path&&<Badge tone="green">visual</Badge>}</div><p className="mt-3 font-medium text-white">{item.title}</p><p className="mt-1 text-xs text-slate-500">{formatDate(item.scheduled_at,true)}</p></div><div className="flex flex-col gap-2 lg:flex-row"><form action="/api/growth-admin/schedule" method="post" className="flex flex-wrap gap-2"><input type="hidden" name="content_id" value={item.content_id}/><input name="scheduled_at" type="datetime-local" defaultValue={scheduleInputValue(item.scheduled_at)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200"/><button className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300">Reprogramar</button></form><form action="/api/growth-admin/schedule" method="post"><input type="hidden" name="content_id" value={item.content_id}/><input type="hidden" name="scheduled_at" value=""/><button className="rounded-lg border border-rose-900 px-3 py-2 text-xs text-rose-300">Quitar del calendario</button></form><form action="/api/growth-admin/publish-now" method="post"><input type="hidden" name="content_id" value={item.content_id}/><button className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-950">Publicar ahora</button></form><a href={`/growth-admin/preview/${item.content_id}`} className="rounded-lg border border-sky-800 px-3 py-2 text-center text-xs text-sky-300">Preview</a></div></div></article>)}</div></section>

    <section className="mt-12 pb-12"><SectionHeading eyebrow="Histórico" title="Publicaciones recientes" description="Una publicación ejecutada sale de la agenda futura y permanece en el histórico." count={published.length}/><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{published.map((item)=><div key={item.content_id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"><div className="flex gap-2"><Badge tone="green">publicada</Badge><Badge>{publicationLabel(item)}</Badge></div><p className="mt-3 line-clamp-2 text-sm font-medium text-white">{item.title}</p><p className="mt-2 text-xs text-slate-600">{formatDate(item.published_at,true)}</p>{item.external_post_url&&<a href={item.external_post_url} target="_blank" className="mt-3 inline-block text-xs text-emerald-300">Ver publicado ↗</a>}</div>)}</div></section>
  </AdminShell>
}
