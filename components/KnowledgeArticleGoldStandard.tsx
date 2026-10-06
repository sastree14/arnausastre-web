'use client'

import { useState } from 'react'
import Link from 'next/link'
import ArticleText from '@/components/ArticleText'
import { ArrowRight } from 'lucide-react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import type { Article } from '@/lib/content'

type Lang = 'es' | 'ca' | 'en'
type Segment =
  | { type: 'intro'; paragraphs: string[] }
  | { type: 'section'; heading: string; paragraphs: string[] }

type LocalMeta = {
  label: string
  dek: string
  quick: string[]
  contentsTitle: string
  introTitle: string
  sectionTitles: string[]
  businessTitle: string
  businessSteps: string[]
  area: 'planning' | 'operations' | 'risk_decision' | 'ai_automation' | 'analytics' | 'finance' | 'business_systems'
  caseHref?: string
  caseAction?: string
}

type ArticleMeta = Record<string, Record<Lang, LocalMeta>>


function splitReadableParagraph(text: string) {
  // Preserve author paragraph boundaries, URLs, lists and Markdown tables.
  const clean = text.trim()
  return clean ? [clean] : []
}

function parseBody(body: string): Segment[] {
  const lines = body.split(/\r?\n/)
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
    if (/^\*\*[^*]+\*\*$/.test(line)) {
      flushSegment()
      current = { type: 'section', heading: line.slice(2, -2), paragraphs: [] }
      continue
    }
    buffer.push(line)
  }
  flushSegment()
  return segments
}

const UI = {
  es: {
    back: 'Conocimiento',
    quickLabel: 'EL ARTÍCULO EN 30 SEGUNDOS',
    quickTitle: 'Tres ideas para entender la tesis antes de entrar en detalle.',
    contents: 'EN ESTE ANÁLISIS',
    businessLabel: 'QUÉ SIGNIFICA PARA TU EMPRESA',
    nextLabel: 'SIGUE DESDE AQUÍ',
    nextTitle: 'Del análisis a la aplicación.',
    caseQuestion: '¿Quieres ver un caso aplicado?',
    branchQuestion: '¿Quieres seguir explorando esta rama?',
    branchAction: 'Explorar más análisis',
    contactQuestion: '¿Te ocurre algo parecido?',
    contactAction: 'Cuéntanos tu caso',
  },
  ca: {
    back: 'Coneixement',
    quickLabel: 'L’ARTICLE EN 30 SEGONS',
    quickTitle: 'Tres idees per entendre la tesi abans d’entrar en detall.',
    contents: 'EN AQUESTA ANÀLISI',
    businessLabel: 'QUÈ SIGNIFICA PER A LA TEVA EMPRESA',
    nextLabel: 'CONTINUA DES D’AQUÍ',
    nextTitle: 'De l’anàlisi a l’aplicació.',
    caseQuestion: 'Vols veure un cas aplicat?',
    branchQuestion: 'Vols continuar explorant aquesta branca?',
    branchAction: 'Explorar més anàlisis',
    contactQuestion: 'Et passa alguna cosa semblant?',
    contactAction: 'Explica’ns el teu cas',
  },
  en: {
    back: 'Knowledge',
    quickLabel: 'THE ARTICLE IN 30 SECONDS',
    quickTitle: 'Three ideas to understand the thesis before going deeper.',
    contents: 'IN THIS ANALYSIS',
    businessLabel: 'WHAT THIS MEANS FOR YOUR BUSINESS',
    nextLabel: 'CONTINUE FROM HERE',
    nextTitle: 'From analysis to application.',
    caseQuestion: 'Want to see an applied case?',
    branchQuestion: 'Want to keep exploring this branch?',
    branchAction: 'Explore more analysis',
    contactQuestion: 'Facing something similar?',
    contactAction: 'Tell us about your case',
  },
} as const

