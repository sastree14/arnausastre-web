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

  const [form, setForm] = useState({ name: '', company: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`[SC-Analytics] ${form.name}${form.company ? ` — ${form.company}` : ''}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\n${form.company ? `Company: ${form.company}\n` : ''}Email: ${form.email}\n\n${form.message}`
    )
    window.location.href = `mailto:contact@arnausastre.com?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  return (
    <main className="bg-white text-slate-900 page-enter">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-medium">{t.heroLabel}</p>
            <h1
              className="mt-6 text-5xl md:text-6xl leading-[1.1] text-white"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.heroTitle}
            </h1>
            <p className="mt-8 text-lg leading-8 text-slate-300 max-w-2xl">{t.heroSub}</p>
          </div>
        </div>
      </section>

      {/* ── FORM + INFO ──────────────────────────────────────────── */}
      <Section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-2">

            {/* ── Left: Form ── */}
            <div className="reveal rounded-2xl border border-slate-200 bg-slate-50 p-8 md:p-10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{t.formLabel}</p>
              <h2
                className="mt-3 text-3xl text-slate-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.formTitle}
              </h2>

              {/* No-commitment note */}
              <div className="mt-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                <p className="text-sm text-slate-500">{t.formNoCommitment}</p>
              </div>

              {submitted ? (
                <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 p-6">
                  <p className="text-sm text-indigo-800">{t.formSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                  {/* Name + Company */}
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
                        className="form-input w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
                        className="form-input w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-slate-500">
                      {t.fieldEmail}
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="form-input w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-slate-500">
                      {t.fieldMessage}
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder={t.fieldMessagePlaceholder}
                      className="form-input w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-md bg-slate-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-slate-700"
                  >
                    {t.formSubmit}
                  </button>
                </form>
              )}
            </div>

            {/* ── Right: Info + Guidance ── */}
            <div className="space-y-6">

              {/* Contact info panel */}
              <div className="reveal rounded-2xl border border-slate-200 bg-white p-8">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{t.infoLabel}</p>
                <h2
                  className="mt-3 text-2xl text-slate-900"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {t.infoTitle}
                </h2>
                <div className="mt-7 space-y-5">
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
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{t.responseTimeLabel}</p>
                    <p className="mt-2 text-base font-medium text-slate-900">{t.responseTimeDesc}</p>
                  </div>
                </div>
              </div>

              {/* Guidance section */}
              <div className="reveal rounded-2xl border border-slate-200 bg-slate-50 p-8">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{t.guidanceLabel}</p>
                <h2
                  className="mt-3 text-xl text-slate-900"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {t.guidanceTitle}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">{t.guidanceNote}</p>
                <ul className="mt-6 space-y-3">
                  {([t.g1, t.g2, t.g3, t.g4] as string[]).map((q) => (
                    <li key={q} className="flex items-start gap-3">
                      <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-indigo-400" />
                      <p className="text-sm leading-6 text-slate-700">{q}</p>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </Section>

      {/* ── BOTTOM PRINCIPLE ─────────────────────────────────────── */}
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
