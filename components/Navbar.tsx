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
    work: 'Cómo trabajamos',
    workMain: 'Capacidades y proceso',
    workMainBody: 'Qué resolvemos y cómo convertimos un problema en un sistema útil.',
    partner: 'Partner Data & AI',
    partnerBody: 'Capacidad tecnológica y analítica externa, sin construir todo el equipo dentro.',
    cases: 'Casos',
    knowledge: 'Conocimiento',
    articles: 'Análisis y artículos',
    articlesBody: 'Ideas, research y criterio aplicado a decisiones reales.',
    briefing: 'Briefing',
    briefingBody: 'Una selección breve para seguir lo que merece atención.',
    why: 'Por qué SC-Analytics',
    contact: 'Hablar con nosotros',
  },
  ca: {
    work: 'Com treballem',
    workMain: 'Capacitats i procés',
    workMainBody: 'Què resolem i com convertim un problema en un sistema útil.',
    partner: 'Partner Data & AI',
    partnerBody: 'Capacitat tecnològica i analítica externa, sense construir tot l’equip internament.',
    cases: 'Casos',
    knowledge: 'Coneixement',
    articles: 'Anàlisi i articles',
    articlesBody: 'Idees, recerca i criteri aplicat a decisions reals.',
    briefing: 'Briefing',
    briefingBody: 'Una selecció breu per seguir allò que mereix atenció.',
    why: 'Per què SC-Analytics',
    contact: 'Parlar amb nosaltres',
  },
  en: {
    work: 'How we work',
    workMain: 'Capabilities & process',
    workMainBody: 'What we solve and how a business problem becomes a useful system.',
    partner: 'Data & AI Partner',
    partnerBody: 'External analytical and technology capability without building the full team in-house.',
    cases: 'Case studies',
    knowledge: 'Knowledge',
    articles: 'Analysis & articles',
    articlesBody: 'Research, ideas and judgment applied to real business decisions.',
    briefing: 'Briefing',
    briefingBody: 'A concise selection of what is actually worth following.',
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
        className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition ${
          active ? 'bg-slate-100 text-slate-950' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
        }`}
      >
        {label}
        <span className="text-[10px] text-slate-400 transition group-hover:rotate-180">⌄</span>
      </button>
      <div className="invisible absolute left-0 top-full z-50 w-[360px] pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-950/10">
          {children}
        </div>
      </div>
    </div>
  )
}

function DropdownLink({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="block rounded-lg px-4 py-3 transition hover:bg-slate-50">
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

  const workActive = pathname.startsWith('/services') || pathname.startsWith('/partner-analitico')
  const knowledgeActive = pathname.startsWith('/knowledge') || pathname.startsWith('/briefing')
  const casesActive = pathname.startsWith('/projects') || pathname.startsWith('/case-studies')
  const whyActive = pathname.startsWith('/about')

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-6">
        <Link href="/" className="flex items-center" aria-label="SC-Analytics home">
          <Image src="/brand/logo-horizontal.png" alt="SC-Analytics" width={344} height={224} className="h-9 w-auto" priority />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <DesktopDropdown label={t.work} active={workActive}>
            <DropdownLink href="/services" title={t.workMain} body={t.workMainBody} />
            <DropdownLink href="/partner-analitico" title={t.partner} body={t.partnerBody} />
          </DesktopDropdown>

          <Link
            href="/projects"
            className={`rounded-md px-3 py-2 text-sm transition ${
              casesActive ? 'bg-slate-100 text-slate-950' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
          >
            {t.cases}
          </Link>

          <DesktopDropdown label={t.knowledge} active={knowledgeActive}>
            <DropdownLink href="/knowledge" title={t.articles} body={t.articlesBody} />
            <DropdownLink href="/briefing" title={t.briefing} body={t.briefingBody} />
          </DesktopDropdown>

          <Link
            href="/about"
            className={`rounded-md px-3 py-2 text-sm transition ${
              whyActive ? 'bg-slate-100 text-slate-950' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
          >
            {t.why}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
            {(['en', 'es', 'ca'] as SiteLanguage[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => chooseLanguage(code)}
                className={`rounded-md px-2.5 py-1.5 uppercase transition ${
                  lang === code ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
          <Link href="/contact" className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
            {t.contact}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
          aria-label="Toggle navigation"
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1.5 block h-0.5 w-5 bg-current" />
          <span className="mt-1.5 block h-0.5 w-5 bg-current" />
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-5 py-5 lg:hidden">
          <nav className="space-y-5">
            <div>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{t.work}</p>
              <div className="mt-2 space-y-1">
                <Link href="/services" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">{t.workMain}</Link>
                <Link href="/partner-analitico" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">{t.partner}</Link>
              </div>
            </div>

            <Link href="/projects" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50">{t.cases}</Link>

            <div>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{t.knowledge}</p>
              <div className="mt-2 space-y-1">
                <Link href="/knowledge" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">{t.articles}</Link>
                <Link href="/briefing" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">{t.briefing}</Link>
              </div>
            </div>

            <Link href="/about" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50">{t.why}</Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="block rounded-lg bg-slate-950 px-3 py-3 text-center text-sm font-medium text-white">{t.contact}</Link>
          </nav>

          <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
            {(['en', 'es', 'ca'] as SiteLanguage[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => chooseLanguage(code)}
                className={`rounded-md px-3 py-2 text-xs font-medium uppercase ${
                  lang === code ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'
                }`}
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
