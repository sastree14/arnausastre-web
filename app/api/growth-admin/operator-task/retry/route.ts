import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow, type GrowthTask } from '@/lib/growth-admin'
import { dispatchOperatorQueue } from '@/lib/github-actions'

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const body = await request.json().catch(() => ({})) as { task_id?: string }
  const taskId = String(body.task_id || '').trim()
  if (!taskId) return NextResponse.json({ error: 'Missing task_id' }, { status: 400 })

  const rows = await queryGrowthTable<GrowthTask>('tasks', {
    tenant_id: 'eq.sc-analytics',
    task_id: `eq.${taskId}`,
    limit: '1',
  }, { cacheSeconds: 0 })
  const task = rows[0]
  if (!task || !task.type.startsWith('OPERATOR_')) return NextResponse.json({ error: 'Operator task not found' }, { status: 404 })

  await updateGrowthRow('tasks', 'task_id', taskId, {
    status: 'queued',
    scheduled_for: new Date().toISOString(),
    outputs: {},
  })
  const dispatch = await dispatchOperatorQueue()

  return NextResponse.json({ task_id: taskId, ...dispatch })
}
