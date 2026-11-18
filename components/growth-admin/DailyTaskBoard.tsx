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
  metadata?:Record<string,unknown>|null
}
const statuses = [
  ['open','Pendiente'],['in_progress','En curso'],['done','Realizada'],['archived','Archivada']
] as const
const stateLabels:Record<string,string> = Object.fromEntries(statuses)
const datePlus=(date:string,n:number)=>{const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
const safeLink=(v?:string|null)=>{if(!v)return '';try{return new URL(v).protocol==='https:'?v:''}catch{return ''}}
const sourceLabel:Record<string,string>={manual:'Manual',gmail:'Correo',calendar:'Calendario',chat:'Chat',meeting_note:'Nota',automation:'Automatización'}
function TaskItem({task,onUpdate,today}:{task:DailyTask;onUpdate:(next:DailyTask)=>void;today:string}) {
  const [selection,setSelection]=useState(task.status)
  const [workDay,setWorkDay]=useState(task.scheduled_on||'')
  const [hardDeadline,setHardDeadline]=useState(task.due_on||'')
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')
  const [saved,setSaved]=useState('')
  const [expanded,setExpanded]=useState(false)
  const changed=selection!==task.status
  const changedDates=workDay!==(task.scheduled_on||'')||hardDeadline!==(task.due_on||'')
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
      setWorkDay(data.task.scheduled_on||'')
      setHardDeadline(data.task.due_on||'')
      setSaved('Guardado')
    }catch(e){setError(e instanceof Error?e.message:'Error guardando cambios')}
    finally{setSaving(false)}
  }
  const link=safeLink(task.related_url),doc=safeLink(task.related_document_url)
  const reason=typeof task.metadata?.reason==='string'?task.metadata.reason:(typeof task.metadata?.evidence==='string'?task.metadata.evidence:'')
  const expandedDetailsId='task-details-'+task.id
  const isCompleted=task.status==='done'||task.status==='archived'
  return <article className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={()=>setExpanded(value=>!value)} aria-expanded={expanded}
        aria-controls={expandedDetailsId} aria-label={(expanded?'Ocultar':'Mostrar')+' detalles de '+task.title}
        className="group flex min-w-0 flex-1 items-center gap-2 rounded-md py-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600">
        <span aria-hidden="true" className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-base font-semibold text-slate-600 group-hover:bg-slate-100">{expanded?'−':'+'}</span>
        <span className={'min-w-0 text-sm font-semibold leading-5 '+(isCompleted?'text-slate-500 line-through':'text-slate-950')}>{task.title}</span>
      </button>
      <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
        {task.priority===1&&!isCompleted&&<span className="font-semibold text-amber-700">Prioritaria</span>}
        {task.status==='in_progress'&&<span className="font-semibold text-indigo-700">En curso</span>}
        {isCompleted&&<span className="font-semibold text-emerald-700">{stateLabels[task.status]}</span>}
        {!isCompleted&&task.scheduled_on&&task.scheduled_on<today&&<span className="font-medium text-violet-700">Arrastrada</span>}
        {task.due_on&&!isCompleted&&<span className="text-rose-700">Límite {task.due_on}</span>}
        {!isCompleted&&<button type="button" onClick={()=>send({action:'status_change',status:'done'})} disabled={saving}
          className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50">
          {saving?'Guardando…':'✓ Hecha'}
        </button>}
      </div>
    </div>
    {error&&<p role="alert" className="mt-2 text-xs text-rose-700">{error}</p>}
    {saved&&<p role="status" className="mt-1 text-xs text-emerald-700">{saved}</p>}
    {expanded&&<div id={expandedDetailsId} className="mt-3 border-t border-slate-100 pt-3">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_230px]">
        <div className="min-w-0 space-y-2 text-xs leading-5 text-slate-600">
          <p className="font-medium text-slate-500">Origen: {sourceLabel[task.source]||task.source}</p>
          {task.details?<p className="whitespace-pre-line">{task.details}</p>:<p className="text-slate-400">Sin descripción adicional.</p>}
          {reason&&<p className="rounded-lg bg-slate-50 px-3 py-2"><b>Por qué aparece:</b> {reason}</p>}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-500">
            {task.scheduled_on&&<span>Trabajar: {task.scheduled_on}</span>}
            {task.due_on&&<span>Fecha límite: {task.due_on}</span>}
            {task.contact_email&&<span>{task.contact_email}</span>}
          </div>
          {(link||doc)&&<p className="flex flex-wrap gap-3 font-semibold text-indigo-700">
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
          {task.status!=='done'&&task.status!=='archived'&&<div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-slate-600">Trabajar el
              <input type="date" value={workDay} onChange={e=>{setWorkDay(e.target.value);setSaved('')}} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"/>
            </label>
            <label className="text-xs text-slate-600">Límite
              <input type="date" value={hardDeadline} onChange={e=>{setHardDeadline(e.target.value);setSaved('')}} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"/>
            </label>
          </div>}
          {changedDates&&task.status!=='done'&&task.status!=='archived'&&<button type="button" onClick={()=>send({action:'schedule_change',scheduled_on:workDay||null,due_on:hardDeadline||null})} disabled={saving} className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">Guardar fechas</button>}
          <button type="button" onClick={()=>send({action:'status_change',status:selection})} disabled={saving||!changed} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
            {saving?'Guardando…':'Guardar estado'}
          </button>
        </div>
      </div>
    </div>}
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
  const tomorrow=datePlus(today,1)
  const ordered=useMemo(()=>{
    const active=tasks.filter(t=>t.status==='open'||t.status==='in_progress')
    const todayWork=active.filter(t=>(t.scheduled_on&&t.scheduled_on<=today)||(t.due_on&&t.due_on<=today)||(t.lane==='today'&&!t.scheduled_on&&!t.due_on))
    const todayRows=[...todayWork].sort((a,b)=>Number(a.priority)-Number(b.priority)||(a.scheduled_on||a.waiting_until||'').localeCompare(b.scheduled_on||b.waiting_until||''))
    const todayIds=new Set(todayRows.map(t=>t.id))
    const tomorrowRows=[...active.filter(t=>!todayIds.has(t.id)&&((t.scheduled_on&&t.scheduled_on===tomorrow)||(!t.scheduled_on&&t.due_on===tomorrow)))]
      .sort((a,b)=>Number(a.priority)-Number(b.priority))
    const already=new Set([...todayRows,...tomorrowRows].map(t=>t.id))
    const weekly=active.filter(t=>!already.has(t.id)&&((t.scheduled_on&&t.scheduled_on<=weekEnd)||(t.due_on&&t.due_on<=weekEnd)||t.lane==='week'&&!t.scheduled_on&&!t.due_on))
      .sort((a,b)=>(a.scheduled_on||a.due_on||'').localeCompare(b.scheduled_on||b.due_on||''))
    const later=active.filter(t=>!already.has(t.id)&&!weekly.some(w=>w.id===t.id)).sort((a,b)=>(a.scheduled_on||a.due_on||'').localeCompare(b.scheduled_on||b.due_on||''))
    const done=tasks.filter(t=>t.status==='done'||t.status==='archived').sort((a,b)=>(b.completed_at||'').localeCompare(a.completed_at||'')).slice(0,12)
    return {todayRows,tomorrowRows,weekly,later,done}
  },[tasks,today,tomorrow,weekEnd])
  return <div className="space-y-7">
    <div className="flex flex-wrap gap-2 text-xs">
      <a className="rounded-full border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700" href="#tareas-hoy">Hoy · {ordered.todayRows.length}</a>
      <a className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 font-semibold text-indigo-800" href="#tareas-manana">Mañana · {ordered.tomorrowRows.length}</a>
      <a className="rounded-full border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700" href="#tareas-semana">Semana · {ordered.weekly.length}</a>
    </div>
    <div className="grid gap-5 lg:grid-cols-2">
      <div id="tareas-hoy"><Section title="Hoy" description={'Acciones del '+today+'. Máximo '+maxTasks+' en foco. Las atrasadas siguen aquí hasta completarlas.'} items={ordered.todayRows.slice(0,maxTasks)} today={today} onUpdate={onUpdate}/></div>
      <div id="tareas-manana" className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4"><Section title="Mañana" description={'Planificadas para '+tomorrow+'. Puedes adelantar una tarea o moverla de día desde su ficha.'} items={ordered.tomorrowRows} today={today} onUpdate={onUpdate}/></div>
    </div>
    {ordered.todayRows.length>maxTasks&&<Section title="Cola de hoy" description="Exceso de capacidad, visible pero no perdido." items={ordered.todayRows.slice(maxTasks)} today={today} onUpdate={onUpdate}/>}
    <div id="tareas-semana"><Section title="Resto de la semana" description="Tareas con fecha de trabajo, límite o planificación en los próximos siete días." items={ordered.weekly} today={today} onUpdate={onUpdate}/></div>
    {ordered.later.length>0&&<Section title="Más adelante" description="Pendientes con fechas futuras o todavía sin día concreto; ninguna se pierde." items={ordered.later} today={today} onUpdate={onUpdate}/>}
    {ordered.done.length>0&&<Section title="Realizadas y archivadas" description="Historial reciente. Solo se reabren por decisión explícita." items={ordered.done} today={today} onUpdate={onUpdate}/>}
  </div>
}
