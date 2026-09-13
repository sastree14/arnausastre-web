'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { SiteLanguage } from '@/lib/public-copy'

interface SiteLanguageContextType {
  lang: SiteLanguage
  setLang: (lang: SiteLanguage) => void
}

const SiteLanguageContext = createContext<SiteLanguageContextType>({
  lang: 'en',
  setLang: () => {},
})

export function SiteLanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<SiteLanguage>('en')

  useEffect(() => {
    const stored = localStorage.getItem('sc_site_lang') as SiteLanguage | null
    if (stored === 'en' || stored === 'es' || stored === 'ca') {
      setLangState(stored)
      return
    }
    const browser = navigator.language.toLowerCase()
    if (browser.startsWith('ca')) setLangState('ca')
    else if (browser.startsWith('es')) setLangState('es')
  }, [])

  const setLang = (newLang: SiteLanguage) => {
    setLangState(newLang)
    localStorage.setItem('sc_site_lang', newLang)
    // Legacy pages still support EN/ES only. Catalan intentionally falls back to Spanish there
    // until those content collections are migrated to full trilingual variants.
    localStorage.setItem('lang', newLang === 'ca' ? 'es' : newLang)
  }

  return <SiteLanguageContext.Provider value={{ lang, setLang }}>{children}</SiteLanguageContext.Provider>
}

export function useSiteLanguage() {
  return useContext(SiteLanguageContext)
}
