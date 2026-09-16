import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { gmailAuthorizationUrl } from '@/lib/google-oauth-finance'

export async function GET(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const url = new URL(request.url)
  const account = url.searchParams.get('account') === 'personal' ? 'personal' : 'corporate'
  try {
    return NextResponse.redirect(gmailAuthorizationUrl(account))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.redirect(new URL(`/growth-admin/finance/integrations?google_error=${encodeURIComponent(message)}`, request.url))
  }
}
