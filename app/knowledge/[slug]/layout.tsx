import type { Metadata } from 'next'
import { getArticleBySlug } from '@/lib/content'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return { title: 'Knowledge' }
  return {
    title: article.titleEn,
    description: article.excerptEn,
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
