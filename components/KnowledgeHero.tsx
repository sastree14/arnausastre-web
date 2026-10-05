'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    label: 'CONOCIMIENTO',
    title: 'Ideas que conectan datos, tecnología y decisiones de negocio.',
    sub: 'Análisis directos sobre lo que funciona, lo que falla y qué merece la pena hacer diferente.',
    primary: 'Leer análisis destacado',
    secondary: 'Ver casos de éxito',
  },
  ca: {
    label: 'CONEIXEMENT',
    title: 'Idees que connecten dades, tecnologia i decisions de negoci.',
    sub: 'Anàlisis directes sobre què funciona, què falla i què val la pena fer diferent.',
    primary: 'Llegir anàlisi destacada',
    secondary: 'Veure casos d’èxit',
  },
  en: {
    label: 'KNOWLEDGE',
    title: 'Ideas connecting data, technology and business decisions.',
    sub: 'Direct analysis on what works, what fails and what is worth doing differently.',
    primary: 'Read featured analysis',
    secondary: 'See success stories',
  },
} as const

const FEATURED = '/knowledge/why-inventory-visibility-is-not-inventory-control-and-what-that-costs'

export default function KnowledgeHero() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]

  return (
    <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
      <div className="site-container flex flex-col items-center gap-9 py-14 text-center md:py-16">
        <div className="max-w-5xl">
          <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">{t.label}</p>
          <h1 className="mt-5 max-w-5xl text-[44px] leading-[1.02] tracking-[-0.03em] sm:text-[54px] lg:text-[62px]" style={{ fontFamily: 'var(--font-playfair)' }}>
            {t.title}
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-[18px] leading-8 text-[#EAF0F6]">{t.sub}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href={FEATURED} className="bg-white px-5 py-3.5 text-[15px] font-semibold text-[#0D1B2A] transition hover:bg-[#EAF0F6]">
            {t.primary} →
          </Link>
          <Link href="/projects" className="border border-[#7F9BB5] px-5 py-3.5 text-[15px] font-semibold text-white transition hover:bg-white/5">
            {t.secondary}
          </Link>
        </div>
      </div>
    </section>
  )
}
