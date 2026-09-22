'use client'

import Image from 'next/image'
import Link from 'next/link'
import FreeDiagnosticSection from '@/components/FreeDiagnosticSection'
import NewsletterSignup from '@/components/NewsletterSignup'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY={
  es:{
    eyebrow:'PARTNER ANALÍTICO',
    title:'Una capa analítica externa que aprende tu negocio y vuelve a entrar cuando aparece una nueva decisión.',
    intro:'No todas las empresas necesitan contratar un equipo interno completo de Data Science, IA, optimización y automatización. Sí pueden necesitar acceso continuo a esas capacidades cuando el negocio lo pide.',
    whatTitle:'Qué significa en la práctica',
    what:[
      ['Empezamos por problemas reales','No partimos de una herramienta. Partimos de una decisión, una operación, un cuello de botella o una oportunidad.'],
      ['Conservamos contexto','Cada proyecto aumenta el conocimiento del negocio y reduce el coste de volver a empezar desde cero.'],
      ['Entramos con la especialidad necesaria','Forecasting, optimización, ML, agentes IA, BI, data engineering o simulación según el problema.'],
      ['Podemos ser puntuales o recurrentes','Un único proyecto no obliga a una relación larga. La continuidad aparece solo si sigue creando valor.'],
    ],
    compareTitle:'No es externalizar un departamento entero.',
    compareBody:'El objetivo es mantener una estructura ligera y acceder a capacidad especialista cuando tiene sentido. Algunas empresas nos utilizan para un proyecto; otras para acompañar decisiones, sistemas y automatizaciones a lo largo del tiempo.',
    bestTitle:'Cuándo suele tener sentido',
    best:['No tienes un equipo interno de Data Science completo.','Tienes analistas o perfiles técnicos, pero necesitas profundidad especialista.','Hay varios problemas de datos/IA dispersos y quieres una relación que conserve contexto.','Quieres validar oportunidades antes de invertir en una contratación o plataforma grande.'],
    cta:'Hablar de vuestro caso',
  },
  ca:{
    eyebrow:'PARTNER ANALÍTIC',
    title:'Una capa analítica externa que aprèn el teu negoci i torna a entrar quan apareix una nova decisió.',
    intro:'No totes les empreses necessiten contractar un equip intern complet de Data Science, IA, optimització i automatització. Sí que poden necessitar accés continu a aquestes capacitats quan el negoci ho demana.',
    whatTitle:'Què significa a la pràctica',
    what:[
      ['Comencem per problemes reals','No partim d’una eina. Partim d’una decisió, una operació, un coll d’ampolla o una oportunitat.'],
      ['Conservem context','Cada projecte augmenta el coneixement del negoci i redueix el cost de tornar a començar des de zero.'],
      ['Entrem amb l’especialitat necessària','Forecasting, optimització, ML, agents IA, BI, data engineering o simulació segons el problema.'],
      ['Podem ser puntuals o recurrents','Un únic projecte no obliga a una relació llarga. La continuïtat apareix només si continua creant valor.'],
    ],
    compareTitle:'No és externalitzar un departament sencer.',
    compareBody:'L’objectiu és mantenir una estructura lleugera i accedir a capacitat especialista quan té sentit. Algunes empreses ens utilitzen per a un projecte; altres per acompanyar decisions, sistemes i automatitzacions al llarg del temps.',
    bestTitle:'Quan acostuma a tenir sentit',
    best:['No tens un equip intern complet de Data Science.','Tens analistes o perfils tècnics, però necessites profunditat especialista.','Hi ha diversos problemes de dades/IA dispersos i vols una relació que conservi context.','Vols validar oportunitats abans d’invertir en una contractació o plataforma gran.'],
    cta:'Parlar del vostre cas',
  },
  en:{
    eyebrow:'ANALYTICAL PARTNER',
    title:'An external analytical layer that learns the business and returns when a new decision appears.',
    intro:'Not every company needs to hire a complete internal Data Science, AI, optimisation and automation team. Many do need continued access to those capabilities when the business requires them.',
    whatTitle:'What it means in practice',
    what:[
      ['Start from real problems','We do not start with a tool. We start with a decision, an operation, a bottleneck or an opportunity.'],
      ['Retain context','Every project increases business knowledge and reduces the cost of starting from zero again.'],
      ['Bring the right specialism','Forecasting, optimisation, ML, AI agents, BI, data engineering or simulation according to the problem.'],
      ['Project-based or ongoing','One project never commits you to a long relationship. Continuity exists only while it keeps creating value.'],
    ],
    compareTitle:'It is not outsourcing an entire department.',
    compareBody:'The objective is to keep your structure lean while accessing specialist capability when it makes sense. Some companies use us for one project; others involve us across decisions, systems and automations over time.',
    bestTitle:'When it tends to make sense',
    best:['You do not have a complete internal Data Science team.','You have analysts or technical profiles but need specialist depth.','Several Data/AI problems are emerging and you want one relationship that retains context.','You want to validate opportunities before committing to a large hire or platform.'],
    cta:'Discuss your situation',
  },
} as const

export default function AnalyticalPartnerPage(){
  const {lang}=useSiteLanguage(),t=COPY[lang]
  return <main className="bg-white text-slate-950">
    <section className="border-b border-slate-800 bg-slate-950 text-white"><div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:py-28 lg:grid-cols-[1.15fr_.85fr] lg:items-center"><div><p className="text-xs font-semibold uppercase tracking-[.22em] text-indigo-300">{t.eyebrow}</p><h1 className="mt-5 max-w-4xl text-5xl leading-[1.07] md:text-6xl" style={{fontFamily:'var(--font-playfair)'}}>{t.title}</h1><p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">{t.intro}</p><Link href="/contact" className="mt-8 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950">{t.cta}</Link></div><div className="relative hidden min-h-[300px] items-center justify-center lg:flex"><div className="absolute h-64 w-64 rounded-full border border-indigo-300/10"/><Image src="/brand/logo-horizontal-transparent.png" alt="SC-Analytics" width={620} height={320} className="relative z-10 w-full max-w-md object-contain"/></div></div></section>
    <section className="mx-auto max-w-7xl px-6 py-20"><h2 className="text-4xl" style={{fontFamily:'var(--font-playfair)'}}>{t.whatTitle}</h2><div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">{t.what.map(([title,body],i)=><article key={title} className="grid gap-3 py-6 md:grid-cols-[70px_260px_1fr]"><span className="text-xs font-semibold text-indigo-600">0{i+1}</span><h3 className="font-semibold">{title}</h3><p className="max-w-2xl text-sm leading-7 text-slate-600">{body}</p></article>)}</div></section>
    <section className="border-y border-slate-200 bg-slate-50"><div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2"><div><h2 className="text-4xl" style={{fontFamily:'var(--font-playfair)'}}>{t.compareTitle}</h2><p className="mt-5 max-w-xl text-base leading-8 text-slate-600">{t.compareBody}</p></div><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-indigo-600">{t.bestTitle}</p><div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">{t.best.map((item,i)=><div key={item} className="flex gap-4 py-4"><span className="text-xs font-semibold text-indigo-600">0{i+1}</span><p className="text-sm leading-6 text-slate-700">{item}</p></div>)}</div></div></div></section>
    <FreeDiagnosticSection />
    <section className="mx-auto max-w-7xl px-6 py-20"><NewsletterSignup /></section>
  </main>
}
