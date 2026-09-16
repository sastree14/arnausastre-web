import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, EmptyState, PageHeader, SectionHeading, adminButtonPrimary, adminButtonSecondary, adminInput, adminPanel, formatDate, publicationLabel, scheduleInputValue } from '@/components/growth-admin/AdminUi'
import { controlCenterDateKey } from '@/lib/control-center-time'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getWorkspaceContent } from '@/lib/editorial-workspace'

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
  const content = await getWorkspaceContent()
  const scheduled = content.filter((item) => item.scheduled_at && ['approved','scheduled'].includes(item.status)).sort((a,b)=>String(a.scheduled_at).localeCompare(String(b.scheduled_at)))
  const published = content.filter((item) => item.status==='published' && item.published_at).slice(0,20)
  const byDate = new Map<string, typeof scheduled>()
  scheduled.forEach((item) => { const key=controlCenterDateKey(item.scheduled_at||''); if(key) byDate.set(key,[...(byDate.get(key)||[]),item]) })

  return <AdminShell active="calendar">
    <PageHeader eyebrow="CRM · Editorial" title="Calendario" description="La planificación editorial vive dentro del CRM: cada publicación conserva objetivo, estado, destino y relación con el funnel. Reprogramar, quitar fecha y publicar son acciones trazables." actions={<a href="/growth-admin/content" className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">Biblioteca de contenido</a>}/>
    <div className="mb-8 flex flex-wrap gap-2">{[[1,'1 mes'],[3,'3 meses'],[6,'6 meses']].map(([value,label])=><a key={value} href={`/growth-admin/calendar?months=${value}`} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${months===value?'border-indigo-200 bg-indigo-50 text-indigo-700':'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800'}`}>{label}</a>)}</div>

    <div className="space-y-8">{monthKeys(months).map((start) => { const cells=daysForMonth(start); return <section key={start.toISOString()} className={`${adminPanel} p-4 md:p-6`}><h2 className="mb-5 text-2xl capitalize text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{MONTHS[start.getUTCMonth()+1]} {start.getUTCFullYear()}</h2><div className="grid grid-cols-7 gap-1 md:gap-2">{WEEK.map((d)=><div key={d} className="px-1 py-2 text-center text-[10px] font-semibold text-slate-400">{d}</div>)}{cells.map((date,index)=>{ if(!date) return <div key={`blank-${index}`} className="min-h-24 rounded-xl bg-slate-50"/>; const key=date.toISOString().slice(0,10); const items=byDate.get(key)||[]; const today=key===controlCenterDateKey(new Date()); return <div key={key} className={`min-h-24 rounded-xl border p-2.5 ${today?'border-indigo-200 bg-indigo-50':'border-slate-200 bg-white'}`}><div className="flex items-center justify-between"><span className={`text-xs font-semibold ${today?'text-indigo-700':'text-slate-500'}`}>{date.getUTCDate()}</span>{today&&<span className="text-[8px] font-semibold uppercase tracking-wide text-indigo-600">hoy</span>}</div><div className="mt-2 space-y-1.5">{items.slice(0,3).map((item)=><a key={item.content_id} href={`#item-${item.content_id}`} className={`block rounded-md border px-2 py-1.5 text-[9px] leading-3 ${item.content_type==='article'?'border-indigo-200 bg-indigo-50 text-indigo-700':'border-sky-200 bg-sky-50 text-sky-700'}`}><span className="line-clamp-2">{item.title}</span></a>)}{items.length>3&&<p className="text-[9px] text-slate-400">+{items.length-3}</p>}</div></div>})}</div></section> })}</div>

    <section className="mt-14"><SectionHeading eyebrow="CRM · Editorial schedule" title="Programaciones activas" description="Agenda operativa para reprogramar, quitar fecha o publicar ahora sin salir del flujo editorial." count={scheduled.length}/><div className="space-y-3">{scheduled.length===0&&<EmptyState>No hay publicaciones programadas.</EmptyState>}{scheduled.map((item)=><article id={`item-${item.content_id}`} key={item.content_id} className={`${adminPanel} p-5`}><div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"><div className="min-w-0"><div className="flex flex-wrap gap-2"><Badge tone={item.content_type==='article'?'violet':'blue'}>{publicationLabel(item)}</Badge><Badge>{(item.language||'—').toUpperCase()}</Badge>{item.visual_path&&<Badge tone="green">visual</Badge>}</div><p className="mt-3 font-semibold text-slate-950">{item.title}</p><p className="mt-1 text-xs text-slate-500">{formatDate(item.scheduled_at,true)}</p></div><div className="flex flex-col gap-2 lg:flex-row lg:items-center"><form action="/api/growth-admin/schedule" method="post" className="flex flex-wrap gap-2"><input type="hidden" name="content_id" value={item.content_id}/><input name="scheduled_at" type="datetime-local" defaultValue={scheduleInputValue(item.scheduled_at)} className={adminInput}/><button className={adminButtonSecondary}>Reprogramar</button></form><form action="/api/growth-admin/schedule" method="post"><input type="hidden" name="content_id" value={item.content_id}/><input type="hidden" name="scheduled_at" value=""/><button className="rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700">Quitar fecha</button></form><form action="/api/growth-admin/publish-now" method="post"><input type="hidden" name="content_id" value={item.content_id}/><button className={adminButtonPrimary}>Publicar ahora</button></form><a href={`/growth-admin/preview/${item.content_id}`} className={adminButtonSecondary}>Preview</a></div></div></article>)}</div></section>

    <section className="mt-14 pb-12"><SectionHeading eyebrow="Histórico editorial" title="Publicaciones desde el último reinicio" description="El histórico anterior sigue conservado para proteger publicaciones y métricas, pero este workspace solo muestra la nueva etapa editorial." count={published.length}/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{published.map((item)=><div key={item.content_id} className={`${adminPanel} p-5`}><div className="flex gap-2"><Badge tone="green">publicada</Badge><Badge>{publicationLabel(item)}</Badge></div><p className="mt-3 line-clamp-2 text-sm font-semibold text-slate-950">{item.title}</p><p className="mt-2 text-xs text-slate-500">{formatDate(item.published_at,true)}</p>{item.external_post_url&&<a href={item.external_post_url} target="_blank" className="mt-3 inline-block text-xs font-semibold text-emerald-700">Ver publicado ↗</a>}</div>)}</div></section>
  </AdminShell>
}
