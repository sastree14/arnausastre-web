'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import type { Article } from '@/lib/content'
import type { PublicGeneratedArticle } from '@/lib/public-growth'

const UI = {
  en: {
    filters: 'EXPLORE BY CONTEXT',
    industry: 'Industry',
    challenge: 'Challenge',
    audience: 'Audience',
    all: 'All',
    clear: 'Clear filters',
    article: 'analysis',
    articles: 'analyses',
    read: 'Read analysis',
    min: 'min read',
    empty: 'Nothing published for this combination yet.',
    emptyBody: 'The editorial system is selective. Clear a filter or explore another context.',
    libraryEmpty: 'The knowledge library is being prepared.',
    libraryEmptyBody: 'We are structuring the first analyses so this area starts with useful material rather than filler. In the meantime, you can explore real cases or see how we work.',
    cases: 'Explore case studies',
    work: 'See how we work',
    contact: 'Talk to us',
    more: 'Load more',
    generated: 'SC-Analytics editorial',
  },
  es: {
    filters: 'EXPLORA POR CONTEXTO',
    industry: 'Industria',
    challenge: 'Reto',
    audience: 'Audiencia',
    all: 'Todos',
    clear: 'Limpiar filtros',
    article: 'análisis',
    articles: 'análisis',
    read: 'Leer análisis',
    min: 'min de lectura',
    empty: 'Todavía no hay nada publicado para esta combinación.',
    emptyBody: 'El sistema editorial es selectivo. Limpia un filtro o explora otro contexto.',
    libraryEmpty: 'Estamos preparando la biblioteca de conocimiento.',
    libraryEmptyBody: 'Estamos estructurando los primeros análisis para que esta sección empiece con contenido útil y no con relleno. Mientras tanto, puedes explorar casos reales o ver cómo trabajamos.',
    cases: 'Explorar casos',
    work: 'Ver cómo trabajamos',
    contact: 'Hablar con nosotros',
    more: 'Cargar más',
    generated: 'Editorial SC-Analytics',
  },
  ca: {
    filters: 'EXPLORA PER CONTEXT',
    industry: 'Indústria',
    challenge: 'Repte',
    audience: 'Audiència',
    all: 'Tots',
    clear: 'Netejar filtres',
    article: 'anàlisi',
    articles: 'anàlisis',
    read: 'Llegir anàlisi',
    min: 'min de lectura',
    empty: 'Encara no hi ha res publicat per a aquesta combinació.',
    emptyBody: 'El sistema editorial és selectiu. Neteja un filtre o explora un altre context.',
    libraryEmpty: 'Estem preparant la biblioteca de coneixement.',
    libraryEmptyBody: 'Estem estructurant les primeres anàlisis perquè aquesta secció comenci amb contingut útil i no amb farciment. Mentrestant, pots explorar casos reals o veure com treballem.',
    cases: 'Explorar casos',
    work: 'Veure com treballem',
    contact: 'Parlar amb nosaltres',
    more: 'Carregar més',
    generated: 'Editorial SC-Analytics',
  },
} as const

const ES: Record<string, string> = {
  Manufacturing: 'Manufactura',
  Logistics: 'Logística',
  'Financial Services': 'Servicios financieros',
  Banking: 'Banca',
  Insurance: 'Seguros',
  'Real Estate': 'Inmobiliario',
  Healthcare: 'Sanidad',
  Pharmaceutical: 'Farmacéutica',
  Energy: 'Energía',
  Telecommunications: 'Telecomunicaciones',
  'Professional Services': 'Servicios profesionales',
  Technology: 'Tecnología',
  Hospitality: 'Hostelería',
  'Food & Beverage': 'Alimentación y bebidas',
  Distribution: 'Distribución',
  Transportation: 'Transporte',
  'Public Sector': 'Sector público',
  Planning: 'Planificación',
  Optimization: 'Optimización',
  'Resource Allocation': 'Asignación de recursos',
  Pricing: 'Precios',
  'Risk Management': 'Gestión del riesgo',
  'Customer Analytics': 'Analítica de clientes',
  Operations: 'Operaciones',
  Automation: 'Automatización',
  'Decision Systems': 'Sistemas de decisión',
  'Inventory Management': 'Gestión de inventario',
  'Supply Chain': 'Cadena de suministro',
  'Fraud Detection': 'Detección de fraude',
  'Performance Management': 'Gestión del rendimiento',
  'Data Quality': 'Calidad de datos',
  Compliance: 'Cumplimiento',
  'Growth Strategy': 'Estrategia de crecimiento',
  'Operations Director': 'Director de Operaciones',
  'Supply Chain Director': 'Director de Supply Chain',
  'Finance Director': 'Director Financiero',
  'Commercial Director': 'Director Comercial',
  'Analytics Manager': 'Responsable de Analítica',
  'Data Analyst': 'Analista de Datos',
  'Planning Manager': 'Responsable de Planificación',
  'Risk Manager': 'Responsable de Riesgos',
}

