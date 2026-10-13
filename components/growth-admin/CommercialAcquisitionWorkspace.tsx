'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge, PageHeader, adminInput, adminPanel } from './AdminUi'
import { CRM_REALTIME_EVENT } from './SupabaseRealtimeInvalidator'

type Company = {
  id: string; name: string; domain?: string; website?: string; source_url?: string; phone?: string
  phone_source_url?: string; notes?: string; brief?: string; proposed_value?: string; next_step?: string
  relationship_type?: string; commercial_status?: string; contact_status?: string; email_status?: string
  score?: number | string; exclude_from_discovery?: boolean
}
type Person = { id: string; company_id?: string; name: string; role?: string; email?: string; linkedin_url?: string }
type Event = { id: string; company_id?: string; event_type?: string; channel?: string; summary?: string; occurred_at?: string }
type Opportunity = { opportunity_id: string; company_id?: string; source_signal_id?: string; name?: string; stage?: string; source?: string; metadata?: Record<string,unknown> }
type Signal = {
  signal_id: string; company_id?: string; company_name?: string; signal_type?: string; title: string; summary?: string
  source_url?: string; evidence?: string; recommended_offer?: string; status?: string
  metadata?: Record<string,unknown>
}
type Data = { companies:Company[]; people:Person[]; events:Event[]; opportunities:Opportunity[]; commercial_signals:Signal[]; totals?:{companies:number;people:number;events:number}; signals_error?:boolean }

