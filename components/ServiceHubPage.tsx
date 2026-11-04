'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import { SERVICES_PROCESS } from '@/lib/services-process'
import { SERVICE_HUBS, type ServiceHubKey } from '@/lib/service-hubs'
import { SERVICE_HUB_EDITORIAL } from '@/lib/service-hub-editorial'
import { selectHubServiceLinks, type HubServiceLink } from '@/lib/service-hub-directory'

const COPY = {
  es: {
    services: 'Servicios', eyebrow: 'NUESTRAS ESPECIALIDADES',
    explore: 'Explorar soluciones', contact: 'Hablar de este servicio',
    overviewLabel: 'EN QUÉ CONSISTE', overview: 'Entender el problema antes de diseñar la solución.',
    context: 'El reto empresarial', approach: 'Cómo lo abordamos',
    outcomeLabel: 'QUÉ PUEDES OBTENER',
    examplesLabel: 'APLICACIONES PRÁCTICAS', examples: 'Dónde puede aportar valor.',
    examplesNote: 'Situaciones ilustrativas. La solución concreta depende de los objetivos, datos y restricciones de cada empresa.',
    relatedLabel: 'SERVICIOS ESPECIALIZADOS', related: 'Explora soluciones concretas.',
    relatedNote: 'Descubre soluciones específicas para las necesidades de tu empresa.',
    otherLabel: 'SIGUE EXPLORANDO', knowledgeTitle: 'Conocimiento', knowledgeBody: 'Análisis y recursos relacionados con esta especialidad.', projectsTitle: 'Casos de éxito', projectsBody: 'Explora proyectos y aplicaciones de nuestro trabajo.', emptyRelated: 'Todavía no hay páginas especializadas publicadas en español para esta área.',
    openService: 'Ver servicio',
    finalLabel: 'HABLEMOS', finalTitle: '¿Qué te gustaría mejorar en tu empresa?',
    finalBody: 'Cuéntanos el contexto y las decisiones que quieres mejorar. Valoraremos contigo una solución proporcionada.',
    finalCta: 'Contactar con SC-Analytics', back: 'Volver a todos los servicios'
  },
  ca: {
    services: 'Serveis', eyebrow: 'LES NOSTRES ESPECIALITATS',
    explore: 'Explorar solucions', contact: 'Parlar d’aquest servei',
    overviewLabel: 'EN QUÈ CONSISTEIX', overview: 'Entendre el problema abans de dissenyar la solució.',
    context: 'El repte empresarial', approach: 'Com ho enfoquem',
    outcomeLabel: 'QUÈ POTS OBTENIR',
    examplesLabel: 'APLICACIONS PRÀCTIQUES', examples: 'On pot aportar valor.',
    examplesNote: 'Situacions il·lustratives. La solució concreta depèn dels objectius, les dades i les restriccions de cada empresa.',
    relatedLabel: 'SERVEIS ESPECIALITZATS', related: 'Explora solucions concretes.',
    relatedNote: 'Descobreix solucions específiques per a les necessitats de la teva empresa.',
    otherLabel: 'CONTINUA EXPLORANT', knowledgeTitle: 'Coneixement', knowledgeBody: 'Anàlisis i recursos relacionats amb aquesta especialitat.', projectsTitle: 'Casos d’èxit', projectsBody: 'Explora projectes i aplicacions de la nostra feina.', emptyRelated: 'Encara no hi ha pàgines especialitzades publicades en català per a aquesta àrea.',
    openService: 'Veure servei',
    finalLabel: 'PARLEM-NE', finalTitle: 'Què t’agradaria millorar a la teva empresa?',
    finalBody: 'Explica’ns el context i les decisions que vols millorar. Valorarem amb tu una solució proporcionada.',
    finalCta: 'Contacta amb SC-Analytics', back: 'Torna a tots els serveis'
  },
  en: {
    services: 'Services', eyebrow: 'OUR SPECIALISMS',
    explore: 'Explore solutions', contact: 'Discuss this service',
    overviewLabel: 'WHAT IT INVOLVES', overview: 'Understand the problem before designing the solution.',
    context: 'The business challenge', approach: 'How we approach it',
    outcomeLabel: 'WHAT YOU CAN OBTAIN',
    examplesLabel: 'PRACTICAL APPLICATIONS', examples: 'Where it can create value.',
    examplesNote: 'Illustrative situations. The right solution depends on each organisation’s goals, data and constraints.',
    relatedLabel: 'SPECIALISED SERVICES', related: 'Explore the specific solutions.',
    relatedNote: 'Discover focused solutions for the challenges your business faces.',
    otherLabel: 'KEEP EXPLORING', knowledgeTitle: 'Knowledge', knowledgeBody: 'Analyses and useful resources connected to this specialism.', projectsTitle: 'Success stories', projectsBody: 'Explore projects and practical applications of our work.', emptyRelated: 'No dedicated English-language service pages are published in this area yet.',
    openService: 'Explore service',
    finalLabel: 'LET’S TALK', finalTitle: 'What would you like to improve in your business?',
    finalBody: 'Tell us about your context and the decisions you need to improve. We will explore a proportionate solution together.',
    finalCta: 'Contact SC-Analytics', back: 'Back to all services'
  }
} as const

