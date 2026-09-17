import { NextResponse } from 'next/server'
import { dispatchOperatorQueue } from '@/lib/github-actions'

const QA_TASK_ID = 'qa_dispatch_smoke_20260917_0738'

export async function POST() {
  const result = await dispatchOperatorQueue(QA_TASK_ID)
  return NextResponse.json({ task_id: QA_TASK_ID, ...result }, { status: result.dispatched ? 200 : 502 })
}
