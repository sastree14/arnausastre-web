'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'CÓMO TRABAJAMOS',
    title: 'Comprender antes de construir.',
    intro: 'Nuestra forma de trabajar parte de una idea sencilla: una buena solución empieza entendiendo qué decisión importa, por qué importa y qué complejidad merece realmente el problema.',
    primary: 'Hablar de un problema',
    secondary: 'Ver casos reales',

    mantraLabel: 'NUESTRO MANTRA',
    mantraTitle: 'Cuatro pasos que utilizamos como criterio de trabajo.',
    mantraIntro: 'No es una metodología decorativa. Es la forma de evitar empezar por una herramienta, construir demasiado o perder de vista el impacto.',
    steps: [
      ['01', 'Comprender', 'Negocio, decisión, usuarios, datos, restricciones y economía del problema.', 'Antes de hablar de tecnología, entendemos qué debería cambiar.'],
      ['02', 'Diseñar', 'Alternativas, alcance, arquitectura y criterio de éxito.', 'Elegimos la solución más simple que pueda resolver el problema con rigor.'],
      ['03', 'Construir', 'Desarrollo, validación, integración y documentación.', 'Construimos algo utilizable en operaciones reales, no una demo aislada.'],
      ['04', 'Mejorar', 'Impacto, límites, seguimiento y siguientes decisiones.', 'Evolucionamos solo cuando la evidencia justifica añadir más complejidad.'],
    ],

    capabilitiesLabel: 'CAPACIDAD SEGÚN EL PROBLEMA',
    capabilitiesTitle: 'Distintas decisiones requieren herramientas distintas.',
    capabilitiesIntro: 'Forecasting, optimización, machine learning o automatización no son productos cerrados. Son capacidades que activamos cuando encajan con el problema.',
    capabilities: [
      ['Forecasting & planning', 'Anticipar demanda, ventas, caja, inventario o capacidad.', 'Previsión → planificación'],
      ['Optimización', 'Asignar recursos, rutas, horarios, capacidad o presupuesto bajo restricciones.', 'Restricciones → decisión'],
      ['Machine learning', 'Predecir, clasificar o priorizar cuando el coste del error puede medirse.', 'Señales → acción'],
      ['Inteligencia artificial y automatización', 'Reducir trabajo manual y coordinar procesos con contexto, reglas y aprobación humana.', 'Proceso → automatización'],
      ['Analytics & BI', 'Entender qué está pasando, por qué y qué debería ocurrir después.', 'Datos → criterio'],
      ['Simulación y modelización', 'Probar escenarios y trade-offs antes de cambiar una operación real.', 'Escenario → decisión'],
    ],
    noBuild: 'Y si una solución operativa más sencilla resuelve el problema, si los datos no sostienen el caso o si el retorno no compensa la complejidad, también forma parte de nuestro trabajo decirlo.',

    modelsLabel: 'FORMAS DE COLABORAR',
    modelsTitle: 'Entra por el punto que más se parezca a tu situación.',
    models: [
      {
        title: 'Proyecto individualizado',
        hook: '¿Tienes un problema concreto que quieres resolver?',
        body: 'Definimos alcance, resultado esperado y una solución proporcional al problema. Sin convertir un proyecto claro en una relación más grande de lo necesario.',
        primary: 'Cuéntanoslo sin compromiso',
        primaryHref: '/contact?intent=problem',
        secondary: '¿No estás seguro? Mira nuestros casos',
        secondaryHref: '/projects',
      },
      {
        title: 'Partner analítico y tecnológico',
        hook: '¿Necesitas capacidad recurrente sin construir todo el equipo dentro?',
        body: 'Conservamos contexto entre proyectos y activamos la especialidad necesaria cuando aparece una nueva necesidad.',
        primary: 'Explorar el modelo partner',
        primaryHref: '/partner-analitico',
        secondary: 'Comprueba cómo pensamos en nuestros artículos',
        secondaryHref: '/knowledge',
      },
      {
        title: 'Discovery',
        hook: '¿Sabes que algo podría mejorar, pero todavía no sabes qué construir?',
        body: 'Empezamos entendiendo la oportunidad, las restricciones y si existe un caso razonable antes de proponer tecnología.',
        primary: 'Reservar una primera conversación',
        primaryHref: '/contact?intent=discovery',
        secondary: 'Ver por qué trabajamos así',
        secondaryHref: '/about',
      },
    ],

    evidenceLabel: '¿QUIERES SEGUIR EXPLORANDO?',
    evidenceTitle: 'Antes de contactar también puedes comprobar nuestro criterio.',
    evidenceLinks: [
      ['Casos', 'Ve problemas reales, decisiones y resultados con contexto.', '/projects', 'Explorar casos'],
      ['Conocimiento', 'Lee análisis que muestran cómo pensamos antes de construir.', '/knowledge', 'Leer artículos'],
      ['Por qué SC-Analytics', 'Entiende los principios detrás de nuestra forma de trabajar.', '/about', 'Conocernos mejor'],
    ],

    finalTitle: 'Trae el problema. La tecnología viene después.',
    finalBody: 'La primera conversación sirve para entender si existe una oportunidad real. Si no la hay, también es una respuesta útil.',
    finalCta: 'Empezar una conversación',
  },

  ca: {
    eyebrow: 'COM TREBALLEM',
    title: 'Comprendre abans de construir.',
    intro: 'La nostra manera de treballar parteix d’una idea senzilla: una bona solució comença entenent quina decisió importa, per què importa i quina complexitat mereix realment el problema.',
    primary: 'Parlar d’un problema',
    secondary: 'Veure casos reals',

    mantraLabel: 'EL NOSTRE MANTRA',
    mantraTitle: 'Quatre passos que utilitzem com a criteri de treball.',
    mantraIntro: 'No és una metodologia decorativa. És la manera d’evitar començar per una eina, construir massa o perdre de vista l’impacte.',
    steps: [
      ['01', 'Comprendre', 'Negoci, decisió, usuaris, dades, restriccions i economia del problema.', 'Abans de parlar de tecnologia, entenem què hauria de canviar.'],
      ['02', 'Dissenyar', 'Alternatives, abast, arquitectura i criteri d’èxit.', 'Triem la solució més simple que pugui resoldre el problema amb rigor.'],
      ['03', 'Construir', 'Desenvolupament, validació, integració i documentació.', 'Construïm alguna cosa utilitzable en operacions reals, no una demo aïllada.'],
      ['04', 'Millorar', 'Impacte, límits, seguiment i següents decisions.', 'Evolucionem només quan l’evidència justifica afegir més complexitat.'],
    ],

    capabilitiesLabel: 'CAPACITAT SEGONS EL PROBLEMA',
    capabilitiesTitle: 'Decisions diferents requereixen eines diferents.',
    capabilitiesIntro: 'Forecasting, optimització, machine learning o automatització no són productes tancats. Són capacitats que activem quan encaixen amb el problema.',
    capabilities: [
      ['Forecasting & planning', 'Anticipar demanda, vendes, caixa, inventari o capacitat.', 'Previsió → planificació'],
      ['Optimització', 'Assignar recursos, rutes, horaris, capacitat o pressupost sota restriccions.', 'Restriccions → decisió'],
      ['Machine learning', 'Predir, classificar o prioritzar quan el cost de l’error es pot mesurar.', 'Senyals → acció'],
      ['Intel·ligència artificial i automatització', 'Reduir feina manual i coordinar processos amb context, regles i aprovació humana.', 'Procés → automatització'],
      ['Analytics & BI', 'Entendre què passa, per què i què hauria de passar després.', 'Dades → criteri'],
      ['Simulació i modelització', 'Provar escenaris i trade-offs abans de canviar una operació real.', 'Escenari → decisió'],
    ],
    noBuild: 'I si una solució operativa més senzilla resol el problema, si les dades no sostenen el cas o si el retorn no compensa la complexitat, també forma part de la nostra feina dir-ho.',

    modelsLabel: 'FORMES DE COL·LABORAR',
    modelsTitle: 'Entra pel punt que més s’assembli a la teva situació.',
    models: [
      {
        title: 'Projecte individualitzat',
        hook: 'Tens un problema concret que vols resoldre?',
        body: 'Definim abast, resultat esperat i una solució proporcional al problema. Sense convertir un projecte clar en una relació més gran del necessari.',
        primary: 'Explica’ns-ho sense compromís',
        primaryHref: '/contact?intent=problem',
        secondary: 'No ho tens clar? Mira els nostres casos',
        secondaryHref: '/projects',
      },
      {
        title: 'Partner analític i tecnològic',
        hook: 'Necessites capacitat recurrent sense construir tot l’equip internament?',
        body: 'Conservem context entre projectes i activem l’especialitat necessària quan apareix una nova necessitat.',
        primary: 'Explorar el model partner',
        primaryHref: '/partner-analitico',
        secondary: 'Comprova com pensem als nostres articles',
        secondaryHref: '/knowledge',
      },
      {
        title: 'Discovery',
        hook: 'Saps que alguna cosa podria millorar, però encara no saps què construir?',
        body: 'Comencem entenent l’oportunitat, les restriccions i si existeix un cas raonable abans de proposar tecnologia.',
        primary: 'Reservar una primera conversa',
        primaryHref: '/contact?intent=discovery',
        secondary: 'Veure per què treballem així',
        secondaryHref: '/about',
      },
    ],

    evidenceLabel: 'VOLS SEGUIR EXPLORANT?',
    evidenceTitle: 'Abans de contactar també pots comprovar el nostre criteri.',
    evidenceLinks: [
      ['Casos', 'Veu problemes reals, decisions i resultats amb context.', '/projects', 'Explorar casos'],
      ['Coneixement', 'Llegeix anàlisis que mostren com pensem abans de construir.', '/knowledge', 'Llegir articles'],
      ['Per què SC-Analytics', 'Entén els principis darrere la nostra manera de treballar.', '/about', 'Conèixer-nos millor'],
    ],

    finalTitle: 'Porta el problema. La tecnologia ve després.',
    finalBody: 'La primera conversa serveix per entendre si existeix una oportunitat real. Si no n’hi ha, també és una resposta útil.',
    finalCta: 'Començar una conversa',
  },

  en: {
    eyebrow: 'HOW WE WORK',
    title: 'Understand before building.',
    intro: 'Our way of working starts with a simple idea: a good solution begins by understanding which decision matters, why it matters and how much complexity the problem actually deserves.',
    primary: 'Discuss a problem',
    secondary: 'See real cases',

    mantraLabel: 'OUR MANTRA',
    mantraTitle: 'Four steps we use as a working standard.',
    mantraIntro: 'This is not a decorative methodology. It is how we avoid starting with a tool, overbuilding or losing sight of the outcome.',
    steps: [
      ['01', 'Understand', 'Business, decision, users, data, constraints and economics.', 'Before discussing technology, we understand what should change.'],
      ['02', 'Design', 'Alternatives, scope, architecture and success criteria.', 'We choose the simplest solution that can solve the problem rigorously.'],
      ['03', 'Build', 'Development, validation, integration and documentation.', 'We build something usable in real operations, not an isolated demo.'],
      ['04', 'Improve', 'Impact, limitations, monitoring and next decisions.', 'We evolve only when evidence justifies adding complexity.'],
    ],

    capabilitiesLabel: 'CAPABILITY AROUND THE PROBLEM',
    capabilitiesTitle: 'Different decisions require different tools.',
    capabilitiesIntro: 'Forecasting, optimisation, machine learning or automation are not closed products. They are capabilities we activate when they fit the problem.',
    capabilities: [
      ['Forecasting & planning', 'Anticipate demand, sales, cash, inventory or capacity.', 'Forecast → planning'],
      ['Optimisation', 'Allocate resources, routes, schedules, capacity or budget under constraints.', 'Constraints → decision'],
      ['Machine learning', 'Predict, classify or prioritise when the cost of error can be measured.', 'Signals → action'],
      ['Artificial intelligence & automation', 'Reduce manual work and coordinate processes with context, rules and human approval.', 'Process → automation'],
      ['Analytics & BI', 'Understand what is happening, why and what should happen next.', 'Data → judgment'],
      ['Simulation & modelling', 'Test scenarios and trade-offs before changing a real operation.', 'Scenario → decision'],
    ],
    noBuild: 'And if a simpler operational change solves the problem, the data does not support the case or the expected return does not justify the complexity, saying so is part of the work too.',

    modelsLabel: 'WAYS TO WORK TOGETHER',
    modelsTitle: 'Enter through the option that looks most like your situation.',
    models: [
      {
        title: 'Defined project',
        hook: 'Do you have a concrete problem you want to solve?',
        body: 'We define scope, expected outcome and a proportionate solution without turning a clear project into a larger relationship than necessary.',
        primary: 'Tell us without commitment',
        primaryHref: '/contact?intent=problem',
        secondary: 'Not sure yet? Browse our cases',
        secondaryHref: '/projects',
      },
      {
        title: 'Analytical & technology partner',
        hook: 'Need recurring capability without building the entire team in-house?',
        body: 'We retain context between projects and activate the right specialism when a new need appears.',
        primary: 'Explore the partner model',
        primaryHref: '/partner-analitico',
        secondary: 'See how we think in our articles',
        secondaryHref: '/knowledge',
      },
      {
        title: 'Discovery',
        hook: 'Know something could improve, but not yet sure what to build?',
        body: 'We start by understanding the opportunity, constraints and whether there is a reasonable case before proposing technology.',
        primary: 'Book a first conversation',
        primaryHref: '/contact?intent=discovery',
        secondary: 'See why we work this way',
        secondaryHref: '/about',
      },
    ],

    evidenceLabel: 'WANT TO KEEP EXPLORING?',
    evidenceTitle: 'Before contacting us, you can also test our judgment.',
    evidenceLinks: [
      ['Case studies', 'See real problems, decisions and outcomes with context.', '/projects', 'Explore cases'],
      ['Knowledge', 'Read analysis that shows how we think before building.', '/knowledge', 'Read articles'],
      ['Why SC-Analytics', 'Understand the principles behind our way of working.', '/about', 'Get to know us'],
    ],

    finalTitle: 'Bring the problem. Technology comes later.',
    finalBody: 'The first conversation is about understanding whether a real opportunity exists. If it does not, that is useful information too.',
    finalCta: 'Start a conversation',
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
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">{t.eyebrow}</p>
            <h1 className="mt-5 text-[46px] leading-[1.03] tracking-[-0.03em] sm:text-[58px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
            <p className="mt-6 max-w-3xl text-[17px] leading-8 text-[#EAF0F6]">{t.intro}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact?intent=problem" className="bg-white px-5 py-3 text-[13px] font-semibold text-[#0D1B2A] transition hover:bg-[#EAF0F6]">{t.primary}</Link>
            <Link href="/projects" className="border border-[#7F9BB5] px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-white/5">{t.secondary}</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#FAFAF7]">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <div className="grid gap-7 lg:grid-cols-[190px_1fr] lg:gap-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.mantraLabel}</p>
            <div>
              <h2 className="max-w-4xl text-[36px] leading-[1.06] tracking-[-0.02em] sm:text-[44px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.mantraTitle}</h2>
              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">{t.mantraIntro}</p>
            </div>
          </div>

          <div className="mt-9 border-y border-slate-400">
            {t.steps.map(([number, title, body, statement], index) => (
              <article key={number} className="grid gap-4 border-b border-slate-300 py-6 last:border-b-0 md:grid-cols-[72px_170px_1fr_1fr] md:items-start">
                <span className="font-mono text-[12px] text-indigo-700">{number}</span>
                <h3 className="text-[24px] leading-tight text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h3>
                <p className="text-[14px] leading-7 text-slate-600">{body}</p>
                <p className={`border-l-2 pl-4 text-[14px] font-medium leading-7 ${index === 0 ? 'border-indigo-600 text-slate-950' : 'border-slate-300 text-slate-700'}`}>{statement}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <div className="grid gap-7 lg:grid-cols-[190px_1fr] lg:gap-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.capabilitiesLabel}</p>
            <div>
              <h2 className="max-w-4xl text-[34px] leading-[1.06] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.capabilitiesTitle}</h2>
              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">{t.capabilitiesIntro}</p>
            </div>
          </div>

          <div className="mt-8 grid border-l border-t border-slate-300 md:grid-cols-2 lg:grid-cols-3">
            {t.capabilities.map(([title, body, meta], index) => (
              <article key={title} className={`min-h-[205px] border-b border-r border-slate-300 p-6 ${index % 2 === 0 ? 'bg-[#FAFAF7]' : 'bg-white'}`}>
                <p className="font-mono text-[11px] text-indigo-700">0{index + 1}</p>
                <h3 className="mt-4 text-[20px] font-semibold leading-6 text-slate-950">{title}</h3>
                <p className="mt-3 text-[14px] leading-7 text-slate-600">{body}</p>
                <p className="mt-5 border-t border-slate-200 pt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-slate-400">{meta}</p>
              </article>
            ))}
          </div>

          <p className="mt-6 max-w-5xl border-l-2 border-indigo-600 pl-5 text-[14px] leading-7 text-slate-600">{t.noBuild}</p>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <div className="grid gap-7 lg:grid-cols-[190px_1fr] lg:gap-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.modelsLabel}</p>
            <h2 className="max-w-4xl text-[34px] leading-[1.06] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.modelsTitle}</h2>
          </div>

          <div className="mt-8 grid border-l border-t border-slate-300 lg:grid-cols-3">
            {t.models.map((model, index) => (
              <article key={model.title} className={`flex min-h-[365px] flex-col border-b border-r border-slate-300 p-6 md:p-7 ${index === 1 ? 'bg-[#0D1B2A] text-white' : 'bg-white text-slate-950'}`}>
                <p className={`font-mono text-[11px] ${index === 1 ? 'text-[#7A7DFF]' : 'text-indigo-700'}`}>0{index + 1}</p>
                <h3 className={`mt-5 text-[27px] leading-tight ${index === 1 ? 'text-white' : 'text-slate-950'}`} style={{ fontFamily: 'var(--font-playfair)' }}>{model.title}</h3>
                <p className={`mt-4 text-[15px] font-semibold leading-6 ${index === 1 ? 'text-white' : 'text-slate-800'}`}>{model.hook}</p>
                <p className={`mt-3 flex-1 text-[14px] leading-7 ${index === 1 ? 'text-[#A8BACB]' : 'text-slate-600'}`}>{model.body}</p>
                <Link href={model.primaryHref} className={`mt-6 inline-flex w-fit px-4 py-2.5 text-[12px] font-semibold ${index === 1 ? 'bg-white text-[#0D1B2A]' : 'bg-slate-950 text-white'}`}>{model.primary} →</Link>
                <Link href={model.secondaryHref} className={`mt-4 text-[12px] font-semibold ${index === 1 ? 'text-[#EAF0F6]' : 'text-indigo-700'}`}>{model.secondary} →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-14">
          <div className="grid gap-7 lg:grid-cols-[190px_1fr] lg:gap-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.evidenceLabel}</p>
            <div>
              <h2 className="max-w-3xl text-[30px] leading-[1.08] sm:text-[36px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.evidenceTitle}</h2>
              <div className="mt-7 grid border-t border-slate-300 md:grid-cols-3 md:divide-x md:divide-slate-300">
                {t.evidenceLinks.map(([title, body, href, cta]) => (
                  <Link key={href} href={href} className="group border-b border-slate-300 px-0 py-5 md:px-6 md:first:pl-0 md:last:pr-0">
                    <h3 className="text-[18px] font-semibold text-slate-950">{title}</h3>
                    <p className="mt-2 text-[13px] leading-6 text-slate-600">{body}</p>
                    <p className="mt-4 text-[12px] font-semibold text-indigo-700">{cta} <span className="inline-block transition group-hover:translate-x-1">→</span></p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-9 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[28px] leading-tight text-slate-950 sm:text-[32px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.finalTitle}</h2>
            <p className="mt-2 max-w-2xl text-[14px] leading-6 text-slate-600">{t.finalBody}</p>
          </div>
          <Link href="/contact?intent=discovery" className="inline-flex shrink-0 bg-slate-950 px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-slate-800">{t.finalCta}</Link>
        </div>
      </section>
    </main>
  )
}
