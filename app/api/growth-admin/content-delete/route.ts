import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getContentItem, insertGrowthRow, isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow, type GrowthTask } from '@/lib/growth-admin'
import { deleteGrowthAsset, deleteGrowthRows } from '@/lib/supabase-growth'
import { dispatchOperatorQueue } from '@/lib/github-actions'

type VisualRow={design_id:string;content_id?:string|null;asset_path?:string|null;is_template?:boolean}

async function queueUnpublish(request:Request,contentId:string,taskType:'OPERATOR_UNPUBLISH_LINKEDIN'|'OPERATOR_UNPUBLISH_ARTICLE',returnTo:string){
  const recent=await queryGrowthTable<GrowthTask>('tasks',{tenant_id:'eq.sc-analytics',type:`eq.${taskType}`,order:'created_at.desc',limit:'5'},{cacheSeconds:0})
  const duplicate=recent.find(task=>['queued','pending','running'].includes(String(task.status||''))&&String(task.inputs?.content_id||'')===contentId&&Date.now()-Date.parse(String(task.created_at||''))<=30000)
  const taskId=duplicate?.task_id||`task_${randomUUID().replaceAll('-','').slice(0,12)}`
  if(!duplicate){const now=new Date().toISOString();await insertGrowthRow('tasks',{task_id:taskId,tenant_id:'sc-analytics',type:taskType,scheduled_for:now,status:'queued',requires_approval:false,inputs:{content_id:contentId},outputs:{},created_at:now})}
  const dispatch=await dispatchOperatorQueue(taskId)
  const url=new URL(returnTo.startsWith('/')?returnTo:'/growth-admin/content',request.url)
  url.searchParams.set('queued',taskId);url.searchParams.set('dispatched',dispatch.dispatched?'1':'0');url.searchParams.set('deduplicated',duplicate?'1':'0')
  if(!dispatch.dispatched)url.searchParams.set('dispatch_reason',dispatch.reason)
  return NextResponse.redirect(url,303)
}

export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated()))return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData(),contentId=String(form.get('content_id')||'').trim(),returnTo=String(form.get('return_to')||'/growth-admin/content?filter=review')
  if(!contentId)return new NextResponse('Missing content_id',{status:400})
  const item=await getContentItem(contentId)
  if(!item)return new NextResponse('Content not found',{status:404})

  if(item.status==='published'){
    const type=String(item.content_type||'').toLowerCase(),channel=String(item.channel||'').toLowerCase()
    if(type==='linkedin_article'||(type==='article'&&channel.includes('linkedin'))){
      const url=new URL(`/growth-admin/preview/${encodeURIComponent(contentId)}`,request.url)
      url.searchParams.set('manual_unpublish','1');url.hash='decision'
      return NextResponse.redirect(url,303)
    }
    const websiteArticle=type==='article'||type==='web_article'||channel==='website'
    return queueUnpublish(request,contentId,websiteArticle?'OPERATOR_UNPUBLISH_ARTICLE':'OPERATOR_UNPUBLISH_LINKEDIN',returnTo)
  }

  const designs=await queryGrowthTable<VisualRow>('visual_designs',{content_id:`eq.${contentId}`,limit:'100'},{cacheSeconds:0})
  for(const design of designs){if(design.is_template){await updateGrowthRow('visual_designs','design_id',design.design_id,{content_id:null})}else{if(design.asset_path)await deleteGrowthAsset(design.asset_path);await deleteGrowthRows('visual_designs',{design_id:`eq.${design.design_id}`})}}
  if(item.visual_path&&!designs.some(row=>row.is_template&&row.asset_path===item.visual_path))await deleteGrowthAsset(item.visual_path)
  await deleteGrowthRows('approvals',{target_id:`eq.${contentId}`});await deleteGrowthRows('content_items',{content_id:`eq.${contentId}`})
  const url=new URL(returnTo.startsWith('/')?returnTo:'/growth-admin/content',request.url);url.searchParams.set('deleted','1');return NextResponse.redirect(url,303)
}
