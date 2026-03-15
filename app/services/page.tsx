'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useLanguage } from '@/components/LanguageProvider'
import { translations } from '@/lib/translations'
import { useRevealChildren } from '@/hooks/useScrollAnimation'

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRevealChildren()
  return <section ref={ref} className={className}>{children}</section>
}

function Accordion({
  name,
  desc,
  detail,
  useCases,
  output,
  problems,
  labels,
}: {
  name: string
  desc: string
  detail: string
  useCases: string[]
  output: string[]
  problems: string[]
  labels: { useCasesTitle: string; outputTitle: string; problemsTitle: string }
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden card-lift">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-8 text-left flex items-start justify-between gap-6 group"
      >
        <div className="flex-1">
          <div className="mb-3 h-px w-8 bg-indigo-400" />
          <h2 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: 'var(--font-playfair)' }}>
            {name}
          </h2>
          <p className="mt-3 leading-7 text-slate-600 text-sm">{desc}</p>
        </div>
        <div className={`mt-1 flex-shrink-0 h-7 w-7 rounded-full border border-slate-200 bg-white flex items-center justify-center transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </button>

      <div className={`transition-all duration-500 ease-in-out ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-8 pb-8 border-t border-slate-200 pt-6">
          <p className="leading-8 text-slate-700 mb-8">{detail}</p>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400 mb-4">{labels.useCasesTitle}</p>
              <ul className="space-y-2">
                {useCases.map((uc) => (
                  <li key={uc} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-indigo-500" />
                    {uc}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400 mb-4">{labels.outputTitle}</p>
              <ul className="space-y-2">
                {output.map((o) => (
                  <li key={o} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-indigo-500" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400 mb-4">{labels.problemsTitle}</p>
              <ul className="space-y-2">
                {problems.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-indigo-500" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const { lang } = useLanguage()
  const t = translations[lang].services
  const tc = translations[lang].common

  const services = [
    {
      name: t.s1Name, desc: t.s1Desc, detail: t.s1Detail,
      useCases: [t.s1Use1, t.s1Use2, t.s1Use3, t.s1Use4],
      output: [t.s1Out1, t.s1Out2, t.s1Out3, t.s1Out4],
      problems: [t.s1Prob1, t.s1Prob2, t.s1Prob3, t.s1Prob4],
    },
    {
      name: t.s2Name, desc: t.s2Desc, detail: t.s2Detail,
      useCases: [t.s2Use1, t.s2Use2, t.s2Use3, t.s2Use4],
      output: [t.s2Out1, t.s2Out2, t.s2Out3, t.s2Out4],
      problems: [t.s2Prob1, t.s2Prob2, t.s2Prob3, t.s2Prob4],
    },
    {
      name: t.s3Name, desc: t.s3Desc, detail: t.s3Detail,
      useCases: [t.s3Use1, t.s3Use2, t.s3Use3, t.s3Use4],
      output: [t.s3Out1, t.s3Out2, t.s3Out3, t.s3Out4],
      problems: [t.s3Prob1, t.s3Prob2, t.s3Prob3, t.s3Prob4],
    },
    {
      name: t.s4Name, desc: t.s4Desc, detail: t.s4Detail,
      useCases: [t.s4Use1, t.s4Use2, t.s4Use3, t.s4Use4],
      output: [t.s4Out1, t.s4Out2, t.s4Out3, t.s4Out4],
      problems: [t.s4Prob1, t.s4Prob2, t.s4Prob3, t.s4Prob4],
    },
    {
      name: t.s5Name, desc: t.s5Desc, detail: t.s5Detail,
      useCases: [t.s5Use1, t.s5Use2, t.s5Use3, t.s5Use4],
      output: [t.s5Out1, t.s5Out2, t.s5Out3, t.s5Out4],
      problems: [t.s5Prob1, t.s5Prob2, t.s5Prob3, t.s5Prob4],
    },
  ]

  const labels = {
    useCasesTitle: t.useCasesTitle,
    outputTitle: t.outputTitle,
    problemsTitle: t.problemsTitle,
  }

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

      {/* Services accordion */}
      <Section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12">
            <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.sectionLabel}</p>
          </div>
          <div className="space-y-4">
            {services.map((svc, i) => (
              <div key={svc.name} className={`reveal reveal-delay-${Math.min(i + 1, 4)}`}>
                <Accordion {...svc} labels={labels} />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Capabilities */}
      <Section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.capLabel}</p>
              <h2
                className="reveal reveal-delay-1 mt-4 text-4xl text-slate-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.capTitle}
              </h2>
            </div>
            <div className="md:col-span-2 grid gap-5 md:grid-cols-2">
              {[
                { title: t.cap1Title, desc: t.cap1Desc },
                { title: t.cap2Title, desc: t.cap2Desc },
                { title: t.cap3Title, desc: t.cap3Desc },
                { title: t.cap4Title, desc: t.cap4Desc },
              ].map((cap, i) => (
                <div key={cap.title} className={`reveal reveal-delay-${i + 1} rounded-2xl border border-slate-200 bg-white p-6 card-lift`}>
                  <h3 className="text-base font-semibold text-slate-900">{cap.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{cap.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Which service is right for you */}
      <Section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12">
            <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.guideLabel}</p>
            <h2
              className="reveal reveal-delay-1 mt-4 text-4xl text-slate-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.guideTitle}
            </h2>
          </div>
          <div className="max-w-3xl space-y-4">
            {[
              { q: t.guide1Q, a: t.guide1A },
              { q: t.guide2Q, a: t.guide2A },
              { q: t.guide3Q, a: t.guide3A },
              { q: t.guide4Q, a: t.guide4A },
              { q: t.guide5Q, a: t.guide5A },
            ].map((item, i) => (
              <div key={i} className={`reveal reveal-delay-${Math.min(i + 1, 4)} flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between`}>
                <p className="text-sm text-slate-700">{item.q}</p>
                <p className="text-sm font-semibold text-indigo-600 flex-shrink-0">{item.a}</p>
              </div>
            ))}
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
            <p className="mt-6 text-lg leading-8 text-slate-400">{t.ctaSub}</p>
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
