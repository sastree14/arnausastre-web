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

type GeneratedBodyBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }

type GeneratedBodySection = {
  heading?: string
  level?: 2 | 3
  blocks: GeneratedBodyBlock[]
}

function parseGeneratedBody(body: string): GeneratedBodySection[] {
  const sections: GeneratedBodySection[] = []
  let current: GeneratedBodySection = { blocks: [] }
  let bullets: string[] = []

  const flushBullets = () => {
    if (!bullets.length) return
    current.blocks.push({ type: 'list', items: bullets })
    bullets = []
  }

  const flushSection = () => {
    flushBullets()
    if (current.heading || current.blocks.length) sections.push(current)
  }

  for (const raw of body.split('\n')) {
    const line = raw.trim()

    if (line.startsWith('- ')) {
      bullets.push(line.slice(2))
      continue
    }

    flushBullets()
    if (!line) continue

    let heading: string | null = null
    let level: 2 | 3 = 2

    if (/^\*\*[^*]+\*\*$/.test(line)) heading = cleanInline(line)
    else if (line.startsWith('### ')) {
      heading = cleanInline(line.slice(4))
      level = 3
    } else if (line.startsWith('## ')) heading = cleanInline(line.slice(3))
    else if (line.startsWith('# ')) heading = cleanInline(line.slice(2))

    if (heading) {
      flushSection()
      current = { heading, level, blocks: [] }
      continue
    }

    current.blocks.push({ type: 'paragraph', text: line })
  }

  flushSection()
  return sections
}

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={index} className="font-semibold text-slate-950">{cleanInline(part)}</strong>
      : part.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1'),
  )
}

function renderGeneratedBlock(block: GeneratedBodyBlock, key: string, lead = false) {
  if (block.type === 'list') {
    return (
      <ul key={key} className="my-7 space-y-3 border-l-2 border-indigo-200 pl-5 text-slate-700">
        {block.items.map((item, index) => (
          <li key={`${key}-${index}`} className="text-[17px] leading-8">{cleanInline(item)}</li>
        ))}
      </ul>
    )
  }

  return (
    <p
      key={key}
      className={lead ? 'my-5 text-[20px] leading-9 text-[#1D2B44]' : 'my-5 text-[17px] leading-8 text-slate-700'}
    >
      {renderInline(block.text)}
    </p>
  )
}

function renderBody(body: string) {
  const sections = parseGeneratedBody(body)
  let leadUsed = false

  return sections.map((section, sectionIndex) => {
    if (!section.heading) {
      return (
        <div key={`intro-${sectionIndex}`}>
          {section.blocks.map((block, blockIndex) => {
            const lead = !leadUsed && block.type === 'paragraph'
            if (lead) leadUsed = true
            return renderGeneratedBlock(block, `intro-${sectionIndex}-${blockIndex}`, lead)
          })}
        </div>
      )
    }

    // Only explicitly supplementary sections can be collapsed. Core prose stays visible.
    const supplementary = /^(ejemplo(?:\s|:|$)|exemple(?:\s|:|$)|example(?:\s|:|$)|nota técnica|nota tècnica|technical note|apéndice|apèndix|appendix)/i.test(section.heading)
    const firstBlock = supplementary ? section.blocks[0] : undefined
    const remaining = supplementary ? section.blocks.slice(1) : section.blocks
    const HeadingTag = section.level === 3 ? 'h3' : 'h2'
    const headingClass =
      section.level === 3
        ? 'mb-3 mt-10 text-[23px] font-semibold leading-snug text-slate-950'
        : 'mb-4 mt-12 max-w-[26ch] text-[30px] leading-[1.08] text-slate-950 sm:text-[34px]'

    return (
      <section key={`section-${sectionIndex}`}>
        <HeadingTag
          className={headingClass}
          style={section.level === 3 ? undefined : { fontFamily: 'var(--font-playfair)' }}
        >
          {section.heading}
        </HeadingTag>

        {firstBlock ? renderGeneratedBlock(firstBlock, `section-${sectionIndex}-0`) : null}

        {supplementary && remaining.length ? (
          <details className="group my-6 border border-indigo-200 bg-white open:border-indigo-400">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 bg-indigo-50 px-5 py-4 text-[15px] font-semibold text-indigo-900 transition hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-700 [&::-webkit-details-marker]:hidden">
              <span>{section.heading}</span>
              <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center border border-indigo-300 bg-white text-xl transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="border-t border-indigo-200 px-5 py-2">
              {remaining.map((block, blockIndex) => renderGeneratedBlock(block, `section-${sectionIndex}-${blockIndex + 1}`))}
            </div>
          </details>
        ) : remaining.map((block, blockIndex) => renderGeneratedBlock(block, `section-${sectionIndex}-${blockIndex}`))}

      </section>
    )
  })
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
    takeaway: 'La idea clave',
    synthesis: 'En síntesis',
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
    takeaway: 'La idea clau',
    synthesis: 'En síntesi',
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
    takeaway: 'The key idea',
    synthesis: 'At a glance',
  },
} as const

