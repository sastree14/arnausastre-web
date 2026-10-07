'use client'

import { useState } from 'react'
import Link from 'next/link'
import ArticleText from '@/components/ArticleText'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import type { PublicGeneratedArticle } from '@/lib/public-growth'
import KnowledgeArticleSummary from '@/components/KnowledgeArticleSummary'
import KnowledgeArticleNext from '@/components/KnowledgeArticleNext'
import KnowledgeExperienceNote from '@/components/KnowledgeExperienceNote'
import { fallbackServiceForArticle, presentationForFamily, type KnowledgePresentationVariant, type KnowledgeServiceKey } from '@/lib/knowledge-editorial'

type Props = { variants: PublicGeneratedArticle[]; forcedLanguage?: 'es' | 'ca' | 'en' }

type Segment =
  | { type: 'intro'; paragraphs: string[] }
  | { type: 'section'; heading: string; paragraphs: string[] }

type ArticleMeta = {
  excerpt?: string
  quick?: string[]
  section_titles?: string[]
  business_title?: string
  business_steps?: string[]
  knowledge_area?: string
  related_case?: string
  related_article?: string
  related_article_title?: string
  related_articles?: Array<string | { href?: string; title?: string }>
  seo_title?: string
  seo_description?: string
  content_family?: string
  cluster?: string
  spec_id?: string
  presentation_variant?: KnowledgePresentationVariant
  summary_items?: string[]
  service_key?: KnowledgeServiceKey
  experience_note?: string
}

function selectVariant(variants: PublicGeneratedArticle[], lang: string) {
  return variants.find((item) => item.language === lang)
    || variants.find((item) => item.language === 'es')
    || variants.find((item) => item.language === 'en')
    || variants[0]
}

function metaFor(article: PublicGeneratedArticle): ArticleMeta {
  const critique = article.critique && typeof article.critique === 'object' ? article.critique : {}
  const raw = (critique as Record<string, unknown>).article_meta
  return raw && typeof raw === 'object' ? raw as ArticleMeta : {}
}


function splitReadableParagraph(text: string) {
  // Preserve author paragraph boundaries, URLs, lists and Markdown tables.
  const clean = text.trim()
  return clean ? [clean] : []
}

function parseBody(body: string): Segment[] {
  const lines = String(body || '').split(/\r?\n/)
  const segments: Segment[] = []
  let current: Segment = { type: 'intro', paragraphs: [] }
  let buffer: string[] = []

  const flushParagraph = () => {
    if (!buffer.length) return
    current.paragraphs.push(...splitReadableParagraph(buffer.join('\n')))
    buffer = []
  }
  const flushSegment = () => {
    flushParagraph()
    if (current.paragraphs.length) segments.push(current)
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      flushParagraph()
      continue
    }
    if (/^\*\*[^*]+\*\*$/.test(line) || /^#{2,3}\s+/.test(line)) {
      flushSegment()
      const heading = line.startsWith('#') ? line.replace(/^#{2,3}\s+/, '').trim() : line.slice(2, -2)
      current = { type: 'section', heading, paragraphs: [] }
      continue
    }
    buffer.push(line)
  }
  flushSegment()
  return segments
}

