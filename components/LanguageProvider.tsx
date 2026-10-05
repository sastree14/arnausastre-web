'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Language } from '@/lib/translations'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
})

export function LanguageProvider({ children, initialLanguage = 'es' }: { children: ReactNode; initialLanguage?: Language }) {
  const [lang, setLangState] = useState<Language>(initialLanguage)

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('lang', newLang)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
