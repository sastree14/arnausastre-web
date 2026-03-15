'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import { translations } from '@/lib/translations'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { lang, setLang } = useLanguage()
  const pathname = usePathname()
  const t = translations[lang].nav

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navLinks = [
    { href: '/', label: t.home },
    { href: '/services', label: t.services },
    { href: '/about', label: t.about },
    { href: '/insights', label: t.insights },
    { href: '/case-studies', label: t.caseStudies },
    { href: '/tools', label: t.tools },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled || menuOpen
            ? 'navbar-solid'
            : 'border-b border-transparent bg-white/80 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-slate-900 transition hover:opacity-75"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Arnau Sastre
            <span className="ml-1 text-indigo-600">Analytics</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  isActive(href)
                    ? 'bg-slate-100 text-slate-900 font-medium'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side: language + contact */}
          <div className="hidden items-center gap-3 lg:flex">
            {/* Language switcher */}
            <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
              <button
                onClick={() => setLang('en')}
                className={`rounded px-2 py-1 transition ${
                  lang === 'en'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('es')}
                className={`rounded px-2 py-1 transition ${
                  lang === 'es'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                ES
              </button>
            </div>

            <Link
              href="/contact"
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                isActive('/contact')
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-900 text-white hover:bg-slate-700'
              }`}
            >
              {t.contact}
            </Link>
          </div>

          {/* Mobile: language + burger */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
              <button
                onClick={() => setLang('en')}
                className={`rounded px-2 py-1 transition ${
                  lang === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('es')}
                className={`rounded px-2 py-1 transition ${
                  lang === 'es' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                ES
              </button>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                {menuOpen ? (
                  <>
                    <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <line x1="2" y1="4" x2="16" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="2" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 top-[57px] z-40 bg-white transition-all duration-300 lg:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col gap-1 px-6 pt-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-4 py-3 text-base transition-colors ${
                isActive(href)
                  ? 'bg-slate-100 text-slate-900 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="mt-4 rounded-lg bg-slate-900 px-4 py-3 text-center text-base font-medium text-white"
          >
            {t.contact}
          </Link>
        </nav>
      </div>
    </>
  )
}
