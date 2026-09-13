'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { publicCopy } from '@/lib/public-copy'
import type { PublicGeneratedArticle } from '@/lib/public-growth'

function chooseVariant(items: PublicGeneratedArticle[], lang: string) {
  return items.find((item) => item.language === lang)
    || items.find((item) => item.language === 'es')
    || items.find((item) => item.language === 'en')
    || items[0]
}

export default function GeneratedKnowledgeSection({ articles }: { articles: PublicGeneratedArticle[] }) {
  const { lang } = useSiteLanguage()
  const t = publicCopy[lang].knowledge
  const groups = useMemo(() => {
    const map = new Map<string, PublicGeneratedArticle[]>()
    articles.forEach((article) => {
      const key = article.brief_id || article.content_id
      map.set(key, [...(map.get(key) || []), article])
    })
    return [...map.entries()]
  }, [articles])

  if (!groups.length) return null

  return (
    <section className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">{t.generatedLabel}</p>
        <h2 className="mt-4 text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.generatedTitle}</h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-400">{t.generatedIntro}</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {groups.slice(0, 12).map(([key, variants]) => {
            const item = chooseVariant(variants, lang)
            if (!item) return null
            const locale = lang === 'ca' ? 'ca-ES' : lang === 'es' ? 'es-ES' : 'en-GB'
            return (
              <Link key={key} href={`/knowledge/${key}`} className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 transition hover:border-slate-600">
                <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-slate-500">
                  {item.content_family && <span>{item.content_family}</span>}
                  {item.language && <span>· {item.language}</span>}
                  {item.published_at && <span>· {new Date(item.published_at).toLocaleDateString(locale)}</span>}
                </div>
                <h3 className="mt-4 text-xl font-semibold leading-7 text-white group-hover:text-indigo-200">{item.title}</h3>
                <p className="mt-5 text-sm font-medium text-indigo-300">{t.read} →</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
