'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import type { Article } from '@/lib/content'
import type { PublicGeneratedArticle } from '@/lib/public-growth'

type KnowledgeArea =
  | 'all'
  | 'planning'
  | 'operations'
  | 'risk_decision'
  | 'ai_automation'
  | 'analytics'
  | 'finance'
  | 'business_systems'

type KnowledgeItem = {
  key: string
  href: string
  title: string
  excerpt: string
  industry: string
  challenge: string
  audience: string
  date: string
  readingTime: number
  areas: KnowledgeArea[]
}

const FEATURED_SLUG = 'why-inventory-visibility-is-not-inventory-control-and-what-that-costs'

const STATIC_AREAS: Record<string, KnowledgeArea[]> = {
  'why-inventory-visibility-is-not-inventory-control-and-what-that-costs': ['operations', 'planning', 'analytics'],
  'why-operational-supplier-risk-outstrips-financial-risk-and-what-it-costs': ['risk_decision', 'operations'],
  'cuando-la-fijacion-dinamica-de-precios-crea-mas-problemas-que-soluciones': ['analytics', 'finance', 'risk_decision'],
  'why-hiring-faster-obscures-deeper-healthcare-capacity-problems': ['planning', 'operations'],
  'why-professional-services-firms-misdiagnose-capacity-problems': ['planning', 'operations'],
}

const COPY = {
  es: {
    filterLabel: 'ÁREAS DE CONOCIMIENTO',
    count: 'análisis disponibles',
    filters: {
      all: 'Todos',
      planning: 'Predicción y planificación',
      operations: 'Operaciones y optimización',
      risk_decision: 'Riesgo y decisión',
      ai_automation: 'IA y automatización',
      analytics: 'Analytics y reporting',
      finance: 'Finanzas y modelización',
      business_systems: 'Sistemas empresariales',
    },
    featured: 'ANÁLISIS DESTACADO',
    quick: 'EN 30 SEGUNDOS',
    quickPoints: [
      'Ver el inventario no significa controlarlo.',
      'El coste aparece cuando las políticas de reposición siguen siendo reactivas.',
      'La optimización empieza cuando el sistema recomienda qué hacer, no solo qué está pasando.',
    ],
    read: 'Leer análisis',
    more: 'MÁS ANÁLISIS',
    min: 'min',
    empty: 'Todavía no hay análisis publicados en esta área.',
    emptyCta: 'Explorar todo el conocimiento',
    finalTitle: '¿Buscas una idea, problema o decisión concreta?',
    finalBody: 'Cuéntanos qué estás intentando resolver y te orientamos hacia el contenido o el siguiente paso más útil.',
    contact: 'Contacta con nosotros',
  },
  ca: {
    filterLabel: 'ÀREES DE CONEIXEMENT',
    count: 'anàlisis disponibles',
    filters: {
      all: 'Tots',
      planning: 'Predicció i planificació',
      operations: 'Operacions i optimització',
      risk_decision: 'Risc i decisió',
      ai_automation: 'IA i automatització',
      analytics: 'Analytics i reporting',
      finance: 'Finances i modelització',
      business_systems: 'Sistemes empresarials',
    },
    featured: 'ANÀLISI DESTACADA',
    quick: 'EN 30 SEGONS',
    quickPoints: [
      'Veure l’inventari no significa controlar-lo.',
      'El cost apareix quan les polítiques de reposició continuen sent reactives.',
      'L’optimització comença quan el sistema recomana què fer, no només què està passant.',
    ],
    read: 'Llegir anàlisi',
    more: 'MÉS ANÀLISIS',
    min: 'min',
    empty: 'Encara no hi ha anàlisis publicades en aquesta àrea.',
    emptyCta: 'Explorar tot el coneixement',
    finalTitle: 'Busques una idea, problema o decisió concreta?',
    finalBody: 'Explica’ns què estàs intentant resoldre i t’orientem cap al contingut o el següent pas més útil.',
    contact: 'Contacta amb nosaltres',
  },
  en: {
    filterLabel: 'KNOWLEDGE AREAS',
    count: 'available analyses',
    filters: {
      all: 'All',
      planning: 'Forecasting & planning',
      operations: 'Operations & optimisation',
      risk_decision: 'Risk & decision',
      ai_automation: 'AI & automation',
      analytics: 'Analytics & reporting',
      finance: 'Finance & modelling',
      business_systems: 'Business systems',
    },
    featured: 'FEATURED ANALYSIS',
    quick: 'IN 30 SECONDS',
    quickPoints: [
      'Seeing inventory is not the same as controlling it.',
      'The cost appears when replenishment policies remain reactive.',
      'Optimisation starts when the system recommends what to do, not only what is happening.',
    ],
    read: 'Read analysis',
    more: 'MORE ANALYSIS',
    min: 'min',
    empty: 'No analysis has been published in this area yet.',
    emptyCta: 'Explore all knowledge',
    finalTitle: 'Looking for a specific idea, problem or decision?',
    finalBody: 'Tell us what you are trying to solve and we will point you towards the most useful content or next step.',
    contact: 'Contact us',
  },
} as const

