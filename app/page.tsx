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
    exploreTitle: 'Lo importante no está todo en la portada.',
    exploreIntro: 'La web está organizada para que puedas ir directamente a lo que necesitas entender.',
    routes: [
      ['01', 'Cómo trabajamos', 'Nuestro proceso, las capacidades que activamos y las distintas formas de trabajar con nosotros.', '/services', 'Ver enfoque'],
      ['02', 'Casos', 'Problemas reales, decisiones, arquitectura y resultados explicados con contexto.', '/projects', 'Explorar casos'],
      ['03', 'Conocimiento', 'Análisis y artículos sobre operaciones, forecasting, optimización, datos e inteligencia artificial.', '/knowledge', 'Leer análisis'],
      ['04', 'Por qué SC-Analytics', 'Nuestro criterio, principios y forma de construir relaciones de trabajo a largo plazo.', '/about', 'Conocernos mejor'],
    ],
    partnerLabel: 'PARTNER DATA & AI',
    partnerTitle: 'Capacidad especialista cuando la necesitas. Sin construir todo el equipo dentro.',
    partnerBody: 'Para empresas que necesitan continuidad en datos, automatización y sistemas de decisión, y para consultoras o agencias que quieren ampliar su capacidad técnica sin competir por la relación con su cliente.',
    partnerPoints: ['Contexto que se conserva', 'Especialistas según el problema', 'Relación flexible y responsable'],
    partnerCta: 'Ver modelo partner',
    flowLabel: 'DE PROBLEMA A RESULTADO',
    flowTitle: 'La tecnología ocupa el centro del proceso, no el centro de la conversación.',
    flow: [
      ['01', 'Problema', 'Una decisión, proceso o restricción está frenando el negocio.', 'Demanda · riesgo · capacidad · operaciones'],
      ['02', 'Sistema', 'Elegimos la capacidad adecuada para mejorar esa situación.', 'Forecasting · optimización · ML · automatización'],
      ['03', 'Resultado', 'El sistema debe producir una mejora que pueda entenderse y utilizarse.', 'Control · velocidad · precisión · eficiencia'],
    ],
    ctaTitle: '¿Hay algo en tu negocio que debería funcionar mejor?',
    ctaBody: 'Cuéntanos el contexto. No necesitas llegar con una solución definida.',
    cta: 'Empezar una conversación',
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
    exploreTitle: 'El més important no és tot a la portada.',
    exploreIntro: 'La web està organitzada perquè puguis anar directament al que necessites entendre.',
    routes: [
      ['01', 'Com treballem', 'El nostre procés, les capacitats que activem i les diferents formes de treballar amb nosaltres.', '/services', 'Veure enfocament'],
      ['02', 'Casos', 'Problemes reals, decisions, arquitectura i resultats explicats amb context.', '/projects', 'Explorar casos'],
      ['03', 'Coneixement', 'Anàlisi i articles sobre operacions, forecasting, optimització, dades i intel·ligència artificial.', '/knowledge', 'Llegir anàlisi'],
      ['04', 'Per què SC-Analytics', 'El nostre criteri, principis i manera de construir relacions de treball a llarg termini.', '/about', 'Conèixer-nos millor'],
    ],
    partnerLabel: 'PARTNER DATA & AI',
    partnerTitle: 'Capacitat especialista quan la necessites. Sense construir tot l’equip internament.',
    partnerBody: 'Per a empreses que necessiten continuïtat en dades, automatització i sistemes de decisió, i per a consultores o agències que volen ampliar la seva capacitat tècnica sense competir per la relació amb el client.',
    partnerPoints: ['Context que es conserva', 'Especialistes segons el problema', 'Relació flexible i responsable'],
    partnerCta: 'Veure model partner',
    flowLabel: 'DE PROBLEMA A RESULTAT',
    flowTitle: 'La tecnologia ocupa el centre del procés, no el centre de la conversa.',
    flow: [
      ['01', 'Problema', 'Una decisió, procés o restricció està frenant el negoci.', 'Demanda · risc · capacitat · operacions'],
      ['02', 'Sistema', 'Triem la capacitat adequada per millorar aquesta situació.', 'Forecasting · optimització · ML · automatització'],
      ['03', 'Resultat', 'El sistema ha de produir una millora que es pugui entendre i utilitzar.', 'Control · velocitat · precisió · eficiència'],
    ],
    ctaTitle: 'Hi ha alguna cosa al teu negoci que hauria de funcionar millor?',
    ctaBody: 'Explica’ns el context. No cal arribar amb una solució definida.',
    cta: 'Començar una conversa',
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
    exploreTitle: 'The important detail does not all belong on the homepage.',
    exploreIntro: 'The site is organised so you can go directly to what you need to understand.',
    routes: [
      ['01', 'How we work', 'Our process, the capabilities we activate and the different ways to work with us.', '/services', 'See our approach'],
      ['02', 'Case studies', 'Real problems, decisions, architecture and outcomes explained with context.', '/projects', 'Explore cases'],
      ['03', 'Knowledge', 'Analysis and articles on operations, forecasting, optimisation, data and artificial intelligence.', '/knowledge', 'Read analysis'],
      ['04', 'Why SC-Analytics', 'Our judgment, principles and way of building long-term working relationships.', '/about', 'Get to know us'],
    ],
    partnerLabel: 'DATA & AI PARTNER',
    partnerTitle: 'Specialist capability when you need it. Without building the entire team in-house.',
    partnerBody: 'For companies that need continuity across data, automation and decision systems, and for consultancies or agencies that want to expand technical delivery without competing for the client relationship.',
    partnerPoints: ['Context retained over time', 'Specialists matched to the problem', 'Flexible and accountable relationship'],
    partnerCta: 'Explore the partner model',
    flowLabel: 'FROM PROBLEM TO OUTCOME',
    flowTitle: 'Technology sits at the centre of the process, not at the centre of the conversation.',
    flow: [
      ['01', 'Problem', 'A decision, process or constraint is holding the business back.', 'Demand · risk · capacity · operations'],
      ['02', 'System', 'We select the right capability to improve that situation.', 'Forecasting · optimisation · ML · automation'],
      ['03', 'Outcome', 'The system should produce an improvement people can understand and use.', 'Control · speed · precision · efficiency'],
    ],
    ctaTitle: 'Is there something in the business that should work better?',
    ctaBody: 'Tell us the context. You do not need to arrive with a predefined solution.',
    cta: 'Start a conversation',
  },
} as const