const META: ArticleMeta = {
  'why-inventory-visibility-is-not-inventory-control-and-what-that-costs': {
    es: {
      label: 'ANÁLISIS · OPERACIONES Y OPTIMIZACIÓN',
      dek: 'Ver más datos no basta. El valor aparece cuando la información cambia cómo decides cuánto reponer, cuánto stock mantener y dónde posicionarlo.',
      quick: ['Visibilidad ≠ control', 'El coste está en la política', 'Control significa decidir'],
      contentsTitle: 'Del dato a la decisión',
      introTitle: 'Contexto y tesis',
      sectionTitles: ['Datos en tiempo real', 'Visibilidad vs. control', 'Límites del reporting', 'Optimización: trade-offs'],
      businessTitle: 'Más visibilidad solo crea control cuando cambia la decisión.',
      businessSteps: ['Más visibilidad', 'Mismas reglas de decisión', 'Mismo nivel de control'],
      area: 'operations',
      caseHref: '/projects/ecommerce-demand-forecasting',
      caseAction: 'Explorar forecasting e inventario',
    },
    ca: {
      label: 'ANÀLISI · OPERACIONS I OPTIMITZACIÓ',
      dek: 'Veure més dades no és suficient. El valor apareix quan la informació canvia com decideixes quant reposar, quin stock mantenir i on posicionar-lo.',
      quick: ['Visibilitat ≠ control', 'El cost és a la política', 'Control significa decidir'],
      contentsTitle: 'De la dada a la decisió',
      introTitle: 'Context i tesi',
      sectionTitles: ['Dades en temps real', 'Visibilitat vs. control', 'Límits del reporting', 'Optimització: trade-offs'],
      businessTitle: 'Més visibilitat només crea control quan canvia la decisió.',
      businessSteps: ['Més visibilitat', 'Mateixes regles de decisió', 'Mateix nivell de control'],
      area: 'operations',
      caseHref: '/projects/ecommerce-demand-forecasting',
      caseAction: 'Explorar forecasting i inventari',
    },
    en: {
      label: 'ANALYSIS · OPERATIONS & OPTIMISATION',
      dek: 'Seeing more data is not enough. Value appears when information changes how you decide what to replenish, how much stock to hold and where to position it.',
      quick: ['Visibility ≠ control', 'The cost lives in policy', 'Control means deciding'],
      contentsTitle: 'From data to decision',
      introTitle: 'Context & thesis',
      sectionTitles: ['Real-time data', 'Visibility vs. control', 'Reporting limits', 'Optimisation trade-offs'],
      businessTitle: 'More visibility creates control only when the decision changes.',
      businessSteps: ['More visibility', 'Same decision rules', 'Same level of control'],
      area: 'operations',
      caseHref: '/projects/ecommerce-demand-forecasting',
      caseAction: 'Explore forecasting and inventory',
    },
  },
  'cuando-la-fijacion-dinamica-de-precios-crea-mas-problemas-que-soluciones': {
    es: {
      label: 'ANÁLISIS · FINANZAS Y PRICING',
      dek: 'Cambiar precios más rápido no arregla una mala señal de demanda. El pricing aporta valor cuando el objetivo, la elasticidad y los límites comerciales están claros.',
      quick: ['Precio dinámico ≠ estrategia', 'Automatizar no corrige la señal', 'El objetivo guía al algoritmo'],
      contentsTitle: 'De precio a estrategia',
      introTitle: 'Contexto y tesis',
      sectionTitles: ['Optimización constante', 'Automatización vs. estrategia', 'El riesgo de la caja negra', 'Pricing: trade-offs'],
      businessTitle: 'Automatizar el precio sin mejorar la decisión solo automatiza la reacción.',
      businessSteps: ['Más cambios de precio', 'Misma señal de demanda', 'Más ruido comercial'],
      area: 'finance',
      caseHref: '/projects',
      caseAction: 'Explorar casos de éxito',
    },
    ca: {
      label: 'ANÀLISI · FINANCES I PRICING',
      dek: 'Canviar preus més ràpid no arregla un mal senyal de demanda. El pricing aporta valor quan l’objectiu, l’elasticitat i els límits comercials són clars.',
      quick: ['Preu dinàmic ≠ estratègia', 'Automatitzar no corregeix el senyal', 'L’objectiu guia l’algoritme'],
      contentsTitle: 'De preu a estratègia',
      introTitle: 'Context i tesi',
      sectionTitles: ['Optimització constant', 'Automatització vs. estratègia', 'El risc de la caixa negra', 'Pricing: trade-offs'],
      businessTitle: 'Automatitzar el preu sense millorar la decisió només automatitza la reacció.',
      businessSteps: ['Més canvis de preu', 'Mateix senyal de demanda', 'Més soroll comercial'],
      area: 'finance',
      caseHref: '/projects',
      caseAction: 'Explorar casos d’èxit',
    },
    en: {
      label: 'ANALYSIS · FINANCE & PRICING',
      dek: 'Changing prices faster does not fix a weak demand signal. Pricing creates value when the objective, elasticity and commercial guardrails are clear.',
      quick: ['Dynamic price ≠ strategy', 'Automation does not fix the signal', 'The objective guides the algorithm'],
      contentsTitle: 'From price to strategy',
      introTitle: 'Context & thesis',
      sectionTitles: ['Constant optimisation', 'Automation vs. strategy', 'The black-box risk', 'Pricing trade-offs'],
      businessTitle: 'Automating price without improving the decision only automates reaction.',
      businessSteps: ['More price changes', 'Same demand signal', 'More commercial noise'],
      area: 'finance',
      caseHref: '/projects',
      caseAction: 'Explore success stories',
    },
  },
  'why-hiring-faster-obscures-deeper-healthcare-capacity-problems': {
    es: {
      label: 'ANÁLISIS · PLANIFICACIÓN Y CAPACIDAD',
      dek: 'Aumentar plantilla no resuelve automáticamente un cuello de botella. La capacidad depende de cómo se asignan personas, turnos y demanda en el tiempo.',
      quick: ['Contratar ≠ capacidad', 'Asignar antes de ampliar', 'La capacidad es dinámica'],
      contentsTitle: 'De plantilla a capacidad',
      introTitle: 'Contexto y tesis',
      sectionTitles: ['La falsa escasez', 'Contratación vs. despliegue', 'Capacidad dinámica', 'La medida correcta'],
      businessTitle: 'Más personas no crean más capacidad si la asignación sigue siendo rígida.',
      businessSteps: ['Más contratación', 'Misma asignación', 'Mismo cuello de botella'],
      area: 'planning',
      caseHref: '/projects',
      caseAction: 'Explorar casos de éxito',
    },
    ca: {
      label: 'ANÀLISI · PLANIFICACIÓ I CAPACITAT',
      dek: 'Augmentar plantilla no resol automàticament un coll d’ampolla. La capacitat depèn de com s’assignen persones, torns i demanda en el temps.',
      quick: ['Contractar ≠ capacitat', 'Assignar abans d’ampliar', 'La capacitat és dinàmica'],
      contentsTitle: 'De plantilla a capacitat',
      introTitle: 'Context i tesi',
      sectionTitles: ['La falsa escassetat', 'Contractació vs. desplegament', 'Capacitat dinàmica', 'La mesura correcta'],
      businessTitle: 'Més persones no creen més capacitat si l’assignació continua sent rígida.',
      businessSteps: ['Més contractació', 'Mateixa assignació', 'Mateix coll d’ampolla'],
      area: 'planning',
      caseHref: '/projects',
      caseAction: 'Explorar casos d’èxit',
    },
    en: {
      label: 'ANALYSIS · PLANNING & CAPACITY',
      dek: 'Adding headcount does not automatically remove a bottleneck. Capacity depends on how people, shifts and demand are allocated over time.',
      quick: ['Hiring ≠ capacity', 'Allocate before expanding', 'Capacity is dynamic'],
      contentsTitle: 'From headcount to capacity',
      introTitle: 'Context & thesis',
      sectionTitles: ['The false shortage', 'Hiring vs. deployment', 'Dynamic capacity', 'The right measure'],
      businessTitle: 'More people do not create more capacity if allocation stays rigid.',
      businessSteps: ['More hiring', 'Same allocation', 'Same bottleneck'],
      area: 'planning',
      caseHref: '/projects',
      caseAction: 'Explore success stories',
    },
  },
  'why-operational-supplier-risk-outstrips-financial-risk-and-what-it-costs': {
    es: {
      label: 'ANÁLISIS · RIESGO Y DECISIÓN',
      dek: 'Un proveedor puede parecer sólido financieramente y seguir siendo frágil para la operación. El riesgo útil es el que cambia compras, buffers y escalado.',
      quick: ['Riesgo ≠ solvencia', 'La operación avisa primero', 'El score debe activar una decisión'],
      contentsTitle: 'Del score al riesgo real',
      introTitle: 'Contexto y tesis',
      sectionTitles: ['Incentivos desalineados', 'Integrar datos no basta', 'Modelar para actuar'],
      businessTitle: 'Un buen score financiero no protege una operación si no captura la fiabilidad real.',
      businessSteps: ['Buen score financiero', 'Fallos operativos invisibles', 'Riesgo sin anticipar'],
      area: 'risk_decision',
      caseHref: '/projects',
      caseAction: 'Explorar casos de éxito',
    },
    ca: {
      label: 'ANÀLISI · RISC I DECISIÓ',
      dek: 'Un proveïdor pot semblar sòlid financerament i continuar sent fràgil per a l’operació. El risc útil és el que canvia compres, buffers i escalat.',
      quick: ['Risc ≠ solvència', 'L’operació avisa primer', 'El score ha d’activar una decisió'],
      contentsTitle: 'Del score al risc real',
      introTitle: 'Context i tesi',
      sectionTitles: ['Incentius desalineats', 'Integrar dades no és suficient', 'Modelar per actuar'],
      businessTitle: 'Un bon score financer no protegeix una operació si no captura la fiabilitat real.',
      businessSteps: ['Bon score financer', 'Fallades operatives invisibles', 'Risc sense anticipar'],
      area: 'risk_decision',
      caseHref: '/projects',
      caseAction: 'Explorar casos d’èxit',
    },
    en: {
      label: 'ANALYSIS · RISK & DECISION',
      dek: 'A supplier can look financially healthy and still be operationally fragile. Useful risk analytics changes sourcing, buffers and escalation decisions.',
      quick: ['Risk ≠ solvency', 'Operations signal first', 'A score must trigger a decision'],
      contentsTitle: 'From score to real risk',
      introTitle: 'Context & thesis',
      sectionTitles: ['Misaligned incentives', 'Integration is not enough', 'Models that drive action'],
      businessTitle: 'A strong financial score does not protect operations if it misses real reliability.',
      businessSteps: ['Strong financial score', 'Hidden operational failures', 'Unanticipated risk'],
      area: 'risk_decision',
      caseHref: '/projects',
      caseAction: 'Explore success stories',
    },
  },
}

