'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'
import { translations } from '@/lib/translations'
import { useRevealChildren } from '@/hooks/useScrollAnimation'

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRevealChildren()
  return <section ref={ref} className={className}>{children}</section>
}

const skillsData = {
  'Core Languages': ['Python', 'SQL', 'R'],
  'Machine Learning & Statistics': ['scikit-learn', 'XGBoost', 'LightGBM', 'statsmodels', 'Prophet', 'PyTorch'],
  'Optimization': ['PuLP', 'OR-Tools', 'SciPy optimize', 'CVXPY', 'Gurobi'],
  'Data Engineering': ['Pandas', 'NumPy', 'dbt', 'Apache Airflow', 'PostgreSQL'],
  'Visualization & BI': ['Plotly', 'Matplotlib', 'Power BI', 'Streamlit'],
}

const skillsDataEs = {
  'Lenguajes principales': ['Python', 'SQL', 'R'],
  'Machine Learning y Estadística': ['scikit-learn', 'XGBoost', 'LightGBM', 'statsmodels', 'Prophet', 'PyTorch'],
  'Optimización': ['PuLP', 'OR-Tools', 'SciPy optimize', 'CVXPY', 'Gurobi'],
  'Ingeniería de Datos': ['Pandas', 'NumPy', 'dbt', 'Apache Airflow', 'PostgreSQL'],
  'Visualización y BI': ['Plotly', 'Matplotlib', 'Power BI', 'Streamlit'],
}

export default function AboutPage() {
  const { lang } = useLanguage()
  const t = translations[lang].about
  const skills = lang === 'en' ? skillsData : skillsDataEs

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

      {/* Bio */}
      <Section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-14 md:grid-cols-2">
            <div>
              <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.bioLabel}</p>
              <h2
                className="reveal reveal-delay-1 mt-4 text-4xl text-slate-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.bioTitle}
              </h2>
              <p className="reveal reveal-delay-1 mt-1 text-sm text-slate-500">{t.bioRole}</p>

              <div className="mt-8 space-y-5 text-slate-600 leading-8">
                <p className="reveal">{t.bioP1}</p>
                <p className="reveal">{t.bioP2}</p>
                <p className="reveal">{t.bioP3}</p>
              </div>
            </div>

            <div>
              <div className="reveal rounded-2xl border border-slate-200 bg-slate-50 p-8">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{t.valuesLabel}</p>
                <div className="mt-6 space-y-6">
                  {[
                    { title: t.v1Title, desc: t.v1Desc },
                    { title: t.v2Title, desc: t.v2Desc },
                    { title: t.v3Title, desc: t.v3Desc },
                    { title: t.v4Title, desc: t.v4Desc },
                  ].map((v) => (
                    <div key={v.title} className="flex gap-4">
                      <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{v.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{v.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="reveal mt-6 rounded-2xl border border-slate-200 bg-white p-8">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{t.workLabel}</p>
                <h3 className="mt-3 text-xl text-slate-900" style={{ fontFamily: 'var(--font-playfair)' }}>{t.workTitle}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{t.workP1}</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">{t.workP2}</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Skills */}
      <Section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12">
            <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.skillsLabel}</p>
            <h2
              className="reveal reveal-delay-1 mt-4 text-4xl text-slate-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.skillsTitle}
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(skills).map(([category, items], i) => (
              <div
                key={category}
                className={`reveal reveal-delay-${Math.min(i + 1, 4)} rounded-2xl border border-slate-200 bg-white p-6 card-lift`}
              >
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400 mb-4">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <span
                      key={item}
                      className="rounded-md bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Background */}
      <Section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.bgLabel}</p>
              <h2
                className="reveal reveal-delay-1 mt-4 text-4xl text-slate-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.bgTitle}
              </h2>
            </div>

            <div className="md:col-span-2 space-y-5">
              {[
                { title: t.bg1Title, desc: t.bg1Desc },
                { title: t.bg2Title, desc: t.bg2Desc },
                { title: t.bg3Title, desc: t.bg3Desc },
              ].map((bg, i) => (
                <div key={bg.title} className={`reveal reveal-delay-${i + 1} rounded-2xl border border-slate-200 bg-slate-50 p-6 card-lift`}>
                  <h3 className="text-base font-semibold text-slate-900">{bg.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{bg.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Focus */}
      <Section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <p className="reveal text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">{t.focusLabel}</p>
              <h2
                className="reveal reveal-delay-1 mt-4 text-4xl text-slate-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.focusTitle}
              </h2>
            </div>

            <div className="md:col-span-2 grid gap-5 md:grid-cols-2">
              {[
                { title: t.f1Title, desc: t.f1Desc },
                { title: t.f2Title, desc: t.f2Desc },
                { title: t.f3Title, desc: t.f3Desc },
                { title: t.f4Title, desc: t.f4Desc },
              ].map((f, i) => (
                <div key={f.title} className={`reveal reveal-delay-${i + 1} rounded-2xl border border-slate-200 bg-white p-6 card-lift`}>
                  <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-medium">{t.ctaLabel}</p>
            <h2
              className="mt-5 text-4xl md:text-5xl leading-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.ctaTitle}
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-400">{t.ctaSub}</p>
            <div className="mt-10">
              <Link
                href="/contact"
                className="inline-block rounded-md bg-white px-7 py-3.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
                {t.ctaBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
