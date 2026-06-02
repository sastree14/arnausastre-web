'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from './LanguageProvider'
import { translations } from '@/lib/translations'

export default function Footer() {
  const { lang } = useLanguage()
  const t = translations[lang]

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/services', label: t.nav.services },
    { href: '/case-studies', label: t.nav.caseStudies },
    { href: '/insights', label: t.nav.insights },
    { href: '/about', label: t.nav.about },
    { href: '/contact', label: t.nav.contact },
  ]

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <Image
            src="/brand/logo-circular.png"
            alt="Arnau Sastre Analytics"
            width={316}
            height={260}
            className="h-14 w-auto"
          />
          <p className="mt-4 max-w-sm leading-7 text-slate-500 text-sm">
            {t.footer.tagline}
          </p>
          <div className="mt-6">
            <a
              href="https://linkedin.com/in/arnausastre"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
            {t.footer.navTitle}
          </p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-slate-600">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="transition hover:text-slate-900">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
            {t.footer.focusTitle}
          </p>
          <div className="mt-4 space-y-2.5 text-sm text-slate-600">
            <p>{t.footer.focus1}</p>
            <p>{t.footer.focus2}</p>
            <p>{t.footer.focus3}</p>
            <p>{t.footer.focus4}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>{t.footer.copyright}</p>
          <p>{t.footer.builtWith}</p>
        </div>
      </div>
    </footer>
  )
}
