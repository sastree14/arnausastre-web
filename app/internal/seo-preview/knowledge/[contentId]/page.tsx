import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createHash, timingSafeEqual } from 'node:crypto'
import GeneratedKnowledgeArticleGoldStandard from '@/components/GeneratedKnowledgeArticleGoldStandard'
import { getPublicGeneratedArticleVariants } from '@/lib/public-growth'
import { getArticleBySlug } from '@/lib/content'
import { queryGrowthTable } from '@/lib/supabase-growth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Internal editorial preview',
  robots: { index: false, follow: false, noarchive: true },
}

type PreviewDraft = {
  draft_id: string
  content_id: string
  status: string
  claimed_at?: string | null
  qa_reference?: string | null
  patch: Record<string, unknown>
}
type Props = {
  params: Promise<{ contentId: string }>
  searchParams: Promise<{ draft?: string }>
}

function authenticated(header: string | null, draft: PreviewDraft): boolean {
  if (!header || header.length < 30 || header.length > 160
      || draft.status !== 'processing'
      || !draft.claimed_at
      || !/^[a-f0-9]{64}$/.test(draft.qa_reference || '')) return false
  const started = Date.parse(draft.claimed_at)
  const elapsed = Date.now() - started
  if (!Number.isFinite(started) || elapsed < 0 || elapsed > 10 * 60 * 1000) return false
  const actual = createHash('sha256').update(header).digest('hex')
  return timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(draft.qa_reference!, 'hex'))
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : {}
}

export default async function InternalKnowledgePreview({ params, searchParams }: Props) {
  const [{ contentId }, query, hdr] = await Promise.all([params, searchParams, headers()])
  const draftId = String(query.draft || '')
  if (!/^[a-zA-Z0-9_-]{1,180}$/.test(contentId)
      || !/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(draftId)
      || !hdr.get('x-sc-seo-preview-token')) notFound()

  const drafts = await queryGrowthTable<PreviewDraft>(
    'seo_knowledge_editorial_drafts',
    { draft_id: 'eq.' + draftId, content_id: 'eq.' + contentId, tenant_id: 'eq.sc-analytics', limit: '1' },
    { cacheSeconds: 0, timeoutMs: 8000, retries: 0 }
  )
  const draft = drafts[0]
  if (!draft || !authenticated(hdr.get('x-sc-seo-preview-token'), draft)) notFound()

  const patch = asRecord(draft.patch)
  if (Object.keys(patch).some(key => !['title', 'body', 'article_meta'].includes(key))) notFound()

  const variants = await getPublicGeneratedArticleVariants(contentId)
  const target = variants.find(item => item.content_id === contentId)
  if (!target || !target.brief_id || !['es', 'en', 'ca'].includes(target.language || '')
      || getArticleBySlug(target.brief_id)) notFound()

  const originalMeta = asRecord(asRecord(target.critique).article_meta)
  const patchedMeta = asRecord(patch.article_meta)
  const critique = {
    ...asRecord(target.critique),
    article_meta: { ...originalMeta, ...patchedMeta },
  }
  const modified = variants.map(item => item.content_id === contentId
    ? {
      ...item,
      title: typeof patch.title === 'string' ? patch.title : item.title,
      body: typeof patch.body === 'string' ? patch.body : item.body,
      critique,
    }
    : item)

  return <GeneratedKnowledgeArticleGoldStandard
    variants={modified}
    forcedLanguage={target.language as 'es' | 'ca' | 'en'}
  />
}
