'use client'

import Image from 'next/image'

type Props={
  imagePath:string
  image?:string
  headline:string
  industry:string
  capability:string
  priority?:boolean
  className?:string
}

export default function ProjectCover({imagePath,image,headline,industry,capability,priority=false,className=''}:Props){
  if(image&&image!=='__generated__'){
    return <div className={`relative h-full w-full overflow-hidden bg-slate-100 ${className}`}><Image src={imagePath} alt={headline} fill className="object-cover" sizes="(max-width:768px) 100vw,(max-width:1280px) 50vw,33vw" priority={priority}/></div>
  }
  const tags=capability.split(',').map(value=>value.trim()).filter(Boolean).slice(0,3)
  return <div className={`relative flex h-full w-full overflow-hidden bg-slate-950 p-7 text-white ${className}`}>
    <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-indigo-400/20"/>
    <div className="pointer-events-none absolute right-12 top-12 h-32 w-32 rotate-45 border border-sky-300/10"/>
    <div className="pointer-events-none absolute bottom-[-70px] left-[35%] h-52 w-52 rounded-full border border-white/5"/>
    <div className="relative z-10 flex min-h-[280px] w-full flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <Image src="/brand/logo-white.png" alt="SC-Analytics" width={170} height={58} className="h-9 w-auto object-contain"/>
        <span className="text-[9px] font-semibold uppercase tracking-[.18em] text-indigo-300">{industry}</span>
      </div>
      <div>
        <h3 className="max-w-[90%] text-2xl leading-tight md:text-3xl" style={{fontFamily:'var(--font-playfair)'}}>{headline}</h3>
        <div className="mt-5 flex flex-wrap gap-2">{tags.map(tag=><span key={tag} className="rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1 text-[9px] uppercase tracking-wide text-slate-300">{tag}</span>)}</div>
      </div>
      <p className="text-[9px] uppercase tracking-[.18em] text-slate-500">Built systems · SC-Analytics</p>
    </div>
  </div>
}
