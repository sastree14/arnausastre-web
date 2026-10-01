'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'DATA · MATEMÁTICAS · IA',
    title: 'Convertimos datos e IA en decisiones que mejoran el negocio.',
    intro: 'Entramos donde una decisión, un proceso o un sistema puede funcionar mejor. Entendemos el problema, elegimos la capacidad adecuada y construimos solo lo que aporta valor real.',
    primary: 'Cuéntanos qué quieres mejorar',
    secondary: 'Ver casos',
    micro: 'Discovery inicial · 30 min · sin compromiso',
    visualLabel: 'DECISION SYSTEM',
    visual: [
      ['PROBLEMA', 'Una decisión que hoy funciona peor de lo que debería.', 'Demanda · capacidad · riesgo · procesos'],
      ['SISTEMA', 'La capacidad adecuada para mejorar esa decisión.', 'Forecasting · Optimización · ML · IA'],
      ['RESULTADO', 'Una operación más controlable, eficiente y medible.', 'Planificación · velocidad · margen · visibilidad'],
    ],
    outcomesLabel: 'DÓNDE CREAMOS VALOR',
    outcomesTitle: 'Tres formas de mejorar un negocio con capacidad analítica.',
    outcomes: [
      ['Planificar mejor', 'Prever demanda, ventas, caja, carga o capacidad y convertir la previsión en una decisión operativa.'],
      ['Operar mejor', 'Asignar recursos, inventario, rutas, horarios o presupuesto bajo restricciones reales.'],
      ['Automatizar con criterio', 'Reducir trabajo manual y conectar datos, reglas e IA sin añadir complejidad que no se pueda justificar.'],
    ],
    capabilitiesLabel: 'CAPACIDADES',
    capabilitiesTitle: 'No vendemos una tecnología. Elegimos la que resuelve el problema.',
    capabilitiesIntro: 'Explora las capacidades que podemos combinar según la decisión que haya que mejorar.',
    capabilities: [
      {
        key: 'Forecasting',
        title: 'Forecasting & planning',
        body: 'Sistemas de previsión que no terminan en una gráfica: conectan demanda, ventas, inventario o finanzas con decisiones de planificación.',
        examples: ['Demand forecasting', 'Multi-horizon', 'Scenario planning'],
      },
      {
        key: 'Optimización',
        title: 'Optimización & simulación',
        body: 'Modelos matemáticos para decidir cómo asignar recursos cuando existen restricciones, costes y trade-offs reales.',
        examples: ['Routing', 'Scheduling', 'Capacity', 'Simulation'],
      },
      {
        key: 'Machine Learning',
        title: 'Machine learning',
        body: 'Modelos predictivos y de clasificación diseñados alrededor de una decisión concreta y del coste empresarial del error.',
        examples: ['Risk', 'Scoring', 'Prediction', 'Anomaly detection'],
      },
      {
        key: 'IA & Automatización',
        title: 'IA & automatización inteligente',
        body: 'Agentes y workflows para procesos donde el razonamiento contextual aporta valor, manteniendo control humano donde importa.',
        examples: ['AI agents', 'Workflows', 'Copilots', 'Human-in-the-loop'],
      },
      {
        key: 'Analytics & BI',
        title: 'Analytics & decision support',
        body: 'Métricas, reporting y sistemas de decisión diseñados para saber qué está pasando, por qué y qué acción debería venir después.',
        examples: ['KPIs', 'Decision dashboards', 'What-if', 'Management reporting'],
      },
    ],
    capabilitiesLink: 'Ver cómo trabajamos',
    partnerEyebrow: 'PARTNER DATA & AI',
    partnerTitle: 'Capacidad tecnológica y analítica externa, sin construir todo el departamento dentro.',
    partnerBody: 'Para empresas que necesitan Data, IA, optimización o automatización de forma recurrente — o para equipos, agencias y consultoras que necesitan una capa especialista para ampliar lo que pueden ofrecer.',
    partnerPoints: ['Conservamos contexto entre proyectos', 'Activamos la especialidad necesaria', 'Una relación clara y responsable'],
    partnerLink: 'Descubrir el modelo partner',
    exploreLabel: 'SIGUE EXPLORANDO',
    exploreTitle: 'Dos formas de saber si encajamos.',
    explore: [
      ['Ver lo que construimos', 'Casos con contexto, decisiones, arquitectura y resultado. No una galería de logos.', '/projects', 'Explorar casos'],
      ['Leer cómo pensamos', 'Análisis sobre operaciones, forecasting, optimización, datos e IA cuando existe algo útil que entender.', '/knowledge', 'Ir a conocimiento'],
    ],
    ctaTitle: 'No necesitas llegar con la solución.',
    ctaBody: 'Cuéntanos qué está pasando, qué debería mejorar o qué oportunidad quieres explorar. Empezaremos por ahí.',
    cta: 'Hablar con SC-Analytics',
  },
  ca: {
    eyebrow: 'DADES · MATEMÀTIQUES · IA',
    title: 'Convertim dades i IA en decisions que milloren el negoci.',
    intro: 'Entrem allà on una decisió, un procés o un sistema pot funcionar millor. Entenem el problema, triem la capacitat adequada i construïm només allò que aporta valor real.',
    primary: 'Explica’ns què vols millorar',
    secondary: 'Veure casos',
    micro: 'Discovery inicial · 30 min · sense compromís',
    visualLabel: 'DECISION SYSTEM',
    visual: [
      ['PROBLEMA', 'Una decisió que avui funciona pitjor del que hauria.', 'Demanda · capacitat · risc · processos'],
      ['SISTEMA', 'La capacitat adequada per millorar aquesta decisió.', 'Forecasting · Optimització · ML · IA'],
      ['RESULTAT', 'Una operació més controlable, eficient i mesurable.', 'Planificació · velocitat · marge · visibilitat'],
    ],
    outcomesLabel: 'ON CREAM VALOR',
    outcomesTitle: 'Tres maneres de millorar un negoci amb capacitat analítica.',
    outcomes: [
      ['Planificar millor', 'Preveure demanda, vendes, caixa, càrrega o capacitat i convertir la previsió en una decisió operativa.'],
      ['Operar millor', 'Assignar recursos, inventari, rutes, horaris o pressupost sota restriccions reals.'],
      ['Automatitzar amb criteri', 'Reduir feina manual i connectar dades, regles i IA sense afegir complexitat que no es pugui justificar.'],
    ],
    capabilitiesLabel: 'CAPACITATS',
    capabilitiesTitle: 'No venem una tecnologia. Triem la que resol el problema.',
    capabilitiesIntro: 'Explora les capacitats que podem combinar segons la decisió que calgui millorar.',
    capabilities: [
      { key: 'Forecasting', title: 'Forecasting & planning', body: 'Sistemes de previsió que no acaben en una gràfica: connecten demanda, vendes, inventari o finances amb decisions de planificació.', examples: ['Demand forecasting', 'Multi-horizon', 'Scenario planning'] },
      { key: 'Optimització', title: 'Optimització & simulació', body: 'Models matemàtics per decidir com assignar recursos quan existeixen restriccions, costos i trade-offs reals.', examples: ['Routing', 'Scheduling', 'Capacity', 'Simulation'] },
      { key: 'Machine Learning', title: 'Machine learning', body: 'Models predictius i de classificació dissenyats al voltant d’una decisió concreta i del cost empresarial de l’error.', examples: ['Risk', 'Scoring', 'Prediction', 'Anomaly detection'] },
      { key: 'IA & Automatització', title: 'IA & automatització intel·ligent', body: 'Agents i workflows per a processos on el raonament contextual aporta valor, mantenint control humà on importa.', examples: ['AI agents', 'Workflows', 'Copilots', 'Human-in-the-loop'] },
      { key: 'Analytics & BI', title: 'Analytics & decision support', body: 'Mètriques, reporting i sistemes de decisió dissenyats per saber què passa, per què i quina acció hauria de venir després.', examples: ['KPIs', 'Decision dashboards', 'What-if', 'Management reporting'] },
    ],
    capabilitiesLink: 'Veure com treballem',
    partnerEyebrow: 'PARTNER DATA & AI',
    partnerTitle: 'Capacitat tecnològica i analítica externa, sense construir tot el departament internament.',
    partnerBody: 'Per a empreses que necessiten dades, IA, optimització o automatització de forma recurrent — o per a equips, agències i consultores que necessiten una capa especialista per ampliar allò que poden oferir.',
    partnerPoints: ['Conservem context entre projectes', 'Activem l’especialitat necessària', 'Una relació clara i responsable'],
    partnerLink: 'Descobrir el model partner',
    exploreLabel: 'SEGUEIX EXPLORANT',
    exploreTitle: 'Dues maneres de saber si encaixem.',
    explore: [
      ['Veure què construïm', 'Casos amb context, decisions, arquitectura i resultat. No una galeria de logos.', '/projects', 'Explorar casos'],
      ['Llegir com pensem', 'Anàlisi sobre operacions, forecasting, optimització, dades i IA quan hi ha alguna cosa útil per entendre.', '/knowledge', 'Anar a coneixement'],
    ],
    ctaTitle: 'No cal arribar amb la solució.',
    ctaBody: 'Explica’ns què està passant, què hauria de millorar o quina oportunitat vols explorar. Començarem per aquí.',
    cta: 'Parlar amb SC-Analytics',
  },
  en: {
    eyebrow: 'DATA · MATHEMATICS · AI',
    title: 'We turn data and AI into decisions that improve the business.',
    intro: 'We enter where a decision, process or system can work better. We understand the problem, select the right capability and build only what creates real value.',
    primary: 'Tell us what should improve',
    secondary: 'See case studies',
    micro: 'Initial discovery · 30 min · no commitment',
    visualLabel: 'DECISION SYSTEM',
    visual: [
      ['PROBLEM', 'A decision that works worse today than it should.', 'Demand · capacity · risk · processes'],
      ['SYSTEM', 'The right capability to improve that decision.', 'Forecasting · Optimisation · ML · AI'],
      ['OUTCOME', 'A more controllable, efficient and measurable operation.', 'Planning · speed · margin · visibility'],
    ],
    outcomesLabel: 'WHERE WE CREATE VALUE',
    outcomesTitle: 'Three ways analytical capability can improve a business.',
    outcomes: [
      ['Plan better', 'Forecast demand, sales, cash, workload or capacity and turn the forecast into an operational decision.'],
      ['Operate better', 'Allocate resources, inventory, routes, schedules or budget under real constraints.'],
      ['Automate with judgment', 'Reduce manual work and connect data, rules and AI without adding complexity that cannot be justified.'],
    ],
    capabilitiesLabel: 'CAPABILITIES',
    capabilitiesTitle: 'We do not sell a technology. We choose what solves the problem.',
    capabilitiesIntro: 'Explore the capabilities we can combine around the decision that needs to improve.',
    capabilities: [
      { key: 'Forecasting', title: 'Forecasting & planning', body: 'Forecasting systems that do not end in a chart: they connect demand, sales, inventory or finance to planning decisions.', examples: ['Demand forecasting', 'Multi-horizon', 'Scenario planning'] },
      { key: 'Optimisation', title: 'Optimisation & simulation', body: 'Mathematical models for deciding how to allocate resources when real constraints, costs and trade-offs exist.', examples: ['Routing', 'Scheduling', 'Capacity', 'Simulation'] },
      { key: 'Machine Learning', title: 'Machine learning', body: 'Predictive and classification models designed around a concrete decision and the business cost of error.', examples: ['Risk', 'Scoring', 'Prediction', 'Anomaly detection'] },
      { key: 'AI & Automation', title: 'AI & intelligent automation', body: 'Agents and workflows for processes where contextual reasoning creates value, with human control where it matters.', examples: ['AI agents', 'Workflows', 'Copilots', 'Human-in-the-loop'] },
      { key: 'Analytics & BI', title: 'Analytics & decision support', body: 'Metrics, reporting and decision systems designed to show what is happening, why and what action should come next.', examples: ['KPIs', 'Decision dashboards', 'What-if', 'Management reporting'] },
    ],
    capabilitiesLink: 'See how we work',
    partnerEyebrow: 'DATA & AI PARTNER',
    partnerTitle: 'External technology and analytical capability without building the entire department in-house.',
    partnerBody: 'For companies that need Data, AI, optimisation or automation repeatedly — and for teams, agencies or consultancies that need a specialist layer to expand what they can deliver.',
    partnerPoints: ['We retain context between projects', 'We activate the specialism required', 'One clear and accountable relationship'],
    partnerLink: 'Explore the partner model',
    exploreLabel: 'KEEP EXPLORING',
    exploreTitle: 'Two ways to decide whether we fit.',
    explore: [
      ['See what we build', 'Cases with context, decisions, architecture and outcomes. Not a logo gallery.', '/projects', 'Explore case studies'],
      ['Read how we think', 'Analysis on operations, forecasting, optimisation, data and AI when there is something useful to understand.', '/knowledge', 'Go to knowledge'],
    ],
    ctaTitle: 'You do not need to arrive with the solution.',
    ctaBody: 'Tell us what is happening, what should improve or which opportunity you want to explore. We will start there.',
    cta: 'Talk to SC-Analytics',
  },
} as const

