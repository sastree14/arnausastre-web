'use client'
import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
export default function CommercialViewRefresh(){const router=useRouter();const [pending,startTransition]=useTransition();useEffect(()=>{const refresh=()=>{if(!document.hidden)startTransition(()=>router.refresh())};const interval=window.setInterval(refresh,60000);document.addEventListener('visibilitychange',refresh);return()=>{clearInterval(interval);document.removeEventListener('visibilitychange',refresh)}},[router]);return <button disabled={pending} onClick={()=>startTransition(()=>router.refresh())} className="mb-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">{pending?'Actualizando…':'Actualizar sección'}</button>}
