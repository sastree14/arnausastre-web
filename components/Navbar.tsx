'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useLanguage } from '@/components/LanguageProvider'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { publicCopy, type SiteLanguage } from '@/lib/public-copy'

const links = [
  ['/', 'home'],
  ['/services', 'services'],
  ['/projects', 'projects'],
  ['/knowledge', 'knowledge'],
  ['/about', 'about'],
] as const

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { lang, setLang } = useSiteLanguage()
  const { setLang: setLegacyLang } = useLanguage()
  const t = publicCopy[lang].nav

  const chooseLanguage = (next: SiteLanguage) => {
    setLang(next)
    setLegacyLang(next === 'ca' ? 'es' : next)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-6">
        <Link href="/" className="flex items-center" aria-label="SC-Analytics home">
          <Image src="/brand/logo-horizontal.png" alt="SC-Analytics" width={344} height={224} className="h-9 w-auto" priority />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(([href, key]) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link key={href} href={href} className={`rounded-md px-3 py-2 text-sm transition ${active ? 'bg-slate-100 text-slate-950' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}>
                {t[key]}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
            {(['en', 'es', 'ca'] as SiteLanguage[]).map((code) => (
              <button key={code} type="button" onClick={() => chooseLanguage(code)} className={`rounded-md px-2.5 py-1.5 uppercase transition ${lang === code ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                {code}
              </button>
            ))}
          </div>
          <Link href="/contact" className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
            {t.contact}
          </Link>
        </div>

        <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden" aria-label="Toggle navigation">
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1.5 block h-0.5 w-5 bg-current" />
          <span className="mt-1.5 block h-0.5 w-5 bg-current" />
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-5 py-5 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map(([href, key]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm text-slate-700 hover:bg-slate-50">{t[key]}</Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)} className="mt-2 rounded-lg bg-slate-950 px-3 py-3 text-center text-sm font-medium text-white">{t.contact}</Link>
          </nav>
          <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
            {(['en', 'es', 'ca'] as SiteLanguage[]).map((code) => (
              <button key={code} type="button" onClick={() => chooseLanguage(code)} className={`rounded-md px-3 py-2 text-xs font-medium uppercase ${lang === code ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'}`}>{code}</button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
