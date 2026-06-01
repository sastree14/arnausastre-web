'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'
import { translations } from '@/lib/translations'
import { useRevealChildren } from '@/hooks/useScrollAnimation'
import { caseStudies } from '@/lib/case-studies'

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRevealChildren()
  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  )
}

function HeroReveal({ children }: { children: React.ReactNode }) {
  const ref = useRevealChildren()
  return <div ref={ref}>{children}</div>
}

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function Home() {
  const { lang } = useLanguage()
  const t = translations[lang].home

  return (
    <main className="bg-slate-50 text-slate-900 page-enter">

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[540px] md:min-h-[640px] flex items-center">
        <Image
          src="/brand/hero-banner.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/88 via-slate-900/65 to-slate-900/25" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-36 w-full">
          <HeroReveal>
            <div className="max-w-2xl">
              <p className="reveal mb-5 text-xs uppercase tracking-[0.2em] text-indigo-300 font-medium">
                {t.heroLabel}
              </p>
              <h1
                className="reveal reveal-delay-1 text-5xl leading-[1.1] md:text-6xl text-white"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.heroTitle}
              </h1>
              <p className="reveal reveal-delay-2 mt-8 max-w-xl text-lg leading-8 text-slate-300">
                {t.heroSub}
              </p>
              <div className="reveal reveal-delay-3 mt-10 flex flex-wrap gap-4">
                <Link
                  href="/about"
                  className="rounded-md bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                >
                  {t.heroCta1}
                </Link>
                <Link
                  href="/contact"
                  className="rounded-md border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  {t.heroCta2}
                </Link>
              </div>
            </div>
          </HeroReveal>
        </div>
      </section>

      {/* ── 2. THE PROBLEM ──────────────────────────────────────────────── */}
      <Section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">
              {t.problemLabel}
            </p>
            <h2
              className="reveal reveal-delay-1 mt-4 text-4xl text-slate-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.problemTitle}
            </h2>
            <p className="reveal reveal-delay-2 mt-8 text-lg leading-8 text-slate-600">
              {t.problemP1}
            </p>
            <p className="reveal reveal-delay-3 mt-6 text-lg leading-8 text-slate-500 border-l-2 border-indigo-200 pl-5 italic">
              {t.problemP2}
            </p>
          </div>
        </div>
      </Section>

      {/* ── 3. WHAT IS A DECISION SYSTEM ────────────────────────────────── */}
      <Section className="bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-14 md:grid-cols-2">
            <div>
              <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">
                {t.dsLabel}
              </p>
              <h2
                className="reveal reveal-delay-1 mt-4 text-4xl text-slate-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.dsTitle}
              </h2>
              <p className="reveal reveal-delay-2 mt-6 text-lg leading-8 text-slate-600">
                {t.dsSub}
              </p>
              <blockquote className="reveal reveal-delay-3 mt-8 border-l-4 border-indigo-500 pl-5">
                <p
                  className="text-xl leading-8 text-slate-700 italic"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  &ldquo;{t.dsQuote}&rdquo;
                </p>
              </blockquote>
              <div className="reveal reveal-delay-4 mt-8">
                <Link
                  href="/case-studies"
                  className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                >
                  {t.dsCta}
                  <ArrowIcon />
                </Link>
              </div>
            </div>

            <div className="grid gap-5 content-start">
              {[
                { title: t.dsAttr1Title, desc: t.dsAttr1Desc },
                { title: t.dsAttr2Title, desc: t.dsAttr2Desc },
                { title: t.dsAttr3Title, desc: t.dsAttr3Desc },
              ].map((attr, i) => (
                <div
                  key={attr.title}
                  className={`reveal reveal-delay-${i + 1} rounded-2xl border border-slate-200 bg-white p-6 card-lift`}
                >
                  <div className="mb-3 h-px w-8 bg-indigo-400" />
                  <h3 className="text-lg font-semibold text-slate-900">{attr.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{attr.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 4. HOW WE WORK ──────────────────────────────────────────────── */}
      <Section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-14">
            <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">
              {t.howLabel}
            </p>
            <h2
              className="reveal reveal-delay-1 mt-4 max-w-2xl text-4xl text-slate-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.howTitle}
            </h2>
            <p className="reveal reveal-delay-2 mt-4 text-lg text-slate-600">
              {t.howSub}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3 xl:grid-cols-5">
            {[
              { num: t.how1Num, title: t.how1Title, desc: t.how1Desc },
              { num: t.how2Num, title: t.how2Title, desc: t.how2Desc },
              { num: t.how3Num, title: t.how3Title, desc: t.how3Desc },
              { num: t.how4Num, title: t.how4Title, desc: t.how4Desc },
              { num: t.how5Num, title: t.how5Title, desc: t.how5Desc },
            ].map((step, i) => (
              <div
                key={step.num}
                className={`reveal reveal-delay-${Math.min(i + 1, 4)} group rounded-2xl border border-slate-200 bg-slate-50 p-6 card-lift`}
              >
                <p
                  className="text-3xl font-light text-slate-200 transition group-hover:text-indigo-200"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {step.num}
                </p>
                <h3 className="mt-3 text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 reveal">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
            >
              {t.howCta}
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </Section>

      {/* ── 5. DISCIPLINES ──────────────────────────────────────────────── */}
      <Section className="bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-14 max-w-3xl">
            <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">
              {t.discLabel}
            </p>
            <h2
              className="reveal reveal-delay-1 mt-4 text-4xl text-slate-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.discTitle}
            </h2>
            <p className="reveal reveal-delay-2 mt-4 text-lg leading-8 text-slate-600">
              {t.discIntro}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[
              { name: t.disc1Name, desc: t.disc1Desc },
              { name: t.disc2Name, desc: t.disc2Desc },
              { name: t.disc3Name, desc: t.disc3Desc },
              { name: t.disc4Name, desc: t.disc4Desc },
              { name: t.disc5Name, desc: t.disc5Desc },
            ].map((disc, i) => (
              <div
                key={disc.name}
                className={`reveal reveal-delay-${Math.min(i + 1, 4)} rounded-2xl border border-slate-200 bg-white p-6 card-lift`}
              >
                <div className="mb-3 h-px w-8 bg-indigo-400" />
                <h3 className="text-base font-semibold text-slate-900">{disc.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{disc.desc}</p>
              </div>
            ))}
          </div>

          <div className="reveal mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-6 py-5">
            <p className="text-sm leading-7 text-slate-600">
              <span className="font-semibold text-slate-900">Note. </span>
              {t.discNote}
            </p>
          </div>

          <div className="mt-8 reveal">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
            >
              {t.discCta}
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </Section>

      {/* ── 6. WHY SC-ANALYTICS ─────────────────────────────────────────── */}
      <Section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-14 md:grid-cols-3">
            <div>
              <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">
                {t.whyLabel}
              </p>
              <h2
                className="reveal reveal-delay-1 mt-4 text-4xl text-slate-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.whyTitle}
              </h2>
              <div className="reveal reveal-delay-2 mt-6">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                >
                  {t.whyCta}
                  <ArrowIcon />
                </Link>
              </div>
            </div>

            <div className="md:col-span-2 grid gap-5 md:grid-cols-2">
              {[
                { title: t.why1Title, desc: t.why1Desc },
                { title: t.why2Title, desc: t.why2Desc },
                { title: t.why3Title, desc: t.why3Desc },
                { title: t.why4Title, desc: t.why4Desc },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className={`reveal reveal-delay-${i + 1} rounded-2xl border border-slate-200 bg-slate-50 p-6 card-lift`}
                >
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 7. CASE STUDIES PREVIEW ─────────────────────────────────────── */}
      <Section className="bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-14">
            <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">
              {t.csLabel}
            </p>
            <h2
              className="reveal reveal-delay-1 mt-4 max-w-2xl text-4xl text-slate-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.csTitle}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {caseStudies.slice(0, 3).map((cs, i) => (
              <div
                key={cs.slug}
                className={`reveal reveal-delay-${i + 1} flex flex-col rounded-2xl border border-slate-200 bg-white p-7 card-lift`}
              >
                <p className="text-xs uppercase tracking-[0.16em] text-indigo-600 font-medium">
                  {lang === 'es' ? cs.industryEs : cs.industry}
                </p>
                <h3
                  className="mt-3 text-xl text-slate-900 flex-1"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {lang === 'es' ? cs.titleEs : cs.titleEn}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-3">
                  {lang === 'es' ? cs.excerptEs : cs.excerptEn}
                </p>
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="flex flex-col gap-1.5 mb-5">
                    {cs.results.slice(0, 2).map((r) => (
                      <p key={r.metric} className="text-xs text-slate-500">
                        <span className="font-semibold text-slate-800">{r.value}</span>
                        {' — '}
                        {lang === 'es' ? r.metricEs : r.metric}
                      </p>
                    ))}
                  </div>
                  <Link
                    href={`/case-studies/${cs.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                  >
                    {translations[lang].common.viewCaseStudy}
                    <ArrowIcon />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 reveal">
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
            >
              {t.csCta}
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </Section>

      {/* ── 8. FINAL CTA ────────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-medium">
              {t.ctaLabel}
            </p>
            <h2
              className="mt-5 text-4xl md:text-5xl leading-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.ctaTitle}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              {t.ctaSub}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/contact"
                className="inline-block rounded-md bg-white px-7 py-3.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
                {t.ctaBtn}
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition"
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
