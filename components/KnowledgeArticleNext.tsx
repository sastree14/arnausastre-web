import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { KNOWLEDGE_SERVICES, serviceHref, type KnowledgeServiceKey } from '@/lib/knowledge-editorial'

type Props = {
  locale: 'es' | 'ca' | 'en'
  serviceKey: KnowledgeServiceKey
  relatedHref?: string
  relatedTitle?: string
  relatedArticles?: Array<{ href: string; title?: string }>
  branchHref: string
}

const COPY = {
  es: {
    label: 'SIGUE DESDE AQUÍ',
    title: 'Del análisis a la aplicación.',
    serviceQuestion: '¿Quieres ver cómo resolvemos este tipo de problema?',
    relatedQuestion: '¿Quieres profundizar en la misma decisión?',
    relatedAction: 'Leer análisis relacionado',
    branchQuestion: '¿Quieres seguir explorando esta rama?',
    branchAction: 'Explorar más análisis',
    contactQuestion: '¿Te ocurre algo parecido?',
    contactAction: 'Cuéntanos tu caso',
    relatedLabel: 'LECTURAS RELACIONADAS',
  },
  ca: {
    label: 'CONTINUA DES D’AQUÍ',
    title: 'De l’anàlisi a l’aplicació.',
    serviceQuestion: 'Vols veure com resolem aquest tipus de problema?',
    relatedQuestion: 'Vols aprofundir en la mateixa decisió?',
    relatedAction: 'Llegir anàlisi relacionada',
    branchQuestion: 'Vols continuar explorant aquesta branca?',
    branchAction: 'Explorar més anàlisis',
    contactQuestion: 'Et passa alguna cosa semblant?',
    contactAction: 'Explica’ns el teu cas',
    relatedLabel: 'LECTURES RELACIONADES',
  },
  en: {
    label: 'CONTINUE FROM HERE',
    title: 'From analysis to application.',
    serviceQuestion: 'Want to see how we approach this kind of problem?',
    relatedQuestion: 'Want to go deeper on the same decision?',
    relatedAction: 'Read related analysis',
    branchQuestion: 'Want to keep exploring this branch?',
    branchAction: 'Explore more analysis',
    contactQuestion: 'Facing something similar?',
    contactAction: 'Tell us about your case',
    relatedLabel: 'RELATED ANALYSIS',
  },
} as const

export default function KnowledgeArticleNext({ locale, serviceKey, relatedHref, relatedTitle, relatedArticles = [], branchHref }: Props) {
  const t = COPY[locale]
  const service = KNOWLEDGE_SERVICES[serviceKey]
  const secondHref = relatedHref || branchHref
  const secondQuestion = relatedHref ? t.relatedQuestion : t.branchQuestion
  const secondAction = relatedHref ? (relatedTitle || t.relatedAction) : t.branchAction

  const cards = [
    ['01', t.serviceQuestion, service.cta[locale], serviceHref(serviceKey)],
    ['02', secondQuestion, secondAction, secondHref],
    ['03', t.contactQuestion, t.contactAction, '/contact?intent=problem'],
  ] as const

  return (
    <section className="bg-white">
      <div className="site-container py-10 lg:py-12">
        <div className="text-center">
          <p className="text-[14px] font-semibold uppercase tracking-[0.15em] text-[#4F46E5]">{t.label}</p>
          <h2 className="mt-3 text-[31px] leading-tight text-slate-950 sm:text-[36px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h2>
        </div>
        {relatedArticles.length > 1 ? (
          <div className="mx-auto mt-7 max-w-[1180px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t.relatedLabel}</p>
            <div className="mt-3 grid border-l border-t border-slate-300 md:grid-cols-3">
              {relatedArticles.slice(0, 3).map((item, index) => (
                <Link key={item.href} href={item.href} className="group flex min-h-[128px] flex-col border-b border-r border-slate-300 bg-[#FAFAF7] p-5 text-left transition hover:bg-[#F4F1EA]">
                  <span className="font-mono text-[12px] font-semibold text-[#4F46E5]">{String(index + 1).padStart(2, '0')}</span>
                  <span className="mt-5 text-[16px] font-semibold leading-6 text-[#1D2B44]">{item.title || t.relatedAction}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-7 grid border-l border-t border-slate-300 lg:grid-cols-3">
          {cards.map(([number, question, action, href], index) => (
            <Link key={`${number}-${href}`} href={href} className={`group flex min-h-[220px] flex-col border-b border-r border-slate-300 p-7 transition ${index === 1 ? 'bg-[#F4F1EA]' : index === 2 ? 'bg-[#0D1B2A] text-white hover:bg-[#254A66]' : 'bg-white hover:bg-[#FAFAF7]'}`}>
              <div className="flex items-start justify-between gap-4">
                <span className={`font-mono text-[14px] font-semibold ${index === 2 ? 'text-[#7A7DFF]' : 'text-[#4F46E5]'}`}>{number}</span>
                <ArrowRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${index === 2 ? 'text-white' : 'text-slate-500'}`} />
              </div>
              <p className={`mt-6 max-w-[23ch] text-[24px] leading-[1.1] ${index === 2 ? 'text-white' : 'text-[#1D2B44]'}`} style={{ fontFamily: 'var(--font-playfair)' }}>{question}</p>
              <p className={`mt-auto pt-6 text-[15px] font-semibold ${index === 2 ? 'text-white' : 'text-[#4F46E5]'}`}>{action}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
