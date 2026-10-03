'use client'

import Link from 'next/link'
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
    snapshotTitle: 'Convertimos necesidades de negocio en sistemas que ayudan a decidir mejor.',
    snapshotRows: [
      ['Comprender', 'Entendemos qué quieres mejorar y qué decisión está detrás.'],
      ['Diseñar', 'Definimos el enfoque que puede generar más valor con sentido.'],
      ['Construir', 'Creamos sistemas, modelos y automatizaciones pensados para usarse.'],
      ['Mejorar', 'Medimos resultados y evolucionamos solo donde aporta valor.'],
    ],

    exploreLabel: 'EXPLORA SC-ANALYTICS',
    exploreTitle: 'Cinco formas de descubrir cómo podemos ayudarte.',
    exploreIntro: 'Entra por lo que más se parezca a lo que necesitas hoy: entender cómo trabajamos, revisar casos reales, aprender con nuestros análisis o valorar una relación de largo plazo.',
    routes: [
      {
        number: '01',
        title: 'Cómo trabajamos',
        hook: '¿Quieres saber cómo pasamos de un problema a una solución que genera impacto en tu empresa?',
        body: 'Entender bien. Diseñar con criterio. Construir para generar impacto.',
        href: '/services',
        cta: 'Ver cómo trabajamos',
        tone: 'paper',
      },
      {
        number: '02',
        title: 'Casos',
        hook: 'Mira en qué problemas hemos trabajado y qué decisiones tomamos para resolverlos.',
        body: 'Problemas reales, decisiones claras y resultados con contexto.',
        href: '/projects',
        cta: 'Explorar casos',
        tone: 'dark',
      },
      {
        number: '03',
        title: 'Conocimiento',
        hook: '¿Quieres ver cómo pensamos antes de hablar con nosotros?',
        body: 'Ideas y análisis sobre decisiones, operaciones, datos e inteligencia artificial.',
        href: '/knowledge',
        cta: 'Leer nuestros análisis',
        tone: 'white',
      },
      {
        number: '04',
        title: 'Partner analítico y tecnológico',
        hook: '¿Buscas un proveedor tecnológico y analítico con continuidad?',
        body: 'Capacidad especialista sin ampliar estructura interna.',
        href: '/partner-analitico',
        cta: 'Explorar las ventajas',
        tone: 'blue',
      },
      {
        number: '05',
        title: 'Por qué SC-Analytics',
        hook: 'Si vas a construir con alguien, también importa cómo piensa, cómo comunica y cómo responde.',
        body: 'Rigor, claridad y una relación pensada para durar.',
        href: '/about',
        cta: 'Conocer SC-Analytics',
        tone: 'paper',
      },
    ],

    stayLabel: 'SEGUIR EN CONTACTO',
    stayTitle: 'Sigue explorando o hablemos cuando tenga sentido.',
    stayBody: 'Puedes seguir nuestras publicaciones, ver novedades o contarnos directamente qué estás valorando.',
    stayLinks: [
      ['LinkedIn', 'https://linkedin.com/in/arnausastre', true],
      ['Ver artículos', '/knowledge', false],
      ['Hablar con nosotros', '/contact', false],
    ],

    flowLabel: 'DE PROBLEMA A IMPACTO',
    flowTitle: 'Del reto de negocio a una solución que genera impacto.',
    flow: [
      ['Problema', 'Entendemos qué quieres mejorar, qué decisión está detrás y qué está limitando el resultado.'],
      ['Sistema', 'Diseñamos la combinación adecuada de datos, modelos y automatización para resolverlo con sentido.'],
      ['Impacto', 'Lo llevamos a una solución utilizable, medible y orientada a mejorar cómo opera tu empresa.'],
    ],

    ctaKicker: 'SIN COMPROMISO',
    ctaTitle: 'Cuéntanos sobre tu empresa y vemos cómo podemos ayudarte.',
    ctaBody: 'Explícanos qué quieres mejorar, qué oportunidad estás valorando o qué te preocupa. Te diremos con claridad si vemos una forma razonable de aportar valor.',
    cta: 'Cuéntanos tu caso',
    ctaAlt: '¿Prefieres seguir explorando? Mira nuestros casos',
  },

  ca: {
    eyebrow: 'SC-ANALYTICS · CONSULTORIA QUANTITATIVA I TECNOLÒGICA',
    title: 'Millors decisions. Millors resultats empresarials.',
    intro: 'Ajudem empreses a planificar millor, optimitzar operacions i automatitzar decisions quan les dades poden generar impacte real.',
    primary: 'Contacta amb nosaltres',
    secondary: 'Coneix com treballem',
    note: 'Dades · Matemàtiques · Intel·ligència artificial · Automatització',

    snapshotLabel: 'QUÈ FEM',
    snapshotTitle: 'Convertim necessitats de negoci en sistemes que ajuden a decidir millor.',
    snapshotRows: [
      ['Comprendre', 'Entenem què vols millorar i quina decisió hi ha al darrere.'],
      ['Dissenyar', 'Definim l’enfocament que pot generar més valor amb sentit.'],
      ['Construir', 'Creem sistemes, models i automatitzacions pensats per utilitzar-se.'],
      ['Millorar', 'Mesurem resultats i evolucionem només on aporta valor.'],
    ],

    exploreLabel: 'EXPLORA SC-ANALYTICS',
    exploreTitle: 'Cinc maneres de descobrir com et podem ajudar.',
    exploreIntro: 'Entra pel que més s’assembli al que necessites avui: entendre com treballem, revisar casos reals, aprendre amb les nostres anàlisis o valorar una relació a llarg termini.',
    routes: [
      {
        number: '01',
        title: 'Com treballem',
        hook: 'Vols saber com passem d’un problema a una solució que genera impacte a la teva empresa?',
        body: 'Entendre bé. Dissenyar amb criteri. Construir per generar impacte.',
        href: '/services',
        cta: 'Veure com treballem',
        tone: 'paper',
      },
      {
        number: '02',
        title: 'Casos',
        hook: 'Mira en quins problemes hem treballat i quines decisions vam prendre per resoldre’ls.',
        body: 'Problemes reals, decisions clares i resultats amb context.',
        href: '/projects',
        cta: 'Explorar casos',
        tone: 'dark',
      },
      {
        number: '03',
        title: 'Coneixement',
        hook: 'Vols veure com pensem abans de parlar amb nosaltres?',
        body: 'Idees i anàlisis sobre decisions, operacions, dades i intel·ligència artificial.',
        href: '/knowledge',
        cta: 'Llegir les nostres anàlisis',
        tone: 'white',
      },
      {
        number: '04',
        title: 'Partner analític i tecnològic',
        hook: 'Busques un proveïdor tecnològic i analític amb continuïtat?',
        body: 'Capacitat especialista sense ampliar estructura interna.',
        href: '/partner-analitico',
        cta: 'Explorar els avantatges',
        tone: 'blue',
      },
      {
        number: '05',
        title: 'Per què SC-Analytics',
        hook: 'Si construiràs amb algú, també importa com pensa, com comunica i com respon.',
        body: 'Rigor, claredat i una relació pensada per durar.',
        href: '/about',
        cta: 'Conèixer SC-Analytics',
        tone: 'paper',
      },
    ],

    stayLabel: 'SEGUIR EN CONTACTE',
    stayTitle: 'Continua explorant o parlem quan tingui sentit.',
    stayBody: 'Pots seguir les nostres publicacions, veure novetats o explicar-nos directament què estàs valorant.',
    stayLinks: [
      ['LinkedIn', 'https://linkedin.com/in/arnausastre', true],
      ['Veure articles', '/knowledge', false],
      ['Parlar amb nosaltres', '/contact', false],
    ],

    flowLabel: 'DE PROBLEMA A IMPACTE',
    flowTitle: 'Del repte de negoci a una solució que genera impacte.',
    flow: [
      ['Problema', 'Entenem què vols millorar, quina decisió hi ha al darrere i què està limitant el resultat.'],
      ['Sistema', 'Dissenyem la combinació adequada de dades, models i automatització per resoldre-ho amb sentit.'],
      ['Impacte', 'Ho portem a una solució utilitzable, mesurable i orientada a millorar com opera la teva empresa.'],
    ],

    ctaKicker: 'SENSE COMPROMÍS',
    ctaTitle: 'Explica’ns la teva empresa i veiem com et podem ajudar.',
    ctaBody: 'Explica’ns què vols millorar, quina oportunitat estàs valorant o què et preocupa. Et direm amb claredat si veiem una manera raonable d’aportar valor.',
    cta: 'Explica’ns el teu cas',
    ctaAlt: 'Prefereixes seguir explorant? Mira els nostres casos',
  },

  en: {
    eyebrow: 'SC-ANALYTICS · QUANTITATIVE & TECHNOLOGY CONSULTING',
    title: 'Better decisions. Better business outcomes.',
    intro: 'We help companies plan better, improve operations and automate decisions when data can create real business impact.',
    primary: 'Contact us',
    secondary: 'See how we work',
    note: 'Data · Mathematics · Artificial intelligence · Automation',

    snapshotLabel: 'WHAT WE DO',
    snapshotTitle: 'We turn business needs into systems that help people make better decisions.',
    snapshotRows: [
      ['Understand', 'We clarify what should improve and which decision sits behind it.'],
      ['Design', 'We define the approach most likely to create meaningful value.'],
      ['Build', 'We create systems, models and automations designed to be used.'],
      ['Improve', 'We measure outcomes and evolve only where it creates value.'],
    ],

    exploreLabel: 'EXPLORE SC-ANALYTICS',
    exploreTitle: 'Five ways to discover how we can help.',
    exploreIntro: 'Start with what looks most like what you need today: understand how we work, review real cases, learn from our analysis or explore a long-term relationship.',
    routes: [
      {
        number: '01',
        title: 'How we work',
        hook: 'Want to see how we turn a problem into a solution that creates real impact?',
        body: 'Understand well. Design with judgment. Build for impact.',
        href: '/services',
        cta: 'See how we work',
        tone: 'paper',
      },
      {
        number: '02',
        title: 'Case studies',
        hook: 'See which problems we have worked on and the decisions we made to solve them.',
        body: 'Real problems, clear decisions and outcomes with context.',
        href: '/projects',
        cta: 'Explore case studies',
        tone: 'dark',
      },
      {
        number: '03',
        title: 'Knowledge',
        hook: 'Want to see how we think before talking to us?',
        body: 'Ideas and analysis on decisions, operations, data and artificial intelligence.',
        href: '/knowledge',
        cta: 'Read our analysis',
        tone: 'white',
      },
      {
        number: '04',
        title: 'Analytics & technology partner',
        hook: 'Looking for ongoing technology and analytical capability?',
        body: 'Specialist capability without expanding internal structure.',
        href: '/partner-analitico',
        cta: 'Explore the advantages',
        tone: 'blue',
      },
      {
        number: '05',
        title: 'Why SC-Analytics',
        hook: 'If you are going to build with someone, how they think, communicate and respond matters too.',
        body: 'Rigor, clarity and a relationship designed to last.',
        href: '/about',
        cta: 'Get to know SC-Analytics',
        tone: 'paper',
      },
    ],

    stayLabel: 'STAY CONNECTED',
    stayTitle: 'Keep exploring or talk to us when it makes sense.',
    stayBody: 'Follow our publications, see what we are working on or tell us directly what you are considering.',
    stayLinks: [
      ['LinkedIn', 'https://linkedin.com/in/arnausastre', true],
      ['Read articles', '/knowledge', false],
      ['Talk to us', '/contact', false],
    ],

    flowLabel: 'FROM PROBLEM TO IMPACT',
    flowTitle: 'From a business challenge to a solution that creates impact.',
    flow: [
      ['Problem', 'We understand what should improve, which decision sits behind it and what is limiting the outcome.'],
      ['System', 'We design the right combination of data, models and automation to solve it sensibly.'],
      ['Impact', 'We turn it into a usable, measurable solution designed to improve how the business operates.'],
    ],

    ctaKicker: 'NO COMMITMENT',
    ctaTitle: 'Tell us about your business and let’s see how we can help.',
    ctaBody: 'Tell us what you want to improve, which opportunity you are considering or what is getting in the way. We will tell you clearly whether we see a sensible way to create value.',
    cta: 'Tell us about your case',
    ctaAlt: 'Prefer to keep exploring? Browse our case studies',
  },
} as const

