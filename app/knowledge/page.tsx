'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'
import { translations } from '@/lib/translations'
import { articles } from '@/lib/articles'
import { useRevealChildren } from '@/hooks/useScrollAnimation'

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRevealChildren()
  return <section ref={ref} className={className}>{children}</section>
}

export default function KnowledgePage() {
  const { lang } = useLanguage()
  const t = translations[lang].insights
  const tc = translations[lang].common
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const allTags = Array.from(new Set(
    articles.flatMap((a) => lang === 'en' ? a.tagsEn : a.tagsEs)
  ))

  const filtered = activeFilter
    ? articles.filter((a) => {
        const tags = lang === 'en' ? a.tagsEn : a.tagsEs
        return tags.includes(activeFilter)
      })
    : articles

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

      {/* Articles section */}
      <Section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">

          {/* Category filters — only render when there are articles */}
          {allTags.length > 0 && (
            <div className="mb-10 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter(null)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  activeFilter === null
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
                }`}
              >
                {t.allArticles}
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(activeFilter === tag ? null : tag)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                    activeFilter === tag
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600">
                {lang === 'en' ? 'Articles coming soon.' : 'Artículos próximamente.'}
              </p>
              <p className="mt-2 max-w-sm text-xs leading-6 text-slate-400">
                {lang === 'en'
                  ? 'We publish in-depth analyses on analytics, forecasting and decision systems for executives and analytical teams.'
                  : 'Publicamos análisis en profundidad sobre analítica, forecasting y sistemas de decisión para directivos y equipos analíticos.'}
              </p>
            </div>
          ) : (
            /* Article grid */
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((article, i) => {
                const title = lang === 'en' ? article.titleEn : article.titleEs
                const excerpt = lang === 'en' ? article.excerptEn : article.excerptEs
                const tags = lang === 'en' ? article.tagsEn : article.tagsEs

                return (
                  <Link
                    key={article.slug}
                    href={`/knowledge/${article.slug}`}
                    className={`reveal reveal-delay-${Math.min(i + 1, 4)} group flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-7 card-lift`}
                  >
                    {/* Category chips */}
                    <div className="mb-5 flex flex-wrap gap-2">
                      {tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h2
                      className="text-xl text-slate-900 group-hover:text-indigo-700 transition leading-snug"
                      style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                      {title}
                    </h2>

                    {/* Excerpt */}
                    <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{excerpt}</p>

                    {/* Footer: date · reading time */}
                    <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{article.date}</span>
                        <span className="text-slate-300" aria-hidden="true">·</span>
                        <span className="text-xs text-slate-400">{article.readingTime} {tc.minRead}</span>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 transition-all group-hover:gap-2.5">
                        {tc.readMore}
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </Section>
    </main>
  )
}
