'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'PARTNER DATA & AI',
    title: 'Capacidad analítica y tecnológica externa, sin construir todo el equipo dentro.',
    intro: 'Nos integramos como capacidad tecnológica y analítica externa, conservando contexto y activando la especialidad que necesitas en cada momento.',
    primary: 'Hablar del modelo partner',
    secondary: 'Ver cómo trabajamos',
    fitLabel: 'PARA QUIÉN',
    fitTitle: 'Tiene sentido cuando necesitas capacidad, no estructura fija.',
    fits: [
      ['Empresas sin equipo completo', 'Accede a capacidades especializadas sin contratar cada perfil internamente.'],
      ['Equipos con capacidad interna', 'Añadimos profundidad cuando aparece un problema que exige más especialización.'],
      ['Agencias y consultoras', 'Amplía tu capacidad técnica sin competir por la relación con tu cliente.'],
    ],
    modelLabel: 'CÓMO FUNCIONA',
    modelTitle: 'Continuidad sin convertirnos en un departamento pesado.',
    model: [
      ['01', 'Aprendemos el contexto', 'Partimos del negocio, los sistemas, las decisiones y las restricciones que ya existen.'],
      ['02', 'Entramos donde hacemos falta', 'Activamos la capacidad adecuada para cada problema, desde forecasting hasta agentes IA o data engineering.'],
      ['03', 'Conservamos conocimiento', 'Cada proyecto reduce el coste de volver a empezar y mejora la velocidad de la siguiente decisión.'],
      ['04', 'Seguimos solo si aporta valor', 'La continuidad no es una obligación contractual: existe mientras siga siendo útil para ambas partes.'],
    ],
    valueLabel: 'LO QUE CAMBIA',
    valueTitle: 'Más capacidad especialista. Menos fricción para activarla.',
    value: [
      'Un único punto de responsabilidad',
      'Contexto que no se pierde entre proyectos',
      'Especialistas activados según la necesidad',
      'Menos coste fijo que replicar todas las capacidades internamente',
    ],
    noteTitle: 'No es body leasing. No es vender horas sin contexto.',
    noteBody: 'Cuanto más contexto compartimos, más rápido y mejor podemos responder a la siguiente necesidad.',
    exploreLabel: 'ANTES DE DECIDIR',
    exploreTitle: 'Conócenos mejor antes de decidir.',
    exploreLinks: [['Cómo trabajamos','/services'],['Casos','/projects'],['Conocimiento','/knowledge']],
    ctaTitle: '¿Quieres ampliar capacidad sin ampliar estructura?',
    ctaBody: 'Podemos empezar por una necesidad concreta y comprobar si el modelo tiene sentido para vosotros.',
    cta: 'Hablar con SC-Analytics',
  },
  ca: {
    eyebrow: 'PARTNER DATA & AI',
    title: 'Capacitat analítica i tecnològica externa, sense construir tot l’equip internament.',
    intro: 'Ens integrem com a capacitat tecnològica i analítica externa, conservant context i activant l’especialitat que necessites en cada moment.',
    primary: 'Parlar del model partner',
    secondary: 'Veure com treballem',
    fitLabel: 'PER A QUI',
    fitTitle: 'Té sentit quan necessites capacitat, no estructura fixa.',
    fits: [
      ['Empreses sense equip complet', 'Accedeix a capacitats especialitzades sense contractar cada perfil internament.'],
      ['Equips amb capacitat interna', 'Afegim profunditat quan apareix un problema que exigeix més especialització.'],
      ['Agències i consultores', 'Amplia la teva capacitat tècnica sense competir per la relació amb el client.'],
    ],
    modelLabel: 'COM FUNCIONA',
    modelTitle: 'Continuïtat sense convertir-nos en un departament pesat.',
    model: [
      ['01', 'Aprenem el context', 'Partim del negoci, els sistemes, les decisions i les restriccions que ja existeixen.'],
      ['02', 'Entrem on fem falta', 'Activem la capacitat adequada per a cada problema, des de forecasting fins a agents IA o data engineering.'],
      ['03', 'Conservem coneixement', 'Cada projecte redueix el cost de tornar a començar i millora la velocitat de la següent decisió.'],
      ['04', 'Seguim només si aporta valor', 'La continuïtat no és una obligació contractual: existeix mentre segueixi sent útil per a totes dues parts.'],
    ],
    valueLabel: 'QUÈ CANVIA',
    valueTitle: 'Més capacitat especialista. Menys fricció per activar-la.',
    value: [
      'Un únic punt de responsabilitat',
      'Context que no es perd entre projectes',
      'Especialistes activats segons la necessitat',
      'Menys cost fix que replicar totes les capacitats internament',
    ],
    noteTitle: 'No és body leasing. No és vendre hores sense context.',
    noteBody: 'Com més context compartim, més ràpid i millor podem respondre a la següent necessitat.',
    exploreLabel: 'ABANS DE DECIDIR',
    exploreTitle: 'Coneix-nos millor abans de decidir.',
    exploreLinks: [['Com treballem','/services'],['Casos','/projects'],['Coneixement','/knowledge']],
    ctaTitle: 'Vols ampliar capacitat sense ampliar estructura?',
    ctaBody: 'Podem començar per una necessitat concreta i comprovar si el model té sentit per a vosaltres.',
    cta: 'Parlar amb SC-Analytics',
  },
  en: {
    eyebrow: 'DATA & AI PARTNER',
    title: 'External analytical and technology capability, without building the entire team in-house.',
    intro: 'We integrate as external technology and analytical capability, retaining context and activating the right specialism when needed.',
    primary: 'Discuss the partner model',
    secondary: 'See how we work',
    fitLabel: 'WHO IT IS FOR',
    fitTitle: 'It makes sense when you need capability, not fixed structure.',
    fits: [
      ['Companies without a full team', 'Access specialist capability without hiring every profile in-house.'],
      ['Teams with internal capability', 'Add depth when a problem requires more specialist expertise.'],
      ['Agencies and consultancies', 'Expand technical delivery without competing for the client relationship.'],
    ],
    modelLabel: 'HOW IT WORKS',
    modelTitle: 'Continuity without becoming a heavy department.',
    model: [
      ['01', 'We learn the context', 'We start from the business, systems, decisions and constraints that already exist.'],
      ['02', 'We enter where needed', 'We activate the right capability for each problem, from forecasting to AI agents or data engineering.'],
      ['03', 'We retain knowledge', 'Every project reduces the cost of starting again and improves the speed of the next decision.'],
      ['04', 'We continue only while useful', 'Continuity is not a contractual objective in itself: it exists while it keeps creating value for both sides.'],
    ],
    valueLabel: 'WHAT CHANGES',
    valueTitle: 'More specialist capability. Less friction to activate it.',
    value: [
      'One accountable relationship',
      'Context retained between projects',
      'Specialists activated according to need',
      'Less fixed cost than replicating every capability in-house',
    ],
    noteTitle: 'Not body leasing. Not selling hours without context.',
    noteBody: 'The more context we retain, the faster and better we can respond to the next need.',
    exploreLabel: 'BEFORE YOU DECIDE',
    exploreTitle: 'Get to know us better before deciding.',
    exploreLinks: [['How we work','/services'],['Case studies','/projects'],['Knowledge','/knowledge']],
    ctaTitle: 'Want more capability without more fixed structure?',
    ctaBody: 'We can start with one concrete need and test whether the model makes sense for you.',
    cta: 'Talk to SC-Analytics',
  },
} as const