export default function ServiceHubPage({ hubKey, directory }: { hubKey: ServiceHubKey; directory: HubServiceLink[] }) {
  const { lang } = useSiteLanguage()
  const hub = SERVICE_HUBS[hubKey]
  const t = COPY[lang]
  const editorial = SERVICE_HUB_EDITORIAL[hubKey][lang]
  const [description, , outcome] = SERVICES_PROCESS[lang].details[hub.capabilityIndex]
  const related = selectHubServiceLinks(directory, hubKey, lang)
  const knowledgeArea:Record<ServiceHubKey,string> = {
    ai:'ai_automation', forecasting:'planning', optimisation:'operations',
    ml:'analytics', analytics:'analytics', simulation:'risk_decision'
  }

  const contactHref = '/contact?intent=problem&ref=hub:' + hub.slug

  return (
    <main className="bg-white text-[#0D1B2A]">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="site-container py-9 md:py-12">
          <nav aria-label="Breadcrumb" className="text-[13px] font-medium text-[#C7D9E8]">
            <Link href="/services" className="underline-offset-4 hover:text-white hover:underline">{t.services}</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <span aria-current="page" className="text-white">{hub.titles[lang]}</span>
          </nav>
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="max-w-xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#C7D9E8]">{t.eyebrow}</p>
              <h1 className="mt-4 text-[36px] font-normal leading-[1.13] tracking-[-0.012em] text-white sm:text-[42px] lg:text-[44px]" style={{ fontFamily: 'var(--font-playfair)' }}>
                {hub.titles[lang]}
              </h1>
              <p className="mt-5 text-[16px] leading-7 text-[#EAF0F6]">{hub.intro[lang]}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#specialist-services" className="inline-flex items-center gap-2 bg-white px-5 py-3 text-[14px] font-semibold text-[#0D1B2A] transition-colors hover:bg-[#EAF0F6]">
                  {t.explore} <span aria-hidden="true">→</span>
                </a>
                <Link href={contactHref} className="inline-flex items-center gap-2 border border-[#829CB3] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-white/10">
                  {t.contact} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            <div className="border-t border-[#496C8A] pt-6 lg:border-l lg:border-t-0 lg:py-2 lg:pl-11">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#C7D9E8]">{t.overviewLabel}</p>
              <h2 className="mt-4 max-w-[24ch] text-[30px] font-normal leading-[1.2] text-white sm:text-[35px] lg:text-[38px]" style={{ fontFamily: 'var(--font-playfair)' }}>
                {t.overview}
              </h2>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="site-container py-11 md:py-14">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            <div>
              <h3 className="text-[22px] font-normal leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{t.context}</h3>
              <p className="mt-3 text-[16px] leading-[1.8] text-slate-700">{editorial.context}</p>
              <p className="mt-4 text-[16px] leading-[1.8] text-slate-700">{description}</p>
            </div>
            <div>
              <h3 className="text-[22px] font-normal leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{t.approach}</h3>
              <p className="mt-3 text-[16px] leading-[1.8] text-slate-700">{editorial.approach}</p>
              <div className="mt-6 border-l-[3px] border-[#496C8A] bg-[#EAF0F6] px-5 py-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#254A66]">{t.outcomeLabel}</p>
                <p className="mt-2 text-[16px] leading-7 text-[#0D1B2A]">{outcome}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="practical-examples" className="border-b border-slate-300 bg-[#F7F9FC]">
        <div className="site-container py-11 md:py-14">
          <div className="mx-auto max-w-[780px] text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#254A66]">{t.examplesLabel}</p>
            <h2 className="mt-2 text-[30px] font-normal leading-[1.15] sm:text-[37px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.examples}</h2>
          </div>
          <div className="mt-8 grid border-l border-t border-slate-300 md:grid-cols-3">
            {editorial.scenarios.map(([title, body], index) => (
              <article key={title} className={'flex min-h-[220px] flex-col border-b border-r border-slate-300 p-6 ' + (index === 1 ? 'bg-[#EAF0F6]' : 'bg-white')}>
                <span className="font-mono text-[13px] font-semibold text-[#496C8A]">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mt-5 text-[25px] font-semibold leading-[1.16]" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-slate-700">{body}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 max-w-4xl text-[13px] leading-6 text-slate-500">{t.examplesNote}</p>
        </div>
      </section>

      <section id="specialist-services" className="scroll-mt-20 border-b border-slate-300 bg-white">
        <div className="site-container py-11 md:py-14">
          <div className="mx-auto max-w-[780px] text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#254A66]">{t.relatedLabel}</p>
            <h2 className="mt-2 text-[30px] font-normal leading-[1.15] sm:text-[37px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.related}</h2>
          </div>
          <p className="mx-auto mt-6 max-w-3xl text-center text-[15px] leading-7 text-slate-600">{t.relatedNote}</p>
          {related.length ? (
            <div className="service-related-grid mt-8" data-count={related.length}>
              {related.map(({slug,label},index) => (
                <Link
                  key={slug}
                  href={'/services/' + slug}
                  className={'service-related-card group flex min-h-[160px] flex-col p-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#496C8A] ' +
                    (index % 2 === 1 ? 'bg-[#EAF0F6] hover:bg-[#DFEAF3]' : 'bg-white hover:bg-[#F7F9FC]')}
                >
                  <span className="font-mono text-[12px] font-medium tracking-wider text-[#496C8A]">{String(index+1).padStart(2,'0')}</span>
                  <h3 className="mt-4 text-[23px] font-normal leading-[1.15] text-[#0D1B2A]" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>{label}</h3>
                  <span className="mt-auto pt-4 text-[14px] font-medium text-[#254A66]">{t.openService} <span aria-hidden="true">→</span></span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mx-auto mt-7 max-w-xl border border-slate-300 bg-[#F7F9FC] p-6 text-center text-[15px] leading-7 text-slate-600">{t.emptyRelated}</p>
          )}
          <div className="mt-12">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#254A66]">{t.otherLabel}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link href={'/knowledge?area='+knowledgeArea[hubKey]} className="group flex items-center justify-between gap-5 border border-slate-300 bg-[#EAF0F6] p-6 transition-colors hover:bg-[#DFEAF3]">
                <div>
                  <h3 className="text-[24px] leading-tight text-[#0D1B2A]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.knowledgeTitle}</h3>
                  <p className="mt-2 text-[15px] leading-6 text-slate-700">{t.knowledgeBody}</p>
                </div>
                <span aria-hidden="true" className="shrink-0 text-[#254A66] transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link href="/projects" className="group flex items-center justify-between gap-5 border border-slate-300 bg-white p-6 transition-colors hover:bg-[#F7F9FC]">
                <div>
                  <h3 className="text-[24px] leading-tight text-[#0D1B2A]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.projectsTitle}</h3>
                  <p className="mt-2 text-[15px] leading-6 text-slate-700">{t.projectsBody}</p>
                </div>
                <span aria-hidden="true" className="shrink-0 text-[#254A66] transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="site-container grid gap-6 py-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:py-14">
          <div className="max-w-3xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#C7D9E8]">{t.finalLabel}</p>
            <h2 className="mt-3 text-[30px] font-normal leading-[1.13] sm:text-[38px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.finalTitle}</h2>
            <p className="mt-4 text-[16px] leading-7 text-[#EAF0F6]">{t.finalBody}</p>
          </div>
          <Link href={contactHref} className="inline-flex items-center gap-3 bg-white px-6 py-3.5 text-[15px] font-semibold text-[#0D1B2A] transition-colors hover:bg-[#EAF0F6]">
            {t.finalCta}<span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <div className="site-container py-7">
        <Link href="/services" className="text-[14px] font-semibold text-[#254A66] underline-offset-4 hover:underline">← {t.back}</Link>
      </div>
    </main>
  )
}
