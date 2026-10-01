'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'SC-ANALYTICS BRIEFING',
    status: 'EN PREPARACIÓN',
    title: 'Un briefing breve para seguir solo lo que merece atención.',
    intro: 'Estamos preparando un formato breve para seguir ideas, señales y análisis que realmente merezcan atención.',
    promiseLabel: 'QUÉ QUEREMOS QUE SEA',
    promise: [
      ['Señales útiles', 'Cambios en empresas, sectores y operaciones que pueden afectar una decisión.'],
      ['Criterio aplicado', 'Menos “nueva herramienta” y más explicación de qué cambia, para quién y por qué importa.'],
      ['Puente hacia profundidad', 'Cada briefing debe llevar a un análisis, caso o idea que merezca seguir explorando.'],
    ],
    nextLabel: 'MIENTRAS TANTO',
    nextTitle: 'Hay otras formas de explorar cómo pensamos.',
    knowledge: 'Ir a conocimiento',
    cases: 'Ver casos',
    work: 'Cómo trabajamos',
    contact: 'Contacta con nosotros',
  },
  ca: {
    eyebrow: 'SC-ANALYTICS BRIEFING',
    status: 'EN PREPARACIÓ',
    title: 'Un briefing breu per seguir només allò que mereix atenció.',
    intro: 'Estem preparant un format breu per seguir idees, senyals i anàlisis que realment mereixin atenció.',
    promiseLabel: 'QUÈ VOLEM QUE SIGUI',
    promise: [
      ['Senyals útils', 'Canvis en empreses, sectors i operacions que poden afectar una decisió.'],
      ['Criteri aplicat', 'Menys “nova eina” i més explicació de què canvia, per a qui i per què importa.'],
      ['Pont cap a profunditat', 'Cada briefing ha de portar a una anàlisi, cas o idea que mereixi seguir explorant.'],
    ],
    nextLabel: 'MENTRESTANT',
    nextTitle: 'Hi ha altres formes d’explorar com pensem.',
    knowledge: 'Anar a coneixement',
    cases: 'Veure casos',
    work: 'Com treballem',
    contact: 'Contacta amb nosaltres',
  },
  en: {
    eyebrow: 'SC-ANALYTICS BRIEFING',
    status: 'IN PREPARATION',
    title: 'A concise briefing for following only what deserves attention.',
    intro: 'We are preparing a concise format for following ideas, signals and analysis that genuinely deserve attention.',
    promiseLabel: 'WHAT WE WANT IT TO BE',
    promise: [
      ['Useful signals', 'Changes in companies, sectors and operations that can affect a decision.'],
      ['Applied judgment', 'Less “new tool” and more explanation of what changes, for whom and why it matters.'],
      ['A bridge to depth', 'Every briefing should lead to an analysis, case or idea worth exploring further.'],
    ],
    nextLabel: 'IN THE MEANTIME',
    nextTitle: 'There are other ways to explore how we think.',
    knowledge: 'Go to knowledge',
    cases: 'See case studies',
    work: 'How we work',
    contact: 'Contact us',
  },
} as const

export default function BriefingPage() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]

  return (
    <main className="bg-[#FAFAF7] text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">{t.eyebrow}</p>
            <span className="border border-[#5E86A8] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#A8BACB]">{t.status}</span>
          </div>
          <h1 className="mt-5 max-w-5xl text-[44px] leading-[1.04] tracking-[-0.03em] sm:text-[56px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
          <p className="mt-6 max-w-4xl text-[19px] leading-8 text-[#EAF0F6]">{t.intro}</p>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <div className="grid gap-7 lg:grid-cols-[190px_1fr] lg:gap-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.promiseLabel}</p>
            <div className="grid border-l border-t border-slate-300 md:grid-cols-3">
              {t.promise.map(([title, body], index) => (
                <article key={title} className="min-h-[210px] border-b border-r border-slate-300 p-6">
                  <p className="font-mono text-[11px] text-indigo-700">0{index + 1}</p>
                  <h2 className="mt-4 text-[25px] leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h2>
                  <p className="mt-3 text-[17px] leading-7 text-slate-700">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F4F1EA]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[190px_1fr] lg:gap-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.nextLabel}</p>
          <div>
            <h2 className="text-[32px] leading-[1.08] sm:text-[38px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.nextTitle}</h2>
            <div className="mt-7 grid border-t border-slate-300 md:grid-cols-4 md:divide-x md:divide-slate-300">
              {[
                [t.knowledge, '/knowledge'],
                [t.cases, '/projects'],
                [t.work, '/services'],
                [t.contact, '/contact?intent=discovery'],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="group flex items-center justify-between border-b border-slate-300 py-4 text-[15px] font-semibold text-slate-900 md:px-5 md:first:pl-0">
                  {label}
                  <span className="text-indigo-700 transition group-hover:translate-x-1">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
