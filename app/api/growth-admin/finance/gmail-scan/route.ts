import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { scanFinanceGmail } from '@/lib/finance-gmail'

export const maxDuration = 60

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData().catch(() => new FormData())
  const days = Math.max(1, Math.min(30, Number(String(form.get('days') || '8')) || 8))
  try {
    const result = await scanFinanceGmail(days)
    const url = new URL('/growth-admin/finance/expenses', request.url)
    url.searchParams.set('gmail_candidates', String(result.candidates))
    url.searchParams.set('gmail_messages', String(result.messages))
    if (result.errors.length) url.searchParams.set('gmail_errors', String(result.errors.length))
    return NextResponse.redirect(url, 303)
  } catch (error) {
    console.error('Manual Gmail Finance scan failed', error)
    return NextResponse.redirect(new URL('/growth-admin/finance/integrations?google_error=gmail_scan_failed', request.url), 303)
  }
}
