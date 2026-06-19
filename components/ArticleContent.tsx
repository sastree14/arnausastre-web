'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from './LanguageProvider'
import { translations } from '@/lib/translations'
import type { Article } from '@/lib/content'

function renderBody(body: string) {
  const paragraphs = body.split('\n\n')
  return paragraphs.map((para, i) => {
    if (para.startsWith('**') && para.endsWith('**')) {
      return (
        <h3 key={i} className="mt-8 mb-3 text-xl font-semibold text-slate-900" style={{ fontFamily: 'var(--font-playfair)' }}>
          {para.slice(2, -2)}
        </h3>
      )
    }
    if (para.includes('**')) {
      const parts = para.split(/(\*\*[^*]+\*\*)/)
      return (
        <p key={i} className="mb-5 leading-8 text-slate-700">
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      )
    }
    if (para.startsWith('- ')) {
      const items = para.split('\n').filter((l) => l.startsWith('- '))
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

export default function ArticleContent({ article }: { article: Article }) {
  const { lang } = useLanguage()
  const tc = translations[lang].common

  const title = lang === 'en' ? article.titleEn : article.titleEs
  const body = lang === 'en' ? article.bodyEn : article.bodyEs
  const tags = lang === 'en' ? article.tagsEn : article.tagsEs

  return (
    <main className="bg-slate-50 text-slate-900 page-enter">
      <div className="mx-auto max-w-6xl px-6 pt-20">
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition mb-10"
        >
          {tc.backToInsights}
        </Link>

        <div className="grid items-center gap-12 pb-8 border-b border-slate-200 lg:grid-cols-2">
          <div>
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
            <div className="mt-5 flex items-center gap-6">
              <p className="text-sm text-slate-500">{article.date}</p>
              <p className="text-sm text-slate-500">{article.readingTime} {tc.minRead}</p>
            </div>
          </div>

          <div className="hidden lg:flex overflow-hidden rounded-2xl bg-slate-900 items-center justify-center px-12 py-14">
            <Image
              src="/brand/logo-horizontal-transparent.png"
              alt="SC-Analytics"
              width={400}
              height={130}
              className="w-full h-auto opacity-80"
              priority
            />
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-6 py-20">
        <div className="prose-like">
          {renderBody(body)}
        </div>
      </article>
    </main>
  )
}
