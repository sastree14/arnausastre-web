import { NextRequest, NextResponse } from 'next/server'
import { saveLinkedInConnection } from '@/lib/growth-integrations'

const STATE_COOKIE = 'sc_linkedin_oauth_state'

function requiredEnv(name: string): string {
  const value = (process.env[name] || '').trim()
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

function adminUrl(request: NextRequest, params: Record<string, string>) {
  const url = new URL('/growth-admin', request.url)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  return url
}

export async function GET(request: NextRequest) {
  const returnedState = request.nextUrl.searchParams.get('state') || ''
  const expectedState = request.cookies.get(STATE_COOKIE)?.value || ''
  const oauthError = request.nextUrl.searchParams.get('error')

  if (!expectedState || !returnedState || expectedState !== returnedState) {
    return NextResponse.redirect(adminUrl(request, { linkedin: 'error', reason: 'invalid_state' }))
  }
  if (oauthError) {
    const response = NextResponse.redirect(adminUrl(request, { linkedin: 'error', reason: oauthError }))
    response.cookies.delete(STATE_COOKIE)
    return response
  }

  const code = request.nextUrl.searchParams.get('code') || ''
  if (!code) return NextResponse.redirect(adminUrl(request, { linkedin: 'error', reason: 'missing_code' }))

  try {
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: requiredEnv('LINKEDIN_CLIENT_ID'),
        client_secret: requiredEnv('LINKEDIN_CLIENT_SECRET'),
        redirect_uri: requiredEnv('LINKEDIN_REDIRECT_URI'),
      }),
      cache: 'no-store',
    })
    if (!tokenResponse.ok) throw new Error(`LinkedIn token exchange failed: ${tokenResponse.status} ${await tokenResponse.text()}`)
    const token = await tokenResponse.json() as {
      access_token?: string
      expires_in?: number
      scope?: string
      id_token?: string
    }
    if (!token.access_token) throw new Error('LinkedIn token exchange returned no access_token')

    const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${token.access_token}` },
      cache: 'no-store',
    })
    if (!userResponse.ok) throw new Error(`LinkedIn userinfo failed: ${userResponse.status} ${await userResponse.text()}`)
    const user = await userResponse.json() as {
      sub?: string
      name?: string
      given_name?: string
      family_name?: string
      picture?: string
      email?: string
      email_verified?: boolean
      locale?: string
    }
    if (!user.sub) throw new Error('LinkedIn userinfo returned no subject identifier')

    const scopes = (token.scope || 'openid profile email w_member_social').split(/[ ,]+/).filter(Boolean)
    await saveLinkedInConnection({
      subject: user.sub,
      displayName: user.name || [user.given_name, user.family_name].filter(Boolean).join(' ') || 'LinkedIn member',
      accessToken: token.access_token,
      expiresInSeconds: token.expires_in,
      scopes,
      metadata: {
        person_urn: `urn:li:person:${user.sub}`,
        picture: user.picture || null,
        email: user.email || null,
        email_verified: user.email_verified ?? null,
        locale: user.locale || null,
      },
    })

    const response = NextResponse.redirect(adminUrl(request, { linkedin: 'connected' }))
    response.cookies.delete(STATE_COOKIE)
    return response
  } catch (error) {
    console.error('LinkedIn OAuth callback failed', error)
    const response = NextResponse.redirect(adminUrl(request, { linkedin: 'error', reason: 'callback_failed' }))
    response.cookies.delete(STATE_COOKIE)
    return response
  }
}
