'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'
import { translations } from '@/lib/translations'
import { useRevealChildren } from '@/hooks/useScrollAnimation'

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRevealChildren()
  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  )
}

export default function Home() {
  const { lang } = useLanguage()
  const t = translations[lang].home

  return (
    <main className="bg-slate-50 text-slate-900 page-enter">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:py-36">
        <div className="grid items-center gap-16 md:grid-cols-2">
          <div>
            <p className="reveal mb-5 text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">
              {t.heroLabel}
            </p>

            <h1
              className="reveal reveal-delay-1 max-w-2xl text-5xl leading-[1.1] md:text-6xl"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.heroH1a}{' '}
              <span className="italic text-slate-500">{t.heroH1b}</span>
            </h1>

            <p className="reveal reveal-delay-2 mt-8 max-w-xl text-lg leading-8 text-slate-600">
              {t.heroSub}
            </p>

            <div className="reveal reveal-delay-3 mt-10 flex flex-wrap gap-4">
              <Link
                href="/services"
                className="rounded-md bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                {t.heroCta1}
              </Link>
              <Link
                href="/contact"
                className="rounded-md border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
              >
                {t.heroCta2}
              </Link>
            </div>
          </div>

          <div className="reveal reveal-delay-2 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm card-lift">
            <div className="mb-6 border-b border-slate-100 pb-5">
              <span className="accent-line mb-3" />
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{t.heroCardLabel}</p>
              <h2
                className="mt-3 text-2xl text-slate-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.heroCardTitle}
              </h2>
            </div>
            <div className="space-y-5 text-slate-600">
              {[
                { title: t.heroCardC1Title, desc: t.heroCardC1Desc },
                { title: t.heroCardC2Title, desc: t.heroCardC2Desc },
                { title: t.heroCardC3Title, desc: t.heroCardC3Desc },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-6">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <Section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-14">
            <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.processLabel}</p>
            <h2
              className="reveal reveal-delay-1 mt-4 max-w-2xl text-4xl text-slate-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.processTitle}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {[
              { num: t.step1Num, title: t.step1Title, desc: t.step1Desc },
              { num: t.step2Num, title: t.step2Title, desc: t.step2Desc },
              { num: t.step3Num, title: t.step3Title, desc: t.step3Desc },
              { num: t.step4Num, title: t.step4Title, desc: t.step4Desc },
            ].map((step, i) => (
              <div
                key={step.num}
                className={`reveal reveal-delay-${i + 1} group rounded-2xl border border-slate-200 bg-slate-50 p-6 card-lift`}
              >
                <p className="text-3xl font-light text-slate-200 transition group-hover:text-indigo-200"
                  style={{ fontFamily: 'var(--font-playfair)' }}>
                  {step.num}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Services */}
      <Section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-14 max-w-3xl">
            <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.servicesLabel}</p>
            <h2
              className="reveal reveal-delay-1 mt-4 text-4xl text-slate-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.servicesTitle}
            </h2>
            <p className="reveal reveal-delay-2 mt-6 text-lg leading-8 text-slate-600">{t.servicesSub}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              { name: translations[lang].services.s1Name, desc: translations[lang].services.s1Desc },
              { name: translations[lang].services.s2Name, desc: translations[lang].services.s2Desc },
              { name: translations[lang].services.s3Name, desc: translations[lang].services.s3Desc },
              { name: translations[lang].services.s4Name, desc: translations[lang].services.s4Desc },
            ].map((svc, i) => (
              <div
                key={svc.name}
                className={`reveal reveal-delay-${i + 1} rounded-2xl border border-slate-200 bg-white p-6 card-lift`}
              >
                <div className="mb-3 h-px w-8 bg-indigo-400" />
                <h3 className="text-lg font-semibold text-slate-900">{svc.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{svc.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 reveal">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
            >
              {translations[lang].common.exploreServices}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </Section>

      {/* Why work with me */}
      <Section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-14 md:grid-cols-3">
            <div>
              <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.whyLabel}</p>
              <h2
                className="reveal reveal-delay-1 mt-4 text-4xl text-slate-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.whyTitle}
              </h2>
            </div>

            <div className="md:col-span-2 grid gap-5 md:grid-cols-2">
              {[
                { title: t.d1Title, desc: t.d1Desc },
                { title: t.d2Title, desc: t.d2Desc },
                { title: t.d3Title, desc: t.d3Desc },
                { title: t.d4Title, desc: t.d4Desc },
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

      {/* Industries */}
      <Section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12">
            <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.industriesLabel}</p>
            <h2
              className="reveal reveal-delay-1 mt-4 max-w-2xl text-4xl text-slate-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.industriesTitle}
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { name: t.ind1, desc: t.ind1Desc },
              { name: t.ind2, desc: t.ind2Desc },
              { name: t.ind3, desc: t.ind3Desc },
              { name: t.ind4, desc: t.ind4Desc },
            ].map((ind, i) => (
              <div
                key={ind.name}
                className={`reveal reveal-delay-${i + 1} rounded-2xl border border-slate-200 bg-white p-6 card-lift`}
              >
                <h3 className="text-base font-semibold text-slate-900">{ind.name}</h3>
                <p className="mt-2 text-xs text-slate-500 leading-5">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Principles */}
      <Section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.principlesLabel}</p>
              <h2
                className="reveal reveal-delay-1 mt-4 text-4xl text-slate-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.principlesTitle}
              </h2>
            </div>

            <div className="md:col-span-2 grid gap-5 md:grid-cols-2">
              {[
                { title: t.p1Title, desc: t.p1Desc },
                { title: t.p2Title, desc: t.p2Desc },
                { title: t.p3Title, desc: t.p3Desc },
                { title: t.p4Title, desc: t.p4Desc },
              ].map((p, i) => (
                <div
                  key={p.title}
                  className={`reveal reveal-delay-${i + 1} rounded-2xl border border-slate-200 bg-slate-50 p-6 card-lift`}
                >
                  <h3 className="text-base font-semibold text-slate-900">{p.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-medium">{t.ctaLabel}</p>
            <h2
              className="mt-5 text-4xl md:text-5xl leading-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.ctaTitle}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">{t.ctaSub}</p>
            <div className="mt-10">
              <Link
                href="/contact"
                className="inline-block rounded-md bg-white px-7 py-3.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
                {t.ctaBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
