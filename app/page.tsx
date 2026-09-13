'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { publicCopy } from '@/lib/public-copy'

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">{children}</p>
}

export default function HomePage() {
  const { lang } = useSiteLanguage()
  const t = publicCopy[lang].home

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">{t.eyebrow}</p>
            <h1 className="mt-6 max-w-4xl text-5xl font-medium leading-[1.05] md:text-7xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">{t.intro}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/services" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100">{t.primaryCta}</Link>
              <Link href="/contact" className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-white hover:border-slate-500">{t.secondaryCta}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-[0.7fr_1.3fr] md:items-start">
          <Eyebrow>SC-ANALYTICS</Eyebrow>
          <div>
            <h2 className="text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.promiseTitle}</h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{t.promiseBody}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <Eyebrow>{t.problemsLabel}</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.problemsTitle}</h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 md:grid-cols-2">
          {t.problems.map((item) => (
            <article key={item.title} className="bg-white p-7 md:p-8">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <Eyebrow>{t.capabilitiesLabel}</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.capabilitiesTitle}</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{t.capabilitiesIntro}</p>
          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            {t.capabilities.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {item.examples.map((example) => <span key={example} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600">{example}</span>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <Eyebrow>{t.approachLabel}</Eyebrow>
        <h2 className="mt-4 text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.approachTitle}</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {t.steps.map((step) => (
            <article key={step.number} className="rounded-2xl border border-slate-200 p-6">
              <p className="text-sm font-semibold text-indigo-600">{step.number}</p>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">{t.principlesLabel}</p>
          <h2 className="mt-4 text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.principlesTitle}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {t.principles.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-[0.8fr_1.2fr]">
        <Eyebrow>{t.audienceLabel}</Eyebrow>
        <div>
          <h2 className="text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.audienceTitle}</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{t.audienceBody}</p>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-indigo-50">
        <div className="mx-auto max-w-7xl px-6 py-16 md:flex md:items-end md:justify-between md:gap-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.ctaTitle}</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">{t.ctaBody}</p>
          </div>
          <Link href="/contact" className="mt-8 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 md:mt-0">{t.ctaButton}</Link>
        </div>
      </section>
    </main>
  )
}
