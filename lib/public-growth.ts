import 'server-only'

import { cache } from 'react'
import { queryGrowthTable } from '@/lib/supabase-growth'
import { withReviewedArticleLocalizations } from '@/lib/generated-article-localizations'

export interface PublicGeneratedArticle {
  content_id: string
  brief_id?: string
  title: string
  body: string
  language?: string
  content_family?: string
  quality_score?: number | string
  status: string
  scheduled_at?: string | null
  published_at?: string | null
  external_post_url?: string | null
  source_url?: string | null
  visual_path?: string | null
  visual_type?: string | null
  created_at?: string
  objective?: string
  topic?: string | null
  industry?: string | null
  challenge?: string | null
  audience?: string | null
  funnel_stage?: string | null
  cta_type?: string | null
  cta_url?: string | null
  hashtags?: string[] | null
  critique?: Record<string, unknown> | null
}

export function isPublicGeneratedArticleNow(article: PublicGeneratedArticle) {
  return article.status === 'published' && Boolean(article.published_at)
}

function growthBackendConfigured() {
  return Boolean((process.env.SUPABASE_URL || '').trim() && ((process.env.SUPABASE_SECRET_KEY || '').trim() || (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()))
}

// Always apply server-side publication filters BEFORE returning content.
// The previous implementation loaded up to 1,000 article records including
// scheduled/draft copies, then discarded most of them. Under normal traffic
// that could time out and cause transient 404s for already-published articles.
const PUBLIC_FILTERS = {
  tenant_id: 'eq.sc-analytics',
  content_type: 'eq.article',
  channel: 'eq.website',
  status: 'eq.published',
}

export const getPublicGeneratedArticles = cache(async (): Promise<PublicGeneratedArticle[]> => {
  if (!growthBackendConfigured()) return []
  try {
    const rows = await queryGrowthTable<PublicGeneratedArticle>('content_items', {
      ...PUBLIC_FILTERS,
      order: 'published_at.desc.nullslast,created_at.desc',
      limit: '200',
    }, { cacheSeconds: 15, timeoutMs: 10000, retries: 1 })
    return withReviewedArticleLocalizations(rows.filter(isPublicGeneratedArticleNow))
  } catch (error) {
    console.error('Public Growth content unavailable', error)
    return []
  }
})

// Route pages fetch only their 2–3 published translations. React.cache avoids
// duplicate DB reads from generateMetadata and the page in one SSR request.
export const getPublicGeneratedArticleVariants = cache(async (slug: string): Promise<PublicGeneratedArticle[]> => {
  if (!growthBackendConfigured()) return []
  if (!/^[a-zA-Z0-9_-]{1,180}$/.test(slug)) return []
  try {
    const rows = await queryGrowthTable<PublicGeneratedArticle>('content_items', {
      ...PUBLIC_FILTERS,
      or: `(brief_id.eq.${slug},content_id.eq.${slug})`,
      order: 'published_at.desc.nullslast',
      limit: '10',
    }, { cacheSeconds: 30, timeoutMs: 10000, retries: 1 })
    return withReviewedArticleLocalizations(rows.filter(isPublicGeneratedArticleNow))
      .filter(row => row.brief_id === slug || row.content_id === slug)
  } catch (error) {
    console.error('Published knowledge article lookup failed', { slug, error })
    return []
  }
})
