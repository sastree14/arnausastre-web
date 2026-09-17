import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getContentItem, insertGrowthRow, isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow, type GrowthApproval } from '@/lib/growth-admin'
import { getContentPublicationReadiness } from '@/lib/growth-approval'

export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated()))return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData(),approvalId=String(form.get('approval_id')||'').trim(),contentIdInput=String(form.get('content_id')||'').trim(),decision=String(form.get('decision')||''),manualOverride=['1','true','on','yes'].includes(String(form.get('manual_override')||'').toLowerCase()),returnTo=String(form.get('return_to')||'/growth-admin/content?filter=review')
  if(!['approved','rejected'].includes(decision)||(!approvalId&&!contentIdInput))return new NextResponse('Invalid approval request',{status:400})
  let approval=approvalId?(await queryGrowthTable<GrowthApproval>('approvals',{approval_id:`eq.${approvalId}`,limit:'1'},{cacheSeconds:0}))[0]:undefined
  const contentId=contentIdInput||approval?.target_id||''
  const item=await getContentItem(contentId);if(!item)return new NextResponse('Content item not found',{status:404})
  const gate=await getContentPublicationReadiness(contentId)
  const actionType=item.content_type==='article'?'publish_article':'publish_post'
  if(decision==='approved'&&!manualOverride&&gate&&!gate.readiness.ready){const url=new URL(returnTo.startsWith('/')?returnTo:'/growth-admin/content',request.url);url.searchParams.set('blocked',gate.readiness.issues.join(' '));return NextResponse.redirect(url,303)}
  const now=new Date().toISOString(),payload={...(approval?.payload||{}),manual_override:manualOverride,automatic_issues:gate?.readiness.issues||[],automatic_review:item.critique||{},decided_from:'editorial_workspace'}
  if(approval){approval=await updateGrowthRow<GrowthApproval>('approvals','approval_id',approval.approval_id,{status:decision,decided_at:now,payload})||approval}
  else{approval=await insertGrowthRow<GrowthApproval>('approvals',{approval_id:`approval_${randomUUID().replaceAll('-','').slice(0,12)}`,tenant_id:'sc-analytics',action_type:actionType,target_id:contentId,summary:`Manual editorial decision: ${item.title}`,payload,status:decision,created_at:now,decided_at:now})||undefined}
  if(decision==='approved'){const scheduled=item.scheduled_at?new Date(item.scheduled_at):null,isFuture=Boolean(scheduled&&scheduled.getTime()>Date.now());await updateGrowthRow('content_items','content_id',contentId,{status:isFuture?'scheduled':'approved'})}else await updateGrowthRow('content_items','content_id',contentId,{status:'needs_review'})
  const url=new URL(returnTo.startsWith('/')?returnTo:'/growth-admin/content',request.url);url.searchParams.set(decision==='approved'?'approved':'changes_requested',contentId);if(manualOverride)url.searchParams.set('override','1');return NextResponse.redirect(url,303)
}