const COPY = {
  es: {
    back: 'Conocimiento',
    label: 'ANÁLISIS',
    quickLabel: 'EL ARTÍCULO EN 30 SEGUNDOS',
    quickTitle: 'Tres ideas para entender la tesis antes de entrar en detalle.',
    contents: 'EN ESTE ANÁLISIS',
    contentsTitle: 'De la idea a la decisión',
    introTitle: 'Contexto y tesis',
    businessLabel: 'QUÉ SIGNIFICA PARA TU EMPRESA',
    nextLabel: 'SIGUE DESDE AQUÍ',
    nextTitle: 'Del análisis a la aplicación.',
    caseQuestion: '¿Quieres ver un caso aplicado?',
    caseAction: 'Explorar caso relacionado',
    branchQuestion: '¿Quieres seguir explorando esta rama?',
    branchAction: 'Explorar más análisis',
    contactQuestion: '¿Te ocurre algo parecido?',
    contactAction: 'Cuéntanos tu caso',
  },
  ca: {
    back: 'Coneixement',
    label: 'ANÀLISI',
    quickLabel: 'L’ARTICLE EN 30 SEGONS',
    quickTitle: 'Tres idees per entendre la tesi abans d’entrar en detall.',
    contents: 'EN AQUESTA ANÀLISI',
    contentsTitle: 'De la idea a la decisió',
    introTitle: 'Context i tesi',
    businessLabel: 'QUÈ SIGNIFICA PER A LA TEVA EMPRESA',
    nextLabel: 'CONTINUA DES D’AQUÍ',
    nextTitle: 'De l’anàlisi a l’aplicació.',
    caseQuestion: 'Vols veure un cas aplicat?',
    caseAction: 'Explorar cas relacionat',
    branchQuestion: 'Vols continuar explorant aquesta branca?',
    branchAction: 'Explorar més anàlisis',
    contactQuestion: 'Et passa alguna cosa semblant?',
    contactAction: 'Explica’ns el teu cas',
  },
  en: {
    back: 'Knowledge',
    label: 'ANALYSIS',
    quickLabel: 'THE ARTICLE IN 30 SECONDS',
    quickTitle: 'Three ideas to understand the thesis before going deeper.',
    contents: 'IN THIS ANALYSIS',
    contentsTitle: 'From idea to decision',
    introTitle: 'Context & thesis',
    businessLabel: 'WHAT THIS MEANS FOR YOUR BUSINESS',
    nextLabel: 'CONTINUE FROM HERE',
    nextTitle: 'From analysis to application.',
    caseQuestion: 'Want to see an applied case?',
    caseAction: 'Explore related case',
    branchQuestion: 'Want to keep exploring this branch?',
    branchAction: 'Explore more analysis',
    contactQuestion: 'Facing something similar?',
    contactAction: 'Tell us about your case',
  },
} as const

const AREA_LABELS = {
  es: {
    planning: 'PREDICCIÓN Y PLANIFICACIÓN',
    operations: 'OPERACIONES Y OPTIMIZACIÓN',
    risk_decision: 'RIESGO Y DECISIÓN',
    ai_automation: 'IA Y AUTOMATIZACIÓN',
    analytics: 'ANALYTICS Y REPORTING',
    finance: 'FINANZAS Y MODELIZACIÓN',
    business_systems: 'SISTEMAS EMPRESARIALES',
  },
  ca: {
    planning: 'PREDICCIÓ I PLANIFICACIÓ',
    operations: 'OPERACIONS I OPTIMITZACIÓ',
    risk_decision: 'RISC I DECISIÓ',
    ai_automation: 'IA I AUTOMATITZACIÓ',
    analytics: 'ANALYTICS I REPORTING',
    finance: 'FINANCES I MODELITZACIÓ',
    business_systems: 'SISTEMES EMPRESARIALS',
  },
  en: {
    planning: 'FORECASTING & PLANNING',
    operations: 'OPERATIONS & OPTIMISATION',
    risk_decision: 'RISK & DECISION',
    ai_automation: 'AI & AUTOMATION',
    analytics: 'ANALYTICS & REPORTING',
    finance: 'FINANCE & MODELLING',
    business_systems: 'BUSINESS SYSTEMS',
  },
} as const

