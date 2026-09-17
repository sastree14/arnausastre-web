import type { GrowthContentItem } from '@/lib/growth-admin'
import { formatControlCenterDate, toControlCenterDateTimeLocal } from '@/lib/control-center-time'

export function Badge({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'slate' | 'green' | 'amber' | 'blue' | 'violet' | 'rose' }) {
  const tones = {
    slate: 'border-slate-200 bg-slate-50 text-slate-600',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    blue: 'border-sky-200 bg-sky-50 text-sky-700',
    violet: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
  }
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${tones[tone]}`}>{children}</span>
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <header className="mb-8 overflow-hidden rounded-[2rem] border border-slate-900 bg-slate-950 text-white shadow-sm">
      <div className="flex flex-col gap-7 px-6 py-8 md:px-8 md:py-10 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-4xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-300">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-medium leading-tight md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h1>
          {description && <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  )
}

export function SectionHeading({ eyebrow, title, description, count }: { eyebrow: string; title: string; description?: string; count?: number | string }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600">{eyebrow}</p>
        <h2 className="mt-2 text-3xl text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h2>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>}
      </div>
      {count !== undefined && <Badge>{count}</Badge>}
    </div>
  )
}

export function StatCard({ label, value, note, tone = 'slate', href }: { label: string; value: number | string; note?: string; tone?: 'slate' | 'blue' | 'amber' | 'green' | 'violet'; href?: string }) {
  const accents = { slate: 'bg-slate-950', blue: 'bg-sky-500', amber: 'bg-amber-500', green: 'bg-emerald-500', violet: 'bg-indigo-600' }
  const body = <div className={`relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition ${href ? 'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md' : ''}`}><span className={`absolute inset-y-0 left-0 w-1 ${accents[tone]}`} /><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>{note && <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>}</div>
  return href ? <a href={href}>{body}</a> : body
}

export function EmptyState({ children }: { children: React.ReactNode }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center text-sm leading-6 text-slate-500">{children}</div> }

export const adminPanel = 'rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]'
export const adminInput = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
export const adminButtonPrimary = 'rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800'
export const adminButtonSecondary = 'rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50'

export function assetUrl(item: GrowthContentItem) { return item.visual_path?.startsWith('supabase://') ? `/api/growth-admin/asset?ref=${encodeURIComponent(item.visual_path)}` : null }
export function formatDate(value?: string | null, withTime = false) { return formatControlCenterDate(value, withTime) }
export function scheduleInputValue(value?: string | null) { return toControlCenterDateTimeLocal(value) }

export function statusTone(status: string): 'slate' | 'green' | 'amber' | 'blue' | 'violet' | 'rose' {
  if (status === 'published' || status === 'executed' || status === 'done' || status === 'completed') return 'green'
  if (status === 'approved' || status === 'scheduled' || status === 'queued' || status === 'running') return 'blue'
  if (status === 'needs_review' || status === 'pending') return 'amber'
  if (status === 'rejected' || status === 'failed') return 'rose'
  return 'slate'
}

export type PublicationKind='linkedin_post'|'linkedin_article'|'web_article'
export function publicationKind(item:Pick<GrowthContentItem,'content_type'|'channel'>):PublicationKind {
  const type=String(item.content_type||'').toLowerCase(),channel=String(item.channel||'').toLowerCase()
  if(type==='linkedin_article'||(type==='article'&&channel.includes('linkedin')))return'linkedin_article'
  if(type==='article'||type==='web_article'||channel==='website')return'web_article'
  return'linkedin_post'
}
export function publicationLabel(item:Pick<GrowthContentItem,'content_type'|'channel'>) {
  const kind=publicationKind(item)
  return kind==='linkedin_article'?'Artículo LinkedIn':kind==='web_article'?'Artículo web':'Post LinkedIn'
}
export function publicationLifecycle(item:Pick<GrowthContentItem,'status'|'scheduled_at'|'published_at'>){
  if(item.status==='published'||item.published_at)return{step:5,total:5,label:'Publicada'}
  if(item.status==='scheduled'||item.scheduled_at)return{step:4,total:5,label:'Programada'}
  if(item.status==='approved')return{step:3,total:5,label:'Aprobada'}
  if(item.status==='needs_review'||item.status==='draft')return{step:2,total:5,label:'Revisión'}
  return{step:1,total:5,label:'Borrador'}
}
