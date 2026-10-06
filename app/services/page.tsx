'use client'

import Link from 'next/link'
import ProcessSequence from '@/components/ProcessSequence'
import { SERVICES_PROCESS } from '@/lib/services-process'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'SERVICIOS',
    title: 'Comprender antes de construir.',
    intro: 'Previsión, optimización, datos e IA para resolver necesidades concretas de tu empresa.',
    primary: 'Háblanos de tu problema',
    secondary: 'Ver casos de éxito',

    processLabel: 'CÓMO LO HACEMOS',

    capabilitiesLabel: 'EN QUÉ NOS ESPECIALIZAMOS',
    capabilitiesTitle: 'Nuestras especialidades.',
    capabilities: [
      ['Forecasting & planning', 'Previsiones de variables y escenarios para anticipar su evolución.'],
      ['Optimización', 'Modelos para elegir la mejor alternativa según objetivos y restricciones.'],
      ['Machine learning', 'Modelos que aprenden de los datos para predecir y detectar patrones.'],
      ['Inteligencia artificial y automatización', 'Soluciones de IA y automatización adaptadas a tus procesos y herramientas.'],
      ['Analytics & BI', 'Visibilidad clara para seguir operaciones, rendimiento y decisiones.'],
      ['Simulación y modelización', 'Escenarios y modelos para decidir antes de cambiar una operación real.'],
    ],

    modelsLabel: 'FORMAS DE COLABORAR',
    modelsTitle: 'Una colaboración adaptada a tu empresa.',
    models: [
      {
        title: 'Proyecto individualizado',
        hook: 'Resolvemos una necesidad concreta con alcance y resultado definidos.',
        primary: 'Cuéntanos tu caso',
        primaryHref: '/contact?intent=problem',
      },
      {
        title: 'Partner Data e IA',
        hook: 'Refuerza tu equipo con capacidad especializada, manteniendo continuidad y contexto.',
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
    finalBody: 'Primera llamada de 30 minutos, sin coste ni compromiso.',
    finalCta: 'Cuéntanos tu caso',
  },

  ca: {
    eyebrow: 'SERVEIS',
    title: 'Comprendre abans de construir.',
    intro: 'Previsió, optimització, dades i IA per resoldre necessitats concretes de la teva empresa.',
    primary: 'Parla’ns del teu problema',
    secondary: 'Veure casos d’èxit',

    processLabel: 'COM HO FEM',

    capabilitiesLabel: 'EN QUÈ ENS ESPECIALITZEM',
    capabilitiesTitle: 'Les nostres especialitats.',
    capabilities: [
      ['Forecasting & planning', 'Previsions de variables i escenaris per anticipar-ne l’evolució.'],
      ['Optimització', 'Models per escollir la millor alternativa segons objectius i restriccions.'],
      ['Machine learning', 'Models que aprenen de les dades per predir i detectar patrons.'],
      ['Intel·ligència artificial i automatització', 'Solucions d’IA i automatització adaptades als teus processos i eines.'],
      ['Analytics & BI', 'Visibilitat clara per seguir operacions, rendiment i decisions.'],
      ['Simulació i modelització', 'Escenaris i models per decidir abans de canviar una operació real.'],
    ],

    modelsLabel: 'FORMES DE COL·LABORAR',
    modelsTitle: 'Una col·laboració adaptada a la teva empresa.',
    models: [
      {
        title: 'Projecte individualitzat',
        hook: 'Resolem una necessitat concreta amb abast i resultat definits.',
        primary: 'Explica’ns el teu cas',
        primaryHref: '/contact?intent=problem',
      },
      {
        title: 'Partner Dades i IA',
        hook: 'Reforça el teu equip amb capacitat especialitzada, mantenint continuïtat i context.',
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
    finalBody: 'Primera trucada de 30 minuts, sense cost ni compromís.',
    finalCta: 'Explica’ns el teu cas',
  },

  en: {
    eyebrow: 'SERVICES',
    title: 'Understand before building.',
    intro: 'Forecasting, optimisation, data and AI for concrete business needs.',
    primary: 'Tell us about your problem',
    secondary: 'See success stories',

    processLabel: 'HOW WE DO IT',

    capabilitiesLabel: 'WHAT WE SPECIALISE IN',
    capabilitiesTitle: 'Our specialisms.',
    capabilities: [
      ['Forecasting & planning', 'Forecasts of variables and scenarios to anticipate how they evolve.'],
      ['Optimisation', 'Models for selecting the best alternative given objectives and constraints.'],
      ['Machine learning', 'Models that learn from data to predict outcomes and detect patterns.'],
      ['Artificial intelligence & automation', 'AI and automation solutions tailored to your processes and tools.'],
      ['Analytics & BI', 'Clear visibility into operations, performance and decisions.'],
      ['Simulation & modelling', 'Scenarios and models for deciding before changing a real operation.'],
    ],

    modelsLabel: 'WAYS TO WORK TOGETHER',
    modelsTitle: 'A collaboration suited to your business.',
    models: [
      {
        title: 'Defined project',
        hook: 'Solve one concrete need with a defined scope and outcome.',
        primary: 'Tell us about your case',
        primaryHref: '/contact?intent=problem',
      },
      {
        title: 'Data and AI Partner',
        hook: 'Strengthen your team with specialist capability while keeping continuity and context.',
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
    finalBody: 'A free 30-minute initial call, with no commitment.',
    finalCta: 'Tell us about your case',
  },
} as const

export default function ServicesPage() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]
  const process = SERVICES_PROCESS[lang]

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="site-container flex flex-col items-center gap-8 text-center py-16 md:py-20">
          <div className="max-w-4xl">
            <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">{t.eyebrow}</p>
            <h1 className="mt-5 text-[46px] leading-[1.03] tracking-[-0.03em] sm:text-[58px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
            <p className="mx-auto mt-6 max-w-3xl text-[19px] leading-8 text-[#EAF0F6]">{t.intro}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact?intent=problem" className="bg-white px-5 py-3 text-[15px] font-semibold text-[#0D1B2A] transition hover:bg-[#EAF0F6]">{t.primary}</Link>
            <Link href="/projects" className="border border-[#7F9BB5] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-white/5">{t.secondary}</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#FAFAF7]">
        <div className="site-container py-14 md:py-16">
          <div className="text-center">
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#254A66]">{t.processLabel}</p>
            <h2 className="mx-auto mt-3 max-w-4xl text-[36px] leading-[1.06] tracking-[-0.02em] sm:text-[44px]" style={{ fontFamily: 'var(--font-playfair)' }}>{process.title}</h2>
          </div>

          <div className="mt-9"><ProcessSequence steps={process.steps} /></div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="site-container py-14 md:py-16">
          <div className="grid gap-7 lg:grid-cols-[190px_1fr] lg:gap-10">
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#254A66]">{t.capabilitiesLabel}</p>
            <h2 className="max-w-4xl text-[34px] leading-[1.06] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.capabilitiesTitle}</h2>
          </div>

          <div className="mt-8 grid border-l border-t border-slate-300 md:grid-cols-2 lg:grid-cols-3">
            {t.capabilities.map(([title, body], index) => {
              const [description, examples, deliverable] = process.details[index]
              return (
                <article key={title} className={`flex flex-col border-b border-r border-slate-300 p-7 md:p-8 ${index % 2 === 0 ? 'bg-[#F4F1EA]' : 'bg-[#EAF0F6]'}`}>
                  <h3 className="min-h-[96px] text-[26px] font-semibold leading-8 text-slate-950">{title}</h3>
                  <p className="mt-4 min-h-[84px] text-[17px] leading-7 text-slate-700">{body}</p>
                  <details className="service-detail mt-6 border-t border-slate-300 pt-4">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 text-[16px] font-semibold text-[#254A66]">
                      <span>{process.expand}<span className="sr-only">: {title}</span></span>
                      <span aria-hidden="true" className="detail-symbol text-[24px]">+</span>
                    </summary>
                    <div className="pt-5 text-[16px] leading-7 text-slate-700">
                      <p>{description}</p>
                      <ul className="mt-4 list-disc space-y-2 pl-5">
                        {examples.map((example) => <li key={example}>{example}</li>)}
                      </ul>
                      <p className="mt-5 font-semibold text-[#0D1B2A]">{process.deliverable}</p>
                      <p className="mt-2">{deliverable}</p>
                      <Link href="/contact?intent=problem" className="mt-5 inline-flex font-semibold text-[#254A66]">{process.contact} →</Link>
                    </div>
                  </details>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="site-container py-14 md:py-16">
          <div className="grid gap-7 lg:grid-cols-[190px_1fr] lg:gap-10">
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#254A66]">{t.modelsLabel}</p>
            <h2 className="max-w-4xl text-[34px] leading-[1.06] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.modelsTitle}</h2>
          </div>

          <div className="mt-8 grid border-l border-t border-slate-300 lg:grid-cols-3">
            {t.models.map((model, index) => (
              <article
                key={model.title}
                className={`flex min-h-[265px] flex-col border-b border-r border-slate-300 p-7 md:p-8 ${index === 1 ? 'bg-[#0D1B2A] text-white' : 'bg-white text-slate-950'}`}
              >
                <h3
                  className={`min-h-[96px] text-[28px] leading-[1.08] ${index === 1 ? 'text-white' : 'text-slate-950'}`}
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {model.title}
                </h3>
                <p className={`mt-5 min-h-[112px] max-w-[31ch] text-[18px] font-semibold leading-7 ${index === 1 ? 'text-[#EAF0F6]' : 'text-slate-800'}`}>
                  {model.hook}
                </p>

                <div className={`mt-auto pt-7`}>
                  <Link
                    href={model.primaryHref}
                    className={`flex w-full items-center justify-between px-4 py-3.5 text-[15px] font-semibold transition ${index === 1 ? 'bg-white text-[#0D1B2A] hover:bg-[#EAF0F6]' : 'bg-[#0D1B2A] text-white hover:bg-[#254A66]'}`}
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
        <div className="site-container py-12 md:py-14">
          <div className="text-center">
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#254A66]">{t.exploreLabel}</p>
            <h2 className="mx-auto mt-3 max-w-3xl text-[32px] leading-[1.08] sm:text-[38px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.exploreTitle}</h2>
          </div>

          <div className="mx-auto mt-7 grid max-w-5xl gap-3 md:grid-cols-3">
            {t.exploreLinks.map(([title, href, cta], index) => {
              const middle = index === 1
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group relative flex min-h-[220px] flex-col justify-between border p-7 text-left transition duration-200 hover:z-10 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-lg active:scale-[1.005] ${middle ? 'border-[#CBD5E1] bg-[#EAF0F6] text-slate-950' : index === 0 ? 'border-[#CBD5E1] bg-[#F4F1EA] text-slate-950' : 'border-[#CBD5E1] bg-[#F4F1EA] text-slate-950'}`}
                >
                  <h3 className="min-h-[96px] max-w-[270px] text-[26px] font-semibold leading-8 text-slate-950">{title}</h3>
                  <p className="mt-8 text-[16px] font-semibold text-[#254A66]">
                    {cta} <span className="inline-block transition group-hover:translate-x-1">→</span>
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="site-container flex flex-col gap-7 py-10 md:flex-row md:items-end md:justify-between md:py-12">
          <div>
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#254A66]">{t.finalLabel}</p>
            <h2 className="mt-3 max-w-5xl text-[34px] font-medium leading-tight text-slate-950 sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.finalTitle}</h2>
            <p className="mt-4 max-w-3xl text-[17px] leading-7 text-slate-700">{t.finalBody}</p>
          </div>
          <Link href="/contact?intent=discovery" className="inline-flex shrink-0 bg-[#0D1B2A] px-6 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#254A66]">
            {t.finalCta} →
          </Link>
        </div>
      </section>
    </main>
  )
}
