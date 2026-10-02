'use client'

import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import BusinessScenarioStrip from '@/components/projects/BusinessScenarioStrip'
import { projectOverviewUi } from '@/lib/project-commercial-copy'
import { getPortfolioCasePresentation } from '@/lib/portfolio-case-registry'
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
  const presentation = goldStandard ? getPortfolioCasePresentation(goldStandard.projectId, lang) : undefined
  const proofUrl = goldStandard?.proofUrl

  const genericProblem =
    raw.sections.find((section) => ['Problem', 'Context'].includes(section.title))?.body ||
    project.description
  const genericChanged =
    raw.sections.find((section) => ['System Developed', 'Approach', 'Solution'].includes(section.title))?.body ||
    project.capability
  const genericUtility = project.description

  const hook = presentation?.hook || project.description
  const problem = presentation?.overviewProblem || genericProblem
  const changed = presentation?.overviewChanged || genericChanged
  const utility = presentation?.overviewUtility || genericUtility
  const heroFacts = presentation?.heroFacts || goldStandard?.heroFacts || []

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

      {presentation && goldStandard ? (
        <BusinessScenarioStrip
          label={presentation.case.referenceEconomics}
          headline={presentation.scenarioHeadline}
          summary={presentation.scenarioSummary}
          metrics={presentation.businessMetrics}
        />
      ) : null}

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1800px] sm:w-[calc(100%_-_48px)] pb-7 pt-10 lg:pb-8 lg:pt-12">
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

          {heroFacts.length ? (
            <div className="grid border-b border-slate-300 sm:grid-cols-2 lg:grid-cols-4">
              {heroFacts.map((fact) => (
                <div key={fact.label} className="border-b border-slate-200 py-4 sm:px-5 sm:first:pl-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
                  <p className="text-[13px] text-slate-500">{fact.label}</p>
                  <p className="mt-1.5 text-[15px] font-semibold leading-6 text-slate-950">{fact.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {goldStandard ? (
        <section className="border-y border-slate-300 bg-[#F4F1EA]">
          <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1800px] py-7 sm:w-[calc(100%_-_48px)] lg:py-9">
            <p className="text-center text-[14px] font-semibold uppercase tracking-[0.17em] text-indigo-700">{ui.evidence}</p>

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              <Link
                href={`/projects/${project.slug}/case-study`}
                className="group flex min-h-[166px] flex-col justify-between border border-[#D6C6E3] bg-[#F1EAF6] p-6 transition hover:border-[#B9A3CC] hover:bg-[#E9DFF1]"
              >
                <div className="flex items-start gap-4">
                  <p className="pt-1 font-mono text-[13px] font-semibold text-indigo-700">01</p>
                  <p className="max-w-[20ch] text-[24px] leading-[1.08] text-[#1D2B44]" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {lang === 'es' ? '¿Quieres saber más de este caso de éxito?' : lang === 'ca' ? 'Vols saber més d’aquest cas d’èxit?' : 'Want to know more about this success story?'}
                  </p>
                  <ArrowRight className="ml-auto mt-1 h-5 w-5 shrink-0 text-indigo-700 transition group-hover:translate-x-1" />
                </div>
                <p className="mt-6 text-[16px] font-semibold text-[#1D2B44]">{ui.caseStudy}</p>
              </Link>

              {proofUrl ? (
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-h-[166px] flex-col justify-between border border-[#BCD5E5] bg-[#E4F0F7] p-6 transition hover:border-[#8FB6CD] hover:bg-[#D9EAF4]"
                >
                  <div className="flex items-start gap-4">
                    <p className="pt-1 font-mono text-[13px] font-semibold text-indigo-700">02</p>
                    <p className="max-w-[20ch] text-[24px] leading-[1.08] text-[#1D2B44]" style={{ fontFamily: 'var(--font-playfair)' }}>
                      {lang === 'es' ? '¿Quieres ver el desarrollo técnico?' : lang === 'ca' ? 'Vols veure el desenvolupament tècnic?' : 'Want to inspect the technical build?'}
                    </p>
                    <ArrowUpRight className="ml-auto mt-1 h-5 w-5 shrink-0 text-indigo-700 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-6 text-[16px] font-semibold text-[#1D2B44]">{ui.repository}</p>
                </a>
              ) : null}

              <Link
                href="/contact"
                className="group flex min-h-[166px] flex-col justify-between border border-[#0D1B2A] bg-[#0D1B2A] p-6 text-white transition hover:bg-[#13283C]"
              >
                <div className="flex items-start gap-4">
                  <p className="pt-1 font-mono text-[13px] font-semibold text-[#7A7DFF]">03</p>
                  <p className="max-w-[20ch] text-[24px] leading-[1.08] text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {lang === 'es' ? '¿Quieres hablarnos de un problema similar?' : lang === 'ca' ? 'Vols parlar-nos d’un problema similar?' : 'Want to discuss a similar problem?'}
                  </p>
                  <ArrowRight className="ml-auto mt-1 h-5 w-5 shrink-0 text-white transition group-hover:translate-x-1" />
                </div>
                <p className="mt-6 text-[16px] font-semibold text-white">{ui.contact}</p>
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}
