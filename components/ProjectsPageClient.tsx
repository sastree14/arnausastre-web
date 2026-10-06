'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { projectCaseIndexTitle, projectUi } from '@/lib/project-public-copy'
import type { Project } from '@/lib/projects'
import { getPortfolioCaseProfile } from '@/lib/portfolio-case-registry'

type CaseFilter =
  | 'all'
  | 'planning'
  | 'ai_automation'
  | 'operations'
  | 'risk_decision'
  | 'finance'
  | 'analytics'
  | 'business_systems'

function filtersForProject(slug: string): CaseFilter[] {
  const profile = getPortfolioCaseProfile(slug)
  if (!profile) return []

  switch (profile.archetype) {
    case 'agent':
      return ['ai_automation', 'business_systems', 'analytics']
    case 'data':
      return ['analytics', 'business_systems', 'operations']
    case 'forecast':
      return ['planning', 'operations', 'analytics']
    case 'bi':
      return ['analytics', 'business_systems']
    case 'customer':
      return ['analytics', 'risk_decision']
    case 'risk':
      return ['risk_decision', 'finance', 'analytics']
    case 'optimization':
      return ['operations', 'planning', 'analytics']
    case 'finance':
      return ['finance', 'risk_decision', 'analytics']
    case 'quant':
      return ['finance', 'risk_decision', 'analytics']
    case 'specialized':
      return ['business_systems', 'analytics', 'finance']
    case 'vision':
      return ['ai_automation', 'operations', 'analytics']
  }

  return []
}

const copy = {
  es: {
    explore: 'Explorar casos de éxito',
    contact: 'Cuéntanos tu caso',
    count: 'casos de éxito disponibles',
    instruction: 'Explora nuestros casos de éxito por el tipo de reto empresarial que quieres resolver.',
    view: 'Abrir caso de éxito',
    filterLabel: 'Áreas de trabajo',
    empty: 'No hay casos de éxito publicados en esta categoría.',
    filters: {
      all: 'Todos los casos de éxito',
      planning: 'Predicción y planificación',
      ai_automation: 'IA y automatización',
      operations: 'Operaciones y optimización',
      risk_decision: 'Riesgo y decisión',
      finance: 'Finanzas y modelización',
      analytics: 'Analytics y reporting',
      business_systems: 'Sistemas empresariales',
    },
  },
  ca: {
    explore: 'Explorar casos d’èxit',
    contact: 'Explica’ns el teu cas',
    count: 'casos d’èxit disponibles',
    instruction: 'Explora els nostres casos d’èxit pel tipus de repte empresarial que vols resoldre.',
    view: 'Obrir cas d’èxit',
    filterLabel: 'Àrees de treball',
    empty: 'No hi ha casos d’èxit publicats en aquesta categoria.',
    filters: {
      all: 'Tots els casos d’èxit',
      planning: 'Predicció i planificació',
      ai_automation: 'IA i automatització',
      operations: 'Operacions i optimització',
      risk_decision: 'Risc i decisió',
      finance: 'Finances i modelització',
      analytics: 'Analytics i reporting',
      business_systems: 'Sistemes empresarials',
    },
  },
  en: {
    explore: 'Explore success stories',
    contact: 'Tell us about your case',
    count: 'available success stories',
    instruction: 'Explore our success stories by the kind of business challenge you want to solve.',
    view: 'Open success story',
    filterLabel: 'Areas of work',
    empty: 'No published success stories in this category.',
    filters: {
      all: 'All success stories',
      planning: 'Forecasting & planning',
      ai_automation: 'AI & automation',
      operations: 'Operations & optimisation',
      risk_decision: 'Risk & decision',
      finance: 'Finance & modelling',
      analytics: 'Analytics & reporting',
      business_systems: 'Business systems',
    },
  },
} as const

const filterOrder: CaseFilter[] = [
  'all',
  'planning',
  'ai_automation',
  'operations',
  'risk_decision',
  'finance',
  'analytics',
  'business_systems',
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
        return filtersForProject(project.slug).includes(activeFilter)
      })
  }, [projects, activeFilter])

  return (
    <main className="bg-[#F7F9FC] text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="site-container flex flex-col items-center gap-8 py-14 text-center md:py-16">
          <div className="max-w-5xl">
            <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[#C7D9E8]">{t.label}</p>
            <h1 className="mt-5 text-[44px] leading-[1.02] tracking-[-0.03em] sm:text-[54px] lg:text-[62px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
            <p className="mx-auto mt-5 max-w-3xl text-[18px] leading-8 text-[#EAF0F6]">{c.instruction}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#case-filters" className="bg-white px-5 py-3.5 text-[15px] font-semibold text-[#0D1B2A] transition hover:bg-[#EAF0F6]">{c.explore} →</a>
            <Link href="/contact?intent=problem" className="border border-[#7F9BB5] px-5 py-3.5 text-[15px] font-semibold text-white transition hover:bg-white/5">{c.contact}</Link>
          </div>
          <p className="font-mono text-[14px] text-[#C7D9E8]">{String(projects.length).padStart(2, '0')} {c.count}</p>
        </div>
      </section>

      <section id="case-filters" className="scroll-mt-24 border-b border-slate-300 bg-[#FFFFFF]">
        <div className="site-container py-5">
          <p className="mb-3 text-[14px] font-semibold uppercase tracking-[0.14em] text-slate-500">{c.filterLabel}</p>
          <div className="grid grid-cols-2 border-l border-t border-slate-300 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-8">
            {filterOrder.map((filter) => {
              const active = activeFilter === filter
              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveFilter(filter)}
                  className={`flex min-h-[66px] items-center justify-center border-b border-r px-4 py-3 text-center text-[14px] font-medium leading-[1.2] transition-colors ${
                    active
                      ? 'border-slate-300 bg-[#254A66] font-semibold text-white'
                      : 'border-slate-300 bg-[#EAF0F6] text-[#254A66] hover:bg-white hover:text-slate-950'
                  }`}
                >
                  <span className="max-w-[150px] whitespace-normal">{c.filters[filter]}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="site-container py-5 lg:py-6">
        <div className="border-t border-slate-400">
          {filteredProjects.map(({ project: raw, index }) => {
            const caseTitle = projectCaseIndexTitle(raw, lang)

            return (
              <Link
                key={raw.slug}
                href={`/projects/${raw.slug}`}
                className="group grid gap-3 border-b border-slate-300 py-4 transition-colors hover:bg-white/80 sm:grid-cols-[54px_minmax(0,1fr)_110px] sm:items-center sm:gap-5 lg:py-[17px]"
              >
                <span className="font-mono text-[14px] text-slate-400">{String(index + 1).padStart(2, '0')}</span>

                <h2
                  className="min-w-0 max-w-5xl text-[21px] leading-[1.12] tracking-[-0.01em] text-slate-950 transition-colors group-hover:text-[#4F46E5] sm:text-[22px] lg:text-[24px]"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {caseTitle}
                </h2>

                <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-slate-600 transition group-hover:text-slate-950 sm:justify-end">
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
          <p className="mt-6 max-w-3xl text-[14px] leading-6 text-slate-400">{t.sourceNote}</p>
        ) : null}
      </section>
    </main>
  )
}
