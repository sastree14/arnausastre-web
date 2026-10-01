'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
    articles: 'Análisis y artículos',
    articlesBody: 'Ideas, research y criterio aplicado a decisiones reales.',
    briefing: 'Briefing',
    briefingBody: 'Una selección breve de lo que merece atención.',
    partner: 'Partner Data & AI',
    why: 'Por qué SC-Analytics',
    contact: 'Hablar con nosotros',
  },
  ca: {
    home: 'Inici',
    work: 'Com treballem',
    cases: 'Casos',
    knowledge: 'Coneixement',
    articles: 'Anàlisi i articles',
    articlesBody: 'Idees, recerca i criteri aplicat a decisions reals.',
    briefing: 'Briefing',
    briefingBody: 'Una selecció breu del que mereix atenció.',
    partner: 'Partner Data & AI',
    why: 'Per què SC-Analytics',
    contact: 'Parlar amb nosaltres',
  },
  en: {
    home: 'Home',
    work: 'How we work',
    cases: 'Case studies',
    knowledge: 'Knowledge',
    articles: 'Analysis & articles',
    articlesBody: 'Research, ideas and judgment applied to real business decisions.',
    briefing: 'Briefing',
    briefingBody: 'A concise selection of what is actually worth following.',
    partner: 'Data & AI Partner',
    why: 'Why SC-Analytics',
    contact: 'Talk to us',
  },
} as const

function DesktopDropdown({
  label,
  active,
  children,
}: {
  label: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className={`flex items-center gap-1.5 px-2.5 py-2 text-[13px] font-medium transition ${
          active ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950'
        }`}
      >
        {label}
        <span className="text-[9px] text-slate-400 transition group-hover:rotate-180">⌄</span>
      </button>
      <div className="invisible absolute left-0 top-full z-50 w-[340px] pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="border border-slate-200 bg-white p-2 shadow-xl shadow-slate-950/10">
          {children}
        </div>
      </div>
    </div>
  )
}

function DropdownLink({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="block px-4 py-3 transition hover:bg-[#FAFAF7]">
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{body}</p>
    </Link>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { lang, setLang } = useSiteLanguage()
  const { setLang: setLegacyLang } = useLanguage()
  const t = COPY[lang]

  const chooseLanguage = (next: SiteLanguage) => {
    setLang(next)
    setLegacyLang(next === 'ca' ? 'es' : next)
    const localizedArticle = pathname.match(/^\/knowledge\/([^/]+)\/(en|es|ca)$/)
    if (localizedArticle) router.replace('/knowledge/' + localizedArticle[1] + '/' + next)
  }

  const active = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)
  const knowledgeActive = pathname.startsWith('/knowledge') || pathname.startsWith('/briefing')

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label="SC-Analytics home">
          <Image src="/brand/logo-horizontal.png" alt="SC-Analytics" width={344} height={224} className="h-9 w-auto" priority />
        </Link>

        <nav className="hidden items-center xl:flex">
          <Link href="/" className={`px-2.5 py-2 text-[13px] font-medium transition ${active('/') ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950'}`}>{t.home}</Link>
          <Link href="/services" className={`px-2.5 py-2 text-[13px] font-medium transition ${active('/services') ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950'}`}>{t.work}</Link>
          <Link href="/projects" className={`px-2.5 py-2 text-[13px] font-medium transition ${active('/projects') || active('/case-studies') ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950'}`}>{t.cases}</Link>

          <DesktopDropdown label={t.knowledge} active={knowledgeActive}>
            <DropdownLink href="/knowledge" title={t.articles} body={t.articlesBody} />
            <DropdownLink href="/briefing" title={t.briefing} body={t.briefingBody} />
          </DesktopDropdown>

          <Link href="/partner-analitico" className={`px-2.5 py-2 text-[13px] font-medium transition ${active('/partner-analitico') ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950'}`}>{t.partner}</Link>
          <Link href="/about" className={`px-2.5 py-2 text-[13px] font-medium transition ${active('/about') ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950'}`}>{t.why}</Link>
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
          <nav className="grid gap-1">
            {[
              ['/', t.home],
              ['/services', t.work],
              ['/projects', t.cases],
              ['/knowledge', t.knowledge],
              ['/partner-analitico', t.partner],
              ['/about', t.why],
            ].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="border-b border-slate-100 px-2 py-3 text-sm font-medium text-slate-800 last:border-b-0">
                {label}
              </Link>
            ))}
            <Link href="/briefing" onClick={() => setOpen(false)} className="px-2 py-3 text-sm text-slate-500">{t.briefing}</Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="mt-2 bg-slate-950 px-3 py-3 text-center text-sm font-semibold text-white">{t.contact}</Link>
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
