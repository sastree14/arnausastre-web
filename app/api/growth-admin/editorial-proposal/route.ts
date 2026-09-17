import {NextResponse} from 'next/server'
import {isGrowthAdminAuthenticated,type GrowthTask} from '@/lib/growth-admin'
import {queryGrowthTable,updateGrowthRow} from '@/lib/supabase-growth'

type Proposal=Record<string,unknown>

export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated()))return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData(),taskId=String(form.get('task_id')||'').trim(),proposalId=String(form.get('proposal_id')||'').trim(),index=Number(form.get('proposal_index')),returnTo=String(form.get('return_to')||'/growth-admin/content#proposals')
  if(!taskId)return new NextResponse('Missing task_id',{status:400})
  const task=(await queryGrowthTable<GrowthTask>('tasks',{tenant_id:'eq.sc-analytics',task_id:`eq.${taskId}`,type:'eq.OPERATOR_EDITORIAL_PROPOSALS',limit:'1'},{cacheSeconds:0}))[0]
  if(!task)return new NextResponse('Proposal task not found',{status:404})
  const outputs={...(task.outputs||{})},proposals=Array.isArray(outputs.proposals)?outputs.proposals as Proposal[]:[]
  const next=proposals.filter((proposal,rowIndex)=>proposalId?String(proposal.proposal_id||'')!==proposalId:rowIndex!==index)
  if(next.length===proposals.length)return new NextResponse('Proposal not found',{status:404})
  await updateGrowthRow('tasks','task_id',taskId,{outputs:{...outputs,proposals:next}})
  const url=new URL(returnTo.startsWith('/')?returnTo:'/growth-admin/content#proposals',request.url);url.searchParams.set('proposal_discarded','1');return NextResponse.redirect(url,303)
}
