'use client'

import { useEffect, useMemo, useState } from 'react'
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
  areas: KnowledgeArea[]
}

const FEATURED_SLUGS = [
  'why-inventory-visibility-is-not-inventory-control-and-what-that-costs',
  'why-operational-supplier-risk-outstrips-financial-risk-and-what-it-costs',
  'cuando-la-fijacion-dinamica-de-precios-crea-mas-problemas-que-soluciones',
]

const STATIC_AREAS: Record<string, KnowledgeArea[]> = {
  'why-inventory-visibility-is-not-inventory-control-and-what-that-costs': ['operations', 'planning', 'analytics'],
  'why-operational-supplier-risk-outstrips-financial-risk-and-what-it-costs': ['risk_decision', 'operations'],
  'cuando-la-fijacion-dinamica-de-precios-crea-mas-problemas-que-soluciones': ['analytics', 'finance', 'risk_decision'],
  'why-hiring-faster-obscures-deeper-healthcare-capacity-problems': ['planning', 'operations'],
  'why-professional-services-firms-misdiagnose-capacity-problems': ['planning', 'operations'],
}

const COPY = {
  es: {
    featuredLabel: 'ARTÍCULOS DESTACADOS',
    featuredTitle: 'Tres ideas para empezar.',
    read: 'Descubrir análisis',
    filterLabel: 'EXPLORA POR ÁREA',
    count: 'análisis',
    library: 'TODOS LOS ANÁLISIS',
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
    empty: 'Todavía no hay análisis publicados en esta área.',
    emptyCta: 'Explorar todo',
    finalLabel: '¿TIENES ALGO CONCRETO EN MENTE?',
    finalTitle: 'Comparte tu caso.',
    finalBody: 'Si hay una decisión, un problema o una oportunidad que merece una segunda mirada, empecemos por ahí.',
    contact: 'Contacta con nosotros',
  },
  ca: {
    featuredLabel: 'ARTICLES DESTACATS',
    featuredTitle: 'Tres idees per començar.',
    read: 'Descobrir anàlisi',
    filterLabel: 'EXPLORA PER ÀREA',
    count: 'anàlisis',
    library: 'TOTES LES ANÀLISIS',
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
    empty: 'Encara no hi ha anàlisis publicades en aquesta àrea.',
    emptyCta: 'Explorar-ho tot',
    finalLabel: 'TENS ALGUNA COSA CONCRETA EN MENT?',
    finalTitle: 'Comparteix el teu cas.',
    finalBody: 'Si hi ha una decisió, un problema o una oportunitat que mereix una segona mirada, comencem per aquí.',
    contact: 'Contacta amb nosaltres',
  },
  en: {
    featuredLabel: 'FEATURED ARTICLES',
    featuredTitle: 'Three ideas to start with.',
    read: 'Explore analysis',
    filterLabel: 'EXPLORE BY AREA',
    count: 'analyses',
    library: 'ALL ANALYSES',
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
    empty: 'No analysis has been published in this area yet.',
    emptyCta: 'Explore all',
    finalLabel: 'HAVE SOMETHING SPECIFIC IN MIND?',
    finalTitle: 'Share your case.',
    finalBody: 'If there is a decision, problem or opportunity worth a second look, start there.',
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

function generatedMeta(item: PublicGeneratedArticle) {
  const critique = item.critique && typeof item.critique === 'object' ? item.critique : {}
  const raw = (critique as Record<string, unknown>).article_meta
  return raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
}

function generatedAreas(item: PublicGeneratedArticle): KnowledgeArea[] {
  const meta = generatedMeta(item)
  const explicit = String(meta.knowledge_area || '') as KnowledgeArea
  if (FILTER_ORDER.includes(explicit) && explicit !== 'all') return [explicit]

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
    .slice(0, 170)
}

export default function KnowledgeContent({ articles, generated = [] }: { articles: Article[]; generated?: PublicGeneratedArticle[] }) {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]
  const [activeFilter, setActiveFilter] = useState<KnowledgeArea>('all')

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('area') as KnowledgeArea | null
    if (!requested || !FILTER_ORDER.includes(requested)) return

    const timer = window.setTimeout(() => setActiveFilter(requested), 0)
    return () => window.clearTimeout(timer)
  }, [])

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
      href: `/knowledge/${article.slug}/${lang}`,
      title: lang === 'en' ? article.titleEn : lang === 'ca' ? (article.titleCa || article.titleEs) : article.titleEs,
      excerpt: lang === 'en' ? article.excerptEn : lang === 'ca' ? (article.excerptCa || article.excerptEs) : article.excerptEs,
      areas: STATIC_AREAS[article.slug] || ['analytics'],
    }))

    const generatedItems = generatedGroups.flatMap(([key, variants]) => {
      const item = chooseGeneratedVariant(variants, lang)
      if (!item) return []
      return [{
        key,
        href: `/knowledge/${key}/${lang}`,
        title: item.title,
        excerpt: String(generatedMeta(item).excerpt || compactExcerpt(item.body)),
        areas: generatedAreas(item),
      }]
    })

    return [...staticItems, ...generatedItems]
  }, [articles, generatedGroups, lang])

  const featuredItems = FEATURED_SLUGS
    .map((slug) => items.find((item) => item.key === slug))
    .filter((item): item is KnowledgeItem => Boolean(item))

  const filtered = activeFilter === 'all'
    ? items
    : items.filter((item) => item.areas.includes(activeFilter))

  if (!items.length) return null

  return (
    <>
      <section className="border-b border-slate-300 bg-white">
        <div className="site-container py-9 lg:py-11">
          <div className="mx-auto max-w-[760px] border-y border-slate-300 py-6 text-center">
            <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[#4F46E5]">{t.featuredLabel}</p>
            <h2 className="mt-3 text-[34px] leading-tight text-slate-950 sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.featuredTitle}</h2>
          </div>

          <div className="mt-7 grid border-l border-t border-slate-300 lg:grid-cols-3">
            {featuredItems.map((item, index) => {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`group flex min-h-[215px] flex-col border-b border-r border-slate-300 p-6 transition ${
                    index === 1 ? 'bg-[#F4F1EA] hover:bg-[#F4F1EA]' : index === 2 ? 'bg-[#EAF0F6] hover:bg-[#E5EDF3]' : 'bg-white hover:bg-[#FAFAF7]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-mono text-[14px] font-semibold text-[#4F46E5]">0{index + 1}</span>
                    <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                  </div>
                  <h3 className="mt-6 max-w-[24ch] flex-1 text-[27px] leading-[1.06] text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{item.title}</h3>
                  <p className="mt-7 text-[16px] font-semibold text-[#4F46E5]">{t.read} →</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="site-container py-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t.filterLabel}</p>
            <p className="font-mono text-[14px] text-slate-500">{String(filtered.length).padStart(2, '0')} {t.count}</p>
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
                  className={`flex min-h-[66px] items-center justify-center border-b border-r px-4 py-3 text-center text-[14px] font-medium leading-[1.2] transition-colors ${
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

      <section className="site-container py-8 lg:py-10">
        <div className="flex items-center justify-between border-b border-slate-400 pb-3">
          <p className="text-[14px] font-semibold uppercase tracking-[0.15em] text-[#4F46E5]">{t.library}</p>
        </div>

        {filtered.length ? (
          <div className="grid border-l border-t border-slate-300 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item, index) => (
              <Link
                key={item.key}
                href={item.href}
                className={`group flex min-h-[190px] flex-col border-b border-r border-slate-300 p-6 transition ${
                  index % 2 === 0 ? 'bg-white hover:bg-[#FAFAF7]' : 'bg-[#F9F8F4] hover:bg-[#F4F1EA]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-[14px] text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                </div>
                <h3 className="mt-5 max-w-[26ch] text-[25px] leading-[1.08] text-slate-950 transition-colors group-hover:text-[#4F46E5]" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {item.title}
                </h3>
                <p className="mt-auto pt-7 text-[16px] font-semibold text-[#4F46E5]">{t.read} →</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border-b border-slate-300 py-10">
            <p className="text-[17px] text-slate-600">{t.empty}</p>
            <button onClick={() => setActiveFilter('all')} className="mt-4 text-[15px] font-semibold text-[#4F46E5]">{t.emptyCta} →</button>
          </div>
        )}
      </section>

      <section className="border-y border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="site-container grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:py-12">
          <div>
            <p className="text-[14px] font-semibold uppercase tracking-[0.15em] text-[#7A7DFF]">{t.finalLabel}</p>
            <h2 className="mt-3 max-w-4xl text-[36px] leading-[1.03] text-white sm:text-[44px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.finalTitle}</h2>
            <p className="mt-4 max-w-3xl text-[17px] leading-7 text-[#D5E1EB]">{t.finalBody}</p>
          </div>
          <Link href="/contact?intent=discovery" className="inline-flex shrink-0 items-center gap-3 bg-white px-7 py-4 text-[16px] font-semibold text-[#0D1B2A] transition hover:bg-[#EAF0F6]">
            {t.contact}<ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
