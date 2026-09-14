import type { GrowthContentItem } from '@/lib/growth-admin'
import { assetUrl } from '@/components/growth-admin/AdminUi'

function shortCommentary(body: string, maxChars = 320) {
  const clean = (body.split('\n\n').find((part) => part.trim()) || body).replace(/\s+/g, ' ').trim()
  if (clean.length <= maxChars) return clean
  const shortened = clean.slice(0, maxChars - 1).replace(/\s+\S*$/, '').trim()
  return `${shortened || clean.slice(0, maxChars - 1)}…`
}

export function outgoingLinkedInCommentary(item: GrowthContentItem) {
  const mode = item.publication_mode || 'text_only'
  const body = item.body || ''
  if (mode === 'visual_first') return shortCommentary(body)
  if (mode === 'image_only') return 'SC-Analytics'
  return body
}

export default function LinkedInPreview({ item }: { item: GrowthContentItem }) {
  const image = assetUrl(item)
  const commentary = outgoingLinkedInCommentary(item)
  const mode = item.publication_mode || 'text_only'
  const showImage = mode !== 'text_only' && Boolean(image)
  return <div className="mx-auto max-w-[620px] overflow-hidden rounded-xl border border-slate-300 bg-white text-slate-950 shadow-xl">
    <div className="flex items-start gap-3 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">AS</div>
      <div className="min-w-0"><p className="font-semibold">Arnau Sastre</p><p className="text-xs leading-5 text-slate-500">Founder · SC-Analytics</p><p className="text-xs text-slate-400">Ahora · 🌐</p></div>
    </div>
    <div className="whitespace-pre-wrap px-4 pb-4 text-[14px] leading-[1.55] text-slate-900">{commentary}</div>
    {showImage && <img src={image || ''} alt={item.title} className="w-full border-y border-slate-200 bg-slate-50 object-contain"/>}
    {mode !== 'text_only' && !image && <div className="mx-4 mb-4 rounded-lg border border-dashed border-rose-300 bg-rose-50 p-4 text-sm text-rose-700">El modo {mode} requiere visual, pero no hay ninguno adjunto.</div>}
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500"><span>Recomendar</span><span>Comentar</span><span>Republicar</span><span>Enviar</span></div>
  </div>
}
