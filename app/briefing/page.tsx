'use client'

import Link from 'next/link'
import NewsletterSignup from '@/components/NewsletterSignup'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY={
  es:{
    eyebrow:'SC-ANALYTICS BRIEFING',
    title:'Una newsletter sobre dónde Data e IA están creando valor de verdad.',
    intro:'No queremos enviar un resumen genérico de noticias. Seleccionamos señales que cambian una decisión: sectores que están evolucionando, empresas con movimientos interesantes, problemas operativos que se repiten y casos donde forecasting, optimización, automatización o IA están generando una ventaja medible.',
    blocks:[
      ['Sectores e industrias','Qué está cambiando en retail, logística, manufacturing, servicios profesionales, salud, hospitality, finanzas y otros sectores cuando aparece una consecuencia operativa o económica clara.'],
      ['Empresas y casos públicos','Movimientos de empresas reales, casos públicos y sistemas que han producido resultados verificables. Cuando no existe evidencia suficiente, no lo presentamos como éxito.'],
      ['Actualidad con criterio','Noticias de IA, datos y automatización filtradas por impacto empresarial. Menos “nueva herramienta”; más “qué decisión cambia y para quién”.'],
      ['Sistemas que sí se pueden construir','Forecasting, optimización, agentes IA, reinforcement learning, ERP/CRM, R Shiny, data engineering y otros enfoques explicados desde el problema, no desde la tecnología.'],
    ],
    cadence:'Cadencia',
    cadenceBody:'La idea es breve y selectiva: se envía cuando hay material nuevo que merezca la pena leer. No rellenamos una frecuencia si no hay nada útil.',
    evidence:'Criterio editorial',
    evidenceBody:'Diferenciamos experiencia propia, evidencia pública, ejemplos ilustrativos y opinión. Los enlaces a fuentes se conservan en el research editorial para no convertir una afirmación en marketing por accidente.',
    archive:'Ver análisis y artículos',
  },
  ca:{
    eyebrow:'SC-ANALYTICS BRIEFING',
    title:'Una newsletter sobre on dades i IA estan creant valor de veritat.',
    intro:'No volem enviar un resum genèric de notícies. Seleccionem senyals que canvien una decisió: sectors que evolucionen, empreses amb moviments interessants, problemes operatius que es repeteixen i casos on forecasting, optimització, automatització o IA generen un avantatge mesurable.',
    blocks:[
      ['Sectors i indústries','Què està canviant en retail, logística, manufactura, serveis professionals, salut, hospitality, finances i altres sectors quan apareix una conseqüència operativa o econòmica clara.'],
      ['Empreses i casos públics','Moviments d’empreses reals, casos públics i sistemes que han produït resultats verificables. Quan no hi ha prou evidència, no ho presentem com un èxit.'],
      ['Actualitat amb criteri','Notícies d’IA, dades i automatització filtrades per impacte empresarial. Menys “nova eina”; més “quina decisió canvia i per a qui”.'],
      ['Sistemes que sí es poden construir','Forecasting, optimització, agents IA, reinforcement learning, ERP/CRM, R Shiny, data engineering i altres enfocaments explicats des del problema, no des de la tecnologia.'],
    ],
    cadence:'Cadència',
    cadenceBody:'La idea és breu i selectiva: s’envia quan hi ha material nou que val la pena llegir. No omplim una freqüència si no hi ha res útil.',
    evidence:'Criteri editorial',
    evidenceBody:'Diferenciem experiència pròpia, evidència pública, exemples il·lustratius i opinió. Els enllaços a fonts es conserven al research editorial per no convertir una afirmació en màrqueting per accident.',
    archive:'Veure anàlisis i articles',
  },
  en:{
    eyebrow:'SC-ANALYTICS BRIEFING',
    title:'A newsletter about where Data and AI are creating real business value.',
    intro:'We do not want to send a generic news roundup. We select signals that change a decision: sectors that are evolving, companies making interesting moves, recurring operational problems and cases where forecasting, optimisation, automation or AI are producing measurable leverage.',
    blocks:[
      ['Sectors and industries','What is changing across retail, logistics, manufacturing, professional services, healthcare, hospitality, finance and other industries when there is a clear operational or economic consequence.'],
      ['Companies and public cases','Moves by real companies, public cases and systems with verifiable outcomes. When evidence is insufficient, we do not present something as a success story.'],
      ['Current events with judgment','AI, data and automation news filtered by business impact. Less “new tool”; more “which decision changes and for whom”.'],
      ['Systems worth building','Forecasting, optimisation, AI agents, reinforcement learning, ERP/CRM, R Shiny, data engineering and other approaches explained from the problem rather than the technology.'],
    ],
    cadence:'Cadence',
    cadenceBody:'The briefing is concise and selective: it goes out when there is genuinely useful new material. We do not manufacture frequency when there is nothing worth sending.',
    evidence:'Editorial standard',
    evidenceBody:'We distinguish first-hand experience, public evidence, illustrative examples and opinion. Source links stay attached to the editorial research so claims do not quietly turn into marketing.',
    archive:'Browse analysis and articles',
  },
} as const

export default function BriefingPage(){
  const {lang}=useSiteLanguage()
  const t=COPY[lang]
  return <main className="bg-white text-slate-950">
    <section className="border-b border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <p className="text-xs font-semibold uppercase tracking-[.22em] text-indigo-300">{t.eyebrow}</p>
        <h1 className="mt-5 max-w-5xl text-5xl leading-[1.06] md:text-6xl" style={{fontFamily:'var(--font-playfair)'}}>{t.title}</h1>
        <p className="mt-7 max-w-4xl text-lg leading-8 text-slate-300">{t.intro}</p>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 md:grid-cols-2">
        {t.blocks.map(([title,body],index)=><article key={title} className="bg-white p-7 md:p-9"><p className="text-xs font-semibold text-indigo-600">0{index+1}</p><h2 className="mt-4 text-2xl" style={{fontFamily:'var(--font-playfair)'}}>{title}</h2><p className="mt-4 text-sm leading-7 text-slate-600">{body}</p></article>)}
      </div>
    </section>

    <section className="border-y border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-2">
        <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-indigo-600">{t.cadence}</p><p className="mt-3 max-w-xl text-base leading-8 text-slate-600">{t.cadenceBody}</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-indigo-600">{t.evidence}</p><p className="mt-3 max-w-xl text-base leading-8 text-slate-600">{t.evidenceBody}</p></div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-6 py-20"><NewsletterSignup/><div className="mt-6 text-center"><Link href="/knowledge" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">{t.archive} →</Link></div></section>
  </main>
}
