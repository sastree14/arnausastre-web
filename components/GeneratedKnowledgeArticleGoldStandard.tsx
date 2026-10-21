'use client'

import { useState } from 'react'
import Link from 'next/link'
import { serviceHrefForArea } from '@/lib/seo-clusters'
import ArticleText from '@/components/ArticleText'
import ArticleSearchJump from '@/components/ArticleSearchJump'
import { ArrowRight } from 'lucide-react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import type { PublicGeneratedArticle } from '@/lib/public-growth'

type Props = { variants: PublicGeneratedArticle[]; forcedLanguage?: 'es' | 'ca' | 'en' }

type Segment =
  | { type: 'intro'; paragraphs: string[] }
  | { type: 'section'; heading: string; paragraphs: string[] }

type ArticleMeta = {
  presentation_variant?: string
  excerpt?: string
  quick?: string[]
  section_titles?: string[]
  business_title?: string
  business_steps?: string[]
  knowledge_area?: string
  related_case?: string
  related_article?: string
  seo_title?: string
  seo_description?: string
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
    quickTitle: 'Ideas para entender la tesis antes de entrar en detalle.',
    contents: 'EN ESTE ANÁLISIS',
    contentsTitle: 'De la idea a la decisión',
    introTitle: 'Contexto y tesis',
    businessLabel: 'QUÉ SIGNIFICA PARA TU EMPRESA',
    nextLabel: 'SIGUE DESDE AQUÍ',
    nextTitle: 'Del análisis a la aplicación.',
    caseQuestion: '¿Quieres ver un caso aplicado?',
    caseAction: 'Explorar caso relacionado',
    branchQuestion: '¿Quieres llevar este análisis a tu empresa?',
    branchAction: 'Ver servicio relacionado',
    contactQuestion: '¿Te ocurre algo parecido?',
    contactAction: 'Cuéntanos tu caso',
  },
  ca: {
    back: 'Coneixement',
    label: 'ANÀLISI',
    quickLabel: 'L’ARTICLE EN 30 SEGONS',
    quickTitle: 'Idees per entendre la tesi abans d’entrar en detall.',
    contents: 'EN AQUESTA ANÀLISI',
    contentsTitle: 'De la idea a la decisió',
    introTitle: 'Context i tesi',
    businessLabel: 'QUÈ SIGNIFICA PER A LA TEVA EMPRESA',
    nextLabel: 'CONTINUA DES D’AQUÍ',
    nextTitle: 'De l’anàlisi a l’aplicació.',
    caseQuestion: 'Vols veure un cas aplicat?',
    caseAction: 'Explorar cas relacionat',
    branchQuestion: 'Vols aplicar aquesta anàlisi a la teva empresa?',
    branchAction: 'Veure servei relacionat',
    contactQuestion: 'Et passa alguna cosa semblant?',
    contactAction: 'Explica’ns el teu cas',
  },
  en: {
    back: 'Knowledge',
    label: 'ANALYSIS',
    quickLabel: 'THE ARTICLE IN 30 SECONDS',
    quickTitle: 'Key ideas to understand the thesis before going deeper.',
    contents: 'IN THIS ANALYSIS',
    contentsTitle: 'From idea to decision',
    introTitle: 'Context & thesis',
    businessLabel: 'WHAT THIS MEANS FOR YOUR BUSINESS',
    nextLabel: 'CONTINUE FROM HERE',
    nextTitle: 'From analysis to application.',
    caseQuestion: 'Want to see an applied case?',
    caseAction: 'Explore related case',
    branchQuestion: 'Want to apply this analysis to your business?',
    branchAction: 'Explore related service',
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
  const presentation = meta.presentation_variant || 'triad'
  const quick = (meta.quick || []).slice(0, presentation === 'duo' ? 2 : 3)
  const area = String(meta.knowledge_area || 'analytics') as keyof typeof AREA_LABELS.es
  const areaLabel = AREA_LABELS[activeLanguage][area] || t.label
  const excerpt = meta.excerpt || segments[0]?.paragraphs?.[0] || ''
  const businessTitle = meta.business_title || excerpt
  const businessSteps = (meta.business_steps || []).slice(0, 3)
  const branchHref = serviceHrefForArea(area)
  const caseHref = meta.related_case || meta.related_article || '/knowledge'

  return (
    <main lang={activeLanguage} className="bg-[#F7F9FC] text-slate-950">
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
            {excerpt ? <p className="mt-5 max-w-[920px] text-justify hyphens-auto text-[19px] leading-8 text-[#1D2B44]">{excerpt}</p> : null}
          </div>
        </div>
      </section>

      {quick.length ? (
        <section className="border-b border-slate-300 bg-[#EAF0F6]">
          <div className="site-container py-8 text-center lg:py-10">
            <p className="text-[14px] font-semibold uppercase tracking-[0.15em] text-[#4F46E5]">{t.quickLabel}</p>
            <h2 className="mx-auto mt-3 max-w-4xl text-[29px] leading-tight text-slate-950 sm:text-[33px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.quickTitle}</h2>
            <div className={`mx-auto mt-6 grid max-w-[1240px] auto-rows-fr border-l border-t border-slate-300 ${quick.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
              {quick.map((titleText, index) => (
                <div key={titleText} className={`flex min-h-[150px] flex-col items-center justify-center border-b border-r border-slate-300 px-7 py-6 ${index === 1 ? 'bg-[#EAF0F6]' : 'bg-white'}`}>
                  <p className="font-mono text-[14px] font-semibold text-[#4F46E5]">0{index + 1}</p>
                  <h3 className="mt-4 w-full text-center text-[24px] font-semibold leading-7 text-slate-950">{titleText}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="site-container py-10 lg:py-14">
        <div className="lg:grid lg:grid-cols-[330px_minmax(0,900px)] lg:justify-center lg:gap-16 lg:items-start">
          <aside className="sticky top-24 mb-8 hidden self-start lg:block">
            <div className="border border-slate-300 bg-[#EAF0F6] p-6">
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

          <article data-knowledge-article-body className="border-t border-slate-400">
            <ArticleSearchJump language={activeLanguage} articleId={article.content_id} />
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
                    {/^(ejemplo(?:\s|:|$)|exemple(?:\s|:|$)|example(?:\s|:|$)|nota técnica|nota tècnica|technical note|apéndice|apèndix|appendix)/i.test(segment.heading) && segment.paragraphs.length > 1 ? <>
                      <ArticleText text={segment.paragraphs[0]} className="hyphens-auto text-justify text-[18px] leading-9 text-slate-700"/>
                      <details className="group border border-indigo-200 bg-white open:border-indigo-400">
                        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 bg-indigo-50 px-5 py-4 text-[16px] font-semibold text-indigo-900 transition hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-700 [&::-webkit-details-marker]:hidden">
                          <span>{displayHeading}</span><span aria-hidden="true" className="flex h-7 w-7 items-center justify-center border border-indigo-300 bg-white text-xl transition-transform group-open:rotate-45">+</span>
                        </summary>
                        <div className="space-y-6 border-t border-indigo-200 p-5">{segment.paragraphs.slice(1).map((paragraph,index)=><ArticleText key={index} text={paragraph} className="hyphens-auto text-justify text-[18px] leading-9 text-slate-700"/>)}</div>
                      </details>
                    </> : segment.paragraphs.map((paragraph, index) => (
                      <ArticleText key={index} text={paragraph} className="hyphens-auto text-justify text-[18px] leading-9 text-slate-700" />
                    ))}
                  </div>
                </section>
              )
            })}
          </article>
        </div>
      </section>

      {businessTitle ? (
        <section className="border-y border-slate-300 bg-[#EAF0F6]">
          <div className="site-container py-10 lg:py-12">
            <div className="text-center">
              <p className="text-[14px] font-semibold uppercase tracking-[0.15em] text-[#4F46E5]">{t.businessLabel}</p>
              <h2 className="mx-auto mt-3 max-w-5xl text-[32px] leading-[1.08] text-slate-950 sm:text-[39px]" style={{ fontFamily: 'var(--font-playfair)' }}>{businessTitle}</h2>
            </div>
            {businessSteps.length === 3 ? (
              <div className="mx-auto mt-7 grid max-w-[1180px] items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] auto-rows-fr lg:gap-4">
                {businessSteps.map((step, index) => (
                  <div key={step} className="contents">
                    <div className={`flex min-h-[130px] items-center justify-center border border-slate-300 px-6 py-5 text-center ${index === 1 ? 'bg-[#EAF0F6]' : 'bg-white'}`}>
                      <p className="w-full text-center text-[22px] font-semibold leading-7 text-[#1D2B44]">{step}</p>
                    </div>
                    {index < 2 ? <div className="hidden items-center justify-center lg:flex"><ArrowRight className="h-5 w-5 text-[#4F46E5]" /></div> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="bg-white">
        <div className="site-container py-10 lg:py-12">
          <div className="text-center">
            <p className="text-[14px] font-semibold uppercase tracking-[0.15em] text-[#4F46E5]">{t.nextLabel}</p>
            <h2 className="mt-3 text-[31px] leading-tight text-slate-950 sm:text-[36px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.nextTitle}</h2>
          </div>
          <div className="mt-7 grid border-l border-t border-slate-300 lg:grid-cols-3">
            {[
              ['01', t.caseQuestion, t.caseAction, caseHref],
              ['02', t.branchQuestion, t.branchAction, branchHref],
              ['03', t.contactQuestion, t.contactAction, '/contact?intent=problem'],
            ].map(([number, question, action, href], index) => (
              <Link key={`${number}-${href}`} href={href} className={`group flex min-h-[220px] flex-col border-b border-r border-slate-300 p-7 transition ${index === 1 ? 'bg-[#EAF0F6] hover:bg-[#EAF0F6]' : index === 2 ? 'bg-[#0D1B2A] text-white hover:bg-[#254A66]' : 'bg-white hover:bg-[#F7F9FC]'}`}>
                <div className="flex items-start justify-between gap-4">
                  <span className={`font-mono text-[14px] font-semibold ${index === 2 ? 'text-[#7A7DFF]' : 'text-[#4F46E5]'}`}>{number}</span>
                  <ArrowRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${index === 2 ? 'text-white' : 'text-slate-500'}`} />
                </div>
                <p className={`mt-6 max-w-[23ch] text-[24px] leading-[1.1] ${index === 2 ? 'text-white' : 'text-[#1D2B44]'}`} style={{ fontFamily: 'var(--font-playfair)' }}>{question}</p>
                <p className={`mt-auto pt-6 text-[16px] font-semibold ${index === 2 ? 'text-white' : 'text-[#4F46E5]'}`}>{action}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
