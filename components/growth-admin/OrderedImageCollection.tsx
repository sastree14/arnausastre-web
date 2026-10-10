'use client'

import { useState } from 'react'

export default function OrderedImageCollection({ refs, title }: { refs: string[]; title: string }) {
  const [current, setCurrent] = useState(0)
  if (!refs.length) return null
  const ref = refs[current]
  const src = ref.startsWith('supabase://') ? `/api/growth-admin/asset?ref=${encodeURIComponent(ref)}` : ref
  return <div>
    <img src={src} alt={`${title} · imagen ${current + 1} de ${refs.length}`} className="w-full border-y border-slate-200 bg-slate-50 object-contain" />
    {refs.length > 1 && <div className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-3">
      <button type="button" disabled={current === 0} onClick={() => setCurrent(value => Math.max(0,value - 1))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-30" aria-label="Imagen anterior">←</button>
      <div className="flex flex-wrap items-center justify-center gap-2">{refs.map((_, index) => <button key={index} type="button" onClick={() => setCurrent(index)} aria-label={`Ver imagen ${index + 1}`} aria-pressed={current === index} className={`h-7 w-7 rounded-full text-xs ${current === index ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600'}`}>{index + 1}</button>)}</div>
      <button type="button" disabled={current === refs.length - 1} onClick={() => setCurrent(value => Math.min(refs.length - 1,value + 1))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-30" aria-label="Imagen siguiente">→</button>
    </div>}
  </div>
}
