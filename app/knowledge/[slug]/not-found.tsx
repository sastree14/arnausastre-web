'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    title: 'Este análisis todavía no está disponible.',
    body: 'Puede que el contenido se esté preparando, haya cambiado de ruta o todavía no esté publicado. La navegación principal sigue disponible.',
    label: 'SIGUE EXPLORANDO',
    links: [['Volver a conocimiento','/knowledge'],['Explorar casos','/projects'],['Cómo trabajamos','/services']],
  },
  ca: {
    title: 'Aquesta anàlisi encara no està disponible.',
    body: 'Pot ser que el contingut s’estigui preparant, hagi canviat de ruta o encara no estigui publicat. La navegació principal continua disponible.',
    label: 'CONTINUA EXPLORANT',
    links: [['Tornar a coneixement','/knowledge'],['Explorar casos','/projects'],['Com treballem','/services']],
  },
  en: {
    title: 'This analysis is not available yet.',
    body: 'The content may still be in preparation, may have moved or may not be published yet. The rest of the site remains available.',
    label: 'KEEP EXPLORING',
    links: [['Back to knowledge','/knowledge'],['Explore case studies','/projects'],['How we work','/services']],
  },
} as const

export default function KnowledgeArticleNotFound() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]

  return (
    <main className="bg-[#FAFAF7] text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">SC-ANALYTICS KNOWLEDGE</p>
          <h1 className="mt-5 max-w-4xl text-[44px] leading-[1.04] tracking-[-0.03em] sm:text-[56px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
          <p className="mt-6 max-w-3xl text-[17px] leading-8 text-[#EAF0F6]">{t.body}</p>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto grid max-w-6xl gap-7 px-6 py-10 lg:grid-cols-[190px_1fr] lg:gap-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.label}</p>
          <div className="grid border-t border-slate-300 md:grid-cols-3 md:divide-x md:divide-slate-300">
            {t.links.map(([label, href]) => (
              <Link key={href} href={href} className="group flex items-center justify-between border-b border-slate-300 py-4 text-[13px] font-semibold text-slate-900 md:px-5 md:first:pl-0">
                {label}<span className="text-indigo-700 transition group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
