'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ChatGPT's hourly Gmail/Calendar review writes the private CMI. This small
// client refresh keeps an already-open dashboard coherent with those writes.
const POLL_MS=120_000
const RETURN_MS=60_000

export default function DailyWorkspaceAutoRefresh(){
  const router=useRouter()
  useEffect(()=>{
    let last=Date.now()
    let stopped=false
    const safeToRefresh=()=>{
      if(document.visibilityState!=='visible')return false
      if(document.querySelector('[data-active-recording="true"]'))return false
      const active=document.activeElement
      if(active instanceof HTMLElement&&
        (active.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(active.tagName)))return false
      return true
    }
    const refresh=()=>{
      if(stopped||!safeToRefresh())return
      last=Date.now()
      router.refresh()
    }
    const timer=window.setInterval(refresh,POLL_MS)
    const onVisible=()=>{if(document.visibilityState==='visible'&&Date.now()-last>RETURN_MS)refresh()}
    document.addEventListener('visibilitychange',onVisible)
    window.addEventListener('focus',onVisible)
    return()=>{
      stopped=true
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange',onVisible)
      window.removeEventListener('focus',onVisible)
    }
  },[router])
  return null
}