export default function AnalyticalPartnerPage() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">{t.eyebrow}</p>
            <h1 className="mt-5 max-w-5xl text-[44px] leading-[1.04] tracking-[-0.03em] sm:text-[56px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
            <p className="mt-6 max-w-3xl text-[19px] leading-8 text-[#EAF0F6]">{t.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact?intent=partner" className="bg-white px-5 py-3 text-[15px] font-semibold text-[#0D1B2A] transition hover:bg-[#EAF0F6]">{t.primary}</Link>
              <Link href="/services" className="border border-[#7F9BB5] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-white/5">{t.secondary}</Link>
            </div>
          </div>

          <div className="border-y border-[#5E86A8] py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{t.valueLabel}</p>
            <div className="mt-3 divide-y divide-[#496C8A] border-t border-[#496C8A]">
              {t.value.map((item, index) => (
                <div key={item} className="flex gap-4 py-4">
                  <span className="font-mono text-[11px] text-[#7F9BB5]">0{index + 1}</span>
                  <p className="text-[15px] leading-6 text-[#EAF0F6]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white"><div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.fitLabel}</p>
        <h2 className="mt-4 max-w-3xl text-[34px] leading-[1.07] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.fitTitle}</h2>
        <div className="mt-8 grid border-l border-t border-slate-300 lg:grid-cols-3">
          {t.fits.map(([title, body], index) => (
            <article key={title} className="min-h-[235px] border-b border-r border-slate-300 p-6 md:p-7">
              <p className="text-xs font-semibold text-indigo-600">0{index + 1}</p>
              <h3 className="mt-4 text-[24px] font-semibold">{title}</h3>
              <p className="mt-4 text-[17px] leading-7 text-slate-700">{body}</p>
            </article>
          ))}
        </div>
      </div></section>

      <section className="border-b border-slate-300 bg-[#FAFAF7]">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.modelLabel}</p>
              <h2 className="mt-4 text-[34px] leading-[1.07] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.modelTitle}</h2>
            </div>
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {t.model.map(([number, title, body]) => (
                <article key={number} className="grid gap-3 py-5 md:grid-cols-[64px_200px_1fr]">
                  <span className="text-xs font-semibold text-indigo-600">{number}</span>
                  <h3 className="text-[18px] font-semibold text-slate-900">{title}</h3>
                  <p className="text-[17px] leading-7 text-slate-700">{body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 border-y border-slate-300 bg-[#F4F1EA] p-7 md:flex md:items-center md:justify-between md:gap-10">
            <div>
              <h3 className="text-[26px] leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{t.noteTitle}</h3>
              <p className="mt-3 max-w-3xl text-[17px] leading-7 text-slate-700">{t.noteBody}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-7 px-6 py-12 lg:grid-cols-[190px_1fr] lg:gap-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.exploreLabel}</p>
          <div>
            <h2 className="text-[30px] leading-[1.08] sm:text-[36px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.exploreTitle}</h2>
            <div className="mt-6 grid border-t border-slate-300 md:grid-cols-3 md:divide-x md:divide-slate-300">
              {t.exploreLinks.map(([label, href]) => (
                <Link key={href} href={href} className="group flex items-center justify-between border-b border-slate-300 py-4 text-[16px] font-semibold text-slate-900 md:px-5 md:first:pl-0">
                  {label}<span className="text-indigo-700 transition group-hover:translate-x-1">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[34px] leading-[1.07] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.ctaTitle}</h2>
            <p className="mt-3 max-w-2xl text-[17px] leading-7 text-slate-700">{t.ctaBody}</p>
          </div>
          <Link href="/contact?intent=partner" className="inline-flex shrink-0 bg-slate-950 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-slate-800">{t.cta}</Link>
        </div>
      </section>
    </main>
  )
}
