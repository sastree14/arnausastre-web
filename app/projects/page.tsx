'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'
import { translations } from '@/lib/translations'
import { caseStudies } from '@/lib/case-studies'
import { useRevealChildren } from '@/hooks/useScrollAnimation'

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRevealChildren()
  return <section ref={ref} className={className}>{children}</section>
}

export default function ProjectsPage() {
  const { lang } = useLanguage()
  const t = translations[lang].caseStudies
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

      {/* Projects list */}
      <Section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          {caseStudies.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="2" y="3" width="20" height="14" rx="2" stroke="#94a3b8" strokeWidth="1.5"/>
                  <path d="M8 21h8M12 17v4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600">
                {lang === 'en' ? 'Projects coming soon.' : 'Proyectos próximamente.'}
              </p>
              <p className="mt-2 max-w-sm text-xs leading-6 text-slate-400">
                {lang === 'en'
                  ? 'We only publish case studies with explicit client permission. Real engagements will be shared here as they become available.'
                  : 'Solo publicamos proyectos con permiso explícito del cliente. Los proyectos reales se compartirán aquí a medida que estén disponibles.'}
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-block rounded-md bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                {tc.contactUs}
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {caseStudies.map((cs, i) => {
                const title = lang === 'en' ? cs.titleEn : cs.titleEs
                const excerpt = lang === 'en' ? cs.excerptEn : cs.excerptEs
                const industry = lang === 'en' ? cs.industry : cs.industryEs
                const tags = lang === 'en' ? cs.tagsEn : cs.tagsEs

                return (
                  <Link
                    key={cs.slug}
                    href={`/projects/${cs.slug}`}
                    className={`reveal reveal-delay-${Math.min(i + 1, 3)} group block rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden card-lift`}
                  >
                    <div className="p-8">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                            {industry}
                          </span>
                          <span className="rounded-md bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                            {cs.company}
                          </span>
                        </div>
                        {tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
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
                      <p className="mt-4 text-sm leading-7 text-slate-600 max-w-3xl">{excerpt}</p>

                      <div className="mt-7 grid grid-cols-2 gap-4 border-t border-slate-200 pt-6 md:grid-cols-4">
                        {cs.results.slice(0, 4).map((r) => (
                          <div key={r.metric}>
                            <p className="text-xs text-slate-400">{lang === 'en' ? r.metric : r.metricEs}</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{r.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-slate-200 px-8 py-4 flex items-center gap-2 text-sm font-medium text-indigo-600 bg-white group-hover:bg-indigo-50 transition">
                      {tc.viewCaseStudy}
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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
