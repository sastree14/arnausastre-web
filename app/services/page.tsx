'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'CÓMO TRABAJAMOS',
    title: 'Comprender antes de construir.',
    intro: 'Entendemos qué quieres mejorar, diseñamos el enfoque adecuado y construimos una solución pensada para generar impacto.',
    primary: 'Háblanos de tu problema',
    secondary: 'Ver casos de éxito',

    processLabel: 'CÓMO LO HACEMOS',
    processTitle: 'Cuatro pasos. Una forma clara de generar impacto.',
    steps: [
      ['01', 'Comprender', 'Entendemos tu negocio, la decisión, las restricciones y qué debería cambiar.'],
      ['02', 'Diseñar', 'Definimos el enfoque, el alcance y la forma más razonable de generar valor.'],
      ['03', 'Construir', 'Desarrollamos una solución utilizable, integrada y pensada para operaciones reales.'],
      ['04', 'Mejorar', 'Medimos resultados y evolucionamos solo cuando existe una razón clara para hacerlo.'],
    ],

    capabilitiesLabel: 'EN QUÉ NOS ESPECIALIZAMOS',
    capabilitiesTitle: 'Donde concentramos nuestra capacidad.',
    capabilities: [
      ['Forecasting & planning', 'Previsión y planificación para decidir con más anticipación.'],
      ['Optimización', 'Modelos para asignar mejor recursos, rutas, capacidad o presupuesto.'],
      ['Machine learning', 'Predicción, clasificación y priorización cuando el error puede medirse.'],
      ['Inteligencia artificial y automatización', 'Procesos más ágiles, menos trabajo manual y sistemas más escalables.'],
      ['Analytics & BI', 'Visibilidad clara para seguir operaciones, rendimiento y decisiones.'],
      ['Simulación y modelización', 'Escenarios y modelos para decidir antes de cambiar una operación real.'],
    ],

    modelsLabel: 'FORMAS DE COLABORAR',
    modelsTitle: 'Elige la forma de empezar que mejor encaje con tu situación.',
    models: [
      {
        title: 'Proyecto individualizado',
        hook: 'Resolvemos una necesidad concreta con alcance y resultado definidos.',
        primary: 'Cuéntanos tu caso',
        primaryHref: '/contact?intent=problem',
      },
      {
        title: 'Partner Data e IA',
        hook: 'Añade capacidad especializada cuando la necesites, sin perder contexto.',
        primary: 'Explorar modelo partner',
        primaryHref: '/partner-analitico',
      },
      {
        title: 'Discovery',
        hook: 'Aterrizamos la oportunidad antes de decidir qué construir.',
        primary: 'Reservar conversación',
        primaryHref: '/contact?intent=discovery',
      },
    ],

    exploreLabel: 'CONÓCENOS MEJOR',
    exploreTitle: 'Tres formas de valorar si encajamos.',
    exploreLinks: [
      ['Casos de éxito', '/projects', 'Explorar casos de éxito'],
      ['Conocimiento empresarial', '/knowledge', 'Leer artículos'],
      ['Por qué trabajar con SC-Analytics', '/about', 'Conocer SC-Analytics'],
    ],

    finalLabel: 'SIN COMPROMISO',
    finalTitle: 'Cuéntanos qué quieres mejorar y te diremos cómo podemos ayudarte.',
    finalBody: 'Explícanos qué quieres mejorar. Si vemos una forma razonable de ayudarte, te diremos cuál sería el siguiente paso.',
    finalCta: 'Cuéntanos tu caso',
  },

  ca: {
    eyebrow: 'COM TREBALLEM',
    title: 'Comprendre abans de construir.',
    intro: 'Entenem què vols millorar, dissenyem l’enfocament adequat i construïm una solució pensada per generar impacte.',
    primary: 'Parla’ns del teu problema',
    secondary: 'Veure casos d’èxit',

    processLabel: 'COM HO FEM',
    processTitle: 'Quatre passos. Una forma clara de generar impacte.',
    steps: [
      ['01', 'Comprendre', 'Entenem el teu negoci, la decisió, les restriccions i què hauria de canviar.'],
      ['02', 'Dissenyar', 'Definim l’enfocament, l’abast i la forma més raonable de generar valor.'],
      ['03', 'Construir', 'Desenvolupem una solució utilitzable, integrada i pensada per a operacions reals.'],
      ['04', 'Millorar', 'Mesurem resultats i evolucionem només quan existeix una raó clara per fer-ho.'],
    ],

    capabilitiesLabel: 'EN QUÈ ENS ESPECIALITZEM',
    capabilitiesTitle: 'On concentrem la nostra capacitat.',
    capabilities: [
      ['Forecasting & planning', 'Previsió i planificació per decidir amb més anticipació.'],
      ['Optimització', 'Models per assignar millor recursos, rutes, capacitat o pressupost.'],
      ['Machine learning', 'Predicció, classificació i priorització quan l’error es pot mesurar.'],
      ['Intel·ligència artificial i automatització', 'Processos més àgils, menys feina manual i sistemes més escalables.'],
      ['Analytics & BI', 'Visibilitat clara per seguir operacions, rendiment i decisions.'],
      ['Simulació i modelització', 'Escenaris i models per decidir abans de canviar una operació real.'],
    ],

    modelsLabel: 'FORMES DE COL·LABORAR',
    modelsTitle: 'Tria la forma de començar que millor encaixi amb la teva situació.',
    models: [
      {
        title: 'Projecte individualitzat',
        hook: 'Resolem una necessitat concreta amb abast i resultat definits.',
        primary: 'Explica’ns el teu cas',
        primaryHref: '/contact?intent=problem',
      },
      {
        title: 'Partner Dades i IA',
        hook: 'Afegeix capacitat especialitzada quan la necessitis, sense perdre context.',
        primary: 'Explorar model partner',
        primaryHref: '/partner-analitico',
      },
      {
        title: 'Discovery',
        hook: 'Aterrem l’oportunitat abans de decidir què construir.',
        primary: 'Reservar conversa',
        primaryHref: '/contact?intent=discovery',
      },
    ],

    exploreLabel: 'CONEIX-NOS MILLOR',
    exploreTitle: 'Tres maneres de valorar si encaixem.',
    exploreLinks: [
      ['Casos d’èxit', '/projects', 'Explorar casos d’èxit'],
      ['Coneixement empresarial', '/knowledge', 'Llegir articles'],
      ['Per què treballar amb SC-Analytics', '/about', 'Conèixer SC-Analytics'],
    ],

    finalLabel: 'SENSE COMPROMÍS',
    finalTitle: 'Explica’ns què vols millorar i et direm com et podem ajudar.',
    finalBody: 'Explica’ns què vols millorar. Si veiem una forma raonable d’ajudar-te, et direm quin seria el següent pas.',
    finalCta: 'Explica’ns el teu cas',
  },

  en: {
    eyebrow: 'HOW WE WORK',
    title: 'Understand before building.',
    intro: 'We understand what should improve, design the right approach and build a solution meant to create impact.',
    primary: 'Tell us about your problem',
    secondary: 'See success stories',

    processLabel: 'HOW WE DO IT',
    processTitle: 'Four steps. One clear way to create impact.',
    steps: [
      ['01', 'Understand', 'We understand the business, the decision, the constraints and what should change.'],
      ['02', 'Design', 'We define the approach, scope and most sensible way to create value.'],
      ['03', 'Build', 'We develop a usable, integrated solution designed for real operations.'],
      ['04', 'Improve', 'We measure outcomes and evolve only when there is a clear reason to do so.'],
    ],

    capabilitiesLabel: 'WHAT WE SPECIALISE IN',
    capabilitiesTitle: 'Where we concentrate our capability.',
    capabilities: [
      ['Forecasting & planning', 'Forecasting and planning for earlier, better-informed decisions.'],
      ['Optimisation', 'Models for allocating resources, routes, capacity or budget more effectively.'],
      ['Machine learning', 'Prediction, classification and prioritisation when the cost of error can be measured.'],
      ['Artificial intelligence & automation', 'Faster processes, less manual work and more scalable systems.'],
      ['Analytics & BI', 'Clear visibility into operations, performance and decisions.'],
      ['Simulation & modelling', 'Scenarios and models for deciding before changing a real operation.'],
    ],

    modelsLabel: 'WAYS TO WORK TOGETHER',
    modelsTitle: 'Choose the way to start that best matches your situation.',
    models: [
      {
        title: 'Defined project',
        hook: 'Solve one concrete need with a defined scope and outcome.',
        primary: 'Tell us about your case',
        primaryHref: '/contact?intent=problem',
      },
      {
        title: 'Data and AI Partner',
        hook: 'Add specialist capability when you need it, without losing context.',
        primary: 'Explore the partner model',
        primaryHref: '/partner-analitico',
      },
      {
        title: 'Discovery',
        hook: 'Shape the opportunity before deciding what to build.',
        primary: 'Book a conversation',
        primaryHref: '/contact?intent=discovery',
      },
    ],

    exploreLabel: 'GET TO KNOW US',
    exploreTitle: 'Three ways to assess whether we are a good fit.',
    exploreLinks: [
      ['Success stories', '/projects', 'Explore success stories'],
      ['Business knowledge', '/knowledge', 'Read articles'],
      ['Why work with SC-Analytics', '/about', 'Get to know SC-Analytics'],
    ],

    finalLabel: 'NO COMMITMENT',
    finalTitle: 'Tell us what you want to improve and we will show you how we can help.',
    finalBody: 'Tell us what you want to improve. If we see a sensible way to help, we will tell you the next step.',
    finalCta: 'Tell us about your case',
  },
} as const