type Segment = 'all'|'direct_client'|'linkedin_b2b'|'hiring_alternative'|'referral_partner'|'technical_partner'|'delivery_partner'|'unknown'
const segments:{key:Segment;label:string;description:string}[]=[
  {key:'all',label:'Todos',description:'Clientes, partners y oportunidades'},
  {key:'direct_client',label:'Clientes directos',description:'Empresas que podrían comprar directamente'},
  {key:'linkedin_b2b',label:'LinkedIn B2B / freelance',description:'Vacantes y proyectos externos registrados'},
  {key:'hiring_alternative',label:'Vacantes reconvertibles',description:'Contratación de personal, externalización por validar'},
  {key:'referral_partner',label:'Partners de referidos',description:'Colaboradores con acceso a clientes'},
  {key:'technical_partner',label:'Partners técnicos',description:'Especialización complementaria sin venderles su core'},
  {key:'delivery_partner',label:'Partners de ejecución',description:'Trabajos aportados por agencias y redes'},
  {key:'unknown',label:'Por clasificar',description:'Investigación pendiente de segmentación'}
]
const stageLabels:Record<string,string>={discovered:'Descubierta',researched:'Investigada',qualified:'Cualificada',contacted:'Contactada',awaiting_reply:'Esperando respuesta',replied:'Ha respondido',conversation:'Conversación',meeting_pending:'Reunión pendiente',meeting_scheduled:'Reunión confirmada',proposal:'Propuesta',won:'Ganada',lost:'Perdida',not_now:'Más adelante',excluded:'Excluida',applied:'Candidatura enviada',closed:'Cerrada'}
const contactLabels:Record<string,string>={uncontacted:'Sin contacto',not_contacted:'Sin contacto',contacted:'Contactada',replied:'Ha respondido',do_not_contact:'No contactar'}
function safeUrl(value?:string){try{const u=new URL(value||'');return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return''}}
function normalized(value?:string){return (value||'').toLocaleLowerCase('es').trim()}
function registeredEmail(company:Company,people:Person[]){
  const fromPerson=people.find(p=>p.company_id===company.id&&p.email)?.email
  if(fromPerson)return {value:fromPerson,verified:false,kind:'Persona registrada'}
  const note=company.notes||''
  const match=note.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)
  return match?{value:match[0],verified:false,kind:'Correo en notas de investigación'}:null
}
function approach(company:Company,persons:Person[]){
  const type=company.relationship_type||'unknown'
  const next=company.next_step||''
  const named=persons.find(p=>p.company_id===company.id&&p.role)
  if(company.contact_status==='do_not_contact')return {title:'No contactar',reason:'Existe una exclusión explícita; conservar el historial.',action:'No realizar nuevas acciones.'}
  if(['replied','conversation','meeting_pending','meeting_scheduled','proposal'].includes(company.commercial_status||''))return {title:'Continuar el hilo existente',reason:'Existe una conversación registrada. Evita reabrir la relación desde cero.',action:next||'Consultar el último intercambio y acordar el siguiente paso.'}
  if(/partner network|partner program|registro|registr|solicitud|formulario de partner|become a partner/i.test(next))
    return {title:'Programa oficial de partners',reason:'La empresa dispone de un canal específico de colaboración: tiene prioridad sobre un correo frío.',action:next}
  if(type==='hiring_alternative')return {title:'Oferta original primero',reason:'Una vacante laboral no demuestra interés en externalizar. Identificar contratación y condiciones antes de ofrecer B2B.',action:next||'Abrir la vacante; si encaja, preguntar si contempla colaboración externa.'}
  if(type==='direct_client'&&company.phone)return {title:'Llamada a dirección o administración',reason:'En una pyme con operación repetitiva, la central suele permitir llegar antes al responsable real que un email genérico.',action:next||'Llamar a la empresa y solicitar a la persona responsable del proceso.'}
  if(type==='direct_client')return {title:'Email profesional o formulario oficial',reason:'Presentar una hipótesis concreta sin afirmar que exista un problema interno.',action:next||'Localizar responsable financiero u operativo y comprobar correo profesional publicado.'}
  if(type==='delivery_partner')return {title:'Programa de partners o recruiter responsable',reason:'Confirmar quién aporta cliente y proyecto antes de hablar de reparto de trabajo.',action:next||'Solicitar modelo de colaboración y condiciones de asignación.'}
  if(type==='referral_partner')return {title:'Dirección comercial / acuerdos de referidos',reason:'Ofrecer especialización fuera de sus servicios actuales. Verificar que realmente pueden derivar clientes.',action:next||'Explorar referral y proyectos de terceros.'}
  if(type==='technical_partner')return {title:'Dirección técnica / partnerships',reason:'Reconocer las capacidades que ya tiene la firma y estudiar una laguna muy específica.',action:next||'Explorar complementariedad en optimización, simulación o estadística.'}
  return {title:named?'Contacto profesional identificado':'Validar tipo y comprador',reason:'Aún no hay evidencia suficiente para elegir el canal óptimo.',action:next||'Investigar decisor, caso de uso y canal publicado.'}
}
function callScript(c:Company) {
  const hypothesis=(c.proposed_value||'un proceso administrativo u operativo concreto').replace(/[\n\r]+/g,' ').slice(0,260)
  return `Buenos días, soy Arnau Sastre, de SC-Analytics, una consultora especializada en ciencia de datos y automatización de Barcelona. He estado viendo la actividad de ${c.name} y quería localizar a la persona responsable de operaciones o administración. Trabajamos en proyectos concretos de mejora de procesos y toma de decisiones, y me gustaría comprobar si tendría sentido explorar ${hypothesis.toLowerCase()}. No presupongo que actualmente tengáis un problema ni quiero quitar tiempo al equipo: ¿con quién podría comentarlo brevemente? Si lo veis razonable, podemos organizar una llamada de unos 30 minutos, sin compromiso, para entender vuestro contexto.`
}

