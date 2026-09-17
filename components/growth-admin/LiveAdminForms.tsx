'use client'

import {useEffect} from 'react'
import {useRouter} from 'next/navigation'

export const OPERATOR_QUEUED_EVENT='sc-growth:operator-queued'
export const OPERATOR_UPDATE_EVENT='sc-growth:operator-update'
export const OPERATOR_TERMINAL_EVENT='sc-growth:operator-terminal'
export const ADMIN_MUTATION_EVENT='sc-growth:admin-mutation'

type OperatorQueuedDetail={taskId:string;dispatched:boolean;reason?:string}
type OperatorUpdateDetail={taskId:string;status:string;type?:string}

function buttonFor(form:HTMLFormElement,submitter:HTMLElement|null){return submitter instanceof HTMLButtonElement?submitter:form.querySelector<HTMLButtonElement>('button[type="submit"],button:not([type])')}
function setButton(button:HTMLButtonElement|null,label:string,disabled:boolean){if(!button)return;if(!button.dataset.liveOriginalLabel)button.dataset.liveOriginalLabel=button.textContent||'';button.textContent=label;button.disabled=disabled}
function restoreButton(button:HTMLButtonElement|null){if(!button)return;button.textContent=button.dataset.liveOriginalLabel||button.textContent;button.disabled=false;delete button.dataset.liveOriginalLabel}
function restoreScroll(y:number){requestAnimationFrame(()=>{window.scrollTo({top:y,behavior:'instant'});requestAnimationFrame(()=>window.scrollTo({top:y,behavior:'instant'}))})}

export default function LiveAdminForms(){
  const router=useRouter()
  useEffect(()=>{
    const activeForms=new Map<string,{form:HTMLFormElement;button:HTMLButtonElement|null;scrollY:number}>()

    const onSubmit=(event:SubmitEvent)=>{
      if(event.defaultPrevented)return
      const form=event.target
      if(!(form instanceof HTMLFormElement))return
      const submitter=event.submitter instanceof HTMLElement?event.submitter:null
      const submitAction=submitter?.getAttribute('formaction')||form.getAttribute('action')||window.location.href
      const url=new URL(submitAction,window.location.href)
      const isOperator=url.pathname==='/api/growth-admin/operator-task'
      const isLive=form.dataset.liveForm==='1'
      if(!isOperator&&!isLive)return
      event.preventDefault()
      if(form.dataset.liveBusy==='1')return
      form.dataset.liveBusy='1'
      const scrollY=window.scrollY,button=buttonFor(form,submitter)
      setButton(button,'Enviando…',true)
      const body=new FormData(form)
      if(submitter instanceof HTMLButtonElement&&submitter.name&&!body.has(submitter.name))body.append(submitter.name,submitter.value)
      void fetch(url,{method:(form.method||'POST').toUpperCase(),body,credentials:'same-origin',cache:'no-store'}).then(async response=>{
        if(!response.ok)throw new Error((await response.text()).slice(0,240)||`HTTP ${response.status}`)
        const finalUrl=new URL(response.url||window.location.href)
        const taskId=finalUrl.searchParams.get('queued')||''
        if(taskId){
          const dispatched=finalUrl.searchParams.get('dispatched')!=='0',reason=finalUrl.searchParams.get('dispatch_reason')||''
          form.dataset.operatorTaskId=taskId
          activeForms.set(taskId,{form,button,scrollY})
          setButton(button,dispatched?'En cola…':'No lanzado · reintentar',!dispatched)
          if(dispatched&&form.dataset.hideProposal==='1')form.closest<HTMLElement>('[data-proposal-card]')?.classList.add('hidden')
          window.dispatchEvent(new CustomEvent<OperatorQueuedDetail>(OPERATOR_QUEUED_EVENT,{detail:{taskId,dispatched,reason}}))
          if(!dispatched){delete form.dataset.liveBusy;restoreScroll(scrollY)}
          return
        }
        setButton(button,'Guardado ✓',true)
        window.dispatchEvent(new CustomEvent(ADMIN_MUTATION_EVENT,{detail:{path:url.pathname}}))
        router.refresh();restoreScroll(scrollY)
        window.setTimeout(()=>{delete form.dataset.liveBusy;restoreButton(button)},700)
      }).catch(error=>{
        console.error('Live CRM action failed',error)
        setButton(button,'Error · reintentar',false);delete form.dataset.liveBusy;restoreScroll(scrollY)
      })
    }

    const onUpdate=(event:Event)=>{
      const detail=(event as CustomEvent<OperatorUpdateDetail>).detail
      if(!detail?.taskId)return
      const active=activeForms.get(detail.taskId)
      if(!active)return
      if(detail.status==='running')setButton(active.button,'Ejecutando…',true)
      else if(detail.status==='queued'||detail.status==='pending')setButton(active.button,'En cola…',true)
    }

    const onTerminal=(event:Event)=>{
      const detail=(event as CustomEvent<OperatorUpdateDetail>).detail
      if(!detail?.taskId)return
      const active=activeForms.get(detail.taskId),scrollY=active?.scrollY??window.scrollY
      if(active){setButton(active.button,detail.status==='completed'?'Completado ✓':'Error · revisar',false);delete active.form.dataset.liveBusy;activeForms.delete(detail.taskId)}
      router.refresh();restoreScroll(scrollY)
      window.dispatchEvent(new CustomEvent(ADMIN_MUTATION_EVENT,{detail:{taskId:detail.taskId,status:detail.status,type:detail.type}}))
    }

    document.addEventListener('submit',onSubmit)
    window.addEventListener(OPERATOR_UPDATE_EVENT,onUpdate)
    window.addEventListener(OPERATOR_TERMINAL_EVENT,onTerminal)
    return()=>{document.removeEventListener('submit',onSubmit);window.removeEventListener(OPERATOR_UPDATE_EVENT,onUpdate);window.removeEventListener(OPERATOR_TERMINAL_EVENT,onTerminal)}
  },[router])
  return null
}
