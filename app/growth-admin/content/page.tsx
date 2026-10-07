import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import PublicationFilterBar from '@/components/growth-admin/PublicationFilterBar'
import { Badge, EmptyState, PageHeader, adminPanel, assetUrl, formatDate, publicationLabel, statusTone } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated, type GrowthContentItem } from '@/lib/growth-admin'
import { collapseWebsiteArticleFamilies, getWorkspaceContent, isCanonicalEditorialItem } from '@/lib/editorial-workspace'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PublicationFilter = 'upcoming' | 'scheduled' | 'published' | 'all'
type ChannelFilter = 'all' | 'linkedin' | 'website'

const textParam = (value: string | string[] | undefined, fallback = '') => typeof value === 'string' ? value : fallback

function isFigmaManual(item: GrowthContentItem) {
  return String(item.visual_strategy?.source || '') === 'figma_manual'
}

function visualUrl(item: GrowthContentItem) {
  const internal = assetUrl(item)
  if (internal) return internal
  return item.visual_path?.startsWith('http') ? item.visual_path : null
}

function isPublished(item: GrowthContentItem) {
  return item.status === 'published' || Boolean(item.published_at)
}

function isScheduled(item: GrowthContentItem) {
  return !isPublished(item) && (item.status === 'scheduled' || Boolean(item.scheduled_at))
}

function channelOf(item: GrowthContentItem): 'linkedin' | 'website' {
  return item.content_type === 'article' && item.channel === 'website' ? 'website' : 'linkedin'
}

function statusLabel(item: GrowthContentItem) {
  if (isPublished(item)) return 'Publicada'
  if (isScheduled(item)) return 'Programada'
  if (item.status === 'approved') return 'Lista'
  if (item.status === 'needs_review' || item.status === 'draft') return 'Por revisar'
  return item.status || 'Borrador'
}

function sortDate(item: GrowthContentItem) {
  const value = item.scheduled_at || item.published_at || item.created_at || ''
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER
}

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')

  const params = await searchParams
  const rawContent = await getWorkspaceContent()
  const content = collapseWebsiteArticleFamilies(rawContent.filter(isCanonicalEditorialItem))
    .filter((item) => !['rejected', 'failed', 'superseded_test', 'alternate'].includes(item.status))

  const publication = textParam(params.publication, 'all') as PublicationFilter
  const channel = textParam(params.channel, 'all') as ChannelFilter
  const q = textParam(params.q).trim().toLowerCase()

  const counts = {
    total: content.length,
    upcoming: content.filter((item) => !isPublished(item)).length,
    scheduled: content.filter(isScheduled).length,
    published: content.filter(isPublished).length,
  }

  const filtered = content
    .filter((item) => {
      const publicationOk =
        publication === 'all'
        || (publication === 'upcoming' && !isPublished(item))
        || (publication === 'scheduled' && isScheduled(item))
        || (publication === 'published' && isPublished(item))

      const channelOk = channel === 'all' || channelOf(item) === channel
      const queryOk = !q || `${item.title} ${item.body || ''}`.toLowerCase().includes(q)
      return publicationOk && channelOk && queryOk
    })
    .sort((a, b) => {
      if (isPublished(a) && isPublished(b)) {
        return String(b.published_at || b.created_at || '').localeCompare(String(a.published_at || a.created_at || ''))
      }
      if (isPublished(a) !== isPublished(b)) return isPublished(a) ? 1 : -1
      if (a.scheduled_at || b.scheduled_at) return sortDate(a) - sortDate(b)
      return String(b.created_at || '').localeCompare(String(a.created_at || ''))
    })

  return (
    <AdminShell active="content">
      <PageHeader
        eyebrow="CRM · Contenido"
        title="Biblioteca"
        description="Todas las publicaciones quedan guardadas aquí. El CRM no busca temas ni genera propuestas: conserva la pieza final, su fecha, su destino y su preview."
        actions={
          <>
            <a href="/growth-admin" className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white">
              Revisión
            </a>
            <a href="/growth-admin/articles" className="rounded-lg border border-indigo-500 px-4 py-2.5 text-sm font-semibold text-indigo-100">
              Banco de artículos
            </a>
            <a href="/growth-admin/calendar" className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">
              Calendario
            </a>
          </>
        }
      />

      <section className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total', counts.total, 'Archivo editorial completo'],
          ['Pendientes', counts.upcoming, 'Aún no publicadas'],
          ['Programadas', counts.scheduled, 'Con fecha asignada'],
          ['Publicadas', counts.published, 'Histórico y métricas'],
        ].map(([label, value, note]) => (
          <div key={String(label)} className={`${adminPanel} p-5`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{note}</p>
          </div>
        ))}
      </section>

      <PublicationFilterBar
        publication={publication}
        channel={channel}
        query={textParam(params.q)}
        total={filtered.length}
      />

      {filtered.length === 0 ? (
        <EmptyState>No hay publicaciones que coincidan con estos filtros.</EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const image = visualUrl(item)
            const published = isPublished(item)
            const scheduled = isScheduled(item)
            const date = published ? item.published_at : item.scheduled_at

            return (
              <article key={item.content_id} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
                <div className="aspect-[4/3] overflow-hidden border-b border-slate-100 bg-slate-50">
                  {image ? (
                    <img src={image} alt={item.title} className="h-full w-full object-contain" />
                  ) : isFigmaManual(item) ? (
                    <div className="flex h-full flex-col items-center justify-center px-5 text-center">
                      <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-700">Figma vinculado</span>
                      <p className="mt-3 text-lg font-semibold text-slate-950">{item.content_id}</p>
                      <p className="mt-1 text-xs text-slate-500">Diseño manual disponible en el preview.</p>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">Sin visual adjunto</div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={statusTone(item.status)}>{statusLabel(item)}</Badge>
                    <Badge tone={channelOf(item) === 'website' ? 'violet' : 'blue'}>{publicationLabel(item)}</Badge>
                    {item.language && <Badge>{item.language.toUpperCase()}</Badge>}
                  </div>

                  <h2 className="mt-4 line-clamp-2 text-lg font-semibold leading-6 text-slate-950">{item.title}</h2>
                  <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.body || 'Sin texto guardado.'}</p>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-400">
                        {date
                          ? <span>{scheduled ? 'Programada' : 'Publicada'} · {formatDate(date, true)}</span>
                          : <span>Sin fecha asignada</span>}
                      </div>
                      <a
                        href={`/growth-admin/preview/${encodeURIComponent(item.content_id)}`}
                        className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                      >
                        Ver preview
                      </a>
                    </div>
                    {published && item.external_post_url && (
                      <a href={item.external_post_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-semibold text-emerald-700">
                        Ver publicado ↗
                      </a>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </AdminShell>
  )
}
