'use client'

import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import CaseStudySidebar from '@/components/projects/CaseStudySidebar'
import { ArchitectureSystemVisual, EvidenceFrameworkVisual, HorizonDecisionVisual } from '@/components/projects/WebProjectVisuals'
import { sc12BusinessOutcomeMetrics, sc12CaseStudyCopy } from '@/lib/project-commercial-copy'
import type { WebsiteProjectGoldStandard } from '@/lib/website-project-gold-standard'

function Section({
  id,
  label,
  title,
  body,
  children,
}: {
  id: string
  label: string
  title: string
  body?: string
  tone?: 'white' | 'paper' | 'dark'
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t-[3px] border-[#1D2B44] bg-transparent">
      <div className="px-6 py-12 lg:px-10 lg:py-14">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-indigo-700">
          {label}
        </p>
        <h2
          className="mt-3 max-w-4xl text-[34px] leading-[1.06] tracking-[-0.02em] text-slate-950 sm:text-[40px]"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {title}
        </h2>
        {body ? <p className="mt-4 max-w-3xl text-[16px] leading-8 text-slate-600">{body}</p> : null}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}

export default function WebsiteProjectGoldStandardCommercial({ project }: { project: WebsiteProjectGoldStandard }) {
  const { lang } = useSiteLanguage()
  const c = sc12CaseStudyCopy[lang]

  const items = [
    { id: 'problem', label: c.problemLabel.replace(/^\d+\s*·\s*/, '') },
    { id: 'horizon', label: c.horizonLabel.replace(/^\d+\s*·\s*/, '') },
    { id: 'system', label: c.systemLabel.replace(/^\d+\s*·\s*/, '') },
    { id: 'architecture', label: c.architectureLabel.replace(/^\d+\s*·\s*/, '') },
    { id: 'evidence', label: c.evidenceLabel.replace(/^\d+\s*·\s*/, '') },
    { id: 'technical', label: c.technicalLabel.replace(/^\d+\s*·\s*/, '') },
  ]

  return (
    <main className="bg-[#FAFAF7] text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="mx-auto max-w-[1500px] px-6 pb-12 pt-9 lg:px-8 lg:pb-14">
          <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-2 text-[14px] text-[#A8BACB] transition hover:text-white">
            <span aria-hidden="true">←</span>
            {c.back}
          </Link>

          <div className="mt-9 grid gap-10 lg:grid-cols-[1.05fr_.95fr]">
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

            <aside className="border-y border-[#5E86A8] py-5">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{c.scenarioLabel}</p>
              <p className="mt-3 text-[25px] leading-8 text-white" style={{ fontFamily: 'var(--font-playfair)' }}>{c.scenarioHeadline}</p>

              <div className="mt-6 grid grid-cols-3 divide-x divide-[#5E86A8] border-y border-[#5E86A8]">
                {sc12BusinessOutcomeMetrics[lang].map((metric) => (
                  <div key={metric.label} className="px-4 py-4 first:pl-0 last:pr-0">
                    <p className="text-[27px] font-semibold leading-none text-white">{metric.value}</p>
                    <p className="mt-2 text-[12px] uppercase tracking-[0.08em] text-[#A8BACB]">{metric.label}</p>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-[12px] leading-5 text-[#7F9BB5]">{project.businessOutcome.disclaimer}</p>

              <div className="mt-6 flex flex-wrap gap-4">
                <a href={project.proofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[14px] font-semibold text-white underline decoration-[#5E86A8] underline-offset-4">
                  {c.repository}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <Link href={project.cta.primaryHref} className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#A8BACB] underline decoration-[#496C8A] underline-offset-4 hover:text-white">
                  {c.contact}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="border-b border-slate-300 bg-[#FAFAF7]">
        <div className="mx-auto max-w-[1500px] lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
          <CaseStudySidebar items={items} repositoryUrl={project.proofUrl} contactHref={project.cta.primaryHref} />

          <div className="min-w-0">
          <Section id="problem" label={c.problemLabel} title={c.problemTitle} body={c.problemBody} tone="paper">
            <div className="border-t border-slate-500">
              {c.problemRows.map((row, index) => (
                <div key={row.title} className="grid gap-3 border-b border-slate-300 py-5 md:grid-cols-[52px_.7fr_1.3fr]">
                  <span className="font-mono text-[13px] text-slate-500">{String(index + 1).padStart(2, '0')}</span>
                  <p className="text-[16px] font-semibold text-slate-950">{row.title}</p>
                  <p className="text-[15px] leading-7 text-slate-600">{row.body}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="horizon" label={c.horizonLabel} title={c.horizonTitle} body={c.horizonBody}>
            <HorizonDecisionVisual data={project.horizonLogic} />
          </Section>

          <Section id="system" label={c.systemLabel} title={c.systemTitle} body={c.systemBody} tone="paper">
            <div className="grid border-t border-slate-500 md:grid-cols-2">
              {c.systemRows.map((row, index) => (
                <div key={row} className={`grid grid-cols-[46px_1fr] gap-4 border-b border-slate-300 py-5 md:pr-7 ${index % 2 === 1 ? 'md:border-l md:pl-7' : ''}`}>
                  <span className="font-mono text-[13px] text-slate-500">{String(index + 1).padStart(2, '0')}</span>
                  <p className="text-[15px] leading-7 text-slate-700">{row}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="architecture" label={c.architectureLabel} title={c.architectureTitle} body={c.architectureBody} tone="dark">
            <ArchitectureSystemVisual data={project.architecture} />
          </Section>

          <Section id="evidence" label={c.evidenceLabel} title={c.evidenceTitle} body={c.evidenceBody} tone="paper">
            <EvidenceFrameworkVisual data={project.evidence} />
            <div className="mt-6 grid gap-4 border-y border-slate-400 py-5 sm:grid-cols-3">
              {sc12BusinessOutcomeMetrics[lang].map((metric) => (
                <div key={metric.label}>
                  <p className="text-[26px] font-semibold text-slate-950">{metric.value}</p>
                  <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-500">{metric.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[12px] leading-6 text-slate-500">{project.businessOutcome.disclaimer}</p>
          </Section>

          <Section id="technical" label={c.technicalLabel} title={c.technicalTitle} body={c.technicalBody}>
            <div className="border-y border-slate-400 py-5">
              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-500">Stack</p>
              <p className="mt-3 text-[15px] leading-7 text-slate-800">{c.technicalProof}</p>
            </div>

            <div className="mt-6">
              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-500">{c.limitationsLabel}</p>
              <div className="mt-3 border-t border-slate-300">
                {c.limitations.map((item, index) => (
                  <div key={item} className="grid grid-cols-[44px_1fr] gap-3 border-b border-slate-300 py-4">
                    <span className="font-mono text-[12px] text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                    <p className="text-[14px] leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-4">
              <a href={project.proofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-slate-400 bg-white px-5 py-3 text-[14px] font-semibold text-slate-900">
                {c.repository}
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <Link href={project.cta.primaryHref} className="inline-flex items-center gap-2 bg-slate-950 px-5 py-3 text-[14px] font-semibold text-white">
                {c.contact}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Section>

          <section className="px-6 py-12 lg:px-10 lg:py-14">
            <div className="border border-[#496C8A] bg-[#0D1B2A] px-6 py-7 text-white lg:px-8 lg:py-8">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{c.takeawayLabel}</p>
              <h2 className="mt-3 max-w-4xl text-[34px] leading-[1.06] text-white sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>
                {c.takeawayTitle}
              </h2>
              <p className="mt-5 max-w-3xl text-[16px] leading-8 text-[#EAF0F6]">{c.takeawayBody}</p>
            </div>
          </section>
          </div>
        </div>
      </div>
    </main>
  )
}