export default function ServicesPage() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 md:py-20 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">{t.eyebrow}</p>
            <h1 className="mt-5 text-[46px] leading-[1.03] tracking-[-0.03em] sm:text-[58px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
            <p className="mt-6 max-w-3xl text-[19px] leading-8 text-[#EAF0F6]">{t.intro}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact?intent=problem" className="bg-white px-5 py-3 text-[15px] font-semibold text-[#0D1B2A] transition hover:bg-[#EAF0F6]">{t.primary}</Link>
            <Link href="/projects" className="border border-[#7F9BB5] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-white/5">{t.secondary}</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#FAFAF7]">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <div className="text-center">
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.processLabel}</p>
            <h2 className="mx-auto mt-3 max-w-4xl text-[36px] leading-[1.06] tracking-[-0.02em] sm:text-[44px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.processTitle}</h2>
          </div>

          <div className="mt-9 grid border-l border-t border-slate-300 md:grid-cols-2 lg:grid-cols-4">
            {t.steps.map(([number, title, body], index) => (
              <article key={number} className={`flex min-h-[245px] flex-col border-b border-r border-slate-300 p-6 text-center ${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F1EA]'}`}>
                <p className="font-mono text-[11px] text-indigo-700">{number}</p>
                <h3 className="mt-7 text-[30px] leading-tight text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h3>
                <p className="mx-auto mt-4 max-w-[250px] text-[17px] font-medium leading-7 text-slate-800">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <div className="grid gap-7 lg:grid-cols-[190px_1fr] lg:gap-10">
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.capabilitiesLabel}</p>
            <h2 className="max-w-4xl text-[34px] leading-[1.06] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.capabilitiesTitle}</h2>
          </div>

          <div className="mt-8 grid border-l border-t border-slate-300 md:grid-cols-2 lg:grid-cols-3">
            {t.capabilities.map(([title], index) => (
              <article
                key={title}
                className={`flex min-h-[175px] items-center border-b border-r border-slate-300 p-7 md:p-8 ${index % 2 === 0 ? 'bg-[#F4F1EA]' : 'bg-[#EDF2F6]'}`}
              >
                <h3 className="max-w-xs text-[26px] font-semibold leading-8 text-slate-950">{title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <div className="grid gap-7 lg:grid-cols-[190px_1fr] lg:gap-10">
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.modelsLabel}</p>
            <h2 className="max-w-4xl text-[34px] leading-[1.06] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.modelsTitle}</h2>
          </div>

          <div className="mt-8 grid border-l border-t border-slate-300 lg:grid-cols-3">
            {t.models.map((model, index) => (
              <article
                key={model.title}
                className={`flex min-h-[265px] flex-col border-b border-r border-slate-300 p-7 md:p-8 ${index === 1 ? 'bg-[#0D1B2A] text-white' : 'bg-white text-slate-950'}`}
              >
                <h3
                  className={`min-h-[68px] text-[28px] leading-[1.08] ${index === 1 ? 'text-white' : 'text-slate-950'}`}
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {model.title}
                </h3>
                <p className={`mt-5 max-w-[31ch] text-[18px] font-semibold leading-7 ${index === 1 ? 'text-[#EAF0F6]' : 'text-slate-800'}`}>
                  {model.hook}
                </p>

                <div className={`mt-auto pt-7`}>
                  <Link
                    href={model.primaryHref}
                    className={`flex w-full items-center justify-between px-4 py-3.5 text-[15px] font-semibold transition ${index === 1 ? 'bg-white text-[#0D1B2A] hover:bg-[#EAF0F6]' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
                  >
                    <span>{model.primary}</span><span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-14">
          <div className="text-center">
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.exploreLabel}</p>
            <h2 className="mx-auto mt-3 max-w-3xl text-[32px] leading-[1.08] sm:text-[38px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.exploreTitle}</h2>
          </div>

          <div className="mx-auto mt-7 grid max-w-5xl gap-3 md:grid-cols-3">
            {t.exploreLinks.map(([title, href, cta], index) => {
              const middle = index === 1
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group relative flex min-h-[220px] flex-col justify-between border p-7 text-left transition duration-200 hover:z-10 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-lg active:scale-[1.005] ${middle ? 'border-[#31536B] bg-[#31536B] text-white' : index === 0 ? 'border-[#DDCFBD] bg-[#F8F3EA] text-slate-950' : 'border-[#D2C4DD] bg-[#F1ECF5] text-slate-950'}`}
                >
                  <h3 className={`max-w-[270px] text-[26px] font-semibold leading-8 ${middle ? 'text-white' : 'text-slate-950'}`}>{title}</h3>
                  <p className={`mt-8 text-[16px] font-semibold ${middle ? 'text-white' : 'text-indigo-700'}`}>
                    {cta} <span className="inline-block transition group-hover:translate-x-1">→</span>
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-6 py-10 md:flex-row md:items-end md:justify-between md:py-12">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.finalLabel}</p>
            <h2 className="mt-3 max-w-5xl text-[34px] font-medium leading-tight text-slate-950 sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.finalTitle}</h2>
            <p className="mt-4 max-w-3xl text-[17px] leading-7 text-slate-700">{t.finalBody}</p>
          </div>
          <Link href="/contact?intent=discovery" className="inline-flex shrink-0 bg-slate-950 px-6 py-3.5 text-[16px] font-semibold text-white transition hover:bg-slate-800">
            {t.finalCta} →
          </Link>
        </div>
      </section>
    </main>
  )
}
