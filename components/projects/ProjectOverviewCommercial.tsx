'use client'

import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import BusinessScenarioStrip from '@/components/projects/BusinessScenarioStrip'
import { projectOverviewUi, sc12CommercialCopy } from '@/lib/project-commercial-copy'
import { publicProject } from '@/lib/project-public-copy'
import type { Project } from '@/lib/projects'
import type { WebsiteProjectGoldStandard } from '@/lib/website-project-gold-standard'

type Props = {
  project: Project
  goldStandard?: WebsiteProjectGoldStandard
}

export default function ProjectOverviewCommercial({ project: raw, goldStandard }: Props) {
  const { lang } = useSiteLanguage()
  const ui = projectOverviewUi[lang]
  const project = publicProject(raw, lang)
  const isSc12 = project.slug === 'ecommerce-demand-forecasting'
  const commercial = isSc12 ? sc12CommercialCopy[lang] : null
  const proofUrl = goldStandard?.proofUrl

  const genericProblem =
    raw.sections.find((section) => ['Problem', 'Context'].includes(section.title))?.body ||
    project.description
  const genericChanged =
    raw.sections.find((section) => ['System Developed', 'Approach', 'Solution'].includes(section.title))?.body ||
    project.capability
  const genericUtility = project.description

  const problem = commercial?.problem || genericProblem
  const changed = commercial?.changed || genericChanged
  const utility = commercial?.utility || genericUtility
  const hook = commercial?.hook || project.description

  return (
    <main className="bg-[#FAFAF7] text-slate-950">
      <section className="border-b border-slate-300">
        <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1800px] sm:w-[calc(100%_-_48px)] pb-10 pt-9 lg:pb-12 lg:pt-10">
          <Link href="/projects" className="inline-flex items-center gap-2 text-[14px] text-slate-500 transition hover:text-slate-950">
            <span aria-hidden="true">←</span>
            {ui.back}
          </Link>

          <div className="mt-9 grid gap-[clamp(32px,4vw,72px)] lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,.92fr)] lg:items-end">
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
                className="mt-5 max-w-4xl text-[44px] leading-[1.02] tracking-[-0.03em] text-slate-950 sm:text-[52px] lg:text-[58px]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {project.headline}
              </h1>
            </div>

            <div className="border-l border-slate-300 pl-6 lg:pl-9">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-500">{ui.context}</p>
              <p className="mt-4 text-[21px] leading-8 text-slate-800" style={{ fontFamily: 'var(--font-playfair)' }}>
                {hook}
              </p>
            </div>
          </div>
        </div>
      </section>

      {commercial && goldStandard ? (
        <BusinessScenarioStrip
          label={ui.scenario}
          headline={commercial.scenarioHeadline}
          summary={commercial.scenarioSummary}
          note={ui.scenarioNote}
          lang={lang}
        />
      ) : null}

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1800px] sm:w-[calc(100%_-_48px)] py-10 lg:py-12">
          <div className="border-b border-slate-400 pb-4">
            <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-indigo-700">{ui.snapshot}</p>
            
          </div>

          <div className="grid border-b border-slate-400 lg:grid-cols-3 lg:divide-x lg:divide-slate-300">
            {[
              [ui.problem, problem],
              [ui.changed, changed],
              [ui.utility, utility],
            ].map(([label, body]) => (
              <div key={label} className="border-b border-slate-300 py-6 last:border-b-0 lg:border-b-0 lg:px-7 lg:first:pl-0 lg:last:pr-0">
                <p className="text-[13px] font-semibold uppercase tracking-[0.13em] text-slate-500">{label}</p>
                <p className="mt-3 text-[16px] leading-7 text-slate-800">{body}</p>
              </div>
            ))}
          </div>

          {goldStandard ? (
            <div className="grid border-b border-slate-300 sm:grid-cols-2 lg:grid-cols-4">
              {goldStandard.heroFacts.map((fact) => (
                <div key={fact.label} className="border-b border-slate-200 py-4 sm:px-5 sm:first:pl-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
                  <p className="text-[13px] text-slate-500">{fact.label}</p>
                  <p className="mt-1.5 text-[15px] font-semibold leading-6 text-slate-950">{fact.value}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">
            <Link
              href={`/projects/${project.slug}/case-study`}
              className="inline-flex min-h-[50px] items-center gap-2 bg-slate-950 px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-slate-800"
            >
              {ui.caseStudy}
              <ArrowRight className="h-4 w-4" />
            </Link>

            {proofUrl ? (
              <a
                href={proofUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[50px] items-center gap-2 border border-slate-500 bg-white px-5 py-3 text-[14px] font-semibold text-slate-900 transition hover:border-slate-800"
              >
                {ui.repository}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ) : null}

            <Link
              href="/contact"
              className="inline-flex min-h-[50px] items-center gap-2 border border-transparent px-4 py-3 text-[14px] font-semibold text-slate-700 underline decoration-slate-400 underline-offset-4 transition hover:border-slate-300 hover:bg-[#FAFAF7] hover:text-slate-950 hover:decoration-slate-950"
            >
              {ui.contact}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#F4F1EA]">
        <div className="mx-auto grid max-w-[1800px] gap-5 py-6 lg:grid-cols-[180px_1fr_auto] lg:items-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{ui.evidence}</p>
          <p className="max-w-3xl text-[13px] leading-6 text-slate-600">{goldStandard?.sourceNote || raw.confidentiality}</p>
          {proofUrl ? (
            <a href={proofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[14px] font-semibold text-slate-900 underline decoration-slate-400 underline-offset-4">
              {ui.repository}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </section>
    </main>
  )
}
