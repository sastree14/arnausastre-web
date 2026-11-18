'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import DailyVoiceNote from './DailyVoiceNote'

export type DailyRelation={
  id:string;display_name:string;role:'client'|'collaborator'|'worker'|'editorial';status:string;user_curated:boolean;
  contact_email?:string|null;last_interaction_on?:string|null;last_interaction_kind?:string|null;
  last_interaction_summary:string;last_interaction_url?:string|null;next_meeting_on?:string|null;
  next_review_on?:string|null;followup_count:number;followup_policy:string;notes?:string;
}
export type DailyRelationTask={id:string;title:string;status:string;scheduled_on?:string|null;due_on?:string|null;contact_email?:string|null;metadata?:Record<string,unknown>|null}
export type DailyRelationNote={id:string;relation_id?:string|null;contact_email?:string|null;title:string;body:string;created_at:string;meeting_date?:string|null;audio_path?:string|null}
const states=[['active','Activa'],['waiting','En espera'],['dormant','Inactiva'],['closed','Cerrada']]
const kind:Record<string,string>={email:'Correo',meeting:'Reunión',slack:'Slack',platform:'Plataforma',manual:'Manual'}
const select='rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900'
const button='rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50'
const dateEs=(str:string)=>{try{return new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(str+'T12:00:00Z'))}catch{return str}}
function RelationCard({initial,onSave,tasks,notes,today}:{initial:DailyRelation;onSave:(r:DailyRelation)=>void;tasks:DailyRelationTask[];notes:DailyRelationNote[];today:string}){
  const router=useRouter()
  const [expanded,setExpanded]=useState(false)
  const [voiceOpen,setVoiceOpen]=useState(false)
  const [state,setState]=useState(initial.status)
  const [reviewDate,setReviewDate]=useState(initial.next_review_on||'')
  const [interactionOpen,setInteractionOpen]=useState(false)
  const [interactionDate,setInteractionDate]=useState('')
  const [interactionKind,setInteractionKind]=useState('meeting')
  const [interactionSummary,setInteractionSummary]=useState('')
  const [busy,setBusy]=useState(false)
  const [msg,setMsg]=useState('')
  const [err,setErr]=useState('')
  async function save(payload:Record<string,unknown>){
    setBusy(true);setMsg('');setErr('')
    try{
      const res=await fetch('/api/growth-admin/dia-a-dia/relationships',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({id:initial.id,...payload})})
      const result=await res.json()
      if(!res.ok||!result.ok||!result.relationship)throw new Error(result.error||'No se ha guardado')
      const r=result.relationship as DailyRelation
      onSave(r);setState(r.status);setReviewDate(r.next_review_on||'');setInteractionSummary('');setInteractionOpen(false);setMsg('Actualizado');router.refresh()
    }catch(e){setErr(e instanceof Error?e.message:'Error desconocido')}
    finally{setBusy(false)}
  }
  const currentTasks=tasks.filter(t=>t.status==='open'||t.status==='in_progress')
  const last=initial.last_interaction_on?dateEs(initial.last_interaction_on):'Pendiente de verificar'
  const detailsId='relationship-'+initial.id
  const daysSince=initial.last_interaction_on?
    Math.max(0,Math.floor((Date.parse(today+'T12:00:00Z')-Date.parse(initial.last_interaction_on+'T12:00:00Z'))/86400000)):null
  const reviewFlag=initial.status==='active'&&initial.role!=='worker'&&initial.role!=='editorial'&&daysSince!==null&&daysSince>=7
    &&!initial.next_meeting_on&&!initial.next_review_on&&currentTasks.length===0
  return <article className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" aria-controls={detailsId} aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}
        className="group flex min-w-0 flex-1 items-center gap-2 rounded-md py-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600">
        <span aria-hidden="true" className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-base font-semibold text-slate-600 group-hover:bg-slate-100">{expanded?'−':'+'}</span>
        <span className="min-w-0 text-sm font-semibold text-slate-950">{initial.display_name}</span>
      </button>
      {currentTasks.length>0&&<span className="rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700">{currentTasks.length} {currentTasks.length===1?'tarea pendiente':'tareas pendientes'}</span>}
      {initial.status==='waiting'&&<span className="text-[11px] font-semibold text-amber-700">En espera</span>}
      {reviewFlag&&<span title="No se ha verificado actividad reciente; revisa el contexto antes de escribir" className="text-[11px] font-semibold text-amber-700">Revisar relación · {daysSince} días sin actividad registrada</span>}
      {initial.status==='active'&&currentTasks.length===0&&<span className="text-[11px] text-slate-400">Sin tareas pendientes</span>}
      <button type="button" onClick={()=>{setExpanded(true);setVoiceOpen(true)}} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">🎙 Nota de voz</button>
    </div>
    {msg&&<p role="status" className="mt-1 text-xs text-emerald-700">{msg}</p>}
    {err&&<p role="alert" className="mt-1 text-xs text-rose-700">{err}</p>}
    {expanded&&<div id={detailsId} className="mt-3 space-y-4 border-t border-slate-100 pt-3">
      <div className="grid gap-3 text-xs text-slate-600 sm:grid-cols-2">
        <div><span className="font-semibold">Tipo:</span> {initial.role==='worker'?'Trabajador':initial.role==='client'?'Cliente':initial.role==='editorial'?'Editorial / medio':'Colaborador'}</div>
        <div><span className="font-semibold">Última interacción:</span> {last}{initial.last_interaction_kind?' · '+(kind[initial.last_interaction_kind]||initial.last_interaction_kind):''}</div>
        {initial.last_interaction_summary&&<p className="sm:col-span-2 whitespace-pre-line">{initial.last_interaction_summary}</p>}
        {initial.next_meeting_on&&<p>Próxima reunión: {dateEs(initial.next_meeting_on)}</p>}
        {initial.next_review_on&&<p>Revisar situación: {dateEs(initial.next_review_on)}</p>}
        {initial.contact_email&&<p className="break-all">{initial.contact_email}</p>}
        {initial.id==='tim'&&<p>Canal Slack: sin sincronización automática</p>}
      </div>
      {currentTasks.length>0&&<section className="rounded-lg bg-indigo-50 p-3">
        <p className="text-xs font-semibold text-indigo-900">Acciones pendientes con esta persona</p>
        <ul className="mt-2 space-y-1 text-xs text-indigo-800">
          {currentTasks.map(t=><li key={t.id}>• {t.title}{t.scheduled_on?' · '+dateEs(t.scheduled_on):''}</li>)}
        </ul>
        <p className="mt-2 text-[11px] text-indigo-700">Marca la tarea como realizada en la pestaña Tareas.</p>
      </section>}
      {notes.length>0&&<section>
        <p className="mb-2 text-xs font-semibold text-slate-900">Notas de la relación</p>
        <div className="space-y-2">{notes.slice(0,5).map(n=><div key={n.id} className="rounded-lg bg-slate-50 p-3 text-xs">
          <p className="font-semibold text-slate-800">{n.title} · {dateEs(n.created_at.slice(0,10))}</p>
          {n.body&&<p className="mt-1 whitespace-pre-line text-slate-600">{n.body}</p>}
          {n.audio_path&&<audio controls preload="none" src={'/api/growth-admin/dia-a-dia/voice?id='+encodeURIComponent(n.id)} className="mt-2 w-full" aria-label={'Audio de '+n.title}/>}
        </div>)}</div>
      </section>}
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-slate-600">Estado
          <select value={state} onChange={e=>setState(e.target.value)} disabled={busy} className={select+' mt-1 block'}>{states.map(([v,label])=><option key={v} value={v}>{label}</option>)}</select>
        </label>
        {state==='waiting'&&<label className="text-xs text-slate-600">Revisar el
          <input type="date" value={reviewDate} onChange={e=>setReviewDate(e.target.value)} className={select+' mt-1 block'}/>
        </label>}
        <button type="button" onClick={()=>save({action:'status',status:state,next_review_on:reviewDate||null})}
          disabled={busy||(state===initial.status&&reviewDate===(initial.next_review_on||''))} className={button+' disabled:opacity-40'}>Guardar estado</button>
        <button type="button" onClick={()=>setInteractionOpen(v=>!v)} className={button}>{interactionOpen?'Cerrar interacción':'+ Registrar interacción'}</button>
        {initial.status==='waiting'&&initial.followup_count<2&&<button type="button" onClick={()=>save({action:'followup',next_review_on:reviewDate||null})} disabled={busy} className={button}>He enviado seguimiento</button>}
      </div>
      {interactionOpen&&<form onSubmit={e=>{e.preventDefault();void save({action:'interaction',date:interactionDate||undefined,kind:interactionKind,summary:interactionSummary,next_review_on:reviewDate||null})}} className="grid gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-2">
        <label className="text-xs text-slate-600">Fecha<input type="date" value={interactionDate} onChange={e=>setInteractionDate(e.target.value)} className={select+' mt-1 w-full'}/></label>
        <label className="text-xs text-slate-600">Canal<select value={interactionKind} onChange={e=>setInteractionKind(e.target.value)} className={select+' mt-1 w-full'}>{Object.entries(kind).map(([k,label])=><option key={k} value={k}>{label}</option>)}</select></label>
        <label className="text-xs text-slate-600 sm:col-span-2">Resumen<textarea value={interactionSummary} onChange={e=>setInteractionSummary(e.target.value)} rows={2} required maxLength={1200} className={select+' mt-1 w-full'}/></label>
        <button disabled={busy} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white">Guardar interacción</button>
      </form>}
      <div><button type="button" onClick={()=>setVoiceOpen(v=>!v)} className={button}>{voiceOpen?'Cerrar nota de voz':'🎙 Grabar nota de voz o actualización'}</button>
        {voiceOpen&&<div className="mt-3"><DailyVoiceNote relationId={initial.id} initialTitle={'Actualización · '+initial.display_name} initialContact={initial.contact_email||''}/></div>}
      </div>
    </div>}
  </article>
}
function Group({title,description,rows,onSave,tasks,notes,today}:{title:string;description:string;rows:DailyRelation[];onSave:(r:DailyRelation)=>void;tasks:DailyRelationTask[];notes:DailyRelationNote[];today:string}){
  const linkedTasks=(r:DailyRelation)=>tasks.filter(t=>t.metadata?.relation_id===r.id||Boolean(r.contact_email&&t.contact_email&&r.contact_email.toLowerCase()===t.contact_email.toLowerCase()))
  const linkedNotes=(r:DailyRelation)=>notes.filter(n=>n.relation_id===r.id).sort((a,b)=>b.created_at.localeCompare(a.created_at))
  return <section className="space-y-3"><h2 className="text-base font-semibold text-slate-950">{title} <span className="font-normal text-slate-500">({rows.length})</span></h2>
    <p className="text-xs text-slate-500">{description}</p>
    {rows.length?<div className="space-y-2">{rows.map(r=><RelationCard key={r.id} initial={r} onSave={onSave} tasks={linkedTasks(r)} notes={linkedNotes(r)} today={today}/>)}</div>:<p className="rounded-lg border border-dashed border-slate-200 p-4 text-xs text-slate-500">No hay relaciones en esta sección.</p>}
  </section>
}
export default function DailyRelationships({initialRelations,initialTasks=[],initialNotes=[],today}:{initialRelations:DailyRelation[];initialTasks?:DailyRelationTask[];initialNotes?:DailyRelationNote[];today:string}){
  const [relations,setRelations]=useState(initialRelations)
  const [showDormant,setShowDormant]=useState(false)
  const [showEditorialWaiting,setShowEditorialWaiting]=useState(false)
  const change=(next:DailyRelation)=>setRelations(prev=>prev.map(r=>r.id===next.id?next:r))
  const groups=useMemo(()=>{
    const current=relations.filter(r=>r.status==='active'||r.status==='waiting')
    return {
      companies:current.filter(r=>r.role==='client'||r.role==='collaborator').sort((a,b)=>a.display_name.localeCompare(b.display_name,'es')),
      workers:current.filter(r=>r.role==='worker').sort((a,b)=>a.display_name.localeCompare(b.display_name,'es')),
      editorialActive:current.filter(r=>r.role==='editorial'&&r.status==='active').sort((a,b)=>a.display_name.localeCompare(b.display_name,'es')),
      editorialWaiting:current.filter(r=>r.role==='editorial'&&r.status==='waiting').sort((a,b)=>a.display_name.localeCompare(b.display_name,'es')),
      dormant:relations.filter(r=>r.status==='dormant'||r.status==='closed')
    }
  },[relations])
  return <div className="space-y-6">
    <Group title="Clientes y colaboradores" description="Primero el nombre. El indicador muestra si existe una tarea real pendiente; abre + para consultar la relación." rows={groups.companies} onSave={change} tasks={initialTasks} notes={initialNotes} today={today}/>
    <Group title="Trabajadores y técnicos" description="Colaboración y ejecución, separadas de las relaciones comerciales." rows={groups.workers} onSave={change} tasks={initialTasks} notes={initialNotes} today={today}/>
    <div className="space-y-3 border-t border-slate-200 pt-5" id="relaciones-editoriales">
      <Group title="Editorial y medios" description="Redacciones y periodistas por separado de clientes, partners y personal técnico. Colaboraciones activas." rows={groups.editorialActive} onSave={change} tasks={initialTasks} notes={initialNotes} today={today}/>
      <button type="button" className={button} onClick={()=>setShowEditorialWaiting(v=>!v)} aria-expanded={showEditorialWaiting}>
        {showEditorialWaiting?'Ocultar':'Ver'} propuestas editoriales pendientes / en espera ({groups.editorialWaiting.length})
      </button>
      {showEditorialWaiting&&<Group title="Propuestas y contactos editoriales" description="Envíos y respuestas en espera, sin convertirlos automáticamente en oportunidades comerciales ni tareas de seguimiento." rows={groups.editorialWaiting} onSave={change} tasks={initialTasks} notes={initialNotes} today={today}/>}
    </div>
    <div><button type="button" className={button} onClick={()=>setShowDormant(v=>!v)}>{showDormant?'Ocultar':'Mostrar'} relaciones inactivas y cerradas ({groups.dormant.length})</button>
      {showDormant&&<div className="mt-4"><Group title="Fuera del circuito activo" description="Solo se reactivan con evidencia o decisión explícita." rows={groups.dormant} onSave={change} tasks={initialTasks} notes={initialNotes} today={today}/></div>}
    </div>
  </div>
}
