'use client'

import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Item = { id: string; label: string }

export default function ProjectCaseStudyNavigator({
  items,
  repositoryUrl,
  contactHref = '/contact',
}: {
  items: Item[]
  repositoryUrl: string
  contactHref?: string
}) {
  const router = useRouter()

  return (
    <div className="sticky top-[64px] z-30 border-b border-slate-300 bg-[#FAFAF7]/96 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 py-3 lg:flex-nowrap lg:px-8">
        <label htmlFor="case-study-section" className="shrink-0 text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Ir a
        </label>

        <select
          id="case-study-section"
          defaultValue=""
          onChange={(event) => {
            const value = event.target.value
            if (value) router.replace(`#${value}`)
          }}
          className="min-w-[220px] flex-1 border border-slate-400 bg-white px-3 py-2.5 text-[14px] font-medium text-slate-800 outline-none transition focus:border-slate-700"
        >
          <option value="" disabled>
            Selecciona una sección
          </option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>

        <a
          href={repositoryUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-2 border border-slate-400 bg-white px-4 py-2.5 text-[14px] font-semibold text-slate-800 transition hover:border-slate-700"
        >
          Repositorio
          <ArrowUpRight className="h-4 w-4" />
        </a>

        <Link
          href={contactHref}
          className="inline-flex shrink-0 items-center gap-2 bg-slate-950 px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-slate-800"
        >
          Contacto
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
