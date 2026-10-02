'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import type { Article } from '@/lib/content'

type Segment =
  | { type: 'intro'; paragraphs: string[] }
  | { type: 'section'; heading: string; paragraphs: string[] }

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-slate-950">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

function splitReadableParagraph(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return []

  const sentences = clean.match(/[^.!?]+[.!?]+(?:["'”’])?|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) || [clean]
  if (sentences.length <= 2) return [clean]

  const paragraphs: string[] = []
  let current: string[] = []

  sentences.forEach((sentence) => {
    const candidate = [...current, sentence].join(' ')
    if (current.length >= 2 || candidate.length > 430) {
      paragraphs.push(current.join(' '))
      current = [sentence]
    } else {
      current.push(sentence)
    }
  })

  if (current.length) paragraphs.push(current.join(' '))
  return paragraphs
}

function parseBody(body: string): Segment[] {
  const lines = body.split(/\r?\n/)
  const segments: Segment[] = []
  let current: Segment = { type: 'intro', paragraphs: [] }
  let buffer: string[] = []

  const flushParagraph = () => {
    if (!buffer.length) return
    current.paragraphs.push(...splitReadableParagraph(buffer.join(' ')))
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

const COPY = {
  es: {
    back: 'Conocimiento',
    label: 'ANÁLISIS · OPERACIONES Y OPTIMIZACIÓN',
    title: 'Visibilidad de inventario ≠ control de inventario',
    dek: 'Ver más datos no basta. El valor aparece cuando la información cambia cómo decides cuánto reponer, cuánto stock mantener y dónde posicionarlo.',
    quickLabel: 'EL ARTÍCULO EN 30 SEGUNDOS',
    quickTitle: 'Tres ideas para entender la tesis antes de entrar en detalle.',
    quick: [
      ['Visibilidad ≠ control', 'Saber qué inventario tienes y dónde está no decide cuánto deberías tener.'],
      ['El coste está en la política', 'Reposición, stock de seguridad y transferencias siguen generando coste si las reglas no cambian.'],
      ['Control significa decidir', 'La optimización empieza cuando el sistema recomienda cuánto, cuándo y dónde actuar.'],
    ],
    contents: 'EN ESTE ANÁLISIS',
    contentsTitle: 'Del dato a la decisión',
    introTitle: 'Contexto y tesis',
    sectionTitles: ['Datos en tiempo real', 'Visibilidad vs. control', 'Límites del reporting', 'Optimización: trade-offs'],
    businessLabel: 'QUÉ SIGNIFICA PARA TU EMPRESA',
    businessTitle: 'Si ves mejor el inventario pero sigues decidiendo igual, has mejorado la visibilidad, no el control.',
    businessBody: 'La pregunta útil no es cuántos datos puedes consultar. Es cuántas decisiones de inventario siguen dependiendo de reglas fijas, excepciones y criterio manual.',
    nextLabel: 'SIGUE DESDE AQUÍ',
    nextTitle: 'Del análisis a la aplicación.',
    cards: [
      ['01', '¿Quieres ver un caso aplicado?', 'Explorar forecasting e inventario', '/projects/ecommerce-demand-forecasting'],
      ['02', '¿Quieres seguir explorando esta rama?', 'Explorar operaciones y optimización', '/knowledge?area=operations'],
      ['03', '¿Te ocurre algo parecido?', 'Cuéntanos tu caso', '/contact?intent=problem'],
    ],
  },
  ca: {
    back: 'Coneixement',
    label: 'ANÀLISI · OPERACIONS I OPTIMITZACIÓ',
    title: 'Visibilitat d’inventari ≠ control d’inventari',
    dek: 'Veure més dades no és suficient. El valor apareix quan la informació canvia com decideixes quant reposar, quin stock mantenir i on posicionar-lo.',
    quickLabel: 'L’ARTICLE EN 30 SEGONS',
    quickTitle: 'Tres idees per entendre la tesi abans d’entrar en detall.',
    quick: [
      ['Visibilitat ≠ control', 'Saber quin inventari tens i on és no decideix quant n’hauries de tenir.'],
      ['El cost és a la política', 'Reposició, stock de seguretat i transferències continuen generant cost si les regles no canvien.'],
      ['Control significa decidir', 'L’optimització comença quan el sistema recomana quant, quan i on actuar.'],
    ],
    contents: 'EN AQUESTA ANÀLISI',
    contentsTitle: 'De la dada a la decisió',
    introTitle: 'Context i tesi',
    sectionTitles: ['Dades en temps real', 'Visibilitat vs. control', 'Límits del reporting', 'Optimització: trade-offs'],
    businessLabel: 'QUÈ SIGNIFICA PER A LA TEVA EMPRESA',
    businessTitle: 'Si veus millor l’inventari però continues decidint igual, has millorat la visibilitat, no el control.',
    businessBody: 'La pregunta útil no és quantes dades pots consultar. És quantes decisions d’inventari encara depenen de regles fixes, excepcions i criteri manual.',
    nextLabel: 'CONTINUA DES D’AQUÍ',
    nextTitle: 'De l’anàlisi a l’aplicació.',
    cards: [
      ['01', 'Vols veure un cas aplicat?', 'Explorar forecasting i inventari', '/projects/ecommerce-demand-forecasting'],
      ['02', 'Vols continuar explorant aquesta branca?', 'Explorar operacions i optimització', '/knowledge?area=operations'],
      ['03', 'Et passa alguna cosa semblant?', 'Explica’ns el teu cas', '/contact?intent=problem'],
    ],
  },
  en: {
    back: 'Knowledge',
    label: 'ANALYSIS · OPERATIONS & OPTIMISATION',
    title: 'Inventory visibility ≠ inventory control',
    dek: 'Seeing more data is not enough. Value appears when information changes how you decide what to replenish, how much stock to hold and where to position it.',
    quickLabel: 'THE ARTICLE IN 30 SECONDS',
    quickTitle: 'Three ideas to understand the thesis before going deeper.',
    quick: [
      ['Visibility ≠ control', 'Knowing what inventory you have and where it sits does not decide how much you should hold.'],
      ['The cost lives in policy', 'Replenishment, safety stock and transfer rules still create cost if the rules do not change.'],
      ['Control means deciding', 'Optimisation starts when the system recommends how much, when and where to act.'],
    ],
    contents: 'IN THIS ANALYSIS',
    contentsTitle: 'From data to decision',
    introTitle: 'Context & thesis',
    sectionTitles: ['Real-time data', 'Visibility vs. control', 'Reporting limits', 'Optimisation trade-offs'],
    businessLabel: 'WHAT THIS MEANS FOR YOUR BUSINESS',
    businessTitle: 'If you can see inventory better but still make the same decisions, you improved visibility, not control.',
    businessBody: 'The useful question is not how much data you can access. It is how many inventory decisions still depend on fixed rules, exceptions and manual judgement.',
    nextLabel: 'CONTINUE FROM HERE',
    nextTitle: 'From analysis to application.',
    cards: [
      ['01', 'Want to see an applied case?', 'Explore forecasting and inventory', '/projects/ecommerce-demand-forecasting'],
      ['02', 'Want to keep exploring this branch?', 'Explore operations and optimisation', '/knowledge?area=operations'],
      ['03', 'Facing something similar?', 'Tell us about your case', '/contact?intent=problem'],
    ],
  },
} as const

export default function KnowledgeArticleGoldStandard({ article }: { article: Article }) {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]
  const body = lang === 'en' ? article.bodyEn : lang === 'ca' ? (article.bodyCa || article.bodyEs) : article.bodyEs
  const segments = parseBody(body)
  const headings = segments.filter((segment): segment is Extract<Segment, { type: 'section' }> => segment.type === 'section')

  return (
    <main className="bg-[#FAFAF7] text-slate-950">
      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1380px] pb-10 pt-8 sm:w-[calc(100%_-_48px)] lg:pb-12">
          <Link href="/knowledge" className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-500 transition hover:text-slate-950">
            ← {t.back}
          </Link>

          <div className="mt-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-indigo-700">{t.label}</p>
            <h1 className="mt-5 max-w-[1200px] text-[42px] leading-[1.02] tracking-[-0.03em] text-slate-950 sm:text-[50px] lg:text-[56px]" style={{ fontFamily: 'var(--font-playfair)' }}>
              {t.title}
            </h1>
            <p className="mt-5 max-w-[920px] text-[19px] leading-8 text-[#1D2B44]">{t.dek}</p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1380px] py-9 sm:w-[calc(100%_-_48px)] lg:py-11">
          <div className="grid gap-7 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-indigo-700">{t.quickLabel}</p>
            <div>
              <h2 className="max-w-3xl text-[29px] leading-tight text-slate-950 sm:text-[33px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.quickTitle}</h2>
              <div className="mt-6 grid border-l border-t border-slate-300 lg:grid-cols-3">
                {t.quick.map(([titleText, bodyText], index) => (
                  <div key={titleText} className={`min-h-[185px] border-b border-r border-slate-300 p-6 ${index === 1 ? 'bg-[#EDF2F6]' : 'bg-white'}`}>
                    <p className="font-mono text-[13px] font-semibold text-indigo-700">0{index + 1}</p>
                    <h3 className="mt-5 text-[22px] font-semibold leading-7 text-slate-950">{titleText}</h3>
                    <p className="mt-3 text-[16px] leading-7 text-slate-700">{bodyText}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[calc(100%_-_32px)] max-w-[1280px] py-10 sm:w-[calc(100%_-_48px)] lg:py-14">
        <div className="lg:grid lg:grid-cols-[minmax(0,860px)_280px] lg:justify-center lg:gap-16 lg:items-start">
          <article className="border-t border-slate-400">
            {segments.map((segment, segmentIndex) => {
              if (segment.type === 'intro') {
                return (
                  <div key={segmentIndex} id="article-context" className="scroll-mt-28 border-b border-slate-300 bg-white px-6 py-8 md:px-8 md:py-9">
                    <div className="space-y-6">
                      {segment.paragraphs.map((paragraph, index) => (
                        <p key={index} className="hyphens-auto text-justify text-[18px] leading-9 text-[#1D2B44]">{renderInline(paragraph)}</p>
                      ))}
                    </div>
                  </div>
                )
              }

              const sectionNumber = segments
                .slice(0, segmentIndex + 1)
                .filter((item) => item.type === 'section').length
              const displayHeading = t.sectionTitles[sectionNumber - 1] || segment.heading

              return (
                <section key={`${segment.heading}-${segmentIndex}`} id={`section-${sectionNumber}`} className="border-b border-slate-300 bg-white px-6 py-9 md:px-8 md:py-10">
                  <div className="grid gap-5 md:grid-cols-[52px_1fr]">
                    <span className="font-mono text-[13px] font-semibold text-indigo-700">{String(sectionNumber).padStart(2, '0')}</span>
                    <div>
                      <h2 className="max-w-[24ch] text-[29px] leading-[1.08] text-slate-950 sm:text-[33px]" style={{ fontFamily: 'var(--font-playfair)' }}>
                        {displayHeading}
                      </h2>
                      <div className="mt-6 space-y-6">
                        {segment.paragraphs.map((paragraph, index) => (
                          <p key={index} className="hyphens-auto text-justify text-[17px] leading-8 text-slate-700">{renderInline(paragraph)}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )
            })}
          </article>

          <aside className="sticky top-24 mt-8 hidden self-start lg:mt-0 lg:block">
            <div className="border border-slate-300 bg-[#F4F1EA] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-700">{t.contents}</p>
              <p className="mt-2 text-[22px] leading-tight text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{t.contentsTitle}</p>

              <nav className="mt-5 border-t border-slate-300">
                <a
                  href="#article-context"
                  className="grid grid-cols-[30px_1fr] gap-2 border-b border-slate-300 py-4 text-[14px] font-semibold leading-5 text-slate-800 transition hover:text-indigo-700"
                >
                  <span className="font-mono text-[12px] text-indigo-700">00</span>
                  <span>{t.introTitle}</span>
                </a>

                {headings.map((section, index) => (
                  <a
                    key={section.heading}
                    href={`#section-${index + 1}`}
                    className="grid grid-cols-[30px_1fr] gap-2 border-b border-slate-300 py-4 text-[14px] font-medium leading-5 text-slate-700 transition hover:text-indigo-700"
                  >
                    <span className="font-mono text-[12px] text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                    <span>{t.sectionTitles[index] || section.heading}</span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-slate-300 bg-[#F4F1EA]">
        <div className="mx-auto grid w-[calc(100%_-_32px)] max-w-[1380px] gap-7 py-10 sm:w-[calc(100%_-_48px)] lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-indigo-700">{t.businessLabel}</p>
          <div>
            <h2 className="max-w-4xl text-[31px] leading-[1.08] text-slate-950 sm:text-[37px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.businessTitle}</h2>
            <p className="mt-4 max-w-3xl text-[17px] leading-8 text-slate-700">{t.businessBody}</p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1380px] py-10 sm:w-[calc(100%_-_48px)] lg:py-12">
          <div className="text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-indigo-700">{t.nextLabel}</p>
            <h2 className="mt-3 text-[31px] leading-tight text-slate-950 sm:text-[36px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.nextTitle}</h2>
          </div>

          <div className="mt-7 grid border-l border-t border-slate-300 lg:grid-cols-3">
            {t.cards.map(([number, question, action, href], index) => (
              <Link
                key={href}
                href={href}
                className={`group flex min-h-[210px] flex-col border-b border-r border-slate-300 p-6 transition ${
                  index === 1 ? 'bg-[#F4F1EA] hover:bg-[#EEEAE1]' : index === 2 ? 'bg-[#0D1B2A] text-white hover:bg-[#13283C]' : 'bg-white hover:bg-[#FAFAF7]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`font-mono text-[13px] font-semibold ${index === 2 ? 'text-[#7A7DFF]' : 'text-indigo-700'}`}>{number}</span>
                  <ArrowRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${index === 2 ? 'text-white' : 'text-slate-500'}`} />
                </div>
                <p className={`mt-6 max-w-[23ch] text-[24px] leading-[1.1] ${index === 2 ? 'text-white' : 'text-[#1D2B44]'}`} style={{ fontFamily: 'var(--font-playfair)' }}>
                  {question}
                </p>
                <p className={`mt-auto pt-6 text-[16px] font-semibold ${index === 2 ? 'text-white' : 'text-indigo-700'}`}>{action}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
