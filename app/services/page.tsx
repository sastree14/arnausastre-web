'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'
import { translations } from '@/lib/translations'
import { useRevealChildren } from '@/hooks/useScrollAnimation'

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRevealChildren()
  return <section ref={ref} className={className}>{children}</section>
}

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0 mt-0.5">
    <polyline points="2,8 6,12 14,4" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function ServicesPage() {
  const { lang } = useLanguage()
  const t = translations[lang].services

  return (
    <main className="bg-white text-slate-900 page-enter">

      {/* ── HERO ────────────────────────────────────────────────────── */}
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

      {/* ── S1: CONVERSACIÓN INICIAL ─────────────────────────────── */}
      <Section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">

            <div>
              <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.s1Label}</p>
              <h2
                className="reveal reveal-delay-1 mt-5 text-4xl md:text-5xl leading-tight text-slate-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.s1Title}
              </h2>
              <div className="reveal reveal-delay-2 mt-10 border-l-4 border-indigo-500 pl-5">
                <p className="text-base font-semibold text-slate-800 leading-7">{t.s1Note}</p>
              </div>
            </div>

            <div>
              <p className="reveal text-base leading-8 text-slate-600">{t.s1Body}</p>
              <ul className="reveal reveal-delay-1 mt-8 space-y-4">
                {([t.s1Point1, t.s1Point2, t.s1Point3, t.s1Point4] as string[]).map((point) => (
                  <li key={point} className="flex items-start gap-3 text-slate-700">
                    <CheckIcon />
                    <span className="text-sm leading-6">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </Section>

      {/* ── S2: COMPRENDER LA INFORMACIÓN ───────────────────────── */}
      <Section className="bg-slate-900 text-white border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">

            <div>
              <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-400 font-medium">{t.s2Label}</p>
              <h2
                className="reveal reveal-delay-1 mt-5 text-4xl md:text-5xl leading-tight text-white"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.s2Title}
              </h2>
              <p className="reveal reveal-delay-2 mt-6 text-base leading-8 text-slate-400">{t.s2Body}</p>
            </div>

            <div>
              <ul className="reveal space-y-0">
                {([t.s2Item1, t.s2Item2, t.s2Item3, t.s2Item4, t.s2Item5] as string[]).map((item, i) => (
                  <li key={i} className="flex items-start gap-4 border-b border-slate-800 py-4 last:border-0">
                    <span className="text-[10px] font-bold text-indigo-400 tracking-[0.14em] mt-1 flex-shrink-0 w-6">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm leading-6 text-slate-300">{item}</p>
                  </li>
                ))}
              </ul>
              <div className="reveal reveal-delay-1 mt-6 border-l-4 border-indigo-500 pl-5">
                <p className="text-sm font-semibold text-slate-200 leading-7">{t.s2Note}</p>
              </div>
            </div>

          </div>
        </div>
      </Section>

      {/* ── S3: EVALUAR ALTERNATIVAS ─────────────────────────────── */}
      <Section className="bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="max-w-3xl mb-16">
            <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.s3Label}</p>
            <h2
              className="reveal reveal-delay-1 mt-5 text-4xl md:text-5xl leading-tight text-slate-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.s3Title}
            </h2>
            <p className="reveal reveal-delay-2 mt-5 text-base leading-8 text-slate-600">{t.s3Body}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {([
              { num: '01', title: t.s3Alt1Title, desc: t.s3Alt1Desc },
              { num: '02', title: t.s3Alt2Title, desc: t.s3Alt2Desc },
              { num: '03', title: t.s3Alt3Title, desc: t.s3Alt3Desc },
              { num: '04', title: t.s3Alt4Title, desc: t.s3Alt4Desc },
            ] as { num: string; title: string; desc: string }[]).map((alt, i) => (
              <div
                key={alt.num}
                className={`reveal reveal-delay-${i + 1} rounded-2xl border border-slate-200 bg-white p-8 card-lift`}
              >
                <span
                  className="text-3xl font-light text-slate-200"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {alt.num}
                </span>
                <div className="mt-4 mb-4 h-px w-8 bg-indigo-400" />
                <h3 className="text-base font-semibold text-slate-900">{alt.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{alt.desc}</p>
              </div>
            ))}
          </div>

          <div className="reveal mt-10 border-l-4 border-slate-300 pl-5">
            <p className="text-sm font-medium text-slate-500 italic">{t.s3Note}</p>
          </div>

        </div>
      </Section>

      {/* ── S4: DECIDIR QUÉ MERECE LA PENA ──────────────────────── */}
      <Section className="bg-slate-900 text-white border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="max-w-3xl mx-auto text-center mb-14">
            <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-400 font-medium">{t.s4Label}</p>
            <h2
              className="reveal reveal-delay-1 mt-5 text-4xl md:text-5xl leading-tight text-white"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.s4Title}
            </h2>
            <p className="reveal reveal-delay-2 mt-6 text-base leading-8 text-slate-400">{t.s4Body}</p>
          </div>

          {/* Key quote */}
          <div className="reveal max-w-4xl mx-auto rounded-2xl border border-indigo-500/25 bg-slate-800 px-10 py-12 md:px-16 md:py-14 text-center">
            <p
              className="text-xl md:text-2xl leading-9 text-white font-light"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              &ldquo;{t.s4Quote}&rdquo;
            </p>
          </div>

          {/* Three principles */}
          <div className="reveal reveal-delay-1 mt-12 max-w-2xl mx-auto space-y-4">
            {([t.s4Point1, t.s4Point2, t.s4Point3] as string[]).map((point) => (
              <div key={point} className="flex items-start gap-4">
                <span className="flex-shrink-0 mt-2 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                <p className="text-base text-slate-300">{point}</p>
              </div>
            ))}
          </div>

          <div className="reveal reveal-delay-2 mt-10 max-w-2xl mx-auto border-t border-slate-800 pt-8">
            <p className="text-sm leading-7 text-slate-400 text-center">{t.s4Note}</p>
          </div>

        </div>
      </Section>

      {/* ── S5: DESARROLLO E IMPLEMENTACIÓN ──────────────────────── */}
      <Section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="mb-16">
            <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.s5Label}</p>
            <h2
              className="reveal reveal-delay-1 mt-5 text-4xl md:text-5xl leading-tight text-slate-900 max-w-2xl"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.s5Title}
            </h2>
            <p className="reveal reveal-delay-2 mt-5 text-base leading-8 text-slate-600 max-w-2xl">{t.s5Body}</p>
          </div>

          <div className="relative grid gap-4 md:grid-cols-3 xl:grid-cols-5">
            <div className="pointer-events-none absolute top-9 left-10 right-10 hidden xl:block">
              <div className="h-px bg-slate-200" />
            </div>
            {([
              { num: '01', title: t.s5Step1, desc: t.s5Step1Desc },
              { num: '02', title: t.s5Step2, desc: t.s5Step2Desc },
              { num: '03', title: t.s5Step3, desc: t.s5Step3Desc },
              { num: '04', title: t.s5Step4, desc: t.s5Step4Desc },
              { num: '05', title: t.s5Step5, desc: t.s5Step5Desc },
            ] as { num: string; title: string; desc: string }[]).map((step, i) => (
              <div
                key={step.num}
                className={`reveal reveal-delay-${Math.min(i + 1, 4)} group relative rounded-xl border border-slate-200 bg-slate-50 p-6 card-lift`}
              >
                <p
                  className="text-4xl font-light text-slate-300 transition group-hover:text-indigo-300"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {step.num}
                </p>
                <h3 className="mt-4 text-sm font-semibold text-slate-900 leading-snug">{step.title}</h3>
                <p className="mt-3 text-xs leading-6 text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </Section>

      {/* ── S6: ENTREGA Y TRANSFERENCIA ──────────────────────────── */}
      <Section className="bg-slate-900 text-white border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="grid gap-12 lg:grid-cols-2 lg:items-end mb-14">
            <div>
              <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-400 font-medium">{t.s6Label}</p>
              <h2
                className="reveal reveal-delay-1 mt-5 text-4xl md:text-5xl leading-tight text-white"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.s6Title}
              </h2>
            </div>
            <div>
              <p className="reveal text-base leading-8 text-slate-400">{t.s6Body}</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {([
              { title: t.s6Point1Title, desc: t.s6Point1Desc },
              { title: t.s6Point2Title, desc: t.s6Point2Desc },
              { title: t.s6Point3Title, desc: t.s6Point3Desc },
            ] as { title: string; desc: string }[]).map((point, i) => (
              <div
                key={point.title}
                className={`reveal reveal-delay-${i + 1} rounded-2xl border border-slate-700 bg-slate-800 p-7`}
              >
                <div className="mb-4 h-px w-8 bg-indigo-500" />
                <h3 className="text-base font-semibold text-white leading-snug">{point.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{point.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </Section>

      {/* ── S7: SEGUIMIENTO Y MEJORA ─────────────────────────────── */}
      <Section className="bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">

            <div>
              <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.s7Label}</p>
              <h2
                className="reveal reveal-delay-1 mt-5 text-4xl md:text-5xl leading-tight text-slate-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.s7Title}
              </h2>
              <p className="reveal reveal-delay-2 mt-6 text-base leading-8 text-slate-600">{t.s7Body}</p>
            </div>

            <div>
              <ul className="reveal space-y-0">
                {([t.s7Point1, t.s7Point2, t.s7Point3, t.s7Point4] as string[]).map((point, i) => (
                  <li key={i} className="flex items-start gap-4 border-b border-slate-200 py-5 last:border-0">
                    <span className="text-[10px] font-bold text-indigo-500 tracking-[0.14em] mt-1 flex-shrink-0 w-6">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm leading-7 text-slate-700">{point}</p>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </Section>

      {/* ── VALUES ───────────────────────────────────────────────── */}
      <Section className="bg-slate-900 text-white border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-400 font-medium">{t.valLabel}</p>
            <h2
              className="reveal reveal-delay-1 mt-5 text-4xl md:text-5xl leading-tight text-white"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.valTitle}
            </h2>
            <p className="reveal reveal-delay-2 mt-5 text-base text-slate-400 leading-8">{t.valBody}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3 xl:grid-cols-5">
            {([
              { title: t.val1Title, desc: t.val1Desc },
              { title: t.val2Title, desc: t.val2Desc },
              { title: t.val3Title, desc: t.val3Desc },
              { title: t.val4Title, desc: t.val4Desc },
              { title: t.val5Title, desc: t.val5Desc },
            ] as { title: string; desc: string }[]).map((v, i) => (
              <div
                key={v.title}
                className={`reveal reveal-delay-${Math.min(i + 1, 4)} rounded-2xl border border-slate-700 bg-slate-800 p-6 flex flex-col`}
              >
                <div className="mb-4 h-px w-8 bg-indigo-400" />
                <h3 className="text-sm font-semibold text-white leading-snug">{v.title}</h3>
                <p className="mt-3 text-xs leading-6 text-slate-400">{v.desc}</p>
              </div>
            ))}
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
                href="/about"
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
