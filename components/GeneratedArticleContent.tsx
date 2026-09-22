'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import type { PublicGeneratedArticle } from '@/lib/public-growth'

type Props = { variants: PublicGeneratedArticle[]; forcedLanguage?: 'es'|'ca'|'en' }

function selectVariant(variants: PublicGeneratedArticle[], lang: string) {
  return variants.find((item) => item.language === lang)
    || variants.find((item) => item.language === 'es')
    || variants.find((item) => item.language === 'en')
    || variants[0]
}

function cleanInline(value: string) {
  return String(value || '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[\*#_`]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function renderBody(body: string) {
  const lines = body.split('\n')
  const nodes: React.ReactNode[] = []
  let bullets: string[] = []

  const flushBullets = () => {
    if (!bullets.length) return
    nodes.push(<ul key={`ul-${nodes.length}`} className="my-6 list-disc space-y-2 pl-6 text-slate-700">{bullets.map((item, index) => <li key={`${item}-${index}`} className="leading-7">{cleanInline(item)}</li>)}</ul>)
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
    if (line.startsWith('### ')) nodes.push(<h3 key={index} className="mb-3 mt-9 text-xl font-semibold leading-snug text-slate-950">{cleanInline(line.slice(4))}</h3>)
    else if (line.startsWith('## ')) nodes.push(<h2 key={index} className="mb-4 mt-11 text-2xl font-semibold leading-snug text-slate-950">{cleanInline(line.slice(3))}</h2>)
    else if (line.startsWith('# ')) nodes.push(<h2 key={index} className="mb-4 mt-11 text-2xl font-semibold leading-snug text-slate-950">{cleanInline(line.slice(2))}</h2>)
    else nodes.push(<p key={index} className="my-5 text-base leading-8 text-slate-700">{cleanInline(line)}</p>)
  })
  flushBullets()
  return nodes
}

const CTA_COPY = {
  es: {
    eyebrow: '¿Te ocurre algo parecido?',
    text: 'Si este problema también existe en tu empresa, podemos revisar el proceso, los datos disponibles y el impacto potencial antes de hablar de una solución.',
    primary: 'Cuéntanos el problema',
    secondary: 'Ver cómo trabajamos',
  },
  ca: {
    eyebrow: 'Et passa una cosa semblant?',
    text: 'Si aquest problema també existeix a la teva empresa, podem revisar el procés, les dades disponibles i l’impacte potencial abans de parlar d’una solució.',
    primary: 'Explica’ns el problema',
    secondary: 'Veure com treballem',
  },
  en: {
    eyebrow: 'Facing something similar?',
    text: 'If this problem also exists in your business, we can review the process, available data and potential impact before discussing a solution.',
    primary: 'Tell us about the problem',
    secondary: 'See how we work',
  },
} as const

export default function GeneratedArticleContent({ variants, forcedLanguage }: Props) {
  const { lang } = useSiteLanguage()
  const activeLanguage = forcedLanguage || lang
  const article = selectVariant(variants, activeLanguage)
  if (!article) return null

  const hasVisual = Boolean(article.visual_path?.startsWith('supabase://'))
  const cta = CTA_COPY[(article.language as keyof typeof CTA_COPY) || 'es'] || CTA_COPY.es

  return (
    <main className="bg-white text-slate-950">
      <article className="mx-auto max-w-4xl px-6 py-20 md:px-8 md:py-24">
        <Link href="/knowledge" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">← {activeLanguage==='es'?'Conocimiento':activeLanguage==='ca'?'Coneixement':'Knowledge'}</Link>
        <div className="mt-8 flex flex-wrap gap-2 text-xs text-slate-500">
          {article.content_family && <span className="rounded-full border border-slate-200 px-3 py-1">{article.content_family}</span>}
          {article.language && <span className="rounded-full border border-slate-200 px-3 py-1 uppercase">{article.language}</span>}
          <span className="rounded-full border border-slate-200 px-3 py-1">SC-Analytics</span>
        </div>
        <h1 className="mt-6 max-w-3xl text-4xl leading-tight md:text-5xl" style={{ fontFamily: 'var(--font-playfair)' }}>{cleanInline(article.title)}</h1>
        {hasVisual && (
          <figure className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <img
              src={`/api/knowledge/visual?content_id=${encodeURIComponent(article.content_id)}`}
              alt={cleanInline(article.title)}
              className="h-auto w-full object-cover"
            />
          </figure>
        )}
        <div className="mx-auto mt-10 max-w-3xl border-t border-slate-200 pt-8">{renderBody(article.body)}</div>

        <section className="mx-auto mt-14 max-w-3xl rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">{cta.eyebrow}</p>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">{cta.text}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/contact" className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">{cta.primary}</Link>
            <Link href="/services" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400">{cta.secondary}</Link>
          </div>
        </section>

        <div className="mx-auto mt-12 max-w-3xl border-t border-slate-200 pt-6 text-sm text-slate-500">Published by SC-Analytics · understand before building.</div>
      </article>
    </main>
  )
}
