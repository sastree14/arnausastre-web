import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { scanFinanceGmail } from '@/lib/finance-gmail'
import { syncFinanceRegisters } from '@/lib/finance-documents'
import { insertGrowthRow } from '@/lib/growth-admin'

export const maxDuration = 60

function authorized(request: Request) {
  const secret = (process.env.CRON_SECRET || '').trim()
  if (!secret) return false
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: Request) {
  if (!authorized(request)) return new NextResponse('Unauthorized', { status: 401 })
  try {
    const gmail = await scanFinanceGmail(8)
    const registers = await syncFinanceRegisters().catch((error) => ({ skipped: true, reason: error instanceof Error ? error.message : String(error) }))
    const now=new Date().toISOString()
    await insertGrowthRow('finance_audit_events', {
      audit_event_id:`audit_${randomUUID().replaceAll('-','').slice(0,16)}`,tenant_id:'sc-analytics',entity_type:'integration',entity_id:'gmail_finance',action:'gmail_finance_scan',actor:'cron',after_data:{gmail,registers},notes:`Daily Finance sync: ${gmail.messages} messages, ${gmail.candidates} candidates`,occurred_at:now,
    }).catch(()=>null)
    return NextResponse.json({ ok: true, gmail, registers, executed_at: now })
  } catch (error) {
    console.error('Daily Finance automation failed', error)
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
