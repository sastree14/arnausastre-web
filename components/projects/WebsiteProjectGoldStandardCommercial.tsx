'use client'

import ForecastExample from '@/components/projects/ForecastExample'
import {portfolioEvidence} from '@/lib/portfolio-evidence'
import Link from '@/components/SiteLink'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import CaseStudySidebar from '@/components/projects/CaseStudySidebar'
import { ArchitectureSystemVisual, EvidenceFrameworkVisual, HorizonDecisionVisual } from '@/components/projects/WebProjectVisuals'
import { getPortfolioCasePresentation } from '@/lib/portfolio-case-registry'
import type { WebsiteProjectGoldStandard } from '@/lib/website-project-gold-standard'

function Section({
  id,
  label,
  title,
  body,
  headerAction,
  children,
}: {
  id: string
  label: string
  title: string
  body?: string
  headerAction?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 py-5 lg:py-6">
      <div className="border border-slate-300 bg-white">
        <div className="grid border-b border-slate-300 lg:grid-cols-[clamp(165px,13vw,210px)_minmax(0,1fr)]">
          <div className="bg-[#F4F1EA] px-5 py-6 lg:px-6 lg:py-7">
            <p className="text-[13px] font-semibold uppercase leading-5 tracking-[0.14em] text-indigo-700">{label}</p>
          </div>

          <div className="px-6 py-6 lg:px-[clamp(28px,3vw,52px)] lg:py-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <h2
                  className="max-w-5xl text-[34px] leading-[1.06] tracking-[-0.02em] text-slate-950 sm:text-[40px]"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {title}
                </h2>
                {body ? <p className="mt-4 max-w-[68ch] text-[18px] leading-8 text-slate-700">{body}</p> : null}
              </div>
              {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
            </div>
          </div>
        </div>

        <div className="px-6 py-7 lg:px-[clamp(28px,3vw,52px)] lg:py-8">{children}</div>
      </div>
    </section>
  )
}

export default function WebsiteProjectGoldStandardCommercial({ project }: { project: WebsiteProjectGoldStandard }) {
  const { lang } = useSiteLanguage()
  const presentation = getPortfolioCasePresentation(project.projectId, lang)
  if (!presentation) return null

  const c = presentation.case
  const problemPalette = [
    { bg: '#F7F1E8', border: '#DDCFBD' },
    { bg: '#F2ECF7', border: '#D7C8E3' },
    { bg: '#EAF3F8', border: '#C8DCE8' },
  ]
  const systemPalette = [
    { bg: '#F7F1E8', border: '#DDCFBD' },
    { bg: '#F2ECF7', border: '#D7C8E3' },
    { bg: '#EAF3F8', border: '#C8DCE8' },
    { bg: '#EDF4EE', border: '#C9D9CD' },
  ]
  const toolPalette = [
    { bg: '#F3EDF8', border: '#D3C4E0' },
    { bg: '#E8F1F7', border: '#BDD3E2' },
  ]

  const toolsLabel = {
    en: 'Tools used',
    es: 'Herramientas utilizadas',
    ca: 'Eines utilitzades',
  }[lang]

  const items = [
    { id: 'problem', label: c.problemLabel.replace(/^\d+\s*·\s*/, '') },
    { id: 'horizon', label: c.logicLabel.replace(/^\d+\s*·\s*/, '') },
    { id: 'system', label: c.systemLabel.replace(/^\d+\s*·\s*/, '') },
    { id: 'architecture', label: c.architectureLabel.replace(/^\d+\s*·\s*/, '') },
    { id: 'evidence', label: c.evidenceLabel.replace(/^\d+\s*·\s*/, '') },
    { id: 'technical', label: c.technicalLabel.replace(/^\d+\s*·\s*/, '') },
  ]

  const evidenceData: WebsiteProjectGoldStandard['evidence'] = {
    eyebrow: c.evidenceGroupLabels[0],
    title: c.evidenceGroupLabels[1],
    body: c.evidenceBody,
    metrics: c.evidence,
    note: presentation.proofStatement,
  }

  return (
    <main className="bg-[#FAFAF7] text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="mx-auto w-[calc(100%_-_32px)] max-w-7xl sm:w-[calc(100%_-_48px)] pb-12 pt-9 lg:pb-14">
          <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-2 text-[14px] text-[#A8BACB] transition hover:text-white">
            <span aria-hidden="true">←</span>
            {c.back}
          </Link>

          <div className="mt-9 grid gap-[clamp(36px,4vw,72px)] lg:grid-cols-[minmax(0,1.08fr)_minmax(440px,.92fr)]">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{c.eyebrow}</p>
              <h1
                className="mt-5 max-w-4xl text-[44px] leading-[1.02] tracking-[-0.03em] text-white sm:text-[54px] lg:text-[62px]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {c.title}
              </h1>
              <p className="mt-6 max-w-3xl text-[17px] leading-8 text-[#EAF0F6]">{c.intro}</p>

              <div className="mt-7 border-t border-[#496C8A] pt-5">
                <p className="text-[13px] font-semibold uppercase tracking-[0.13em] text-[#A8BACB]">{c.thesisLabel}</p>
                <p className="mt-3 max-w-3xl text-[16px] leading-7 text-white">{c.thesis}</p>
              </div>
            </div>

            <aside className="border border-[#496C8A] bg-[#102033] p-6 lg:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{c.referenceEconomics}</p>
                <span className="border border-[#496C8A] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#B9C9D8]">
                  {project.projectId}
                </span>
              </div>

              <p
                className="mt-4 max-w-2xl text-[27px] leading-[1.14] text-white sm:text-[31px]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {presentation.scenarioHeadline}
              </p><p className="mt-4 text-sm leading-6 text-[#C2D2E0]">{presentation.scenarioSummary} {lang === 'en' ? 'Capital released is not profit or a guaranteed saving.' : lang === 'ca' ? 'El capital alliberat no és benefici ni estalvi garantit.' : 'El capital liberado no es beneficio ni ahorro garantizado.'}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {presentation.businessMetrics.map((metric) => (
                  <div key={metric.label} className="border border-[#5E86A8] bg-[#0D1B2A] px-4 py-4">
                    <p className="text-[30px] font-semibold leading-none tracking-[-0.02em] text-white">{metric.value}</p>
                    <p className="mt-3 text-[11px] font-semibold uppercase leading-5 tracking-[0.08em] text-[#DCE6EF]">{metric.label}</p>{metric.note && <p className="mt-2 text-xs leading-5 text-[#C2D2E0]">{metric.note}</p>}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={project.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[48px] items-center gap-2 border border-[#A8BACB] bg-transparent px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-white/5"
                >
                  {c.repository}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <Link
                  href={project.cta.primaryHref}
                  className="inline-flex min-h-[48px] items-center gap-2 bg-white px-4 py-3 text-[14px] font-semibold text-[#0D1B2A] transition hover:bg-[#EAF0F6]"
                >
                  {c.contact}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="border-b border-slate-300 bg-[#FAFAF7]">
        <div className="mx-auto w-[calc(100%_-_32px)] max-w-7xl sm:w-[calc(100%_-_48px)] lg:grid lg:grid-cols-[clamp(230px,16vw,310px)_minmax(0,1fr)] lg:gap-[clamp(24px,2.6vw,48px)]">
          <CaseStudySidebar items={items} repositoryUrl={project.proofUrl} contactHref={project.cta.primaryHref} />

          <div className="min-w-0">
            <Section id="problem" label={c.problemLabel} title={c.problemTitle} body={c.problemBody}>
              <div className="grid gap-3 md:grid-cols-3">
                {c.problemRows.map((row, index) => {
                  const palette = problemPalette[index % problemPalette.length]
                  return (
                    <div
                      key={row.title}
                      className="flex min-h-[190px] flex-col border p-6"
                      style={{ backgroundColor: palette.bg, borderColor: palette.border }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-mono text-[14px] font-semibold text-indigo-700">{String(index + 1).padStart(2, '0')}</span>
                        <span className="h-px flex-1" style={{ backgroundColor: palette.border }} />
                      </div>
                      <p className="mt-6 text-[22px] font-semibold leading-[1.15] text-[#1D2B44]">{row.title}</p>
                      <p className="mt-4 text-[16px] leading-7 text-slate-700">{row.body}</p>
                    </div>
                  )
                })}
              </div>
            </Section>

            <Section id="horizon" label={c.logicLabel} title={c.logicTitle} body={c.logicBody}>
              <HorizonDecisionVisual data={c.logicVisual} lang={lang} />
            </Section>

            <Section id="system" label={c.systemLabel} title={c.systemTitle} body={c.systemBody}>
              <div className="grid gap-3 md:grid-cols-2">
                {c.systemRows.map((row, index) => {
                  const palette = systemPalette[index % systemPalette.length]
                  return (
                    <div
                      key={row}
                      className="grid min-h-[132px] grid-cols-[48px_1fr] gap-4 border p-5 sm:p-6"
                      style={{ backgroundColor: palette.bg, borderColor: palette.border }}
                    >
                      <span className="font-mono text-[14px] font-semibold text-indigo-700">{String(index + 1).padStart(2, '0')}</span>
                      <p className="text-[18px] font-medium leading-8 text-slate-900">{row}</p>
                    </div>
                  )
                })}
              </div>
            </Section>

            <Section id="architecture" label={c.architectureLabel} title={c.architectureTitle} body={c.architectureBody}>
              <ArchitectureSystemVisual data={c.architecture} lang={lang} />
            </Section>

            <Section id="evidence" label={c.evidenceLabel} title={c.evidenceTitle} body={c.evidenceBody}>
              <EvidenceFrameworkVisual data={evidenceData} lang={lang} groupLabels={c.evidenceGroupLabels} />{portfolioEvidence[project.projectId] && <a className="mt-5 inline-block text-sm font-semibold underline underline-offset-4" href={portfolioEvidence[project.projectId].source} target="_blank" rel="noreferrer">{lang === 'en' ? 'Inspect the committed example output' : lang === 'ca' ? 'Consultar la sortida d’exemple versionada' : 'Consultar la salida de ejemplo versionada'} ↗</a>}{project.projectId === 'SC-12' && <ForecastExample/>}

              <div className="mt-5 overflow-hidden border border-[#DCCFBC] bg-[#F7F1E8]">
                <div className="border-b border-[#DCCFBC] bg-[#EEE4D6] px-6 py-4">
                  <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#66533C]">{c.referenceEconomics}</p>
                </div>
                <div className="grid divide-y divide-[#DCCFBC] bg-[#FCF9F4] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  {presentation.businessMetrics.map((metric) => (
                    <div key={metric.label} className="flex min-h-[128px] flex-col justify-center px-5 py-5">
                      <p className="text-[31px] font-semibold leading-none tracking-[-0.02em] text-[#1D2B44]">{metric.value}</p>
                      <p className="mt-3 text-[13px] font-semibold uppercase leading-5 tracking-[0.1em] text-slate-600">{metric.label}</p>{metric.note && <p className="mt-2 text-xs leading-5 text-[#C2D2E0]">{metric.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <Section
              id="technical"
              label={c.technicalLabel}
              title={c.technicalTitle}
              headerAction={
                <a
                  href={project.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[50px] items-center gap-2 bg-slate-950 px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-slate-800"
                >
                  {c.repository}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              }
            >
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{toolsLabel}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {c.technicalProof.split(' · ').map((technology, index) => {
                    const diagonalGroup = [0, 2, 4].includes(index) ? 0 : 1
                    const palette = toolPalette[diagonalGroup]
                    return (
                      <div
                        key={technology}
                        className="flex min-h-[96px] items-center justify-between border px-6 py-5"
                        style={{ backgroundColor: palette.bg, borderColor: palette.border }}
                      >
                        <span className="text-[19px] font-semibold text-[#1D2B44]">{technology}</span>
                        <span className="font-mono text-[12px] font-semibold text-indigo-700">{String(index + 1).padStart(2, '0')}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Section>

            <section className="py-5 lg:py-6">
              <div className="border border-[#496C8A] bg-[#0D1B2A] px-6 py-8 text-white lg:px-9 lg:py-10">
                <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <div>
                    <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{c.takeawayLabel}</p>
                    <h2 className="mt-3 max-w-4xl text-[34px] leading-[1.06] text-white sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>
                      {c.takeawayTitle}
                    </h2>
                    <p className="mt-5 max-w-3xl text-[17px] leading-8 text-[#EAF0F6]">{c.takeawayBody}</p>
                  </div>

                  <Link
                    href={project.cta.primaryHref}
                    className="inline-flex min-h-[54px] items-center justify-center gap-3 bg-white px-6 py-3.5 text-[15px] font-semibold text-[#0D1B2A] transition hover:bg-[#EAF0F6]"
                  >
                    {c.contact}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
