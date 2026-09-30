'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { projectCaseIndexTitle, projectUi, publicProject } from '@/lib/project-public-copy'
import type { Project } from '@/lib/projects'

const copy = {
  es: {
    index: 'Índice',
    count: 'casos disponibles',
    instruction: 'Busca primero el problema o sistema que se parece al tuyo.',
    view: 'Abrir caso',
  },
  ca: {
    index: 'Índex',
    count: 'casos disponibles',
    instruction: 'Busca primer el problema o sistema que s’assembla al teu.',
    view: 'Obrir cas',
  },
  en: {
    index: 'Index',
    count: 'available cases',
    instruction: 'Start with the problem or system that looks closest to yours.',
    view: 'Open case',
  },
} as const

export default function ProjectsPageClient({ projects }: { projects: Project[] }) {
  const { lang } = useSiteLanguage()
  const t = projectUi[lang]
  const c = copy[lang]

  return (
    <main className="bg-[#FAFAF7] text-slate-950">
      <section className="border-b border-slate-300">
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-12 lg:px-8 lg:pb-12 lg:pt-14">
          <div className="grid gap-7 lg:grid-cols-[180px_1fr] lg:items-end">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-indigo-700">{t.label}</p>
              <p className="mt-5 font-mono text-[13px] text-slate-500">
                {String(projects.length).padStart(2, '0')} {c.count}
              </p>
            </div>
            <div>
              <h1
                className="max-w-4xl text-4xl leading-[1.02] tracking-[-0.03em] text-slate-950 sm:text-5xl lg:text-[54px]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.title}
              </h1>
              <p className="mt-4 max-w-3xl text-[16px] leading-7 text-slate-600">{t.sub}</p>
              <p className="mt-2 text-[14px] font-medium text-slate-500">{c.instruction}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-6 lg:px-8 lg:py-8">
        <div className="border-t border-slate-400">
          {projects.map((raw, index) => {
            const project = publicProject(raw, lang)
            const caseTitle = projectCaseIndexTitle(raw, lang)
            return (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group grid gap-3 border-b border-slate-300 py-4 transition-colors hover:bg-white/80 sm:grid-cols-[56px_1fr_110px] sm:items-center sm:gap-5 lg:py-[18px]"
              >
                <span className="font-mono text-[13px] text-slate-400">{String(index + 1).padStart(2, '0')}</span>

                <h2
                  className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[22px] leading-[1.08] tracking-[-0.012em] text-slate-950 transition-colors group-hover:text-indigo-800 sm:text-[24px] lg:text-[26px]"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                  title={caseTitle}
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

        {lang !== 'en' && projects.length > 0 ? (
          <p className="mt-7 max-w-3xl text-[12px] leading-6 text-slate-400">{t.sourceNote}</p>
        ) : null}
      </section>
    </main>
  )
}
