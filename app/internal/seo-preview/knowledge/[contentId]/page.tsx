import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createHmac, timingSafeEqual } from 'node:crypto'
import GeneratedKnowledgeArticleGoldStandard from '@/components/GeneratedKnowledgeArticleGoldStandard'
import { getPublicGeneratedArticleVariants } from '@/lib/public-growth'
import { getArticleBySlug } from '@/lib/content'
import { growthSupabaseKey, queryGrowthTable } from '@/lib/supabase-growth'

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
  patch: Record<string, unknown>
}
type Props = {
  params: Promise<{ contentId: string }>
  searchParams: Promise<{ draft?: string }>
}

function authenticated(header: string | null, contentId: string, draftId: string): boolean {
  if (!header) return false
  const match = /^([0-9]{10}):([a-f0-9]{64})$/.exec(header)
  if (!match) return false
  const expires = Number(match[1])
  const now = Math.floor(Date.now() / 1000)
  if (!Number.isSafeInteger(expires) || expires < now || expires > now + 300) return false
  const signed = [contentId, draftId, String(expires)].join(':')
  const expected = createHmac('sha256', growthSupabaseKey()).update(signed).digest('hex')
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(match[2], 'hex'))
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
      || !authenticated(hdr.get('x-sc-seo-preview'), contentId, draftId)) notFound()

  const drafts = await queryGrowthTable<PreviewDraft>(
    'seo_knowledge_editorial_drafts',
    { draft_id: 'eq.' + draftId, content_id: 'eq.' + contentId, tenant_id: 'eq.sc-analytics', limit: '1' },
    { cacheSeconds: 0, timeoutMs: 8000, retries: 0 }
  )
  const draft = drafts[0]
  if (!draft || !['processing', 'verifying'].includes(draft.status)) notFound()

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
