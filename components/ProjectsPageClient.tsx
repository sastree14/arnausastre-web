'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { projectUi, publicProject } from '@/lib/project-public-copy'
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
        <div className="mx-auto max-w-7xl px-6 pb-12 pt-14 lg:px-8 lg:pb-14 lg:pt-16">
          <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:items-end">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-indigo-700">{t.label}</p>
              <p className="mt-5 font-mono text-[13px] text-slate-500">
                {String(projects.length).padStart(2, '0')} {c.count}
              </p>
            </div>
            <div>
              <h1
                className="max-w-4xl text-5xl leading-[1.02] tracking-[-0.03em] text-slate-950 sm:text-6xl lg:text-[66px]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.title}
              </h1>
              <p className="mt-5 max-w-3xl text-[17px] leading-8 text-slate-600">{t.sub}</p>
              <p className="mt-3 text-[14px] font-medium text-slate-500">{c.instruction}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
        <div className="border-t border-slate-400">
          {projects.map((raw, index) => {
            const project = publicProject(raw, lang)
            return (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group grid gap-3 border-b border-slate-300 py-6 transition-colors hover:bg-white/80 sm:grid-cols-[64px_180px_1fr_120px] sm:items-center sm:gap-5 lg:py-7"
              >
                <span className="font-mono text-[13px] text-slate-400">{String(index + 1).padStart(2, '0')}</span>

                <div className="hidden sm:block">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.11em] text-slate-500">{project.industry}</p>
                  <p className="mt-1 text-[13px] text-slate-400">{project.challenge}</p>
                </div>

                <h2
                  className="max-w-3xl text-[28px] leading-[1.12] tracking-[-0.015em] text-slate-950 transition-colors group-hover:text-indigo-800 sm:text-[31px] lg:text-[35px]"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {project.headline}
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
