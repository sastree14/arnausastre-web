import { notFound } from 'next/navigation'
import { getArticleBySlug } from '@/lib/content'
import { getPublicGeneratedArticleVariants } from '@/lib/public-growth'
import ArticleContent from '@/components/ArticleContent'
import GeneratedArticleContent from '@/components/GeneratedArticleContent'

type Props = { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const staticArticle = getArticleBySlug(slug)
  if (staticArticle) return <ArticleContent article={staticArticle} />

  const generated = await getPublicGeneratedArticleVariants(slug)
  if (!generated.length) notFound()
  return <GeneratedArticleContent variants={generated} />
}
