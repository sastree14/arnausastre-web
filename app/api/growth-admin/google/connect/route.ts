import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { gmailAuthorizationUrl } from '@/lib/google-oauth-finance'

export async function GET(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const url = new URL(request.url)
  const account = url.searchParams.get('account') === 'personal' ? 'personal' : 'corporate'
  const requested = url.searchParams.get('return_to') || ''
  const returnTo = requested.startsWith('/growth-admin/') ? requested : ''
  try {
    return NextResponse.redirect(gmailAuthorizationUrl(account, returnTo, url.origin))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const destination = returnTo || '/growth-admin/finance/integrations'
    const next = new URL(destination, request.url)
    next.searchParams.set('google_error', message)
    return NextResponse.redirect(next)
  }
}
