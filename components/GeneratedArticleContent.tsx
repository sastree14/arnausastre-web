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
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="my-6 space-y-3 border-l border-slate-300 pl-5 text-slate-700">
        {bullets.map((item, index) => <li key={`${item}-${index}`} className="text-[17px] leading-8">{cleanInline(item)}</li>)}
      </ul>,
    )
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
    if (line.startsWith('### ')) nodes.push(<h3 key={index} className="mb-3 mt-9 text-[23px] font-semibold leading-snug text-slate-950">{cleanInline(line.slice(4))}</h3>)
    else if (line.startsWith('## ')) nodes.push(<h2 key={index} className="mb-4 mt-11 text-[29px] leading-snug text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{cleanInline(line.slice(3))}</h2>)
    else if (line.startsWith('# ')) nodes.push(<h2 key={index} className="mb-4 mt-11 text-[29px] leading-snug text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{cleanInline(line.slice(2))}</h2>)
    else nodes.push(<p key={index} className="my-5 text-[17px] leading-8 text-slate-700">{cleanInline(line)}</p>)
  })
  flushBullets()
  return nodes
}

const COPY = {
  es: {
    back: 'Conocimiento',
    editorial: 'Editorial SC-Analytics',
    explore: 'Sigue explorando',
    cases: 'Casos',
    work: 'Cómo trabajamos',
    contact: 'Contacta con nosotros',
    ctaEyebrow: '¿TE OCURRE ALGO PARECIDO?',
    ctaText: 'Si te ocurre algo parecido, cuéntanos el contexto y vemos si podemos ayudarte.',
    primary: 'Cuéntanos el problema',
  },
  ca: {
    back: 'Coneixement',
    editorial: 'Editorial SC-Analytics',
    explore: 'Continua explorant',
    cases: 'Casos',
    work: 'Com treballem',
    contact: 'Contacta amb nosaltres',
    ctaEyebrow: 'ET PASSA UNA COSA SEMBLANT?',
    ctaText: 'Si et passa alguna cosa semblant, explica’ns el context i veiem si et podem ajudar.',
    primary: 'Explica’ns el problema',
  },
  en: {
    back: 'Knowledge',
    editorial: 'SC-Analytics editorial',
    explore: 'Keep exploring',
    cases: 'Case studies',
    work: 'How we work',
    contact: 'Contact us',
    ctaEyebrow: 'FACING SOMETHING SIMILAR?',
    ctaText: 'If you are facing something similar, tell us the context and we will see whether we can help.',
    primary: 'Tell us about the problem',
  },
} as const

export default function GeneratedArticleContent({ variants, forcedLanguage }: Props) {
  const { lang } = useSiteLanguage()
  const activeLanguage = forcedLanguage || lang
  const article = selectVariant(variants, activeLanguage)
  if (!article) return null

  const t = COPY[activeLanguage]
  const hasVisual = Boolean(article.visual_path?.startsWith('supabase://'))

  return (
    <main className="bg-[#FAFAF7] text-slate-950">
      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-10 md:pb-14 md:pt-12">
          <Link href="/knowledge" className="text-[15px] font-medium text-slate-500 transition hover:text-slate-950">← {t.back}</Link>

          <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-b border-slate-200 pb-4 font-mono text-[10px] uppercase tracking-[0.1em] text-slate-400">
            {article.content_family && <span>{article.content_family}</span>}
            {article.industry && <span>· {article.industry}</span>}
            {article.language && <span>· {article.language}</span>}
            <span>· {t.editorial}</span>
          </div>

          <h1 className="mt-6 max-w-4xl text-[42px] leading-[1.04] tracking-[-0.025em] sm:text-[54px]" style={{ fontFamily: 'var(--font-playfair)' }}>
            {cleanInline(article.title)}
          </h1>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        {hasVisual && (
          <figure className="border border-slate-300 bg-white">
            <img
              src={`/api/knowledge/visual?content_id=${encodeURIComponent(article.content_id)}`}
              alt={cleanInline(article.title)}
              className="h-auto w-full object-cover"
            />
          </figure>
        )}

        <div className={`mx-auto max-w-3xl ${hasVisual ? 'mt-10' : ''} border-t border-slate-300 pt-7`}>
          {renderBody(article.body)}
        </div>

        <section className="mx-auto mt-12 max-w-3xl border-y border-slate-300 bg-[#F4F1EA] px-6 py-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.ctaEyebrow}</p>
          <p className="mt-3 max-w-2xl text-[17px] leading-8 text-slate-700">{t.ctaText}</p>
          <Link href="/contact?intent=problem" className="mt-5 inline-flex bg-slate-950 px-4 py-2.5 text-[15px] font-semibold text-white transition hover:bg-slate-800">
            {t.primary} →
          </Link>
        </section>
      </article>

      <section className="border-y border-slate-300 bg-white">
        <div className="mx-auto grid max-w-6xl gap-7 px-6 py-10 lg:grid-cols-[190px_1fr] lg:gap-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.explore}</p>
          <div className="grid border-t border-slate-300 md:grid-cols-3 md:divide-x md:divide-slate-300">
            {[[t.cases,'/projects'],[t.work,'/services'],[t.contact,'/contact?intent=discovery']].map(([label, href]) => (
              <Link key={href} href={href} className="group flex items-center justify-between border-b border-slate-300 py-4 text-[15px] font-semibold text-slate-900 md:px-5 md:first:pl-0">
                {label}<span className="text-indigo-700 transition group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
