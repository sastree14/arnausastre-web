'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    statement: 'Datos, matemáticas e IA aplicados a decisiones que mejoran el negocio.',
    work: 'Cómo trabajamos',
    cases: 'Casos',
    knowledge: 'Conocimiento',
    partner: 'Partner Data & AI',
    why: 'Por qué SC-Analytics',
    title: '¿Hay una decisión, proceso o sistema que debería funcionar mejor?',
    body: 'Cuéntanos qué está pasando. Empezaremos por entender el problema antes de hablar de tecnología.',
    button: 'Hablar con nosotros',
    rights: '© 2026 SC-Analytics. Todos los derechos reservados.',
  },
  ca: {
    statement: 'Dades, matemàtiques i IA aplicades a decisions que milloren el negoci.',
    work: 'Com treballem',
    cases: 'Casos',
    knowledge: 'Coneixement',
    partner: 'Partner Data & AI',
    why: 'Per què SC-Analytics',
    title: 'Hi ha una decisió, procés o sistema que hauria de funcionar millor?',
    body: 'Explica’ns què està passant. Començarem per entendre el problema abans de parlar de tecnologia.',
    button: 'Parlar amb nosaltres',
    rights: '© 2026 SC-Analytics. Tots els drets reservats.',
  },
  en: {
    statement: 'Data, mathematics and AI applied to decisions that improve the business.',
    work: 'How we work',
    cases: 'Case studies',
    knowledge: 'Knowledge',
    partner: 'Data & AI Partner',
    why: 'Why SC-Analytics',
    title: 'Is there a decision, process or system that should work better?',
    body: 'Tell us what is happening. We will start by understanding the problem before discussing technology.',
    button: 'Talk to us',
    rights: '© 2026 SC-Analytics. All rights reserved.',
  },
} as const

export default function Footer() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <Image src="/brand/logo-horizontal-transparent.png" alt="SC-Analytics" width={344} height={224} className="h-10 w-auto" />
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">{t.statement}</p>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-400">
              <Link href="/services" className="transition hover:text-white">{t.work}</Link>
              <Link href="/projects" className="transition hover:text-white">{t.cases}</Link>
              <Link href="/knowledge" className="transition hover:text-white">{t.knowledge}</Link>
              <Link href="/partner-analitico" className="transition hover:text-white">{t.partner}</Link>
              <Link href="/about" className="transition hover:text-white">{t.why}</Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
            <h2 className="max-w-xl text-2xl leading-tight md:text-3xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h2>
            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-xl text-sm leading-7 text-slate-400">{t.body}</p>
              <Link href="/contact" className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                {t.button}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{t.rights}</p>
          <a href="https://linkedin.com/in/arnausastre" target="_blank" rel="noreferrer" className="transition hover:text-slate-300">LinkedIn ↗</a>
        </div>
      </div>
    </footer>
  )
}
