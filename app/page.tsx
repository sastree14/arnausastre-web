'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'SC-ANALYTICS · CONSULTORÍA CUANTITATIVA Y TECNOLÓGICA',
    title: 'Mejores decisiones. Mejores resultados empresariales.',
    intro: 'Ayudamos a empresas a entender mejor su negocio, planificar con más precisión, optimizar operaciones y automatizar procesos cuando los datos pueden marcar una diferencia real.',
    primary: 'Hablar con nosotros',
    secondary: 'Conocer cómo trabajamos',
    note: 'Datos · Matemáticas · Inteligencia artificial · Automatización',

    snapshotLabel: 'QUÉ HACEMOS',
    snapshotTitle: 'Convertimos problemas de negocio en sistemas que ayudan a decidir mejor.',
    snapshotRows: [
      ['Comprender', 'Qué está pasando y qué decisión realmente importa.'],
      ['Diseñar', 'Qué enfoque aporta valor sin añadir complejidad innecesaria.'],
      ['Construir', 'Modelos, automatizaciones y sistemas utilizables en operaciones reales.'],
      ['Mejorar', 'Medir impacto, aprender y evolucionar solo donde tiene sentido.'],
    ],

    exploreLabel: 'EXPLORA SC-ANALYTICS',
    exploreTitle: 'Cinco formas de entender si podemos ayudarte.',
    exploreIntro: 'Mira cómo trabajamos, revisa problemas que ya hemos abordado, aprende con nuestros análisis o descubre si necesitas una capacidad tecnológica externa.',
    routes: [
      {
        number: '01',
        title: 'Cómo trabajamos',
        hook: '¿Quieres saber cómo pasamos de un problema a una solución que se usa de verdad?',
        body: 'Nuestro mantra, las capacidades que activamos y las formas de colaborar con nosotros.',
        href: '/services',
        cta: 'Descubrir nuestro enfoque',
        tone: 'paper',
      },
      {
        number: '02',
        title: 'Casos',
        hook: 'Mira en qué problemas hemos trabajado y cómo tomamos decisiones.',
        body: 'Contexto, arquitectura, criterio y resultados explicados sin convertirlo en una galería de logos.',
        href: '/projects',
        cta: 'Explorar casos',
        tone: 'dark',
      },
      {
        number: '03',
        title: 'Conocimiento',
        hook: '¿Quieres comprobar cómo pensamos antes de hablar con nosotros?',
        body: 'Artículos y análisis sobre forecasting, operaciones, optimización, automatización e inteligencia artificial.',
        href: '/knowledge',
        cta: 'Aprender con nuestros análisis',
        tone: 'white',
      },
      {
        number: '04',
        title: 'Partner Data & AI',
        hook: '¿Buscas un proveedor tecnológico y analítico con continuidad?',
        body: 'Amplía capacidad sin construir todo el equipo dentro y conserva contexto entre proyectos.',
        href: '/partner-analitico',
        cta: 'Explorar las ventajas',
        tone: 'blue',
      },
      {
        number: '05',
        title: 'Por qué SC-Analytics',
        hook: 'Si vas a construir con alguien, también importa cómo piensa y cómo trabaja.',
        body: 'Criterio, rigor, transparencia y una forma de trabajar orientada a relaciones de largo plazo.',
        href: '/about',
        cta: 'Entender por qué nosotros',
        tone: 'paper',
      },
    ],

    flowLabel: 'DE PROBLEMA A RESULTADO',
    flowTitle: 'La tecnología ocupa el centro del proceso, no el centro de la conversación.',
    flow: [
      ['01', 'Problema', 'Una decisión, proceso o restricción está frenando el negocio.', 'Demanda · riesgo · capacidad · operaciones'],
      ['02', 'Sistema', 'Elegimos la capacidad adecuada para mejorar esa situación.', 'Forecasting · optimización · ML · automatización'],
      ['03', 'Resultado', 'El sistema debe producir una mejora que pueda entenderse y utilizarse.', 'Control · velocidad · precisión · eficiencia'],
    ],

    ctaKicker: 'PRIMERA CONVERSACIÓN',
    ctaTitle: '¿Hay algo en tu negocio que debería funcionar mejor?',
    ctaBody: 'Cuéntanos el contexto. No necesitas llegar con una solución definida y la primera conversación es sin compromiso.',
    cta: 'Empezar una conversación',
    ctaAlt: '¿Todavía quieres explorar? Mira nuestros casos',
  },

  ca: {
    eyebrow: 'SC-ANALYTICS · CONSULTORIA QUANTITATIVA I TECNOLÒGICA',
    title: 'Millors decisions. Millors resultats empresarials.',
    intro: 'Ajudem empreses a entendre millor el seu negoci, planificar amb més precisió, optimitzar operacions i automatitzar processos quan les dades poden marcar una diferència real.',
    primary: 'Parlar amb nosaltres',
    secondary: 'Conèixer com treballem',
    note: 'Dades · Matemàtiques · Intel·ligència artificial · Automatització',

    snapshotLabel: 'QUÈ FEM',
    snapshotTitle: 'Convertim problemes de negoci en sistemes que ajuden a decidir millor.',
    snapshotRows: [
      ['Comprendre', 'Què està passant i quina decisió realment importa.'],
      ['Dissenyar', 'Quin enfocament aporta valor sense afegir complexitat innecessària.'],
      ['Construir', 'Models, automatitzacions i sistemes utilitzables en operacions reals.'],
      ['Millorar', 'Mesurar impacte, aprendre i evolucionar només on té sentit.'],
    ],

    exploreLabel: 'EXPLORA SC-ANALYTICS',
    exploreTitle: 'Cinc maneres d’entendre si et podem ajudar.',
    exploreIntro: 'Mira com treballem, revisa problemes que ja hem abordat, aprèn amb les nostres anàlisis o descobreix si necessites capacitat tecnològica externa.',
    routes: [
      {
        number: '01',
        title: 'Com treballem',
        hook: 'Vols saber com passem d’un problema a una solució que s’utilitza de veritat?',
        body: 'El nostre mantra, les capacitats que activem i les formes de col·laborar amb nosaltres.',
        href: '/services',
        cta: 'Descobrir el nostre enfocament',
        tone: 'paper',
      },
      {
        number: '02',
        title: 'Casos',
        hook: 'Mira en quins problemes hem treballat i com prenem decisions.',
        body: 'Context, arquitectura, criteri i resultats explicats sense convertir-ho en una galeria de logos.',
        href: '/projects',
        cta: 'Explorar casos',
        tone: 'dark',
      },
      {
        number: '03',
        title: 'Coneixement',
        hook: 'Vols comprovar com pensem abans de parlar amb nosaltres?',
        body: 'Articles i anàlisis sobre forecasting, operacions, optimització, automatització i intel·ligència artificial.',
        href: '/knowledge',
        cta: 'Aprendre amb les nostres anàlisis',
        tone: 'white',
      },
      {
        number: '04',
        title: 'Partner Data & AI',
        hook: 'Busques un proveïdor tecnològic i analític amb continuïtat?',
        body: 'Amplia capacitat sense construir tot l’equip internament i conserva context entre projectes.',
        href: '/partner-analitico',
        cta: 'Explorar els avantatges',
        tone: 'blue',
      },
      {
        number: '05',
        title: 'Per què SC-Analytics',
        hook: 'Si construiràs amb algú, també importa com pensa i com treballa.',
        body: 'Criteri, rigor, transparència i una manera de treballar orientada a relacions a llarg termini.',
        href: '/about',
        cta: 'Entendre per què nosaltres',
        tone: 'paper',
      },
    ],

    flowLabel: 'DE PROBLEMA A RESULTAT',
    flowTitle: 'La tecnologia ocupa el centre del procés, no el centre de la conversa.',
    flow: [
      ['01', 'Problema', 'Una decisió, procés o restricció està frenant el negoci.', 'Demanda · risc · capacitat · operacions'],
      ['02', 'Sistema', 'Triem la capacitat adequada per millorar aquesta situació.', 'Forecasting · optimització · ML · automatització'],
      ['03', 'Resultat', 'El sistema ha de produir una millora que es pugui entendre i utilitzar.', 'Control · velocitat · precisió · eficiència'],
    ],

    ctaKicker: 'PRIMERA CONVERSA',
    ctaTitle: 'Hi ha alguna cosa al teu negoci que hauria de funcionar millor?',
    ctaBody: 'Explica’ns el context. No cal arribar amb una solució definida i la primera conversa és sense compromís.',
    cta: 'Començar una conversa',
    ctaAlt: 'Encara vols explorar? Mira els nostres casos',
  },

  en: {
    eyebrow: 'SC-ANALYTICS · QUANTITATIVE & TECHNOLOGY CONSULTING',
    title: 'Better decisions. Better business outcomes.',
    intro: 'We help companies understand their business better, plan with more precision, improve operations and automate processes when data can create a meaningful advantage.',
    primary: 'Talk to us',
    secondary: 'See how we work',
    note: 'Data · Mathematics · Artificial intelligence · Automation',

    snapshotLabel: 'WHAT WE DO',
    snapshotTitle: 'We turn business problems into systems that help people make better decisions.',
    snapshotRows: [
      ['Understand', 'What is happening and which decision actually matters.'],
      ['Design', 'Which approach creates value without unnecessary complexity.'],
      ['Build', 'Models, automations and systems that work in real operations.'],
      ['Improve', 'Measure impact, learn and evolve only where it makes sense.'],
    ],

    exploreLabel: 'EXPLORE SC-ANALYTICS',
    exploreTitle: 'Five ways to decide whether we can help.',
    exploreIntro: 'See how we work, review problems we have tackled, learn from our analysis or explore whether you need an external technology capability.',
    routes: [
      {
        number: '01',
        title: 'How we work',
        hook: 'Want to see how we turn a problem into something people actually use?',
        body: 'Our mantra, the capabilities we activate and the ways companies work with us.',
        href: '/services',
        cta: 'Explore our approach',
        tone: 'paper',
      },
      {
        number: '02',
        title: 'Case studies',
        hook: 'See which problems we have worked on and how decisions were made.',
        body: 'Context, architecture, judgment and outcomes explained without turning the page into a logo gallery.',
        href: '/projects',
        cta: 'Explore case studies',
        tone: 'dark',
      },
      {
        number: '03',
        title: 'Knowledge',
        hook: 'Want to see how we think before you talk to us?',
        body: 'Articles and analysis on forecasting, operations, optimisation, automation and artificial intelligence.',
        href: '/knowledge',
        cta: 'Learn from our analysis',
        tone: 'white',
      },
      {
        number: '04',
        title: 'Data & AI Partner',
        hook: 'Looking for ongoing technology and analytical capability?',
        body: 'Expand capability without building the whole team in-house and retain context between projects.',
        href: '/partner-analitico',
        cta: 'Explore the advantages',
        tone: 'blue',
      },
      {
        number: '05',
        title: 'Why SC-Analytics',
        hook: 'If you are going to build with someone, how they think and work matters too.',
        body: 'Judgment, rigor, transparency and a way of working designed around long-term relationships.',
        href: '/about',
        cta: 'Understand why us',
        tone: 'paper',
      },
    ],

    flowLabel: 'FROM PROBLEM TO OUTCOME',
    flowTitle: 'Technology sits at the centre of the process, not at the centre of the conversation.',
    flow: [
      ['01', 'Problem', 'A decision, process or constraint is holding the business back.', 'Demand · risk · capacity · operations'],
      ['02', 'System', 'We select the right capability to improve that situation.', 'Forecasting · optimisation · ML · automation'],
      ['03', 'Outcome', 'The system should produce an improvement people can understand and use.', 'Control · speed · precision · efficiency'],
    ],

    ctaKicker: 'FIRST CONVERSATION',
    ctaTitle: 'Is there something in the business that should work better?',
    ctaBody: 'Tell us the context. You do not need to arrive with a predefined solution and the first conversation is without commitment.',
    cta: 'Start a conversation',
    ctaAlt: 'Still exploring? Browse our case studies',
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
            <p className="mt-6 max-w-3xl text-[17px] leading-8 text-[#EAF0F6]">{t.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact?intent=discovery" className="bg-white px-5 py-3 text-[14px] font-semibold text-[#0D1B2A] transition hover:bg-[#EAF0F6]">{t.primary}</Link>
              <Link href="/services" className="border border-[#7F9BB5] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-white/5">{t.secondary}</Link>
            </div>
            <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#7F9BB5]">{t.note}</p>
          </div>

          <aside className="flex h-full flex-col border-y border-[#5E86A8] py-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{t.snapshotLabel}</p>
            <h2 className="mt-3 max-w-xl text-[28px] leading-[1.12] text-white sm:text-[32px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.snapshotTitle}</h2>
            <div className="mt-5 grid flex-1 grid-rows-4 border-t border-[#496C8A]">
              {t.snapshotRows.map(([title, body], index) => (
                <div key={title} className="grid min-h-[74px] grid-cols-[34px_105px_1fr] items-center gap-3 border-b border-[#496C8A] py-3.5">
                  <span className="font-mono text-[11px] text-[#7F9BB5]">0{index + 1}</span>
                  <p className="text-[13px] font-semibold text-white">{title}</p>
                  <p className="text-[13px] leading-5 text-[#A8BACB]">{body}</p>
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
              <p className="mt-4 max-w-4xl text-[15px] leading-7 text-slate-600">{t.exploreIntro}</p>
            </div>
          </div>

          <div className="mt-9 grid grid-cols-1 border-l border-t border-slate-300 md:grid-cols-12">
            {t.routes.map((route, index) => {
              const span = index < 2 ? (index === 0 ? 'md:col-span-5' : 'md:col-span-7') : index === 2 ? 'md:col-span-4' : index === 3 ? 'md:col-span-4' : 'md:col-span-4'
              const dark = route.tone === 'dark'
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`group flex min-h-[238px] flex-col border-b border-r border-slate-300 p-6 transition md:p-7 ${span} ${toneClasses[route.tone as keyof typeof toneClasses]}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className={`font-mono text-[12px] ${dark ? 'text-[#7A7DFF]' : 'text-indigo-700'}`}>{route.number}</span>
                    <span className={`text-lg transition group-hover:translate-x-1 ${dark ? 'text-[#A8BACB]' : 'text-slate-400'}`}>→</span>
                  </div>
                  <h3 className={`mt-6 text-[27px] leading-tight ${dark ? 'text-white' : 'text-slate-950'}`} style={{ fontFamily: 'var(--font-playfair)' }}>{route.title}</h3>
                  <p className={`mt-3 text-[15px] font-semibold leading-6 ${dark ? 'text-white' : 'text-slate-800'}`}>{route.hook}</p>
                  <p className={`mt-3 max-w-xl flex-1 text-[13px] leading-6 ${dark ? 'text-[#A8BACB]' : 'text-slate-600'}`}>{route.body}</p>
                  <p className={`mt-5 text-[13px] font-semibold ${dark ? 'text-white' : 'text-indigo-700'}`}>{route.cta}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[190px_1fr] lg:gap-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.flowLabel}</p>
            <div>
              <h2 className="max-w-4xl text-[34px] leading-[1.07] tracking-[-0.02em] text-slate-950 sm:text-[42px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.flowTitle}</h2>

              <div className="mt-8 grid border-l border-t border-slate-300 lg:grid-cols-3">
                {t.flow.map(([number, title, body, meta], index) => (
                  <div key={title} className={`relative flex min-h-[235px] flex-col border-b border-r border-slate-300 p-6 ${index === 1 ? 'bg-[#F4F1EA]' : 'bg-white'}`}>
                    {index < 2 && <span className={`absolute -right-[7px] top-8 z-10 hidden h-3 w-3 rotate-45 border-r border-t border-slate-400 lg:block ${index === 1 ? 'bg-[#F4F1EA]' : 'bg-white'}`} />}
                    <p className="font-mono text-[11px] text-indigo-700">{number}</p>
                    <h3 className="mt-5 text-[24px] text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h3>
                    <p className="mt-3 flex-1 text-[14px] leading-7 text-slate-600">{body}</p>
                    <p className="mt-5 border-t border-slate-200 pt-3 font-mono text-[10px] uppercase leading-5 tracking-[0.08em] text-slate-400">{meta}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-9 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.ctaKicker}</p>
            <h2 className="mt-2 text-[28px] leading-tight text-slate-950 sm:text-[32px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.ctaTitle}</h2>
            <p className="mt-2 max-w-3xl text-[14px] leading-6 text-slate-600">{t.ctaBody}</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <Link href="/contact?intent=discovery" className="inline-flex bg-slate-950 px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-slate-800">{t.cta}</Link>
            <Link href="/projects" className="text-[12px] font-semibold text-indigo-700 hover:text-indigo-900">{t.ctaAlt} →</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
