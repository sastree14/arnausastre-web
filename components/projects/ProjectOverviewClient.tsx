'use client'

import Link from '@/components/SiteLink'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { publicProject } from '@/lib/project-public-copy'
import type { Project } from '@/lib/projects'
import type { WebsiteProjectGoldStandard } from '@/lib/website-project-gold-standard'

type Props = {
  project: Project
  goldStandard?: WebsiteProjectGoldStandard
}

const ui = {
  en: {
    back: 'All cases',
    caseStudy: 'Read the full case',
    repository: 'Technical repository',
    contact: 'Discuss a similar problem',
    snapshot: 'The case in 30 seconds',
    problem: 'Business problem',
    built: 'What changed',
    utility: 'Business utility',
    evidence: 'Evidence & provenance',
    publicImplementation: 'Public portfolio implementation',
    context: 'What this system is for',
    scenario: 'Illustrative economics',
    scenarioNote: 'Business scenario — not a measured client result',
  },
  es: {
    back: 'Todos los casos',
    caseStudy: 'Ver el caso completo',
    repository: 'Repositorio técnico',
    contact: 'Hablar de un problema similar',
    snapshot: 'El caso en 30 segundos',
    problem: 'Problema de negocio',
    built: 'Qué cambió',
    utility: 'Utilidad para el negocio',
    evidence: 'Evidencia y procedencia',
    publicImplementation: 'Implementación pública de portfolio',
    context: 'Para qué sirve este sistema',
    scenario: 'Economía del caso',
    scenarioNote: 'Escenario ilustrativo — no es un resultado medido de cliente',
  },
  ca: {
    back: 'Tots els casos',
    caseStudy: 'Veure el cas complet',
    repository: 'Repositori tècnic',
    contact: 'Parlar d’un problema similar',
    snapshot: 'El cas en 30 segons',
    problem: 'Problema de negoci',
    built: 'Què va canviar',
    utility: 'Utilitat per al negoci',
    evidence: 'Evidència i procedència',
    publicImplementation: 'Implementació pública de portfolio',
    context: 'Per a què serveix aquest sistema',
    scenario: 'Economia del cas',
    scenarioNote: 'Escenari il·lustratiu — no és un resultat mesurat de client',
  },
} as const

const sc12Summary = {
  en: {
    hook: 'Forecast demand so inventory decisions change before stock becomes a problem.',
    problem:
      'Purchasing and stock decisions become fragile when one blended forecast hides how accuracy changes between the next day and longer planning horizons.',
    built:
      'Demand is estimated separately at 1, 3, 6 and 9 days so purchasing and inventory decisions can use the horizon that actually matters.',
    utility:
      'The system makes the trade-off between availability, excess stock and working capital visible before a purchasing decision is made.',
  },
  es: {
    hook: 'Predecir la demanda para cambiar la decisión de inventario antes de que el stock se convierta en un problema.',
    problem:
      'Compras e inventario se vuelven frágiles cuando un único forecast agregado oculta cómo cambia la precisión entre mañana y los horizontes de planificación más largos.',
    built:
      'La demanda se estima por separado a 1, 3, 6 y 9 días para que compras e inventario se apoyen en el horizonte que realmente importa.',
    utility:
      'El sistema hace visible el equilibrio entre disponibilidad, exceso de stock y capital circulante antes de decidir cuánto comprar o mantener.',
  },
  ca: {
    hook: 'Predir la demanda per canviar la decisió d’inventari abans que l’estoc es converteixi en un problema.',
    problem:
      'Compres i inventari es tornen fràgils quan un únic forecast agregat oculta com canvia la precisió entre demà i els horitzons de planificació més llargs.',
    built:
      'La demanda s’estima per separat a 1, 3, 6 i 9 dies perquè compres i inventari es basin en l’horitzó que realment importa.',
    utility:
      'El sistema fa visible l’equilibri entre disponibilitat, excés d’estoc i capital circulant abans de decidir quant comprar o mantenir.',
  },
} as const

const sc12Scenario = {
  en: {
    headline: 'A small inventory improvement can release material cash.',
    summary:
      'If a €2.0M inventory position can be reduced by 5% without damaging service, €100k of working capital is released. This is illustrative arithmetic, not a claimed client result.',
  },
  es: {
    headline: 'Una pequeña mejora de inventario puede liberar una cantidad material de caja.',
    summary:
      'Si una posición de inventario de €2,0M puede reducirse un 5% sin deteriorar el servicio, se liberan €100k de capital circulante. Es aritmética ilustrativa, no un resultado atribuido a un cliente.',
  },
  ca: {
    headline: 'Una petita millora d’inventari pot alliberar una quantitat material de caixa.',
    summary:
      'Si una posició d’inventari de €2,0M es pot reduir un 5% sense deteriorar el servei, s’alliberen €100k de capital circulant. És aritmètica il·lustrativa, no un resultat atribuït a un client.',
  },
} as const

function findSection(project: Project, names: string[]) {
  const wanted = names.map((name) => name.toLowerCase())
  return project.sections.find((section) => wanted.includes(section.title.toLowerCase()))?.body || ''
}

