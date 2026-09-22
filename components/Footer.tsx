'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { publicCopy } from '@/lib/public-copy'

export default function Footer() {
  const { lang } = useSiteLanguage()
  const copy = publicCopy[lang]
  const nav = copy.nav
  const footer = copy.footer

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div>
          <Image src="/brand/logo-horizontal.png" alt="SC-Analytics" width={344} height={224} className="h-10 w-auto" />
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">{footer.statement}</p>
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{footer.note}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{footer.navigation}</p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-slate-600">
            <Link href="/">{nav.home}</Link>
            <Link href="/services">{nav.services}</Link>
            <Link href="/projects">{nav.projects}</Link>
            <Link href="/knowledge">{nav.knowledge}</Link>
            <Link href="/about">{nav.about}</Link>
            <Link href="/partner-analitico">{lang==='es'?'Partner analítico':lang==='ca'?'Partner analític':'Analytical partner'}</Link>
            <Link href="/briefing">SC-Analytics Briefing</Link>
            <Link href="/contact">{nav.contact}</Link>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{footer.capabilities}</p>
          <div className="mt-4 space-y-2.5 text-sm text-slate-600">
            <p>Forecasting</p>
            <p>Optimisation</p>
            <p>Machine Learning</p>
            <p>AI & Automation</p>
            <p>Analytics & BI</p>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>{footer.rights}</p>
          <a href="https://linkedin.com/in/arnausastre" target="_blank" rel="noreferrer" className="hover:text-slate-700">LinkedIn ↗</a>
        </div>
      </div>
    </footer>
  )
}
