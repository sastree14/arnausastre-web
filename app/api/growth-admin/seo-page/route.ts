import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { queryGrowthTable, updateGrowthRow, upsertGrowthRow } from '@/lib/supabase-growth'
import { validateSeoLanding } from '@/lib/seo-page-quality'
import { validateSerpSubmission } from '@/lib/seo-serp-evidence'

type Row=Record<string,unknown>
const text=(form:FormData,name:string)=>String(form.get(name)||'').trim()
const jsonArray=(value:string)=>{try{const parsed=JSON.parse(value);return Array.isArray(parsed)?parsed:[]}catch{return []}}

export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated()))return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData(),action=text(form,'action'),now=new Date().toISOString()
  if(action==='record_serp_evidence'){
    const keywordId=text(form,'keyword_id')
    if(!/^[a-zA-Z0-9_-]{1,120}$/.test(keywordId))
      return new NextResponse('Invalid keyword identifier',{status:400})
    const target=(await queryGrowthTable<Row>('seo_keyword_targets',{
      tenant_id:'eq.sc-analytics',keyword_id:'eq.'+keywordId,status:'eq.active',limit:'1',
    },{cacheSeconds:0}))[0]
    if(!target)return new NextResponse('Active SEO keyword not found',{status:404})
    // The target keyword comes from the database, not from the request.
    const normalized=validateSerpSubmission({
      keyword:String(target.keyword||''),
      country:text(form,'country'),device:text(form,'device'),
      observedAt:text(form,'observed_at'),sourceUrl:text(form,'source_url'),
      competitorUrls:text(form,'competitor_urls'),notes:text(form,'notes'),
    })
    if(!normalized.ok)
      return new NextResponse('SERP evidence not saved: '+normalized.error,{status:422})
    const metrics=target.metrics&&typeof target.metrics==='object'&&!Array.isArray(target.metrics)
      ?target.metrics as Record<string,unknown>:{}
    // Only a review-only observation. Preserve Search Console inspection metrics.
    await updateGrowthRow('seo_keyword_targets','keyword_id',keywordId,{
      metrics:{...metrics,serp_evidence:normalized.value},updated_at:now,
    })
    return NextResponse.redirect(new URL('/growth-admin/seo?serp_saved=1#keywords',request.url),303)
  }
  if(action==='apply_recommendation'){
    const recommendationId=text(form,'recommendation_id')
    const recommendation=(await queryGrowthTable<Row>('seo_recommendations',{tenant_id:'eq.sc-analytics',recommendation_id:`eq.${recommendationId}`,limit:'1'},{cacheSeconds:0}))[0]
    if(!recommendation)return new NextResponse('Recommendation not found',{status:404})
    const payload=(recommendation.payload||{}) as Record<string,unknown>
    // Weekly intelligence is evidence to review, never a ready-to-publish page.
    if(payload.kind==='seo_opportunity'||payload.publishable===false)
      return new NextResponse('Analysis-only recommendation cannot be published',{status:422})
    const slug=String(payload.slug||'').trim()
    if(!slug)return new NextResponse('Recommendation has no slug',{status:400})
    const problems=validateSeoLanding({
      slug,
      title:String(payload.title||''),meta_description:String(payload.meta_description||''),
      h1:String(payload.h1||''),intro:String(payload.intro||''),primary_keyword:String(payload.primary_keyword||''),
      sections:payload.sections,internal_links:payload.internal_links,
    })
    if(problems.length)return new NextResponse('SEO publication blocked: '+problems.join('; '),{status:422})
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
    const sections=jsonArray(text(form,'sections_json'))
    const internalLinks=jsonArray(text(form,'internal_links_json'))
    if(status==='published'){
      const problems=validateSeoLanding({
        slug,title:text(form,'title'),meta_description:text(form,'meta_description'),
        h1:text(form,'h1'),intro:text(form,'intro'),primary_keyword:text(form,'primary_keyword'),
        sections,internal_links:internalLinks,
      })
      if(problems.length)return new NextResponse('SEO publication blocked: '+problems.join('; '),{status:422})
    }
    await upsertGrowthRow('seo_pages',{seo_page_id:String(existing?.seo_page_id||pageId),tenant_id:'sc-analytics',slug,primary_keyword:text(form,'primary_keyword'),secondary_keywords:text(form,'secondary_keywords').split(',').map(v=>v.trim()).filter(Boolean),search_intent:text(form,'search_intent')||'commercial',title:text(form,'title'),meta_description:text(form,'meta_description'),h1:text(form,'h1'),intro:text(form,'intro'),sections,cta_title:text(form,'cta_title'),cta_body:text(form,'cta_body'),internal_links:internalLinks,status,source:'manual_crm',version:Number(existing?.version||0)+1,created_at:existing?.created_at||now,updated_at:now,published_at:status==='published'?(existing?.published_at||now):null},'tenant_id,slug')
    return NextResponse.redirect(new URL(`/growth-admin/seo?saved=${encodeURIComponent(slug)}#pages`,request.url),303)
  }
  if(action==='archive_page'){
    const pageId=text(form,'seo_page_id');await updateGrowthRow('seo_pages','seo_page_id',pageId,{status:'archived',updated_at:now});return NextResponse.redirect(new URL('/growth-admin/seo?archived=1#pages',request.url),303)
  }
  return new NextResponse('Unsupported SEO action',{status:400})
}
