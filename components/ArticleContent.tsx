'use client'

import Link from '@/components/SiteLink'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import type { Article } from '@/lib/content'

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i} className="italic text-slate-500">{part.slice(1, -1)}</em>
    return part
  })
}

type BodySegment =
  | { type: 'intro'; paras: string[] }
  | { type: 'section'; heading: string; paras: string[] }

function parseBody(body: string): BodySegment[] {
  const paragraphs = body.split('\n\n').map((p) => p.trim()).filter(Boolean)
  const segments: BodySegment[] = []
  let current: BodySegment = { type: 'intro', paras: [] }

  for (const para of paragraphs) {
    if (/^\*\*[^*]+\*\*$/.test(para)) {
      if (current.paras.length > 0) segments.push(current)
      current = { type: 'section', heading: para.slice(2, -2), paras: [] }
    } else {
      current.paras.push(para)
    }
  }
  if (current.paras.length > 0) segments.push(current)
  return segments
}

function renderPara(para: string, i: number) {
  if (para.startsWith('- ')) {
    const items = para.split('\n').filter((line) => line.startsWith('- '))
    return (
      <ul key={i} className="space-y-3 border-l-2 border-indigo-200 pl-5">
        {items.map((item, j) => (
          <li key={j} className="text-[17px] leading-8 text-slate-700">
            {renderInline(item.slice(2))}
          </li>
        ))}
      </ul>
    )
  }
  return <p key={i} className="text-[17px] leading-8 text-slate-700">{renderInline(para)}</p>
}

function extractHeadings(body: string): string[] {
  return body
    .split('\n\n')
    .filter((p) => /^\*\*[^*]+\*\*$/.test(p.trim()))
    .map((p) => p.trim().slice(2, -2))
}

const COPY = {
  en: {
    back: 'Knowledge',
    min: 'min read',
    sections: 'sections',
    toc: 'In this article',
    explore: 'Keep exploring',
    cases: 'Case studies',
    work: 'How we work',
    contact: 'Contact us',
    detail: 'Read detail',
  },
  es: {
    back: 'Conocimiento',
    min: 'min de lectura',
    sections: 'secciones',
    toc: 'En este artículo',
    explore: 'Sigue explorando',
    cases: 'Casos',
    work: 'Cómo trabajamos',
    contact: 'Contacta con nosotros',
    detail: 'Ver detalle',
  },
  ca: {
    back: 'Coneixement',
    min: 'min de lectura',
    sections: 'seccions',
    toc: 'En aquest article',
    explore: 'Continua explorant',
    cases: 'Casos',
    work: 'Com treballem',
    contact: 'Contacta amb nosaltres',
    detail: 'Veure detall',
  },
} as const

export default function ArticleContent({ article, forcedLanguage }: { article: Article; forcedLanguage?: 'en'|'es'|'ca' }) {
  const { lang: siteLang } = useSiteLanguage()
  const lang = forcedLanguage || siteLang
  const t = COPY[lang]
  const title = lang === 'en' ? article.titleEn : lang === 'ca' ? (article.titleCa || article.titleEs) : article.titleEs
  const body = lang === 'en' ? article.bodyEn : lang === 'ca' ? (article.bodyCa || article.bodyEs) : article.bodyEs
  const tags = lang === 'en' ? article.tagsEn : lang === 'ca' ? (article.tagsCa || article.tagsEs) : article.tagsEs
  const segments = parseBody(body)
  const headings = extractHeadings(body)

  return (
    <main className="bg-[#FAFAF7] text-slate-950">
      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-10 md:pb-14 md:pt-12">
          <Link href="/knowledge" className="inline-flex items-center gap-2 text-[15px] font-medium text-slate-500 transition hover:text-slate-950">
            ← {t.back}
          </Link>

          <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-b border-slate-200 pb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>

          <h1 className="mt-6 max-w-4xl text-[46px] leading-[1.02] tracking-[-0.03em] sm:text-[58px] lg:text-[62px]" style={{ fontFamily: 'var(--font-playfair)' }}>
            {title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[12px] uppercase tracking-[0.08em] text-slate-500">
            <span>{article.date}</span>
            <span>·</span>
            <span>{article.readingTime} {t.min}</span>
            {headings.length > 0 && <><span>·</span><span>{headings.length} {t.sections}</span></>}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-14 lg:items-start">
          <article className="border-t border-slate-300">
            {segments.map((segment, segmentIndex) => {
              if (segment.type === 'intro') {
                return (
                  <div key={segmentIndex} className="border-b border-slate-300 bg-[#F4F1EA] px-6 py-8 md:px-8 md:py-9">
                    <div className="max-w-[72ch] space-y-5">
                      {segment.paras.map((para, i) => (
                        <p key={i} className="text-[20px] leading-9 text-[#1D2B44]">{renderInline(para)}</p>
                      ))}
                    </div>
                  </div>
                )
              }

              const sectionNumber = segments.slice(0, segmentIndex + 1).filter((item) => item.type === 'section').length
              const num = String(sectionNumber).padStart(2, '0')
              return (
                <section key={segmentIndex} id={`section-${sectionNumber}`} className="border-b border-slate-300 bg-white px-6 py-9 md:px-8 md:py-10">
                  <div className="grid gap-5 md:grid-cols-[62px_1fr]">
                    <span className="font-mono text-[13px] font-semibold text-indigo-700">{num}</span>
                    <div>
                      <h2 className="max-w-[26ch] text-[31px] leading-[1.08] text-slate-950 sm:text-[35px]" style={{ fontFamily: 'var(--font-playfair)' }}>{segment.heading}</h2>
                      <div className="mt-6 max-w-[72ch]">
                        <div className="space-y-5">
                          {segment.paras.slice(0, 1).map((para, i) => renderPara(para, i))}
                        </div>

                        {segment.paras.length > 1 ? (
                          <details className="group mt-5 border-t border-slate-200 pt-4">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-indigo-700">
                              <span>{t.detail}</span>
                              <span className="text-[18px] font-normal transition-transform group-open:rotate-45">+</span>
                            </summary>
                            <div className="mt-5 space-y-5">
                              {segment.paras.slice(1).map((para, i) => renderPara(para, i + 1))}
                            </div>
                          </details>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </section>
              )
            })}
          </article>

          {headings.length > 0 && (
            <aside className="sticky top-24 hidden self-start lg:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{t.toc}</p>
              <nav className="mt-4 border-l border-slate-300">
                {headings.map((heading, index) => (
                  <a
                    key={heading}
                    href={`#section-${index + 1}`}
                    className="grid grid-cols-[30px_1fr] gap-2 border-b border-slate-200 py-3 pl-4 text-[13px] leading-6 text-slate-600 transition hover:text-indigo-700"
                  >
                    <span className="font-mono text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                    <span>{heading}</span>
                  </a>
                ))}
              </nav>
            </aside>
          )}
        </div>
      </div>

      <section className="border-y border-slate-300 bg-white">
        <div className="mx-auto grid max-w-6xl gap-7 px-6 py-10 lg:grid-cols-[190px_1fr] lg:gap-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.explore}</p>
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
