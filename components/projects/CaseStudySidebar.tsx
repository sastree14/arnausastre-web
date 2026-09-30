'use client'

import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

type Item = { id: string; label: string }

const copy = {
  en: { title: 'Case contents', repository: 'Repository', contact: 'Discuss a similar problem' },
  es: { title: 'Contenido del caso', repository: 'Repositorio', contact: 'Hablar de un problema similar' },
  ca: { title: 'Contingut del cas', repository: 'Repositori', contact: 'Parlar d’un problema similar' },
} as const

export default function CaseStudySidebar({
  items,
  repositoryUrl,
  contactHref = '/contact',
}: {
  items: Item[]
  repositoryUrl: string
  contactHref?: string
}) {
  const { lang } = useSiteLanguage()
  const c = copy[lang]

  return (
    <>
      <aside className="hidden border-r border-slate-300 bg-[#FAFAF7] lg:block">
        <div className="sticky top-[76px] py-9 pr-7">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-500">{c.title}</p>

          <nav className="mt-5 border-t border-slate-300">
            {items.map((item, index) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="grid grid-cols-[28px_1fr] gap-2 border-b border-slate-200 py-3 text-[14px] leading-5 text-slate-600 transition hover:text-slate-950"
              >
                <span className="font-mono text-[12px] text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="mt-7 space-y-3 border-t border-slate-300 pt-5">
            <a
              href={repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 border border-slate-400 bg-white px-3.5 py-3 text-[13px] font-semibold text-slate-800 transition hover:border-slate-700"
            >
              {c.repository}
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link
              href={contactHref}
              className="flex items-center justify-between gap-3 bg-slate-950 px-3.5 py-3 text-[13px] font-semibold text-white transition hover:bg-slate-800"
            >
              {c.contact}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      <div className="sticky top-[64px] z-30 border-b border-slate-300 bg-[#FAFAF7]/96 px-5 py-3 backdrop-blur lg:hidden">
        <div className="flex gap-4 overflow-x-auto whitespace-nowrap text-[13px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="text-slate-600 hover:text-slate-950">
              {item.label}
            </a>
          ))}
          <a href={repositoryUrl} target="_blank" rel="noreferrer" className="font-semibold text-slate-950">
            {c.repository} ↗
          </a>
        </div>
      </div>
    </>
  )
}
