import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { insertGrowthRow, queryGrowthTable, updateGrowthRow, upsertGrowthRow } from '@/lib/supabase-growth'

type Row=Record<string,any>
const text=(form:FormData,name:string)=>String(form.get(name)||'').trim()
const number=(form:FormData,name:string,fallback=0)=>{const n=Number(String(form.get(name)||fallback).replace(',','.'));return Number.isFinite(n)?n:fallback}

function jsonSection(form:FormData,names:string[]){
  return Object.fromEntries(names.map((name)=>[name,text(form,name)]).filter(([,value])=>value!==''))
}

export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData()
  const action=text(form,'action')||'save'
  const returnTo=text(form,'return_to')||'/growth-admin/deal-desk'
  const now=new Date().toISOString()

  if(action==='create'){
    const companyId=text(form,'company_id')
    if(!companyId) return new NextResponse('Missing company_id',{status:400})
    const companies=await queryGrowthTable<Row>('companies',{tenant_id:'eq.sc-analytics',company_id:`eq.${companyId}`,limit:'1'},{cacheSeconds:0})
    const company=companies[0]
    if(!company) return new NextResponse('Company not found',{status:404})
    const opportunityId=`opp_${randomUUID().replaceAll('-','').slice(0,16)}`
    const primaryPersonId=text(form,'primary_person_id')||null
    const recommendedOffer=String(company.recommended_offer||company.recommended_service||'').trim()
    const opportunity=await insertGrowthRow<Row>('crm_opportunities',{
      opportunity_id:opportunityId,tenant_id:'sc-analytics',company_id:companyId,primary_person_id:primaryPersonId,
      name:text(form,'name')||`${company.name} · ${recommendedOffer||'Oportunidad'}`,
      stage:'qualification',value:0,currency:text(form,'currency')||'EUR',probability:15,source:'deal_desk',next_action_at:null,
      metadata:{recommended_offer:company.recommended_offer||null,recommended_service:company.recommended_service||null,created_from:'deal_desk'},created_at:now,updated_at:now,
    })
    if(!opportunity) return new NextResponse('Could not create opportunity',{status:500})
    await insertGrowthRow('crm_deal_workspaces',{opportunity_id:opportunityId,tenant_id:'sc-analytics',status:'qualification',qualification:{recommended_offer:company.recommended_offer||'',recommended_service:company.recommended_service||''},discovery:{},proposal:{},budget:{},created_at:now,updated_at:now})
    return NextResponse.redirect(new URL(`/growth-admin/deal-desk?opportunity=${encodeURIComponent(opportunityId)}&created=1`,request.url),303)
  }

  const opportunityId=text(form,'opportunity_id')
  if(!opportunityId) return new NextResponse('Missing opportunity_id',{status:400})
  const existingRows=await queryGrowthTable<Row>('crm_deal_workspaces',{tenant_id:'eq.sc-analytics',opportunity_id:`eq.${opportunityId}`,limit:'1'},{cacheSeconds:0})
  const current=existingRows[0]||{}
  let section='qualification'
  let payload:Record<string,unknown>={}
  let opportunityChanges:Record<string,unknown>={updated_at:now}

  if(action==='qualification'){
    section='qualification'
    const scores=['problem_score','impact_score','urgency_score','authority_score','budget_score','data_score'].map((name)=>Math.max(0,Math.min(5,number(form,name,0))))
    const qualificationScore=Math.round((scores.reduce((a,b)=>a+b,0)/(scores.length*5))*100)
    payload={...jsonSection(form,['problem','impact','decision_maker','budget_range','data_readiness','qualification_notes']),problem_score:scores[0],impact_score:scores[1],urgency_score:scores[2],authority_score:scores[3],budget_score:scores[4],data_score:scores[5],qualification_score}
    opportunityChanges={...opportunityChanges,stage:'qualification',probability:qualificationScore>=70?30:qualificationScore>=45?20:10}
  } else if(action==='discovery'){
    section='discovery'
    payload=jsonSection(form,['current_process','desired_state','business_value','systems_data','constraints','budget_timing','decision_process','discovery_notes','next_action'])
    const nextActionAt=text(form,'next_action_at')
    if(nextActionAt) payload.next_action_at=nextActionAt
    opportunityChanges={...opportunityChanges,stage:'discovery',probability:40,next_action_at:nextActionAt||null}
  } else if(action==='proposal'){
    section='proposal'
    payload=jsonSection(form,['objective','scope','deliverables','exclusions','timeline','acceptance_criteria','assumptions','proposal_notes'])
    opportunityChanges={...opportunityChanges,stage:'proposal',probability:60}
  } else if(action==='budget'){
    section='budget'
    const estimatedHours=Math.max(0,number(form,'estimated_hours'))
    const internalRate=Math.max(0,number(form,'internal_rate'))
    const externalCosts=Math.max(0,number(form,'external_costs'))
    const contingencyPct=Math.max(0,number(form,'contingency_pct',10))
    const targetMarginPct=Math.max(0,Math.min(95,number(form,'target_margin_pct',35)))
    const baseCost=estimatedHours*internalRate+externalCosts
    const contingency=baseCost*(contingencyPct/100)
    const costWithContingency=baseCost+contingency
    const suggestedPrice=targetMarginPct>=95?costWithContingency:costWithContingency/(1-targetMarginPct/100)
    const finalPrice=Math.max(0,number(form,'final_price',Math.round(suggestedPrice*100)/100))
    payload={estimated_hours:estimatedHours,internal_rate:internalRate,external_costs:externalCosts,contingency_pct:contingencyPct,target_margin_pct:targetMarginPct,base_cost:Math.round(baseCost*100)/100,contingency:Math.round(contingency*100)/100,suggested_price:Math.round(suggestedPrice*100)/100,final_price:finalPrice,currency:text(form,'currency')||'EUR',pricing_notes:text(form,'pricing_notes')}
    opportunityChanges={...opportunityChanges,value:finalPrice,currency:text(form,'currency')||'EUR'}
  } else if(action==='stage'){
    const stage=text(form,'stage')
    const probabilities:Record<string,number>={qualification:20,discovery:40,discovery_booked:45,proposal:60,negotiation:80,won:100,lost:0}
    await updateGrowthRow('crm_opportunities','opportunity_id',opportunityId,{stage,probability:probabilities[stage]??number(form,'probability',0),updated_at:now})
    return NextResponse.redirect(new URL(`${returnTo}?opportunity=${encodeURIComponent(opportunityId)}&saved=stage`,request.url),303)
  } else {
    return new NextResponse('Unsupported deal desk action',{status:400})
  }

  await upsertGrowthRow('crm_deal_workspaces',{
    opportunity_id:opportunityId,tenant_id:'sc-analytics',qualification:section==='qualification'?payload:(current.qualification||{}),discovery:section==='discovery'?payload:(current.discovery||{}),proposal:section==='proposal'?payload:(current.proposal||{}),budget:section==='budget'?payload:(current.budget||{}),status:section,created_at:current.created_at||now,updated_at:now,
  },'opportunity_id')
  await updateGrowthRow('crm_opportunities','opportunity_id',opportunityId,opportunityChanges)
  return NextResponse.redirect(new URL(`${returnTo}?opportunity=${encodeURIComponent(opportunityId)}&saved=${section}`,request.url),303)
}
