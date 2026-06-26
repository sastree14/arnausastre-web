'use client'

import { useLanguage } from './LanguageProvider'
import { translations } from '@/lib/translations'

export default function KnowledgeHero() {
  const { lang } = useLanguage()
  const t = translations[lang].insights

  return (
    <section className="bg-white border-b border-slate-200">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.heroLabel}</p>
        <h1
          className="mt-4 text-5xl leading-tight md:text-6xl text-slate-900"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {t.heroTitle}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">{t.heroSub}</p>
      </div>
    </section>
  )
}
