'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLanguage } from '@/components/LanguageProvider'
import { translations } from '@/lib/translations'
import { getArticleBySlug } from '@/lib/articles'

function renderBody(body: string) {
  const paragraphs = body.split('\n\n')
  return paragraphs.map((para, i) => {
    if (para.startsWith('**') && para.endsWith('**')) {
      const text = para.slice(2, -2)
      return (
        <h3 key={i} className="mt-8 mb-3 text-xl font-semibold text-slate-900" style={{ fontFamily: 'var(--font-playfair)' }}>
          {text}
        </h3>
      )
    }
    if (para.includes('**')) {
      const parts = para.split(/(\*\*[^*]+\*\*)/)
      return (
        <p key={i} className="mb-5 leading-8 text-slate-700">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>
            }
            return part
          })}
        </p>
      )
    }
    if (para.startsWith('- ')) {
      const items = para.split('\n').filter(l => l.startsWith('- '))
      return (
        <ul key={i} className="mb-5 space-y-2 pl-4">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2.5 text-slate-700 leading-7">
              <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-indigo-500" />
              {item.slice(2)}
            </li>
          ))}
        </ul>
      )
    }
    return <p key={i} className="mb-5 leading-8 text-slate-700">{para}</p>
  })
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const { lang } = useLanguage()
  const tc = translations[lang].common
  const article = getArticleBySlug(slug)

  if (!article) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-24">
        <p className="text-slate-600">Article not found.</p>
        <Link href="/insights" className="mt-4 block text-sm text-indigo-600 hover:underline">{tc.backToInsights}</Link>
      </main>
    )
  }

  const title = lang === 'en' ? article.titleEn : article.titleEs
  const body = lang === 'en' ? article.bodyEn : article.bodyEs
  const tags = lang === 'en' ? article.tagsEn : article.tagsEs

  return (
    <main className="bg-slate-50 text-slate-900 page-enter">
      <article className="mx-auto max-w-4xl px-6 py-20">
        <Link
          href="/insights"
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
          className="text-4xl leading-tight md:text-5xl text-slate-900"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {title}
        </h1>

        <div className="mt-5 flex items-center gap-6 border-b border-slate-200 pb-8">
          <p className="text-sm text-slate-500">{article.date}</p>
          <p className="text-sm text-slate-500">{article.readingTime} {tc.minRead}</p>
        </div>

        <div className="mt-10 prose-like">
          {renderBody(body)}
        </div>
      </article>
    </main>
  )
}