function firstSentence(value: string, fallback: string) {
  const cleaned = value.replace(/\s+/g, ' ').trim()
  if (!cleaned) return fallback
  const match = cleaned.match(/^(.+?[.!?])(?:\s|$)/)
  return match?.[1] || cleaned
}

export default function ProjectOverviewClient({ project: raw, goldStandard }: Props) {
  const { lang } = useSiteLanguage()
  const c = ui[lang]
  const project = publicProject(raw, lang)
  const isSc12 = project.slug === 'ecommerce-demand-forecasting'

  const genericProblem = firstSentence(
    findSection(raw, ['Problem', 'Context']),
    project.description,
  )
  const genericBuilt = firstSentence(
    findSection(raw, ['System Developed', 'Approach', 'Solution']),
    project.capability,
  )
  const genericUtility = firstSentence(
    project.description,
    'A structured analytical system designed around a concrete operating decision.',
  )

  const summary = isSc12
    ? sc12Summary[lang]
    : { problem: genericProblem, built: genericBuilt, utility: genericUtility }

  const proofUrl = goldStandard?.proofUrl

  return (
    <main className="bg-[#FAFAF7] text-slate-950">
      <section className="border-b border-slate-300">
        <div className="mx-auto max-w-7xl px-6 pb-12 pt-10 lg:px-8 lg:pb-14 lg:pt-12">
          <Link href="/projects" className="inline-flex items-center gap-2 text-[14px] text-slate-500 transition hover:text-slate-950">
            <span aria-hidden="true">←</span>
            {c.back}
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                <span className="text-indigo-700">{project.industry}</span>
                <span>/</span>
                <span>{project.challenge}</span>
                {goldStandard ? (
                  <>
                    <span>/</span>
                    <span>{goldStandard.projectId}</span>
                  </>
                ) : null}
              </div>

              <h1
                className="mt-5 max-w-4xl text-5xl leading-[1.01] tracking-[-0.035em] text-slate-950 sm:text-6xl lg:text-[68px]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {project.headline}
              </h1>
            </div>

            <div className="border-l border-slate-300 pl-6 lg:pl-9">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-500">{c.context}</p>
              <p className="mt-4 text-[17px] leading-8 text-slate-600">{project.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-14">
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-slate-400 pb-5">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-indigo-700">{c.snapshot}</p>
              {goldStandard ? (
                <p className="mt-2 text-[13px] text-slate-500">{c.publicImplementation}</p>
              ) : null}
            </div>
            <p className="max-w-xl text-[14px] leading-6 text-slate-500">
              {lang === 'es'
                ? 'Problema, alcance y utilidad antes de entrar en la implementación.'
                : lang === 'ca'
                  ? 'Problema, abast i utilitat abans d’entrar en la implementació.'
                  : 'Problem, scope and utility before going into implementation detail.'}
            </p>
          </div>

          <div className="grid border-b border-slate-400 lg:grid-cols-3 lg:divide-x lg:divide-slate-300">
            {[
              [c.problem, summary.problem],
              [c.built, summary.built],
              [c.utility, summary.utility],
            ].map(([label, body]) => (
              <div key={label} className="border-b border-slate-300 py-7 last:border-b-0 lg:border-b-0 lg:px-7 lg:first:pl-0 lg:last:pr-0">
                <p className="text-[13px] font-semibold uppercase tracking-[0.13em] text-slate-500">{label}</p>
                <p className="mt-4 text-[17px] leading-8 text-slate-800">{body}</p>
              </div>
            ))}
          </div>

          {goldStandard ? (
            <div className="grid gap-0 border-b border-slate-300 sm:grid-cols-2 lg:grid-cols-4">
              {goldStandard.heroFacts.map((fact) => (
                <div key={fact.label} className="border-b border-slate-200 py-5 sm:px-5 sm:first:pl-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
                  <p className="text-[13px] text-slate-500">{fact.label}</p>
                  <p className="mt-2 text-[15px] font-semibold leading-6 text-slate-950">{fact.value}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-4">
            <Link
              href={`/projects/${project.slug}/case-study`}
              className="inline-flex items-center gap-2 bg-slate-950 px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-slate-800"
            >
              {c.caseStudy}
              <ArrowRight className="h-4 w-4" />
            </Link>

            {proofUrl ? (
              <a
                href={proofUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-slate-400 bg-white px-5 py-3 text-[14px] font-semibold text-slate-800 transition hover:border-slate-700"
              >
                {c.repository}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ) : null}

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-1 py-3 text-[14px] font-semibold text-slate-700 underline decoration-slate-400 underline-offset-4 transition hover:text-slate-950 hover:decoration-slate-950"
            >
              {c.contact}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#0D1B2A] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[220px_1fr_auto] lg:items-center lg:px-8">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{c.evidence}</p>
          <p className="max-w-3xl text-[15px] leading-7 text-[#EAF0F6]">
            {goldStandard?.sourceNote || raw.confidentiality}
          </p>
          {proofUrl ? (
            <a href={proofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[14px] font-semibold text-white underline decoration-[#5E86A8] underline-offset-4">
              {c.repository}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </section>
    </main>
  )
}
