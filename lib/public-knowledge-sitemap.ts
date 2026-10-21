import 'server-only'
import { cache } from 'react'
import { queryGrowthTable } from '@/lib/supabase-growth'
import { withReviewedSitemapLocalizations, type SitemapArticleLocale } from '@/lib/generated-article-localizations'

/**
 * Light, complete index of PUBLISHED knowledge locales.
 *
 * Do not fetch article body for a sitemap! The public article-list loader
 * intentionally caps results at 200 rich rows and can time out if reused here.
 * This paginates narrow PostgREST projections, with stable ordering and a
 * bounded number of pages. The reviewed Catalan override remains indexed.
 */
export const getPublishedKnowledgeSitemapRows = cache(async (): Promise<SitemapArticleLocale[]> => {
  const published: SitemapArticleLocale[] = []
  const pageSize = 250
  for (let offset = 0; offset < 10000; offset += pageSize) {
    const page = await queryGrowthTable<SitemapArticleLocale>('content_items', {
      select: 'content_id,brief_id,language,published_at',
      tenant_id: 'eq.sc-analytics',
      channel: 'eq.website',
      content_type: 'eq.article',
      status: 'eq.published',
      published_at: 'not.is.null',
      order: 'published_at.desc,content_id.asc',
      limit: String(pageSize),
      offset: String(offset),
    }, { cacheSeconds: 180, timeoutMs: 10000, retries: 1 })
    published.push(...page)
    if (page.length < pageSize) return withReviewedSitemapLocalizations(published)
  }
  // Fail visibly rather than silently omit older articles.
  throw new Error('Published article sitemap exceeded 10,000 localized rows')
})
