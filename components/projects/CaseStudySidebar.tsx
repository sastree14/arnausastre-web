'use client'

import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

type Item = { id: string; label: string }

const copy = {
  en: { title: 'Case contents', repository: 'Open repository', contact: 'Discuss a similar problem' },
  es: { title: 'Contenido del caso', repository: 'Abrir repositorio', contact: 'Hablar de un problema similar' },
  ca: { title: 'Contingut del cas', repository: 'Obrir repositori', contact: 'Parlar d’un problema similar' },
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
      <aside className="hidden bg-[#FAFAF7] lg:block">
        <div className="sticky top-[84px] py-10">
          <div className="border-l border-slate-300 pl-[clamp(18px,1.8vw,28px)] pr-[clamp(12px,1.2vw,20px)]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-500">{c.title}</p>

            <nav className="mt-5 border-t border-slate-300">
              {items.map((item, index) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="group grid min-h-[58px] grid-cols-[30px_1fr] items-center gap-3 border-b border-slate-200 py-3 text-[14px] leading-[1.25] text-slate-600 transition hover:bg-white/75 hover:text-slate-950"
                >
                  <span className="font-mono text-[12px] text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                  <span className="max-w-[180px] whitespace-normal font-medium">{item.label}</span>
                </a>
              ))}
            </nav>

            <div className="mt-7 space-y-3 border-t border-slate-300 pt-6">
              <a
                href={repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-[52px] w-full items-center justify-between gap-4 border border-slate-800 bg-white px-4 py-3 text-[14px] font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                <span>{c.repository}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0" />
              </a>
              <Link
                href={contactHref}
                className="flex min-h-[58px] w-full items-center justify-between gap-4 bg-slate-950 px-4 py-3.5 text-[14px] font-semibold leading-5 text-white transition hover:bg-slate-800"
              >
                <span className="max-w-[180px] whitespace-normal">{c.contact}</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </aside>

      <div className="sticky top-[64px] z-30 border-b border-slate-300 bg-[#FAFAF7]/96 px-5 py-3 backdrop-blur lg:hidden">
        <div className="flex gap-5 overflow-x-auto whitespace-nowrap text-[13px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="font-medium text-slate-600 hover:text-slate-950">
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
