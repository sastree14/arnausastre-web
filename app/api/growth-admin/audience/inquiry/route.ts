import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { insertGrowthRow, queryGrowthTable, updateGrowthRow } from '@/lib/supabase-growth'

type Inquiry={
  inquiry_id:string
  tenant_id:string
  name:string
  company?:string|null
  email:string
  message:string
  language:string
  source_path?:string|null
  status:string
}
type Opportunity={opportunity_id:string;source_signal_id?:string|null}

export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated()))return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData()
  const inquiryId=String(form.get('inquiry_id')||'').trim()
  const action=String(form.get('action')||'').trim()
  const returnTo=String(form.get('return_to')||'/growth-admin/audience')
  if(!inquiryId)return new NextResponse('Missing inquiry_id',{status:400})

  const inquiry=(await queryGrowthTable<Inquiry>('website_inquiries',{tenant_id:'eq.sc-analytics',inquiry_id:`eq.${inquiryId}`,limit:'1'},{cacheSeconds:0}))[0]
  if(!inquiry)return new NextResponse('Inquiry not found',{status:404})
  const now=new Date().toISOString()

  if(action==='convert'){
    const existing=(await queryGrowthTable<Opportunity>('crm_opportunities',{tenant_id:'eq.sc-analytics',source_signal_id:`eq.${inquiryId}`,limit:'1'},{cacheSeconds:0}))[0]
    const opportunityId=existing?.opportunity_id||`opp_${randomUUID().replaceAll('-','').slice(0,16)}`
    if(!existing){
      await insertGrowthRow('crm_opportunities',{
        opportunity_id:opportunityId,
        tenant_id:'sc-analytics',
        company_id:null,
        primary_person_id:null,
        source_content_id:null,
        source_signal_id:inquiryId,
        name:`Inbound web · ${inquiry.company||inquiry.name}`,
        stage:'lead',
        value:0,
        currency:'EUR',
        probability:0,
        source:'website_inquiry',
        next_action_at:null,
        metadata:{
          inquiry_id:inquiryId,
          contact_name:inquiry.name,
          company:inquiry.company||'',
          email:inquiry.email,
          message:inquiry.message,
          language:inquiry.language,
          source_path:inquiry.source_path||'/contact',
        },
        created_at:now,
        updated_at:now,
      })
    }
    await updateGrowthRow('website_inquiries','inquiry_id',inquiryId,{status:'qualified',updated_at:now})
    return NextResponse.redirect(new URL(`/growth-admin/deal-desk?opportunity=${encodeURIComponent(opportunityId)}`,request.url),303)
  }

  if(['new','contacted','qualified','closed'].includes(action)){
    await updateGrowthRow('website_inquiries','inquiry_id',inquiryId,{status:action,updated_at:now})
    return NextResponse.redirect(new URL(returnTo.startsWith('/')?returnTo:'/growth-admin/audience',request.url),303)
  }

  return new NextResponse('Unsupported action',{status:400})
}
