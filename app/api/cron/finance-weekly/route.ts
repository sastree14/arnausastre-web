import { NextResponse } from 'next/server'
import { scanFinanceGmail } from '@/lib/finance-gmail'
import { syncFinanceRegisters } from '@/lib/finance-documents'

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
    return NextResponse.json({ ok: true, gmail, registers, executed_at: new Date().toISOString() })
  } catch (error) {
    console.error('Weekly Finance automation failed', error)
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
