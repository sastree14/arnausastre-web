'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'
import { translations } from '@/lib/translations'
import { articles } from '@/lib/articles'
import { useRevealChildren } from '@/hooks/useScrollAnimation'

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRevealChildren()
  return <section ref={ref} className={className}>{children}</section>
}

export default function InsightsPage() {
  const { lang } = useLanguage()
  const t = translations[lang].insights
  const tc = translations[lang].common

  return (
    <main className="bg-slate-50 text-slate-900 page-enter">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:py-28">
        <div className="max-w-4xl">
          <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.heroLabel}</p>
          <h1
            className="reveal reveal-delay-1 mt-4 text-5xl leading-tight md:text-6xl"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {t.heroTitle}
          </h1>
          <p className="reveal reveal-delay-2 mt-8 max-w-3xl text-lg leading-8 text-slate-600">{t.heroSub}</p>
        </div>
      </section>

      {/* Articles */}
      <Section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="space-y-6">
            {articles.map((article, i) => {
              const title = lang === 'en' ? article.titleEn : article.titleEs
              const excerpt = lang === 'en' ? article.excerptEn : article.excerptEs
              const tags = lang === 'en' ? article.tagsEn : article.tagsEs

              return (
                <Link
                  key={article.slug}
                  href={`/insights/${article.slug}`}
                  className={`reveal reveal-delay-${Math.min(i + 1, 4)} group block rounded-2xl border border-slate-200 bg-slate-50 p-8 card-lift`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2
                        className="text-2xl text-slate-900 group-hover:text-indigo-700 transition"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                      >
                        {title}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-slate-600 max-w-3xl">{excerpt}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-slate-400">{article.date}</p>
                      <p className="mt-1 text-xs text-slate-400">{article.readingTime} {tc.minRead}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-indigo-600 group-hover:gap-3 transition-all">
                    {tc.readMore}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </Section>
    </main>
  )
}
