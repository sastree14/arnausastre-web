'use client'

import { useState } from 'react'
import { useLanguage } from '@/components/LanguageProvider'
import { translations } from '@/lib/translations'
import { useRevealChildren } from '@/hooks/useScrollAnimation'

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRevealChildren()
  return <section ref={ref} className={className}>{children}</section>
}

export default function ContactPage() {
  const { lang } = useLanguage()
  const t = translations[lang].contact

  const [form, setForm] = useState({ name: '', company: '', email: '', project: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`[${form.project || 'Inquiry'}] ${form.name} — ${form.company}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nCompany: ${form.company}\nEmail: ${form.email}\nProject type: ${form.project}\n\n${form.message}`
    )
    window.location.href = `mailto:contact@arnausastre.com?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

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

      {/* Form + info */}
      <Section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-2">
            {/* Form */}
            <div className="reveal rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{t.formLabel}</p>
              <h2
                className="mt-3 text-3xl text-slate-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.formTitle}
              </h2>

              {submitted ? (
                <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 p-6">
                  <p className="text-sm text-indigo-800">{t.formSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-slate-500">
                        {t.fieldName}
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="form-input w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-slate-500">
                        {t.fieldCompany}
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="form-input w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-slate-500">
                      {t.fieldEmail}
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="form-input w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-slate-500">
                      {t.fieldProject}
                    </label>
                    <select
                      value={form.project}
                      onChange={(e) => setForm({ ...form, project: e.target.value })}
                      className="form-input w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900"
                    >
                      <option value="">{t.fieldProjectOpt0}</option>
                      <option>{t.fieldProjectOpt1}</option>
                      <option>{t.fieldProjectOpt2}</option>
                      <option>{t.fieldProjectOpt3}</option>
                      <option>{t.fieldProjectOpt4}</option>
                      <option>{t.fieldProjectOpt5}</option>
                      <option>{t.fieldProjectOpt6}</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-slate-500">
                      {t.fieldMessage}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder={t.fieldMessagePlaceholder}
                      className="form-input w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-md bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
                  >
                    {t.formSubmit}
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="reveal rounded-2xl border border-slate-200 bg-white p-8">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{t.infoLabel}</p>
                <h2
                  className="mt-3 text-2xl text-slate-900"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {t.infoTitle}
                </h2>

                <div className="mt-7 space-y-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{t.emailLabel}</p>
                    <a
                      href="mailto:contact@arnausastre.com"
                      className="mt-2 block text-base font-medium text-slate-900 hover:text-indigo-600 transition"
                    >
                      contact@arnausastre.com
                    </a>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{t.linkedinLabel}</p>
                    <a
                      href="https://linkedin.com/in/arnausastre"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block text-base font-medium text-slate-900 hover:text-indigo-600 transition"
                    >
                      linkedin.com/in/arnausastre
                    </a>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{t.focusLabel}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{t.focusDesc}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{t.workingStyleLabel}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{t.workingStyleDesc}</p>
                  </div>
                </div>
              </div>

              <div className="reveal rounded-2xl border border-slate-200 bg-slate-50 p-8">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{t.whatLabel}</p>
                <h2
                  className="mt-3 text-2xl text-slate-900"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {t.whatTitle}
                </h2>
                <div className="mt-7 space-y-4">
                  {[
                    { title: t.w1Title, desc: t.w1Desc },
                    { title: t.w2Title, desc: t.w2Desc },
                    { title: t.w3Title, desc: t.w3Desc },
                    { title: t.w4Title, desc: t.w4Desc },
                  ].map((w) => (
                    <div key={w.title} className="rounded-xl border border-slate-200 bg-white p-5">
                      <p className="text-sm font-semibold text-slate-900">{w.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{w.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Principle */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-medium">{t.principleLabel}</p>
            <h2
              className="mt-5 text-4xl md:text-5xl leading-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.principleTitle}
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-400">{t.principleSub}</p>
          </div>
        </div>
      </section>
    </main>
  )
}
