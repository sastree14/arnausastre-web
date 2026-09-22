'use client'

import Link from 'next/link'
import ProjectCover from '@/components/ProjectCover'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { projectUi, publicProject } from '@/lib/project-public-copy'
import type { Project } from '@/lib/projects'

const sectionLabels: Record<string, Record<'es'|'ca', string>> = {
  Context: { es: 'Contexto', ca: 'Context' },
  Problem: { es: 'Problema', ca: 'Problema' },
  Approach: { es: 'Enfoque', ca: 'Enfocament' },
  'System Developed': { es: 'Sistema desarrollado', ca: 'Sistema desenvolupat' },
  Results: { es: 'Resultados', ca: 'Resultats' },
}

function renderBody(text: string) {
  return text.split('\n\n').map((paragraph, index) => <p key={index} className="mb-5 leading-8 text-slate-700">{paragraph.trim()}</p>)
}

export default function ProjectDetailClient({ project: raw }: { project: Project }) {
  const { lang } = useSiteLanguage()
  const project = publicProject(raw, lang)
  const t = projectUi[lang]

  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <Link href="/projects" className="mb-10 inline-flex text-sm text-slate-500 transition hover:text-slate-900">{t.back}</Link>
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <div className="mb-6 flex flex-wrap gap-2">
                <span className="rounded-md bg-slate-950 px-3 py-1.5 text-xs font-medium text-white">{project.industry}</span>
                {project.capability.split(',').map((capability)=><span key={capability} className="rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700">{capability.trim()}</span>)}
                <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">{project.challenge}</span>
              </div>
              <h1 className="text-4xl leading-tight text-slate-950 md:text-5xl" style={{fontFamily:'var(--font-playfair)'}}>{project.headline}</h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">{project.description}</p>
              {lang !== 'en' && <p className="mt-5 text-xs leading-5 text-slate-400">{t.sourceNote}</p>}
            </div>
            <div className="aspect-[3/2] w-full overflow-hidden rounded-2xl"><ProjectCover image={project.image} imagePath={project.imagePath} headline={project.headline} industry={project.industry} capability={project.capability} priority/></div>
          </div>
        </div>
      </section>

      {project.metrics.length > 0 && <section className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-6 py-12"><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{project.metrics.slice(0,4).map((metric)=><div key={metric.label} className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4"><p className="text-xs leading-tight text-slate-400">{metric.label}</p><p className="mt-1 text-xl font-semibold text-slate-950">{metric.value}</p></div>)}</div></div></section>}

      {project.sections.length > 0 && <section className="mx-auto max-w-4xl space-y-12 px-6 py-20">{project.sections.map((section)=>{
        const translatedTitle = lang === 'en' ? section.title : sectionLabels[section.title]?.[lang] || section.title
        return <div key={section.title}><h2 className="mb-5 text-2xl text-slate-950" style={{fontFamily:'var(--font-playfair)'}}>{translatedTitle}</h2><div className="rounded-2xl border border-slate-200 bg-white p-8">{renderBody(section.body)}</div></div>
      })}</section>}

      {project.confidentiality && <section className="mx-auto max-w-4xl px-6 pb-12"><div className="rounded-xl border border-slate-200 bg-white px-6 py-4"><p className="text-xs leading-6 text-slate-500">{project.confidentiality}</p></div></section>}

      <section className="border-t border-slate-200 bg-white"><div className="mx-auto max-w-4xl px-6 py-16 text-center"><h2 className="text-3xl text-slate-950" style={{fontFamily:'var(--font-playfair)'}}>{t.detailCta}</h2><p className="mx-auto mt-4 max-w-xl text-slate-600">{t.detailCtaSub}</p><Link href="/contact" className="mt-8 inline-block rounded-lg bg-slate-950 px-8 py-3.5 text-sm font-semibold text-white hover:bg-slate-800">{t.contact}</Link></div></section>
    </main>
  )
}
