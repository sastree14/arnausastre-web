import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { syncFinanceRegisters } from '@/lib/finance-documents'

export const maxDuration = 60

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData().catch(() => new FormData())
  const year = Math.max(2000, Math.min(2100, Number(String(form.get('year') || new Date().getFullYear())) || new Date().getFullYear()))
  try {
    const result = await syncFinanceRegisters(year)
    const url = new URL('/growth-admin/finance/reports', request.url)
    url.searchParams.set('register_sync', result.skipped ? 'skipped' : 'ok')
    return NextResponse.redirect(url, 303)
  } catch (error) {
    console.error('Finance register sync failed', error)
    return NextResponse.redirect(new URL('/growth-admin/finance/integrations?google_error=register_sync_failed', request.url), 303)
  }
}