const toneClasses = {
  paper: 'bg-[#F4F1EA] text-slate-950 hover:bg-[#EEEAE1]',
  dark: 'bg-[#0D1B2A] text-white hover:bg-[#13283B]',
  white: 'bg-white text-slate-950 hover:bg-slate-50',
  blue: 'bg-[#EAF0F6] text-slate-950 hover:bg-[#DFE8F0]',
} as const

export default function HomePage() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:py-20 lg:grid-cols-[1.08fr_.92fr] lg:items-stretch">
          <div className="flex flex-col justify-end">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">{t.eyebrow}</p>
            <h1 className="mt-5 max-w-4xl text-[46px] leading-[1.02] tracking-[-0.03em] text-white sm:text-[58px] lg:text-[68px]" style={{ fontFamily: 'var(--font-playfair)' }}>
              {t.title}
            </h1>
            <p className="mt-6 max-w-3xl text-[19px] leading-8 text-[#EAF0F6]">{t.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact?intent=discovery" className="bg-white px-5 py-3 text-[15px] font-semibold text-[#0D1B2A] transition hover:bg-[#EAF0F6]">{t.primary}</Link>
              <Link href="/services" className="border border-[#7F9BB5] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-white/5">{t.secondary}</Link>
            </div>
            <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#7F9BB5]">{t.note}</p>
          </div>

          <aside className="flex h-full flex-col border-t border-[#5E86A8] pt-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{t.snapshotLabel}</p>
            <h2 className="mt-3 max-w-xl text-[28px] leading-[1.12] text-white sm:text-[32px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.snapshotTitle}</h2>
            <div className="mt-5 grid flex-1 grid-rows-4 border-t border-[#496C8A]">
              {t.snapshotRows.map(([title, body], index) => (
                <div key={title} className="grid min-h-[74px] grid-cols-[34px_105px_1fr] items-center gap-3 border-b border-[#496C8A] py-3.5">
                  <span className="font-mono text-[11px] text-[#7F9BB5]">0{index + 1}</span>
                  <p className="text-[15px] font-semibold text-white">{title}</p>
                  <p className="text-[15px] leading-6 text-[#D5E1EB]">{body}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#FAFAF7]">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <div className="grid gap-6 lg:grid-cols-[190px_1fr] lg:gap-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.exploreLabel}</p>
            <div>
              <h2 className="text-[34px] leading-[1.05] tracking-[-0.02em] text-slate-950 sm:text-[40px] xl:whitespace-nowrap xl:text-[42px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.exploreTitle}</h2>
              <p className="mt-4 max-w-4xl text-[17px] leading-7 text-slate-700">{t.exploreIntro}</p>
            </div>
          </div>

          <div className="mt-9 grid grid-cols-1 border-l border-t border-slate-300 md:grid-cols-12">
            {t.routes.map((route, index) => {
              const span = index < 2 ? 'md:col-span-6' : 'md:col-span-4'
              const dark = route.tone === 'dark'
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`group flex min-h-[260px] flex-col border-b border-r border-slate-300 p-6 transition md:p-7 ${span} ${toneClasses[route.tone as keyof typeof toneClasses]}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className={`font-mono text-[15px] font-semibold ${dark ? 'text-[#8E91FF]' : 'text-indigo-700'}`}>{route.number}</span>
                    <span className={`text-lg transition group-hover:translate-x-1 ${dark ? 'text-[#A8BACB]' : 'text-slate-400'}`}>→</span>
                  </div>
                  <h3 className={`mt-6 text-[31px] leading-tight ${dark ? 'text-white' : 'text-slate-950'}`} style={{ fontFamily: 'var(--font-playfair)' }}>{route.title}</h3>
                  <p className={`mt-4 flex-1 text-[19px] font-semibold leading-7 ${dark ? 'text-white' : 'text-slate-900'}`}>{route.hook}</p>
                  <p className={`mt-7 text-[18px] font-semibold ${dark ? 'text-white' : 'text-indigo-700'}`}>{route.cta} <span className="inline-block transition group-hover:translate-x-1">→</span></p>
                </Link>
              )
            })}
          </div>

          <div className="grid border-x border-b border-slate-300 bg-white lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="px-6 py-5 md:px-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.stayLabel}</p>
              <h3 className="mt-1 text-[22px] font-semibold text-slate-950">{t.stayTitle}</h3>
              <p className="mt-1 text-[16px] leading-7 text-slate-600">{t.stayBody}</p>
            </div>
            <div className="flex flex-wrap border-t border-slate-300 lg:border-l lg:border-t-0">
              {t.stayLinks.map(([label, href, external]) => (
                external
                  ? <a key={href} href={href} target="_blank" rel="noreferrer" className="border-r border-slate-300 px-5 py-5 text-[14px] font-semibold text-slate-800 transition hover:bg-[#FAFAF7]">{label} ↗</a>
                  : <Link key={href} href={href} className="border-r border-slate-300 px-5 py-5 text-[14px] font-semibold text-slate-800 transition hover:bg-[#FAFAF7]">{label} →</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <div className="text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.flowLabel}</p>
            <h2 className="mx-auto mt-3 max-w-4xl text-[34px] leading-[1.07] tracking-[-0.02em] text-slate-950 sm:text-[42px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.flowTitle}</h2>
          </div>

          <div className="mx-auto mt-8 grid max-w-5xl border-l border-t border-slate-300 lg:grid-cols-3">
            {t.flow.map(([title, body], index) => (
              <div key={title} className={`flex min-h-[230px] flex-col items-center justify-center border-b border-r border-slate-300 p-7 text-center ${index === 1 ? 'bg-[#F4F1EA]' : 'bg-white'}`}>
                <h3 className="text-[31px] leading-tight text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h3>
                <p className="mt-4 max-w-[270px] text-[17px] font-medium leading-7 text-slate-800">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-12">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.ctaKicker}</p>
          <h2 className="mt-3 text-[34px] font-medium leading-tight text-slate-950 sm:text-[40px] xl:whitespace-nowrap" style={{ fontFamily: 'var(--font-playfair)' }}>{t.ctaTitle}</h2>

          <div className="mt-7 flex flex-col gap-4 border-t border-slate-300 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/projects" className="text-[16px] font-semibold text-indigo-700 transition hover:text-indigo-900">
              {t.ctaAlt} →
            </Link>
            <Link href="/contact?intent=discovery" className="inline-flex bg-slate-950 px-6 py-3.5 text-[16px] font-semibold text-white transition hover:bg-slate-800">
              {t.cta} →
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
