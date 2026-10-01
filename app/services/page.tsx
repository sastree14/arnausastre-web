'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'CÓMO TRABAJAMOS',
    title: 'Del problema de negocio a un sistema que se utiliza de verdad.',
    intro: 'No empezamos por una herramienta. Definimos qué debería mejorar, qué decisión importa, qué restricciones existen y qué solución merece la pena construir.',
    cta: 'Hablar de un problema',
    processLabel: 'PROCESO',
    processTitle: 'Cuatro pasos. Una lógica: comprender antes de construir.',
    steps: [
      ['01', 'Entender', 'Objetivo, decisión, usuarios, restricciones, datos y economía del problema.'],
      ['02', 'Diseñar', 'Alternativas, alcance, arquitectura y criterio de éxito antes de desarrollar.'],
      ['03', 'Construir', 'Un sistema usable, integrado y validado en el contexto real de trabajo.'],
      ['04', 'Medir', 'Impacto, limitaciones y siguientes mejoras solo cuando la evidencia las justifica.'],
    ],
    capabilitiesLabel: 'QUÉ PODEMOS ACTIVAR',
    capabilitiesTitle: 'La capacidad cambia según el problema.',
    capabilitiesIntro: 'Selecciona una línea para ver cuándo suele tener sentido y qué podemos construir alrededor de ella.',
    capabilities: [
      ['Forecasting & planning', 'Cuando necesitas anticipar demanda, ventas, carga, caja o capacidad y convertir esa previsión en una decisión.', ['Demand forecasting', 'Financial forecasting', 'Inventory planning', 'Scenario planning']],
      ['Optimización & OR', 'Cuando existe una decisión de asignación con restricciones, costes y múltiples alternativas posibles.', ['Routing', 'Scheduling', 'Facility location', 'Capacity allocation']],
      ['Machine learning', 'Cuando una predicción o clasificación cambia una acción y el coste del error puede medirse.', ['Risk scoring', 'Propensity', 'Anomaly detection', 'Predictive systems']],
      ['AI & automation', 'Cuando un proceso requiere contexto, repetición y coordinación entre datos, reglas, documentos o personas.', ['AI agents', 'Document workflows', 'Operational copilots', 'Approvals']],
      ['Analytics & BI', 'Cuando el problema es saber qué está pasando, por qué y qué debería hacerse después.', ['KPI systems', 'Management reporting', 'Decision dashboards', 'What-if analysis']],
      ['Simulation & modelling', 'Cuando conviene probar escenarios y trade-offs antes de cambiar una operación real.', ['Simulation', 'Queueing', 'Markov models', 'Scenario modelling']],
    ],
    modelsLabel: 'FORMAS DE TRABAJAR',
    modelsTitle: 'La relación también se adapta al problema.',
    models: [
      ['Proyecto definido', 'Un objetivo, un alcance y un resultado concreto. Ideal cuando existe un problema claro que resolver.', 'Ver casos', '/projects'],
      ['Partner Data & AI', 'Capacidad recurrente para empresas que quieren continuidad sin construir todas las especialidades internamente.', 'Ver modelo partner', '/partner-analitico'],
      ['Discovery / diagnóstico', 'Cuando todavía no sabes qué solución necesitas. Empezamos identificando dónde existe valor y qué no merece la pena construir.', 'Reservar discovery', '/contact?intent=discovery'],
    ],
    noBuild: 'Si una solución más simple resuelve el problema, si los datos no sostienen el caso o si el retorno no compensa la complejidad, la recomendación correcta puede ser no construir.',
    finalTitle: 'Trae el problema. La tecnología viene después.',
    finalBody: 'Una primera conversación sirve para entender si existe una oportunidad real y cuál sería el siguiente paso proporcional.',
    finalCta: 'Empezar una conversación',
  },
  ca: {
    eyebrow: 'COM TREBALLEM',
    title: 'Del problema de negoci a un sistema que s’utilitza de veritat.',
    intro: 'No comencem per una eina. Definim què hauria de millorar, quina decisió importa, quines restriccions existeixen i quina solució val la pena construir.',
    cta: 'Parlar d’un problema',
    processLabel: 'PROCÉS',
    processTitle: 'Quatre passos. Una lògica: comprendre abans de construir.',
    steps: [
      ['01', 'Entendre', 'Objectiu, decisió, usuaris, restriccions, dades i economia del problema.'],
      ['02', 'Dissenyar', 'Alternatives, abast, arquitectura i criteri d’èxit abans de desenvolupar.'],
      ['03', 'Construir', 'Un sistema usable, integrat i validat en el context real de treball.'],
      ['04', 'Mesurar', 'Impacte, limitacions i següents millores només quan l’evidència les justifica.'],
    ],
    capabilitiesLabel: 'QUÈ PODEM ACTIVAR',
    capabilitiesTitle: 'La capacitat canvia segons el problema.',
    capabilitiesIntro: 'Selecciona una línia per veure quan sol tenir sentit i què podem construir al seu voltant.',
    capabilities: [
      ['Forecasting & planning', 'Quan cal anticipar demanda, vendes, càrrega, caixa o capacitat i convertir la previsió en una decisió.', ['Demand forecasting', 'Financial forecasting', 'Inventory planning', 'Scenario planning']],
      ['Optimització & OR', 'Quan existeix una decisió d’assignació amb restriccions, costos i múltiples alternatives possibles.', ['Routing', 'Scheduling', 'Facility location', 'Capacity allocation']],
      ['Machine learning', 'Quan una predicció o classificació canvia una acció i el cost de l’error es pot mesurar.', ['Risk scoring', 'Propensity', 'Anomaly detection', 'Predictive systems']],
      ['AI & automation', 'Quan un procés requereix context, repetició i coordinació entre dades, regles, documents o persones.', ['AI agents', 'Document workflows', 'Operational copilots', 'Approvals']],
      ['Analytics & BI', 'Quan el problema és saber què passa, per què i què s’hauria de fer després.', ['KPI systems', 'Management reporting', 'Decision dashboards', 'What-if analysis']],
      ['Simulation & modelling', 'Quan convé provar escenaris i trade-offs abans de canviar una operació real.', ['Simulation', 'Queueing', 'Markov models', 'Scenario modelling']],
    ],
    modelsLabel: 'FORMES DE TREBALLAR',
    modelsTitle: 'La relació també s’adapta al problema.',
    models: [
      ['Projecte definit', 'Un objectiu, un abast i un resultat concret. Ideal quan existeix un problema clar per resoldre.', 'Veure casos', '/projects'],
      ['Partner Data & AI', 'Capacitat recurrent per a empreses que volen continuïtat sense construir totes les especialitats internament.', 'Veure model partner', '/partner-analitico'],
      ['Discovery / diagnòstic', 'Quan encara no saps quina solució necessites. Comencem identificant on existeix valor i què no val la pena construir.', 'Reservar discovery', '/contact?intent=discovery'],
    ],
    noBuild: 'Si una solució més simple resol el problema, si les dades no sostenen el cas o si el retorn no compensa la complexitat, la recomanació correcta pot ser no construir.',
    finalTitle: 'Porta el problema. La tecnologia ve després.',
    finalBody: 'Una primera conversa serveix per entendre si existeix una oportunitat real i quin seria el següent pas proporcional.',
    finalCta: 'Començar una conversa',
  },
  en: {
    eyebrow: 'HOW WE WORK',
    title: 'From a business problem to a system people actually use.',
    intro: 'We do not start with a tool. We define what should improve, which decision matters, what constraints exist and which solution is worth building.',
    cta: 'Discuss a problem',
    processLabel: 'PROCESS',
    processTitle: 'Four steps. One principle: understand before building.',
    steps: [
      ['01', 'Understand', 'Objective, decision, users, constraints, data and the economics of the problem.'],
      ['02', 'Design', 'Alternatives, scope, architecture and success criteria before development begins.'],
      ['03', 'Build', 'A usable, integrated system validated in the real operating context.'],
      ['04', 'Measure', 'Impact, limitations and further improvements only where the evidence supports them.'],
    ],
    capabilitiesLabel: 'WHAT WE CAN ACTIVATE',
    capabilitiesTitle: 'The capability changes with the problem.',
    capabilitiesIntro: 'Select a line to see when it tends to make sense and what can be built around it.',
    capabilities: [
      ['Forecasting & planning', 'When you need to anticipate demand, sales, workload, cash or capacity and turn that forecast into a decision.', ['Demand forecasting', 'Financial forecasting', 'Inventory planning', 'Scenario planning']],
      ['Optimisation & OR', 'When an allocation decision involves constraints, costs and multiple possible alternatives.', ['Routing', 'Scheduling', 'Facility location', 'Capacity allocation']],
      ['Machine learning', 'When a prediction or classification changes an action and the cost of error can be measured.', ['Risk scoring', 'Propensity', 'Anomaly detection', 'Predictive systems']],
      ['AI & automation', 'When a process requires context, repetition and coordination between data, rules, documents or people.', ['AI agents', 'Document workflows', 'Operational copilots', 'Approvals']],
      ['Analytics & BI', 'When the problem is understanding what is happening, why and what should happen next.', ['KPI systems', 'Management reporting', 'Decision dashboards', 'What-if analysis']],
      ['Simulation & modelling', 'When scenarios and trade-offs should be tested before changing the real operation.', ['Simulation', 'Queueing', 'Markov models', 'Scenario modelling']],
    ],
    modelsLabel: 'WAYS TO WORK TOGETHER',
    modelsTitle: 'The engagement adapts to the problem too.',
    models: [
      ['Defined project', 'One objective, one scope and a concrete outcome. Best when there is a clear problem to solve.', 'See case studies', '/projects'],
      ['Data & AI Partner', 'Ongoing capability for companies that want continuity without building every specialism in-house.', 'Explore partner model', '/partner-analitico'],
      ['Discovery / diagnostic', 'When the solution is not yet clear. We start by identifying where value exists and what should not be built.', 'Book discovery', '/contact?intent=discovery'],
    ],
    noBuild: 'If a simpler change solves the problem, the data does not support the case or the expected return does not justify the complexity, the correct recommendation may be not to build.',
    finalTitle: 'Bring the problem. Technology comes later.',
    finalBody: 'A first conversation is enough to understand whether a real opportunity exists and what a proportionate next step would look like.',
    finalCta: 'Start a conversation',
  },
} as const