export default function GeneratedKnowledgeArticleGoldStandard({ variants, forcedLanguage }: Props) {
  const { lang } = useSiteLanguage()
  const activeLanguage = forcedLanguage || lang
  const article = selectVariant(variants, activeLanguage)
  const t = COPY[activeLanguage]
  const [activeSection, setActiveSection] = useState('article-context')

  const meta = article ? metaFor(article) : {}
  const segments = parseBody(article?.body || '')
  const headings = segments.filter((segment): segment is Extract<Segment, { type: 'section' }> => segment.type === 'section')

  if (!article) return null

  const sectionTitles = meta.section_titles || headings.map((section) => section.heading)
  const quick = meta.quick || []
  const area = String(meta.knowledge_area || 'analytics') as keyof typeof AREA_LABELS.es
  const areaLabel = AREA_LABELS[activeLanguage][area] || t.label
  const excerpt = meta.excerpt || segments[0]?.paragraphs?.[0] || ''
  const businessTitle = meta.business_title || excerpt
  const businessSteps = (meta.business_steps || []).slice(0, 4)
  const branchHref = `/knowledge?area=${area}`
  const presentation = meta.presentation_variant || presentationForFamily(meta.content_family)
  const serviceKey = meta.service_key || fallbackServiceForArticle({ cluster: meta.cluster, specId: meta.spec_id })
  const firstRelated = meta.related_articles?.[0]
  const relatedHref = typeof firstRelated === 'string' ? firstRelated : firstRelated?.href || meta.related_article
  const relatedTitle = typeof firstRelated === 'string' ? meta.related_article_title : firstRelated?.title || meta.related_article_title
  const businessGrid = businessSteps.length <= 1 ? 'grid-cols-1' : businessSteps.length === 2 ? 'md:grid-cols-2' : businessSteps.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 xl:grid-cols-4'

  return (
    <main className="bg-[#FAFAF7] text-slate-950">
      <section className="border-b border-slate-300 bg-white">
        <div className="site-container pb-10 pt-8 lg:pb-12">
          <Link href="/knowledge" className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-500 transition hover:text-slate-950">
            ← {t.back}
          </Link>
          <div className="mt-8">
            <p className="text-[14px] font-semibold uppercase tracking-[0.15em] text-[#4F46E5]">{t.label} · {areaLabel}</p>
            <h1 className="mt-5 max-w-[1200px] text-[42px] leading-[1.02] tracking-[-0.03em] text-slate-950 sm:text-[50px] lg:text-[56px]" style={{ fontFamily: 'var(--font-playfair)' }}>
              {article.title}
            </h1>
            {excerpt ? <p className="mt-5 max-w-[920px] text-[19px] leading-8 text-[#1D2B44]">{excerpt}</p> : null}
          </div>
        </div>
      </section>

      <KnowledgeArticleSummary
        locale={activeLanguage}
        presentation={presentation}
        quick={quick}
        sectionTitles={sectionTitles}
        businessTitle={businessTitle}
        customItems={meta.summary_items}
      />

      <section className="site-container py-10 lg:py-14">
        <div className="lg:grid lg:grid-cols-[330px_minmax(0,900px)] lg:justify-center lg:gap-16 lg:items-start">
          <aside className="sticky top-24 mb-8 hidden self-start lg:block">
            <div className="border border-slate-300 bg-[#F4F1EA] p-6">
              <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[#4F46E5]">{t.contents}</p>
              <p className="mt-3 text-[26px] leading-tight text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{t.contentsTitle}</p>
              <nav className="mt-6 border-t border-slate-300">
                <a href="#article-context" onClick={() => setActiveSection('article-context')} className={`grid grid-cols-[34px_1fr] gap-3 border-b border-slate-300 py-4 text-[16px] leading-6 transition hover:text-[#4F46E5] ${activeSection === 'article-context' ? 'font-semibold text-slate-950' : 'font-medium text-slate-700'}`}>
                  <span className="font-mono text-[14px] text-[#4F46E5]">00</span>
                  <span>{t.introTitle}</span>
                </a>
                {headings.map((section, index) => {
                  const id = `section-${index + 1}`
                  return (
                    <a key={section.heading} href={`#${id}`} onClick={() => setActiveSection(id)} className={`grid grid-cols-[34px_1fr] gap-3 border-b border-slate-300 py-4 text-[16px] leading-6 transition hover:text-[#4F46E5] ${activeSection === id ? 'font-semibold text-slate-950' : 'font-medium text-slate-700'}`}>
                      <span className={`font-mono text-[14px] ${activeSection === id ? 'text-[#4F46E5]' : 'text-slate-400'}`}>{String(index + 1).padStart(2, '0')}</span>
                      <span>{sectionTitles[index] || section.heading}</span>
                    </a>
                  )
                })}
              </nav>
            </div>
          </aside>

          <article className="border-t border-slate-400">
            {segments.map((segment, segmentIndex) => {
              if (segment.type === 'intro') {
                return (
                  <div key={segmentIndex} id="article-context" className="scroll-mt-28 border-b border-slate-300 bg-white px-6 py-8 md:px-8 md:py-9">
                    <div className="space-y-6">
                      {segment.paragraphs.map((paragraph, index) => (
                        <ArticleText key={index} text={paragraph} className="hyphens-auto text-justify text-[19px] leading-9 text-[#1D2B44]" />
                      ))}
                    </div>
                  </div>
                )
              }
              const sectionNumber = segments.slice(0, segmentIndex + 1).filter((item) => item.type === 'section').length
              const displayHeading = sectionTitles[sectionNumber - 1] || segment.heading
              return (
                <section key={`${segment.heading}-${segmentIndex}`} id={`section-${sectionNumber}`} className="relative scroll-mt-28 border-b border-slate-300 bg-white px-6 py-9 md:px-8 md:py-10">
                  <span className="absolute left-2 top-10 font-mono text-[14px] font-semibold text-[#4F46E5] md:-left-9">{String(sectionNumber).padStart(2, '0')}</span>
                  <h2 className="max-w-[24ch] text-[29px] leading-[1.08] text-slate-950 sm:text-[33px]" style={{ fontFamily: 'var(--font-playfair)' }}>{displayHeading}</h2>
                  <div className="mt-6 space-y-6">
                    {segment.paragraphs.map((paragraph, index) => (
                      <ArticleText key={index} text={paragraph} className="hyphens-auto text-justify text-[18px] leading-9 text-slate-700" />
                    ))}
                  </div>
                </section>
              )
            })}
          </article>
        </div>
      </section>

      <KnowledgeExperienceNote locale={activeLanguage} note={meta.experience_note} />

      {businessTitle ? (
        <section className="border-y border-slate-300 bg-[#F4F1EA]">
          <div className="site-container py-10 lg:py-12">
            <div className="text-center">
              <p className="text-[14px] font-semibold uppercase tracking-[0.15em] text-[#4F46E5]">{t.businessLabel}</p>
              <h2 className="mx-auto mt-3 max-w-5xl text-[32px] leading-[1.08] text-slate-950 sm:text-[39px]" style={{ fontFamily: 'var(--font-playfair)' }}>{businessTitle}</h2>
            </div>
            {businessSteps.length ? (
              <div className={`mx-auto mt-7 grid max-w-[1180px] gap-3 ${businessGrid}`}>
                {businessSteps.map((step, index) => (
                  <div key={step} className={`flex min-h-[128px] items-center justify-center border border-slate-300 px-6 py-5 text-center ${index % 3 === 1 ? 'bg-[#EAF0F6]' : 'bg-white'}`}>
                    <div>
                      <p className="font-mono text-[12px] font-semibold text-[#4F46E5]">{String(index + 1).padStart(2, '0')}</p>
                      <p className="mt-3 text-[21px] font-semibold leading-7 text-[#1D2B44]">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <KnowledgeArticleNext
        locale={activeLanguage}
        serviceKey={serviceKey}
        relatedHref={relatedHref}
        relatedTitle={relatedTitle}
        branchHref={branchHref}
      />

    </main>
  )
}