export default function HomePage() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:py-20 lg:grid-cols-[1.08fr_.92fr] lg:items-end">
          <div>
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

          <aside className="border-y border-[#5E86A8] py-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{t.snapshotLabel}</p>
            <h2 className="mt-3 max-w-xl text-[28px] leading-[1.12] text-white sm:text-[32px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.snapshotTitle}</h2>
            <div className="mt-5 divide-y divide-[#496C8A] border-t border-[#496C8A]">
              {t.snapshotRows.map(([title, body], index) => (
                <div key={title} className="grid grid-cols-[34px_105px_1fr] gap-3 py-4">
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
          <div className="grid gap-8 lg:grid-cols-[190px_1fr] lg:gap-10">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.exploreLabel}</p>
            </div>
            <div>
              <h2 className="max-w-3xl text-[36px] leading-[1.06] tracking-[-0.02em] text-slate-950 sm:text-[44px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.exploreTitle}</h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-600">{t.exploreIntro}</p>
            </div>
          </div>

          <div className="mt-9 grid border-l border-t border-slate-300 md:grid-cols-2">
            {t.routes.map(([number, title, body, href, cta], index) => (
              <Link
                key={href}
                href={href}
                className={`group min-h-[230px] border-b border-r border-slate-300 p-6 transition md:p-7 ${
                  index === 1 ? 'bg-[#0D1B2A] text-white hover:bg-[#13283B]' : index === 2 ? 'bg-white hover:bg-slate-50' : 'bg-[#F4F1EA] hover:bg-[#EEEAE1]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`font-mono text-[12px] ${index === 1 ? 'text-[#7A7DFF]' : 'text-indigo-700'}`}>{number}</span>
                  <span className={`text-lg transition group-hover:translate-x-1 ${index === 1 ? 'text-[#A8BACB]' : 'text-slate-400'}`}>→</span>
                </div>
                <h3 className={`mt-8 text-[27px] leading-tight ${index === 1 ? 'text-white' : 'text-slate-950'}`} style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h3>
                <p className={`mt-3 max-w-xl text-[14px] leading-7 ${index === 1 ? 'text-[#A8BACB]' : 'text-slate-600'}`}>{body}</p>
                <p className={`mt-6 text-[13px] font-semibold ${index === 1 ? 'text-white' : 'text-indigo-700'}`}>{cta}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="mx-auto grid max-w-7xl gap-9 px-6 py-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{t.partnerLabel}</p>
            <h2 className="mt-3 max-w-3xl text-[34px] leading-[1.08] tracking-[-0.02em] text-white sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.partnerTitle}</h2>
            <p className="mt-4 max-w-3xl text-[14px] leading-7 text-[#A8BACB]">{t.partnerBody}</p>
          </div>
          <div>
            <div className="grid border-y border-[#5E86A8] sm:grid-cols-3 sm:divide-x sm:divide-[#5E86A8]">
              {t.partnerPoints.map((item, index) => (
                <div key={item} className="border-b border-[#5E86A8] px-4 py-4 last:border-b-0 sm:border-b-0">
                  <p className="font-mono text-[11px] text-[#7A7DFF]">0{index + 1}</p>
                  <p className="mt-2 text-[13px] leading-5 text-white">{item}</p>
                </div>
              ))}
            </div>
            <Link href="/partner-analitico" className="mt-5 inline-flex border border-[#A8BACB] px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-white/5">{t.partnerCta} →</Link>
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
                  <div key={title} className={`relative border-b border-r border-slate-300 p-6 ${index === 1 ? 'bg-[#F4F1EA]' : 'bg-white'}`}>
                    {index < 2 && <span className="absolute -right-[7px] top-8 z-10 hidden h-3 w-3 rotate-45 border-r border-t border-slate-400 bg-white lg:block" />}
                    <p className="font-mono text-[11px] text-indigo-700">{number}</p>
                    <h3 className="mt-5 text-[24px] text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h3>
                    <p className="mt-3 text-[14px] leading-7 text-slate-600">{body}</p>
                    <p className="mt-5 border-t border-slate-200 pt-3 font-mono text-[10px] uppercase leading-5 tracking-[0.08em] text-slate-400">{meta}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F4F1EA]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-9 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[28px] leading-tight text-slate-950 sm:text-[32px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.ctaTitle}</h2>
            <p className="mt-2 text-[14px] leading-6 text-slate-600">{t.ctaBody}</p>
          </div>
          <Link href="/contact?intent=discovery" className="inline-flex shrink-0 bg-slate-950 px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-slate-800">{t.cta}</Link>
        </div>
      </section>
    </main>
  )
}
