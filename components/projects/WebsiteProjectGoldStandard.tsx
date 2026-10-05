import Link from '@/components/SiteLink'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { WebsiteProjectGoldStandard } from '@/lib/website-project-gold-standard'
import { ArchitectureSystemVisual, EvidenceFrameworkVisual, HorizonDecisionVisual } from '@/components/projects/WebProjectVisuals'
import ProjectCaseStudyNavigator from '@/components/projects/ProjectCaseStudyNavigator'

const sectionLinks = [
  { id: 'problem', label: 'Business problem' },
  { id: 'horizon', label: 'Why horizon matters' },
  { id: 'system', label: 'What was built' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'decisions', label: 'Decision logic' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'technical', label: 'Technical overview' },
  { id: 'limitations', label: 'Limitations' },
]

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`text-[13px] font-semibold uppercase tracking-[0.16em] ${dark ? 'text-[#7A7DFF]' : 'text-indigo-700'}`}>
      {children}
    </p>
  )
}

function CaseSection({
  id,
  eyebrow,
  title,
  body,
  tone = 'white',
  children,
}: {
  id: string
  eyebrow: string
  title: string
  body?: string
  tone?: 'white' | 'paper' | 'dark'
  children: React.ReactNode
}) {
  const dark = tone === 'dark'
  const bg = dark ? 'bg-[#0D1B2A]' : tone === 'paper' ? 'bg-[#F4F1EA]' : 'bg-white'

  return (
    <section id={id} className={`scroll-mt-32 border-b ${dark ? 'border-[#496C8A]' : 'border-slate-300'} ${bg}`}>
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-5 lg:grid-cols-[190px_1fr] lg:gap-10">
          <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
          <div>
            <h2
              className={`max-w-4xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-[46px] ${dark ? 'text-white' : 'text-slate-950'}`}
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {title}
            </h2>
            {body ? (
              <p className={`mt-5 max-w-3xl text-[16px] leading-8 ${dark ? 'text-[#EAF0F6]' : 'text-slate-600'}`}>{body}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-10">{children}</div>
      </div>
    </section>
  )
}

export default function WebsiteProjectGoldStandard({ project }: { project: WebsiteProjectGoldStandard }) {
  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-10 lg:px-8 lg:pb-16 lg:pt-12">
          <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-2 text-[14px] text-[#A8BACB] transition hover:text-white">
            <span aria-hidden="true">←</span>
            Project overview
          </Link>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_.8fr] lg:items-start">
            <div>
              <Eyebrow dark>{project.eyebrow}</Eyebrow>
              <h1
                className="mt-5 max-w-4xl text-5xl leading-[1.01] tracking-[-0.035em] text-white sm:text-6xl lg:text-[68px]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {project.title}
              </h1>
              <p className="mt-6 max-w-3xl text-[17px] leading-8 text-[#EAF0F6]">{project.description}</p>

              <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#496C8A] pt-5 text-[13px] uppercase tracking-[0.1em] text-[#A8BACB]">
                <span className="text-white">{project.industry}</span>
                {project.capabilities.map((capability) => (
                  <span key={capability} className="before:mr-4 before:text-[#496C8A] before:content-['/']">
                    {capability}
                  </span>
                ))}
              </div>
            </div>

            <aside className="border-t border-[#5E86A8]">
              <div className="grid grid-cols-[.85fr_1.15fr] gap-5 border-b border-[#496C8A] py-4">
                <p className="text-[13px] uppercase tracking-[0.12em] text-[#A8BACB]">Project ID</p>
                <p className="text-right font-mono text-[14px] font-semibold text-white">{project.projectId}</p>
              </div>
              {project.heroFacts.map((fact) => (
                <div key={fact.label} className="grid grid-cols-[.85fr_1.15fr] gap-5 border-b border-[#496C8A] py-4">
                  <p className="text-[13px] uppercase tracking-[0.1em] text-[#A8BACB]">{fact.label}</p>
                  <p className="text-right text-[14px] font-semibold leading-6 text-[#EAF0F6]">{fact.value}</p>
                </div>
              ))}
              <div className="border-b border-[#5E86A8] py-5">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">Core thesis</p>
                <p className="mt-3 text-[15px] leading-7 text-[#EAF0F6]">{project.thesis}</p>
              </div>
            </aside>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[14px]">
            <a
              href={project.proofUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-white underline decoration-[#5E86A8] underline-offset-4 hover:decoration-white"
            >
              Technical repository
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link
              href={project.cta.primaryHref}
              className="inline-flex items-center gap-2 font-semibold text-[#A8BACB] underline decoration-[#496C8A] underline-offset-4 hover:text-white hover:decoration-white"
            >
              Discuss a similar problem
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <ProjectCaseStudyNavigator
        items={sectionLinks}
        repositoryUrl={project.proofUrl}
        contactHref={project.cta.primaryHref}
      />

      <CaseSection
        id="problem"
        tone="paper"
        eyebrow={project.businessProblem.eyebrow}
        title={project.businessProblem.title}
      >
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div className="space-y-5 text-[16px] leading-8 text-slate-700">
            {project.businessProblem.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="border-t border-slate-500">
            {project.businessProblem.consequences.map((consequence, index) => (
              <div key={consequence.title} className="grid gap-3 border-b border-slate-300 py-5 md:grid-cols-[56px_.72fr_1.28fr]">
                <span className="font-mono text-[13px] text-slate-500">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="text-[16px] font-semibold leading-7 text-slate-950">{consequence.title}</h3>
                <p className="text-[15px] leading-7 text-slate-600">{consequence.body}</p>
              </div>
            ))}
          </div>
        </div>
      </CaseSection>

      <CaseSection
        id="horizon"
        eyebrow={project.horizonLogic.eyebrow}
        title={project.horizonLogic.title}
        body={project.horizonLogic.body}
      >
        <HorizonDecisionVisual data={project.horizonLogic} />
      </CaseSection>

      <CaseSection
        id="system"
        tone="paper"
        eyebrow={project.solution.eyebrow}
        title={project.solution.title}
        body={project.solution.body}
      >
        <div className="grid border-t border-slate-500 md:grid-cols-2">
          {project.solution.bullets.map((bullet, index) => (
            <div
              key={bullet}
              className={`grid grid-cols-[48px_1fr] gap-4 border-b border-slate-300 py-5 md:pr-8 ${index % 2 === 1 ? 'md:border-l md:pl-8' : ''}`}
            >
              <span className="font-mono text-[13px] text-slate-500">{String(index + 1).padStart(2, '0')}</span>
              <p className="text-[15px] leading-7 text-slate-700">{bullet}</p>
            </div>
          ))}
        </div>
      </CaseSection>

      <CaseSection
        id="architecture"
        tone="dark"
        eyebrow={project.architecture.eyebrow}
        title={project.architecture.title}
        body={project.architecture.body}
      >
        <ArchitectureSystemVisual data={project.architecture} />
      </CaseSection>

      <CaseSection
        id="decisions"
        eyebrow={project.decisions.eyebrow}
        title={project.decisions.title}
        body={project.decisions.body}
      >
        <div className="border-t border-slate-500">
          {project.decisions.items.map((decision, index) => (
            <div key={decision.title} className="grid gap-3 border-b border-slate-300 py-6 md:grid-cols-[56px_.68fr_1.32fr]">
              <span className="font-mono text-[13px] text-indigo-700">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="text-[19px] leading-7 text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>
                {decision.title}
              </h3>
              <p className="text-[15px] leading-7 text-slate-600">{decision.body}</p>
            </div>
          ))}
        </div>
      </CaseSection>

      <CaseSection
        id="evidence"
        tone="paper"
        eyebrow={project.evidence.eyebrow}
        title={project.evidence.title}
        body={project.evidence.body}
      >
        <EvidenceFrameworkVisual data={project.evidence} />
        <p className="mt-5 border-l-2 border-slate-500 pl-4 text-[14px] leading-7 text-slate-600">
          <span className="font-semibold text-slate-900">Evidence note — </span>
          {project.evidence.note}
        </p>
      </CaseSection>

      <CaseSection
        id="technical"
        eyebrow={project.technical.eyebrow}
        title={project.technical.title}
        body={project.technical.body}
      >
        <div className="border-t border-slate-500">
          <div className="grid gap-5 border-b border-slate-300 py-5 md:grid-cols-[.32fr_.68fr]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-500">Technology footprint</p>
            <p className="text-[15px] leading-7 text-slate-800">{project.technical.technologies.join(' · ')}</p>
          </div>
          {project.technical.highlights.map((highlight, index) => (
            <div key={highlight} className="grid gap-4 border-b border-slate-300 py-5 md:grid-cols-[56px_1fr]">
              <span className="font-mono text-[13px] text-slate-500">{String(index + 1).padStart(2, '0')}</span>
              <p className="text-[15px] leading-7 text-slate-700">{highlight}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 grid gap-5 border-y border-slate-400 bg-[#FAFAF7] px-5 py-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.13em] text-indigo-700">Technical proof</p>
            <p className="mt-2 text-[15px] leading-7 text-slate-700">
              Architecture, data notes, results guidance, limitations, example outputs and execution paths are documented in Portfolio_SC_Analytics.
            </p>
          </div>
          <a
            href={project.proofUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-slate-950 underline decoration-slate-400 underline-offset-4 hover:decoration-slate-950"
          >
            Open SC-12
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </CaseSection>

      <CaseSection
        id="limitations"
        tone="paper"
        eyebrow={project.limitations.eyebrow}
        title={project.limitations.title}
        body={project.limitations.body}
      >
        <div className="border-t border-slate-500">
          {project.limitations.items.map((item, index) => (
            <div key={item} className="grid grid-cols-[56px_1fr] gap-4 border-b border-slate-300 py-5">
              <span className="font-mono text-[13px] text-slate-500">{String(index + 1).padStart(2, '0')}</span>
              <p className="text-[15px] leading-7 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </CaseSection>

      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-5 lg:grid-cols-[190px_1fr] lg:gap-10">
            <Eyebrow dark>{project.takeaway.eyebrow}</Eyebrow>
            <div>
              <h2 className="max-w-4xl text-4xl leading-[1.05] tracking-[-0.025em] text-white sm:text-[48px]" style={{ fontFamily: 'var(--font-playfair)' }}>
                {project.takeaway.title}
              </h2>
              <p className="mt-6 max-w-3xl text-[16px] leading-8 text-[#EAF0F6]">{project.takeaway.body}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#FAFAF7]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-5 lg:grid-cols-[190px_1fr] lg:gap-10">
            <Eyebrow>{project.cta.eyebrow}</Eyebrow>
            <div>
              <h2 className="max-w-3xl text-4xl leading-[1.05] tracking-[-0.025em] text-slate-950 sm:text-[48px]" style={{ fontFamily: 'var(--font-playfair)' }}>
                {project.cta.title}
              </h2>
              <p className="mt-5 max-w-2xl text-[16px] leading-8 text-slate-600">{project.cta.body}</p>
              <div className="mt-7 flex flex-wrap gap-4">
                <Link
                  href={project.cta.primaryHref}
                  className="inline-flex items-center gap-2 bg-slate-950 px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-slate-800"
                >
                  {project.cta.primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={project.cta.secondaryHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-slate-400 bg-white px-5 py-3 text-[14px] font-semibold text-slate-800 transition hover:border-slate-700"
                >
                  {project.cta.secondaryLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
