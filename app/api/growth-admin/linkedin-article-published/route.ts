import { NextResponse } from 'next/server'
import { getContentItem, isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow, type GrowthApproval } from '@/lib/growth-admin'

function safeReturn(value:string){return value.startsWith('/growth-admin/')?value:'/growth-admin/content#publications'}
function linkedinArticleUrl(value:string){
  try{
    const url=new URL(value)
    const host=url.hostname.toLowerCase().replace(/^www\./,'')
    return (host==='linkedin.com'||host.endsWith('.linkedin.com'))&&url.protocol==='https:'?url.toString():''
  }catch{return''}
}

export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated()))return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData()
  const contentId=String(form.get('content_id')||'').trim()
  const externalUrl=linkedinArticleUrl(String(form.get('external_post_url')||'').trim())
  const returnTo=safeReturn(String(form.get('return_to')||'/growth-admin/content#publications'))
  if(!contentId)return new NextResponse('Missing content_id',{status:400})
  if(!externalUrl)return new NextResponse('Introduce una URL HTTPS válida de LinkedIn.',{status:400})
  const item=await getContentItem(contentId)
  if(!item)return new NextResponse('Content not found',{status:404})
  if(item.content_type!=='linkedin_article')return new NextResponse('This completion flow only accepts LinkedIn Articles',{status:409})
  if(item.status==='published'&&item.external_post_url===externalUrl)return NextResponse.redirect(new URL(returnTo,request.url),303)
  const approvals=await queryGrowthTable<GrowthApproval>('approvals',{target_id:`eq.${contentId}`,action_type:'eq.publish_linkedin_article',status:'eq.approved',order:'decided_at.desc',limit:'10'},{cacheSeconds:0})
  if(!approvals.length)return new NextResponse('Approve the LinkedIn Article before registering it as published',{status:409})
  const now=new Date().toISOString()
  await updateGrowthRow('content_items','content_id',contentId,{status:'published',external_post_url:externalUrl,published_at:now,scheduled_at:null})
  for(const approval of approvals)await updateGrowthRow('approvals','approval_id',approval.approval_id,{status:'executed',executed_at:now,payload:{...(approval.payload||{}),manual_publication_url:externalUrl,manual_publication_recorded_at:now}})
  const destination=new URL(returnTo,request.url)
  destination.searchParams.set('linkedin_article_published',contentId)
  destination.hash='publications'
  return NextResponse.redirect(destination,303)
}