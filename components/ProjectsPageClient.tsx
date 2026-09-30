'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { projectCaseIndexTitle, projectUi, publicProject } from '@/lib/project-public-copy'
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

const projectFilters: Record<string, CaseFilter[]> = {
  'ai-accounting-agents': ['ai', 'automation'],
  'ai-knowledge-workflow': ['ai', 'automation'],
  'banking-risk-decision-system': ['risk', 'decision'],
  'business-operating-crm': ['automation', 'decision'],
  'ecommerce-demand-forecasting': ['forecasting', 'decision'],
  'erp-operations-control': ['automation', 'optimisation', 'decision'],
  'investment-analytics-platform': ['analytics', 'decision'],
  'quantitative-trading-framework': ['forecasting', 'risk', 'decision'],
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
      forecasting: 'Predicción',
      ai: 'IA y agentes',
      automation: 'Automatización',
      optimisation: 'Optimización',
      risk: 'Riesgo',
      decision: 'Sistemas de decisión',
      analytics: 'Apps analíticas',
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
      forecasting: 'Predicció',
      ai: 'IA i agents',
      automation: 'Automatització',
      optimisation: 'Optimització',
      risk: 'Risc',
      decision: 'Sistemes de decisió',
      analytics: 'Apps analítiques',
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
      forecasting: 'Forecasting',
      ai: 'AI & agents',
      automation: 'Automation',
      optimisation: 'Optimisation',
      risk: 'Risk',
      decision: 'Decision systems',
      analytics: 'Analytics apps',
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
        <div className="mx-auto max-w-7xl px-6 pb-9 pt-11 lg:px-8 lg:pb-10 lg:pt-12">
          <div className="grid gap-6 lg:grid-cols-[170px_1fr] lg:items-end">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-indigo-700">{t.label}</p>
              <p className="mt-4 font-mono text-[13px] text-slate-500">
                {String(projects.length).padStart(2, '0')} {c.count}
              </p>
            </div>
            <div>
              <h1
                className="max-w-4xl text-[38px] leading-[1.02] tracking-[-0.025em] text-slate-950 sm:text-[44px] lg:text-[49px]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.title}
              </h1>
              <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">{c.instruction}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-6 overflow-x-auto py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="shrink-0 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">{c.filterLabel}</span>
            {filterOrder.map((filter) => {
              const active = activeFilter === filter
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`relative shrink-0 py-1 text-[14px] transition-colors after:absolute after:-bottom-[15px] after:left-0 after:h-px after:w-full after:origin-left after:bg-slate-950 after:transition-transform ${
                    active
                      ? 'font-semibold text-slate-950 after:scale-x-100'
                      : 'font-medium text-slate-500 after:scale-x-0 hover:text-slate-950'
                  }`}
                >
                  {c.filters[filter]}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-5 lg:px-8 lg:py-6">
        <div className="border-t border-slate-400">
          {filteredProjects.map(({ project: raw, index }) => {
            const project = publicProject(raw, lang)
            const caseTitle = projectCaseIndexTitle(raw, lang)

            return (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group grid gap-3 border-b border-slate-300 py-[15px] transition-colors hover:bg-white/80 sm:grid-cols-[54px_1fr_110px] sm:items-center sm:gap-5"
              >
                <span className="font-mono text-[12px] text-slate-400">{String(index + 1).padStart(2, '0')}</span>

                <h2
                  className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[21px] leading-[1.08] tracking-[-0.01em] text-slate-950 transition-colors group-hover:text-indigo-800 sm:text-[22px] lg:text-[24px]"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                  title={caseTitle}
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
