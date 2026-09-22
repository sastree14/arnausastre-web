'use client'

import Image from 'next/image'

type Props={
  imagePath:string
  image?:string
  headline:string
  industry:string
  capability:string
  priority?:boolean
  forceBrand?:boolean
  className?:string
}

function ProjectMotif({text}:{text:string}){
  const value=text.toLowerCase()
  if(/forecast|demand|planning|time series/.test(value)){
    return <svg viewBox="0 0 240 140" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 112 C42 108 54 58 82 70 S126 126 154 72 S198 38 228 28"/><path d="M12 96 C44 88 60 50 86 58 S126 108 156 62 S198 28 228 18" opacity=".45"/><path d="M12 124H228" opacity=".25"/><path d="M58 18V124M110 18V124M162 18V124M214 18V124" opacity=".12"/></svg>
  }
  if(/optim|reinforcement|routing|allocation|simulation|research/.test(value)){
    return <svg viewBox="0 0 240 140" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2"><path d="M35 92 88 42 142 82 202 34M35 92 112 116 142 82M88 42 202 34M112 116 202 34" opacity=".45"/><circle cx="35" cy="92" r="10"/><circle cx="88" cy="42" r="10"/><circle cx="142" cy="82" r="10"/><circle cx="112" cy="116" r="9"/><circle cx="202" cy="34" r="11"/></svg>
  }
  if(/finance|account|risk|bank|investment|trading/.test(value)){
    return <svg viewBox="0 0 240 140" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2"><rect x="22" y="24" width="196" height="92" rx="12" opacity=".25"/><path d="M42 91V63M78 91V44M114 91V70M150 91V52M186 91V35"/><path d="M38 102H194" opacity=".35"/><path d="M42 48H82M42 36H106" opacity=".2"/></svg>
  }
  if(/crm|erp|data engineering|knowledge|automation|agent|ai /.test(value)){
    return <svg viewBox="0 0 240 140" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2"><rect x="20" y="28" width="62" height="38" rx="8"/><rect x="158" y="28" width="62" height="38" rx="8"/><rect x="89" y="88" width="62" height="38" rx="8"/><path d="M82 47H158M52 66 106 88M188 66 135 88" opacity=".55"/><circle cx="120" cy="47" r="8" opacity=".35"/></svg>
  }
  return <svg viewBox="0 0 240 140" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="120" cy="70" r="48"/><circle cx="120" cy="70" r="24" opacity=".5"/><path d="M18 70H222M120 8V132" opacity=".22"/><path d="M65 28 175 112M175 28 65 112" opacity=".12"/></svg>
}

export default function ProjectCover({imagePath,image,headline,industry,capability,priority=false,forceBrand=false,className=''}:Props){
  if(!forceBrand&&image&&image!=='__generated__'){
    return <div className={`relative h-full w-full overflow-hidden bg-slate-100 ${className}`}><Image src={imagePath} alt={headline} fill className="object-cover" sizes="(max-width:768px) 100vw,(max-width:1280px) 50vw,33vw" priority={priority}/></div>
  }
  const tags=capability.split(',').map(value=>value.trim()).filter(Boolean).slice(0,3)
  return <div className={`relative flex h-full w-full overflow-hidden bg-slate-950 p-7 text-white ${className}`}>
    <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-indigo-400/20"/>
    <div className="pointer-events-none absolute right-12 top-12 h-32 w-32 rotate-45 border border-sky-300/10"/>
    <div className="pointer-events-none absolute right-5 top-[23%] h-40 w-[45%] text-indigo-300/35"><ProjectMotif text={`${headline} ${capability} ${industry}`}/></div>
    <div className="relative z-10 flex min-h-[280px] w-full flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <Image src="/brand/logo-white.png" alt="SC-Analytics" width={170} height={58} className="h-9 w-auto object-contain"/>
        <span className="max-w-[40%] text-right text-[9px] font-semibold uppercase tracking-[.18em] text-indigo-300">{industry}</span>
      </div>
      <div>
        <h3 className="max-w-[76%] text-2xl leading-tight md:text-3xl" style={{fontFamily:'var(--font-playfair)'}}>{headline}</h3>
        <div className="mt-5 flex flex-wrap gap-2">{tags.map(tag=><span key={tag} className="rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1 text-[9px] uppercase tracking-wide text-slate-300">{tag}</span>)}</div>
      </div>
      <p className="text-[9px] uppercase tracking-[.18em] text-slate-500">Built systems · SC-Analytics</p>
    </div>
  </div>
}
