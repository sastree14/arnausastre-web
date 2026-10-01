'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'POR QUÉ SC-ANALYTICS',
    title: 'Capacidad técnica con criterio de negocio y responsabilidad sobre el resultado.',
    intro: 'No queremos ser otra consultora que entrega una solución técnicamente correcta y desaparece. Trabajamos para entender qué importa, construir lo necesario y dejar una decisión mejor que antes.',
    reasonsLabel: 'POR QUÉ CONSTRUIR CON NOSOTROS',
    reasonsTitle: 'Lo que cambia en la forma de trabajar.',
    reasons: [
      ['Comprender antes de construir', 'Primero definimos la decisión, el proceso, las restricciones y la lógica económica. La tecnología viene después.'],
      ['La solución más adecuada, no la más grande', 'La sofisticación solo se justifica si mejora de verdad el resultado frente a una alternativa más simple.'],
      ['Comunicación directa', 'Quien entiende el problema participa en la solución. Menos capas, menos traducción y más responsabilidad.'],
      ['Contexto que se acumula', 'Cada proyecto aumenta el conocimiento del negocio y hace que la siguiente decisión pueda resolverse mejor y más rápido.'],
    ],
    proofLabel: 'NUESTRO ESTÁNDAR',
    proofTitle: 'Ser rigurosos también significa saber decir que no.',
    proofBody: 'Si faltan datos, si el retorno esperado no compensa el esfuerzo o si un cambio operativo simple resuelve el problema, lo diremos. La relación a largo plazo vale más que maximizar el alcance de un proyecto.',
    principles: ['Valor antes que tecnología', 'Rigor cuantitativo', 'Transparencia sobre límites y riesgos', 'Sistemas utilizables, no demos', 'Impacto medible cuando sea posible'],
    modelLabel: 'MODELO DE TRABAJO',
    modelTitle: 'Estructura ligera. Especialización cuando hace falta.',
    modelBody: 'SC-Analytics está diseñada para mantenerse cerca del cliente y activar la especialidad necesaria según el problema. Podemos entrar en un proyecto concreto o mantener continuidad como partner Data & AI.',
    project: 'Ver casos',
    partner: 'Conocer el modelo partner',
    exploreLabel: 'VERLO EN LA PRÁCTICA',
    exploreTitle: 'Nuestro criterio se entiende mejor cuando ves lo que hacemos.',
    exploreLinks: [['Cómo trabajamos','/services'],['Casos','/projects'],['Conocimiento','/knowledge']],
    ctaTitle: 'Si nuestra forma de pensar encaja con la tuya, empecemos por un problema real.',
    ctaBody: 'La primera conversación sirve para entender si podemos aportar valor y cuál sería el siguiente paso más sensato.',
    cta: 'Hablar con SC-Analytics',
  },
  ca: {
    eyebrow: 'PER QUÈ SC-ANALYTICS',
    title: 'Capacitat tècnica amb criteri de negoci i responsabilitat sobre el resultat.',
    intro: 'No volem ser una altra consultora que entrega una solució tècnicament correcta i desapareix. Treballem per entendre què importa, construir el necessari i deixar una decisió millor que abans.',
    reasonsLabel: 'PER QUÈ CONSTRUIR AMB NOSALTRES',
    reasonsTitle: 'Què canvia en la manera de treballar.',
    reasons: [
      ['Comprendre abans de construir', 'Primer definim la decisió, el procés, les restriccions i la lògica econòmica. La tecnologia ve després.'],
      ['La solució més adequada, no la més gran', 'La sofisticació només es justifica si millora realment el resultat davant d’una alternativa més simple.'],
      ['Comunicació directa', 'Qui entén el problema participa en la solució. Menys capes, menys traducció i més responsabilitat.'],
      ['Context que s’acumula', 'Cada projecte augmenta el coneixement del negoci i fa que la següent decisió es pugui resoldre millor i més ràpid.'],
    ],
    proofLabel: 'EL NOSTRE ESTÀNDARD',
    proofTitle: 'Ser rigorosos també significa saber dir que no.',
    proofBody: 'Si falten dades, si el retorn esperat no compensa l’esforç o si un canvi operatiu simple resol el problema, ho direm. La relació a llarg termini val més que maximitzar l’abast d’un projecte.',
    principles: ['Valor abans que tecnologia', 'Rigor quantitatiu', 'Transparència sobre límits i riscos', 'Sistemes utilitzables, no demos', 'Impacte mesurable quan sigui possible'],
    modelLabel: 'MODEL DE TREBALL',
    modelTitle: 'Estructura lleugera. Especialització quan cal.',
    modelBody: 'SC-Analytics està dissenyada per mantenir-se a prop del client i activar l’especialitat necessària segons el problema. Podem entrar en un projecte concret o mantenir continuïtat com a partner Data & AI.',
    project: 'Veure casos',
    partner: 'Conèixer el model partner',
    exploreLabel: 'VEURE-HO A LA PRÀCTICA',
    exploreTitle: 'El nostre criteri s’entén millor quan veus què fem.',
    exploreLinks: [['Com treballem','/services'],['Casos','/projects'],['Coneixement','/knowledge']],
    ctaTitle: 'Si la nostra manera de pensar encaixa amb la teva, comencem per un problema real.',
    ctaBody: 'La primera conversa serveix per entendre si podem aportar valor i quin seria el següent pas més sensat.',
    cta: 'Parlar amb SC-Analytics',
  },
  en: {
    eyebrow: 'WHY SC-ANALYTICS',
    title: 'Technical capability with business judgment and accountability for the outcome.',
    intro: 'We do not want to be another consultancy that delivers something technically correct and disappears. We work to understand what matters, build what is necessary and leave the client with a better decision than before.',
    reasonsLabel: 'WHY BUILD WITH US',
    reasonsTitle: 'What changes in the way the work is done.',
    reasons: [
      ['Understand before building', 'We first define the decision, process, constraints and economics. Technology comes afterwards.'],
      ['The right solution, not the biggest one', 'Sophistication is justified only when it genuinely improves the outcome over a simpler alternative.'],
      ['Direct communication', 'The people who understand the problem participate in the solution. Fewer layers, less translation and more accountability.'],
      ['Context compounds', 'Every project increases business knowledge and makes the next decision faster and better informed.'],
    ],
    proofLabel: 'OUR STANDARD',
    proofTitle: 'Rigor also means knowing when to say no.',
    proofBody: 'If the data is insufficient, the expected return does not justify the effort or a simple operational change solves the problem, we will say so. A long-term relationship matters more than maximising the scope of one project.',
    principles: ['Value before technology', 'Quantitative rigor', 'Transparency about limits and risks', 'Usable systems, not demos', 'Measurable impact where possible'],
    modelLabel: 'WORKING MODEL',
    modelTitle: 'Lean structure. Specialist depth when required.',
    modelBody: 'SC-Analytics is designed to stay close to the client and activate the right specialism for the problem. We can enter for one defined project or maintain continuity as a Data & AI partner.',
    project: 'See case studies',
    partner: 'Explore the partner model',
    exploreLabel: 'SEE IT IN PRACTICE',
    exploreTitle: 'Our judgment is easier to understand when you see the work.',
    exploreLinks: [['How we work','/services'],['Case studies','/projects'],['Knowledge','/knowledge']],
    ctaTitle: 'If the way we think fits the way you want to work, start with a real problem.',
    ctaBody: 'The first conversation is enough to understand whether we can create value and what the most sensible next step would be.',
    cta: 'Talk to SC-Analytics',
  },
} as const

