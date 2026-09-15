import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, EmptyState, PageHeader, SectionHeading, adminButtonPrimary, adminButtonSecondary, adminInput, adminPanel, assetUrl, formatDate, publicationLabel, scheduleInputValue, statusTone } from '@/components/growth-admin/AdminUi'
import { evaluatePublicationReadiness } from '@/lib/growth-approval'
import { getPendingApprovals, getRecentContent, getRecentEditorialBriefs, isGrowthAdminAuthenticated, type GrowthEditorialBrief } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function criticSummary(critique?: Record<string, unknown> | null) {
  if (!critique) return []
  const rows: string[] = []
  if (critique.rewrite_required === true) rows.push('Necesita reescritura')
  if (critique.contract_valid === false) rows.push('Contrato editorial inválido')
  const risk = Number(critique.generic_ai_risk || 0)
  if (risk >= 6) rows.push(`Riesgo IA ${risk.toFixed(1)}`)
  return rows
}

function gateTone(ok: boolean) {
  return ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'
}

export default async function ContentPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params = await searchParams
  const [content, briefs, approvals] = await Promise.all([getRecentContent(), getRecentEditorialBriefs(), getPendingApprovals()])
  const briefById = new Map(briefs.map((brief) => [brief.brief_id, brief]))
  const approvalByTarget = new Map(approvals.filter((row) => ['publish_post', 'publish_article'].includes(row.action_type)).map((row) => [row.target_id, row]))
  const filter = typeof params.filter === 'string' ? params.filter : 'review'
  const queued = typeof params.queued === 'string' ? params.queued : ''

  const enriched = content
    .filter((item) => !['rejected', 'failed', 'superseded_test', 'alternate'].includes(item.status))
    .map((item) => {
      const brief = item.brief_id ? briefById.get(item.brief_id) as GrowthEditorialBrief | undefined : undefined
      const readiness = evaluatePublicationReadiness(item, brief)
      const approval = approvalByTarget.get(item.content_id)
      const critic = criticSummary(item.critique)
      const needsChanges = !readiness.ready || critic.length > 0 || item.status === 'needs_review'
      return { item, brief, readiness, approval, critic, needsChanges }
    })

  const counts = {
    review: enriched.filter((row) => row.needsChanges || row.approval).length,
    ready: enriched.filter((row) => row.readiness.ready && !row.needsChanges && row.item.status !== 'published').length,
    scheduled: enriched.filter((row) => row.item.status === 'scheduled' || Boolean(row.item.scheduled_at && row.item.status !== 'published')).length,
    published: enriched.filter((row) => row.item.status === 'published').length,
  }

  const filtered = enriched.filter((row) => {
    if (filter === 'all') return true
    if (filter === 'published') return row.item.status === 'published'
    if (filter === 'scheduled') return row.item.status === 'scheduled' || Boolean(row.item.scheduled_at && row.item.status !== 'published')
    if (filter === 'ready') return row.readiness.ready && !row.needsChanges && row.item.status !== 'published'
    if (filter === 'visual') return row.readiness.visualRequired && !row.readiness.hasVisual && row.item.status !== 'published'
    return (row.needsChanges || Boolean(row.approval)) && row.item.status !== 'published'
  })

  return <AdminShell active="content">
    <PageHeader
      eyebrow="CRM · Editorial"
      title="Editorial"
      description="Un único espacio para generar, revisar, diseñar, aprobar, programar y publicar. La cola compacta enseña qué falta en cada pieza sin obligarte a recorrer una página interminable."
      actions={<>
        <form action="/api/growth-admin/operator-task" method="post">
          <input type="hidden" name="action" value="editorial_run" />
          <input type="hidden" name="max_briefs" value="1" />
          <input type="hidden" name="max_signals" value="30" />
          <input type="hidden" name="return_to" value="/growth-admin/content" />
          <button className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">+ Generar contenido</button>
        </form>
        <a href="/growth-admin/visual-studio" className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white">Visual Studio</a>
        <a href="/growth-admin/calendar" className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white">Calendario</a>
      </>}
    />

    {queued && <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800"><strong>Motor editorial activado.</strong> La tarea {queued} está en cola. Puedes seguir trabajando y refrescar en unos minutos para ver las nuevas piezas.</div>}

    <section className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <a href="/growth-admin/content?filter=review" className={`${adminPanel} p-4 transition hover:border-amber-300`}><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Revisión</p><p className="mt-2 text-3xl font-semibold text-slate-950">{counts.review}</p><p className="mt-1 text-xs text-slate-500">Cambios o decisión humana</p></a>
      <a href="/growth-admin/content?filter=ready" className={`${adminPanel} p-4 transition hover:border-emerald-300`}><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Listas</p><p className="mt-2 text-3xl font-semibold text-slate-950">{counts.ready}</p><p className="mt-1 text-xs text-slate-500">Preparadas para distribución</p></a>
      <a href="/growth-admin/content?filter=scheduled" className={`${adminPanel} p-4 transition hover:border-indigo-300`}><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Programadas</p><p className="mt-2 text-3xl font-semibold text-slate-950">{counts.scheduled}</p><p className="mt-1 text-xs text-slate-500">Ya tienen fecha</p></a>
      <a href="/growth-admin/content?filter=published" className={`${adminPanel} p-4 transition hover:border-sky-300`}><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Publicadas</p><p className="mt-2 text-3xl font-semibold text-slate-950">{counts.published}</p><p className="mt-1 text-xs text-slate-500">Histórico publicado</p></a>
    </section>

    <div className="mb-6 flex flex-wrap gap-2">
      {[
        ['review', 'Por revisar'],
        ['ready', 'Listas'],
        ['visual', 'Visual pendiente'],
        ['scheduled', 'Programadas'],
        ['published', 'Publicadas'],
        ['all', 'Todas'],
      ].map(([key, label]) => <a key={key} href={`/growth-admin/content?filter=${key}`} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${filter === key ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800'}`}>{label}</a>)}
    </div>

    <SectionHeading eyebrow="Editorial workflow" title="Cola de publicaciones" description="Cada fila resume contenido, revisión, visual, aprobación y calendario. Abre solo la pieza que quieras trabajar." count={filtered.length} />

    <div className="space-y-3">
      {filtered.length === 0 && <EmptyState>No hay piezas en este estado.</EmptyState>}
      {filtered.map(({ item, readiness, approval, critic, needsChanges }) => {
        const image = assetUrl(item)
        const canPublishNow = ['approved', 'scheduled'].includes(item.status)
        const issues = [...new Set([...critic, ...readiness.issues])]
        const reviewOk = !needsChanges
        const visualOk = !readiness.visualRequired || readiness.hasVisual
        const approvalOk = item.status === 'approved' || item.status === 'scheduled' || item.status === 'published'
        const calendarOk = Boolean(item.scheduled_at) || item.status === 'published'

        return <details key={item.content_id} className={`${adminPanel} group overflow-hidden`}>
          <summary className="cursor-pointer list-none px-5 py-4 md:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                  <Badge tone={item.content_type === 'article' ? 'violet' : 'blue'}>{publicationLabel(item)}</Badge>
                  <Badge>{(item.language || '—').toUpperCase()}</Badge>
                  {item.quality_score && <Badge tone="green">quality {Number(item.quality_score).toFixed(1)}</Badge>}
                </div>
                <h2 className="mt-3 line-clamp-1 text-base font-semibold text-slate-950 md:text-lg">{item.title}</h2>
              </div>
              <div className="flex flex-wrap gap-2 xl:justify-end">
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${gateTone(reviewOk)}`}>{reviewOk ? '✓ Revisada' : '· Cambios'}</span>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${gateTone(visualOk)}`}>{visualOk ? '✓ Visual' : '· Visual pendiente'}</span>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${gateTone(approvalOk)}`}>{approvalOk ? '✓ Aprobada' : approval ? '· Decidir' : '· Sin aprobar'}</span>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${gateTone(calendarOk)}`}>{calendarOk ? '✓ Calendario' : '· Sin fecha'}</span>
                <span className="ml-1 px-2 py-1 text-xs font-semibold text-slate-400 group-open:rotate-180">⌄</span>
              </div>
            </div>
          </summary>

          <div className="border-t border-slate-200 bg-slate-50/50 p-5 md:p-6">
            <div className="grid gap-6 xl:grid-cols-[180px_minmax(0,1fr)_360px]">
              <div>
                {image ? <a href={`/growth-admin/preview/${item.content_id}`}><img loading="lazy" decoding="async" src={image} alt={item.title} className="h-32 w-full rounded-xl border border-slate-200 bg-white object-contain" /></a> : <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 text-center text-xs text-slate-400">Sin visual</div>}
                <a href={`/growth-admin/visual-studio?content=${encodeURIComponent(item.content_id)}`} className="mt-2 block rounded-lg border border-indigo-200 bg-white px-3 py-2 text-center text-xs font-semibold text-indigo-700">{image ? 'Editar visual' : 'Diseñar visual'}</a>
              </div>

              <div className="min-w-0">
                <p className="line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.body}</p>
                {issues.length > 0 && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-semibold text-amber-800">Qué falta antes de publicar</p><div className="mt-2 flex flex-wrap gap-2">{issues.map((issue) => <span key={issue} className="rounded-full border border-amber-200 bg-white px-2 py-1 text-[10px] text-amber-700">{issue}</span>)}</div></div>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`/growth-admin/preview/${item.content_id}`} className={adminButtonSecondary}>Preview final</a>
                  <form action="/api/growth-admin/operator-task" method="post"><input type="hidden" name="action" value="rewrite_content" /><input type="hidden" name="content_id" value={item.content_id} /><input type="hidden" name="return_to" value="/growth-admin/content?filter=review" /><button className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700">Reescribir y revalidar</button></form>
                  {item.external_post_url && item.status === 'published' && <a href={item.external_post_url} target="_blank" rel="noreferrer" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">Ver publicado ↗</a>}
                </div>
              </div>

              <div className="space-y-3">
                {approval && <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4"><p className="text-xs font-semibold text-indigo-800">Decisión editorial</p><p className="mt-1 text-xs leading-5 text-indigo-700">Aprobar habilita publicación; no publica automáticamente.</p><div className="mt-3 flex gap-2"><form action="/api/growth-admin/decide" method="post"><input type="hidden" name="approval_id" value={approval.approval_id} /><input type="hidden" name="decision" value="approved" /><button disabled={!readiness.ready} className={`${adminButtonPrimary} disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500`}>Aprobar</button></form><form action="/api/growth-admin/decide" method="post"><input type="hidden" name="approval_id" value={approval.approval_id} /><input type="hidden" name="decision" value="rejected" /><button className={adminButtonSecondary}>Pedir cambios</button></form></div></div>}

                {item.status !== 'published' && <form action="/api/growth-admin/schedule" method="post" className="rounded-xl border border-slate-200 bg-white p-4"><input type="hidden" name="content_id" value={item.content_id} /><label className="text-[11px] font-medium text-slate-500">Fecha/hora · Europe/Madrid<input name="scheduled_at" type="datetime-local" defaultValue={scheduleInputValue(item.scheduled_at)} className={`mt-2 w-full ${adminInput}`} /></label><div className="mt-3 flex flex-wrap gap-2"><button className={adminButtonSecondary}>Guardar fecha</button>{item.scheduled_at && <button formAction="/api/growth-admin/schedule" name="scheduled_at" value="" className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700">Quitar</button>}</div></form>}

                <div className="flex flex-wrap items-center gap-2">{canPublishNow && <form action="/api/growth-admin/publish-now" method="post"><input type="hidden" name="content_id" value={item.content_id} /><button className={adminButtonPrimary}>Publicar ahora</button></form>}{item.scheduled_at && <span className="text-[11px] text-slate-500">{formatDate(item.scheduled_at, true)}</span>}{item.published_at && <span className="text-[11px] font-medium text-emerald-700">Publicada {formatDate(item.published_at, true)}</span>}</div>
              </div>
            </div>
          </div>
        </details>
      })}
    </div>

    <section className="mt-10 pb-12 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
      <strong className="text-slate-900">Flujo editorial:</strong> generar → revisar → diseñar visual si aplica → aprobar → programar/publicar. Todo vive aquí; “Aprobaciones” deja de ser un módulo separado.
    </section>
  </AdminShell>
}
