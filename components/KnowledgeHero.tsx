'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    label: 'CONOCIMIENTO',
    title: 'Ideas para entender mejor antes de decidir.',
    sub: 'Análisis sobre operaciones, forecasting, optimización, automatización e inteligencia artificial. El objetivo no es publicar más, sino explicar mejor lo que puede cambiar una decisión.',
    cases: 'Ver casos',
    work: 'Cómo trabajamos',
  },
  ca: {
    label: 'CONEIXEMENT',
    title: 'Idees per entendre millor abans de decidir.',
    sub: 'Anàlisi sobre operacions, forecasting, optimització, automatització i intel·ligència artificial. L’objectiu no és publicar més, sinó explicar millor allò que pot canviar una decisió.',
    cases: 'Veure casos',
    work: 'Com treballem',
  },
  en: {
    label: 'KNOWLEDGE',
    title: 'Ideas to understand better before deciding.',
    sub: 'Analysis on operations, forecasting, optimisation, automation and artificial intelligence. The goal is not to publish more, but to explain what can genuinely change a decision.',
    cases: 'See case studies',
    work: 'How we work',
  },
} as const

export default function KnowledgeHero() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]

  return (
    <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:py-20 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-4xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">{t.label}</p>
          <h1 className="mt-5 text-[44px] leading-[1.04] tracking-[-0.03em] sm:text-[56px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
          <p className="mt-6 max-w-3xl text-[17px] leading-8 text-[#EAF0F6]">{t.sub}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/projects" className="bg-white px-4 py-2.5 text-[13px] font-semibold text-[#0D1B2A]">{t.cases}</Link>
          <Link href="/services" className="border border-[#7F9BB5] px-4 py-2.5 text-[13px] font-semibold text-white">{t.work}</Link>
        </div>
      </div>
    </section>
  )
}
