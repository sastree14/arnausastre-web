import {redirect} from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import {EmptyState,PageHeader,SectionHeading,StatCard,adminButtonPrimary,adminButtonSecondary,adminInput,adminPanel} from '@/components/growth-admin/AdminUi'
import {isGrowthAdminAuthenticated} from '@/lib/growth-admin'
import {getDealDeskBundle} from '@/lib/growth-admin-performance'
export const dynamic='force-dynamic'
type Params={opportunity?:string;step?:string;saved?:string;created?:string;queued?:string}
const val=(obj:Record<string,any>|undefined,key:string)=>{const value=obj?.[key];return Array.isArray(value)?value.join('\n'):String(value??'')}
const num=(obj:Record<string,any>|undefined,key:string,fallback='')=>String(obj?.[key]??fallback)
const money=(value:unknown,currency='EUR')=>new Intl.NumberFormat('es-ES',{style:'currency',currency:currency||'EUR',maximumFractionDigits:0}).format(Number(value||0))
function Step({id,label,active,opportunity}:{id:string;label:string;active:boolean;opportunity:string}){return <a href={`/growth-admin/deal-desk?opportunity=${encodeURIComponent(opportunity)}&step=${id}#${id}`} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${active?'border-indigo-300 bg-indigo-50 text-indigo-800':'border-slate-200 bg-white text-slate-600'}`}>{label}</a>}
function Score({name,label,value}:{name:string;label:string;value:string}){return <label className="text-xs font-semibold text-slate-600">{label}<select name={name} defaultValue={value||'0'} className={`mt-1 w-full ${adminInput}`}><option value="0">Sin valorar</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select></label>}
export default async function DealDeskPage({searchParams}:{searchParams:Promise<Params>}){
  if(!(await isGrowthAdminAuthenticated()))redirect('/growth-admin/login')
  const params=await searchParams
  const bundle=await getDealDeskBundle()
  const selectedId=params.opportunity||bundle.opportunities[0]?.opportunity_id||''
  const opportunity=bundle.opportunities.find(item=>item.opportunity_id===selectedId)
  const workspace=bundle.workspaces.find(item=>String(item.opportunity_id)===selectedId) as Record<string,any>|undefined
  const step=['qualification','discovery','proposal','budget'].includes(params.step||'')?String(params.step):String(workspace?.status||'qualification')
  const q=(workspace?.qualification||{}) as Record<string,any>
  const d=(workspace?.discovery||{}) as Record<string,any>
  const p=(workspace?.proposal||{}) as Record<string,any>
  const b=(workspace?.budget||{}) as Record<string,any>
  const recommendation=(b.ai_recommendation||{}) as Record<string,any>

  return <AdminShell active="deal-desk">
    <PageHeader eyebrow="Comercial · Expediente" title="Deal Desk" description="Un expediente por cliente y proyecto potencial: qualification, discovery, propuesta y presupuesto permanecen conectados y editables."/>
    {params.created&&<div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-800">Expediente creado. Empieza por Qualification.</div>}
    {params.saved&&<div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">Información guardada en el expediente.</div>}

    <details className={`${adminPanel} mb-5 p-4`}>
      <summary className="cursor-pointer text-sm font-semibold text-slate-900">Añadir o abrir un cliente</summary>
      <div className="mt-4 grid gap-5 xl:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">Desde CRM</p>
          {bundle.companies.length?<form action="/api/growth-admin/deal-desk" method="post" className="mt-3 grid gap-3">
            <input type="hidden" name="action" value="create"/>
            <select name="company_id" required className={adminInput}><option value="">Selecciona empresa</option>{bundle.companies.map(company=><option key={String(company.company_id)} value={String(company.company_id)}>{String(company.name)}</option>)}</select>
            <select name="primary_person_id" className={adminInput}><option value="">Sin contacto principal</option>{bundle.people.map(person=><option key={String(person.person_id)} value={String(person.person_id)}>{String(person.name)} · {String(person.role||'')}</option>)}</select>
            <select name="currency" defaultValue="EUR" className={adminInput}><option>EUR</option><option>USD</option></select>
            <button className={adminButtonPrimary}>Crear expediente</button>
          </form>:<p className="mt-2 text-xs text-slate-500">No hay empresas guardadas todavía.</p>}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">Cliente manual</p>
          <form action="/api/growth-admin/deal-desk" method="post" className="mt-3 grid gap-2 sm:grid-cols-2">
            <input type="hidden" name="action" value="create_manual"/>
            <input name="company_name" required placeholder="Empresa" className={adminInput}/><input name="website" placeholder="Web" className={adminInput}/>
            <input name="industry" placeholder="Industria" className={adminInput}/><input name="country" placeholder="País" className={adminInput}/>
            <input name="contact_name" placeholder="Contacto" className={adminInput}/><input name="contact_role" placeholder="Cargo" className={adminInput}/>
            <input name="contact_email" placeholder="Email" className={adminInput}/><select name="currency" defaultValue="EUR" className={adminInput}><option>EUR</option><option>USD</option></select>
            <textarea name="company_notes" placeholder="Notas iniciales" className={`sm:col-span-2 min-h-20 ${adminInput}`}/>
            <button className={`sm:col-span-2 ${adminButtonPrimary}`}>Añadir cliente y crear expediente</button>
          </form>
        </div>
      </div>
    </details>

    {!bundle.opportunities.length?<EmptyState>Crea un expediente desde un cliente existente o añade uno manualmente.</EmptyState>:<>
      <section className={`${adminPanel} p-4`}>
        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <form method="get" className="flex gap-2"><input type="hidden" name="step" value={step}/><select name="opportunity" defaultValue={selectedId} className={`min-w-0 flex-1 ${adminInput}`}>{bundle.opportunities.map(item=><option key={item.opportunity_id} value={item.opportunity_id}>{item.company_name||item.name} · {item.stage}</option>)}</select><button className={adminButtonPrimary}>Abrir</button></form>
          {opportunity&&<div className="grid grid-cols-3 gap-2"><StatCard label="Etapa" value={opportunity.stage||'—'}/><StatCard label="Prob." value={`${Number(opportunity.probability||0)}%`} tone="blue"/><StatCard label="Valor" value={money(opportunity.value,opportunity.currency)} tone="green"/></div>}
        </div>
      </section>

      {opportunity&&<>
        <div className="mt-4 flex flex-wrap gap-2"><Step id="qualification" label="1 · Qualification" active={step==='qualification'} opportunity={selectedId}/><Step id="discovery" label="2 · Discovery Call" active={step==='discovery'} opportunity={selectedId}/><Step id="proposal" label="3 · Proposal" active={step==='proposal'} opportunity={selectedId}/><Step id="budget" label="4 · Budget" active={step==='budget'} opportunity={selectedId}/></div>
        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_320px]">
          <div>
            {step==='qualification'&&<div id="qualification"><SectionHeading eyebrow="Paso 1" title="Qualification" description="Decide si merece tiempo comercial y deja el razonamiento almacenado."/><form action="/api/growth-admin/deal-desk" method="post" className={`${adminPanel} grid gap-3 p-5 md:grid-cols-2`}><input type="hidden" name="action" value="qualification"/><input type="hidden" name="opportunity_id" value={selectedId}/><input type="hidden" name="return_to" value={`/growth-admin/deal-desk?opportunity=${encodeURIComponent(selectedId)}&step=qualification#qualification`}/><label className="md:col-span-2 text-xs font-semibold">Problema<textarea name="problem" defaultValue={val(q,'problem')} className={`mt-1 min-h-20 w-full ${adminInput}`}/></label><label className="md:col-span-2 text-xs font-semibold">Impacto de negocio<textarea name="impact" defaultValue={val(q,'impact')} className={`mt-1 min-h-20 w-full ${adminInput}`}/></label><input name="decision_maker" defaultValue={val(q,'decision_maker')||opportunity.person_name||''} placeholder="Decisor" className={adminInput}/><input name="budget_range" defaultValue={val(q,'budget_range')} placeholder="Presupuesto conocido" className={adminInput}/><textarea name="data_readiness" defaultValue={val(q,'data_readiness')} placeholder="Datos y sistemas disponibles" className={`md:col-span-2 min-h-20 ${adminInput}`}/><div className="md:col-span-2 grid grid-cols-2 gap-2 lg:grid-cols-3"><Score name="problem_score" label="Problema" value={num(q,'problem_score','0')}/><Score name="impact_score" label="Impacto" value={num(q,'impact_score','0')}/><Score name="urgency_score" label="Urgencia" value={num(q,'urgency_score','0')}/><Score name="authority_score" label="Decisor" value={num(q,'authority_score','0')}/><Score name="budget_score" label="Presupuesto" value={num(q,'budget_score','0')}/><Score name="data_score" label="Viabilidad datos" value={num(q,'data_score','0')}/></div><textarea name="qualification_notes" defaultValue={val(q,'qualification_notes')} placeholder="Notas" className={`md:col-span-2 min-h-20 ${adminInput}`}/><button className={`md:col-span-2 ${adminButtonPrimary}`}>Guardar qualification</button></form></div>}

            {step==='discovery'&&<div id="discovery"><SectionHeading eyebrow="Paso 2" title="Discovery Call" description="Guion y acta de la conversación en el mismo expediente."/><form action="/api/growth-admin/deal-desk" method="post" className={`${adminPanel} grid gap-3 p-5 md:grid-cols-2`}><input type="hidden" name="action" value="discovery"/><input type="hidden" name="opportunity_id" value={selectedId}/><input type="hidden" name="return_to" value={`/growth-admin/deal-desk?opportunity=${encodeURIComponent(selectedId)}&step=discovery#discovery`}/>{[['current_process','¿Cómo funciona hoy el proceso?'],['desired_state','¿Qué resultado quieren conseguir?'],['business_value','¿Qué valor tiene resolverlo?'],['systems_data','¿Qué sistemas y datos intervienen?'],['constraints','¿Qué restricciones existen?'],['budget_timing','¿Presupuesto y timing?'],['decision_process','¿Quién decide y cómo?'],['discovery_notes','Notas y conclusiones']].map(([name,label])=><label key={name} className="text-xs font-semibold">{label}<textarea name={name} defaultValue={val(d,name)} className={`mt-1 min-h-24 w-full ${adminInput}`}/></label>)}<input name="next_action" defaultValue={val(d,'next_action')} placeholder="Siguiente acción" className={adminInput}/><input type="datetime-local" name="next_action_at" defaultValue={val(d,'next_action_at').slice(0,16)} className={adminInput}/><button className={`md:col-span-2 ${adminButtonPrimary}`}>Guardar discovery</button></form></div>}

            {step==='proposal'&&<div id="proposal"><SectionHeading eyebrow="Paso 3" title="Proposal Builder" description="Genera un borrador desde Qualification y Discovery, y edítalo antes de enviarlo."/><div className="mb-3 flex flex-wrap gap-2"><form action="/api/growth-admin/operator-task" method="post"><input type="hidden" name="action" value="deal_proposal"/><input type="hidden" name="opportunity_id" value={selectedId}/><input type="hidden" name="return_to" value={`/growth-admin/deal-desk?opportunity=${encodeURIComponent(selectedId)}&step=proposal#proposal`}/><button className={adminButtonPrimary}>Generar borrador con IA</button></form><a href={`/growth-admin/deal-desk/proposal/${encodeURIComponent(selectedId)}`} className={adminButtonSecondary}>Vista documento / PDF</a></div><form action="/api/growth-admin/deal-desk" method="post" className={`${adminPanel} grid gap-3 p-5 md:grid-cols-2`}><input type="hidden" name="action" value="proposal"/><input type="hidden" name="opportunity_id" value={selectedId}/><input type="hidden" name="return_to" value={`/growth-admin/deal-desk?opportunity=${encodeURIComponent(selectedId)}&step=proposal#proposal`}/>{[['objective','Objetivo'],['executive_summary','Resumen ejecutivo'],['scope','Alcance'],['deliverables','Entregables'],['approach','Enfoque'],['exclusions','Fuera de alcance'],['timeline','Fases y timing'],['acceptance_criteria','Criterios de aceptación'],['assumptions','Supuestos'],['open_items','Puntos abiertos'],['proposal_notes','Notas comerciales']].map(([name,label])=><label key={name} className="text-xs font-semibold">{label}<textarea name={name} defaultValue={val(p,name)} className={`mt-1 min-h-24 w-full ${adminInput}`}/></label>)}<button className={`md:col-span-2 ${adminButtonPrimary}`}>Guardar propuesta</button></form></div>}

            {step==='budget'&&<div id="budget"><SectionHeading eyebrow="Paso 4" title="Budget Helper" description="La IA propone una heurística interna; tú decides el presupuesto final."/><div className="mb-3"><form action="/api/growth-admin/operator-task" method="post"><input type="hidden" name="action" value="deal_budget"/><input type="hidden" name="opportunity_id" value={selectedId}/><input type="hidden" name="return_to" value={`/growth-admin/deal-desk?opportunity=${encodeURIComponent(selectedId)}&step=budget#budget`}/><button className={adminButtonPrimary}>Obtener recomendación con IA</button></form></div>{Object.keys(recommendation).length>0&&<div className="mb-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4"><p className="text-xs font-semibold text-indigo-900">Recomendación interna, no benchmark de mercado</p><div className="mt-2 grid grid-cols-3 gap-2 text-xs"><div><span className="text-slate-500">Bajo</span><p className="font-semibold">{money(recommendation.suggested_price_low,opportunity.currency)}</p></div><div><span className="text-slate-500">Recomendado</span><p className="font-semibold">{money(recommendation.suggested_price_recommended,opportunity.currency)}</p></div><div><span className="text-slate-500">Alto</span><p className="font-semibold">{money(recommendation.suggested_price_high,opportunity.currency)}</p></div></div><p className="mt-2 text-[11px] leading-5 text-indigo-800">{String(recommendation.rationale||'')}</p></div>}<form action="/api/growth-admin/deal-desk" method="post" className={`${adminPanel} grid gap-3 p-5 md:grid-cols-3`}><input type="hidden" name="action" value="budget"/><input type="hidden" name="opportunity_id" value={selectedId}/><input type="hidden" name="return_to" value={`/growth-admin/deal-desk?opportunity=${encodeURIComponent(selectedId)}&step=budget#budget`}/>{[['estimated_hours','Horas estimadas'],['internal_rate','Coste interno / h'],['external_costs','Costes externos'],['contingency_pct','Contingencia %'],['target_margin_pct','Margen objetivo %'],['final_price','Precio final']].map(([name,label])=><label key={name} className="text-xs font-semibold">{label}<input type="number" step="0.01" min="0" name={name} defaultValue={num(b,name,name==='contingency_pct'?'10':name==='target_margin_pct'?'35':'')} className={`mt-1 w-full ${adminInput}`}/></label>)}<select name="currency" defaultValue={val(b,'currency')||opportunity.currency||'EUR'} className={adminInput}><option>EUR</option><option>USD</option></select><textarea name="pricing_notes" defaultValue={val(b,'pricing_notes')} placeholder="Notas de pricing" className={`md:col-span-2 min-h-20 ${adminInput}`}/><button className={`md:col-span-3 ${adminButtonPrimary}`}>Guardar presupuesto final</button></form></div>}
          </div>

          <aside className={`${adminPanel} h-fit p-4`}>
            <p className="text-xs font-semibold uppercase text-slate-400">Expediente</p><h3 className="mt-2 text-lg font-semibold">{opportunity.company_name||opportunity.name}</h3><p className="mt-3 text-xs leading-5 text-slate-600">La Opportunity es la venta potencial concreta. Este expediente almacena todo lo que sabemos y decidimos sobre ella.</p>
            <form action="/api/growth-admin/deal-desk" method="post" className="mt-4 space-y-2" id="deal-stage"><input type="hidden" name="action" value="stage"/><input type="hidden" name="opportunity_id" value={selectedId}/><input type="hidden" name="return_to" value={`/growth-admin/deal-desk?opportunity=${encodeURIComponent(selectedId)}&step=${encodeURIComponent(step)}#deal-stage`}/><select name="stage" defaultValue={opportunity.stage} className={`w-full ${adminInput}`}>{['qualification','discovery','discovery_booked','proposal','negotiation','won','lost'].map(s=><option key={s}>{s}</option>)}</select><button className={`w-full ${adminButtonSecondary}`}>Actualizar etapa</button></form>
          </aside>
        </section>
      </>}
    </>}
  </AdminShell>
}
