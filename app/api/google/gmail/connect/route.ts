import { randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'

const STATE_COOKIE = 'sc_gmail_oauth_state'

function requiredEnv(name: string) {
  const value = (process.env[name] || '').trim()
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

export async function GET(request: NextRequest) {
  if (!(await isGrowthAdminAuthenticated())) return NextResponse.redirect(new URL('/growth-admin/login', request.url))
  const state = randomBytes(24).toString('base64url')
  const redirectUri = (process.env.GOOGLE_GMAIL_REDIRECT_URI || '').trim() || `${request.nextUrl.origin}/api/google/gmail/callback`
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', requiredEnv('GOOGLE_CLIENT_ID'))
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/gmail.readonly'].join(' '))
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent select_account')
  url.searchParams.set('include_granted_scopes', 'true')
  url.searchParams.set('state', state)
  const response = NextResponse.redirect(url)
  response.cookies.set(STATE_COOKIE, state, { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', maxAge: 600, path: '/' })
  response.cookies.set('sc_gmail_redirect_uri', redirectUri, { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', maxAge: 600, path: '/' })
  return response
}
