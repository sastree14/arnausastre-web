import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, EmptyState, PageHeader, SectionHeading, assetUrl, formatDate, publicationLabel, scheduleInputValue, statusTone } from '@/components/growth-admin/AdminUi'
import { evaluatePublicationReadiness } from '@/lib/growth-approval'
import { getRecentContent, getRecentEditorialBriefs, isGrowthAdminAuthenticated, type GrowthEditorialBrief } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function criticSummary(critique?: Record<string, unknown> | null) {
  if (!critique) return []
  const rows: string[] = []
  if (critique.rewrite_required === true) rows.push('Rewrite requerido')
  if (critique.contract_valid === false) rows.push('Contrato inválido')
  const risk = Number(critique.generic_ai_risk || 0)
  if (risk >= 6) rows.push(`Riesgo IA ${risk.toFixed(1)}`)
  return rows
}

export default async function ContentPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params = await searchParams
  const [content, briefs] = await Promise.all([getRecentContent(), getRecentEditorialBriefs()])
  const briefById = new Map(briefs.map((brief) => [brief.brief_id, brief]))
  const filter = typeof params.filter === 'string' ? params.filter : 'active'
  const queued = typeof params.queued === 'string' ? params.queued : ''

  const filtered = content.filter((item) => {
    if (filter === 'all') return true
    if (filter === 'published') return item.status === 'published'
    if (filter === 'scheduled') return item.status === 'scheduled' || Boolean(item.scheduled_at && item.status === 'approved')
    if (filter === 'visual') {
      const brief = item.brief_id ? briefById.get(item.brief_id) : undefined
      const readiness = evaluatePublicationReadiness(item, brief)
      return readiness.visualRequired && !readiness.hasVisual && !['published','rejected','failed','alternate'].includes(item.status)
    }
    return !['rejected','failed','superseded_test'].includes(item.status)
  })

  const visuals = content.filter((item) => item.visual_path).slice(0, 12)

  return <AdminShell active="content">
    <PageHeader eyebrow="Content Operating Room" title="Contenido" description="Genera, revisa, reescribe, diseña, previsualiza, programa y publica desde una sola biblioteca. La aprobación y la publicación son estados distintos." actions={<><a href="/growth-admin#creation" className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">+ Crear contenido</a><a href="/growth-admin/visual-studio" className="rounded-lg border border-sky-800 px-4 py-2.5 text-sm text-sky-300">Visual Studio</a></>}/>
    {queued && <div className="mb-6 rounded-xl border border-sky-900 bg-sky-950/30 px-4 py-3 text-sm text-sky-200">Acción encolada: {queued}. Puedes seguir trabajando; el resultado aparecerá al refrescar cuando el worker termine.</div>}

    <div className="mb-6 flex flex-wrap gap-2">{[['active','Activas'],['visual','Visual pendiente'],['scheduled','Programadas'],['published','Publicadas'],['all','Todas']].map(([key,label]) => <a key={key} href={`/growth-admin/content?filter=${key}`} className={`rounded-full border px-3 py-2 text-xs ${filter===key?'border-sky-700 bg-sky-950/40 text-sky-200':'border-slate-800 text-slate-500 hover:text-white'}`}>{label}</a>)}</div>

    <SectionHeading eyebrow="Biblioteca" title="Publicaciones y artículos" description="Las acciones disponibles dependen del estado real de cada pieza y de sus gates de calidad/visual." count={filtered.length}/>
    <div className="space-y-4">
      {filtered.length === 0 && <EmptyState>No hay piezas en este filtro.</EmptyState>}
      {filtered.map((item) => {
        const brief = item.brief_id ? briefById.get(item.brief_id) as GrowthEditorialBrief | undefined : undefined
        const readiness = evaluatePublicationReadiness(item, brief)
        const image = assetUrl(item)
        const critic = criticSummary(item.critique)
        const canPublishNow = ['approved','scheduled'].includes(item.status)
        return <article key={item.content_id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/55">
          <div className="grid xl:grid-cols-[190px_1fr]">
            <div className="border-b border-slate-800 bg-slate-950/60 p-4 xl:border-b-0 xl:border-r">{image ? <a href={`/growth-admin/preview/${item.content_id}`}><img src={image} alt={item.title} className="h-36 w-full rounded-xl border border-slate-800 object-contain"/></a> : <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-slate-700 px-4 text-center text-xs text-slate-600">Sin visual adjunto</div>}<a href={`/growth-admin/visual-studio?content=${encodeURIComponent(item.content_id)}`} className="mt-3 block rounded-lg border border-sky-800 px-3 py-2 text-center text-xs text-sky-300">{image?'Editar visual':'Diseñar visual'}</a></div>
            <div className="p-5">
              <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
                <div className="min-w-0"><div className="flex flex-wrap gap-2"><Badge tone={statusTone(item.status)}>{item.status}</Badge><Badge tone={item.content_type==='article'?'violet':'blue'}>{publicationLabel(item)}</Badge><Badge>{(item.language||'—').toUpperCase()}</Badge><Badge>{item.publication_mode||'text_only'}</Badge>{item.quality_score && <Badge tone="green">quality {Number(item.quality_score).toFixed(1)}</Badge>}{readiness.ready && !['published','rejected'].includes(item.status) && <Badge tone="green">ready</Badge>}</div><h2 className="mt-4 text-lg font-semibold text-white">{item.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{item.body}</p>
                  {(critic.length>0 || readiness.issues.length>0) && <div className="mt-4 rounded-lg border border-amber-900/40 bg-amber-950/10 p-3"><p className="text-xs font-semibold text-amber-300">Revisión editorial</p><div className="mt-2 flex flex-wrap gap-2">{[...new Set([...critic,...readiness.issues])].map((issue) => <span key={issue} className="rounded-full bg-amber-950/50 px-2 py-1 text-[10px] text-amber-200">{issue}</span>)}</div></div>}
                  <div className="mt-4 flex flex-wrap gap-2"><a href={`/growth-admin/preview/${item.content_id}`} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white">Preview final</a>{item.external_post_url && item.status==='published' && <a href={item.external_post_url} target="_blank" rel="noreferrer" className="rounded-lg border border-emerald-800 px-3 py-2 text-xs text-emerald-300">Ver publicado ↗</a>}<form action="/api/growth-admin/operator-task" method="post"><input type="hidden" name="action" value="rewrite_content"/><input type="hidden" name="content_id" value={item.content_id}/><input type="hidden" name="return_to" value="/growth-admin/content"/><button className="rounded-lg border border-violet-800 px-3 py-2 text-xs text-violet-300">Reescribir en mi estilo</button></form></div>
                </div>
                <div className="w-full shrink-0 2xl:w-[390px]">
                  {item.status !== 'published' && <form action="/api/growth-admin/schedule" method="post" className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><input type="hidden" name="content_id" value={item.content_id}/><label className="text-[11px] text-slate-500">Fecha/hora · Europe/Madrid<input name="scheduled_at" type="datetime-local" defaultValue={scheduleInputValue(item.scheduled_at)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"/></label><div className="mt-2 flex gap-2"><button className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300">Guardar / reprogramar</button>{item.scheduled_at && <button formAction="/api/growth-admin/schedule" name="scheduled_at" value="" className="rounded-lg border border-rose-900 px-3 py-2 text-xs text-rose-300">Quitar fecha</button>}</div></form>}
                  <div className="mt-2 flex flex-wrap gap-2">{canPublishNow && <form action="/api/growth-admin/publish-now" method="post"><input type="hidden" name="content_id" value={item.content_id}/><button className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-950">Publicar ahora</button></form>}{item.scheduled_at && <span className="px-2 py-2 text-[11px] text-slate-500">Programada: {formatDate(item.scheduled_at,true)}</span>}{item.published_at && <span className="px-2 py-2 text-[11px] text-emerald-400">Publicada: {formatDate(item.published_at,true)}</span>}</div>
                </div>
              </div>
            </div>
          </div>
        </article>
      })}
    </div>

    <section className="mt-12 pb-12"><SectionHeading eyebrow="Visual Library" title="Visuales adjuntos recientes" description="Revisión rápida. Para edición abre la pieza; la preview final se revisa desde el contenido." count={visuals.length}/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visuals.map((item) => { const src=assetUrl(item); return <a key={item.content_id} href={`/growth-admin/preview/${item.content_id}`} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 transition hover:border-sky-700">{src&&<img src={src} alt={item.title} className="aspect-[16/9] w-full bg-slate-950 object-contain"/>}<div className="p-3"><p className="line-clamp-2 text-sm font-medium text-white">{item.title}</p><p className="mt-2 text-[10px] text-slate-600">{item.visual_type}</p></div></a>})}</div></section>
  </AdminShell>
}
