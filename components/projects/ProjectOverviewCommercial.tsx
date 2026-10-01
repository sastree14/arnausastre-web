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
  const heroFacts =
    isSc12 && goldStandard
      ? {
          en: [
            { label: 'Planning horizons', value: '1 · 3 · 6 · 9 months' },
            { label: 'Decision', value: 'Purchasing · Inventory' },
            { label: 'Trade-off', value: 'Service · Stock · Cash' },
            { label: 'Measured through', value: 'WAPE · Bias · Coverage' },
          ],
          es: [
            { label: 'Horizontes de planificación', value: '1 · 3 · 6 · 9 meses' },
            { label: 'Decisión', value: 'Compras · Inventario' },
            { label: 'Equilibrio', value: 'Servicio · Stock · Caja' },
            { label: 'Medido mediante', value: 'WAPE · Sesgo · Cobertura' },
          ],
          ca: [
            { label: 'Horitzons de planificació', value: '1 · 3 · 6 · 9 mesos' },
            { label: 'Decisió', value: 'Compres · Inventari' },
            { label: 'Equilibri', value: 'Servei · Estoc · Caixa' },
            { label: 'Mesurat mitjançant', value: 'WAPE · Biaix · Cobertura' },
          ],
        }[lang]
      : goldStandard?.heroFacts || []

  const sourceNote =
    isSc12
      ? {
          en: 'SC-12 is a public portfolio implementation. It is presented as capability and implementation proof, not as a named client case or a claim of measured organisation-wide impact.',
          es: 'SC-12 es una implementación pública de portfolio. Se presenta como evidencia de capacidad e implementación, no como un caso de cliente identificado ni como una afirmación de impacto medido a escala de toda una organización.',
          ca: 'SC-12 és una implementació pública de portfolio. Es presenta com a evidència de capacitat i implementació, no com un cas de client identificat ni com una afirmació d’impacte mesurat a escala de tota una organització.',
        }[lang]
      : raw.confidentiality

  const evidenceHeadline =
    isSc12
      ? {
          en: 'Explore this case in our technical portfolio.',
          es: 'Explora este caso en nuestro portfolio técnico.',
          ca: 'Explora aquest cas al nostre portfolio tècnic.',
        }[lang]
      : ui.evidence

  const evidenceSummary = isSc12 ? null : sourceNote

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
          lang={lang}
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

          {goldStandard ? (
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

      <section className="border-y border-slate-300 bg-[#F4F1EA]">
        <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1800px] py-7 sm:w-[calc(100%_-_48px)] lg:py-9">
          {isSc12 ? (
            <div>
              <p className="text-center text-[14px] font-semibold uppercase tracking-[0.17em] text-indigo-700">{ui.evidence}</p>

              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                <Link
                  href={`/projects/${project.slug}/case-study`}
                  className="group flex min-h-[166px] flex-col justify-between border border-[#D6C6E3] bg-[#F1EAF6] p-6 transition hover:border-[#B9A3CC] hover:bg-[#E9DFF1]"
                >
                  <div className="flex items-start gap-4">
                    <p className="pt-1 font-mono text-[13px] font-semibold text-indigo-700">01</p>
                    <p className="max-w-[20ch] text-[24px] leading-[1.08] text-[#1D2B44]" style={{ fontFamily: 'var(--font-playfair)' }}>
                      {lang === 'es' ? '¿Quieres saber más de este caso?' : lang === 'ca' ? 'Vols saber més d’aquest cas?' : 'Want to know more about this case?'}
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
          ) : (
            <div className="grid gap-4 lg:grid-cols-[190px_minmax(0,1fr)_auto] lg:items-center">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{ui.evidence}</p>

              <div className="flex min-h-[76px] items-center border border-slate-300 bg-white px-6 py-4">
                <p
                  className="text-[24px] leading-[1.08] tracking-[-0.015em] text-[#1D2B44] sm:text-[27px]"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {evidenceHeadline}
                </p>
                {evidenceSummary ? (
                  <p className="ml-6 max-w-2xl text-[14px] leading-6 text-slate-700">{evidenceSummary}</p>
                ) : null}
              </div>

              {proofUrl ? (
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[50px] items-center justify-center gap-2 border border-slate-900 bg-slate-950 px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-slate-800"
                >
                  {ui.repository}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
