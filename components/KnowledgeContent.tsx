'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from './LanguageProvider'
import { translations } from '@/lib/translations'
import type { Article } from '@/lib/content'

// ── Taxonomy (mirrors content/editorial/taxonomy.md) ─────────────────────────

const INDUSTRIES = [
  'Retail', 'E-commerce', 'Manufacturing', 'Logistics', 'Financial Services',
  'Banking', 'Insurance', 'Real Estate', 'Healthcare', 'Pharmaceutical',
  'Energy', 'Utilities', 'Telecommunications', 'Professional Services', 'SaaS',
  'Technology', 'Hospitality', 'Food & Beverage', 'Distribution',
  'Transportation', 'Public Sector',
]

const CHALLENGES = [
  'Forecasting', 'Planning', 'Optimization', 'Resource Allocation', 'Pricing',
  'Risk Management', 'Customer Analytics', 'Operations', 'Automation',
  'Decision Systems', 'Inventory Management', 'Supply Chain', 'Fraud Detection',
  'Performance Management', 'Business Intelligence', 'Data Quality',
  'Compliance', 'Growth Strategy',
]

const AUDIENCES = [
  'CEO', 'COO', 'CFO', 'CTO', 'CIO', 'CDO',
  'Operations Director', 'Supply Chain Director', 'Finance Director',
  'Commercial Director', 'Analytics Manager', 'Data Scientist',
  'Data Analyst', 'Planning Manager', 'Risk Manager',
]

// Spanish translations (values identical or similar in both languages are omitted)
const INDUSTRY_ES: Record<string, string> = {
  'Manufacturing': 'Manufactura',
  'Logistics': 'Logística',
  'Financial Services': 'Servicios Financieros',
  'Banking': 'Banca',
  'Insurance': 'Seguros',
  'Real Estate': 'Inmobiliario',
  'Healthcare': 'Sanidad',
  'Pharmaceutical': 'Farmacéutica',
  'Energy': 'Energía',
  'Telecommunications': 'Telecomunicaciones',
  'Professional Services': 'Servicios Profesionales',
  'Technology': 'Tecnología',
  'Hospitality': 'Hostelería',
  'Food & Beverage': 'Alimentación y Bebidas',
  'Distribution': 'Distribución',
  'Transportation': 'Transporte',
  'Public Sector': 'Sector Público',
}

const CHALLENGE_ES: Record<string, string> = {
  'Planning': 'Planificación',
  'Optimization': 'Optimización',
  'Resource Allocation': 'Asignación de Recursos',
  'Pricing': 'Precios',
  'Risk Management': 'Gestión del Riesgo',
  'Customer Analytics': 'Analítica de Clientes',
  'Operations': 'Operaciones',
  'Automation': 'Automatización',
  'Decision Systems': 'Sistemas de Decisión',
  'Inventory Management': 'Gestión de Inventario',
  'Supply Chain': 'Cadena de Suministro',
  'Fraud Detection': 'Detección de Fraude',
  'Performance Management': 'Gestión del Rendimiento',
  'Data Quality': 'Calidad de Datos',
  'Compliance': 'Cumplimiento Normativo',
  'Growth Strategy': 'Estrategia de Crecimiento',
}

