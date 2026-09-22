'use client'

import Link from 'next/link'
import AnalyticalPartnerSection from '@/components/AnalyticalPartnerSection'
import FreeDiagnosticSection from '@/components/FreeDiagnosticSection'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { publicCopy } from '@/lib/public-copy'

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">{children}</p>
}

export default function ServicesPage() {
  const { lang } = useSiteLanguage()
  const t = publicCopy[lang].services

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">{t.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl text-5xl leading-[1.08] md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">{t.intro}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <Eyebrow>{t.capabilityLabel}</Eyebrow>
        <h2 className="mt-4 text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.capabilityTitle}</h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{t.capabilityIntro}</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {t.cards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-7">
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{card.body}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {card.examples.map((example) => <span key={example} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">{example}</span>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <Eyebrow>{t.processLabel}</Eyebrow>
          <h2 className="mt-4 text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.processTitle}</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {t.steps.map((step) => (
              <article key={step.number} className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-sm font-semibold text-indigo-600">{step.number}</p>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-8 md:p-12">
          <Eyebrow>{t.notFitLabel}</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.notFitTitle}</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">{t.notFitBody}</p>
        </div>
      </section>

      <FreeDiagnosticSection />
      <AnalyticalPartnerSection />

      <section className="border-t border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:flex md:items-end md:justify-between md:gap-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.ctaTitle}</h2>
            <p className="mt-4 text-base leading-8 text-slate-400">{t.ctaBody}</p>
          </div>
          <Link href="/contact" className="mt-8 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100 md:mt-0">{t.ctaButton}</Link>
        </div>
      </section>
    </main>
  )
}
