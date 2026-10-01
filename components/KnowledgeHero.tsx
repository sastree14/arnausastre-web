'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    label: 'CONOCIMIENTO',
    title: 'Ideas que merecen una segunda lectura.',
    sub: 'Análisis sobre decisiones, operaciones, forecasting, optimización, automatización e IA. Publicamos cuando existe algo útil que entender, no para llenar un calendario.',
    briefing: 'Recibir el Briefing',
  },
  ca: {
    label: 'CONEIXEMENT',
    title: 'Idees que mereixen una segona lectura.',
    sub: 'Anàlisi sobre decisions, operacions, forecasting, optimització, automatització i IA. Publiquem quan hi ha alguna cosa útil per entendre, no per omplir un calendari.',
    briefing: 'Rebre el Briefing',
  },
  en: {
    label: 'KNOWLEDGE',
    title: 'Ideas worth a second read.',
    sub: 'Analysis on decisions, operations, forecasting, optimisation, automation and AI. We publish when there is something useful to understand, not to fill a content calendar.',
    briefing: 'Get the Briefing',
  },
} as const

export default function KnowledgeHero() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]

  return (
    <section className="border-b border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 md:py-20 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">{t.label}</p>
          <h1 className="mt-5 text-5xl leading-[1.04] md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{t.sub}</p>
        </div>
        <Link href="/briefing" className="inline-flex shrink-0 rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:border-slate-500">
          {t.briefing}
        </Link>
      </div>
    </section>
  )
}