const FILTER_ORDER: KnowledgeArea[] = [
  'all',
  'planning',
  'operations',
  'risk_decision',
  'ai_automation',
  'analytics',
  'finance',
  'business_systems',
]

function generatedAreas(item: PublicGeneratedArticle): KnowledgeArea[] {
  const text = [item.topic, item.challenge, item.industry, item.content_family, item.title]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  const areas: KnowledgeArea[] = []

  if (/forecast|planning|inventory|capacity|demand/.test(text)) areas.push('planning')
  if (/operation|optim|route|supply|inventory|workforce|capacity/.test(text)) areas.push('operations')
  if (/risk|fraud|decision|compliance|supplier/.test(text)) areas.push('risk_decision')
  if (/artificial intelligence|\bai\b|automation|agent|llm|machine learning|\bml\b/.test(text)) areas.push('ai_automation')
  if (/analytics|report|dashboard|business intelligence|data/.test(text)) areas.push('analytics')
  if (/finance|pricing|investment|portfolio|cash|margin/.test(text)) areas.push('finance')
  if (/erp|crm|system|platform|workflow|planning tool/.test(text)) areas.push('business_systems')

  return areas.length ? [...new Set(areas)] : ['analytics']
}

function chooseGeneratedVariant(items: PublicGeneratedArticle[], lang: 'en' | 'es' | 'ca') {
  return items.find((item) => item.language === lang)
    || items.find((item) => item.language === 'es')
    || items.find((item) => item.language === 'en')
    || items[0]
}

function compactExcerpt(body: string) {
  return body
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/[\*_\x60]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 210)
}

