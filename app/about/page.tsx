'use client'

import Image from 'next/image'
import Link from 'next/link'
import AnalyticalPartnerSection from '@/components/AnalyticalPartnerSection'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { publicCopy } from '@/lib/public-copy'

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">{children}</p>
}

export default function AboutPage() {
  const { lang } = useSiteLanguage()
  const t = publicCopy[lang].about

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:py-28 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">{t.eyebrow}</p>
            <h1 className="mt-5 max-w-4xl text-5xl leading-[1.08] md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">{t.intro}</p>
          </div>
          <div className="relative hidden min-h-[300px] items-center justify-center lg:flex">
            <div className="absolute h-64 w-64 rounded-full border border-indigo-300/10"/>
            <Image src="/brand/logo-horizontal-transparent.png" alt="SC-Analytics" width={620} height={320} className="relative z-10 w-full max-w-md object-contain" priority/>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-[0.7fr_1.3fr]">
        <Eyebrow>{t.purposeLabel}</Eyebrow>
        <div>
          <h2 className="text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.purposeTitle}</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{t.purposeBody}</p>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <Eyebrow>{t.valuesLabel}</Eyebrow>
          <h2 className="mt-4 text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.valuesTitle}</h2>
          <div className="mt-10 grid gap-x-10 gap-y-0 md:grid-cols-2">
            {t.values.map((value,index) => (
              <article key={value.title} className="grid grid-cols-[44px_1fr] gap-4 border-t border-slate-200 py-6">
                <span className="text-xs font-semibold text-indigo-600">0{index+1}</span>
                <div><h3 className="font-semibold">{value.title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{value.body}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <Eyebrow>{t.modelLabel}</Eyebrow>
            <h2 className="mt-4 text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.modelTitle}</h2>
          </div>
          <div>
            <p className="text-base leading-8 text-slate-600">{t.modelBody}</p>
            <div className="mt-9 border-y border-slate-200">
              {t.modelPoints.map((point,index) => (
                <div key={point} className="grid grid-cols-[52px_1fr] items-center border-b border-slate-200 py-5 last:border-b-0">
                  <span className="text-xs font-semibold text-indigo-600">0{index+1}</span>
                  <p className="text-base font-medium text-slate-800">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AnalyticalPartnerSection />

      <section className="border-t border-slate-200 bg-indigo-50">
        <div className="mx-auto max-w-7xl px-6 py-16 md:flex md:items-end md:justify-between md:gap-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.ctaTitle}</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">{t.ctaBody}</p>
          </div>
          <Link href="/contact" className="mt-8 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 md:mt-0">{t.ctaButton}</Link>
        </div>
      </section>
    </main>
  )
}
