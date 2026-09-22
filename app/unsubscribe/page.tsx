'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function Body(){
  const params=useSearchParams()
  const token=params.get('token')||''
  const [state,setState]=useState<'idle'|'sending'|'done'|'error'>('idle')
  async function unsubscribe(){
    if(!token)return
    setState('sending')
    try{
      const response=await fetch('/api/newsletter/unsubscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})})
      if(!response.ok)throw new Error('failed')
      setState('done')
    }catch{setState('error')}
  }
  return <main className="min-h-[65vh] bg-white px-6 py-24 text-slate-950"><div className="mx-auto max-w-xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-indigo-600">SC-Analytics Briefing</p><h1 className="mt-4 text-4xl" style={{fontFamily:'var(--font-playfair)'}}>Manage your subscription.</h1>{state==='done'?<><p className="mt-6 leading-7 text-slate-600">You have been unsubscribed. You can subscribe again from the website whenever you want.</p><Link href="/" className="mt-7 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Back to SC-Analytics</Link></>:<><p className="mt-6 leading-7 text-slate-600">Stop receiving the SC-Analytics Briefing at this email address.</p><button disabled={!token||state==='sending'} onClick={unsubscribe} className="mt-7 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{state==='sending'?'Updating…':'Unsubscribe'}</button>{state==='error'&&<p className="mt-3 text-sm text-rose-600">We could not update the subscription. Please try again.</p>}</>}</div></main>
}
export default function UnsubscribePage(){return <Suspense fallback={null}><Body/></Suspense>}
