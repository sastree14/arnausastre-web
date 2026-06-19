import { getAllArticles } from '@/lib/content'
import KnowledgeContent from '@/components/KnowledgeContent'

export default async function KnowledgePage() {
  const articles = getAllArticles()

  return (
    <main className="bg-slate-50 text-slate-900 page-enter">

      {/* Hero — static, no hooks needed */}
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">Knowledge</p>
          <h1
            className="mt-4 text-5xl leading-tight md:text-6xl text-slate-900"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Practical insights on decision systems<br />
            <span className="italic text-slate-500">that create measurable business impact.</span>
          </h1>
        </div>
      </section>

      {/* Filters + article grid (client component handles language + interactivity) */}
      <KnowledgeContent articles={articles} />

    </main>
  )
}
