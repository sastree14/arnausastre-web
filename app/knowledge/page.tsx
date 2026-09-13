import { getAllArticles } from '@/lib/content'
import { getPublicGeneratedArticles } from '@/lib/public-growth'
import KnowledgeHero from '@/components/KnowledgeHero'
import KnowledgeContent from '@/components/KnowledgeContent'
import GeneratedKnowledgeSection from '@/components/GeneratedKnowledgeSection'

export default async function KnowledgePage() {
  const [articles, generated] = await Promise.all([
    Promise.resolve(getAllArticles()),
    getPublicGeneratedArticles(),
  ])

  return (
    <main className="bg-slate-50 text-slate-900 page-enter">
      <KnowledgeHero />
      <KnowledgeContent articles={articles} />
      <GeneratedKnowledgeSection articles={generated} />
    </main>
  )
}
