'use client'

import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { projectUi, publicProject } from '@/lib/project-public-copy'
import { getWebsiteProjectGoldStandard } from '@/lib/website-project-gold-standard'
import type { Project } from '@/lib/projects'

const copy = {
  es: {
    index: 'Índice de proyectos',
    systems: 'sistemas publicados',
    view: 'Ver caso',
    proof: 'Repositorio',
    evidence: 'Evidencia pública',
    intro:
      'Una selección de sistemas de forecasting, optimización, riesgo, automatización y decisión. Cada página separa con claridad el problema, el sistema construido, la evidencia disponible y la implementación técnica.',
  },
  ca: {
    index: 'Índex de projectes',
    systems: 'sistemes publicats',
    view: 'Veure cas',
    proof: 'Repositori',
    evidence: 'Evidència pública',
    intro:
      'Una selecció de sistemes de forecasting, optimització, risc, automatització i decisió. Cada pàgina separa amb claredat el problema, el sistema construït, l’evidència disponible i la implementació tècnica.',
  },
  en: {
    index: 'Project index',
    systems: 'published systems',
    view: 'View case',
    proof: 'Repository',
    evidence: 'Public evidence',
    intro:
      'A selection of forecasting, optimisation, risk, automation and decision systems. Each project page separates the problem, the system built, available evidence and technical implementation.',
  },
} as const

export default function ProjectsPageClient({ projects }: { projects: Project[] }) {
  const { lang } = useSiteLanguage()
  const t = projectUi[lang]
  const c = copy[lang]

  return (
    <main className="bg-[#FAFAF7] text-slate-950">
      <section className="border-b border-slate-300 bg-[#FAFAF7]">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-14 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-indigo-700">{t.label}</p>
              <h1
                className="mt-5 max-w-3xl text-5xl leading-[1.02] tracking-[-0.03em] text-slate-950 sm:text-6xl lg:text-[68px]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.title}
              </h1>
            </div>
            <div className="border-l border-slate-300 pl-6 lg:pl-10">
              <p className="max-w-2xl text-lg leading-8 text-slate-600">{t.sub}</p>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500">{c.intro}</p>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap items-end justify-between gap-6 border-t border-slate-300 pt-6">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">{c.index}</p>
              <p className="mt-2 text-sm text-slate-500">
                <span className="mr-2 font-mono text-2xl font-semibold text-slate-950">{String(projects.length).padStart(2, '0')}</span>
                {c.systems}
              </p>
            </div>
            <p className="max-w-xl text-right text-sm leading-6 text-slate-500">
              {lang === 'es'
                ? 'Casos de capacidad e implementación. Cuando existe evidencia técnica pública, se enlaza directamente.'
                : lang === 'ca'
                  ? 'Casos de capacitat i implementació. Quan existeix evidència tècnica pública, s’enllaça directament.'
                  : 'Capability and implementation cases. When public technical evidence exists, it is linked directly.'}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
        {projects.length === 0 ? (
          <div className="border border-slate-300 bg-white p-12 text-center text-sm text-slate-500">No published projects yet.</div>
        ) : (
          <div className="border-t border-slate-300">
            {projects.map((raw, index) => {
              const project = publicProject(raw, lang)
              const goldStandard = getWebsiteProjectGoldStandard(project.slug)
              const facts = project.metrics.slice(0, 3)

              return (
                <article
                  key={project.slug}
                  className="group grid gap-7 border-b border-slate-300 py-9 transition-colors hover:bg-white/70 md:grid-cols-[72px_1fr] lg:grid-cols-[72px_1.05fr_.95fr_160px] lg:items-start lg:gap-8"
                >
                  <div className="font-mono text-[13px] text-slate-400">{String(index + 1).padStart(2, '0')}</div>

                  <div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold uppercase tracking-[0.13em]">
                      <span className="text-indigo-700">{project.industry}</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-slate-500">{project.challenge}</span>
                    </div>

                    <Link href={`/projects/${project.slug}`} className="block">
                      <h2
                        className="mt-4 max-w-2xl text-3xl leading-[1.12] tracking-[-0.02em] text-slate-950 transition-colors group-hover:text-indigo-800 lg:text-[34px]"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                      >
                        {project.headline}
                      </h2>
                    </Link>

                    <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-600">{project.description}</p>

                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-2 font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-950">
                        {c.view}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      {goldStandard ? (
                        <a
                          href={goldStandard.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-950 hover:decoration-slate-950"
                        >
                          {c.proof}
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-0 border-y border-slate-200 lg:border-y-0 lg:border-l lg:border-slate-300 lg:pl-8">
                    {facts.length > 0 ? (
                      facts.map((metric) => (
                        <div key={metric.label} className="grid grid-cols-[.9fr_1.1fr] gap-4 border-b border-slate-200 py-3 last:border-b-0 lg:first:pt-0">
                          <p className="text-[12px] leading-5 text-slate-500">{metric.label}</p>
                          <p className="text-right text-[13px] font-semibold leading-5 text-slate-900">{metric.value}</p>
                        </div>
                      ))
                    ) : (
                      <div className="py-3 text-sm leading-6 text-slate-500">{project.capability}</div>
                    )}
                  </div>

                  <div className="hidden lg:block">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {goldStandard ? c.evidence : project.capability.split(',')[0]}
                    </p>
                    <div className="mt-4 h-[2px] w-12 bg-indigo-600 transition-all group-hover:w-20" />
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {lang !== 'en' && projects.length > 0 ? (
          <p className="mt-8 max-w-3xl text-xs leading-5 text-slate-400">{t.sourceNote}</p>
        ) : null}
      </section>
    </main>
  )
}