function titleFor(article: Article, lang: Lang) {
  return lang === 'en' ? article.titleEn : lang === 'ca' ? (article.titleCa || article.titleEs) : article.titleEs
}

function fallbackMeta(article: Article, lang: Lang): LocalMeta {
  const excerpt = lang === 'en' ? article.excerptEn : lang === 'ca' ? (article.excerptCa || article.excerptEs) : article.excerptEs
  return {
    label: lang === 'en' ? 'ANALYSIS' : lang === 'ca' ? 'ANÀLISI' : 'ANÁLISIS',
    dek: excerpt,
    quick: [titleFor(article, lang), article.challenge, article.theme].filter(Boolean).slice(0, 3),
    contentsTitle: lang === 'en' ? 'From idea to decision' : lang === 'ca' ? 'De la idea a la decisió' : 'De la idea a la decisión',
    introTitle: lang === 'en' ? 'Context & thesis' : lang === 'ca' ? 'Context i tesi' : 'Contexto y tesis',
    sectionTitles: [],
    businessTitle: excerpt,
    businessSteps: [],
    area: 'analytics',
    caseHref: '/projects',
    caseAction: lang === 'en' ? 'Explore success stories' : lang === 'ca' ? 'Explorar casos d’èxit' : 'Explorar casos de éxito',
  }
}

