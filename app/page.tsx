'use client'

import Link from 'next/link'
import ProcessSequence from '@/components/ProcessSequence'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'SC-ANALYTICS · CONSULTORÍA CUANTITATIVA Y TECNOLÓGICA',
    title: 'Mejores decisiones. Mejores resultados empresariales.',
    intro: 'Ayudamos a empresas a planificar mejor, optimizar operaciones y automatizar decisiones cuando los datos pueden generar impacto real.',
    primary: 'Contacta con nosotros',
    secondary: 'Conoce cómo trabajamos',
    note: 'Datos · Matemáticas · Inteligencia artificial · Automatización',

    snapshotLabel: 'QUÉ HACEMOS',
    snapshotTitle: 'De la necesidad a una solución operativa.',
    snapshotRows: [
      ['Comprender', 'Definimos qué debe mejorar.'],
      ['Diseñar', 'Elegimos el enfoque adecuado.'],
      ['Construir', 'Lo convertimos en un sistema utilizable.'],
      ['Mejorar', 'Medimos y refinamos lo que aporta valor.'],
    ],

    exploreLabel: 'EXPLORA SC-ANALYTICS',
    exploreTitle: 'Cinco formas de descubrir cómo podemos ayudarte.',
    routes: [
      {
        number: '01',
        title: 'Servicios',
        hook: 'Previsión, optimización, datos e inteligencia artificial.',
        href: '/services',
        cta: 'Ver cómo trabajamos',
        tone: 'paper',
      },
      {
        number: '02',
        title: 'Casos de éxito',
        hook: 'Proyectos explicados con resultados y evidencia técnica.',
        href: '/projects',
        cta: 'Explorar casos de éxito',
        tone: 'lavender',
      },
      {
        number: '03',
        title: 'Conocimiento',
        hook: 'Ideas y análisis sobre decisiones, operaciones, datos e inteligencia artificial.',
        href: '/knowledge',
        cta: 'Leer nuestros análisis',
        tone: 'white',
      },
      {
        number: '04',
        title: 'Partner Data e IA',
        hook: 'Capacidad especializada que se integra con tu organización cuando la necesitas.',
        href: '/partner-analitico',
        cta: 'Explorar el modelo partner',
        tone: 'blue',
      },
      {
        number: '05',
        title: 'Por qué SC-Analytics',
        hook: 'Rigor, claridad, especialización y responsabilidad sobre el resultado.',
        href: '/about',
        cta: 'Conocer SC-Analytics',
        tone: 'paper',
      },
    ],

    stayLabel: 'SIGUE EXPLORANDO',
    stayTitle: '¿Quieres saber más?',
    stayLinks: [
      ['LinkedIn', 'https://linkedin.com/in/arnausastre', true],
      ['Ver artículos', '/knowledge', false],
      ['Hablar con nosotros', '/contact', false],
    ],

    ctaKicker: 'SIN COMPROMISO',
    ctaTitle: 'Cuéntanos sobre tu empresa y vemos cómo podemos ayudarte.',
    cta: 'Cuéntanos tu caso',
    ctaAlt: 'Casos de éxito',
  },

  ca: {
    eyebrow: 'SC-ANALYTICS · CONSULTORIA QUANTITATIVA I TECNOLÒGICA',
    title: 'Millors decisions. Millors resultats empresarials.',
    intro: 'Ajudem empreses a planificar millor, optimitzar operacions i automatitzar decisions quan les dades poden generar impacte real.',
    primary: 'Contacta amb nosaltres',
    secondary: 'Coneix com treballem',
    note: 'Dades · Matemàtiques · Intel·ligència artificial · Automatització',

    snapshotLabel: 'QUÈ FEM',
    snapshotTitle: 'De la necessitat a una solució operativa.',
    snapshotRows: [
      ['Comprendre', 'Definim què ha de millorar.'],
      ['Dissenyar', 'Escollim l’enfocament adequat.'],
      ['Construir', 'Ho convertim en un sistema utilitzable.'],
      ['Millorar', 'Mesurem i refinem allò que aporta valor.'],
    ],

    exploreLabel: 'EXPLORA SC-ANALYTICS',
    exploreTitle: 'Cinc maneres de descobrir com et podem ajudar.',
    routes: [
      {
        number: '01',
        title: 'Serveis',
        hook: 'Previsió, optimització, dades i intel·ligència artificial.',
        href: '/services',
        cta: 'Veure com treballem',
        tone: 'paper',
      },
      {
        number: '02',
        title: 'Casos d’èxit',
        hook: 'Projectes explicats amb resultats i evidència tècnica.',
        href: '/projects',
        cta: 'Explorar casos d’èxit',
        tone: 'lavender',
      },
      {
        number: '03',
        title: 'Coneixement',
        hook: 'Idees i anàlisis sobre decisions, operacions, dades i intel·ligència artificial.',
        href: '/knowledge',
        cta: 'Llegir les nostres anàlisis',
        tone: 'white',
      },
      {
        number: '04',
        title: 'Partner Dades i IA',
        hook: 'Capacitat especialitzada que s’integra amb la teva organització quan la necessites.',
        href: '/partner-analitico',
        cta: 'Explorar el model partner',
        tone: 'blue',
      },
      {
        number: '05',
        title: 'Per què SC-Analytics',
        hook: 'Rigor, claredat, especialització i responsabilitat sobre el resultat.',
        href: '/about',
        cta: 'Conèixer SC-Analytics',
        tone: 'paper',
      },
    ],

    stayLabel: 'CONTINUA EXPLORANT',
    stayTitle: 'Vols saber-ne més?',
    stayLinks: [
      ['LinkedIn', 'https://linkedin.com/in/arnausastre', true],
      ['Veure articles', '/knowledge', false],
      ['Parlar amb nosaltres', '/contact', false],
    ],

    ctaKicker: 'SENSE COMPROMÍS',
    ctaTitle: 'Explica’ns la teva empresa i veiem com et podem ajudar.',
    cta: 'Explica’ns el teu cas',
    ctaAlt: 'Casos d’èxit',
  },

  en: {
    eyebrow: 'SC-ANALYTICS · QUANTITATIVE & TECHNOLOGY CONSULTING',
    title: 'Better decisions. Better business outcomes.',
    intro: 'We help companies plan better, improve operations and automate decisions when data can create real business impact.',
    primary: 'Contact us',
    secondary: 'See how we work',
    note: 'Data · Mathematics · Artificial intelligence · Automation',

    snapshotLabel: 'WHAT WE DO',
    snapshotTitle: 'From a business need to a working solution.',
    snapshotRows: [
      ['Understand', 'Define what needs to improve.'],
      ['Design', 'Choose the right approach.'],
      ['Build', 'Turn it into a usable system.'],
      ['Improve', 'Measure and refine what creates value.'],
    ],

    exploreLabel: 'EXPLORE SC-ANALYTICS',
    exploreTitle: 'Five ways to discover how we can help.',
    routes: [
      {
        number: '01',
        title: 'Services',
        hook: 'Forecasting, optimisation, data and artificial intelligence.',
        href: '/services',
        cta: 'See how we work',
        tone: 'paper',
      },
      {
        number: '02',
        title: 'Success stories',
        hook: 'Projects explained through results and technical evidence.',
        href: '/projects',
        cta: 'Explore success stories',
        tone: 'lavender',
      },
      {
        number: '03',
        title: 'Knowledge',
        hook: 'Ideas and analysis on decisions, operations, data and artificial intelligence.',
        href: '/knowledge',
        cta: 'Read our analysis',
        tone: 'white',
      },
      {
        number: '04',
        title: 'Data and AI Partner',
        hook: 'Specialist capability that integrates with your organisation when you need it.',
        href: '/partner-analitico',
        cta: 'Explore the partner model',
        tone: 'blue',
      },
      {
        number: '05',
        title: 'Why SC-Analytics',
        hook: 'Rigor, clarity, specialist depth and accountability for the outcome.',
        href: '/about',
        cta: 'Get to know SC-Analytics',
        tone: 'paper',
      },
    ],

    stayLabel: 'KEEP EXPLORING',
    stayTitle: 'Want to know more?',
    stayLinks: [
      ['LinkedIn', 'https://linkedin.com/in/arnausastre', true],
      ['Read articles', '/knowledge', false],
      ['Talk to us', '/contact', false],
    ],

    ctaKicker: 'NO COMMITMENT',
    ctaTitle: 'Tell us about your business and explore how we can help.',
    cta: 'Tell us about your case',
    ctaAlt: 'Success stories',
  },
} as const

