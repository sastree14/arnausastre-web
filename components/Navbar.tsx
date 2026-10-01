'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useLanguage } from '@/components/LanguageProvider'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import type { SiteLanguage } from '@/lib/public-copy'

const COPY = {
  es: {
    home: 'Inicio',
    work: 'Cómo trabajamos',
    cases: 'Casos',
    knowledge: 'Conocimiento',
    partner: 'Partner Data & AI',
    why: 'Por qué SC-Analytics',
    contact: 'Hablar con nosotros',
  },
  ca: {
    home: 'Inici',
    work: 'Com treballem',
    cases: 'Casos',
    knowledge: 'Coneixement',
    partner: 'Partner Data & AI',
    why: 'Per què SC-Analytics',
    contact: 'Parlar amb nosaltres',
  },
  en: {
    home: 'Home',
    work: 'How we work',
    cases: 'Case studies',
    knowledge: 'Knowledge',
    partner: 'Data & AI Partner',
    why: 'Why SC-Analytics',
    contact: 'Talk to us',
  },
} as const

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { lang, setLang } = useSiteLanguage()
  const { setLang: setLegacyLang } = useLanguage()
  const t = COPY[lang]

  const chooseLanguage = (next: SiteLanguage) => {
    setLang(next)
    setLegacyLang(next === 'ca' ? 'es' : next)
  }

  const active = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  const nav = [
    ['/', t.home],
    ['/services', t.work],
    ['/projects', t.cases],
    ['/knowledge', t.knowledge],
    ['/partner-analitico', t.partner],
    ['/about', t.why],
  ] as const

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label="SC-Analytics home">
          <Image src="/brand/logo-horizontal.png" alt="SC-Analytics" width={344} height={224} className="h-9 w-auto" priority />
        </Link>

        <nav className="hidden items-center xl:flex">
          {nav.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`relative px-2.5 py-2 text-[13px] font-medium transition ${
                active(href) ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {label}
              {active(href) && <span className="absolute inset-x-2.5 -bottom-[13px] h-px bg-slate-950" />}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 xl:flex">
          <div className="flex border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-medium">
            {(['en', 'es', 'ca'] as SiteLanguage[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => chooseLanguage(code)}
                className={`px-2 py-1.5 uppercase transition ${
                  lang === code ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
          <Link href="/contact" className="bg-slate-950 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-slate-800">
            {t.contact}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="border border-slate-200 p-2 text-slate-700 xl:hidden"
          aria-label="Toggle navigation"
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1.5 block h-0.5 w-5 bg-current" />
          <span className="mt-1.5 block h-0.5 w-5 bg-current" />
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-5 py-4 xl:hidden">
          <nav className="grid">
            {nav.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-slate-100 px-2 py-3 text-sm font-medium text-slate-800"
              >
                {label}<span className="text-slate-300">→</span>
              </Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)} className="mt-3 bg-slate-950 px-3 py-3 text-center text-sm font-semibold text-white">
              {t.contact}
            </Link>
          </nav>

          <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
            {(['en', 'es', 'ca'] as SiteLanguage[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => chooseLanguage(code)}
                className={`px-3 py-2 text-xs font-medium uppercase ${lang === code ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
