'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { projectCaseIndexTitle, projectUi } from '@/lib/project-public-copy'
import type { Project } from '@/lib/projects'

type CaseFilter =
  | 'all'
  | 'forecasting'
  | 'ai'
  | 'automation'
  | 'optimisation'
  | 'risk'
  | 'decision'
  | 'analytics'
  | 'finance'

const projectFilters: Record<string, CaseFilter[]> = {
  'ai-accounting-agents': ['ai', 'automation'],
  'ai-knowledge-workflow': ['ai', 'automation'],
  'banking-risk-decision-system': ['risk', 'decision'],
  'business-operating-crm': ['automation', 'decision'],
  'ecommerce-demand-forecasting': ['forecasting', 'decision'],
  'erp-operations-control': ['automation', 'optimisation', 'decision'],
  'investment-analytics-platform': ['analytics', 'decision', 'finance'],
  'quantitative-trading-framework': ['forecasting', 'risk', 'decision', 'finance'],
  'reinforcement-learning-decision-system': ['optimisation', 'decision'],
  'r-shiny-decision-app': ['analytics', 'decision'],
}

const copy = {
  es: {
    count: 'casos disponibles',
    instruction: 'Empieza por el problema que más se parece al tuyo. Si ya sabes qué tipo de sistema buscas, filtra la lista.',
    view: 'Abrir caso',
    filterLabel: 'Filtrar por',
    empty: 'No hay casos publicados en esta categoría.',
    filters: {
      all: 'Todos',
      forecasting: 'Forecasting y planificación',
      ai: 'Agentes de IA',
      automation: 'Automatización de procesos',
      optimisation: 'Optimización operativa',
      risk: 'Riesgo y scoring',
      decision: 'Sistemas de decisión',
      analytics: 'Analytics y reporting',
      finance: 'Modelización financiera',
    },
  },
  ca: {
    count: 'casos disponibles',
    instruction: 'Comença pel problema que més s’assembla al teu. Si ja saps quin tipus de sistema busques, filtra la llista.',
    view: 'Obrir cas',
    filterLabel: 'Filtrar per',
    empty: 'No hi ha casos publicats en aquesta categoria.',
    filters: {
      all: 'Tots',
      forecasting: 'Forecasting i planificació',
      ai: 'Agents d’IA',
      automation: 'Automatització de processos',
      optimisation: 'Optimització operativa',
      risk: 'Risc i scoring',
      decision: 'Sistemes de decisió',
      analytics: 'Analytics i reporting',
      finance: 'Modelització financera',
    },
  },
  en: {
    count: 'available cases',
    instruction: 'Start with the problem closest to yours. If you already know the kind of system you need, filter the list.',
    view: 'Open case',
    filterLabel: 'Filter by',
    empty: 'No published cases in this category.',
    filters: {
      all: 'All',
      forecasting: 'Forecasting & planning',
      ai: 'AI agents',
      automation: 'Process automation',
      optimisation: 'Operational optimisation',
      risk: 'Risk & scoring',
      decision: 'Decision systems',
      analytics: 'Analytics & reporting',
      finance: 'Financial modelling',
    },
  },
} as const

const filterOrder: CaseFilter[] = [
  'all',
  'forecasting',
  'ai',
  'automation',
  'optimisation',
  'risk',
  'decision',
  'analytics',
  'finance',
]

export default function ProjectsPageClient({ projects }: { projects: Project[] }) {
  const { lang } = useSiteLanguage()
  const t = projectUi[lang]
  const c = copy[lang]
  const [activeFilter, setActiveFilter] = useState<CaseFilter>('all')

  const filteredProjects = useMemo(() => {
    return projects
      .map((project, index) => ({ project, index }))
      .filter(({ project }) => {
        if (activeFilter === 'all') return true
        return (projectFilters[project.slug] || []).includes(activeFilter)
      })
  }, [projects, activeFilter])

  return (
    <main className="bg-[#FAFAF7] text-slate-950">
      <section className="border-b border-slate-300">
        <div className="mx-auto w-[min(94vw,1700px)] pb-9 pt-11 lg:pb-10 lg:pt-12">
          <div className="grid gap-6 lg:grid-cols-[clamp(150px,11vw,190px)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-indigo-700">{t.label}</p>
              <p className="mt-4 font-mono text-[13px] text-slate-500">
                {String(projects.length).padStart(2, '0')} {c.count}
              </p>
            </div>
            <div>
              <h1
                className="max-w-5xl text-[38px] leading-[1.02] tracking-[-0.025em] text-slate-950 sm:text-[44px] lg:text-[clamp(44px,3vw,54px)]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.title}
              </h1>
              <p className="mt-3 max-w-4xl text-[15px] leading-7 text-slate-600">{c.instruction}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="mx-auto w-[min(94vw,1700px)] py-3">
          <div className="flex flex-wrap items-center gap-2.5 lg:gap-3">
            <span className="mr-1 shrink-0 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">{c.filterLabel}</span>
            {filterOrder.map((filter) => {
              const active = activeFilter === filter
              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveFilter(filter)}
                  className={\`inline-flex min-h-[46px] max-w-[190px] items-center justify-center border px-4 py-2.5 text-center text-[13px] font-medium leading-[1.18] transition-colors sm:max-w-[220px] \${
                    active
                      ? 'border-slate-950 bg-white font-semibold text-slate-950 shadow-[inset_0_-2px_0_#0f172a]'
                      : 'border-slate-300 bg-transparent text-slate-600 hover:border-slate-500 hover:bg-white/75 hover:text-slate-950'
                  }\`}
                >
                  <span className="whitespace-normal">{c.filters[filter]}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-[min(94vw,1700px)] py-5 lg:py-6">
        <div className="border-t border-slate-400">
          {filteredProjects.map(({ project: raw, index }) => {
            const caseTitle = projectCaseIndexTitle(raw, lang)

            return (
              <Link
                key={raw.slug}
                href={\`/projects/\${raw.slug}\`}
                className="group grid gap-3 border-b border-slate-300 py-4 transition-colors hover:bg-white/80 sm:grid-cols-[54px_minmax(0,1fr)_110px] sm:items-center sm:gap-5 lg:py-[17px]"
              >
                <span className="font-mono text-[12px] text-slate-400">{String(index + 1).padStart(2, '0')}</span>

                <h2
                  className="min-w-0 max-w-5xl text-[21px] leading-[1.12] tracking-[-0.01em] text-slate-950 transition-colors group-hover:text-indigo-800 sm:text-[22px] lg:text-[24px]"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {caseTitle}
                </h2>

                <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-600 transition group-hover:text-slate-950 sm:justify-end">
                  {c.view}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            )
          })}
        </div>

        {filteredProjects.length === 0 ? (
          <p className="py-10 text-[14px] text-slate-500">{c.empty}</p>
        ) : null}

        {lang !== 'en' && projects.length > 0 ? (
          <p className="mt-6 max-w-3xl text-[12px] leading-6 text-slate-400">{t.sourceNote}</p>
        ) : null}
      </section>
    </main>
  )
}
