import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { WebsiteProjectGoldStandard } from '@/lib/website-project-gold-standard'
import { ArchitectureSystemVisual, EvidenceFrameworkVisual, HorizonDecisionVisual } from '@/components/projects/WebProjectVisuals'

const sectionLinks = [
  ['problem', 'Business problem'],
  ['horizon', 'Why horizon matters'],
  ['system', 'What was built'],
  ['architecture', 'Architecture'],
  ['decisions', 'Decision logic'],
  ['evidence', 'Evidence'],
  ['technical', 'Technical overview'],
  ['limitations', 'Limitations'],
] as const

function SectionEyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`text-[13px] font-semibold uppercase tracking-[0.16em] ${dark ? 'text-[#7A7DFF]' : 'text-indigo-700'}`}>
      {children}
    </p>
  )
}

function SectionTitle({
  title,
  body,
  dark = false,
}: {
  title: string
  body?: string
  dark?: boolean
}) {
  return (
    <>
      <h2
        className={`mt-4 text-4xl leading-[1.06] tracking-[-0.025em] sm:text-[44px] ${dark ? 'text-white' : 'text-slate-950'}`}
        style={{ fontFamily: 'var(--font-playfair)' }}
      >
        {title}
      </h2>
      {body ? (
        <p className={`mt-5 text-[16px] leading-8 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{body}</p>
      ) : null}
    </>
  )
}

function EditorialSection({
  id,
  tone = 'white',
  eyebrow,
  title,
  body,
  children,
}: {
  id: string
  tone?: 'white' | 'paper' | 'dark'
  eyebrow: string
  title: string
  body?: string
  children: React.ReactNode
}) {
  const dark = tone === 'dark'
  const background = dark ? 'bg-[#0D1B2A]' : tone === 'paper' ? 'bg-[#F4F1EA]' : 'bg-white'

  return (
    <section id={id} className={`scroll-mt-32 border-b ${dark ? 'border-[#496C8A]' : 'border-slate-300'} ${background}`}>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[.36fr_.64fr] lg:gap-14 lg:px-8 lg:py-20">
        <div>
          <SectionEyebrow dark={dark}>{eyebrow}</SectionEyebrow>
          <SectionTitle title={title} body={body} dark={dark} />
        </div>
        <div className="lg:pt-[2px]">{children}</div>
      </div>
    </section>
  )
}

export default function WebsiteProjectGoldStandard({ project }: { project: WebsiteProjectGoldStandard }) {
  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-10 lg:px-8 lg:pb-18 lg:pt-14">
          <Link href="/projects" className="inline-flex items-center gap-2 text-[14px] text-[#A8BACB] transition hover:text-white">
            <span aria-hidden="true">←</span>
            Projects
          </Link>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1.18fr_.82fr] lg:items-start">
            <div>
              <SectionEyebrow dark>{project.eyebrow}</SectionEyebrow>
              <h1
                className="mt-6 max-w-4xl text-5xl leading-[1.01] tracking-[-0.035em] text-white sm:text-6xl lg:text-[70px]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {project.title}
              </h1>
              <p className="mt-7 max-w-3xl text-[18px] leading-8 text-[#EAF0F6]">{project.description}</p>

              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#496C8A] pt-5 text-[13px] uppercase tracking-[0.1em] text-[#A8BACB]">
                <span className="text-white">{project.industry}</span>
                {project.capabilities.map((capability) => (
                  <span key={capability} className="before:mr-4 before:text-[#496C8A] before:content-['/']">
                    {capability}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-5 text-[15px]">
                <a
                  href={project.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-white underline decoration-[#5E86A8] underline-offset-4 transition hover:decoration-white"
                >
                  {project.proofLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <Link
                  href={project.cta.primaryHref}
                  className="inline-flex items-center gap-2 font-semibold text-[#A8BACB] underline decoration-[#496C8A] underline-offset-4 transition hover:text-white hover:decoration-white"
                >
                  {project.cta.primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <aside className="border-y border-[#5E86A8]">
              <div className="grid grid-cols-[.9fr_1.1fr] gap-5 border-b border-[#496C8A] py-4">
                <p className="text-[13px] uppercase tracking-[0.12em] text-[#A8BACB]">Project ID</p>
                <p className="text-right font-mono text-[14px] font-semibold text-white">{project.projectId}</p>
              </div>
              <div className="grid grid-cols-[.9fr_1.1fr] gap-5 border-b border-[#496C8A] py-4">
                <p className="text-[13px] uppercase tracking-[0.12em] text-[#A8BACB]">Evidence</p>
                <p className="text-right text-[14px] font-semibold text-white">Public implementation</p>
              </div>
              {project.heroFacts.map((fact) => (
                <div key={fact.label} className="grid grid-cols-[.9fr_1.1fr] gap-5 border-b border-[#496C8A] py-4 last:border-b-0">
                  <p className="text-[13px] uppercase tracking-[0.1em] text-[#A8BACB]">{fact.label}</p>
                  <p className="text-right text-[14px] font-semibold leading-6 text-[#EAF0F6]">{fact.value}</p>
                </div>
              ))}
              <div className="border-t border-[#5E86A8] py-5">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">Core thesis</p>
                <p className="mt-3 text-[15px] leading-7 text-[#EAF0F6]">{project.thesis}</p>
              </div>
            </aside>
          </div>

          <p className="mt-10 max-w-4xl border-t border-[#496C8A] pt-5 text-[13px] leading-6 text-[#A8BACB]">{project.sourceNote}</p>
        </div>
      </section>

      <div className="sticky top-[64px] z-30 border-b border-slate-300 bg-[#FAFAF7]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3 lg:px-8">
          <nav className="flex min-w-0 flex-1 gap-5 overflow-x-auto whitespace-nowrap pb-1 text-[13px] text-slate-500 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sectionLinks.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="transition hover:text-slate-950">
                {label}
              </a>
            ))}
          </nav>
          <div className="hidden shrink-0 items-center gap-4 border-l border-slate-300 pl-4 sm:flex">
            <a
              href={project.proofUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950"
            >
              Repository
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <Link
              href={project.cta.primaryHref}
              className="inline-flex items-center gap-1.5 bg-slate-950 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-slate-800"
            >
              Contact
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <EditorialSection
        id="problem"
        tone="paper"
        eyebrow={project.businessProblem.eyebrow}
        title={project.businessProblem.title}
      >
        <div className="grid gap-8">
          <div className="grid gap-5 text-[16px] leading-8 text-slate-700 md:grid-cols-2">
            {project.businessProblem.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="border-t border-slate-400">
            {project.businessProblem.consequences.map((consequence, index) => (
              <div key={consequence.title} className="grid gap-3 border-b border-slate-300 py-5 md:grid-cols-[72px_.85fr_1.15fr] md:items-start">
                <span className="font-mono text-[13px] text-slate-500">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="text-[16px] font-semibold text-slate-950">{consequence.title}</h3>
                <p className="text-[15px] leading-7 text-slate-600">{consequence.body}</p>
              </div>
            ))}
          </div>
        </div>
      </EditorialSection>

      <EditorialSection
        id="horizon"
        eyebrow={project.horizonLogic.eyebrow}
        title={project.horizonLogic.title}
        body={project.horizonLogic.body}
      >
        <HorizonDecisionVisual data={project.horizonLogic} />
      </EditorialSection>

      <EditorialSection
        id="system"
        tone="paper"
        eyebrow={project.solution.eyebrow}
        title={project.solution.title}
        body={project.solution.body}
      >
        <div className="grid border-t border-slate-400 md:grid-cols-2">
          {project.solution.bullets.map((bullet, index) => (
            <div
              key={bullet}
              className={`grid grid-cols-[48px_1fr] gap-4 border-b border-slate-300 py-5 md:pr-7 ${index % 2 === 1 ? 'md:border-l md:pl-7' : ''}`}
            >
              <span className="font-mono text-[13px] text-slate-500">{String(index + 1).padStart(2, '0')}</span>
              <p className="text-[15px] leading-7 text-slate-700">{bullet}</p>
            </div>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection
        id="architecture"
        tone="dark"
        eyebrow={project.architecture.eyebrow}
        title={project.architecture.title}
        body={project.architecture.body}
      >
        <ArchitectureSystemVisual data={project.architecture} />
      </EditorialSection>

      <EditorialSection
        id="decisions"
        eyebrow={project.decisions.eyebrow}
        title={project.decisions.title}
        body={project.decisions.body}
      >
        <div className="border-t border-slate-400">
          {project.decisions.items.map((decision, index) => (
            <div key={decision.title} className="grid gap-3 border-b border-slate-300 py-6 md:grid-cols-[72px_.72fr_1.28fr]">
              <span className="font-mono text-[13px] text-indigo-700">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="text-[18px] leading-7 text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>
                {decision.title}
              </h3>
              <p className="text-[15px] leading-7 text-slate-600">{decision.body}</p>
            </div>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection
        id="evidence"
        tone="paper"
        eyebrow={project.evidence.eyebrow}
        title={project.evidence.title}
        body={project.evidence.body}
      >
        <EvidenceFrameworkVisual data={project.evidence} />
        <p className="mt-5 border-l-2 border-slate-400 pl-4 text-[14px] leading-7 text-slate-600">
          <span className="font-semibold text-slate-900">Evidence note — </span>
          {project.evidence.note}
        </p>
      </EditorialSection>

      <EditorialSection
        id="technical"
        eyebrow={project.technical.eyebrow}
        title={project.technical.title}
        body={project.technical.body}
      >
        <div className="border-t border-slate-400">
          <div className="grid gap-5 border-b border-slate-300 py-5 md:grid-cols-[.4fr_.6fr]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-500">Technology footprint</p>
            <p className="text-[15px] leading-7 text-slate-800">{project.technical.technologies.join(' · ')}</p>
          </div>
          {project.technical.highlights.map((highlight, index) => (
            <div key={highlight} className="grid gap-4 border-b border-slate-300 py-5 md:grid-cols-[72px_1fr]">
              <span className="font-mono text-[13px] text-slate-500">{String(index + 1).padStart(2, '0')}</span>
              <p className="text-[15px] leading-7 text-slate-700">{highlight}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 grid gap-5 border-y border-indigo-300 bg-[#F4F1EA] px-5 py-5 md:grid-cols-[1fr_auto] md:items-center">
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
      </EditorialSection>

      <EditorialSection
        id="limitations"
        tone="paper"
        eyebrow={project.limitations.eyebrow}
        title={project.limitations.title}
        body={project.limitations.body}
      >
        <div className="border-t border-slate-400">
          {project.limitations.items.map((item, index) => (
            <div key={item} className="grid grid-cols-[56px_1fr] gap-4 border-b border-slate-300 py-5">
              <span className="font-mono text-[13px] text-slate-500">{String(index + 1).padStart(2, '0')}</span>
              <p className="text-[15px] leading-7 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </EditorialSection>

      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[.36fr_.64fr] lg:gap-14 lg:px-8 lg:py-20">
          <div>
            <SectionEyebrow dark>{project.takeaway.eyebrow}</SectionEyebrow>
          </div>
          <div>
            <h2 className="text-4xl leading-[1.06] tracking-[-0.025em] text-white sm:text-[48px]" style={{ fontFamily: 'var(--font-playfair)' }}>
              {project.takeaway.title}
            </h2>
            <p className="mt-6 max-w-3xl text-[16px] leading-8 text-[#EAF0F6]">{project.takeaway.body}</p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#FAFAF7]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[.36fr_.64fr] lg:gap-14 lg:px-8 lg:py-20">
          <div>
            <SectionEyebrow>{project.cta.eyebrow}</SectionEyebrow>
          </div>
          <div>
            <h2 className="max-w-3xl text-4xl leading-[1.06] tracking-[-0.025em] text-slate-950 sm:text-[48px]" style={{ fontFamily: 'var(--font-playfair)' }}>
              {project.cta.title}
            </h2>
            <p className="mt-5 max-w-2xl text-[16px] leading-8 text-slate-600">{project.cta.body}</p>
            <div className="mt-7 flex flex-wrap gap-5 text-[15px]">
              <Link
                href={project.cta.primaryHref}
                className="inline-flex items-center gap-2 font-semibold text-slate-950 underline decoration-slate-400 underline-offset-4 hover:decoration-slate-950"
              >
                {project.cta.primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={project.cta.secondaryHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-semibold text-slate-500 underline decoration-slate-300 underline-offset-4 hover:text-slate-950 hover:decoration-slate-950"
              >
                {project.cta.secondaryLabel}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between gap-3 border border-slate-300 bg-[#FAFAF7]/95 px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,.10)] backdrop-blur sm:hidden">
        <a href={project.proofUrl} target="_blank" rel="noreferrer" className="text-[13px] font-semibold text-slate-700 underline underline-offset-4">
          Repository
        </a>
        <Link href={project.cta.primaryHref} className="bg-slate-950 px-4 py-2 text-[13px] font-semibold text-white">
          Contact
        </Link>
      </div>
    </main>
  )
}