function ArticleVisualSummary({ article, labels }: { article: PublicGeneratedArticle; labels: { takeaway: string; synthesis: string } }) {
  const meta = article.critique?.article_meta as Record<string, unknown> | undefined
  const statement = typeof meta?.business_title === 'string' ? meta.business_title : ''
  const strings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())) : []
  const quick = strings(meta?.quick)
  const steps = strings(meta?.business_steps)
  const variant = String(meta?.presentation_variant || 'statement')
  const sequential = variant === 'sequence' || variant === 'architecture'
  const cards = sequential ? steps : variant === 'duo' ? quick.slice(0, 2) : variant !== 'statement' ? quick.slice(0, 3) : []
  if (!statement && !cards.length) return null

  return <aside aria-label={labels.takeaway} className="mx-auto mb-10 max-w-[760px] border border-slate-300">
    {statement && <div className="bg-[#1D2B44] px-6 py-7 text-white md:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/75">{labels.takeaway}</p>
      <p className="mt-3 text-[22px] font-medium leading-8 md:text-[25px] md:leading-9">{cleanInline(statement)}</p>
    </div>}
    {cards.length >= 2 && <div className="border-t border-slate-300 bg-white">
      <p className="border-b border-slate-300 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-500">{labels.synthesis}</p>
      <ol className={`grid ${cards.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        {cards.map((text, index) => <li key={index} className={`relative border-b border-slate-300 px-6 py-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 ${index % 2 ? 'bg-[#F4F1EA]' : 'bg-[#FAFAF7]'}`}>
          <span className="font-mono text-[12px] font-semibold text-indigo-700">{String(index + 1).padStart(2, '0')}</span>
          <p className="mt-3 text-[17px] font-medium leading-7 text-[#1D2B44]">{cleanInline(text)}</p>
          {sequential && index < cards.length - 1 && <span aria-hidden="true" className="mt-4 block text-xl text-indigo-700">→</span>}
        </li>)}
      </ol>
      {variant === 'duo' && quick[2] && <p className="border-t border-slate-300 px-6 py-4 text-[15px] leading-7 text-slate-600">{cleanInline(quick[2])}</p>}
    </div>}
  </aside>
}

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

          <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-b border-slate-200 pb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-slate-500">
            {article.content_family && <span>{article.content_family}</span>}
            {article.industry && <span>· {article.industry}</span>}
            {article.language && <span>· {article.language}</span>}
            <span>· {t.editorial}</span>
          </div>

          <h1 className="mt-6 max-w-4xl text-[46px] leading-[1.02] tracking-[-0.03em] sm:text-[58px] lg:text-[62px]" style={{ fontFamily: 'var(--font-playfair)' }}>
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

        <ArticleVisualSummary article={article} labels={t}/>

        <div className={`mx-auto max-w-[760px] ${hasVisual ? 'mt-10' : ''} border-t border-slate-300 pt-8`}>
          {renderBody(article.body)}
        </div>

        <section className="mx-auto mt-12 max-w-[760px] border border-slate-300 bg-[#F4F1EA] px-6 py-7 md:px-7">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.ctaEyebrow}</p>
          <p className="mt-3 max-w-2xl text-[17px] leading-8 text-slate-700">{t.ctaText}</p>
          <Link href="/contact?intent=problem" className="mt-5 inline-flex bg-slate-950 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-slate-800">
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
