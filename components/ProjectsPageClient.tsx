'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { projectUi, publicProject } from '@/lib/project-public-copy'
import type { Project } from '@/lib/projects'

export default function ProjectsPageClient({ projects }: { projects: Project[] }) {
  const { lang } = useSiteLanguage()
  const t = projectUi[lang]

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">{t.label}</p>
          <h1 className="mt-5 max-w-4xl text-5xl leading-[1.08] md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">{t.sub}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center text-sm text-slate-500">No published projects yet.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((raw) => {
              const project = publicProject(raw, lang)
              return (
                <Link key={project.slug} href={`/projects/${project.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/50">
                  <div className="relative aspect-[3/2] w-full overflow-hidden bg-slate-100">
                    <Image src={project.imagePath} alt={project.headline} fill className="object-cover transition duration-300 group-hover:scale-[1.02]" sizes="(max-width:768px) 100vw,(max-width:1280px) 50vw,33vw" />
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.12em]"><span className="text-indigo-600">{project.industry}</span><span className="text-slate-300">·</span><span className="text-slate-500">{project.challenge}</span></div>
                    <h2 className="mt-4 text-xl leading-snug text-slate-950 transition group-hover:text-indigo-700" style={{ fontFamily: 'var(--font-playfair)' }}>{project.headline}</h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{project.description}</p>
                    {project.metrics.length > 0 && <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-5">{project.metrics.slice(0,4).map((metric)=><div key={metric.label} className="rounded-lg bg-slate-50 px-3 py-2.5"><p className="text-[10px] leading-tight text-slate-400">{metric.label}</p><p className="mt-1 text-sm font-semibold text-slate-900">{metric.value}</p></div>)}</div>}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
        {lang !== 'en' && projects.length > 0 && <p className="mt-8 text-xs leading-5 text-slate-400">{t.sourceNote}</p>}
      </section>
    </main>
  )
}
