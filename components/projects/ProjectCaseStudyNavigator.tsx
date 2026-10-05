'use client'

import Link from '@/components/SiteLink'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

type Item = { id: string; label: string }

const copy = {
  en: { jump: 'Jump to', choose: 'Choose a section', repository: 'Repository', contact: 'Contact' },
  es: { jump: 'Ir a', choose: 'Selecciona una sección', repository: 'Repositorio', contact: 'Contacto' },
  ca: { jump: 'Anar a', choose: 'Selecciona una secció', repository: 'Repositori', contact: 'Contacte' },
} as const

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
  const { lang } = useSiteLanguage()
  const c = copy[lang]

  return (
    <div className="sticky top-[64px] z-30 border-b border-slate-300 bg-[#FAFAF7]/96 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 py-3 lg:flex-nowrap lg:px-8">
        <label htmlFor="case-study-section" className="shrink-0 text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {c.jump}
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
            {c.choose}
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
          {c.repository}
          <ArrowUpRight className="h-4 w-4" />
        </a>

        <Link
          href={contactHref}
          className="inline-flex shrink-0 items-center gap-2 bg-slate-950 px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-slate-800"
        >
          {c.contact}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
