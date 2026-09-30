'use client'

import Link from 'next/link'
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
    problem:
      'A single aggregate forecast score can hide weak performance exactly at the horizon where inventory decisions are made.',
    built:
      'A multi-horizon forecasting pipeline for H1, H3, H6 and H9, with statistical baselines, XGBoost/LightGBM candidates, horizon-level backtesting and a FastAPI/PostgreSQL serving path.',
    utility:
      'It makes model usefulness visible by planning horizon and connects forecast evaluation to inventory-oriented indicators such as service level and coverage.',
  },
  es: {
    problem:
      'Un único error agregado puede ocultar un rendimiento débil justo en el horizonte donde se toman decisiones de inventario.',
    built:
      'Un pipeline de forecasting multi-horizonte H1, H3, H6 y H9 con baselines estadísticos, candidatos XGBoost/LightGBM, backtesting por horizonte y serving con FastAPI/PostgreSQL.',
    utility:
      'Permite ver qué modelo resulta útil en cada horizonte y conectar la evaluación del forecast con indicadores de inventario como nivel de servicio y cobertura.',
  },
  ca: {
    problem:
      'Un únic error agregat pot ocultar un rendiment dèbil just a l’horitzó on es prenen decisions d’inventari.',
    built:
      'Un pipeline de forecasting multi-horitzó H1, H3, H6 i H9 amb baselines estadístics, candidats XGBoost/LightGBM, backtesting per horitzó i serving amb FastAPI/PostgreSQL.',
    utility:
      'Permet veure quin model és útil a cada horitzó i connectar l’avaluació del forecast amb indicadors d’inventari com nivell de servei i cobertura.',
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