export default function KnowledgeArticleGoldStandard({ article, forcedLanguage }: { article: Article; forcedLanguage?: Lang }) {
  const { lang: siteLang } = useSiteLanguage()
  const lang = forcedLanguage || siteLang
  const ui = UI[lang]
  const meta = META[article.slug]?.[lang] || fallbackMeta(article, lang)
  const [activeSection, setActiveSection] = useState('article-context')
  const body = lang === 'en' ? article.bodyEn : lang === 'ca' ? (article.bodyCa || article.bodyEs) : article.bodyEs
  const segments = parseBody(body)
  const headings = segments.filter((segment): segment is Extract<Segment, { type: 'section' }> => segment.type === 'section')
  const quick = meta.quick.slice(0, 3)
  const businessSteps = meta.businessSteps.slice(0, 3)
  const branchHref = `/knowledge?area=${meta.area}`

  return (
    <main className="bg-[#F7F9FC] text-slate-950">
      <section className="border-b border-slate-300 bg-white">
        <div className="site-container pb-10 pt-8 lg:pb-12">
          <Link href="/knowledge" className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-500 transition hover:text-slate-950">← {ui.back}</Link>
          <div className="mt-8">
            <p className="text-[14px] font-semibold uppercase tracking-[0.15em] text-[#4F46E5]">{meta.label}</p>
            <h1 className="mt-5 max-w-[1200px] text-[42px] leading-[1.02] tracking-[-0.03em] text-slate-950 sm:text-[50px] lg:text-[56px]" style={{ fontFamily: 'var(--font-playfair)' }}>{titleFor(article, lang)}</h1>
            <p className="mt-5 max-w-[920px] text-[19px] leading-8 text-[#1D2B44]">{meta.dek}</p>
          </div>
        </div>
      </section>

      {quick.length === 3 ? (
        <section className="border-b border-slate-300 bg-[#EAF0F6]">
          <div className="site-container py-8 text-center lg:py-10">
            <p className="text-[14px] font-semibold uppercase tracking-[0.15em] text-[#4F46E5]">{ui.quickLabel}</p>
            <h2 className="mx-auto mt-3 max-w-4xl text-[29px] leading-tight text-slate-950 sm:text-[33px]" style={{ fontFamily: 'var(--font-playfair)' }}>{ui.quickTitle}</h2>
            <div className="mx-auto mt-6 grid max-w-[1240px] border-l border-t border-slate-300 lg:grid-cols-3">
              {quick.map((hook, index) => (
                <div key={hook} className={`flex min-h-[150px] flex-col items-center justify-center border-b border-r border-slate-300 px-7 py-6 ${index === 1 ? 'bg-[#EAF0F6]' : 'bg-white'}`}>
                  <p className="font-mono text-[14px] font-semibold text-[#4F46E5]">0{index + 1}</p>
                  <h3 className="mt-4 text-[24px] font-semibold leading-7 text-slate-950">{hook}</h3>
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
              <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[#4F46E5]">{ui.contents}</p>
              <p className="mt-3 text-[26px] leading-tight text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{meta.contentsTitle}</p>
              <nav className="mt-6 border-t border-slate-300">
                <a href="#article-context" onClick={() => setActiveSection('article-context')} className={`grid grid-cols-[34px_1fr] gap-3 border-b border-slate-300 py-4 text-[16px] leading-6 transition hover:text-[#4F46E5] ${activeSection === 'article-context' ? 'font-semibold text-slate-950' : 'font-medium text-slate-700'}`}>
                  <span className="font-mono text-[14px] text-[#4F46E5]">00</span><span>{meta.introTitle}</span>
                </a>
                {headings.map((section, index) => {
                  const id = `section-${index + 1}`
                  return (
                    <a key={section.heading} href={`#${id}`} onClick={() => setActiveSection(id)} className={`grid grid-cols-[34px_1fr] gap-3 border-b border-slate-300 py-4 text-[16px] leading-6 transition hover:text-[#4F46E5] ${activeSection === id ? 'font-semibold text-slate-950' : 'font-medium text-slate-700'}`}>
                      <span className={`font-mono text-[14px] ${activeSection === id ? 'text-[#4F46E5]' : 'text-slate-400'}`}>{String(index + 1).padStart(2, '0')}</span>
                      <span>{meta.sectionTitles[index] || section.heading}</span>
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
                    <div className="space-y-6">{segment.paragraphs.map((paragraph, index) => <ArticleText key={index} text={paragraph} className="hyphens-auto text-justify text-[19px] leading-9 text-[#1D2B44]" />)}</div>
                  </div>
                )
              }
              const sectionNumber = segments.slice(0, segmentIndex + 1).filter((item) => item.type === 'section').length
              const displayHeading = meta.sectionTitles[sectionNumber - 1] || segment.heading
              return (
                <section key={`${segment.heading}-${segmentIndex}`} id={`section-${sectionNumber}`} className="relative scroll-mt-28 border-b border-slate-300 bg-white px-6 py-9 md:px-8 md:py-10">
                  <span className="absolute left-2 top-10 font-mono text-[14px] font-semibold text-[#4F46E5] md:-left-9">{String(sectionNumber).padStart(2, '0')}</span>
                  <h2 className="max-w-[24ch] text-[29px] leading-[1.08] text-slate-950 sm:text-[33px]" style={{ fontFamily: 'var(--font-playfair)' }}>{displayHeading}</h2>
                  <div className="mt-6 space-y-6">{segment.paragraphs.map((paragraph, index) => <ArticleText key={index} text={paragraph} className="hyphens-auto text-justify text-[18px] leading-9 text-slate-700" />)}</div>
                </section>
              )
            })}
          </article>
        </div>
      </section>

      <section className="border-y border-slate-300 bg-[#EAF0F6]">
        <div className="site-container py-10 lg:py-12">
          <div className="text-center">
            <p className="text-[14px] font-semibold uppercase tracking-[0.15em] text-[#4F46E5]">{ui.businessLabel}</p>
            <h2 className="mx-auto mt-3 max-w-5xl text-[32px] leading-[1.08] text-slate-950 sm:text-[39px]" style={{ fontFamily: 'var(--font-playfair)' }}>{meta.businessTitle}</h2>
          </div>
          {businessSteps.length === 3 ? (
            <div className="mx-auto mt-7 grid max-w-[1180px] items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:gap-4">
              {businessSteps.map((step, index) => (
                <div key={step} className="contents">
                  <div className={`flex min-h-[130px] items-center justify-center border border-slate-300 px-6 py-5 text-center ${index === 1 ? 'bg-[#EAF0F6]' : 'bg-white'}`}><p className="text-[22px] font-semibold leading-7 text-[#1D2B44]">{step}</p></div>
                  {index < 2 ? <div className="hidden items-center justify-center lg:flex"><ArrowRight className="h-5 w-5 text-[#4F46E5]" /></div> : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-white">
        <div className="site-container py-10 lg:py-12">
          <div className="text-center"><p className="text-[14px] font-semibold uppercase tracking-[0.15em] text-[#4F46E5]">{ui.nextLabel}</p><h2 className="mt-3 text-[31px] leading-tight text-slate-950 sm:text-[36px]" style={{ fontFamily: 'var(--font-playfair)' }}>{ui.nextTitle}</h2></div>
          <div className="mt-7 grid border-l border-t border-slate-300 lg:grid-cols-3">
            {[
              ['01', ui.caseQuestion, meta.caseAction || ui.branchAction, meta.caseHref || '/projects'],
              ['02', ui.branchQuestion, ui.branchAction, branchHref],
              ['03', ui.contactQuestion, ui.contactAction, '/contact?intent=problem'],
            ].map(([number, question, action, href], index) => (
              <Link key={`${number}-${href}`} href={href} className={`group flex min-h-[220px] flex-col border-b border-r border-slate-300 p-7 transition ${index === 1 ? 'bg-[#EAF0F6] hover:bg-[#EAF0F6]' : index === 2 ? 'bg-[#0D1B2A] text-white hover:bg-[#254A66]' : 'bg-white hover:bg-[#F7F9FC]'}`}>
                <div className="flex items-start justify-between gap-4"><span className={`font-mono text-[14px] font-semibold ${index === 2 ? 'text-[#7A7DFF]' : 'text-[#4F46E5]'}`}>{number}</span><ArrowRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${index === 2 ? 'text-white' : 'text-slate-500'}`} /></div>
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