const AUDIENCE_ES: Record<string, string> = {
  'Operations Director': 'Director de Operaciones',
  'Supply Chain Director': 'Director de Supply Chain',
  'Finance Director': 'Director Financiero',
  'Commercial Director': 'Director Comercial',
  'Analytics Manager': 'Director de Analítica',
  'Data Analyst': 'Analista de Datos',
  'Planning Manager': 'Director de Planificación',
  'Risk Manager': 'Director de Riesgos',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function tr(en: string, map: Record<string, string>, lang: string): string {
  return lang === 'en' ? en : (map[en] ?? en)
}

// ── Dropdown filter ───────────────────────────────────────────────────────────

function FilterSelect({
  label, options, value, onChange, lang, map,
}: {
  label: string
  options: string[]
  value: string | null
  onChange: (v: string | null) => void
  lang: string
  map: Record<string, string>
}) {
  return (
    <div className="relative flex-1 min-w-[180px]">
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className={`w-full appearance-none border px-4 py-2.5 pr-9 text-sm font-medium transition focus:outline-none focus:border-slate-900 cursor-pointer bg-white ${
          value
            ? 'border-slate-900 text-slate-900'
            : 'border-slate-300 text-slate-500'
        }`}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {tr(opt, map, lang)}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}

// ── Article card (horizontal) ─────────────────────────────────────────────────

function ArticleCard({ article, lang, tc }: {
  article: Article
  lang: string
  tc: { readMore: string; minRead: string; [key: string]: string }
}) {
  const title = lang === 'en' ? article.titleEn : article.titleEs
  const excerpt = lang === 'en' ? article.excerptEn : article.excerptEs

  return (
    <Link
      href={`/knowledge/${article.slug}`}
      className="group flex gap-6 border-b border-slate-200 py-8 last:border-0 hover:bg-slate-50/50 transition-colors px-1 -mx-1"
    >
      {/* Brand visual — hidden on mobile */}
      <div className="hidden md:flex w-28 flex-shrink-0 items-center justify-center rounded bg-slate-900 px-4 py-5 self-start mt-1">
        <Image
          src="/brand/logo-horizontal-transparent.png"
          alt="SC-Analytics"
          width={120}
          height={40}
          className="w-full h-auto opacity-70"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
            {tr(article.industry, INDUSTRY_ES, lang)}
          </span>
          <span className="text-slate-300 text-xs" aria-hidden="true">·</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
            {tr(article.challenge, CHALLENGE_ES, lang)}
          </span>
          <span className="text-slate-300 text-xs" aria-hidden="true">·</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
            {tr(article.audience, AUDIENCE_ES, lang)}
          </span>
        </div>

        {/* Title */}
        <h2
          className="text-xl leading-snug text-slate-900 group-hover:text-indigo-700 transition"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {title}
        </h2>

        {/* Excerpt */}
        <p className="mt-2 text-sm leading-7 text-slate-600 line-clamp-2">{excerpt}</p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{article.date}</span>
            <span aria-hidden="true">·</span>
            <span>{article.readingTime} {tc.minRead}</span>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 group-hover:gap-2.5 transition-all">
            {tc.readMore}
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 4

export default function KnowledgeContent({ articles }: { articles: Article[] }) {
  const { lang } = useLanguage()
  const tc = translations[lang].common
  const [industry, setIndustry] = useState<string | null>(null)
  const [challenge, setChallenge] = useState<string | null>(null)
  const [audience, setAudience] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const hasFilters = industry !== null || challenge !== null || audience !== null

  // Reset pagination whenever a filter changes
  const setIndustryAndReset = (v: string | null) => { setIndustry(v); setVisibleCount(PAGE_SIZE) }
  const setChallengeAndReset = (v: string | null) => { setChallenge(v); setVisibleCount(PAGE_SIZE) }
  const setAudienceAndReset = (v: string | null) => { setAudience(v); setVisibleCount(PAGE_SIZE) }
  const clearAll = () => { setIndustry(null); setChallenge(null); setAudience(null); setVisibleCount(PAGE_SIZE) }

  const filtered = articles.filter((a) => {
    if (industry && a.industry !== industry) return false
    if (challenge && a.challenge !== challenge) return false
    if (audience && a.audience !== audience) return false
    return true
  })

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const emptyTitle = lang === 'en'
    ? 'No articles available for this selection.'
    : 'No hay artículos disponibles para esta selección.'
  const emptyBody = lang === 'en'
    ? 'We are expanding our knowledge base in this area. New content will be published soon.'
    : 'Estamos ampliando nuestra base de conocimiento en esta área. Nuevo contenido se publicará próximamente.'

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">

      {/* Filter bar */}
      <div className="mb-10 border border-slate-200 bg-white">
        <div className="flex flex-wrap items-stretch gap-px bg-slate-200">
          <FilterSelect
            label={lang === 'en' ? 'Industry' : 'Industria'}
            options={INDUSTRIES}
            value={industry}
            onChange={setIndustryAndReset}
            lang={lang}
            map={INDUSTRY_ES}
          />
          <FilterSelect
            label={lang === 'en' ? 'Challenge' : 'Reto'}
            options={CHALLENGES}
            value={challenge}
            onChange={setChallengeAndReset}
            lang={lang}
            map={CHALLENGE_ES}
          />
          <FilterSelect
            label={lang === 'en' ? 'Audience' : 'Audiencia'}
            options={AUDIENCES}
            value={audience}
            onChange={setAudienceAndReset}
            lang={lang}
            map={AUDIENCE_ES}
          />
          {hasFilters && (
            <button
              onClick={clearAll}
              className="px-5 py-2.5 text-xs font-medium text-slate-500 bg-white hover:bg-slate-50 hover:text-slate-900 transition whitespace-nowrap border-l border-slate-200"
            >
              {lang === 'en' ? 'Clear' : 'Limpiar'}
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
          <p className="text-[11px] text-slate-400">
            {lang === 'en'
              ? `${filtered.length} ${filtered.length === 1 ? 'article' : 'articles'}${hasFilters ? ` — filtered from ${articles.length}` : ''}`
              : `${filtered.length} ${filtered.length === 1 ? 'artículo' : 'artículos'}${hasFilters ? ` — filtrado de ${articles.length}` : ''}`
            }
          </p>
        </div>
      </div>

      {/* Article list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-slate-200 bg-white">
          <div className="mb-5 flex h-12 w-12 items-center justify-center border border-slate-200 bg-slate-50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="#94a3b8" strokeWidth="1.5"/>
              <path d="M16.5 16.5L21 21" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700">{emptyTitle}</p>
          <p className="mt-2 max-w-sm text-xs leading-6 text-slate-400">{emptyBody}</p>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="mt-5 text-xs font-medium text-indigo-600 hover:underline"
            >
              {lang === 'en' ? 'Clear filters' : 'Limpiar filtros'}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="border border-slate-200 bg-white px-8">
            {visible.map((article) => (
              <ArticleCard key={article.slug} article={article} lang={lang} tc={tc} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="border border-slate-300 bg-white px-8 py-3 text-sm font-medium text-slate-700 hover:border-slate-900 hover:text-slate-900 transition"
              >
                {lang === 'en'
                  ? `Load more — ${filtered.length - visibleCount} remaining`
                  : `Cargar más — ${filtered.length - visibleCount} restantes`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