export default function CommercialAcquisitionWorkspace(){
  const [data,setData]=useState<Data>({companies:[],people:[],events:[],opportunities:[],commercial_signals:[]})
  const [segment,setSegment]=useState<Segment>('all'),[query,setQuery]=useState(''),[status,setStatus]=useState(''),[selected,setSelected]=useState('')
  const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[updated,setUpdated]=useState('')
  const refresh=useCallback(async()=>{try{const res=await fetch('/api/growth-admin/commercial-memory',{cache:'no-store'});const body=await res.json();if(!res.ok)throw new Error(body.error||'Error de lectura');setData({...body,commercial_signals:body.commercial_signals||[]});setError('');setUpdated(new Date().toISOString())}catch(e){setError(e instanceof Error?e.message:'Error de conexión')}finally{setLoading(false)}},[])
  useEffect(()=>{void refresh();const reload=()=>{if(!document.hidden)void refresh()};const timer=window.setInterval(reload,60000);window.addEventListener(CRM_REALTIME_EVENT,reload);document.addEventListener('visibilitychange',reload);return()=>{window.clearInterval(timer);window.removeEventListener(CRM_REALTIME_EVENT,reload);document.removeEventListener('visibilitychange',reload)}},[refresh])
  const signals=useMemo(()=>data.commercial_signals.filter(s=>s.signal_type==='linkedin_freelance_posting'),[data.commercial_signals])
  const companies=useMemo(()=>data.companies.filter(c=>{
    const matchesCategory=segment==='all'||(segment!=='linkedin_b2b'&&(segment==='unknown'?(!c.relationship_type||c.relationship_type==='unknown'):c.relationship_type===segment))
    return matchesCategory&&(!query||normalized(`${c.name} ${c.domain||''} ${c.brief||''} ${c.proposed_value||''}`).includes(normalized(query)))&&(!status||c.commercial_status===status)
  }),[data.companies,segment,query,status])
  const jobs=useMemo(()=>signals.filter(s=>{
    if(segment!=='all'&&segment!=='linkedin_b2b')return false
    const opportunity=data.opportunities.find(o=>o.source_signal_id===s.signal_id||String(o.metadata?.linkedin_job_id||'')===String(s.metadata?.linkedin_job_id||''))
    const state=opportunity?.stage||s.status||'new'
    return (!query||normalized(`${s.title} ${s.company_name||''} ${s.summary||''}`).includes(normalized(query)))&&(!status||state===status)
  }),[data.opportunities,signals,segment,query,status])
  const company=data.companies.find(c=>selected===`company:${c.id}`)
  const job=signals.find(s=>selected===`job:${s.signal_id}`)
  const linkedOpportunity=job?data.opportunities.find(o=>o.source_signal_id===job.signal_id||String(o.metadata?.linkedin_job_id||'')===String(job.metadata?.linkedin_job_id||'')):undefined
  const companyPeople=company?data.people.filter(p=>p.company_id===company.id):[]
  const email=company?registeredEmail(company,data.people):null
  const guidance=company?approach(company,data.people):null
  const history=company?data.events.filter(e=>e.company_id===company.id).sort((a,b)=>(b.occurred_at||'').localeCompare(a.occurred_at||'')):[]
  const counts=useMemo(()=>Object.fromEntries(segments.map(x=>[x.key,x.key==='all'?data.companies.length+signals.length:x.key==='linkedin_b2b'?signals.length:data.companies.filter(c=>x.key==='unknown'?(!c.relationship_type||c.relationship_type==='unknown'):c.relationship_type===x.key).length])),[data.companies,signals])
  async function saveCompany(form:FormData){
    if(!company)return
    setSaving(true);setNotice('');setError('')
    try{
      const payload={action:'patch',entity:'company',id:company.id,patch:{relationship_type:String(form.get('relationship_type')),commercial_status:String(form.get('commercial_status')),contact_status:String(form.get('contact_status')),brief:String(form.get('brief')),proposed_value:String(form.get('proposed_value')),next_step:String(form.get('next_step'))}}
      const response=await fetch('/api/growth-admin/commercial-memory',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      const result=await response.json()
      if(!response.ok||result.error)throw new Error(result.error||'No se ha guardado')
      setNotice('Ficha actualizada y guardada en el CMI.');await refresh()
    }catch(e){setError(e instanceof Error?e.message:'No se ha podido guardar')}finally{setSaving(false)}
  }
  async function copy(text:string){try{await navigator.clipboard.writeText(text);setNotice('Texto copiado; no se ha enviado ningún mensaje.')}catch{setError('El navegador no ha permitido copiar; selecciona el texto manualmente.')}}
  return <div>
    <PageHeader eyebrow="Comercial · memoria única" title="Clientes y partners" description="Selecciona la vía comercial, revisa evidencia y contacto, decide el mejor abordaje y registra cada avance. Sin búsquedas ni envíos automáticos." actions={<button onClick={()=>void refresh()} disabled={loading} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">{loading?'Actualizando…':'Actualizar registros'}</button>}/>
    <div className="mb-5 grid gap-2 md:grid-cols-4">
      <div className={`${adminPanel} p-4`}><p className="text-xs text-slate-500">Empresas en memoria</p><p className="mt-1 text-2xl font-semibold">{data.totals?.companies||data.companies.length}</p></div>
      <div className={`${adminPanel} p-4`}><p className="text-xs text-slate-500">LinkedIn B2B / freelance</p><p className="mt-1 text-2xl font-semibold">{signals.length}</p></div>
      <div className={`${adminPanel} p-4`}><p className="text-xs text-slate-500">Sin contacto registrado</p><p className="mt-1 text-2xl font-semibold">{data.companies.filter(c=>!['contacted','replied'].includes(c.contact_status||'')).length}</p></div>
      <div className={`${adminPanel} p-4`}><p className="text-xs text-slate-500">Última consulta al CMI</p><p className="mt-2 text-xs font-medium">{updated?new Date(updated).toLocaleString('es-ES',{timeZone:'Europe/Madrid'}):'Pendiente'}</p></div>
    </div>
    {error&&<div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}
    {notice&&<div role="status" className="mb-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">{notice}</div>}
    {data.signals_error&&<div className="mb-4 text-xs text-amber-700">Las señales están temporalmente incompletas. El historial de empresas sigue disponible.</div>}
    <section className={`${adminPanel} mb-5 p-4`}>
      <label className="block text-xs font-semibold text-slate-600" htmlFor="acq-segment">Tipo de búsqueda / colaboración</label>
      <div className="mt-2 flex flex-wrap gap-3">
        <select id="acq-segment" className={`${adminInput} min-w-[240px]`} value={segment} onChange={e=>{setSegment(e.target.value as Segment);setSelected('')}}>{segments.map(s=><option key={s.key} value={s.key}>{s.label} ({counts[s.key]})</option>)}</select>
        <input aria-label="Buscar empresa u oferta" className={`${adminInput} min-w-[200px] flex-1`} placeholder="Empresa, proceso, sector u oferta" value={query} onChange={e=>setQuery(e.target.value)}/>
        <select aria-label="Filtrar por etapa" className={adminInput} value={status} onChange={e=>setStatus(e.target.value)}><option value="">Todas las etapas</option>{Object.entries(stageLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}<option value="new">Señal nueva</option><option value="archived">Oferta histórica / cerrada</option></select>
      </div>
      <p className="mt-2 text-xs text-slate-500">{segments.find(s=>s.key===segment)?.description}. Fuente: memoria comercial del CMI; una ficha investigada no equivale a un contacto realizado.</p>
    </section>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
      <section className={`${adminPanel} overflow-hidden`}>
        <header className="border-b border-slate-200 px-4 py-3"><h2 className="font-semibold">Resultados · {companies.length+jobs.length}</h2></header>
        <div className="max-h-[900px] overflow-y-auto">
          {companies.map(c=><button type="button" key={c.id} onClick={()=>setSelected(`company:${c.id}`)} className={`w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${selected===`company:${c.id}`?'bg-indigo-50':''}`}>
            <div className="flex items-start justify-between gap-2"><strong className="text-sm">{c.name}</strong><Badge>{stageLabels[c.commercial_status||'']||'Por investigar'}</Badge></div>
            <p className="mt-1 line-clamp-2 text-xs text-slate-600">{c.brief||c.proposed_value||c.domain||'Datos pendientes'}</p>
            <p className="mt-2 text-[11px] text-slate-500">{segments.find(s=>s.key===c.relationship_type)?.label||'Por clasificar'} · {contactLabels[c.contact_status||'uncontacted']||'Estado pendiente'}</p>
          </button>)}
          {jobs.map(s=><button type="button" key={s.signal_id} onClick={()=>setSelected(`job:${s.signal_id}`)} className={`w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${selected===`job:${s.signal_id}`?'bg-indigo-50':''}`}>
            <div className="flex items-start justify-between gap-2"><strong className="text-sm">{s.title}</strong><Badge>{s.status==='archived'?'Histórica':stageLabels[data.opportunities.find(o=>o.source_signal_id===s.signal_id)?.stage||'']||'Revisar'}</Badge></div>
            <p className="mt-1 text-xs text-slate-600">{s.company_name||'Anunciante no identificado'} · LinkedIn freelance/B2B</p>
          </button>)}
          {!companies.length&&!jobs.length&&<p className="p-6 text-sm text-slate-500">No hay resultados en esta categoría. Prueba con otro filtro.</p>}
        </div>
      </section>
      <section className={`${adminPanel} min-h-[420px] p-5 md:p-6`}>
        {company?<div key={company.id}>
          <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-2xl font-semibold">{company.name}</h2><p className="mt-1 text-xs text-slate-500">{segments.find(s=>s.key===company.relationship_type)?.label||'Por clasificar'} · {contactLabels[company.contact_status||'uncontacted']||'Estado por verificar'}</p></div><Badge>{stageLabels[company.commercial_status||'']||'Investigada'}</Badge></div>
          <p className="mt-4 text-sm leading-6 text-slate-700">{company.brief||'Descripción pendiente de completar con evidencia verificable.'}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">{safeUrl(company.website)&&<a href={safeUrl(company.website)} className="font-medium text-indigo-700" target="_blank" rel="noreferrer">Sitio web ↗</a>}{safeUrl(company.source_url)&&<a href={safeUrl(company.source_url)} className="font-medium text-indigo-700" target="_blank" rel="noreferrer">Fuente ↗</a>}{company.phone&&<a href={`tel:${company.phone.replace(/[^+\d]/g,'')}`} className="font-medium text-indigo-700">Llamar {company.phone}</a>}{email&&<a href={`mailto:${email.value}`} className="font-medium text-indigo-700">Email {email.value}</a>}</div>
          {email&&<p className="mt-2 text-xs text-slate-500">{email.kind}. Comprueba destinatario y fuente antes de enviar.</p>}
          <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Abordaje comercial recomendado</p><h3 className="mt-2 font-semibold">{guidance?.title}</h3><p className="mt-2 text-sm text-slate-600">{guidance?.reason}</p><p className="mt-3 text-sm"><strong>Primer paso:</strong> {guidance?.action}</p><p className="mt-2 text-xs text-slate-600">Objetivo: conversación de 30 minutos, sin compromiso, solo si hay encaje real.</p></div>
          {company.proposed_value&&<div className="mt-4"><h3 className="text-sm font-semibold">Hipótesis de valor (no necesidad confirmada)</h3><p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{company.proposed_value}</p></div>}
          {company.phone&&company.relationship_type==='direct_client'&&<details className="mt-4 rounded-xl border border-slate-200 p-4"><summary className="cursor-pointer text-sm font-semibold">Guion de llamada para conseguir discovery</summary><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{callScript(company)}</p><button type="button" className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold" onClick={()=>void copy(callScript(company))}>Copiar guion</button></details>}
          {companyPeople.length>0&&<div className="mt-5"><h3 className="text-sm font-semibold">Personas asociadas</h3>{companyPeople.map(p=><div key={p.id} className="mt-2 rounded-lg border border-slate-100 p-3"><strong className="text-sm">{p.name}</strong><p className="text-xs text-slate-500">{p.role||'Cargo no verificado'}</p>{safeUrl(p.linkedin_url)&&<a className="text-xs text-indigo-700" target="_blank" rel="noreferrer" href={safeUrl(p.linkedin_url)}>Perfil profesional ↗</a>}</div>)}</div>}
          <details className="mt-5"><summary className="cursor-pointer text-sm font-semibold">Historial y notas ({history.length} eventos)</summary>{company.notes&&<p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-600">{company.notes}</p>}{history.map(e=><div key={e.id} className="mt-2 border-l-2 border-slate-200 pl-3 text-xs"><span className="text-slate-400">{e.occurred_at?new Date(e.occurred_at).toLocaleDateString('es-ES'):''} · {e.channel||'chat'}</span><p className="mt-1">{e.summary}</p></div>)}</details>
          <form className="mt-6 space-y-3 border-t border-slate-200 pt-5" onSubmit={e=>{e.preventDefault();void saveCompany(new FormData(e.currentTarget))}}><h3 className="font-semibold">Actualizar ficha sin perder historial</h3><div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-semibold">Tipo<select name="relationship_type" defaultValue={company.relationship_type||'unknown'} className={`${adminInput} mt-1 w-full`}>{segments.filter(s=>!['all','linkedin_b2b'].includes(s.key)).map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select></label>
            <label className="text-xs font-semibold">Etapa<select name="commercial_status" defaultValue={company.commercial_status||'discovered'} className={`${adminInput} mt-1 w-full`}>{Object.entries(stageLabels).filter(([k])=>!['applied','closed'].includes(k)).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
            <label className="text-xs font-semibold">Contacto<select name="contact_status" defaultValue={company.contact_status||'uncontacted'} className={`${adminInput} mt-1 w-full`}>{Object.entries(contactLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
          </div>
          <label className="block text-xs font-semibold">Contexto verificado<textarea name="brief" rows={2} defaultValue={company.brief||''} className={`${adminInput} mt-1 w-full`}/></label>
          <label className="block text-xs font-semibold">Hipótesis de servicio<textarea name="proposed_value" rows={2} defaultValue={company.proposed_value||''} className={`${adminInput} mt-1 w-full`}/></label>
          <label className="block text-xs font-semibold">Siguiente acción concreta<textarea name="next_step" rows={3} defaultValue={company.next_step||''} className={`${adminInput} mt-1 w-full`}/></label>
          <button disabled={saving} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving?'Guardando…':'Guardar cambios'}</button>
          </form>
        </div>:job?<div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">LinkedIn freelance / B2B</p><h2 className="mt-2 text-xl font-semibold">{job.title}</h2><p className="mt-2 text-sm text-slate-600">{job.company_name||'Anunciante por confirmar'}</p>
          <div className="mt-4 flex gap-2"><Badge>{job.status==='archived'?'Oferta histórica: NO aplicar':stageLabels[linkedOpportunity?.stage||'']||'Revisar vigencia'}</Badge></div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{job.summary||'Información por completar.'}</p>
          <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4"><h3 className="text-sm font-semibold">Mejor vía de entrada</h3><p className="mt-2 text-sm text-slate-700">{job.status==='archived'?'No solicitar esta vacante. Guardar la empresa como antecedente de contratación freelance y buscar futuras convocatorias o el recruiter responsable.':'Comprobar primero la oferta en LinkedIn desde la sesión personal, modalidad y requisitos. Si la candidatura está abierta y encaja, aplicar por el canal indicado antes de escribir un correo frío. Si es un recruiter, conservar su perfil para futuras asignaciones.'}</p>
          <p className="mt-3 text-sm"><strong>Posicionamiento:</strong> {job.recommended_offer||'Determinar perfil personal o equipo en función del anuncio.'}</p></div>
          {safeUrl(job.source_url)&&<a className="mt-5 inline-block rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white" href={safeUrl(job.source_url)} rel="noreferrer" target="_blank">{job.status==='archived'?'Ver publicación histórica ↗':'Revisar oferta en LinkedIn ↗'}</a>}
          <p className="mt-4 text-xs text-slate-500">ID {String(job.metadata?.linkedin_job_id||job.signal_id)} · Estado del CMI: {linkedOpportunity?.stage||'Señal sin oportunidad activa'}. Abrir el anuncio no envía una candidatura.</p>
          {job.evidence&&<details className="mt-4 text-xs"><summary className="cursor-pointer font-semibold">Evidencia y condiciones</summary><p className="mt-2 whitespace-pre-wrap">{job.evidence}</p></details>}
        </div>:<div className="py-16 text-center"><p className="font-semibold">Selecciona una empresa o una oferta</p><p className="mt-2 text-sm text-slate-500">Verás el enfoque comercial específico, los datos públicos disponibles, la propuesta de valor y el historial de contacto.</p></div>}
      </section>
    </div>
  </div>
}
