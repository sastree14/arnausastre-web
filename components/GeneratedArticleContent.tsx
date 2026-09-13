'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import type { PublicGeneratedArticle } from '@/lib/public-growth'

type Props = { variants: PublicGeneratedArticle[] }

function selectVariant(variants: PublicGeneratedArticle[], lang: string) {
  return variants.find((item) => item.language === lang)
    || variants.find((item) => item.language === 'es')
    || variants.find((item) => item.language === 'en')
    || variants[0]
}

function renderBody(body: string) {
  const lines = body.split('\n')
  const nodes: React.ReactNode[] = []
  let bullets: string[] = []

  const flushBullets = () => {
    if (!bullets.length) return
    nodes.push(<ul key={`ul-${nodes.length}`} className="my-6 list-disc space-y-2 pl-6 text-slate-700">{bullets.map((item) => <li key={item}>{item}</li>)}</ul>)
    bullets = []
  }

  lines.forEach((raw, index) => {
    const line = raw.trim()
    if (line.startsWith('- ')) {
      bullets.push(line.slice(2))
      return
    }
    flushBullets()
    if (!line) return
    if (line.startsWith('### ')) nodes.push(<h3 key={index} className="mb-3 mt-8 text-xl font-semibold text-slate-950">{line.slice(4)}</h3>)
    else if (line.startsWith('## ')) nodes.push(<h2 key={index} className="mb-4 mt-10 text-2xl font-semibold text-slate-950">{line.slice(3)}</h2>)
    else if (line.startsWith('# ')) nodes.push(<h2 key={index} className="mb-4 mt-10 text-2xl font-semibold text-slate-950">{line.slice(2)}</h2>)
    else nodes.push(<p key={index} className="my-5 text-base leading-8 text-slate-700">{line}</p>)
  })
  flushBullets()
  return nodes
}

export default function GeneratedArticleContent({ variants }: Props) {
  const { lang } = useSiteLanguage()
  const article = selectVariant(variants, lang)
  if (!article) return null

  const hasVisual = Boolean(article.visual_path?.startsWith('supabase://'))

  return (
    <main className="bg-white text-slate-950">
      <article className="mx-auto max-w-4xl px-6 py-20 md:py-24">
        <Link href="/knowledge" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">← Knowledge</Link>
        <div className="mt-8 flex flex-wrap gap-2 text-xs text-slate-500">
          {article.content_family && <span className="rounded-full border border-slate-200 px-3 py-1">{article.content_family}</span>}
          {article.language && <span className="rounded-full border border-slate-200 px-3 py-1 uppercase">{article.language}</span>}
          <span className="rounded-full border border-slate-200 px-3 py-1">SC-Analytics</span>
        </div>
        <h1 className="mt-6 max-w-3xl text-4xl leading-tight md:text-5xl" style={{ fontFamily: 'var(--font-playfair)' }}>{article.title}</h1>
        {hasVisual && (
          <figure className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <img
              src={`/api/knowledge/visual?content_id=${encodeURIComponent(article.content_id)}`}
              alt={article.title}
              className="h-auto w-full object-cover"
            />
          </figure>
        )}
        <div className="mx-auto mt-10 max-w-3xl border-t border-slate-200 pt-8">{renderBody(article.body)}</div>
        <div className="mx-auto mt-12 max-w-3xl border-t border-slate-200 pt-6 text-sm text-slate-500">Published by SC-Analytics · understand before building.</div>
      </article>
    </main>
  )
}
