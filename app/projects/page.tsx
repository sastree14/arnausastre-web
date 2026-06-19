import Link from 'next/link'
import { getAllProjects } from '@/lib/content'

export default async function ProjectsPage() {
  const projects = getAllProjects()

  return (
    <main className="bg-slate-50 text-slate-900 page-enter">

      {/* Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-medium">Projects</p>
          <h1
            className="mt-4 text-5xl leading-tight md:text-6xl text-slate-900"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Real engagements.<br />
            <span className="italic text-slate-500">Real problems. Real results.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-600">
            A selection of analytical projects across different industries — showing how rigorous methodology translates into measurable business improvement. Published with client permission.
          </p>
        </div>
      </section>

      {/* Projects list */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="2" y="3" width="20" height="14" rx="2" stroke="#94a3b8" strokeWidth="1.5"/>
                  <path d="M8 21h8M12 17v4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-600">Projects coming soon.</p>
              <p className="mt-2 max-w-sm text-xs leading-6 text-slate-400">
                We only publish case studies with explicit client permission.
                Real engagements will be shared here as they become available.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-block rounded-md bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Get in touch
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {projects.map((project) => (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className="group block rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden card-lift"
                >
                  <div className="p-8">
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                        {project.industry}
                      </span>
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                        {project.type}
                      </span>
                    </div>
                    <h2
                      className="text-2xl text-slate-900 group-hover:text-indigo-700 transition"
                      style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                      {project.titleEn}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-slate-600 max-w-3xl">{project.excerptEn}</p>
                  </div>
                  <div className="border-t border-slate-200 px-8 py-4 flex items-center gap-2 text-sm font-medium text-indigo-600 bg-white group-hover:bg-indigo-50 transition">
                    View project
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
