'use client'
import { useMemo, useState } from 'react'
export type DailyRelation={
  id:string;display_name:string;role:'client'|'collaborator'|'worker';status:string;user_curated:boolean;
  contact_email?:string|null;last_interaction_on?:string|null;last_interaction_kind?:string|null;
  last_interaction_summary:string;last_interaction_url?:string|null;next_meeting_on?:string|null;
  next_review_on?:string|null;followup_count:number;followup_policy:string;notes?:string;
}
const states=[['active','Activa'],['waiting','En espera'],['dormant','Inactiva'],['closed','Cerrada']]
const kind:Record<string,string>={email:'Correo',meeting:'Reunión',slack:'Slack',platform:'Plataforma',manual:'Manual'}
const select='rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900'
const button='rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50'
const dateEs=(str:string)=>{try{return new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(str+'T12:00:00Z'))}catch{return str}}
function RelationCard({initial,onSave}:{initial:DailyRelation;onSave:(r:DailyRelation)=>void}){
  const [state,setState]=useState(initial.status)
  const [reviewDate,setReviewDate]=useState(initial.next_review_on||'')
  const [expand,setExpand]=useState(false)
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
      onSave(r);setState(r.status);setReviewDate(r.next_review_on||'');setInteractionSummary('');setExpand(false);setMsg('Actualizado')
    }catch(e){setErr(e instanceof Error?e.message:'Error desconocido')}
    finally{setBusy(false)}
  }
  const last=initial.last_interaction_on?dateEs(initial.last_interaction_on):'Pendiente de verificar'
  const review=initial.next_review_on?dateEs(initial.next_review_on):'Sin fecha asignada'
  return <article className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-950">{initial.display_name}</p>
          <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{initial.role==='worker'?'Trabajador':initial.role==='client'?'Cliente':'Colaborador'}</span>
          {initial.status==='waiting'&&<span className="text-[11px] text-amber-700">Esperando respuesta</span>}
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-600"><b>Última interacción:</b> {last}{initial.last_interaction_kind?' · '+(kind[initial.last_interaction_kind]||initial.last_interaction_kind):''}</p>
        {initial.last_interaction_summary&&<p className="mt-1 text-xs leading-5 text-slate-600">{initial.last_interaction_summary}</p>}
        {initial.next_meeting_on&&<p className="mt-2 text-xs font-semibold text-indigo-700">Próxima reunión: {dateEs(initial.next_meeting_on)}</p>}
        {initial.status==='waiting'&&<p className="mt-1 text-xs text-slate-500">Revisar el: {review}</p>}
        {initial.contact_email&&<p className="mt-1 text-xs text-slate-400">{initial.contact_email}</p>}
        {initial.id==='tim'&&<p className="mt-1 text-xs font-medium text-indigo-700">Seguimiento por Slack (sin comprobación automática de mensajes)</p>}
        {initial.followup_count>0&&<p className="mt-1 text-xs text-slate-500">Seguimientos enviados: {initial.followup_count}/2</p>}
      </div>
      <div className="flex w-full shrink-0 flex-col gap-2 md:w-[200px]">
        <label className="text-xs text-slate-600">Estado
          <select value={state} onChange={e=>setState(e.target.value)} disabled={busy} className={select+' mt-1 w-full'}>{states.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>
        </label>
        {state==='waiting'&&<label className="text-xs text-slate-600">Revisar el
          <input type="date" value={reviewDate} onChange={e=>setReviewDate(e.target.value)} className={select+' mt-1 w-full'}/>
        </label>}
        <button type="button" onClick={()=>save({action:'status',status:state,next_review_on:reviewDate||null})} disabled={busy||(state===initial.status&&(!reviewDate||reviewDate===initial.next_review_on))} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">Guardar estado</button>
        <button type="button" onClick={()=>setExpand(v=>!v)} className={button}>{expand?'Cerrar':'Registrar interacción'}</button>
        {initial.status==='waiting'&&initial.followup_count<2&&<button type="button" onClick={()=>save({action:'followup',next_review_on:reviewDate||null})} disabled={busy} className={button}>He enviado follow-up</button>}
        {msg&&<p role="status" className="text-xs text-emerald-700">{msg}</p>}
        {err&&<p role="alert" className="text-xs text-rose-700">{err}</p>}
      </div>
    </div>
    {expand&&<form onSubmit={e=>{e.preventDefault();void save({action:'interaction',date:interactionDate||undefined,kind:interactionKind,summary:interactionSummary,next_review_on:reviewDate||null})}} className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3">
      <label className="text-xs text-slate-600">Fecha de interacción<input type="date" value={interactionDate} onChange={e=>setInteractionDate(e.target.value)} className={select+' mt-1 w-full'}/></label>
      <label className="text-xs text-slate-600">Canal<select value={interactionKind} onChange={e=>setInteractionKind(e.target.value)} className={select+' mt-1 w-full'}>{Object.entries(kind).map(([k,label])=><option key={k} value={k}>{label}</option>)}</select></label>
      <label className="text-xs text-slate-600 sm:col-span-3">Resumen<textarea value={interactionSummary} onChange={e=>setInteractionSummary(e.target.value)} rows={2} required maxLength={1200} className={select+' mt-1 w-full'} placeholder="Qué se habló y cuál es el siguiente paso"/></label>
      <button disabled={busy} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white sm:col-span-1">Guardar interacción</button>
    </form>}
  </article>
}
function Group({title,description,rows,onSave}:{title:string;description:string;rows:DailyRelation[];onSave:(r:DailyRelation)=>void}){
  return <section className="space-y-3"><div><h2 className="text-xl font-semibold text-slate-950">{title} <span className="font-normal text-slate-500">({rows.length})</span></h2><p className="mt-1 text-xs text-slate-500">{description}</p></div>
    {rows.length?<div className="grid gap-3 xl:grid-cols-2">{rows.map(r=><RelationCard key={r.id} initial={r} onSave={onSave}/>)}</div>:<p className="rounded-lg border border-dashed border-slate-300 p-5 text-xs text-slate-500">No hay relaciones en esta sección.</p>}
  </section>
}
export default function DailyRelationships({initialRelations}:{initialRelations:DailyRelation[]}){
  const [relations,setRelations]=useState(initialRelations)
  const [showDormant,setShowDormant]=useState(false)
  const change=(next:DailyRelation)=>setRelations(prev=>prev.map(r=>r.id===next.id?next:r))
  const groups=useMemo(()=>{
    const current=relations.filter(r=>r.status==='active'||r.status==='waiting')
    return {
      companies:current.filter(r=>r.role!=='worker').sort((a,b)=>a.display_name.localeCompare(b.display_name,'es')),
      workers:current.filter(r=>r.role==='worker').sort((a,b)=>a.display_name.localeCompare(b.display_name,'es')),
      dormant:relations.filter(r=>r.status==='dormant'||r.status==='closed')
    }
  },[relations])
  return <div className="space-y-8">
    <Group title="Clientes y colaboradores activos" description="Relaciones reales en curso; incluye conversaciones por correo, reuniones, plataformas o Slack. Una espera no equivale a una tarea para mañana." rows={groups.companies} onSave={change}/>
    <Group title="Trabajadores y técnicos" description="Personas con las que puedes trabajar en delivery o equipo, separadas de los clientes." rows={groups.workers} onSave={change}/>
    <div><button type="button" className={button} onClick={()=>setShowDormant(v=>!v)}>{showDormant?'Ocultar':'Mostrar'} relaciones inactivas y cerradas ({groups.dormant.length})</button>
    {showDormant&&<div className="mt-4"><Group title="Fuera del circuito activo" description="No generan seguimientos automáticos. Solo vuelven si existe nueva respuesta o decisión explícita." rows={groups.dormant} onSave={change}/></div>}</div>
  </div>
}