const CA: Record<string, string> = {
  Manufacturing: 'Manufactura',
  Logistics: 'Logística',
  'Financial Services': 'Serveis financers',
  Banking: 'Banca',
  Insurance: 'Assegurances',
  'Real Estate': 'Immobiliari',
  Healthcare: 'Salut',
  Pharmaceutical: 'Farmacèutica',
  Energy: 'Energia',
  Telecommunications: 'Telecomunicacions',
  'Professional Services': 'Serveis professionals',
  Technology: 'Tecnologia',
  Hospitality: 'Hostaleria',
  'Food & Beverage': 'Alimentació i begudes',
  Distribution: 'Distribució',
  Transportation: 'Transport',
  'Public Sector': 'Sector públic',
  Planning: 'Planificació',
  Optimization: 'Optimització',
  'Resource Allocation': 'Assignació de recursos',
  Pricing: 'Preus',
  'Risk Management': 'Gestió del risc',
  'Customer Analytics': 'Analítica de clients',
  Operations: 'Operacions',
  Automation: 'Automatització',
  'Decision Systems': 'Sistemes de decisió',
  'Inventory Management': 'Gestió d’inventari',
  'Supply Chain': 'Cadena de subministrament',
  'Fraud Detection': 'Detecció de frau',
  'Performance Management': 'Gestió del rendiment',
  'Data Quality': 'Qualitat de dades',
  Compliance: 'Compliment',
  'Growth Strategy': 'Estratègia de creixement',
  'Operations Director': 'Director d’Operacions',
  'Supply Chain Director': 'Director de Supply Chain',
  'Finance Director': 'Director Financer',
  'Commercial Director': 'Director Comercial',
  'Analytics Manager': 'Responsable d’Analítica',
  'Data Analyst': 'Analista de Dades',
  'Planning Manager': 'Responsable de Planificació',
  'Risk Manager': 'Responsable de Riscos',
}

function label(value: string, lang: 'en' | 'es' | 'ca') {
  return lang === 'en' ? value : (lang === 'ca' ? CA[value] : ES[value]) || value
}

function Filter({
  title,
  options,
  value,
  onChange,
  lang,
  all,
}: {
  title: string
  options: string[]
  value: string | null
  onChange: (value: string | null) => void
  lang: 'en' | 'es' | 'ca'
  all: string
}) {
  return (
    <label className="min-w-[180px] flex-1">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</span>
      <select
        value={value || ''}
        onChange={(event) => onChange(event.target.value || null)}
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
      >
        <option value="">{all}</option>
        {options.map((option) => <option key={option} value={option}>{label(option, lang)}</option>)}
      </select>
    </label>
  )
}

const PAGE_SIZE = 8

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
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 280)
}

type Props = { articles: Article[]; generated?: PublicGeneratedArticle[] }

