'use client'

import Image from 'next/image'
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

function parseBody(body: string): Segment[] {
  const paragraphs = body.split('\n\n').map((part) => part.trim()).filter(Boolean)
  const segments: Segment[] = []
  let current: Segment = { type: 'intro', paragraphs: [] }

  for (const paragraph of paragraphs) {
    if (/^\*\*[^*]+\*\*$/.test(paragraph)) {
      if (current.paragraphs.length) segments.push(current)
      current = { type: 'section', heading: paragraph.slice(2, -2), paragraphs: [] }
    } else {
      current.paragraphs.push(paragraph)
    }
  }

  if (current.paragraphs.length) segments.push(current)
  return segments
}

const COPY = {
  es: {
    back: 'Conocimiento',
    label: 'ANÁLISIS · OPERACIONES Y OPTIMIZACIÓN',
    min: 'min de lectura',
    quickLabel: 'EL ARTÍCULO EN 30 SEGUNDOS',
    quickTitle: 'La idea central, antes de entrar en detalle.',
    quick: [
      ['Visibilidad ≠ control', 'Saber qué inventario tienes y dónde está no decide cuánto deberías tener.'],
      ['El coste está en la política', 'Stock de seguridad, reposición y transferencias siguen generando coste aunque el dashboard sea perfecto.'],
      ['Control significa decidir', 'La optimización empieza cuando el sistema recomienda cuánto, cuándo y dónde actuar.'],
    ],
    visualLabel: 'IDEA CENTRAL',
    visualTitle: 'Ver el inventario responde qué tienes y dónde. Controlarlo responde cuánto deberías tener, cuándo reponer y dónde posicionarlo.',
    contents: 'EN ESTE ANÁLISIS',
    businessLabel: 'QUÉ SIGNIFICA PARA TU EMPRESA',
    businessTitle: 'Si el dashboard mejora pero las decisiones no cambian, probablemente has mejorado la visibilidad, no el control.',
    businessBody: 'El diagnóstico útil no es cuántos datos ves. Es cuántas decisiones de inventario siguen dependiendo de reglas fijas, excepciones y criterio manual.',
    nextLabel: 'CONTINÚA ESTA IDEA',
    nextTitle: 'Del análisis a la aplicación.',
    cards: [
      ['01', '¿Quieres ver un caso aplicado?', 'Explorar forecasting e inventario', '/projects/ecommerce-demand-forecasting'],
      ['02', '¿Quieres seguir profundizando?', 'Ver más análisis', '/knowledge'],
      ['03', '¿Te ocurre algo parecido?', 'Cuéntanos tu caso', '/contact?intent=problem'],
    ],
  },
  ca: {
    back: 'Coneixement',
    label: 'ANÀLISI · OPERACIONS I OPTIMITZACIÓ',
    min: 'min de lectura',
    quickLabel: 'L’ARTICLE EN 30 SEGONS',
    quickTitle: 'La idea central, abans d’entrar en detall.',
    quick: [
      ['Visibilitat ≠ control', 'Saber quin inventari tens i on és no decideix quant n’hauries de tenir.'],
      ['El cost és a la política', 'Safety stock, reposició i transferències continuen generant cost encara que el dashboard sigui perfecte.'],
      ['Control significa decidir', 'L’optimització comença quan el sistema recomana quant, quan i on actuar.'],
    ],
    visualLabel: 'IDEA CENTRAL',
    visualTitle: 'Veure l’inventari respon què tens i on. Controlar-lo respon quant n’hauries de tenir, quan reposar i on posicionar-lo.',
    contents: 'EN AQUESTA ANÀLISI',
    businessLabel: 'QUÈ SIGNIFICA PER A LA TEVA EMPRESA',
    businessTitle: 'Si el dashboard millora però les decisions no canvien, probablement has millorat la visibilitat, no el control.',
    businessBody: 'El diagnòstic útil no és quantes dades veus. És quantes decisions d’inventari encara depenen de regles fixes, excepcions i criteri manual.',
    nextLabel: 'CONTINUA AQUESTA IDEA',
    nextTitle: 'De l’anàlisi a l’aplicació.',
    cards: [
      ['01', 'Vols veure un cas aplicat?', 'Explorar forecasting i inventari', '/projects/ecommerce-demand-forecasting'],
      ['02', 'Vols continuar aprofundint?', 'Veure més anàlisis', '/knowledge'],
      ['03', 'Et passa alguna cosa semblant?', 'Explica’ns el teu cas', '/contact?intent=problem'],
    ],
  },
  en: {
    back: 'Knowledge',
    label: 'ANALYSIS · OPERATIONS & OPTIMISATION',
    min: 'min read',
    quickLabel: 'THE ARTICLE IN 30 SECONDS',
    quickTitle: 'The central idea before going deeper.',
    quick: [
      ['Visibility ≠ control', 'Knowing what inventory you have and where it sits does not decide how much you should hold.'],
      ['The cost lives in policy', 'Safety stock, replenishment and transfer rules still create cost even when the dashboard is perfect.'],
      ['Control means deciding', 'Optimisation starts when the system recommends how much, when and where to act.'],
    ],
    visualLabel: 'CENTRAL IDEA',
    visualTitle: 'Seeing inventory answers what you have and where. Controlling it answers how much you should hold, when to replenish and where to position it.',
    contents: 'IN THIS ANALYSIS',
    businessLabel: 'WHAT THIS MEANS FOR YOUR BUSINESS',
    businessTitle: 'If the dashboard improves but decisions do not change, you probably improved visibility, not control.',
    businessBody: 'The useful diagnostic is not how much data you can see. It is how many inventory decisions still depend on fixed rules, exceptions and manual judgement.',
    nextLabel: 'CONTINUE THIS IDEA',
    nextTitle: 'From analysis to application.',
    cards: [
      ['01', 'Want to see an applied case?', 'Explore forecasting and inventory', '/projects/ecommerce-demand-forecasting'],
      ['02', 'Want to keep going deeper?', 'See more analysis', '/knowledge'],
      ['03', 'Facing something similar?', 'Tell us about your case', '/contact?intent=problem'],
    ],
  },
} as const

