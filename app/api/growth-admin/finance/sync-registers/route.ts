import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { syncFinanceRegisters } from '@/lib/finance-documents'

export const maxDuration = 60

function reportReturnUrl(request: Request) {
  const fallback = new URL('/growth-admin/finance/reports', request.url)
  const referer = request.headers.get('referer')
  if (!referer) return fallback
  try {
    const candidate = new URL(referer)
    const origin = new URL(request.url).origin
    if (candidate.origin === origin && candidate.pathname === '/growth-admin/finance/reports') return candidate
  } catch {
    // Ignore invalid referrer and use the safe internal fallback.
  }
  return fallback
}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData().catch(() => new FormData())
  const year = Math.max(2000, Math.min(2100, Number(String(form.get('year') || new Date().getFullYear())) || new Date().getFullYear()))
  try {
    const result = await syncFinanceRegisters(year)
    const url = reportReturnUrl(request)
    url.searchParams.set('register_sync', result.skipped ? 'skipped' : 'ok')
    return NextResponse.redirect(url, 303)
  } catch (error) {
    console.error('Finance register sync failed', error)
    return NextResponse.redirect(new URL('/growth-admin/finance/integrations?google_error=register_sync_failed', request.url), 303)
  }
}
