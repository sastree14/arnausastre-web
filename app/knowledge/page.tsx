import { getAllArticles } from '@/lib/content'
import KnowledgeContent from '@/components/KnowledgeContent'

export default async function KnowledgePage() {
  const articles = getAllArticles()

  return (
    <main className="bg-slate-50 text-slate-900 page-enter">

      {/* Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">Knowledge</p>
          <h1
            className="mt-4 text-5xl leading-tight md:text-6xl text-slate-900"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Analytical thinking<br />
            <span className="italic text-slate-500">on decision systems.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
            A knowledge library for executives and analytical teams. Articles on forecasting, optimisation, risk and decision systems — grounded in operational experience, not theory.
          </p>
        </div>
      </section>

      {/* Filters + article list */}
      <KnowledgeContent articles={articles} />

    </main>
  )
}
