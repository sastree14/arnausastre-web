'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'HABLEMOS',
    title: 'Empecemos por lo que debería funcionar mejor.',
    intro: 'No necesitas saber qué tecnología necesitas. Cuéntanos qué está pasando, qué decisión quieres mejorar o qué oportunidad quieres explorar. A partir de ahí decidimos si merece la pena construir algo.',
    expectLabel: 'PRIMERA CONVERSACIÓN',
    expect: [
      ['30 min', 'Para entender contexto, objetivo y restricciones.'],
      ['Sin coste', 'La primera sesión de discovery no tiene coste.'],
      ['Sin compromiso', 'Si no existe un caso razonable, también te lo diremos.'],
    ],
    intentLabel: '¿Qué te trae hasta aquí?',
    intents: [
      ['problem', 'Tengo un problema concreto', 'Hay una decisión, proceso o sistema que debería funcionar mejor.'],
      ['opportunity', 'Quiero explorar una oportunidad', 'Sé que los datos o la IA pueden aportar valor, pero todavía no sé dónde.'],
      ['partner', 'Busco un Partner Data & AI', 'Necesito capacidad recurrente sin construir todas las especialidades internamente.'],
    ],
    formLabel: 'CUÉNTANOS EL CONTEXTO',
    formTitle: 'Con unas líneas es suficiente.',
    formBody: 'No prepares un briefing perfecto. Qué ocurre hoy, qué debería cambiar y por qué importa nos da suficiente contexto para empezar.',
    name: 'Nombre',
    company: 'Empresa',
    email: 'Email',
    message: 'Contexto',
    placeholder: 'Qué está pasando hoy, qué debería mejorar y qué restricciones o prioridades debemos conocer...',
    send: 'Enviar contexto',
    sending: 'Enviando…',
    successTitle: 'Contexto recibido.',
    success: 'Gracias. Revisaremos lo que nos has contado y continuaremos la conversación desde ahí.',
    error: 'No hemos podido enviar el mensaje. Puedes volver a intentarlo o reservar directamente una conversación.',
    callLabel: '¿PREFIERES HABLARLO?',
    callTitle: 'Reserva directamente 30 minutos.',
    callBody: 'Si es más fácil explicarlo hablando, puedes reservar una primera conversación. No necesitas preparar documentación ni tener una solución definida.',
    calendly: 'Reservar discovery',
    nextLabel: 'QUÉ PASA DESPUÉS',
    next: [
      'Entendemos el problema y la decisión que importa.',
      'Valoramos si datos, matemáticas o IA pueden aportar suficiente valor.',
      'Si tiene sentido, proponemos el siguiente paso más pequeño que permita avanzar.',
    ],
  },
  ca: {
    eyebrow: 'PARLEM',
    title: 'Comencem pel que hauria de funcionar millor.',
    intro: 'No cal saber quina tecnologia necessites. Explica’ns què està passant, quina decisió vols millorar o quina oportunitat vols explorar. A partir d’aquí decidim si val la pena construir alguna cosa.',
    expectLabel: 'PRIMERA CONVERSA',
    expect: [
      ['30 min', 'Per entendre context, objectiu i restriccions.'],
      ['Sense cost', 'La primera sessió de discovery no té cost.'],
      ['Sense compromís', 'Si no existeix un cas raonable, també t’ho direm.'],
    ],
    intentLabel: 'Què et porta fins aquí?',
    intents: [
      ['problem', 'Tinc un problema concret', 'Hi ha una decisió, procés o sistema que hauria de funcionar millor.'],
      ['opportunity', 'Vull explorar una oportunitat', 'Sé que les dades o la IA poden aportar valor, però encara no sé on.'],
      ['partner', 'Busco un Partner Data & AI', 'Necessito capacitat recurrent sense construir totes les especialitats internament.'],
    ],
    formLabel: 'EXPLICA’NS EL CONTEXT',
    formTitle: 'Amb unes línies n’hi ha prou.',
    formBody: 'No preparis un briefing perfecte. Què passa avui, què hauria de canviar i per què importa ens dona prou context per començar.',
    name: 'Nom',
    company: 'Empresa',
    email: 'Email',
    message: 'Context',
    placeholder: 'Què està passant avui, què hauria de millorar i quines restriccions o prioritats hem de conèixer...',
    send: 'Enviar context',
    sending: 'Enviant…',
    successTitle: 'Context rebut.',
    success: 'Gràcies. Revisarem el que ens has explicat i continuarem la conversa des d’aquí.',
    error: 'No hem pogut enviar el missatge. Pots tornar-ho a provar o reservar directament una conversa.',
    callLabel: 'PREFEREIXES PARLAR-NE?',
    callTitle: 'Reserva directament 30 minuts.',
    callBody: 'Si és més fàcil explicar-ho parlant, pots reservar una primera conversa. No cal preparar documentació ni tenir una solució definida.',
    calendly: 'Reservar discovery',
    nextLabel: 'QUÈ PASSA DESPRÉS',
    next: [
      'Entenem el problema i la decisió que importa.',
      'Valorem si dades, matemàtiques o IA poden aportar prou valor.',
      'Si té sentit, proposem el següent pas més petit que permeti avançar.',
    ],
  },
  en: {
    eyebrow: 'LET’S TALK',
    title: 'Start with what should work better.',
    intro: 'You do not need to know which technology you need. Tell us what is happening, which decision should improve or which opportunity you want to explore. From there, we decide whether anything is worth building.',
    expectLabel: 'FIRST CONVERSATION',
    expect: [
      ['30 min', 'To understand context, objective and constraints.'],
      ['No cost', 'The first discovery session is free.'],
      ['No commitment', 'If there is no reasonable case, we will say so.'],
    ],
    intentLabel: 'What brings you here?',
    intents: [
      ['problem', 'I have a concrete problem', 'A decision, process or system should work better than it does today.'],
      ['opportunity', 'I want to explore an opportunity', 'I know Data or AI could create value, but I do not yet know where.'],
      ['partner', 'I need a Data & AI Partner', 'I need recurring capability without building every specialism in-house.'],
    ],
    formLabel: 'TELL US THE CONTEXT',
    formTitle: 'A few lines are enough.',
    formBody: 'Do not prepare a perfect brief. What happens today, what should change and why it matters gives us enough context to start.',
    name: 'Name',
    company: 'Company',
    email: 'Email',
    message: 'Context',
    placeholder: 'What is happening today, what should improve and which constraints or priorities should we know...',
    send: 'Send context',
    sending: 'Sending…',
    successTitle: 'Context received.',
    success: 'Thank you. We will review what you shared and continue the conversation from there.',
    error: 'We could not send the message. You can try again or book a conversation directly.',
    callLabel: 'PREFER TO TALK?',
    callTitle: 'Book 30 minutes directly.',
    callBody: 'If it is easier to explain in conversation, book a first call. You do not need documentation or a predefined solution.',
    calendly: 'Book discovery',
    nextLabel: 'WHAT HAPPENS NEXT',
    next: [
      'We understand the problem and the decision that matters.',
      'We assess whether data, mathematics or AI can create enough value.',
      'If it makes sense, we propose the smallest sensible next step.',
    ],
  },
} as const

