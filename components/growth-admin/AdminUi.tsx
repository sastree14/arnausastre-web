import type { GrowthContentItem } from '@/lib/growth-admin'
import { formatControlCenterDate, toControlCenterDateTimeLocal } from '@/lib/control-center-time'

export function Badge({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'slate' | 'green' | 'amber' | 'blue' | 'violet' | 'rose' }) {
  const tones = {
    slate: 'border-slate-700 bg-slate-900 text-slate-300',
    green: 'border-emerald-800 bg-emerald-950/60 text-emerald-300',
    amber: 'border-amber-800 bg-amber-950/50 text-amber-300',
    blue: 'border-sky-800 bg-sky-950/50 text-sky-300',
    violet: 'border-violet-800 bg-violet-950/50 text-violet-300',
    rose: 'border-rose-900 bg-rose-950/40 text-rose-300',
  }
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${tones[tone]}`}>{children}</span>
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: React.ReactNode }) {
  return <header className="mb-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-sky-950/20 p-6 md:p-8"><div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold text-white md:text-5xl">{title}</h1>{description && <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>}</div>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</div></header>
}

export function SectionHeading({ eyebrow, title, description, count }: { eyebrow: string; title: string; description?: string; count?: number | string }) {
  return <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p><h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2>{description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>}</div>{count !== undefined && <Badge>{count}</Badge>}</div>
}

export function StatCard({ label, value, note, tone = 'slate', href }: { label: string; value: number | string; note?: string; tone?: 'slate' | 'blue' | 'amber' | 'green' | 'violet'; href?: string }) {
  const tones = {
    slate: 'border-slate-800 bg-slate-900/60',
    blue: 'border-sky-900/60 bg-sky-950/20',
    amber: 'border-amber-900/60 bg-amber-950/15',
    green: 'border-emerald-900/60 bg-emerald-950/15',
    violet: 'border-violet-900/60 bg-violet-950/20',
  }
  const body = <div className={`h-full rounded-2xl border p-5 transition ${tones[tone]} ${href ? 'hover:-translate-y-0.5 hover:border-slate-600' : ''}`}><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold text-white">{value}</p>{note && <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>}</div>
  return href ? <a href={href}>{body}</a> : body
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 p-7 text-center text-sm leading-6 text-slate-600">{children}</div>
}

export function assetUrl(item: GrowthContentItem) {
  return item.visual_path?.startsWith('supabase://') ? `/api/growth-admin/asset?ref=${encodeURIComponent(item.visual_path)}` : null
}

export function formatDate(value?: string | null, withTime = false) {
  return formatControlCenterDate(value, withTime)
}

export function scheduleInputValue(value?: string | null) {
  return toControlCenterDateTimeLocal(value)
}

export function statusTone(status: string): 'slate' | 'green' | 'amber' | 'blue' | 'violet' | 'rose' {
  if (status === 'published' || status === 'executed' || status === 'done' || status === 'completed') return 'green'
  if (status === 'approved' || status === 'scheduled' || status === 'queued' || status === 'running') return 'blue'
  if (status === 'needs_review' || status === 'pending') return 'amber'
  if (status === 'rejected' || status === 'failed') return 'rose'
  return 'slate'
}

export function publicationLabel(item: GrowthContentItem) {
  return item.content_type === 'article' ? 'Artículo web' : 'LinkedIn'
}
