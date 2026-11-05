'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export const CRM_REALTIME_EVENT = 'sc-growth-realtime-change'

type CursorResponse={
  cursor:string|null
  table:string
  eventType:string
  changedAt:string
}

const POLL_MS=8000
const RETRY_MS=16000

/**
 * Polls an authenticated same-origin API, not a public Supabase WebSocket.
 * Supabase credentials and the CRM event stream stay behind the CMI session.
 * Retains the same UI event semantics for all existing CRM components.
 */
export default function SupabaseRealtimeInvalidator(){
  const router=useRouter()
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null)
  const cursor=useRef<string|null>(null)
  const initialized=useRef(false)

  useEffect(()=>{
    let stopped=false
    const clear=()=>{if(timer.current)clearTimeout(timer.current);timer.current=null}
    const schedule=(ms:number)=>{
      clear()
      if(!stopped)timer.current=setTimeout(()=>{void poll()},ms)
    }
    const poll=async()=>{
      if(stopped)return
      if(document.visibilityState==='hidden'){schedule(POLL_MS);return}
      try {
        const response=await fetch('/api/growth-admin/realtime-state',{cache:'no-store',credentials:'same-origin'})
        if(response.status===401){stopped=true;return}
        if(!response.ok)throw new Error('CRM invalidation temporarily unavailable')
        const data=await response.json() as CursorResponse
        if(!stopped){
          if(initialized.current&&data.cursor!==cursor.current&&data.cursor!==null){
            window.dispatchEvent(new CustomEvent(CRM_REALTIME_EVENT,{
              detail:{table:data.table,eventType:data.eventType,changedAt:data.changedAt}
            }))
            router.refresh()
          }
          cursor.current=data.cursor
          initialized.current=true
        }
        schedule(POLL_MS)
      }catch{schedule(RETRY_MS)}
    }
    const onVisible=()=>{if(document.visibilityState==='visible'){clear();void poll()}}
    document.addEventListener('visibilitychange',onVisible)
    void poll()
    return()=>{
      stopped=true
      clear()
      document.removeEventListener('visibilitychange',onVisible)
    }
  },[router])
  return null
}
