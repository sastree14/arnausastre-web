'use client'

import Link from 'next/link'
import { useLanguage } from './LanguageProvider'
import { translations } from '@/lib/translations'
import type { Article } from '@/lib/content'

// ── Inline markdown renderer ───────────────────────────────────────────────────

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

// ── Body parser — splits into intro + named sections ──────────────────────────

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

// ── Paragraph renderer ────────────────────────────────────────────────────────

function renderPara(para: string, i: number) {
  if (para.startsWith('- ')) {
    const items = para.split('\n').filter((l) => l.startsWith('- '))
    return (
      <ul key={i} className="space-y-3">
        {items.map((item, j) => (
          <li key={j} className="flex items-start gap-3 text-slate-600 leading-7">
            <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
            <span>{renderInline(item.slice(2))}</span>
          </li>
        ))}
      </ul>
    )
  }
  return (
    <p key={i} className="text-base leading-8 text-slate-600">
      {renderInline(para)}
    </p>
  )
}

// ── TOC headings extractor ────────────────────────────────────────────────────

function extractHeadings(body: string): string[] {
  return body
    .split('\n\n')
    .filter((p) => /^\*\*[^*]+\*\*$/.test(p.trim()))
    .map((p) => p.trim().slice(2, -2))
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ArticleContent({ article }: { article: Article }) {
  const { lang } = useLanguage()
  const tc = translations[lang].common
  const ti = translations[lang].insights

  const title = lang === 'en' ? article.titleEn : article.titleEs
  const body = lang === 'en' ? article.bodyEn : article.bodyEs
  const tags = lang === 'en' ? article.tagsEn : article.tagsEs

  const segments = parseBody(body)
  const headings = extractHeadings(body)
  let sectionCount = 0

  return (
    <main className="bg-slate-50 text-slate-900 page-enter">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 pb-14 pt-14">
          <Link
            href="/knowledge"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition mb-10"
          >
            {tc.backToInsights}
          </Link>

          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1
            className="text-4xl leading-tight md:text-5xl text-slate-900 max-w-3xl"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {title}
          </h1>

          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <span className="text-sm text-slate-400">{article.date}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-sm text-slate-400">{article.readingTime} {tc.minRead}</span>
            {headings.length > 0 && (
              <>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-sm text-slate-400">{headings.length} {lang === 'en' ? 'sections' : 'secciones'}</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Article + sidebar ──────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="lg:grid lg:grid-cols-[1fr_200px] lg:gap-14 lg:items-start">

          {/* Article body — section cards */}
          <article className="space-y-6">
            {segments.map((seg, si) => {

              if (seg.type === 'intro') {
                return (
                  <div
                    key={si}
                    className="rounded-2xl border border-indigo-100 bg-indigo-50 px-8 py-8 md:px-10"
                  >
                    <div className="space-y-5">
                      {seg.paras.map((para, i) => (
                        <p key={i} className="text-lg leading-9 text-slate-700">
                          {renderInline(para)}
                        </p>
                      ))}
                    </div>
                  </div>
                )
              }

              sectionCount++
              const num = String(sectionCount).padStart(2, '0')

              return (
                <div
                  key={si}
                  id={`section-${sectionCount}`}
                  className="rounded-2xl border border-slate-200 bg-white px-8 py-8 md:px-10"
                >
                  {/* Section heading */}
                  <div className="flex items-start gap-5 mb-7 pb-6 border-b border-slate-100">
                    <span
                      className="flex-shrink-0 text-4xl font-light text-slate-200 leading-none select-none"
                      style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                      {num}
                    </span>
                    <div>
                      <h2
                        className="text-xl font-semibold text-slate-900 leading-snug"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                      >
                        {seg.heading}
                      </h2>
                      <div className="mt-2 h-0.5 w-8 rounded-full bg-indigo-400" />
                    </div>
                  </div>

                  {/* Section body */}
                  <div className="space-y-5">
                    {seg.paras.map((para, i) => renderPara(para, i))}
                  </div>
                </div>
              )
            })}
          </article>

          {/* TOC sidebar — desktop only */}
          {headings.length > 0 && (
            <aside className="hidden lg:block sticky top-24 self-start">
              <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                {ti.inThisArticle}
              </p>
              <nav className="space-y-3 border-l border-slate-200 pl-4">
                {headings.map((h, idx) => (
                  <a
                    key={idx}
                    href={`#section-${idx + 1}`}
                    className="group flex items-start gap-2 text-xs leading-snug text-slate-400 hover:text-indigo-600 transition"
                  >
                    <span className="flex-shrink-0 font-light text-slate-300 group-hover:text-indigo-400 transition">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    {h}
                  </a>
                ))}
              </nav>
            </aside>
          )}
        </div>
      </div>

    </main>
  )
}
