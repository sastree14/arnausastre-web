import { notFound } from 'next/navigation'
import { getArticleBySlug, getAllArticles } from '@/lib/content'
import ArticleContent from '@/components/ArticleContent'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }))
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()
  return <ArticleContent article={article} />
}
