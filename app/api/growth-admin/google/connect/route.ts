import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { gmailAuthorizationUrl, googleOAuthConfig } from '@/lib/google-oauth-finance'

export async function GET(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const url = new URL(request.url)
  const account = url.searchParams.get('account') === 'personal' ? 'personal' : 'corporate'
  const requested = url.searchParams.get('return_to') || ''
  const returnTo = requested.startsWith('/growth-admin/') ? requested : ''
  try {
    const config = googleOAuthConfig(url.origin)
    console.info('Google OAuth diagnostic', {
      account,
      client_id: config.clientId,
      client_secret_configured: Boolean(config.clientSecret),
      redirect_uri: config.redirectUri,
      redirect_mode: config.redirectMode,
      origin: url.origin,
    })
    return NextResponse.redirect(gmailAuthorizationUrl(account, returnTo, url.origin))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const destination = returnTo || '/growth-admin/finance/integrations'
    const next = new URL(destination, request.url)
    next.searchParams.set('google_error', message)
    return NextResponse.redirect(next)
  }
}
