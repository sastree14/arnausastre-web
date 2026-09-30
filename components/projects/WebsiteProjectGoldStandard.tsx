import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Code2,
  Database,
  Gauge,
  GitBranch,
  Layers3,
  ShieldCheck,
} from 'lucide-react'
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

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600">{children}</p>
}

function SectionHeading({
  title,
  body,
}: {
  title: string
  body?: string
}) {
  return (
    <div className="max-w-3xl">
      <h2 className="mt-4 text-3xl leading-[1.08] tracking-[-0.02em] text-slate-950 sm:text-4xl lg:text-[42px]" style={{ fontFamily: 'var(--font-playfair)' }}>
        {title}
      </h2>
      {body ? <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">{body}</p> : null}
    </div>
  )
}

function SectionShell({
  id,
  children,
  tone = 'white',
}: {
  id: string
  children: React.ReactNode
  tone?: 'white' | 'paper' | 'dark'
}) {
  const toneClass =
    tone === 'dark'
      ? 'bg-[#071522] text-white'
      : tone === 'paper'
        ? 'bg-[#F8FAFC] text-slate-950'
        : 'bg-white text-slate-950'

  return (
    <section id={id} className={`scroll-mt-28 border-b border-slate-200/80 ${toneClass}`}>
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8 lg:py-28">{children}</div>
    </section>
  )
}

export default function WebsiteProjectGoldStandard({ project }: { project: WebsiteProjectGoldStandard }) {
  return (
    <main className="bg-white text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-800 bg-[#071522] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full border border-indigo-300/10" />
          <div className="absolute right-12 top-20 h-72 w-72 rotate-12 border border-sky-300/[.06]" />
          <div className="absolute bottom-0 left-[52%] h-px w-[36%] bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-24">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <span aria-hidden="true">←</span>
            Projects
          </Link>

          <div className="mt-14 grid gap-12 lg:grid-cols-[1.18fr_.82fr] lg:items-start">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">{project.eyebrow}</p>
              <h1
                className="mt-6 max-w-4xl text-5xl leading-[1.03] tracking-[-0.035em] text-white sm:text-6xl lg:text-[72px]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {project.title}
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">{project.description}</p>

              <div className="mt-8 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/[.05] px-3 py-1.5 text-xs font-medium text-white">
                  {project.industry}
                </span>
                {project.capabilities.map((capability) => (
                  <span
                    key={capability}
                    className="rounded-full border border-indigo-300/20 bg-indigo-300/[.06] px-3 py-1.5 text-xs font-medium text-indigo-200"
                  >
                    {capability}
                  </span>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href={project.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  {project.proofLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href="#problem"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[.08]"
                >
                  Read the case study
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <aside className="rounded-[28px] border border-white/10 bg-white/[.045] p-5 shadow-[0_30px_80px_-50px_rgba(0,0,0,.9)] backdrop-blur sm:p-6">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Project ID</p>
                  <p className="mt-1 font-mono text-sm text-white">{project.projectId}</p>
                </div>
                <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/[.06] px-3 py-2 text-right">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-emerald-300">Evidence mode</p>
                  <p className="mt-1 text-xs text-emerald-100">Public implementation</p>
                </div>
              </div>

              <div className="divide-y divide-white/10">
                {project.heroFacts.map((fact) => (
                  <div key={fact.label} className="grid grid-cols-[.42fr_.58fr] gap-4 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{fact.label}</p>
                    <p className="text-right text-sm font-medium leading-6 text-slate-200">{fact.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-[#0D1B2A] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-sky-300">Core thesis</p>
                <p className="mt-3 text-sm leading-6 text-slate-200">{project.thesis}</p>
              </div>
            </aside>
          </div>

          <div className="mt-14 border-t border-white/10 pt-5">
            <p className="max-w-4xl text-xs leading-6 text-slate-500">{project.sourceNote}</p>
          </div>
        </div>
      </section>

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto hidden max-w-7xl grid-cols-[220px_1fr] gap-12 px-6 lg:grid lg:px-8">
          <aside className="relative border-r border-slate-200 py-16">
            <div className="sticky top-28 pr-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">On this page</p>
              <nav className="mt-5 space-y-1">
                {sectionLinks.map(([id, label]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="block border-l border-transparent py-1.5 pl-3 text-sm text-slate-500 transition hover:border-indigo-400 hover:text-slate-950"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="py-16">
            <p className="max-w-3xl text-2xl leading-10 text-slate-700" style={{ fontFamily: 'var(--font-playfair)' }}>
              {project.thesis}
            </p>
          </div>
        </div>
      </div>

      <SectionShell id="problem" tone="paper">
        <SectionEyebrow>{project.businessProblem.eyebrow}</SectionEyebrow>
        <SectionHeading title={project.businessProblem.title} />
        <div className="mt-10 grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div className="space-y-5 text-base leading-8 text-slate-600">
            {project.businessProblem.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="grid gap-4">
            {project.businessProblem.consequences.map((consequence, index) => (
              <div key={consequence.title} className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-[44px_1fr] sm:p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-950">{consequence.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{consequence.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell id="horizon">
        <SectionEyebrow>{project.horizonLogic.eyebrow}</SectionEyebrow>
        <SectionHeading title={project.horizonLogic.title} body={project.horizonLogic.body} />
        <div className="mt-10">
          <HorizonDecisionVisual data={project.horizonLogic} />
        </div>
      </SectionShell>

      <SectionShell id="system" tone="paper">
        <SectionEyebrow>{project.solution.eyebrow}</SectionEyebrow>
        <SectionHeading title={project.solution.title} body={project.solution.body} />

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {project.solution.bullets.map((bullet, index) => (
            <div key={bullet} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/50">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="mt-7 text-sm leading-6 text-slate-700">{bullet}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="architecture" tone="dark">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">{project.architecture.eyebrow}</p>
        <div className="max-w-3xl">
          <h2
            className="mt-4 text-3xl leading-[1.08] tracking-[-0.02em] text-white sm:text-4xl lg:text-[42px]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {project.architecture.title}
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-300 sm:text-lg">{project.architecture.body}</p>
        </div>

        <div className="mt-10">
          <ArchitectureSystemVisual data={project.architecture} />
        </div>
      </SectionShell>

      <SectionShell id="decisions">
        <SectionEyebrow>{project.decisions.eyebrow}</SectionEyebrow>
        <SectionHeading title={project.decisions.title} body={project.decisions.body} />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {project.decisions.items.map((decision, index) => {
            const icons = [GitBranch, Gauge, ShieldCheck]
            const Icon = icons[index] ?? CheckCircle2
            return (
              <div key={decision.title} className="rounded-[24px] border border-slate-200 bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-8 text-xl text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {decision.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{decision.body}</p>
              </div>
            )
          })}
        </div>
      </SectionShell>

      <SectionShell id="evidence" tone="paper">
        <SectionEyebrow>{project.evidence.eyebrow}</SectionEyebrow>
        <SectionHeading title={project.evidence.title} body={project.evidence.body} />
        <div className="mt-10">
          <EvidenceFrameworkVisual data={project.evidence} />
        </div>
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
          <span className="font-semibold">Evidence note.</span> {project.evidence.note}
        </div>
      </SectionShell>

      <SectionShell id="technical">
        <SectionEyebrow>{project.technical.eyebrow}</SectionEyebrow>
        <SectionHeading title={project.technical.title} body={project.technical.body} />

        <div className="mt-10 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-6 text-white">
            <div className="flex items-center gap-3">
              <Code2 className="h-5 w-5 text-indigo-300" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Technology footprint</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {project.technical.technologies.map((technology) => (
                <span key={technology} className="rounded-lg border border-white/10 bg-white/[.04] px-3 py-2 text-xs font-medium text-slate-200">
                  {technology}
                </span>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
              <div>
                <Database className="h-4 w-4 text-sky-300" />
                <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-slate-500">Data</p>
              </div>
              <div>
                <BarChart3 className="h-4 w-4 text-indigo-300" />
                <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-slate-500">Models</p>
              </div>
              <div>
                <Layers3 className="h-4 w-4 text-violet-300" />
                <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-slate-500">Serving</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {project.technical.highlights.map((highlight) => (
              <div key={highlight} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                <p className="text-sm leading-7 text-slate-650 text-slate-600">{highlight}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-indigo-100 bg-indigo-50/60 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">Technical proof</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">Inspect the implementation rather than taking the page at face value.</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Architecture, data notes, results guidance, limitations, example outputs and the main execution path are documented in Portfolio_SC_Analytics.</p>
          </div>
          <a
            href={project.proofUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:mt-0"
          >
            Open SC-12
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </SectionShell>

      <SectionShell id="limitations" tone="paper">
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <SectionEyebrow>{project.limitations.eyebrow}</SectionEyebrow>
            <SectionHeading title={project.limitations.title} body={project.limitations.body} />
          </div>

          <div className="divide-y divide-slate-200 rounded-[24px] border border-slate-200 bg-white px-6">
            {project.limitations.items.map((item, index) => (
              <div key={item} className="grid grid-cols-[36px_1fr] gap-3 py-5">
                <span className="font-mono text-xs text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <section className="border-b border-slate-800 bg-[#0D1B2A] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-300">{project.takeaway.eyebrow}</p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <h2
              className="max-w-4xl text-4xl leading-[1.08] tracking-[-0.025em] text-white sm:text-5xl"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {project.takeaway.title}
            </h2>
            <p className="text-base leading-8 text-slate-300">{project.takeaway.body}</p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8">
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-[#FAFAF7] p-7 sm:p-10 lg:p-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600">{project.cta.eyebrow}</p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h2 className="max-w-3xl text-4xl leading-[1.08] text-slate-950 sm:text-5xl" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {project.cta.title}
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">{project.cta.body}</p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link
                  href={project.cta.primaryHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {project.cta.primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={project.cta.secondaryHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
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
