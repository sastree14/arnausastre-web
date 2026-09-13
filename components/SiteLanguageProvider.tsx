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
      // Hydrate the persisted preference after mount; browser storage is unavailable during SSR.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState(stored)
      return
    }
    const browser = navigator.language.toLowerCase()
    if (browser.startsWith('ca')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState('ca')
    } else if (browser.startsWith('es')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState('es')
    }
  }, [])

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
