'use client'

import { useState } from 'react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { publicCopy } from '@/lib/public-copy'

export default function ContactPage() {
  const { lang } = useSiteLanguage()
  const t = publicCopy[lang].contact
  const [form, setForm] = useState({ name: '', company: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSending(true)
    setError(false)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, language: lang, sourcePath: '/contact' }),
      })
      if (!response.ok) throw new Error('Request failed')
      setSubmitted(true)
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">{t.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl text-5xl leading-[1.08] md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">{t.intro}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7 md:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t.formLabel}</p>
          <h2 className="mt-3 text-3xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.formTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">{t.noCommitment}</p>

          {submitted ? (
            <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">{t.success}</div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm text-slate-600">{t.name}<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-indigo-400" /></label>
                <label className="text-sm text-slate-600">{t.company}<input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-indigo-400" /></label>
              </div>
              <label className="block text-sm text-slate-600">{t.email}<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-indigo-400" /></label>
              <label className="block text-sm text-slate-600">{t.message}<textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t.placeholder} className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-indigo-400" /></label>
              {error && <p className="text-sm text-red-600">{t.error}</p>}
              <button disabled={sending} className="w-full rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{sending ? t.sending : t.send}</button>
              <div className="flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" /><span>{t.or}</span><span className="h-px flex-1 bg-slate-200" /></div>
              <a href="https://calendly.com/arnau-sastre-sc-analytics" target="_blank" rel="noreferrer" className="flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">{t.calendly} ↗</a>
            </form>
          )}
        </div>

        <aside className="rounded-2xl border border-slate-200 p-7 md:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">{t.nextLabel}</p>
          <h2 className="mt-3 text-3xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.nextTitle}</h2>
          <ol className="mt-8 space-y-6">
            {t.nextSteps.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="text-sm font-semibold text-indigo-600">{String(index + 1).padStart(2, '0')}</span>
                <p className="text-sm leading-7 text-slate-600">{step}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 p-5 text-sm leading-7 text-indigo-900">{t.trust}</div>
        </aside>
      </section>
    </main>
  )
}
