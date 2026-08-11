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
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(false)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Request failed')
      setSubmitted(true)
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
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

                  {error && (
                    <p className="text-sm text-red-600">{t.formError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full rounded-md bg-slate-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? t.formSubmitting : t.formSubmit}
                  </button>

                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-slate-200" />
                    <span className="mx-3 flex-shrink text-xs text-slate-400">or</span>
                    <div className="flex-grow border-t border-slate-200" />
                  </div>

                  <a
                    href="https://calendly.com/arnau-sastre-sc-analytics"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-6 py-3.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                      <line x1="1" y1="5.5" x2="13" y2="5.5" stroke="currentColor" strokeWidth="1.4"/>
                      <line x1="4.5" y1="1" x2="4.5" y2="3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      <line x1="9.5" y1="1" x2="9.5" y2="3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    {t.calendlyBtn}
                  </a>
                </form>
              )}
            </div>

            {/* ── Right: What happens next ── */}
            <div className="reveal rounded-2xl border border-slate-200 bg-white p-8 md:p-10 flex flex-col">

              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{t.nextLabel}</p>
              <h2
                className="mt-3 text-2xl text-slate-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.nextTitle}
              </h2>

              {/* 3 numbered steps */}
              <ol className="mt-8 space-y-7 flex-1">
                {([t.next1, t.next2, t.next3] as string[]).map((step, i) => (
                  <li key={i} className="flex gap-5 items-start">
                    <span
                      className="text-2xl font-light text-slate-200 flex-shrink-0 leading-none"
                      style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm leading-7 text-slate-600 pt-0.5">{step}</p>
                  </li>
                ))}
              </ol>

              {/* Trust block */}
              <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 px-6 py-5">
                <p className="text-sm font-semibold text-indigo-900 leading-6">{t.nextTrust1}</p>
                <p className="mt-1.5 text-sm leading-6 text-indigo-700">{t.nextTrust2}</p>
              </div>

              {/* Footer note */}
              <p className="mt-5 text-xs text-slate-400">{t.nextFooter}</p>

            </div>
          </div>
        </div>
      </Section>

    </main>
  )
}
