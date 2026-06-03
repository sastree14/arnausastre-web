'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'
import { translations } from '@/lib/translations'
import { useRevealChildren } from '@/hooks/useScrollAnimation'

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRevealChildren()
  return <section ref={ref} className={className}>{children}</section>
}

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function AboutPage() {
  const { lang } = useLanguage()
  const t = translations[lang].about

  return (
    <main className="bg-white text-slate-900 page-enter">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-medium">{t.heroLabel}</p>
            <h1
              className="mt-6 text-5xl md:text-6xl leading-[1.1] text-white"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.heroTitle}
            </h1>
            <div className="mt-10 border-l-2 border-indigo-500 pl-6 space-y-3 max-w-2xl">
              <p className="text-lg font-semibold text-white">{t.heroSub1}</p>
              <p className="text-lg text-slate-300">{t.heroSub2}</p>
              <p className="text-base text-slate-400">{t.heroSub3}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY WE EXIST ─────────────────────────────────────────── */}
      <Section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">

            <div>
              <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.whyLabel}</p>
              <h2
                className="reveal reveal-delay-1 mt-5 text-4xl md:text-5xl leading-tight text-slate-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.whyTitle}
              </h2>
              <p className="reveal reveal-delay-2 mt-6 text-base leading-8 text-slate-600">{t.whyBody}</p>
              <p className="reveal reveal-delay-2 mt-4 text-base font-medium leading-8 text-slate-800">{t.whyBody2}</p>
            </div>

            <div className="space-y-4">
              {([
                { title: t.whyBridge1Title, desc: t.whyBridge1Desc },
                { title: t.whyBridge2Title, desc: t.whyBridge2Desc },
                { title: t.whyBridge3Title, desc: t.whyBridge3Desc },
              ] as { title: string; desc: string }[]).map((item, i) => (
                <div
                  key={item.title}
                  className={`reveal reveal-delay-${i + 1} rounded-2xl border border-slate-200 bg-slate-50 p-6 card-lift`}
                >
                  <div className="mb-3 h-px w-8 bg-indigo-400" />
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </Section>

      {/* ── OUR WAY OF THINKING ──────────────────────────────────── */}
      <Section className="bg-slate-900 text-white border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="max-w-3xl mb-16">
            <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-400 font-medium">{t.thinkLabel}</p>
            <h2
              className="reveal reveal-delay-1 mt-5 text-4xl md:text-5xl leading-tight text-white"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.thinkTitle}
            </h2>
            <p className="reveal reveal-delay-2 mt-5 text-base text-slate-400 leading-8">{t.thinkBody}</p>
          </div>

          <div className="space-y-0 border-t border-slate-800">
            {([
              { num: '01', title: t.think1Title, desc: t.think1Desc },
              { num: '02', title: t.think2Title, desc: t.think2Desc },
              { num: '03', title: t.think3Title, desc: t.think3Desc },
              { num: '04', title: t.think4Title, desc: t.think4Desc },
              { num: '05', title: t.think5Title, desc: t.think5Desc },
            ] as { num: string; title: string; desc: string }[]).map((p, i) => (
              <div
                key={p.num}
                className={`reveal reveal-delay-${Math.min(i + 1, 4)} grid md:grid-cols-[80px_1fr_2fr] gap-6 items-start border-b border-slate-800 py-7`}
              >
                <span
                  className="text-2xl font-light text-slate-700"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {p.num}
                </span>
                <h3 className="text-base font-semibold text-white leading-snug pt-0.5">{p.title}</h3>
                <p className="text-sm leading-7 text-slate-400">{p.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </Section>

      {/* ── WHAT WE IMPROVE ──────────────────────────────────────── */}
      <Section className="bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="max-w-3xl mb-14">
            <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.helpLabel}</p>
            <h2
              className="reveal reveal-delay-1 mt-5 text-4xl md:text-5xl leading-tight text-slate-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.helpTitle}
            </h2>
            <p className="reveal reveal-delay-2 mt-5 text-base leading-8 text-slate-600">{t.helpBody}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {([
              { num: '01', title: t.help1Title, desc: t.help1Desc },
              { num: '02', title: t.help2Title, desc: t.help2Desc },
              { num: '03', title: t.help3Title, desc: t.help3Desc },
              { num: '04', title: t.help4Title, desc: t.help4Desc },
              { num: '05', title: t.help5Title, desc: t.help5Desc },
              { num: '06', title: t.help6Title, desc: t.help6Desc },
            ] as { num: string; title: string; desc: string }[]).map((item, i) => (
              <div
                key={item.num}
                className={`reveal reveal-delay-${Math.min(i + 1, 4)} rounded-2xl border border-slate-200 bg-white p-7 card-lift`}
              >
                <span
                  className="text-3xl font-light text-slate-200"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {item.num}
                </span>
                <div className="mt-4 mb-3 h-px w-8 bg-indigo-400" />
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </Section>

      {/* ── VISION ───────────────────────────────────────────────── */}
      <Section className="bg-slate-900 text-white border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl mx-auto">

            <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-400 font-medium">{t.visionLabel}</p>
            <h2
              className="reveal reveal-delay-1 mt-5 text-4xl md:text-5xl leading-tight text-white"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.visionTitle}
            </h2>

            <div className="reveal reveal-delay-2 mt-10 space-y-5">
              <p className="text-lg leading-9 text-slate-300">{t.visionP1}</p>
              <p className="text-base leading-8 text-slate-400">{t.visionP2}</p>
              <p className="text-base leading-8 text-slate-400">{t.visionP3}</p>
            </div>

            <div className="reveal reveal-delay-3 mt-10 rounded-2xl border border-indigo-500/25 bg-slate-800 px-10 py-10 text-center">
              <p
                className="text-2xl md:text-3xl text-white font-light italic"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                &ldquo;{t.visionQuote}&rdquo;
              </p>
            </div>

          </div>
        </div>
      </Section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-32">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.ctaLabel}</p>
            <h2
              className="mt-5 text-4xl md:text-5xl leading-tight text-slate-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.ctaTitle}
              <br />
              <span className="italic text-slate-500">{t.ctaTitleLine2}</span>
            </h2>
            <p className="mt-8 text-lg leading-8 text-slate-600 max-w-2xl">{t.ctaSub}</p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/contact"
                className="inline-block rounded-md bg-slate-900 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {t.ctaBtn}
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
              >
                {t.ctaSecondary}
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
