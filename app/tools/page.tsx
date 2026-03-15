'use client'

import { useLanguage } from '@/components/LanguageProvider'
import { translations } from '@/lib/translations'
import { useRevealChildren } from '@/hooks/useScrollAnimation'

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRevealChildren()
  return <section ref={ref} className={className}>{children}</section>
}

export default function ToolsPage() {
  const { lang } = useLanguage()
  const t = translations[lang].tools

  const tools = [
    { name: t.t1Name, desc: t.t1Desc, tag: t.t1Tag, icon: '◎' },
    { name: t.t2Name, desc: t.t2Desc, tag: t.t2Tag, icon: '◈' },
    { name: t.t3Name, desc: t.t3Desc, tag: t.t3Tag, icon: '◇' },
    { name: t.t4Name, desc: t.t4Desc, tag: t.t4Tag, icon: '◉' },
  ]

  return (
    <main className="bg-slate-50 text-slate-900 page-enter">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:py-28">
        <div className="max-w-4xl">
          <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.heroLabel}</p>
          <h1
            className="reveal reveal-delay-1 mt-4 text-5xl leading-tight md:text-6xl"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {t.heroTitle}
          </h1>
          <p className="reveal reveal-delay-2 mt-8 max-w-3xl text-lg leading-8 text-slate-600">{t.heroSub}</p>
        </div>
      </section>

      {/* Tools grid */}
      <Section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-6 md:grid-cols-2">
            {tools.map((tool, i) => (
              <div
                key={tool.name}
                className={`reveal reveal-delay-${i + 1} group relative rounded-2xl border border-slate-200 bg-slate-50 p-8 overflow-hidden`}
              >
                {/* Coming soon badge */}
                <div className="absolute top-5 right-5">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                    {t.comingSoonTitle}
                  </span>
                </div>

                {/* Icon */}
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-2xl text-slate-400">
                  {tool.icon}
                </div>

                <span className="mb-3 inline-block rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                  {tool.tag}
                </span>

                <h2
                  className="mt-2 text-2xl text-slate-900"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {tool.name}
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600">{tool.desc}</p>

                <div className="mt-6 h-px w-full bg-slate-200" />
                <p className="mt-5 text-xs text-slate-400">{t.comingSoonDesc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </main>
  )
}
