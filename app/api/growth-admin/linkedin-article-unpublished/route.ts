import { NextResponse } from 'next/server'
import { getContentItem, isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow, type GrowthApproval } from '@/lib/growth-admin'

function safeReturn(value:string){return value.startsWith('/growth-admin/')?value:'/growth-admin/content#publications'}

export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated()))return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData()
  const contentId=String(form.get('content_id')||'').trim()
  const returnTo=safeReturn(String(form.get('return_to')||'/growth-admin/content#publications'))
  if(!contentId)return new NextResponse('Missing content_id',{status:400})
  const item=await getContentItem(contentId)
  if(!item)return new NextResponse('Content not found',{status:404})
  if(item.content_type!=='linkedin_article')return new NextResponse('This flow only accepts LinkedIn Articles',{status:409})
  if(item.status!=='published')return NextResponse.redirect(new URL(returnTo,request.url),303)
  const now=new Date().toISOString()
  const strategy={...(item.visual_strategy||{}),last_manual_publication_url:item.external_post_url||null,manual_unpublished_at:now}
  await updateGrowthRow('content_items','content_id',contentId,{status:'unpublished',external_post_url:null,published_at:null,scheduled_at:null,visual_strategy:strategy})
  const approvals=await queryGrowthTable<GrowthApproval>('approvals',{target_id:`eq.${contentId}`,action_type:'eq.publish_linkedin_article',order:'decided_at.desc',limit:'10'},{cacheSeconds:0})
  for(const approval of approvals)await updateGrowthRow('approvals','approval_id',approval.approval_id,{payload:{...(approval.payload||{}),manual_unpublished_at:now,last_manual_publication_url:item.external_post_url||null}})
  const destination=new URL(returnTo,request.url)
  destination.searchParams.set('linkedin_article_unpublished',contentId)
  destination.hash='publications'
  return NextResponse.redirect(destination,303)
}