export default function KnowledgeArticleGoldStandard({ article }: { article: Article }) {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]
  const title = lang === 'en' ? article.titleEn : lang === 'ca' ? (article.titleCa || article.titleEs) : article.titleEs
  const excerpt = lang === 'en' ? article.excerptEn : lang === 'ca' ? (article.excerptCa || article.excerptEs) : article.excerptEs
  const body = lang === 'en' ? article.bodyEn : lang === 'ca' ? (article.bodyCa || article.bodyEs) : article.bodyEs
  const segments = parseBody(body)
  const headings = segments.filter((segment): segment is Extract<Segment, { type: 'section' }> => segment.type === 'section')

  return (
    <main className="bg-[#FAFAF7] text-slate-950">
      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1800px] pb-10 pt-9 sm:w-[calc(100%_-_48px)] lg:pb-12">
          <Link href="/knowledge" className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-500 transition hover:text-slate-950">
            ← {t.back}
          </Link>

          <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,.88fr)] lg:items-end lg:gap-[clamp(40px,5vw,90px)]">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-indigo-700">{t.label}</p>
              <h1 className="mt-5 max-w-5xl text-[43px] leading-[1.01] tracking-[-0.03em] text-slate-950 sm:text-[52px] lg:text-[60px]" style={{ fontFamily: 'var(--font-playfair)' }}>
                {title}
              </h1>
            </div>

            <div className="border-l border-slate-300 pl-6 lg:pl-9">
              <p className="text-[18px] leading-8 text-slate-800">{excerpt}</p>
              <div className="mt-5 flex flex-wrap gap-x-3 gap-y-2 font-mono text-[12px] uppercase tracking-[0.08em] text-slate-500">
                <span>{article.readingTime} {t.min}</span>
                <span>·</span>
                <span>{article.industry}</span>
                <span>·</span>
                <span>{article.audience}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1800px] py-9 sm:w-[calc(100%_-_48px)] lg:py-11">
          <div className="grid gap-7 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-indigo-700">{t.quickLabel}</p>
            <div>
              <h2 className="text-[30px] leading-tight text-slate-950 sm:text-[34px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.quickTitle}</h2>
              <div className="mt-6 grid border-l border-t border-slate-300 lg:grid-cols-3">
                {t.quick.map(([titleText, bodyText], index) => (
                  <div key={titleText} className={`min-h-[190px] border-b border-r border-slate-300 p-6 ${index === 1 ? 'bg-[#EDF2F6]' : 'bg-white'}`}>
                    <p className="font-mono text-[13px] font-semibold text-indigo-700">0{index + 1}</p>
                    <h3 className="mt-5 text-[23px] font-semibold leading-7 text-slate-950">{titleText}</h3>
                    <p className="mt-3 text-[16px] leading-7 text-slate-700">{bodyText}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {article.image ? (
        <section className="border-b border-slate-300 bg-white">
          <div className="mx-auto grid w-[calc(100%_-_32px)] max-w-[1800px] gap-7 py-9 sm:w-[calc(100%_-_48px)] lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)] lg:items-center lg:gap-12 lg:py-11">
            <figure className="overflow-hidden border border-slate-300 bg-[#0D1B2A]">
              <Image src={article.image} alt="" width={1200} height={800} className="h-auto w-full" priority />
            </figure>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-indigo-700">{t.visualLabel}</p>
              <p className="mt-4 max-w-2xl text-[29px] leading-[1.12] tracking-[-0.015em] text-[#1D2B44] sm:text-[34px]" style={{ fontFamily: 'var(--font-playfair)' }}>
                {t.visualTitle}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto w-[calc(100%_-_32px)] max-w-[1460px] py-10 sm:w-[calc(100%_-_48px)] lg:py-14">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-16 lg:items-start">
          <article className="border-t border-slate-400">
            {segments.map((segment, segmentIndex) => {
              if (segment.type === 'intro') {
                return (
                  <div key={segmentIndex} className="border-b border-slate-300 bg-white px-6 py-8 md:px-9 md:py-9">
                    <div className="max-w-[72ch] space-y-5">
                      {segment.paragraphs.map((paragraph, index) => (
                        <p key={index} className="text-[19px] leading-9 text-[#1D2B44]">{renderInline(paragraph)}</p>
                      ))}
                    </div>
                  </div>
                )
              }

              const sectionNumber = headings.findIndex((item) => item.heading === segment.heading) + 1
              return (
                <section key={segment.heading} id={`section-${sectionNumber}`} className="border-b border-slate-300 bg-white px-6 py-9 md:px-9 md:py-11">
                  <div className="grid gap-5 md:grid-cols-[58px_1fr]">
                    <span className="font-mono text-[13px] font-semibold text-indigo-700">{String(sectionNumber).padStart(2, '0')}</span>
                    <div className="max-w-[72ch]">
                      <h2 className="max-w-[28ch] text-[30px] leading-[1.08] text-slate-950 sm:text-[34px]" style={{ fontFamily: 'var(--font-playfair)' }}>
                        {segment.heading}
                      </h2>
                      <div className="mt-6 space-y-5">
                        {segment.paragraphs.map((paragraph, index) => (
                          <p key={index} className="text-[17px] leading-8 text-slate-700">{renderInline(paragraph)}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )
            })}
          </article>

          <aside className="sticky top-24 mt-8 hidden self-start lg:mt-0 lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{t.contents}</p>
            <nav className="mt-4 border-l border-slate-300">
              {headings.map((section, index) => (
                <a key={section.heading} href={`#section-${index + 1}`} className="grid grid-cols-[30px_1fr] gap-2 border-b border-slate-200 py-3.5 pl-4 text-[13px] leading-6 text-slate-600 transition hover:text-indigo-700">
                  <span className="font-mono text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                  <span>{section.heading}</span>
                </a>
              ))}
            </nav>
          </aside>
        </div>
      </section>

      <section className="border-y border-slate-300 bg-[#F4F1EA]">
        <div className="mx-auto grid w-[calc(100%_-_32px)] max-w-[1460px] gap-7 py-10 sm:w-[calc(100%_-_48px)] lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-indigo-700">{t.businessLabel}</p>
          <div>
            <h2 className="max-w-4xl text-[32px] leading-[1.08] text-slate-950 sm:text-[38px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.businessTitle}</h2>
            <p className="mt-4 max-w-3xl text-[17px] leading-8 text-slate-700">{t.businessBody}</p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1460px] py-10 sm:w-[calc(100%_-_48px)] lg:py-12">
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
                <p className={`mt-6 max-w-[21ch] text-[24px] leading-[1.1] ${index === 2 ? 'text-white' : 'text-[#1D2B44]'}`} style={{ fontFamily: 'var(--font-playfair)' }}>
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
