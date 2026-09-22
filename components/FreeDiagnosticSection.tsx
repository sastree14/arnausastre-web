'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY={
  es:{eyebrow:'PRIMERA SESIÓN · GRATUITA',title:'30 minutos para entender dónde puede haber valor — incluso donde todavía no lo estás buscando.',body:'No necesitas llegar con una solución ni con un proyecto definido. Revisamos contigo el negocio, el proceso o la decisión y buscamos oportunidades que puedan estar escondidas en los datos, la planificación, la automatización o la forma de operar.',points:['Sin compromiso de contratar','Conversación con criterio técnico y de negocio','Si no merece la pena construir, también te lo diremos'],button:'Reservar diagnóstico gratuito'},
  ca:{eyebrow:'PRIMERA SESSIÓ · GRATUÏTA',title:'30 minuts per entendre on pot haver-hi valor — fins i tot on encara no l’estàs buscant.',body:'No cal arribar amb una solució ni amb un projecte definit. Revisem amb tu el negoci, el procés o la decisió i busquem oportunitats que poden estar amagades en les dades, la planificació, l’automatització o la manera d’operar.',points:['Sense compromís de contractar','Conversa amb criteri tècnic i de negoci','Si no val la pena construir, també t’ho direm'],button:'Reservar diagnòstic gratuït'},
  en:{eyebrow:'FIRST SESSION · FREE',title:'30 minutes to understand where value may exist — including where you are not looking yet.',body:'You do not need to arrive with a solution or a defined project. We review the business, process or decision with you and look for opportunities that may be hidden in data, planning, automation or the way the operation works.',points:['No commitment to hire us','Business and technical judgment in the same conversation','If nothing should be built, we will say that too'],button:'Book a free diagnostic'},
} as const

export default function FreeDiagnosticSection(){
  const {lang}=useSiteLanguage(),t=COPY[lang]
  return <section className="border-y border-slate-200 bg-indigo-50"><div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center"><div><p className="text-xs font-semibold uppercase tracking-[.22em] text-indigo-600">{t.eyebrow}</p><h2 className="mt-4 max-w-4xl text-3xl leading-tight md:text-4xl" style={{fontFamily:'var(--font-playfair)'}}>{t.title}</h2><p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{t.body}</p></div><div><div className="divide-y divide-indigo-100 border-y border-indigo-100">{t.points.map((p,i)=><div key={p} className="flex gap-4 py-4"><span className="text-xs font-semibold text-indigo-600">0{i+1}</span><p className="text-sm leading-6 text-slate-700">{p}</p></div>)}</div><Link href="/contact?intent=discovery" className="mt-6 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">{t.button}</Link></div></div></section>
}