export default function KnowledgeContent({ articles, generated = [] }: Props) {
  const { lang } = useSiteLanguage()
  const t = UI[lang]
  const [industry, setIndustry] = useState<string | null>(null)
  const [challenge, setChallenge] = useState<string | null>(null)
  const [audience, setAudience] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const hasFilters = Boolean(industry || challenge || audience)
  const reset = () => setVisibleCount(PAGE_SIZE)
  const contentLanguage = lang

  const generatedGroups = useMemo(() => {
    const groups = new Map<string, PublicGeneratedArticle[]>()
    generated.forEach((article) => {
      const key = article.brief_id || article.content_id
      groups.set(key, [...(groups.get(key) || []), article])
    })
    return [...groups.entries()]
  }, [generated])

  const items = useMemo(() => {
    const staticItems = articles.map((article) => ({
      key: `static:${article.slug}`,
      href: `/knowledge/${article.slug}/${lang}`,
      title: contentLanguage === 'en' ? article.titleEn : contentLanguage === 'ca' ? (article.titleCa || article.titleEs) : article.titleEs,
      excerpt: contentLanguage === 'en' ? article.excerptEn : contentLanguage === 'ca' ? (article.excerptCa || article.excerptEs) : article.excerptEs,
      industry: article.industry,
      challenge: article.challenge,
      audience: article.audience,
      date: article.date,
      readingTime: article.readingTime,
      generated: false,
      family: '',
      language: contentLanguage,
    }))

    const generatedItems = generatedGroups.map(([key, variants]) => {
      const item = chooseGeneratedVariant(variants, lang)
      const published = item?.published_at || item?.created_at || ''
      const locale = lang === 'ca' ? 'ca-ES' : lang === 'es' ? 'es-ES' : 'en-GB'
      return item ? {
        key: `generated:${key}`,
        href: `/knowledge/${key}/${lang}`,
        title: item.title,
        excerpt: compactExcerpt(item.body),
        industry: item.industry || '',
        challenge: item.challenge || item.topic || '',
        audience: item.audience || '',
        date: published ? new Date(published).toLocaleDateString(locale) : '',
        readingTime: Math.max(3, Math.ceil(item.body.split(/\s+/).filter(Boolean).length / 220)),
        generated: true,
        family: item.content_family || 'insight',
        language: item.language || lang,
      } : null
    }).filter(Boolean) as Array<{
      key: string
      href: string
      title: string
      excerpt: string
      industry: string
      challenge: string
      audience: string
      date: string
      readingTime: number
      generated: boolean
      family: string
      language: string
    }>

    return [...generatedItems, ...staticItems]
  }, [articles, contentLanguage, generatedGroups, lang])

  const availableIndustries = useMemo(() => [...new Set(items.map((item) => item.industry).filter(Boolean))].sort(), [items])
  const availableChallenges = useMemo(() => [...new Set(items.map((item) => item.challenge).filter(Boolean))].sort(), [items])
  const availableAudiences = useMemo(() => [...new Set(items.map((item) => item.audience).filter(Boolean))].sort(), [items])

  const filtered = items.filter((item) =>
    (!industry || item.industry === industry)
    && (!challenge || item.challenge === challenge)
    && (!audience || item.audience === audience)
  )
  const visible = filtered.slice(0, visibleCount)

  const clearFilters = () => {
    setIndustry(null)
    setChallenge(null)
    setAudience(null)
    reset()
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid border border-slate-300 bg-white lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-7 md:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">SC-ANALYTICS KNOWLEDGE</p>
            <h2 className="mt-4 max-w-2xl text-[32px] leading-[1.08] text-slate-950 sm:text-[38px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.libraryEmpty}</h2>
            <p className="mt-4 max-w-2xl text-[14px] leading-7 text-slate-600">{t.libraryEmptyBody}</p>
          </div>
          <div className="border-t border-slate-300 bg-[#F4F1EA] p-7 lg:border-l lg:border-t-0 md:p-10">
            <div className="grid gap-3">
              <Link href="/projects" className="flex items-center justify-between border-b border-slate-300 py-3 text-[13px] font-semibold text-slate-900">{t.cases}<span>→</span></Link>
              <Link href="/services" className="flex items-center justify-between border-b border-slate-300 py-3 text-[13px] font-semibold text-slate-900">{t.work}<span>→</span></Link>
              <Link href="/contact?intent=discovery" className="flex items-center justify-between py-3 text-[13px] font-semibold text-indigo-700">{t.contact}<span>→</span></Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600">{t.filters}</p>
            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <Filter title={t.industry} options={availableIndustries} value={industry} onChange={(value) => { setIndustry(value); reset() }} lang={lang} all={t.all} />
              <Filter title={t.challenge} options={availableChallenges} value={challenge} onChange={(value) => { setChallenge(value); reset() }} lang={lang} all={t.all} />
              <Filter title={t.audience} options={availableAudiences} value={audience} onChange={(value) => { setAudience(value); reset() }} lang={lang} all={t.all} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-5 lg:flex-col lg:items-end">
            <p className="text-xs text-slate-400">{filtered.length} {filtered.length === 1 ? t.article : t.articles}</p>
            {hasFilters && <button onClick={clearFilters} className="text-xs font-semibold text-indigo-700 transition hover:text-indigo-900">{t.clear} ×</button>}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="font-semibold text-slate-800">{t.empty}</p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">{t.emptyBody}</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {visible.map((item, index) => (
            <Link
              key={item.key}
              href={item.href}
              className={`group flex min-h-[300px] flex-col rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-950/[0.04] ${
                index === 0 && visible.length > 2 ? 'md:col-span-2 md:min-h-[260px]' : ''
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em]">
                <span className="text-indigo-700">{item.industry ? label(item.industry, lang) : t.generated}</span>
                {item.challenge && <><span className="text-slate-300">·</span><span className="text-slate-400">{label(item.challenge, lang)}</span></>}
                {item.audience && <><span className="text-slate-300">·</span><span className="text-slate-400">{label(item.audience, lang)}</span></>}
              </div>

              <h2 className={`mt-5 max-w-4xl leading-tight text-slate-950 transition group-hover:text-indigo-800 ${
                index === 0 && visible.length > 2 ? 'text-3xl md:text-4xl' : 'text-2xl'
              }`} style={{ fontFamily: 'var(--font-playfair)' }}>
                {item.title}
              </h2>

              <p className="mt-4 max-w-3xl flex-1 text-sm leading-7 text-slate-600">{item.excerpt}</p>

              <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                <span className="text-slate-400">{item.date}{item.date ? ' · ' : ''}{item.readingTime} {t.min}</span>
                <span className="font-semibold text-indigo-700">{t.read} <span className="inline-block transition group-hover:translate-x-1">→</span></span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {visibleCount < filtered.length && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisibleCount((value) => value + PAGE_SIZE)}
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-500"
          >
            {t.more} · {filtered.length - visibleCount}
          </button>
        </div>
      )}
    </section>
  )
}
