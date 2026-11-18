'use client'

import { useMemo, useState } from 'react'

export type DailyTask = {
  id:string
  title:string
  details:string
  lane:string
  status:string
  source:string
  due_on?:string|null
  scheduled_on?:string|null
  waiting_until?:string|null
  priority:number
  followup_count:number
  contact_email?:string|null
  related_url?:string|null
  related_document_url?:string|null
  completed_at?:string|null
  updated_at?:string|null
}
const statuses = [
  ['open','Pendiente'],['in_progress','En curso'],['waiting','En espera'],['done','Realizada'],['archived','Archivada']
] as const
const stateLabels:Record<string,string> = Object.fromEntries(statuses)
const datePlus=(date:string,n:number)=>{const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
const safeLink=(v?:string|null)=>{if(!v)return '';try{return new URL(v).protocol==='https:'?v:''}catch{return ''}}
const sourceLabel:Record<string,string>={manual:'Manual',gmail:'Correo',calendar:'Calendario',chat:'Chat',meeting_note:'Nota',automation:'Automatización'}
function TaskItem({task,onUpdate,today}:{task:DailyTask;onUpdate:(next:DailyTask)=>void;today:string}) {
  const [selection,setSelection]=useState(task.status)
  const [waitUntil,setWaitUntil]=useState(task.waiting_until||datePlus(today,7))
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')
  const [saved,setSaved]=useState('')
  const changed=selection!==task.status||(selection==='waiting'&&waitUntil!==task.waiting_until)
  const eligibleFollowup=task.status==='waiting'&&Boolean(task.waiting_until)&&task.waiting_until!<=today&&task.followup_count<2
  async function send(payload:Record<string,unknown>){
    setSaving(true);setError('');setSaved('')
    try{
      const res=await fetch('/api/growth-admin/dia-a-dia',{
        method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',
        body:JSON.stringify({id:task.id,...payload})
      })
      const data=await res.json()
      if(!res.ok||!data.ok||!data.task)throw new Error(data.error||'No se ha guardado el cambio')
      onUpdate(data.task)
      setSelection(data.task.status)
      setWaitUntil(data.task.waiting_until||datePlus(today,7))
      setSaved('Guardado')
    }catch(e){setError(e instanceof Error?e.message:'Error guardando cambios')}
    finally{setSaving(false)}
  }
  const link=safeLink(task.related_url),doc=safeLink(task.related_document_url)
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_230px]">
      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px]">
          {task.priority===1&&<span className="rounded bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">Prioridad alta</span>}
          {task.status!=='done'&&task.status!=='archived'&&task.scheduled_on&&task.scheduled_on<today&&<span className="text-violet-700">Arrastrada</span>}
          <span className="text-slate-500">{sourceLabel[task.source]||task.source}</span>
        </div>
        <p className="text-sm font-semibold leading-5 text-slate-950">{task.title}</p>
        {task.details&&<p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-600">{task.details}</p>}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          {task.scheduled_on&&<span>Planificada: {task.scheduled_on}</span>}
          {task.due_on&&<span>Límite: {task.due_on}</span>}
          {task.waiting_until&&task.status==='waiting'&&<span>Revisar: {task.waiting_until}</span>}
          {task.contact_email&&<span>{task.contact_email}</span>}
          {task.status==='waiting'&&<span>Follow-ups: {task.followup_count}/2</span>}
        </div>
        {(link||doc)&&<p className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-indigo-700">
          {link&&<a href={link} target="_blank" rel="noreferrer">Origen de la tarea</a>}
          {doc&&<a href={doc} target="_blank" rel="noreferrer">Documento relacionado</a>}
        </p>}
      </div>
      <div className="flex flex-col gap-2 lg:border-l lg:border-slate-100 lg:pl-3">
        <label className="text-xs font-semibold text-slate-600">Estado
          <select aria-label={'Estado de '+task.title} value={selection} disabled={saving} onChange={e=>{setSelection(e.target.value);setSaved('')}} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900">
            {statuses.map(([value,label])=><option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        {selection==='waiting'&&<label className="text-xs text-slate-600">Próxima revisión
          <input type="date" value={waitUntil} onChange={e=>setWaitUntil(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"/>
        </label>}
        <button type="button" onClick={()=>send({action:'status_change',status:selection,waiting_until:selection==='waiting'?waitUntil:null})} disabled={saving||!changed} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
          {saving?'Guardando…':'Guardar estado'}
        </button>
        {eligibleFollowup&&<button type="button" onClick={()=>send({action:'followup_sent'})} disabled={saving} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Registrar follow-up enviado</button>}
        {task.status==='waiting'&&<button type="button" onClick={()=>send({action:'reply_received'})} disabled={saving} className="text-xs font-semibold text-indigo-700 underline">Han respondido</button>}
        {saved&&<span role="status" className="text-xs text-emerald-700">{saved} · {stateLabels[task.status]||task.status}</span>}
        {error&&<span role="alert" className="text-xs text-rose-700">{error}</span>}
      </div>
    </div>
  </article>
}
function Section({title,description,items,today,onUpdate}:{title:string;description:string;items:DailyTask[];today:string;onUpdate:(next:DailyTask)=>void}){
  return <section className="space-y-3">
    <div><h2 className="text-xl font-semibold text-slate-950">{title} <span className="text-base font-normal text-slate-500">({items.length})</span></h2><p className="mt-1 text-xs text-slate-500">{description}</p></div>
    {items.length?<div className="space-y-2">{items.map(task=><TaskItem key={task.id} task={task} today={today} onUpdate={onUpdate}/>)}</div>:<div className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-400">No hay tareas en esta sección.</div>}
  </section>
}
export default function DailyTaskBoard({initialTasks,today,maxTasks}:{initialTasks:DailyTask[];today:string;maxTasks:number}){
  const [tasks,setTasks]=useState(initialTasks)
  const weekEnd=datePlus(today,7)
  const onUpdate=(next:DailyTask)=>setTasks(old=>old.map(t=>t.id===next.id?next:t))
  const ordered=useMemo(()=>{
    const active=tasks.filter(t=>t.status==='open'||t.status==='in_progress')
    const due=tasks.filter(t=>t.status==='waiting'&&t.waiting_until&&t.waiting_until<=today&&t.followup_count<2)
    const now=active.filter(t=>(t.scheduled_on&&t.scheduled_on<=today)||(t.due_on&&t.due_on<=today)||(t.lane==='today'&&!t.scheduled_on&&!t.due_on))
    const todayRows=[...due,...now].sort((a,b)=>Number(a.priority)-Number(b.priority)||(a.scheduled_on||a.waiting_until||'').localeCompare(b.scheduled_on||b.waiting_until||''))
    const todayIds=new Set(todayRows.map(t=>t.id))
    const weekly=active.filter(t=>!todayIds.has(t.id)&&((t.scheduled_on&&t.scheduled_on<=weekEnd)||(t.due_on&&t.due_on<=weekEnd)||t.lane==='week'))
    const waiting=tasks.filter(t=>t.status==='waiting'&&!todayIds.has(t.id)).sort((a,b)=>(a.waiting_until||'').localeCompare(b.waiting_until||''))
    const done=tasks.filter(t=>t.status==='done'||t.status==='archived').sort((a,b)=>(b.completed_at||'').localeCompare(a.completed_at||'')).slice(0,12)
    return {todayRows,weekly,waiting,done}
  },[tasks,today,weekEnd])
  return <div className="space-y-8">
    <div className="space-y-3">
      <Section title="Tareas de hoy" description={'Máximo '+maxTasks+' tareas en foco. Las no finalizadas de días anteriores siguen aquí sin duplicarse.'} items={ordered.todayRows.slice(0,maxTasks)} today={today} onUpdate={onUpdate}/>
      {ordered.todayRows.length>maxTasks&&<Section title="Cola de trabajo" description="Exceso de capacidad, visible pero no perdido." items={ordered.todayRows.slice(maxTasks)} today={today} onUpdate={onUpdate}/>}
    </div>
    <Section title="Esta semana" description="Trabajos que conviene preparar progresivamente, sin convertir todas las fechas en urgencias de hoy." items={ordered.weekly} today={today} onUpdate={onUpdate}/>
    <Section title="En espera" description="Las respuestas pendientes no se convierten en tareas hasta su fecha de revisión. Cada espera tiene su propio plazo." items={ordered.waiting} today={today} onUpdate={onUpdate}/>
    {ordered.done.length>0&&<Section title="Realizadas y archivadas" description="Historial reciente; se pueden reabrir de forma explícita desde el desplegable." items={ordered.done} today={today} onUpdate={onUpdate}/>}
  </div>
}