export default function AboutPage() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">{t.eyebrow}</p>
          <h1 className="mt-5 max-w-5xl text-5xl leading-[1.04] md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{t.intro}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">{t.reasonsLabel}</p>
        <h2 className="mt-4 max-w-3xl text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.reasonsTitle}</h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 md:grid-cols-2">
          {t.reasons.map(([title, body], index) => (
            <article key={title} className="bg-white p-7 md:p-8">
              <p className="text-xs font-semibold text-indigo-600">0{index + 1}</p>
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:py-20 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">{t.proofLabel}</p>
            <h2 className="mt-4 max-w-xl text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.proofTitle}</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">{t.proofBody}</p>
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {t.principles.map((item, index) => (
              <div key={item} className="flex gap-4 py-4">
                <span className="text-xs font-semibold text-indigo-600">0{index + 1}</span>
                <p className="text-sm font-medium text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="rounded-2xl border border-slate-200 p-7 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">{t.modelLabel}</p>
              <h2 className="mt-4 text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.modelTitle}</h2>
            </div>
            <div>
              <p className="max-w-2xl text-base leading-8 text-slate-600">{t.modelBody}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/projects" className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">{t.project}</Link>
                <Link href="/partner-analitico" className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-500">{t.partner}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-7 px-6 py-12 lg:grid-cols-[190px_1fr] lg:gap-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.exploreLabel}</p>
          <div>
            <h2 className="text-[30px] leading-[1.08] sm:text-[36px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.exploreTitle}</h2>
            <div className="mt-6 grid border-t border-slate-300 md:grid-cols-3 md:divide-x md:divide-slate-300">
              {t.exploreLinks.map(([label, href]) => (
                <Link key={href} href={href} className="group flex items-center justify-between border-b border-slate-300 py-4 text-[13px] font-semibold text-slate-900 md:px-5 md:first:pl-0">
                  {label}<span className="text-indigo-700 transition group-hover:translate-x-1">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-[#F4F1EA]">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-3xl text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.ctaTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{t.ctaBody}</p>
          </div>
          <Link href="/contact?intent=discovery" className="inline-flex shrink-0 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">{t.cta}</Link>
        </div>
      </section>
    </main>
  )
}
