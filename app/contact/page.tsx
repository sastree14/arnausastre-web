'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'HABLEMOS',
    title: 'Empecemos por lo que debería funcionar mejor.',
    intro: 'No necesitas saber qué tecnología necesitas. Cuéntanos qué está pasando, qué decisión quieres mejorar o qué oportunidad quieres explorar. A partir de ahí decidimos si merece la pena construir algo.',
    expectLabel: 'PRIMERA CONVERSACIÓN',
    expect: [
      ['30 min', 'Contexto, objetivo y restricciones.'],
      ['Sin coste', 'La primera sesión de discovery no tiene coste.'],
      ['Sin compromiso', 'Si no existe un caso razonable, también te lo diremos.'],
    ],
    intentLabel: '¿QUÉ TE TRAE HASTA AQUÍ?',
    intents: [
      ['problem', 'Tengo un problema concreto', 'Hay una decisión, proceso o sistema que debería funcionar mejor.'],
      ['opportunity', 'Quiero explorar una oportunidad', 'Sé que los datos o la inteligencia artificial pueden aportar valor, pero todavía no sé dónde.'],
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
    callBody: 'Si es más fácil explicarlo hablando, reserva una primera conversación. No necesitas preparar documentación ni tener una solución definida.',
    calendly: 'Reservar discovery',
    nextLabel: 'QUÉ PASA DESPUÉS',
    next: [
      'Entendemos el problema y la decisión que importa.',
      'Valoramos si datos, matemáticas o inteligencia artificial pueden aportar suficiente valor.',
      'Si tiene sentido, proponemos el siguiente paso más pequeño que permita avanzar.',
    ],
    exploreLabel: '¿AÚN NO QUIERES CONTACTAR?',
    exploreTitle: 'Sigue explorando hasta que tengas suficiente contexto.',
    explore: [
      ['Mira nuestros casos', '/projects'],
      ['Lee cómo pensamos', '/knowledge'],
      ['Explora el modelo partner', '/partner-analitico'],
    ],
  },
  ca: {
    eyebrow: 'PARLEM',
    title: 'Comencem pel que hauria de funcionar millor.',
    intro: 'No cal saber quina tecnologia necessites. Explica’ns què està passant, quina decisió vols millorar o quina oportunitat vols explorar. A partir d’aquí decidim si val la pena construir alguna cosa.',
    expectLabel: 'PRIMERA CONVERSA',
    expect: [
      ['30 min', 'Context, objectiu i restriccions.'],
      ['Sense cost', 'La primera sessió de discovery no té cost.'],
      ['Sense compromís', 'Si no existeix un cas raonable, també t’ho direm.'],
    ],
    intentLabel: 'QUÈ ET PORTA FINS AQUÍ?',
    intents: [
      ['problem', 'Tinc un problema concret', 'Hi ha una decisió, procés o sistema que hauria de funcionar millor.'],
      ['opportunity', 'Vull explorar una oportunitat', 'Sé que les dades o la intel·ligència artificial poden aportar valor, però encara no sé on.'],
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
    callBody: 'Si és més fàcil explicar-ho parlant, reserva una primera conversa. No cal preparar documentació ni tenir una solució definida.',
    calendly: 'Reservar discovery',
    nextLabel: 'QUÈ PASSA DESPRÉS',
    next: [
      'Entenem el problema i la decisió que importa.',
      'Valorem si dades, matemàtiques o intel·ligència artificial poden aportar prou valor.',
      'Si té sentit, proposem el següent pas més petit que permeti avançar.',
    ],
    exploreLabel: 'ENCARA NO VOLS CONTACTAR?',
    exploreTitle: 'Continua explorant fins que tinguis prou context.',
    explore: [
      ['Mira els nostres casos', '/projects'],
      ['Llegeix com pensem', '/knowledge'],
      ['Explora el model partner', '/partner-analitico'],
    ],
  },
  en: {
    eyebrow: 'LET’S TALK',
    title: 'Start with what should work better.',
    intro: 'You do not need to know which technology you need. Tell us what is happening, which decision should improve or which opportunity you want to explore. From there, we decide whether anything is worth building.',
    expectLabel: 'FIRST CONVERSATION',
    expect: [
      ['30 min', 'Context, objective and constraints.'],
      ['No cost', 'The first discovery session is free.'],
      ['No commitment', 'If there is no reasonable case, we will say so.'],
    ],
    intentLabel: 'WHAT BRINGS YOU HERE?',
    intents: [
      ['problem', 'I have a concrete problem', 'A decision, process or system should work better than it does today.'],
      ['opportunity', 'I want to explore an opportunity', 'I know data or artificial intelligence could create value, but I do not yet know where.'],
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
      'We assess whether data, mathematics or artificial intelligence can create enough value.',
      'If it makes sense, we propose the smallest sensible next step.',
    ],
    exploreLabel: 'NOT READY TO CONTACT US YET?',
    exploreTitle: 'Keep exploring until you have enough context.',
    explore: [
      ['Browse our case studies', '/projects'],
      ['Read how we think', '/knowledge'],
      ['Explore the partner model', '/partner-analitico'],
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
    <main className="bg-[#FAFAF7] text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:py-20 lg:grid-cols-[1.08fr_.92fr] lg:items-stretch">
          <div className="flex flex-col justify-end">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">{t.eyebrow}</p>
            <h1 className="mt-5 text-[44px] leading-[1.04] tracking-[-0.03em] sm:text-[56px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
            <p className="mt-6 max-w-3xl text-[17px] leading-8 text-[#EAF0F6]">{t.intro}</p>
          </div>

          <aside className="flex h-full flex-col border-y border-[#5E86A8] py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{t.expectLabel}</p>
            <div className="mt-3 grid flex-1 grid-rows-3 border-t border-[#496C8A]">
              {t.expect.map(([value, body]) => (
                <div key={value} className="grid min-h-[72px] grid-cols-[110px_1fr] items-center gap-4 border-b border-[#496C8A] py-3.5">
                  <p className="text-[14px] font-semibold text-white">{value}</p>
                  <p className="text-[13px] leading-5 text-[#A8BACB]">{body}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.intentLabel}</p>
          <div className="mt-5 grid border-l border-t border-slate-300 lg:grid-cols-3">
            {t.intents.map(([key, title, body], index) => {
              const active = intent === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIntent(key as IntentKey)}
                  className={`min-h-[160px] border-b border-r border-slate-300 p-5 text-left transition ${
                    active ? 'bg-[#0D1B2A] text-white' : index === 1 ? 'bg-[#F4F1EA] text-slate-950 hover:bg-[#EEEAE1]' : 'bg-white text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className={`font-mono text-[11px] ${active ? 'text-[#7A7DFF]' : 'text-indigo-700'}`}>0{index + 1}</p>
                    <span className={`text-[12px] font-semibold ${active ? 'text-[#A8BACB]' : 'text-slate-300'}`}>{active ? '✓' : '→'}</span>
                  </div>
                  <h2 className={`mt-5 text-[19px] font-semibold ${active ? 'text-white' : 'text-slate-950'}`}>{title}</h2>
                  <p className={`mt-3 text-[13px] leading-6 ${active ? 'text-[#A8BACB]' : 'text-slate-600'}`}>{body}</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#FAFAF7]">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-12 md:py-16 lg:grid-cols-[1.1fr_.9fr]">
          <div className="border border-slate-300 bg-white p-6 md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.formLabel}</p>
            <h2 className="mt-3 text-[32px] leading-[1.08] sm:text-[38px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.formTitle}</h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-7 text-slate-600">{t.formBody}</p>

            {submitted ? (
              <div className="mt-8 border border-emerald-300 bg-emerald-50 p-6">
                <p className="font-semibold text-emerald-900">{t.successTitle}</p>
                <p className="mt-2 text-[14px] leading-7 text-emerald-800">{t.success}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-[13px] font-semibold text-slate-700">
                    {t.name}
                    <input
                      required
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      className="mt-2 w-full border border-slate-300 bg-white px-4 py-3 font-normal text-slate-950 outline-none transition focus:border-indigo-500"
                    />
                  </label>
                  <label className="text-[13px] font-semibold text-slate-700">
                    {t.company}
                    <input
                      value={form.company}
                      onChange={(event) => setForm({ ...form, company: event.target.value })}
                      className="mt-2 w-full border border-slate-300 bg-white px-4 py-3 font-normal text-slate-950 outline-none transition focus:border-indigo-500"
                    />
                  </label>
                </div>

                <label className="block text-[13px] font-semibold text-slate-700">
                  {t.email}
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    className="mt-2 w-full border border-slate-300 bg-white px-4 py-3 font-normal text-slate-950 outline-none transition focus:border-indigo-500"
                  />
                </label>

                <label className="block text-[13px] font-semibold text-slate-700">
                  {t.message}
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    placeholder={t.placeholder}
                    className="mt-2 w-full resize-none border border-slate-300 bg-white px-4 py-3 font-normal leading-7 text-slate-950 outline-none transition focus:border-indigo-500"
                  />
                </label>

                <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">{selectedIntent[1]}</p>
                  <button
                    disabled={sending}
                    className="bg-slate-950 px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {sending ? t.sending : t.send}
                  </button>
                </div>
                {error && <p className="text-[13px] text-red-600">{t.error}</p>}
              </form>
            )}
          </div>

          <aside className="space-y-5">
            <div className="border border-[#496C8A] bg-[#0D1B2A] p-6 text-white md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{t.callLabel}</p>
              <h2 className="mt-3 text-[30px] leading-[1.08]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.callTitle}</h2>
              <p className="mt-4 text-[14px] leading-7 text-[#A8BACB]">{t.callBody}</p>
              <a
                href="https://calendly.com/arnau-sastre-sc-analytics"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center bg-white px-5 py-3 text-[13px] font-semibold text-[#0D1B2A] transition hover:bg-[#EAF0F6]"
              >
                {t.calendly} ↗
              </a>
            </div>

            <div className="border border-slate-300 bg-[#F4F1EA] p-6 md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.nextLabel}</p>
              <div className="mt-4 border-t border-slate-300">
                {t.next.map((item, index) => (
                  <div key={item} className="grid grid-cols-[36px_1fr] gap-3 border-b border-slate-300 py-4">
                    <span className="font-mono text-[11px] text-indigo-700">0{index + 1}</span>
                    <p className="text-[13px] leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto grid max-w-7xl gap-7 px-6 py-10 lg:grid-cols-[190px_1fr] lg:gap-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.exploreLabel}</p>
          <div>
            <h2 className="text-[28px] leading-[1.08] sm:text-[34px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.exploreTitle}</h2>
            <div className="mt-6 grid border-t border-slate-300 md:grid-cols-3 md:divide-x md:divide-slate-300">
              {t.explore.map(([label, href]) => (
                <Link key={href} href={href} className="group flex items-center justify-between border-b border-slate-300 py-4 text-[13px] font-semibold text-slate-900 md:px-5 md:first:pl-0">
                  {label}<span className="text-indigo-700 transition group-hover:translate-x-1">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
