import type { GrowthContentItem } from '@/lib/growth-admin'

function figmaSource(item: GrowthContentItem) {
  const strategy = item.visual_strategy || {}
  if (String(strategy.source || '') !== 'figma_manual') return null
  if (!item.source_url || !item.source_url.includes('figma.com/design/')) return null

  const slideIds = Array.isArray(strategy.figma_slide_ids)
    ? strategy.figma_slide_ids.map((value) => String(value))
    : []

  return {
    sourceUrl: item.source_url,
    embedUrl: `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(item.source_url)}`,
    slideCount: slideIds.length || 1,
    visualKind: String(strategy.visual_kind || item.visual_type || 'visual'),
  }
}

export function hasFigmaManualVisual(item: GrowthContentItem) {
  return Boolean(figmaSource(item))
}

export default function FigmaVisualPreview({ item }: { item: GrowthContentItem }) {
  const source = figmaSource(item)
  if (!source) return null

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">Fuente visual · Figma</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">
            {item.content_id} · {source.visualKind === 'carousel' ? `${source.slideCount} slides` : 'pieza única'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Este diseño es la fuente manual aprobable. El CRM no lo recrea con otro renderer.
          </p>
        </div>
        <a
          href={source.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
        >
          Abrir en Figma ↗
        </a>
      </div>

      <div className="bg-slate-100 p-3 md:p-5">
        <iframe
          title={`Visual Figma de ${item.content_id}`}
          src={source.embedUrl}
          allowFullScreen
          className="h-[620px] w-full rounded-xl border border-slate-200 bg-white"
        />
      </div>
    </section>
  )
}
