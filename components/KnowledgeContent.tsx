'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from './LanguageProvider'
import { translations } from '@/lib/translations'
import type { Article } from '@/lib/content'

// ── Filter definitions ────────────────────────────────────────────────────────

const INDUSTRIES = ['Retail', 'E-commerce', 'Logistics', 'Manufacturing', 'Finance', 'Real Estate']
const CHALLENGES = [
  'Forecasting', 'Inventory Management', 'Resource Allocation',
  'Pricing', 'Route Planning', 'Automation', 'Fraud Detection', 'Decision Making',
]
const AUDIENCES = ['CEO', 'Operations', 'Finance', 'Analytics']

const INDUSTRY_ES: Record<string, string> = {
  'Retail': 'Retail', 'E-commerce': 'E-commerce', 'Logistics': 'Logística',
  'Manufacturing': 'Manufactura', 'Finance': 'Finanzas', 'Real Estate': 'Inmobiliario',
}
const CHALLENGE_ES: Record<string, string> = {
  'Forecasting': 'Forecasting', 'Inventory Management': 'Gestión de Inventario',
  'Resource Allocation': 'Asignación de Recursos', 'Pricing': 'Precios',
  'Route Planning': 'Planificación de Rutas', 'Automation': 'Automatización',
  'Fraud Detection': 'Detección de Fraude', 'Decision Making': 'Toma de Decisiones',
}
const AUDIENCE_ES: Record<string, string> = {
  'CEO': 'CEO', 'Operations': 'Operaciones', 'Finance': 'Finanzas', 'Analytics': 'Analítica',
}

// ── Filter pill component ─────────────────────────────────────────────────────

function FilterPill({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
        active
          ? 'bg-slate-900 text-white shadow-sm'
          : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-800'
      }`}
    >
      {label}
    </button>
  )
}

// ── Filter row component ──────────────────────────────────────────────────────

function FilterRow({
  label, options, selected, onSelect, allLabel,
}: {
  label: string
  options: string[]
  selected: string | null
  onSelect: (v: string | null) => void
  allLabel: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 w-20 flex-shrink-0">
        {label}
      </span>
      <FilterPill label={allLabel} active={selected === null} onClick={() => onSelect(null)} />
      {options.map((opt) => (
        <FilterPill
          key={opt}
          label={opt}
          active={selected === opt}
          onClick={() => onSelect(selected === opt ? null : opt)}
        />
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function KnowledgeContent({ articles }: { articles: Article[] }) {
  const { lang } = useLanguage()
  const tc = translations[lang].common
  const [industry, setIndustry] = useState<string | null>(null)
  const [challenge, setChallenge] = useState<string | null>(null)
  const [audience, setAudience] = useState<string | null>(null)

  const allLabel = lang === 'en' ? 'All' : 'Todos'
  const emptyTitle = lang === 'en' ? 'No articles available yet.' : 'No hay artículos disponibles aún.'
  const emptyBody = lang === 'en'
    ? 'We are currently expanding our knowledge base in this area. New content will be published soon.'
    : 'Estamos ampliando nuestra base de conocimiento en esta área. Nuevo contenido se publicará próximamente.'

  const filtered = articles.filter((a) => {
    if (industry && a.industry !== industry) return false
    if (challenge && a.challenge !== challenge) return false
    if (audience && a.audience !== audience) return false
    return true
  })

  const localise = (en: string, map: Record<string, string>) =>
    lang === 'en' ? en : (map[en] ?? en)

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">

      {/* Filter panel */}
      <div className="mb-12 space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <FilterRow
          label={lang === 'en' ? 'Industry' : 'Industria'}
          options={INDUSTRIES.map(i => localise(i, INDUSTRY_ES))}
          selected={industry ? localise(industry, INDUSTRY_ES) : null}
          onSelect={(v) => setIndustry(v ? INDUSTRIES.find(i => localise(i, INDUSTRY_ES) === v) ?? null : null)}
          allLabel={allLabel}
        />
        <div className="border-t border-slate-100" />
        <FilterRow
          label={lang === 'en' ? 'Challenge' : 'Reto'}
          options={CHALLENGES.map(c => localise(c, CHALLENGE_ES))}
          selected={challenge ? localise(challenge, CHALLENGE_ES) : null}
          onSelect={(v) => setChallenge(v ? CHALLENGES.find(c => localise(c, CHALLENGE_ES) === v) ?? null : null)}
          allLabel={allLabel}
        />
        <div className="border-t border-slate-100" />
        <FilterRow
          label={lang === 'en' ? 'Audience' : 'Audiencia'}
          options={AUDIENCES.map(a => localise(a, AUDIENCE_ES))}
          selected={audience ? localise(audience, AUDIENCE_ES) : null}
          onSelect={(v) => setAudience(v ? AUDIENCES.find(a => localise(a, AUDIENCE_ES) === v) ?? null : null)}
          allLabel={allLabel}
        />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="#94a3b8" strokeWidth="1.5"/>
              <path d="M16.5 16.5L21 21" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M11 8v3M11 14h.01" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700">{emptyTitle}</p>
          <p className="mt-2 max-w-sm text-xs leading-6 text-slate-400">{emptyBody}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((article) => {
            const title = lang === 'en' ? article.titleEn : article.titleEs
            const excerpt = lang === 'en' ? article.excerptEn : article.excerptEs

            return (
              <Link
                key={article.slug}
                href={`/knowledge/${article.slug}`}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm card-lift"
              >
                {/* Meta chips */}
                <div className="mb-5 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-medium text-white">
                    {localise(article.industry, INDUSTRY_ES)}
                  </span>
                  <span className="rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-[10px] font-medium text-indigo-700">
                    {localise(article.challenge, CHALLENGE_ES)}
                  </span>
                  <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                    {localise(article.audience, AUDIENCE_ES)}
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
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600 line-clamp-3">{excerpt}</p>

                {/* Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{article.date}</span>
                    <span className="text-slate-200" aria-hidden="true">·</span>
                    <span className="text-xs text-slate-400">{article.readingTime} {tc.minRead}</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 transition-all group-hover:gap-2.5">
                    {tc.readMore}
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