const toneClasses = {
  paper: 'bg-[#EAF0F6] text-slate-950 hover:bg-[#DCE7F0]',
  lavender: 'bg-white text-slate-950 hover:bg-[#EAF0F6]',
  white: 'bg-white text-slate-950 hover:bg-slate-50',
  blue: 'bg-[#EAF0F6] text-slate-950 hover:bg-[#EAF0F6]',
} as const

export default function HomePage() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="site-container public-hero py-16 md:py-20">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">{t.eyebrow}</p>
            <h1 className="mt-5 max-w-6xl text-[46px] leading-[1.02] tracking-[-0.03em] text-white sm:text-[58px] lg:text-[68px]" style={{ fontFamily: 'var(--font-playfair)' }}>
              {t.title}
            </h1>
            <p className="mt-6 max-w-3xl text-[19px] leading-8 text-[#EAF0F6]">{t.intro}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact?intent=discovery" className="bg-white px-5 py-3 text-[15px] font-semibold text-[#0D1B2A] transition hover:bg-[#EAF0F6]">{t.primary}</Link>
              <Link href="/services" className="border border-[#7F9BB5] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-white/5">{t.secondary}</Link>
            </div>
            <p className="mt-5 text-[14px] font-medium uppercase tracking-[0.12em] text-[#7F9BB5]">{t.note}</p>
          </div>


        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="site-container py-14 md:py-16">
          <div className="text-center">
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#254A66]">{t.snapshotLabel}</p>
            <h2 className="mx-auto mt-3 max-w-5xl text-[36px] leading-tight sm:text-[44px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.snapshotTitle}</h2>
          </div>
          <div className="mt-9">
            <ProcessSequence steps={t.snapshotRows.map(([title, body], index) => [String(index + 1).padStart(2, '0'), title, body] as const)} />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F7F9FC]">
        <div className="site-container py-14 md:py-16">
          <div className="text-center">
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#254A66]">{t.exploreLabel}</p>
            <h2 className="mx-auto mt-2 max-w-5xl text-[34px] leading-[1.05] tracking-[-0.02em] text-slate-950 sm:text-[40px] xl:text-[42px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.exploreTitle}</h2>
          </div>

          <div className="mt-8 grid grid-cols-1 border-l border-t border-slate-300 md:grid-cols-12">
            {t.routes.map((route, index) => {
              const span = index < 2 ? 'md:col-span-6' : 'md:col-span-4'
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`group flex min-h-[250px] flex-col border-b border-r border-slate-300 p-6 transition md:p-7 ${span} ${toneClasses[route.tone as keyof typeof toneClasses]}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-mono text-[15px] font-semibold text-[#254A66]">{route.number}</span>
                    <span className="text-lg text-slate-400 transition group-hover:translate-x-1">→</span>
                  </div>
                  <h3 className="mt-6 min-h-[78px] text-[31px] leading-tight text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{route.title}</h3>
                  <p className="mt-4 flex-1 text-[19px] font-semibold leading-7 text-slate-900">{route.hook}</p>
                  <p className="mt-7 text-[18px] font-semibold text-[#254A66]">{route.cta} <span className="inline-block transition group-hover:translate-x-1">→</span></p>
                </Link>
              )
            })}
          </div>

          <div className="grid border-x border-b border-slate-300 bg-white lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="px-6 py-5 md:px-7">
              <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#254A66]">{t.stayLabel}</p>
              <h3 className="mt-1 text-[24px] font-semibold text-slate-950">{t.stayTitle}</h3>
            </div>
            <div className="flex flex-wrap border-t border-slate-300 lg:border-l lg:border-t-0">
              {t.stayLinks.map(([label, href, external]) => (
                external
                  ? <a key={href} href={href} target="_blank" rel="noreferrer" className="border-r border-slate-300 px-5 py-5 text-[14px] font-semibold text-slate-800 transition hover:bg-[#F7F9FC]">{label} ↗</a>
                  : <Link key={href} href={href} className="border-r border-slate-300 px-5 py-5 text-[14px] font-semibold text-slate-800 transition hover:bg-[#F7F9FC]">{label} →</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#EAF0F6]">
        <div className="site-container py-10 md:py-12">
          <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#254A66]">{t.ctaKicker}</p>
          <h2 className="mt-3 max-w-6xl text-[34px] font-medium leading-tight text-slate-950 sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.ctaTitle}</h2>
          <div className="mt-7 flex flex-col gap-4 border-t border-slate-300 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/projects" className="text-[16px] font-semibold text-[#254A66] transition hover:text-[#254A66]">
              {t.ctaAlt} →
            </Link>
            <Link href="/contact?intent=discovery" className="inline-flex bg-[#0D1B2A] px-6 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#254A66]">
              {t.cta} →
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
