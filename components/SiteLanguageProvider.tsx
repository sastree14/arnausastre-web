'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { explicitLanguageForPath } from '@/lib/seo-service-locales'
import type { SiteLanguage } from '@/lib/public-copy'

interface SiteLanguageContextType {
  lang: SiteLanguage
  setLang: (lang: SiteLanguage) => void
}

const SiteLanguageContext = createContext<SiteLanguageContextType>({
  lang: 'en',
  setLang: () => {},
})

export function SiteLanguageProvider({ children, initialLang = 'en' }: { children: ReactNode; initialLang?: SiteLanguage }) {
  const pathname=usePathname()
  const [lang, setLangState] = useState<SiteLanguage>(initialLang)

  useEffect(() => {
    // An explicitly localized URL has priority over language preferences,
    // including after internal Next.js client-side navigation.
    const forced=explicitLanguageForPath(pathname)
    const timeout=window.setTimeout(() => {
      if(forced){setLangState(forced);return}
      const stored=localStorage.getItem('sc_site_lang') as SiteLanguage | null
      if(stored==='en'||stored==='es'||stored==='ca'){
        setLangState(stored)
        return
      }
      const browser=navigator.language.toLowerCase()
      if(browser.startsWith('ca'))setLangState('ca')
      else if(browser.startsWith('es'))setLangState('es')
      else setLangState('en')
    },0)
    return () => window.clearTimeout(timeout)
  }, [pathname])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (newLang: SiteLanguage) => {
    setLangState(newLang)
    localStorage.setItem('sc_site_lang', newLang)
    // Legacy project/article collections are still EN/ES; Catalan falls back to Spanish there
    // until those individual historical records are migrated.
    localStorage.setItem('lang', newLang === 'ca' ? 'es' : newLang)
  }

  return <SiteLanguageContext.Provider value={{ lang, setLang }}>{children}</SiteLanguageContext.Provider>
}

export function useSiteLanguage() {
  return useContext(SiteLanguageContext)
}
