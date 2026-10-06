'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    statement: 'Consultoría de datos, matemáticas e inteligencia artificial aplicada a decisiones de negocio.',
    work: 'Servicios',
    cases: 'Casos de éxito',
    knowledge: 'Conocimiento',
    partner: 'Partner Data e IA',
    why: 'Por qué SC-Analytics',
    contact: 'Contacta con nosotros',
    rights: '© 2026 SC-Analytics. Todos los derechos reservados.',
  },
  ca: {
    statement: 'Consultoria de dades, matemàtiques i intel·ligència artificial aplicada a decisions de negoci.',
    work: 'Serveis',
    cases: 'Casos d’èxit',
    knowledge: 'Coneixement',
    partner: 'Partner Dades i IA',
    why: 'Per què SC-Analytics',
    contact: 'Contacta amb nosaltres',
    rights: '© 2026 SC-Analytics. Tots els drets reservats.',
  },
  en: {
    statement: 'Data, mathematics and artificial intelligence consulting applied to business decisions.',
    work: 'Services',
    cases: 'Success stories',
    knowledge: 'Knowledge',
    partner: 'Data and AI Partner',
    why: 'Why SC-Analytics',
    contact: 'Contact us',
    rights: '© 2026 SC-Analytics. All rights reserved.',
  },
} as const

export default function Footer() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]

  return (
    <footer className="border-t border-[#496C8A] bg-[#0D1B2A] text-white">
      <div className="site-container py-5">
        <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr_auto] lg:items-center">
          <div>
            <Image src="/brand/logo-white.png" alt="SC-Analytics" width={1536} height={1024} className="h-16 w-auto" />
            <p className="mt-1 max-w-sm text-[14px] leading-5 text-[#A8BACB]">{t.statement}</p>
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-[#A8BACB]">
            <Link href="/services" className="transition hover:text-white">{t.work}</Link>
            <Link href="/projects" className="transition hover:text-white">{t.cases}</Link>
            <Link href="/knowledge" className="transition hover:text-white">{t.knowledge}</Link>
            <Link href="/partner-analitico" className="transition hover:text-white">{t.partner}</Link>
            <Link href="/about" className="transition hover:text-white">{t.why}</Link>
          </nav>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 lg:flex-col lg:items-stretch">
            <a href="https://www.linkedin.com/company/sc-analytics/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 text-[14px] font-medium text-white underline-offset-4 hover:underline">
              <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center rounded-sm border border-current text-xs font-bold">in</span>
              SC-Analytics · LinkedIn ↗
            </a>
            <Link href="/contact" className="inline-flex justify-center border border-[#A8BACB] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-white/5">
              {t.contact} →
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-[#496C8A] pt-3 text-[12px] text-[#A8BACB] sm:flex-row sm:items-center sm:justify-between">
          <p>{t.rights}</p>
        </div>
      </div>
    </footer>
  )
}
