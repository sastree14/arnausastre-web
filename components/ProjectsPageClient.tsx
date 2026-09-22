'use client'

import Image from 'next/image'
import Link from 'next/link'
import ProjectCover from '@/components/ProjectCover'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { projectUi, publicProject } from '@/lib/project-public-copy'
import type { Project } from '@/lib/projects'

export default function ProjectsPageClient({ projects }: { projects: Project[] }) {
  const { lang } = useSiteLanguage()
  const t = projectUi[lang]
  const libraryLabel=lang==='es'?'Biblioteca de sistemas':lang==='ca'?'Biblioteca de sistemes':'Systems library'
  const libraryBody=lang==='es'
    ?'No todo lo que construimos nace como un caso público de cliente. También documentamos sistemas internos, prototipos, herramientas y arquitecturas que demuestran capacidad técnica reutilizable.'
    :lang==='ca'
      ?'No tot el que construïm neix com un cas públic de client. També documentem sistemes interns, prototips, eines i arquitectures que demostren capacitat tècnica reutilitzable.'
      :'Not everything we build starts as a public client case. We also document internal systems, prototypes, tools and architectures that demonstrate reusable technical capability.'

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:py-28 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">{t.label}</p>
            <h1 className="mt-5 max-w-4xl text-5xl leading-[1.08] md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">{t.sub}</p>
          </div>
          <div className="relative hidden min-h-[260px] items-center justify-center lg:flex">
            <div className="absolute h-60 w-60 rounded-full border border-indigo-300/10"/>
            <Image src="/brand/logo-horizontal-transparent.png" alt="SC-Analytics" width={620} height={320} className="relative z-10 w-full max-w-md object-contain" priority/>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 md:grid-cols-[.35fr_1.65fr]">
          <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-indigo-600">{libraryLabel}</p><p className="mt-2 text-3xl font-semibold text-slate-950">{projects.length}</p></div>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">{libraryBody}</p>
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
                  <div className="aspect-[3/2] w-full overflow-hidden">
                    <ProjectCover image={project.image} imagePath={project.imagePath} headline={project.headline} industry={project.industry} capability={project.capability} forceBrand/>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.12em]"><span className="text-indigo-600">{project.industry}</span><span className="text-slate-300">·</span><span className="text-slate-500">{project.challenge}</span></div>
                    <h2 className="mt-4 text-xl leading-snug text-slate-950 transition group-hover:text-indigo-700" style={{ fontFamily: 'var(--font-playfair)' }}>{project.headline}</h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{project.description}</p>
                    {project.metrics.length > 0 && <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-5">{project.metrics.slice(0,4).map((metric)=><div key={metric.label} className="px-1 py-2"><p className="text-[10px] leading-tight text-slate-400">{metric.label}</p><p className="mt-1 text-sm font-semibold text-slate-900">{metric.value}</p></div>)}</div>}
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
