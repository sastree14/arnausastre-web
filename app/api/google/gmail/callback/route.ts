import { NextRequest, NextResponse } from 'next/server'
import { saveGmailConnection } from '@/lib/growth-integrations'

const STATE_COOKIE = 'sc_gmail_oauth_state'

function requiredEnv(name: string) {
  const value = (process.env[name] || '').trim()
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

function inboxUrl(request: NextRequest, params: Record<string, string>) {
  const url = new URL('/growth-admin/inbox', request.url)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  return url
}

export async function GET(request: NextRequest) {
  const returnedState = request.nextUrl.searchParams.get('state') || ''
  const expectedState = request.cookies.get(STATE_COOKIE)?.value || ''
  const redirectUri = request.cookies.get('sc_gmail_redirect_uri')?.value || (process.env.GOOGLE_GMAIL_REDIRECT_URI || '').trim() || `${request.nextUrl.origin}/api/google/gmail/callback`
  if (!expectedState || returnedState !== expectedState) return NextResponse.redirect(inboxUrl(request, { gmail: 'error', reason: 'invalid_state' }))
  const oauthError = request.nextUrl.searchParams.get('error')
  if (oauthError) return NextResponse.redirect(inboxUrl(request, { gmail: 'error', reason: oauthError }))
  const code = request.nextUrl.searchParams.get('code') || ''
  if (!code) return NextResponse.redirect(inboxUrl(request, { gmail: 'error', reason: 'missing_code' }))
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, cache: 'no-store',
      body: new URLSearchParams({ code, client_id: requiredEnv('GOOGLE_CLIENT_ID'), client_secret: requiredEnv('GOOGLE_CLIENT_SECRET'), redirect_uri: redirectUri, grant_type: 'authorization_code' }),
    })
    if (!tokenResponse.ok) throw new Error(`Google token exchange failed: ${tokenResponse.status} ${await tokenResponse.text()}`)
    const token = await tokenResponse.json() as { access_token?: string; refresh_token?: string; expires_in?: number; scope?: string }
    if (!token.access_token) throw new Error('Google token exchange returned no access token')
    const userResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${token.access_token}` }, cache: 'no-store' })
    if (!userResponse.ok) throw new Error(`Google userinfo failed: ${userResponse.status}`)
    const user = await userResponse.json() as { email?: string; name?: string; sub?: string; picture?: string }
    if (!user.email) throw new Error('Google userinfo returned no email')
    await saveGmailConnection({
      email: user.email, displayName: user.name || user.email, accessToken: token.access_token, refreshToken: token.refresh_token,
      expiresInSeconds: token.expires_in, scopes: String(token.scope || '').split(' ').filter(Boolean), metadata: { google_subject: user.sub || null, picture: user.picture || null },
    })
    const response = NextResponse.redirect(inboxUrl(request, { gmail: 'connected', account: user.email }))
    response.cookies.delete(STATE_COOKIE); response.cookies.delete('sc_gmail_redirect_uri'); return response
  } catch (error) {
    console.error('Gmail OAuth callback failed', error)
    const response = NextResponse.redirect(inboxUrl(request, { gmail: 'error', reason: 'callback_failed' }))
    response.cookies.delete(STATE_COOKIE); response.cookies.delete('sc_gmail_redirect_uri'); return response
  }
}
