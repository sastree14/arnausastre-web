import { getAllArticles } from '@/lib/content'
import KnowledgeHero from '@/components/KnowledgeHero'
import KnowledgeContent from '@/components/KnowledgeContent'

export default async function KnowledgePage() {
  const articles = getAllArticles()

  return (
    <main className="bg-slate-50 text-slate-900 page-enter">
      <KnowledgeHero />
      <KnowledgeContent articles={articles} />
    </main>
  )
}