export default function HomePage() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]
  const [selected, setSelected] = useState(0)
  const capability = t.capabilities[selected]

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:py-20 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">{t.eyebrow}</p>
            <h1 className="mt-6 max-w-4xl text-5xl font-medium leading-[1.03] md:text-7xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">{t.intro}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/contact?intent=discovery" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">{t.primary}</Link>
              <Link href="/projects" className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:border-slate-500">{t.secondary}</Link>
            </div>
            <p className="mt-4 text-xs text-slate-500">{t.micro}</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-indigo-400/10" />
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full border border-white/5" />

            <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-300">{t.visualLabel}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600">SC / 01</p>
            </div>

            <div className="relative mt-5">
              <div className="absolute bottom-8 left-[17px] top-8 w-px bg-gradient-to-b from-slate-700 via-indigo-500/60 to-indigo-300/30" />
              <div className="space-y-3">
                {t.visual.map(([label, title, meta], index) => (
                  <div key={label} className="relative grid grid-cols-[36px_1fr] gap-4">
                    <div className={`relative z-10 mt-4 flex h-9 w-9 items-center justify-center rounded-full border text-[10px] font-semibold ${
                      index === 1
                        ? 'border-indigo-400/60 bg-indigo-400/15 text-indigo-200'
                        : index === 2
                          ? 'border-white/30 bg-white text-slate-950'
                          : 'border-slate-700 bg-slate-950 text-slate-500'
                    }`}>
                      0{index + 1}
                    </div>

                    <div className={`rounded-xl border p-4 transition ${
                      index === 1
                        ? 'border-indigo-400/25 bg-indigo-400/[0.07]'
                        : index === 2
                          ? 'border-white/15 bg-white/[0.06]'
                          : 'border-white/[0.07] bg-black/10'
                    }`}>
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${index === 2 ? 'text-indigo-200' : index === 1 ? 'text-indigo-300' : 'text-slate-500'}`}>{label}</p>
                        {index < 2 && <span className="text-xs text-slate-700">↓</span>}
                      </div>
                      <p className={`mt-2 text-sm font-medium leading-6 ${index === 2 ? 'text-white' : 'text-slate-200'}`}>{title}</p>
                      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-slate-500">{meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">{t.outcomesLabel}</p>
              <h2 className="mt-4 max-w-md text-3xl leading-tight md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.outcomesTitle}</h2>
            </div>
            <div className="grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 md:grid-cols-3">
              {t.outcomes.map(([title, body], index) => (
                <article key={title} className="bg-white p-6">
                  <p className="text-xs font-semibold text-indigo-600">0{index + 1}</p>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">{t.capabilitiesLabel}</p>
          <h2 className="mt-4 text-3xl leading-tight md:text-5xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.capabilitiesTitle}</h2>
          <p className="mt-5 text-base leading-7 text-slate-600">{t.capabilitiesIntro}</p>
        </div>

        <div className="mt-9 grid overflow-hidden rounded-2xl border border-slate-200 lg:grid-cols-[.42fr_.58fr]">
          <div className="border-b border-slate-200 bg-slate-50 p-3 lg:border-b-0 lg:border-r">
            {t.capabilities.map((item, index) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelected(index)}
                className={`flex w-full items-center justify-between rounded-lg px-4 py-3.5 text-left text-sm transition ${
                  selected === index ? 'bg-slate-950 font-semibold text-white' : 'text-slate-600 hover:bg-white hover:text-slate-950'
                }`}
              >
                <span>{item.key}</span>
                <span className={selected === index ? 'text-indigo-300' : 'text-slate-300'}>→</span>
              </button>
            ))}
          </div>

          <div className="min-h-[310px] p-7 md:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">0{selected + 1}</p>
            <h3 className="mt-4 text-3xl leading-tight md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{capability.title}</h3>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">{capability.body}</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {capability.examples.map((item) => <span key={item} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">{item}</span>)}
            </div>
            <Link href="/services" className="mt-8 inline-flex text-sm font-semibold text-indigo-700 hover:text-indigo-900">{t.capabilitiesLink} →</Link>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:py-16 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">{t.partnerEyebrow}</p>
            <h2 className="mt-4 max-w-3xl text-3xl leading-tight md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.partnerTitle}</h2>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-400">{t.partnerBody}</p>
          </div>
          <div>
            <div className="divide-y divide-slate-800 border-y border-slate-800">
              {t.partnerPoints.map((item, index) => (
                <div key={item} className="flex gap-4 py-4">
                  <span className="text-xs font-semibold text-indigo-300">0{index + 1}</span>
                  <p className="text-sm text-slate-300">{item}</p>
                </div>
              ))}
            </div>
            <Link href="/partner-analitico" className="mt-6 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">{t.partnerLink}</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">{t.exploreLabel}</p>
        <h2 className="mt-4 text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.exploreTitle}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {t.explore.map(([title, body, href, button]) => (
            <Link key={href} href={href} className="group rounded-2xl border border-slate-200 p-7 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-950/[0.04]">
              <h3 className="text-2xl" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">{body}</p>
              <p className="mt-6 text-sm font-semibold text-indigo-700">{button} <span className="inline-block transition group-hover:translate-x-1">→</span></p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-indigo-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.ctaTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{t.ctaBody}</p>
          </div>
          <Link href="/contact?intent=discovery" className="inline-flex shrink-0 items-center justify-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">{t.cta}</Link>
        </div>
      </section>
    </main>
  )
}
