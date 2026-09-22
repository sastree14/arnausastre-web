import { getAllArticles } from '@/lib/content'
import { getPublicGeneratedArticles } from '@/lib/public-growth'
import KnowledgeHero from '@/components/KnowledgeHero'
import KnowledgeContent from '@/components/KnowledgeContent'
import NewsletterSignup from '@/components/NewsletterSignup'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function KnowledgePage() {
  const [articles, generated] = await Promise.all([
    Promise.resolve(getAllArticles()),
    getPublicGeneratedArticles(),
  ])

  return (
    <main className="bg-slate-50 text-slate-900 page-enter">
      <KnowledgeHero />
      <KnowledgeContent articles={articles} generated={generated} />
      <section className="mx-auto max-w-7xl px-6 pb-20"><NewsletterSignup /></section>
    </main>
  )
}
