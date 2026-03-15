'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLanguage } from '@/components/LanguageProvider'
import { translations } from '@/lib/translations'
import { getCaseStudyBySlug } from '@/lib/case-studies'

function renderText(text: string) {
  const paragraphs = text.split('\n\n')
  return paragraphs.map((para, i) => {
    if (para.startsWith('- ') || para.includes('\n- ')) {
      const items = para.split('\n').filter(l => l.startsWith('- '))
      return (
        <ul key={i} className="mb-5 space-y-2 pl-4">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2.5 text-slate-700 leading-7">
              <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-indigo-500" />
              {item.slice(2)}
            </li>
          ))}
        </ul>
      )
    }
    return <p key={i} className="mb-5 leading-8 text-slate-700">{para}</p>
  })
}

export default function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>()
  const { lang } = useLanguage()
  const tc = translations[lang].common
  const cs = getCaseStudyBySlug(slug)

  if (!cs) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-24">
        <p className="text-slate-600">Case study not found.</p>
        <Link href="/case-studies" className="mt-4 block text-sm text-indigo-600 hover:underline">{tc.backToCaseStudies}</Link>
      </main>
    )
  }

  const title = lang === 'en' ? cs.titleEn : cs.titleEs
  const industry = lang === 'en' ? cs.industry : cs.industryEs
  const problem = lang === 'en' ? cs.problemEn : cs.problemEs
  const approach = lang === 'en' ? cs.approachEn : cs.approachEs
  const solution = lang === 'en' ? cs.solutionEn : cs.solutionEs
  const tags = lang === 'en' ? cs.tagsEn : cs.tagsEs
  const t = translations[lang].caseStudies

  return (
    <main className="bg-slate-50 text-slate-900 page-enter">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <Link
          href="/case-studies"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition mb-10"
        >
          {tc.backToCaseStudies}
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">{industry}</span>
          <span className="rounded-md bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">{cs.company}</span>
          {tags.map(tag => (
            <span key={tag} className="rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">{tag}</span>
          ))}
        </div>

        <h1
          className="text-4xl leading-tight md:text-5xl text-slate-900"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {title}
        </h1>

        {/* Results */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-indigo-600 font-medium mb-6">{t.results}</p>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {cs.results.map((r) => (
              <div key={r.metric} className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs text-slate-400 mb-1">{lang === 'en' ? r.metric : r.metricEs}</p>
                <p className="text-sm font-semibold text-slate-900">{r.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Problem */}
        <div className="mt-10">
          <h2 className="text-2xl text-slate-900 mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
            {t.problem}
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            {renderText(problem)}
          </div>
        </div>

        {/* Approach */}
        <div className="mt-10">
          <h2 className="text-2xl text-slate-900 mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
            {lang === 'en' ? 'Approach' : 'Enfoque'}
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            {renderText(approach)}
          </div>
        </div>

        {/* Solution */}
        <div className="mt-10">
          <h2 className="text-2xl text-slate-900 mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
            {lang === 'en' ? 'Solution & Delivery' : 'Solución y entrega'}
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            {renderText(solution)}
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-10">
          <Link
            href="/contact"
            className="inline-block rounded-md bg-slate-900 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            {tc.contactUs}
          </Link>
        </div>
      </div>
    </main>
  )
}
