'use client'

import Link from 'next/link'
import { useLanguage } from './LanguageProvider'
import { translations } from '@/lib/translations'
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

function extractHeadings(body: string): string[] {
  return body
    .split('\n\n')
    .filter((p) => /^\*\*[^*]+\*\*$/.test(p.trim()))
    .map((p) => p.trim().slice(2, -2))
}

function renderBody(body: string) {
  const paragraphs = body.split('\n\n')
  let sectionIndex = 0

  return paragraphs.map((para, i) => {
    const trimmed = para.trim()
    if (!trimmed) return null

    // Standalone heading: full paragraph is **text**
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      sectionIndex++
      const text = trimmed.slice(2, -2)
      const num = String(sectionIndex).padStart(2, '0')
      return (
        <div key={i} id={`section-${sectionIndex}`} className="mt-16 mb-8 flex items-start gap-5">
          <span
            className="flex-shrink-0 text-4xl font-light text-slate-200 leading-none select-none"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {num}
          </span>
          <div>
            <h2
              className="text-2xl font-semibold text-slate-900 leading-snug"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {text}
            </h2>
            <div className="mt-2.5 h-0.5 w-10 rounded-full bg-indigo-400" />
          </div>
        </div>
      )
    }

    // Bullet list
    if (trimmed.startsWith('- ')) {
      const items = trimmed.split('\n').filter((l) => l.startsWith('- '))
      return (
        <ul key={i} className="my-7 space-y-3.5 rounded-xl border border-slate-100 bg-slate-50 px-7 py-6">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-3 leading-7 text-slate-700">
              <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
              <span>{renderInline(item.slice(2))}</span>
            </li>
          ))}
        </ul>
      )
    }

    // Lead paragraph (first)
    if (i === 0) {
      return (
        <p key={i} className="mb-10 border-l-2 border-indigo-300 pl-5 text-xl leading-9 text-slate-700">
          {renderInline(trimmed)}
        </p>
      )
    }

    // Regular paragraph
    return (
      <p key={i} className="mb-6 text-base leading-8 text-slate-600">
        {renderInline(trimmed)}
      </p>
    )
  })
}

export default function ArticleContent({ article }: { article: Article }) {
  const { lang } = useLanguage()
  const tc = translations[lang].common

  const title = lang === 'en' ? article.titleEn : article.titleEs
  const body = lang === 'en' ? article.bodyEn : article.bodyEs
  const tags = lang === 'en' ? article.tagsEn : article.tagsEs
  const headings = extractHeadings(body)

  return (
    <main className="bg-white text-slate-900 page-enter">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-slate-50">
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

          <div className="mt-6 flex items-center gap-6">
            <span className="text-sm text-slate-400">{article.date}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-sm text-slate-400">{article.readingTime} {tc.minRead}</span>
            {headings.length > 0 && (
              <>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-sm text-slate-400">{headings.length} sections</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Body + sidebar ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-20 lg:items-start">

          {/* Article body */}
          <article>
            {renderBody(body)}
          </article>

          {/* TOC sidebar — desktop only */}
          {headings.length > 0 && (
            <aside className="hidden lg:block sticky top-24 self-start">
              <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                In this article
              </p>
              <nav className="space-y-4 border-l border-slate-100 pl-4">
                {headings.map((h, idx) => (
                  <a
                    key={idx}
                    href={`#section-${idx + 1}`}
                    className="group flex items-start gap-2.5 text-sm leading-snug text-slate-400 hover:text-indigo-600 transition"
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
