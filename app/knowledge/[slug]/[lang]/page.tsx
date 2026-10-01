import { notFound } from 'next/navigation'
import { getArticleBySlug } from '@/lib/content'
import { getPublicGeneratedArticleVariants } from '@/lib/public-growth'
import ArticleContent from '@/components/ArticleContent'
import GeneratedArticleContent from '@/components/GeneratedArticleContent'

type SiteLang = 'en' | 'es' | 'ca'
type Props = { params: Promise<{ slug: string; lang: string }> }

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LocalizedArticlePage({ params }: Props) {
  const { slug, lang } = await params
  if (!['en', 'es', 'ca'].includes(lang)) notFound()
  const forcedLanguage = lang as SiteLang

  const staticArticle = getArticleBySlug(slug)
  if (staticArticle) return <ArticleContent article={staticArticle} forcedLanguage={forcedLanguage} />

  const generated = await getPublicGeneratedArticleVariants(slug)
  if (!generated.length) notFound()

  return <GeneratedArticleContent variants={generated} forcedLanguage={forcedLanguage} />
}
