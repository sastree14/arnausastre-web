'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY={
  es:{
    eyebrow:'SC-ANALYTICS BRIEFING',
    title:'Ideas útiles para empresas que quieren decidir mejor.',
    body:'Una selección breve de sectores, empresas, proyectos, artículos y cambios relevantes en Data e IA. Sin relleno y sin convertir tu bandeja de entrada en un canal de ventas.',
    email:'Tu email',
    name:'Nombre (opcional)',
    button:'Quiero recibirlo',
    sending:'Suscribiendo…',
    consent:'Acepto recibir el briefing de SC-Analytics por email. Puedo darme de baja cuando quiera.',
    success:'Perfecto. Ya formas parte del briefing.',
    error:'No hemos podido completar la suscripción. Inténtalo de nuevo.',
    topics:['Data & IA','Forecasting','Operaciones','Automatización','Casos y proyectos'],
  },
  ca:{
    eyebrow:'SC-ANALYTICS BRIEFING',
    title:'Idees útils per a empreses que volen decidir millor.',
    body:'Una selecció breu de sectors, empreses, projectes, articles i canvis rellevants en dades i IA. Sense farciment i sense convertir la teva bústia en un canal de venda.',
    email:'El teu email',
    name:'Nom (opcional)',
    button:'Vull rebre’l',
    sending:'Subscrivint…',
    consent:'Accepto rebre el briefing de SC-Analytics per email. Em puc donar de baixa quan vulgui.',
    success:'Perfecte. Ja formes part del briefing.',
    error:'No hem pogut completar la subscripció. Torna-ho a provar.',
    topics:['Dades i IA','Forecasting','Operacions','Automatització','Casos i projectes'],
  },
  en:{
    eyebrow:'SC-ANALYTICS BRIEFING',
    title:'Useful ideas for companies that want to make better decisions.',
    body:'A concise selection of sectors, companies, projects, articles and relevant changes in Data and AI. No filler and no turning your inbox into a sales channel.',
    email:'Your email',
    name:'Name (optional)',
    button:'Subscribe',
    sending:'Subscribing…',
    consent:'I agree to receive the SC-Analytics briefing by email. I can unsubscribe at any time.',
    success:'Done. You are now part of the briefing.',
    error:'We could not complete the subscription. Please try again.',
    topics:['Data & AI','Forecasting','Operations','Automation','Cases & projects'],
  },
} as const

export default function NewsletterSignup({compact=false}:{compact?:boolean}){
  const {lang}=useSiteLanguage()
  const pathname=usePathname()
  const t=COPY[lang]
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [consent,setConsent]=useState(false)
  const [state,setState]=useState<'idle'|'sending'|'success'|'error'>('idle')

  async function submit(event:React.FormEvent){
    event.preventDefault()
    if(!consent)return
    setState('sending')
    try{
      const response=await fetch('/api/newsletter/subscribe',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({name,email,language:lang,interests:t.topics,sourcePath:pathname,consent:true}),
      })
      if(!response.ok)throw new Error('subscribe_failed')
      window.gtag?.('event','newsletter_subscribe',{language:lang,source_path:pathname})
      setState('success')
      setEmail('')
      setName('')
    }catch{
      setState('error')
    }
  }

  if(state==='success')return <div className={compact?'rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800':'rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800'}>{t.success}</div>

  return <div className={compact?'':'rounded-[2rem] border border-slate-200 bg-slate-950 p-7 text-white md:p-10'}>
    <p className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${compact?'text-indigo-600':'text-indigo-300'}`}>{t.eyebrow}</p>
    <h2 className={`mt-3 ${compact?'text-2xl text-slate-950':'max-w-3xl text-3xl text-white md:text-4xl'}`} style={{fontFamily:'var(--font-playfair)'}}>{t.title}</h2>
    <p className={`mt-3 max-w-3xl text-sm leading-7 ${compact?'text-slate-600':'text-slate-300'}`}>{t.body}</p>
    <div className="mt-4 flex flex-wrap gap-2">{t.topics.map(topic=><span key={topic} className={`rounded-full border px-2.5 py-1 text-[10px] ${compact?'border-slate-200 bg-slate-50 text-slate-500':'border-white/10 bg-white/[0.05] text-slate-300'}`}>{topic}</span>)}</div>
    <form onSubmit={submit} className="mt-6">
      <div className="grid gap-2 md:grid-cols-[0.7fr_1fr_auto]">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder={t.name} className={`rounded-lg border px-4 py-3 text-sm outline-none ${compact?'border-slate-200 bg-white text-slate-950':'border-white/15 bg-white/[0.06] text-white placeholder:text-slate-500 focus:border-indigo-400'}`}/>
        <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t.email} className={`rounded-lg border px-4 py-3 text-sm outline-none ${compact?'border-slate-200 bg-white text-slate-950':'border-white/15 bg-white/[0.06] text-white placeholder:text-slate-500 focus:border-indigo-400'}`}/>
        <button disabled={!consent||state==='sending'} className={`rounded-lg px-5 py-3 text-sm font-semibold disabled:opacity-40 ${compact?'bg-slate-950 text-white':'bg-white text-slate-950'}`}>{state==='sending'?t.sending:t.button}</button>
      </div>
      <label className={`mt-3 flex items-start gap-2 text-[11px] leading-5 ${compact?'text-slate-500':'text-slate-400'}`}><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1"/><span>{t.consent}</span></label>
      {state==='error'&&<p className="mt-2 text-xs text-rose-500">{t.error}</p>}
    </form>
  </div>
}
