'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'HABLEMOS',
    title: 'Empecemos por lo que debería funcionar mejor.',
    intro: 'Cuéntanos qué quieres mejorar o qué oportunidad estás valorando. Nosotros vemos contigo si podemos aportar valor y cuál sería el siguiente paso.',

    expectLabel: 'PRIMERA CONVERSACIÓN',
    expect: [
      ['30 minutos', 'Alineamos contexto, objetivo y prioridad.'],
      ['Sin coste', 'Primera conversación gratuita.'],
      ['Sin compromiso', 'Sin obligación de continuar.'],
    ],

    intentLabel: '¿QUÉ TE TRAE HASTA AQUÍ?',
    intents: [
      ['problem', 'Tengo un problema concreto', 'Hay una decisión, proceso o sistema que debería funcionar mejor.'],
      ['opportunity', 'Quiero explorar una oportunidad', 'Veo potencial en datos o IA, pero todavía no está claro dónde capturar más valor.'],
      ['partner', 'Busco un Partner Data & AI', 'Quiero ampliar capacidad especializada con un modelo de colaboración continuada.'],
    ],

    intentForms: {
      problem: {
        label: 'CUÉNTANOS EL PROBLEMA',
        title: 'Danos el contexto para entender qué debe cambiar.',
        message: 'Problema o situación actual',
        placeholder: '¿Qué está ocurriendo hoy? ¿Qué debería funcionar mejor? ¿Qué impacto está teniendo en el negocio?',
        prompts: ['Qué ocurre hoy', 'Qué decisión, proceso o sistema está afectado', 'Qué resultado debería mejorar'],
      },
      opportunity: {
        label: 'CUÉNTANOS LA OPORTUNIDAD',
        title: 'Explícanos dónde ves potencial y qué quieres valorar.',
        message: 'Oportunidad a explorar',
        placeholder: '¿Dónde ves una oportunidad? ¿Qué objetivo empresarial te gustaría mejorar? ¿Qué datos, procesos o capacidades existen hoy?',
        prompts: ['Dónde está la oportunidad', 'Qué objetivo quieres mejorar', 'Qué datos o capacidades existen hoy'],
      },
      partner: {
        label: 'CUÉNTANOS EL CONTEXTO DE COLABORACIÓN',
        title: 'Cuéntanos qué capacidad quieres reforzar.',
        message: 'Contexto del modelo partner',
        placeholder: '¿Qué equipo tenéis hoy? ¿Qué capacidades queréis reforzar? ¿Qué tipo de necesidades aparecen de forma recurrente?',
        prompts: ['Qué capacidades tenéis hoy', 'Qué especialidad queréis reforzar', 'Qué necesidades aparecen de forma recurrente'],
      },
    },

    name: 'Nombre',
    company: 'Empresa',
    email: 'Email',
    send: 'Enviar contexto',
    sending: 'Enviando…',
    successTitle: 'Contexto recibido.',
    success: 'Gracias. Revisaremos lo que nos has contado y continuaremos la conversación desde ahí.',
    error: 'No hemos podido enviar el mensaje. Puedes volver a intentarlo o reservar directamente una conversación.',

    callLabel: '¿PREFIERES HABLARLO?',
    callTitle: 'Reserva directamente 30 minutos.',
    callBody: 'Si prefieres explicarlo hablando, reserva 30 minutos. No necesitas llegar con una solución definida.',
    calendly: 'Reservar discovery',

    nextLabel: 'PRÓXIMOS PASOS',
    next: [
      ['01', 'Revisamos el contexto', 'Identificamos la prioridad, la decisión y el resultado que importa.'],
      ['02', 'Definimos el encaje', 'Valoramos enfoque, alcance y criterios de éxito.'],
      ['03', 'Proponemos un primer paso', 'Si existe un caso razonable, planteamos una forma concreta de avanzar.'],
    ],
  },

  ca: {
    eyebrow: 'PARLEM',
    title: 'Comencem pel que hauria de funcionar millor.',
    intro: 'Explica’ns què vols millorar o quina oportunitat estàs valorant. Nosaltres veiem amb tu si podem aportar valor i quin seria el següent pas.',

    expectLabel: 'PRIMERA CONVERSA',
    expect: [
      ['30 minuts', 'Alineem context, objectiu i prioritat.'],
      ['Sense cost', 'Primera conversa gratuïta.'],
      ['Sense compromís', 'Sense obligació de continuar.'],
    ],

    intentLabel: 'QUÈ ET PORTA FINS AQUÍ?',
    intents: [
      ['problem', 'Tinc un problema concret', 'Hi ha una decisió, procés o sistema que hauria de funcionar millor.'],
      ['opportunity', 'Vull explorar una oportunitat', 'Veig potencial en dades o IA, però encara no és clar on capturar més valor.'],
      ['partner', 'Busco un Partner Data & AI', 'Vull ampliar capacitat especialitzada amb un model de col·laboració continuada.'],
    ],

    intentForms: {
      problem: {
        label: 'EXPLICA’NS EL PROBLEMA',
        title: 'Dona’ns el context per entendre què ha de canviar.',
        message: 'Problema o situació actual',
        placeholder: 'Què està passant avui? Què hauria de funcionar millor? Quin impacte està tenint en el negoci?',
        prompts: ['Què passa avui', 'Quina decisió, procés o sistema està afectat', 'Quin resultat hauria de millorar'],
      },
      opportunity: {
        label: 'EXPLICA’NS L’OPORTUNITAT',
        title: 'Explica’ns on veus potencial i què vols valorar.',
        message: 'Oportunitat a explorar',
        placeholder: 'On veus una oportunitat? Quin objectiu empresarial t’agradaria millorar? Quines dades, processos o capacitats existeixen avui?',
        prompts: ['On és l’oportunitat', 'Quin objectiu vols millorar', 'Quines dades o capacitats existeixen avui'],
      },
      partner: {
        label: 'EXPLICA’NS EL CONTEXT DE COL·LABORACIÓ',
        title: 'Explica’ns quina capacitat vols reforçar.',
        message: 'Context del model partner',
        placeholder: 'Quin equip teniu avui? Quines capacitats voleu reforçar? Quin tipus de necessitats apareixen de manera recurrent?',
        prompts: ['Quines capacitats teniu avui', 'Quina especialitat voleu reforçar', 'Quines necessitats apareixen de manera recurrent'],
      },
    },

    name: 'Nom',
    company: 'Empresa',
    email: 'Email',
    send: 'Enviar context',
    sending: 'Enviant…',
    successTitle: 'Context rebut.',
    success: 'Gràcies. Revisarem el que ens has explicat i continuarem la conversa des d’aquí.',
    error: 'No hem pogut enviar el missatge. Pots tornar-ho a provar o reservar directament una conversa.',

    callLabel: 'PREFEREIXES PARLAR-NE?',
    callTitle: 'Reserva directament 30 minuts.',
    callBody: 'Si prefereixes explicar-ho parlant, reserva 30 minuts. No cal arribar amb una solució definida.',
    calendly: 'Reservar discovery',

    nextLabel: 'PRÒXIMS PASSOS',
    next: [
      ['01', 'Revisem el context', 'Identifiquem la prioritat, la decisió i el resultat que importa.'],
      ['02', 'Definim l’encaix', 'Valorem enfocament, abast i criteris d’èxit.'],
      ['03', 'Proposem un primer pas', 'Si existeix un cas raonable, plantegem una manera concreta d’avançar.'],
    ],
  },

  en: {
    eyebrow: 'LET’S TALK',
    title: 'Start with what should work better.',
    intro: 'Tell us what you want to improve or which opportunity you are considering. We will assess whether we can create value and what the next step should be.',

    expectLabel: 'FIRST CONVERSATION',
    expect: [
      ['30 minutes', 'Align the context, objective and priority.'],
      ['No cost', 'First conversation is free.'],
      ['No commitment', 'No obligation to continue.'],
    ],

    intentLabel: 'WHAT BRINGS YOU HERE?',
    intents: [
      ['problem', 'I have a concrete problem', 'A decision, process or system should work better than it does today.'],
      ['opportunity', 'I want to explore an opportunity', 'I see potential in data or AI, but the highest-value opportunity is not yet clear.'],
      ['partner', 'I need a Data & AI Partner', 'I want to extend specialist capability through an ongoing collaboration model.'],
    ],

    intentForms: {
      problem: {
        label: 'TELL US ABOUT THE PROBLEM',
        title: 'Give us the context to understand what needs to change.',
        message: 'Problem or current situation',
        placeholder: 'What is happening today? What should work better? What business impact is it creating?',
        prompts: ['What is happening today', 'Which decision, process or system is affected', 'Which outcome should improve'],
      },
      opportunity: {
        label: 'TELL US ABOUT THE OPPORTUNITY',
        title: 'Tell us where you see potential and what you want to assess.',
        message: 'Opportunity to explore',
        placeholder: 'Where do you see an opportunity? Which business objective would you like to improve? What data, processes or capabilities exist today?',
        prompts: ['Where the opportunity is', 'Which objective should improve', 'What data or capabilities exist today'],
      },
      partner: {
        label: 'TELL US ABOUT THE COLLABORATION CONTEXT',
        title: 'Tell us which capability you want to strengthen.',
        message: 'Partner-model context',
        placeholder: 'What team do you have today? Which capabilities do you want to strengthen? What needs recur over time?',
        prompts: ['Which capabilities you have today', 'Which specialism you want to strengthen', 'Which needs recur over time'],
      },
    },

    name: 'Name',
    company: 'Company',
    email: 'Email',
    send: 'Send context',
    sending: 'Sending…',
    successTitle: 'Context received.',
    success: 'Thank you. We will review what you shared and continue the conversation from there.',
    error: 'We could not send the message. You can try again or book a conversation directly.',

    callLabel: 'PREFER TO TALK?',
    callTitle: 'Book 30 minutes directly.',
    callBody: 'If you would rather explain it in conversation, book 30 minutes. You do not need a predefined solution.',
    calendly: 'Book discovery',

    nextLabel: 'NEXT STEPS',
    next: [
      ['01', 'We review the context', 'We identify the priority, the decision and the outcome that matters.'],
      ['02', 'We define the fit', 'We assess the approach, scope and success criteria.'],
      ['03', 'We propose a first step', 'If there is a sensible case, we outline a concrete way to move forward.'],
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

  const selectedForm = t.intentForms[intent]

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
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 md:py-16 lg:grid-cols-[1.08fr_.92fr] lg:items-start">
          <div>
            <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">{t.eyebrow}</p>
            <h1 className="mt-4 text-[46px] leading-[1.04] tracking-[-0.03em] sm:text-[58px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
            <p className="mt-5 max-w-3xl text-[19px] leading-8 text-[#EAF0F6]">{t.intro}</p>
          </div>

          <aside>
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{t.expectLabel}</p>
            <div className="mt-4">
              {t.expect.map(([value, body], index) => (
                <div
                  key={value}
                  className={`grid min-h-[76px] grid-cols-[150px_1fr] items-center gap-5 border-t border-[#496C8A] py-4 ${index === t.expect.length - 1 ? 'border-b' : ''}`}
                >
                  <p className="whitespace-nowrap text-[17px] font-semibold text-white">{value}</p>
                  <p className="text-[16px] leading-6 text-[#D5E1EB]">{body}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-12">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.intentLabel}</p>
          <div className="mt-5 grid border-l border-t border-slate-300 lg:grid-cols-3">
            {t.intents.map(([key, title, body], index) => {
              const active = intent === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIntent(key as IntentKey)}
                  className={`min-h-[165px] border-b border-r border-slate-300 p-5 text-left transition ${active ? 'bg-[#0D1B2A] text-white' : index === 1 ? 'bg-[#F4F1EA] text-slate-950 hover:bg-[#EEEAE1]' : 'bg-white text-slate-950 hover:bg-slate-50'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className={`font-mono text-[12px] ${active ? 'text-[#7A7DFF]' : 'text-indigo-700'}`}>0{index + 1}</p>
                    <span className={`text-[12px] font-semibold ${active ? 'text-[#A8BACB]' : 'text-slate-300'}`}>{active ? '✓' : '→'}</span>
                  </div>
                  <h2 className={`mt-5 text-[22px] font-semibold ${active ? 'text-white' : 'text-slate-950'}`}>{title}</h2>
                  <p className={`mt-3 text-[16px] leading-7 ${active ? 'text-[#A8BACB]' : 'text-slate-600'}`}>{body}</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#FAFAF7]">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-12 md:py-16 lg:grid-cols-[1.1fr_.9fr]">
          <div className="border border-slate-300 bg-white p-6 md:p-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{selectedForm.label}</p>
            <h2 className="mt-3 text-[32px] leading-[1.08] sm:text-[38px]" style={{ fontFamily: 'var(--font-playfair)' }}>{selectedForm.title}</h2>

            {submitted ? (
              <div className="mt-8 border border-emerald-300 bg-emerald-50 p-6">
                <p className="font-semibold text-emerald-900">{t.successTitle}</p>
                <p className="mt-2 text-[16px] leading-7 text-emerald-800">{t.success}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-[15px] font-semibold text-slate-700">
                    {t.name}
                    <input
                      required
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      className="mt-2 w-full border border-slate-300 bg-white px-4 py-3 font-normal text-slate-950 outline-none transition focus:border-indigo-500"
                    />
                  </label>
                  <label className="text-[15px] font-semibold text-slate-700">
                    {t.company}
                    <input
                      value={form.company}
                      onChange={(event) => setForm({ ...form, company: event.target.value })}
                      className="mt-2 w-full border border-slate-300 bg-white px-4 py-3 font-normal text-slate-950 outline-none transition focus:border-indigo-500"
                    />
                  </label>
                </div>

                <label className="block text-[15px] font-semibold text-slate-700">
                  {t.email}
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    className="mt-2 w-full border border-slate-300 bg-white px-4 py-3 font-normal text-slate-950 outline-none transition focus:border-indigo-500"
                  />
                </label>

                <div className="border-y border-slate-300 bg-[#FAFAF7]">
                  {selectedForm.prompts.map((prompt, index) => (
                    <div key={prompt} className="grid min-h-[52px] grid-cols-[44px_1fr] items-center gap-4 border-b border-slate-200 px-4 py-3 last:border-b-0">
                      <span className="font-mono text-[12px] font-semibold text-indigo-700">{String(index + 1).padStart(2, '0')}</span>
                      <p className="text-[15px] font-medium leading-6 text-slate-700">{prompt}</p>
                    </div>
                  ))}
                </div>

                <label className="block text-[15px] font-semibold text-slate-700">
                  {selectedForm.message}
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    placeholder={selectedForm.placeholder}
                    className="mt-2 w-full resize-none border border-slate-300 bg-white px-4 py-3 font-normal leading-7 text-slate-950 outline-none transition focus:border-indigo-500"
                  />
                </label>

                <div className="flex justify-end border-t border-slate-200 pt-5">
                  <button
                    disabled={sending}
                    className="bg-slate-950 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {sending ? t.sending : t.send}
                  </button>
                </div>
                {error && <p className="text-[15px] text-red-600">{t.error}</p>}
              </form>
            )}
          </div>

          <aside className="space-y-5">
            <div className="border border-[#496C8A] bg-[#0D1B2A] p-6 text-white md:p-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{t.callLabel}</p>
              <h2 className="mt-3 text-[30px] leading-[1.08]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.callTitle}</h2>
              <p className="mt-4 text-[16px] leading-7 text-[#D5E1EB]">{t.callBody}</p>
              <a
                href="https://calendly.com/arnau-sastre-sc-analytics"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center bg-white px-5 py-3 text-[15px] font-semibold text-[#0D1B2A] transition hover:bg-[#EAF0F6]"
              >
                {t.calendly} ↗
              </a>
            </div>

            <div className="border border-slate-300 bg-[#F4F1EA] p-6 md:p-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.nextLabel}</p>
              <div className="mt-5 border-y border-slate-300">
                {t.next.map(([number, title, body], index) => (
                  <div
                    key={number}
                    className={`grid min-h-[118px] grid-cols-[56px_1fr] items-center gap-4 py-5 ${index < t.next.length - 1 ? 'border-b border-slate-300' : ''}`}
                  >
                    <span className="font-mono text-[20px] font-semibold text-indigo-700">{number}</span>
                    <div>
                      <p className="text-[18px] font-semibold text-slate-950">{title}</p>
                      <p className="mt-2 text-[16px] leading-7 text-slate-600">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
