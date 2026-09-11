import { randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'

const STATE_COOKIE = 'sc_linkedin_oauth_state'

function requiredEnv(name: string): string {
  const value = (process.env[name] || '').trim()
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

export async function GET(request: NextRequest) {
  if (!(await isGrowthAdminAuthenticated())) {
    return NextResponse.redirect(new URL('/growth-admin/login', request.url))
  }

  const clientId = requiredEnv('LINKEDIN_CLIENT_ID')
  const redirectUri = requiredEnv('LINKEDIN_REDIRECT_URI')
  const state = randomBytes(32).toString('base64url')
  const authorize = new URL('https://www.linkedin.com/oauth/v2/authorization')
  authorize.searchParams.set('response_type', 'code')
  authorize.searchParams.set('client_id', clientId)
  authorize.searchParams.set('redirect_uri', redirectUri)
  authorize.searchParams.set('state', state)
  authorize.searchParams.set('scope', 'openid profile email w_member_social')

  const response = NextResponse.redirect(authorize)
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/linkedin',
    maxAge: 10 * 60,
  })
  return response
}
