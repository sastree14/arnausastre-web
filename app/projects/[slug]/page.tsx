import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllProjects, getProjectBySlug } from '@/lib/projects'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }))
}

function renderBody(text: string) {
  return text.split('\n\n').map((para, i) => (
    <p key={i} className="mb-5 leading-8 text-slate-700">
      {para.trim()}
    </p>
  ))
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  return (
    <main className="bg-slate-50 text-slate-900 page-enter">

      {/* Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition mb-10"
          >
            ← Back to Projects
          </Link>

          <div className="grid items-center gap-16 lg:grid-cols-2">

            {/* Left — metadata */}
            <div>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
                  {project.industry}
                </span>
                {project.capability.split(',').map((cap) => (
                  <span
                    key={cap}
                    className="rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-1.5 text-xs font-medium text-indigo-700"
                  >
                    {cap.trim()}
                  </span>
                ))}
                <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                  {project.challenge}
                </span>
                {project.audience && project.audience.split(',').slice(0, 2).map((a) => (
                  <span key={a} className="rounded-md bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-500">
                    {a.trim()}
                  </span>
                ))}
              </div>

              <h1
                className="text-4xl leading-tight md:text-5xl text-slate-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {project.headline}
              </h1>

              <p className="mt-6 text-base leading-8 text-slate-600 max-w-xl">
                {project.description}
              </p>
            </div>

            {/* Right — image (source images are 1536×1024 = 3:2) */}
            <div className="relative aspect-[3/2] w-full rounded-2xl overflow-hidden">
              <Image
                src={project.imagePath}
                alt={project.headline}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      {project.metrics.length > 0 && (
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
              {project.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4"
                >
                  <p className="text-xs text-slate-400 leading-tight">{m.label}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sections */}
      {project.sections.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 py-20 space-y-14">
          {project.sections.map((section) => (
            <div key={section.title}>
              <h2
                className="text-2xl text-slate-900 mb-6"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {section.title}
              </h2>
              <div className="rounded-2xl border border-slate-200 bg-white p-8">
                {renderBody(section.body)}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Confidentiality note */}
      {project.confidentiality && (
        <section className="mx-auto max-w-4xl px-6 pb-12">
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 flex items-start gap-3">
            <svg className="mt-0.5 flex-shrink-0 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="text-xs leading-6 text-slate-500">{project.confidentiality}</p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2
            className="text-3xl text-slate-900"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Working on a similar problem?
          </h2>
          <p className="mt-4 text-slate-600 max-w-xl mx-auto">
            We analyse the situation before proposing anything. The first conversation has no commitment.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-md bg-slate-900 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Get in touch
          </Link>
        </div>
      </section>

    </main>
  )
}
