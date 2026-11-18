import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow } from '@/lib/growth-admin'

type Relation = {
  id:string;tenant_id:string;role:string;status:string;followup_count:number;
  last_interaction_on:string|null;last_interaction_kind:string|null;
  last_interaction_summary:string;next_review_on:string|null;next_meeting_on:string|null
}
type Payload = { id?:string;action?:string;status?:string;date?:string;kind?:string;summary?:string;next_review_on?:string|null;next_meeting_on?:string|null }
const TENANT='sc-analytics'
const validDay=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00Z'))
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated()))return NextResponse.json({error:'Sesión no autorizada'},{status:401})
  const origin=request.headers.get('origin')
  if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:'Origen no permitido'},{status:403})
  if(!(request.headers.get('content-type')||'').includes('application/json'))return NextResponse.json({error:'Formato no admitido'},{status:415})
  const data=await request.json().catch(()=>null) as Payload|null
  if(!data||!data.id||!/^[a-z0-9-]{2,80}$/.test(data.id))return NextResponse.json({error:'Relación no válida'},{status:400})
  try{
    const rows=await queryGrowthTable<Relation>('day_relationships',{tenant_id:'eq.'+TENANT,id:'eq.'+data.id,limit:'1'},{cacheSeconds:0})
    const relation=rows[0]
    if(!relation)return NextResponse.json({error:'Relación no encontrada'},{status:404})
    const now=new Date().toISOString()
    const changes:Record<string,unknown>={updated_at:now}
    if(data.action==='status'){
      const status=String(data.status||'')
      if(!['active','waiting','dormant','closed'].includes(status))return NextResponse.json({error:'Estado no permitido'},{status:400})
      changes.status=status
      if(status==='dormant'||status==='closed')changes.next_review_on=null
      else if(status==='waiting'&&data.next_review_on&&validDay(data.next_review_on))changes.next_review_on=data.next_review_on
    }else if(data.action==='interaction'){
      const date=data.date||today()
      if(!validDay(date)||date>today())return NextResponse.json({error:'La fecha debe ser válida y no futura'},{status:400})
      const kind=String(data.kind||'manual')
      if(!['email','meeting','slack','platform','manual'].includes(kind))return NextResponse.json({error:'Canal no válido'},{status:400})
      const summary=String(data.summary||'').trim().slice(0,1200)
      if(!summary)return NextResponse.json({error:'Añade un resumen de la interacción'},{status:400})
      changes.last_interaction_on=date;changes.last_interaction_kind=kind;changes.last_interaction_summary=summary
      changes.status='active';changes.followup_count=0;changes.last_verified_at=now
      if(data.next_meeting_on&&validDay(data.next_meeting_on))changes.next_meeting_on=data.next_meeting_on
      if(data.next_review_on&&validDay(data.next_review_on))changes.next_review_on=data.next_review_on
    }else if(data.action==='followup'){
      if(relation.followup_count>=2||['dormant','closed'].includes(relation.status))return NextResponse.json({error:'Este contacto ya no admite otro seguimiento'},{status:409})
      const n=relation.followup_count+1
      changes.followup_count=n
      changes.status=n>=2?'dormant':'waiting'
      changes.last_interaction_on=today()
      changes.last_interaction_kind='email'
      changes.last_interaction_summary='Seguimiento número '+n+' registrado manualmente'
      changes.next_review_on=n>=2?null:(data.next_review_on&&validDay(data.next_review_on)?data.next_review_on:null)
    }else return NextResponse.json({error:'Acción desconocida'},{status:400})
    const result=await updateGrowthRow<Relation>('day_relationships','id',relation.id,changes)
    if(!result)return NextResponse.json({error:'No se ha podido guardar'},{status:503})
    // Closing a relationship also resolves its "review whether to continue"
    // bookkeeping task, but not independent delivery commitments.
    if(data.action==='status'&&['closed','dormant'].includes(String(data.status||''))) {
      try {
        const candidates=await queryGrowthTable<{id:string;status:string;metadata?:Record<string,unknown>}>('day_tasks',{
          tenant_id:'eq.'+TENANT,limit:'250'
        },{cacheSeconds:0})
        const reviews=candidates.filter(t=>
          (t.status==='open'||t.status==='in_progress')&&
          t.metadata?.relation_id===relation.id&&t.metadata?.review_relationship===true)
        await Promise.all(reviews.map(t=>updateGrowthRow('day_tasks','id',t.id,{
          status:'archived',completed_at:now,updated_at:now,
          metadata:{...(t.metadata||{}),review_resolution:'relationship_closed_by_user',review_resolved_on:now}
        })))
      }catch(error){console.error('Could not archive inactive relationship review tasks',error)}
    }
    return NextResponse.json({ok:true,relationship:result})
  }catch(error){
    console.error('Relationship update failed',error)
    return NextResponse.json({error:'No se han podido guardar los cambios'},{status:503})
  }
}
