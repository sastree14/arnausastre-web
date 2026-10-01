'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'CÓMO TRABAJAMOS',
    title: 'Comprender antes de construir.',
    intro: 'Entendemos qué quieres mejorar, diseñamos el enfoque adecuado y construimos una solución pensada para generar impacto.',
    primary: 'Háblanos de tu problema',
    secondary: 'Ver casos reales',

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
        hook: '¿Tienes un problema concreto que quieres resolver?',
        body: 'Definimos alcance, resultado esperado y una solución proporcional a la necesidad.',
        primary: 'Cuéntanoslo sin compromiso',
        primaryHref: '/contact?intent=problem',
        secondary: '¿No estás seguro? Mira nuestros casos',
        secondaryHref: '/projects',
      },
      {
        title: 'Partner analítico y tecnológico',
        hook: '¿Necesitas capacidad recurrente sin construir todo el equipo dentro?',
        body: 'Conservamos contexto y activamos la especialidad necesaria cuando aparece una nueva necesidad.',
        primary: 'Explorar el modelo partner',
        primaryHref: '/partner-analitico',
        secondary: 'Conoce cómo pensamos en nuestros artículos',
        secondaryHref: '/knowledge',
      },
      {
        title: 'Discovery',
        hook: '¿Crees que podrías mejorar algo, pero todavía no sabes qué construir?',
        body: 'Empezamos entendiendo la oportunidad y valoramos si realmente existe un caso que merezca avanzar.',
        primary: 'Reservar una primera conversación',
        primaryHref: '/contact?intent=discovery',
        secondary: 'Conoce mejor SC-Analytics',
        secondaryHref: '/about',
      },
    ],

    exploreLabel: '¿QUIERES SEGUIR EXPLORANDO?',
    exploreTitle: 'Conócenos mejor antes de dar el siguiente paso.',
    exploreLinks: [
      ['Casos', 'Mira problemas reales y cómo los hemos abordado de principio a fin.', '/projects', 'Explorar casos'],
      ['Conocimiento', 'Lee artículos y análisis para ver cómo pensamos y dónde aportamos valor.', '/knowledge', 'Leer artículos'],
      ['Por qué SC-Analytics', 'Entiende nuestra forma de trabajar y el tipo de relación que queremos construir.', '/about', 'Conocernos mejor'],
    ],

    finalLabel: 'SIN COMPROMISO',
    finalTitle: 'Cuéntanos qué quieres mejorar. Te diremos si podemos aportar valor.',
    finalBody: 'Explícanos qué quieres mejorar. Si vemos una forma razonable de ayudarte, te diremos cuál sería el siguiente paso.',
    finalCta: 'Cuéntanos tu caso',
  },

  ca: {
    eyebrow: 'COM TREBALLEM',
    title: 'Comprendre abans de construir.',
    intro: 'Entenem què vols millorar, dissenyem l’enfocament adequat i construïm una solució pensada per generar impacte.',
    primary: 'Parla’ns del teu problema',
    secondary: 'Veure casos reals',

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
        hook: 'Tens un problema concret que vols resoldre?',
        body: 'Definim abast, resultat esperat i una solució proporcional a la necessitat.',
        primary: 'Explica’ns-ho sense compromís',
        primaryHref: '/contact?intent=problem',
        secondary: 'No ho tens clar? Mira els nostres casos',
        secondaryHref: '/projects',
      },
      {
        title: 'Partner analític i tecnològic',
        hook: 'Necessites capacitat recurrent sense construir tot l’equip internament?',
        body: 'Conservem context i activem l’especialitat necessària quan apareix una nova necessitat.',
        primary: 'Explorar el model partner',
        primaryHref: '/partner-analitico',
        secondary: 'Coneix com pensem als nostres articles',
        secondaryHref: '/knowledge',
      },
      {
        title: 'Discovery',
        hook: 'Creus que podries millorar alguna cosa, però encara no saps què construir?',
        body: 'Comencem entenent l’oportunitat i valorem si realment existeix un cas que mereixi avançar.',
        primary: 'Reservar una primera conversa',
        primaryHref: '/contact?intent=discovery',
        secondary: 'Conèixer millor SC-Analytics',
        secondaryHref: '/about',
      },
    ],

    exploreLabel: 'VOLS SEGUIR EXPLORANT?',
    exploreTitle: 'Coneix-nos millor abans de fer el següent pas.',
    exploreLinks: [
      ['Casos', 'Mira problemes reals i com els hem abordat de principi a fi.', '/projects', 'Explorar casos'],
      ['Coneixement', 'Llegeix articles i anàlisis per veure com pensem i on aportem valor.', '/knowledge', 'Llegir articles'],
      ['Per què SC-Analytics', 'Entén la nostra manera de treballar i el tipus de relació que volem construir.', '/about', 'Conèixer-nos millor'],
    ],

    finalLabel: 'SENSE COMPROMÍS',
    finalTitle: 'Explica’ns què vols millorar. Et direm si podem aportar valor.',
    finalBody: 'Explica’ns què vols millorar. Si veiem una forma raonable d’ajudar-te, et direm quin seria el següent pas.',
    finalCta: 'Explica’ns el teu cas',
  },

  en: {
    eyebrow: 'HOW WE WORK',
    title: 'Understand before building.',
    intro: 'We understand what should improve, design the right approach and build a solution meant to create impact.',
    primary: 'Tell us about your problem',
    secondary: 'See real cases',

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
        hook: 'Do you have a concrete problem you want to solve?',
        body: 'We define scope, expected outcome and a solution proportionate to the need.',
        primary: 'Tell us without commitment',
        primaryHref: '/contact?intent=problem',
        secondary: 'Not sure yet? Browse our cases',
        secondaryHref: '/projects',
      },
      {
        title: 'Analytical & technology partner',
        hook: 'Need recurring capability without building the entire team in-house?',
        body: 'We retain context and activate the right specialism when a new need appears.',
        primary: 'Explore the partner model',
        primaryHref: '/partner-analitico',
        secondary: 'See how we think in our articles',
        secondaryHref: '/knowledge',
      },
      {
        title: 'Discovery',
        hook: 'Think something could work better, but not yet sure what to build?',
        body: 'We start by understanding the opportunity and whether there is a case worth pursuing.',
        primary: 'Book a first conversation',
        primaryHref: '/contact?intent=discovery',
        secondary: 'Get to know SC-Analytics',
        secondaryHref: '/about',
      },
    ],

    exploreLabel: 'WANT TO KEEP EXPLORING?',
    exploreTitle: 'Get to know us better before taking the next step.',
    exploreLinks: [
      ['Case studies', 'See real problems and how we approached them from beginning to end.', '/projects', 'Explore cases'],
      ['Knowledge', 'Read articles and analysis to see how we think and where we create value.', '/knowledge', 'Read articles'],
      ['Why SC-Analytics', 'Understand how we work and the kind of relationship we aim to build.', '/about', 'Get to know us'],
    ],

    finalLabel: 'NO COMMITMENT',
    finalTitle: 'Tell us what you want to improve. We will tell you whether we can create value.',
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
            {t.capabilities.map(([title, body], index) => (
              <article key={title} className={`flex min-h-[190px] flex-col justify-center border-b border-r border-slate-300 p-7 ${index === 1 || index === 3 || index === 5 ? 'bg-[#FAFAF7]' : 'bg-white'}`}>
                <h3 className="text-[24px] font-semibold leading-7 text-slate-950">{title}</h3>
                <p className="mt-3 max-w-sm text-[17px] leading-7 text-slate-700">{body}</p>
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
              <article key={model.title} className={`flex min-h-[355px] flex-col border-b border-r border-slate-300 p-6 md:p-7 ${index === 1 ? 'bg-[#0D1B2A] text-white' : 'bg-white text-slate-950'}`}>
                <h3 className={`text-[30px] leading-tight ${index === 1 ? 'text-white' : 'text-slate-950'}`} style={{ fontFamily: 'var(--font-playfair)' }}>{model.title}</h3>
                <p className={`mt-4 text-[18px] font-semibold leading-7 ${index === 1 ? 'text-white' : 'text-slate-800'}`}>{model.hook}</p>
                <p className={`mt-3 flex-1 text-[14px] leading-7 ${index === 1 ? 'text-[#A8BACB]' : 'text-slate-600'}`}>{model.body}</p>
                <Link href={model.primaryHref} className={`mt-6 inline-flex w-fit px-4 py-2.5 text-[14px] font-semibold ${index === 1 ? 'bg-white text-[#0D1B2A]' : 'bg-slate-950 text-white'}`}>{model.primary} →</Link>
                <Link href={model.secondaryHref} className={`mt-4 text-[14px] font-semibold ${index === 1 ? 'text-[#EAF0F6]' : 'text-indigo-700'}`}>{model.secondary} →</Link>
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

          <div className="mx-auto mt-7 grid max-w-5xl border-l border-t border-slate-300 md:grid-cols-3">
            {t.exploreLinks.map(([title, body, href, cta]) => (
              <Link key={href} href={href} className="group flex min-h-[220px] flex-col items-center justify-center border-b border-r border-slate-300 p-6 text-center transition hover:bg-[#FAFAF7]">
                <h3 className="text-[23px] font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 max-w-[260px] text-[16px] leading-7 text-slate-700">{body}</p>
                <p className="mt-5 text-[14px] font-semibold text-indigo-700">{cta} <span className="inline-block transition group-hover:translate-x-1">→</span></p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.finalLabel}</p>
            <h2 className="mt-2 max-w-4xl text-[30px] leading-tight text-slate-950 sm:text-[36px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.finalTitle}</h2>
            <p className="mt-3 max-w-3xl text-[17px] leading-7 text-slate-700">{t.finalBody}</p>
          </div>
          <Link href="/contact?intent=discovery" className="inline-flex shrink-0 bg-slate-950 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-slate-800">{t.finalCta}</Link>
        </div>
      </section>
    </main>
  )
}