export default function KnowledgeContent({ articles, generated = [] }: { articles: Article[]; generated?: PublicGeneratedArticle[] }) {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]
  const [activeFilter, setActiveFilter] = useState<KnowledgeArea>('all')

  const generatedGroups = useMemo(() => {
    const groups = new Map<string, PublicGeneratedArticle[]>()
    generated.forEach((article) => {
      const key = article.brief_id || article.content_id
      groups.set(key, [...(groups.get(key) || []), article])
    })
    return [...groups.entries()]
  }, [generated])

  const items = useMemo<KnowledgeItem[]>(() => {
    const staticItems: KnowledgeItem[] = articles.map((article) => ({
      key: article.slug,
      href: `/knowledge/${article.slug}`,
      title: lang === 'en' ? article.titleEn : lang === 'ca' ? (article.titleCa || article.titleEs) : article.titleEs,
      excerpt: lang === 'en' ? article.excerptEn : lang === 'ca' ? (article.excerptCa || article.excerptEs) : article.excerptEs,
      industry: article.industry,
      challenge: article.challenge,
      audience: article.audience,
      date: article.date,
      readingTime: article.readingTime,
      areas: STATIC_AREAS[article.slug] || ['analytics'],
    }))

    const generatedItems = generatedGroups.flatMap(([key, variants]) => {
      const item = chooseGeneratedVariant(variants, lang)
      if (!item) return []
      const published = item.published_at || item.created_at || ''
      const locale = lang === 'ca' ? 'ca-ES' : lang === 'es' ? 'es-ES' : 'en-GB'
      return [{
        key,
        href: `/knowledge/${key}`,
        title: item.title,
        excerpt: compactExcerpt(item.body),
        industry: item.industry || '',
        challenge: item.challenge || item.topic || '',
        audience: item.audience || '',
        date: published ? new Date(published).toLocaleDateString(locale) : '',
        readingTime: Math.max(3, Math.ceil(item.body.split(/\s+/).filter(Boolean).length / 220)),
        areas: generatedAreas(item),
      }]
    })

    return [...staticItems, ...generatedItems]
  }, [articles, generatedGroups, lang])

  const filtered = useMemo(
    () => activeFilter === 'all' ? items : items.filter((item) => item.areas.includes(activeFilter)),
    [activeFilter, items],
  )

  const featured = items.find((item) => item.key === FEATURED_SLUG)
  const showFeatured = Boolean(featured && (activeFilter === 'all' || featured?.areas.includes(activeFilter)))
  const listItems = filtered.filter((item) => !showFeatured || item.key !== FEATURED_SLUG)

  if (!items.length) return null

  return (
    <>
      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1800px] py-5 sm:w-[calc(100%_-_48px)]">
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t.filterLabel}</p>
            <p className="font-mono text-[12px] text-slate-500">{String(filtered.length).padStart(2, '0')} {t.count}</p>
          </div>
          <div className="grid grid-cols-2 border-l border-t border-slate-300 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-8">
            {FILTER_ORDER.map((filter) => {
              const active = activeFilter === filter
              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveFilter(filter)}
                  className={`flex min-h-[66px] items-center justify-center border-b border-r px-4 py-3 text-center text-[13px] font-medium leading-[1.2] transition-colors ${
                    active
                      ? 'border-slate-300 bg-white font-semibold text-slate-950 shadow-[inset_0_-3px_0_#0f172a]'
                      : 'border-slate-300 bg-[#F4F1EA] text-slate-600 hover:bg-white hover:text-slate-950'
                  }`}
                >
                  <span className="max-w-[150px] whitespace-normal">{t.filters[filter]}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-[calc(100%_-_32px)] max-w-[1800px] py-7 sm:w-[calc(100%_-_48px)] lg:py-9">
        {showFeatured && featured ? (
          <Link href={featured.href} className="group grid border border-slate-300 bg-white lg:grid-cols-[1.16fr_.84fr]">
            <div className="flex min-h-[360px] flex-col p-7 md:p-9 lg:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-indigo-700">{t.featured}</p>
                <p className="font-mono text-[12px] text-slate-500">{featured.readingTime} {t.min}</p>
              </div>

              <h2 className="mt-7 max-w-4xl text-[38px] leading-[1.03] tracking-[-0.025em] text-slate-950 transition group-hover:text-indigo-800 sm:text-[44px] lg:text-[50px]" style={{ fontFamily: 'var(--font-playfair)' }}>
                {featured.title}
              </h2>
              <p className="mt-5 max-w-3xl text-[17px] leading-8 text-slate-700">{featured.excerpt}</p>

              <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-5">
                <span className="text-[13px] font-semibold text-slate-500">{featured.industry} · {featured.challenge}</span>
                <span className="inline-flex items-center gap-2 text-[16px] font-semibold text-indigo-700">
                  {t.read}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>

            <aside className="border-t border-slate-300 bg-[#F4F1EA] p-7 md:p-9 lg:border-l lg:border-t-0 lg:p-10">
              <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-indigo-700">{t.quick}</p>
              <div className="mt-5 border-t border-slate-300">
                {t.quickPoints.map((point, index) => (
                  <div key={point} className="grid grid-cols-[38px_1fr] gap-4 border-b border-slate-300 py-5">
                    <span className="font-mono text-[13px] font-semibold text-indigo-700">0{index + 1}</span>
                    <p className="text-[19px] font-semibold leading-7 text-[#1D2B44]">{point}</p>
                  </div>
                ))}
              </div>
            </aside>
          </Link>
        ) : null}

        <div className={showFeatured ? 'mt-10' : ''}>
          <div className="flex items-center justify-between border-b border-slate-400 pb-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-indigo-700">{t.more}</p>
          </div>

          {listItems.length ? (
            <div className="border-b border-slate-400">
              {listItems.map((item, index) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="group grid gap-3 border-b border-slate-300 py-5 last:border-b-0 transition-colors hover:bg-white/80 sm:grid-cols-[54px_minmax(0,1fr)_130px] sm:items-center sm:gap-5"
                >
                  <span className="font-mono text-[12px] text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="max-w-5xl text-[23px] leading-[1.12] tracking-[-0.01em] text-slate-950 transition-colors group-hover:text-indigo-800 sm:text-[25px]" style={{ fontFamily: 'var(--font-playfair)' }}>
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-1 max-w-4xl text-[14px] text-slate-600">{item.excerpt}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-slate-600 transition group-hover:text-slate-950 sm:justify-end">
                    {t.read}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border-b border-slate-300 py-10">
              <p className="text-[17px] text-slate-600">{t.empty}</p>
              <button onClick={() => setActiveFilter('all')} className="mt-4 text-[15px] font-semibold text-indigo-700">
                {t.emptyCta} →
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-slate-300 bg-[#F4F1EA]">
        <div className="mx-auto flex w-[calc(100%_-_32px)] max-w-[1800px] flex-col gap-5 py-9 sm:w-[calc(100%_-_48px)] md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[30px] leading-tight text-slate-950 sm:text-[34px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.finalTitle}</h2>
            <p className="mt-2 max-w-3xl text-[16px] leading-7 text-slate-700">{t.finalBody}</p>
          </div>
          <Link href="/contact?intent=discovery" className="inline-flex shrink-0 items-center gap-2 bg-slate-950 px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-slate-800">
            {t.contact}<ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
