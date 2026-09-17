import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow, type GrowthTask } from '@/lib/growth-admin'
import { dispatchOperatorQueue } from '@/lib/github-actions'

export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized',{status:401})
  const body=await request.json().catch(()=>({})) as {task_id?:string}, taskId=String(body.task_id||'').trim()
  if(!taskId) return NextResponse.json({error:'Missing task_id'},{status:400})
  const task=(await queryGrowthTable<GrowthTask>('tasks',{tenant_id:'eq.sc-analytics',task_id:`eq.${taskId}`,limit:'1'},{cacheSeconds:0}))[0]
  if(!task||!task.type.startsWith('OPERATOR_')) return NextResponse.json({error:'Operator task not found'},{status:404})
  if(task.status==='running') return NextResponse.json({task_id:taskId,dispatched:false,reason:'already_running'})
  await updateGrowthRow('tasks','task_id',taskId,{status:'queued',scheduled_for:new Date().toISOString(),outputs:{}})
  return NextResponse.json({task_id:taskId,...await dispatchOperatorQueue(taskId)})
}
