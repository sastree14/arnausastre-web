import 'server-only'

import { queryGrowthTable } from '@/lib/supabase-growth'

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
  created_at?: string
}

function isPublicNow(article: PublicGeneratedArticle) {
  if (article.status === 'published') return true
  if (article.status !== 'scheduled') return false
  if (!article.scheduled_at) return false
  return new Date(article.scheduled_at).getTime() <= Date.now()
}

function growthBackendConfigured() {
  return Boolean((process.env.SUPABASE_URL || '').trim() && ((process.env.SUPABASE_SECRET_KEY || '').trim() || (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()))
}

export async function getPublicGeneratedArticles(): Promise<PublicGeneratedArticle[]> {
  // Vercel preview environments may intentionally omit production Growth Agent secrets.
  // The public site must still build; generated content simply stays unavailable there.
  if (!growthBackendConfigured()) return []
  try {
    const rows = await queryGrowthTable<PublicGeneratedArticle>('content_items', {
      content_type: 'eq.article',
      order: 'created_at.desc',
      limit: '200',
    })
    return rows.filter(isPublicNow)
  } catch (error) {
    console.error('Public Growth content unavailable', error)
    return []
  }
}

export async function getPublicGeneratedArticleVariants(slug: string): Promise<PublicGeneratedArticle[]> {
  const rows = await getPublicGeneratedArticles()
  return rows.filter((row) => row.brief_id === slug || row.content_id === slug)
}
