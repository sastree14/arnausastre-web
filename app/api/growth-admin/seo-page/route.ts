import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { queryGrowthTable, updateGrowthRow, upsertGrowthRow } from '@/lib/supabase-growth'

type Row=Record<string,unknown>
const text=(form:FormData,name:string)=>String(form.get(name)||'').trim()
const jsonArray=(value:string)=>{try{const parsed=JSON.parse(value);return Array.isArray(parsed)?parsed:[]}catch{return []}}

export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated()))return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData(),action=text(form,'action'),now=new Date().toISOString()
  if(action==='apply_recommendation'){
    const recommendationId=text(form,'recommendation_id')
    const recommendation=(await queryGrowthTable<Row>('seo_recommendations',{tenant_id:'eq.sc-analytics',recommendation_id:`eq.${recommendationId}`,limit:'1'},{cacheSeconds:0}))[0]
    if(!recommendation)return new NextResponse('Recommendation not found',{status:404})
    const payload=(recommendation.payload||{}) as Record<string,unknown>,slug=String(payload.slug||'').trim()
    if(!slug)return new NextResponse('Recommendation has no slug',{status:400})
    const existing=(await queryGrowthTable<Row>('seo_pages',{tenant_id:'eq.sc-analytics',slug:`eq.${slug}`,limit:'1'},{cacheSeconds:0}))[0]
    const pageId=String(existing?.seo_page_id||`seo_page_${randomUUID().replaceAll('-','').slice(0,14)}`)
    await upsertGrowthRow('seo_pages',{seo_page_id:pageId,tenant_id:'sc-analytics',slug,primary_keyword:String(payload.primary_keyword||''),secondary_keywords:payload.secondary_keywords||[],search_intent:String(payload.search_intent||'commercial'),title:String(payload.title||''),meta_description:String(payload.meta_description||''),h1:String(payload.h1||''),intro:String(payload.intro||''),sections:payload.sections||[],cta_title:String(payload.cta_title||''),cta_body:String(payload.cta_body||''),internal_links:payload.internal_links||[],status:'published',source:'seo_agent_approved',version:Number(existing?.version||0)+1,created_at:existing?.created_at||now,updated_at:now,published_at:now},'tenant_id,slug')
    await updateGrowthRow('seo_recommendations','recommendation_id',recommendationId,{status:'applied',updated_at:now,applied_at:now})
    return NextResponse.redirect(new URL(`/growth-admin/seo?applied=${encodeURIComponent(slug)}#pages`,request.url),303)
  }
  if(action==='reject_recommendation'){
    const recommendationId=text(form,'recommendation_id');await updateGrowthRow('seo_recommendations','recommendation_id',recommendationId,{status:'rejected',updated_at:now});return NextResponse.redirect(new URL('/growth-admin/seo?rejected=1',request.url),303)
  }
  if(action==='save_page'){
    const pageId=text(form,'seo_page_id')||`seo_page_${randomUUID().replaceAll('-','').slice(0,14)}`,slug=text(form,'slug').replace(/^\/|\/$/g,'')
    if(!slug)return new NextResponse('Missing slug',{status:400})
    const existing=(await queryGrowthTable<Row>('seo_pages',{tenant_id:'eq.sc-analytics',slug:`eq.${slug}`,limit:'1'},{cacheSeconds:0}))[0]
    const status=text(form,'status')||String(existing?.status||'draft')
    await upsertGrowthRow('seo_pages',{seo_page_id:String(existing?.seo_page_id||pageId),tenant_id:'sc-analytics',slug,primary_keyword:text(form,'primary_keyword'),secondary_keywords:text(form,'secondary_keywords').split(',').map(v=>v.trim()).filter(Boolean),search_intent:text(form,'search_intent')||'commercial',title:text(form,'title'),meta_description:text(form,'meta_description'),h1:text(form,'h1'),intro:text(form,'intro'),sections:jsonArray(text(form,'sections_json')),cta_title:text(form,'cta_title'),cta_body:text(form,'cta_body'),internal_links:jsonArray(text(form,'internal_links_json')),status,source:'manual_crm',version:Number(existing?.version||0)+1,created_at:existing?.created_at||now,updated_at:now,published_at:status==='published'?(existing?.published_at||now):null},'tenant_id,slug')
    return NextResponse.redirect(new URL(`/growth-admin/seo?saved=${encodeURIComponent(slug)}#pages`,request.url),303)
  }
  if(action==='archive_page'){
    const pageId=text(form,'seo_page_id');await updateGrowthRow('seo_pages','seo_page_id',pageId,{status:'archived',updated_at:now});return NextResponse.redirect(new URL('/growth-admin/seo?archived=1#pages',request.url),303)
  }
  return new NextResponse('Unsupported SEO action',{status:400})
}
