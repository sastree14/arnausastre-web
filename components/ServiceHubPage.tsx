'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { SERVICES_PROCESS } from '@/lib/services-process'
import { SERVICE_HUBS, type ServiceHubKey } from '@/lib/service-hubs'

const COPY = {
  es: {
    services: 'Servicios',
    overview: 'En qué consiste',
    examples: 'Ejemplos de aplicación',
    outcome: 'Qué puedes obtener',
    related: 'Explora servicios específicos',
    relatedText: 'Profundiza en las soluciones que mejor encajen con tus necesidades.',
    contactTitle: '¿Quieres mejorar algo en tu empresa?',
    contactText: 'Cuéntanos qué necesitas. Estudiaremos contigo si estas soluciones pueden aportar valor.',
    contact: 'Contactar con SC-Analytics',
    back: 'Volver a todos los servicios'
  },
  ca: {
    services: 'Serveis',
    overview: 'En què consisteix',
    examples: 'Exemples d’aplicació',
    outcome: 'Què pots obtenir',
    related: 'Explora serveis específics',
    relatedText: 'Aprofundeix en les solucions que millor encaixin amb les teves necessitats.',
    contactTitle: 'Vols millorar alguna cosa a la teva empresa?',
    contactText: 'Explica’ns què necessites. Estudiarem amb tu si aquestes solucions poden aportar valor.',
    contact: 'Contacta amb SC-Analytics',
    back: 'Torna a tots els serveis'
  },
  en: {
    services: 'Services',
    overview: 'What it involves',
    examples: 'Practical examples',
    outcome: 'What you can obtain',
    related: 'Explore specialised services',
    relatedText: 'Discover the specific solutions most relevant to your business needs.',
    contactTitle: 'Is there something you would like to improve?',
    contactText: 'Tell us what you need. Together we can assess whether these solutions could create value.',
    contact: 'Contact SC-Analytics',
    back: 'Back to all services'
  }
} as const

export default function ServiceHubPage({ hubKey }: { hubKey: ServiceHubKey }) {
  const { lang } = useSiteLanguage()
  const hub = SERVICE_HUBS[hubKey]
  const t = COPY[lang]
  const [description, examples, outcome] = SERVICES_PROCESS[lang].details[hub.capabilityIndex]
  const related = [...hub.related].sort((a, b) => Number(b[2] === lang) - Number(a[2] === lang))

  return (
    <main className="bg-white text-[#0D1B2A]">
      <section className="border-b border-[#CBD5E1] bg-[#EAF0F6]">
        <div className="site-container py-14 md:py-20">
          <nav aria-label="Breadcrumb" className="text-sm font-medium text-[#254A66]">
            <Link href="/services" className="underline-offset-4 hover:underline">{t.services}</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <span aria-current="page">{hub.titles[lang]}</span>
          </nav>
          <div className="mt-10 max-w-4xl">
            <h1 className="text-[40px] font-semibold leading-[1.12] tracking-[-0.04em] md:text-[56px]">{hub.titles[lang]}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#254A66]">{hub.intro[lang]}</p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#CBD5E1]">
        <div className="site-container grid gap-8 py-14 md:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] md:gap-12 md:py-16">
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">{t.overview}</h2>
          <p className="max-w-3xl text-lg leading-8 text-slate-700">{description}</p>
        </div>
      </section>

      <section className="border-b border-[#CBD5E1] bg-[#F7F9FC]">
        <div className="site-container py-14 md:py-16">
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">{t.examples}</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {examples.map((example, index) => (
              <article key={example} className="border border-[#CBD5E1] bg-white p-6">
                <span aria-hidden="true" className="text-xs font-semibold tracking-wider text-[#496C8A]">0{index + 1}</span>
                <p className="mt-4 text-base leading-7 text-slate-800">{example}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#CBD5E1]">
        <div className="site-container grid gap-8 py-14 md:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] md:gap-12 md:py-16">
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">{t.outcome}</h2>
          <p className="max-w-3xl text-lg leading-8 text-slate-700">{outcome}</p>
        </div>
      </section>

      <section className="border-b border-[#CBD5E1] bg-[#F7F9FC]">
        <div className="site-container py-14 md:py-16">
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">{t.related}</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{t.relatedText}</p>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {related.map(([slug, label, locale]) => (
              <Link
                key={slug}
                href={'/services/' + slug}
                className="group flex items-center justify-between gap-4 border border-[#CBD5E1] bg-white p-5 transition-colors hover:border-[#496C8A] hover:bg-[#EAF0F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#496C8A]"
              >
                <span className="flex items-center gap-3">
                  <span className="border border-slate-200 px-1.5 py-0.5 text-[11px] font-semibold uppercase text-slate-500">{locale}</span>
                  <span className="text-base font-semibold text-[#0D1B2A]">{label}</span>
                </span>
                <span aria-hidden="true" className="text-lg text-[#254A66] transition-transform group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0D1B2A] text-white">
        <div className="site-container flex flex-col gap-7 py-14 md:flex-row md:items-end md:justify-between md:py-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.03em]">{t.contactTitle}</h2>
            <p className="mt-4 text-base leading-7 text-[#EAF0F6]">{t.contactText}</p>
          </div>
          <Link href={'/contact?intent=problem&ref=hub:' + hub.slug} className="inline-flex shrink-0 items-center gap-3 bg-white px-6 py-3.5 text-base font-semibold text-[#0D1B2A] transition-colors hover:bg-[#EAF0F6]">
            {t.contact}<span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <div className="site-container py-8">
        <Link href="/services" className="text-sm font-semibold text-[#254A66] underline-offset-4 hover:underline">← {t.back}</Link>
      </div>
    </main>
  )
}
