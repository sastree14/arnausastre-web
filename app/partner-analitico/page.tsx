'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'PARTNER DATA & AI',
    title: 'Tu capacidad externa de Data & AI, sin construir todo el equipo dentro.',
    intro: 'Nos integramos como una capa tecnológica y analítica que aprende tu negocio, conserva contexto y activa la especialidad necesaria cuando aparece una nueva decisión.',
    primary: 'Hablar del modelo partner',
    secondary: 'Ver cómo trabajamos',
    fitLabel: 'PARA QUIÉN',
    fitTitle: 'Tiene sentido cuando necesitas capacidad, no estructura fija.',
    fits: [
      ['Empresas sin equipo Data & AI completo', 'Necesitas forecasting, optimización, ML, automatización o analytics, pero no compensa contratar cada perfil internamente.'],
      ['Equipos con analistas o perfiles técnicos', 'Ya tienes capacidad interna, pero aparecen problemas que requieren especialización adicional o más profundidad.'],
      ['Agencias, consultoras y partners tecnológicos', 'Quieres ampliar lo que puedes ofrecer a tus clientes con una capa especialista que se integra en el delivery sin competir por la relación comercial.'],
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
    noteBody: 'El objetivo es construir una relación donde entendemos el negocio lo suficiente como para entrar mejor, más rápido y con más criterio cada vez que aparece una necesidad nueva.',
    ctaTitle: '¿Quieres ampliar capacidad sin ampliar estructura?',
    ctaBody: 'Podemos empezar por una necesidad concreta y comprobar si el modelo tiene sentido para vosotros.',
    cta: 'Hablar con SC-Analytics',
  },
  ca: {
    eyebrow: 'PARTNER DATA & AI',
    title: 'La teva capacitat externa de Data & AI, sense construir tot l’equip internament.',
    intro: 'Ens integrem com una capa tecnològica i analítica que aprèn el teu negoci, conserva context i activa l’especialitat necessària quan apareix una nova decisió.',
    primary: 'Parlar del model partner',
    secondary: 'Veure com treballem',
    fitLabel: 'PER A QUI',
    fitTitle: 'Té sentit quan necessites capacitat, no estructura fixa.',
    fits: [
      ['Empreses sense equip Data & AI complet', 'Necessites forecasting, optimització, ML, automatització o analytics, però no compensa contractar cada perfil internament.'],
      ['Equips amb analistes o perfils tècnics', 'Ja tens capacitat interna, però apareixen problemes que requereixen especialització addicional o més profunditat.'],
      ['Agències, consultores i partners tecnològics', 'Vols ampliar el que pots oferir als teus clients amb una capa especialista que s’integra al delivery sense competir per la relació comercial.'],
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
    noteBody: 'L’objectiu és construir una relació on entenem prou el negoci per entrar millor, més ràpid i amb més criteri cada vegada que apareix una necessitat nova.',
    ctaTitle: 'Vols ampliar capacitat sense ampliar estructura?',
    ctaBody: 'Podem començar per una necessitat concreta i comprovar si el model té sentit per a vosaltres.',
    cta: 'Parlar amb SC-Analytics',
  },
  en: {
    eyebrow: 'DATA & AI PARTNER',
    title: 'Your external Data & AI capability, without building the entire team in-house.',
    intro: 'We integrate as a technology and analytical layer that learns the business, retains context and activates the right specialism when a new decision appears.',
    primary: 'Discuss the partner model',
    secondary: 'See how we work',
    fitLabel: 'WHO IT IS FOR',
    fitTitle: 'It makes sense when you need capability, not fixed structure.',
    fits: [
      ['Companies without a full Data & AI team', 'You need forecasting, optimisation, ML, automation or analytics, but hiring every specialism internally does not make economic sense.'],
      ['Teams with analysts or technical profiles', 'You already have internal capability, but some problems require additional depth or specialist expertise.'],
      ['Agencies, consultancies and technology partners', 'You want to expand what you can deliver to clients with a specialist layer that integrates into delivery without competing for the commercial relationship.'],
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
    noteBody: 'The objective is to build a relationship where we understand the business well enough to enter better, faster and with more judgment whenever a new need appears.',
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
      <section className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">{t.eyebrow}</p>
            <h1 className="mt-5 max-w-5xl text-5xl leading-[1.04] md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{t.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact?intent=partner" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">{t.primary}</Link>
              <Link href="/services" className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:border-slate-500">{t.secondary}</Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300">{t.valueLabel}</p>
            <div className="mt-3 divide-y divide-white/10">
              {t.value.map((item, index) => (
                <div key={item} className="flex gap-4 py-4">
                  <span className="text-xs font-semibold text-slate-500">0{index + 1}</span>
                  <p className="text-sm leading-6 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">{t.fitLabel}</p>
        <h2 className="mt-4 max-w-3xl text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.fitTitle}</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {t.fits.map(([title, body], index) => (
            <article key={title} className="rounded-2xl border border-slate-200 p-7">
              <p className="text-xs font-semibold text-indigo-600">0{index + 1}</p>
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">{t.modelLabel}</p>
              <h2 className="mt-4 text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.modelTitle}</h2>
            </div>
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {t.model.map(([number, title, body]) => (
                <article key={number} className="grid gap-3 py-5 md:grid-cols-[64px_200px_1fr]">
                  <span className="text-xs font-semibold text-indigo-600">{number}</span>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm leading-7 text-slate-600">{body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50 p-7 md:flex md:items-center md:justify-between md:gap-10">
            <div>
              <h3 className="text-2xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.noteTitle}</h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{t.noteBody}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.ctaTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{t.ctaBody}</p>
          </div>
          <Link href="/contact?intent=partner" className="inline-flex shrink-0 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">{t.cta}</Link>
        </div>
      </section>
    </main>
  )
}