export default function ServicesPage() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]
  const [selected, setSelected] = useState(0)
  const capability = t.capabilities[selected]

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 md:py-20 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">{t.eyebrow}</p>
            <h1 className="mt-5 text-5xl leading-[1.05] md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{t.intro}</p>
          </div>
          <Link href="/contact?intent=discovery" className="inline-flex shrink-0 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">{t.cta}</Link>
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">{t.processLabel}</p>
          <h2 className="mt-4 max-w-3xl text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.processTitle}</h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 md:grid-cols-4">
            {t.steps.map(([number, title, body]) => (
              <article key={number} className="bg-white p-6">
                <p className="text-xs font-semibold text-indigo-600">{number}</p>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">{t.capabilitiesLabel}</p>
            <h2 className="mt-4 text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.capabilitiesTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{t.capabilitiesIntro}</p>
          </div>

          <div className="mt-8 grid overflow-hidden rounded-2xl border border-slate-200 bg-white lg:grid-cols-[.4fr_.6fr]">
            <div className="border-b border-slate-200 p-3 lg:border-b-0 lg:border-r">
              {t.capabilities.map(([title], index) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => setSelected(index)}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition ${
                    selected === index ? 'bg-slate-950 font-semibold text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <span>{title}</span>
                  <span className={selected === index ? 'text-indigo-300' : 'text-slate-300'}>→</span>
                </button>
              ))}
            </div>
            <div className="min-h-[330px] p-7 md:p-10">
              <p className="text-xs font-semibold text-indigo-600">0{selected + 1}</p>
              <h3 className="mt-4 text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{capability[0]}</h3>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">{capability[1]}</p>
              <div className="mt-7 flex flex-wrap gap-2">
                {capability[2].map((item) => <span key={item} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">{item}</span>)}
              </div>
            </div>
          </div>

          <p className="mt-5 max-w-4xl border-l-2 border-indigo-500 pl-5 text-sm leading-7 text-slate-500">{t.noBuild}</p>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">{t.modelsLabel}</p>
          <h2 className="mt-4 text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.modelsTitle}</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {t.models.map(([title, body, button, href]) => (
              <article key={title} className="flex min-h-[260px] flex-col rounded-2xl border border-slate-200 p-7">
                <h3 className="text-2xl" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">{body}</p>
                <Link href={href} className="mt-6 text-sm font-semibold text-indigo-700 hover:text-indigo-900">{button} →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.finalTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">{t.finalBody}</p>
          </div>
          <Link href="/contact?intent=discovery" className="inline-flex shrink-0 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">{t.finalCta}</Link>
        </div>
      </section>
    </main>
  )
}
