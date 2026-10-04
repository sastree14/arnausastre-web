import { getAllArticles } from '@/lib/content'
import { getPublicGeneratedArticles } from '@/lib/public-growth'
import KnowledgeHero from '@/components/KnowledgeHero'
import KnowledgeContent from '@/components/KnowledgeContent'
import type { Article } from '@/lib/content'
import type { PublicGeneratedArticle } from '@/lib/public-growth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function KnowledgePage() {
  let articles: Article[] = []
  let generated: PublicGeneratedArticle[] = []

  try {
    articles = getAllArticles()
  } catch (error) {
    console.error('Static knowledge content unavailable', error)
  }

  try {
    generated = await getPublicGeneratedArticles()
  } catch (error) {
    console.error('Generated knowledge content unavailable', error)
  }

  return (
    <main className="bg-[#FAFAF7] text-slate-900 page-enter">
      <KnowledgeHero />
      <KnowledgeContent articles={articles} generated={generated} />
    </main>
  )
}