type IntentKey = 'problem' | 'opportunity' | 'partner'

export default function ContactPage() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]
  const [intent, setIntent] = useState<IntentKey>('problem')
  const [form, setForm] = useState({ name: '', company: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('intent')
    if (requested === 'partner') setIntent('partner')
    if (requested === 'discovery' || requested === 'opportunity') setIntent('opportunity')
  }, [])

  const selectedIntent = useMemo(
    () => t.intents.find(([key]) => key === intent) || t.intents[0],
    [intent, t.intents],
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSending(true)
    setError(false)

    try {
      const message = `${t.intentLabel}: ${selectedIntent[1]}\n\n${form.message}`
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          message,
          language: lang,
          sourcePath: `/contact?intent=${intent}`,
        }),
      })

      if (!response.ok) throw new Error('Request failed')
      window.gtag?.('event', 'contact_form_submitted', {
        language: lang,
        source_path: '/contact',
        contact_intent: intent,
      })
      setSubmitted(true)
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:py-20 lg:grid-cols-[1.08fr_.92fr] lg:items-end">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">{t.eyebrow}</p>
            <h1 className="mt-5 text-5xl leading-[1.04] md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{t.intro}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300">{t.expectLabel}</p>
            <div className="mt-3 divide-y divide-white/10">
              {t.expect.map(([value, body]) => (
                <div key={value} className="grid grid-cols-[105px_1fr] gap-4 py-4">
                  <p className="text-sm font-semibold text-white">{value}</p>
                  <p className="text-sm leading-6 text-slate-400">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">{t.intentLabel}</p>
          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {t.intents.map(([key, title, body]) => {
              const active = intent === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIntent(key as IntentKey)}
                  className={`rounded-xl border p-5 text-left transition ${
                    active
                      ? 'border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/10'
                      : 'border-slate-200 bg-white text-slate-950 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-base font-semibold">{title}</h2>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                      active ? 'border-indigo-300 bg-indigo-300 text-slate-950' : 'border-slate-300 text-transparent'
                    }`}>✓</span>
                  </div>
                  <p className={`mt-3 text-sm leading-6 ${active ? 'text-slate-300' : 'text-slate-500'}`}>{body}</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 md:py-16 lg:grid-cols-[1.12fr_.88fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600">{t.formLabel}</p>
          <h2 className="mt-3 text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.formTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{t.formBody}</p>

          {submitted ? (
            <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
              <p className="font-semibold text-emerald-900">{t.successTitle}</p>
              <p className="mt-2 text-sm leading-7 text-emerald-800">{t.success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  {t.name}
                  <input
                    required
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-normal text-slate-950 outline-none transition focus:border-indigo-400"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  {t.company}
                  <input
                    value={form.company}
                    onChange={(event) => setForm({ ...form, company: event.target.value })}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-normal text-slate-950 outline-none transition focus:border-indigo-400"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                {t.email}
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-normal text-slate-950 outline-none transition focus:border-indigo-400"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                {t.message}
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={(event) => setForm({ ...form, message: event.target.value })}
                  placeholder={t.placeholder}
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 font-normal leading-7 text-slate-950 outline-none transition focus:border-indigo-400"
                />
              </label>

              <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">{selectedIntent[1]}</p>
                <button
                  disabled={sending}
                  className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {sending ? t.sending : t.send}
                </button>
              </div>
              {error && <p className="text-sm text-red-600">{t.error}</p>}
            </form>
          )}
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white md:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300">{t.callLabel}</p>
            <h2 className="mt-3 text-3xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.callTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">{t.callBody}</p>
            <a
              href="https://calendly.com/arnau-sastre-sc-analytics"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              {t.calendly} ↗
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600">{t.nextLabel}</p>
            <div className="mt-4 divide-y divide-slate-200">
              {t.next.map((item, index) => (
                <div key={item} className="grid grid-cols-[36px_1fr] gap-3 py-4">
                  <span className="text-xs font-semibold text-indigo-600">0{index + 1}</span>
                  <p className="text-sm leading-6 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
