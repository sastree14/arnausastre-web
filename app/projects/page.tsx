import Image from 'next/image'
import Link from 'next/link'
import { getAllProjects } from '@/lib/projects'

export default function ProjectsPage() {
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
          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600">
            A selection of analytical projects across different industries. Client names and internal details are anonymised. Metrics reflect real system performance.
          </p>
        </div>
      </section>

      {/* Projects grid */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2" stroke="#94a3b8" strokeWidth="1.5"/>
                <path d="M8 21h8M12 17v4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-600">Projects coming soon.</p>
            <p className="mt-2 max-w-sm text-xs leading-6 text-slate-400">
              We only publish projects with explicit client permission.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-block rounded-md bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Get in touch
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm card-lift"
              >
                {/* Image area — aspect ratio matches source images (1536×1024 = 3:2) */}
                <div className="relative aspect-[3/2] w-full overflow-hidden">
                  <Image
                    src={project.imagePath}
                    alt={project.headline}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-7">
                  {/* Chips */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-medium text-white">
                      {project.industry}
                    </span>
                    {project.capability.split(',').slice(0, 2).map((cap) => (
                      <span
                        key={cap}
                        className="rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-[10px] font-medium text-indigo-700"
                      >
                        {cap.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Headline */}
                  <h2
                    className="text-xl leading-snug text-slate-900 group-hover:text-indigo-700 transition"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                  >
                    {project.headline}
                  </h2>

                  {/* Description */}
                  <p className="mt-3 text-sm leading-7 text-slate-600 line-clamp-3 flex-1">
                    {project.description}
                  </p>

                  {/* Metrics */}
                  {project.metrics.length > 0 && (
                    <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-5">
                      {project.metrics.slice(0, 4).map((m) => (
                        <div key={m.label} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
                          <p className="text-[10px] text-slate-400 leading-tight">{m.label}</p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-900">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
