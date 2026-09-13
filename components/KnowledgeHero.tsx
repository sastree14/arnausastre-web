'use client'

import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const copy = {
  en: {
    label: 'KNOWLEDGE',
    title: 'Useful analysis, not content for content’s sake.',
    sub: 'Research, frameworks and practical perspectives on forecasting, optimisation, analytics, automation and AI — selected when there is a business decision worth understanding.',
  },
  es: {
    label: 'CONOCIMIENTO',
    title: 'Análisis útil, no contenido por publicar.',
    sub: 'Investigación, frameworks y perspectivas prácticas sobre forecasting, optimización, analytics, automatización e IA, seleccionadas cuando existe una decisión empresarial que merece entenderse.',
  },
  ca: {
    label: 'CONEIXEMENT',
    title: 'Anàlisi útil, no contingut per publicar.',
    sub: 'Recerca, frameworks i perspectives pràctiques sobre forecasting, optimització, analytics, automatització i IA, seleccionades quan hi ha una decisió empresarial que mereix ser compresa.',
  },
} as const

export default function KnowledgeHero() {
  const { lang } = useSiteLanguage()
  const t = copy[lang]

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">{t.label}</p>
        <h1 className="mt-4 max-w-4xl text-5xl leading-tight text-slate-900 md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600">{t.sub}</p>
      </div>
    </section>
  )
}
