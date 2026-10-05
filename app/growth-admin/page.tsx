import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, assetUrl, formatDate, publicationLabel, statusTone } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated, type GrowthContentItem } from '@/lib/growth-admin'
import { collapseWebsiteArticleFamilies, getWorkspaceContent } from '@/lib/editorial-workspace'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const blockedStatuses = new Set(['published', 'rejected', 'failed', 'superseded_test', 'alternate'])

function reviewPriority(item: GrowthContentItem) {
  if (item.status === 'needs_review' || item.status === 'draft') return 0
  if (item.status === 'approved') return 1
  if (item.status === 'scheduled' || item.scheduled_at) return 2
  return 3
}

function nextDate(item: GrowthContentItem) {
  const value = item.scheduled_at || item.created_at || ''
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER
}

function isFigmaManual(item: GrowthContentItem) {
  return String(item.visual_strategy?.source || '') === 'figma_manual'
}

function canonicalOrder(item: GrowthContentItem) {
  const value = Number(item.visual_strategy?.publication_order)
  return Number.isFinite(value) && value > 0 ? value : Number.MAX_SAFE_INTEGER
}

function visualUrl(item: GrowthContentItem) {
  const internal = assetUrl(item)
  if (internal) return internal
  return item.visual_path?.startsWith('http') ? item.visual_path : null
}

function stateLabel(item: GrowthContentItem) {
  if (item.status === 'scheduled' || item.scheduled_at) return 'Programada'
  if (item.status === 'approved') return 'Lista para publicar'
  if (item.status === 'needs_review' || item.status === 'draft') return 'Por revisar'
  return item.status
}

function PublicationCard({ item }: { item: GrowthContentItem }) {
  const image = visualUrl(item)
  return (
    <a
      href={`/growth-admin/preview/${encodeURIComponent(item.content_id)}`}
      className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="aspect-[4/5] overflow-hidden border-b border-slate-100 bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={item.title}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.01]"
          />
        ) : isFigmaManual(item) ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-700">Figma vinculado</span>
            <p className="mt-4 text-2xl font-semibold text-slate-950">{item.content_id}</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
              El preview abre el diseño manual exacto junto al copy final.
            </p>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Sin visual</span>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
              La pieza puede revisarse igualmente. El preview indicará si el visual es obligatorio.
            </p>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          <Badge tone={statusTone(item.status)}>{stateLabel(item)}</Badge>
          <Badge tone={item.content_type === 'linkedin_post' ? 'blue' : 'violet'}>{publicationLabel(item)}</Badge>
          {item.language && <Badge>{item.language.toUpperCase()}</Badge>}
        </div>
        <h2 className="mt-4 line-clamp-2 text-lg font-semibold leading-6 text-slate-950">{item.title}</h2>
        <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-slate-500">{item.body || 'Sin texto todavía.'}</p>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-[11px] text-slate-400">
            {item.scheduled_at ? `Sale ${formatDate(item.scheduled_at, true)}` : 'Sin fecha cerrada'}
          </span>
          <span className="text-xs font-semibold text-slate-800">Abrir preview →</span>
        </div>
      </div>
    </a>
  )
}

export default async function GrowthAdminPage() {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')

  const rawContent = await getWorkspaceContent()
  const content = collapseWebsiteArticleFamilies(rawContent)
  const upcoming = content
    .filter((item) => !blockedStatuses.has(item.status))
    .sort((a, b) => {
      const aCanonical = isFigmaManual(a)
      const bCanonical = isFigmaManual(b)
      if (aCanonical !== bCanonical) return aCanonical ? -1 : 1
      if (aCanonical && bCanonical) return canonicalOrder(a) - canonicalOrder(b)
      const priority = reviewPriority(a) - reviewPriority(b)
      if (priority !== 0) return priority
      if (a.scheduled_at || b.scheduled_at) return nextDate(a) - nextDate(b)
      return String(b.created_at || '').localeCompare(String(a.created_at || ''))
    })

  const reviewCount = upcoming.filter((item) => item.status === 'needs_review' || item.status === 'draft').length
  const readyCount = upcoming.filter((item) => item.status === 'approved').length
  const scheduledCount = upcoming.filter((item) => item.status === 'scheduled' || Boolean(item.scheduled_at)).length
  const visible = upcoming.slice(0, 15)

  return (
    <AdminShell active="home">
      <header className="overflow-hidden rounded-[2rem] border border-slate-900 bg-slate-950 text-white">
        <div className="grid gap-8 px-6 py-9 md:px-10 md:py-11 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div className="max-w-4xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-300">
              SC-Analytics · Editorial Review Center
            </p>
            <h1 className="mt-4 text-4xl leading-tight md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>
              Lo siguiente que vamos a publicar
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              El CRM se centra ahora en una sola tarea: revisar cómo queda cada pieza, hacer el último ajuste y decidir si está lista para salir.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/growth-admin/calendar" className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white">
              Ver calendario
            </a>
            <a href="/growth-admin/content?publication=all" className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">
              Abrir biblioteca
            </a>
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700">Por revisar</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{reviewCount}</p>
          <p className="mt-1 text-xs text-amber-800">Necesitan tu decisión o un último ajuste.</p>
        </div>
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-700">Listas</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{readyCount}</p>
          <p className="mt-1 text-xs text-indigo-800">Aprobadas y preparadas para programar o publicar.</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Programadas</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{scheduledCount}</p>
          <p className="mt-1 text-xs text-emerald-800">Ya tienen fecha de salida asignada.</p>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600">Preview queue</p>
            <h2 className="mt-2 text-3xl text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>
              Revisa primero lo que está más cerca de salir
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Cada tarjeta abre la vista final de publicación. No hace falta entrar en módulos de research, generación o sistema para cerrar una pieza.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">{upcoming.length} piezas activas</span>
        </div>

        {visible.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visible.map((item) => <PublicationCard key={item.content_id} item={item} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            No hay publicaciones pendientes de revisión.
          </div>
        )}

        {upcoming.length > visible.length && (
          <div className="mt-6 text-center">
            <a href="/growth-admin/content?publication=all" className="text-sm font-semibold text-indigo-700">
              Ver las {upcoming.length} piezas en la biblioteca →
            </a>
          </div>
        )}
      </section>
    </AdminShell>
  )
}
