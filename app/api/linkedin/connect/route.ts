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
  const organization=request.nextUrl.searchParams.get('destination')==='organization'
  if(organization && new URL(redirectUri).origin!==request.nextUrl.origin) return new NextResponse('Para autorizar la página de empresa, esta URL debe estar registrada como callback en la aplicación de LinkedIn. Completa esa configuración o utiliza la versión desplegada con el mismo dominio de callback.',{status:409})
  const requestedScopes=organization?'openid profile email w_member_social w_organization_social':'openid profile email w_member_social'
  authorize.searchParams.set('scope',requestedScopes)

  const response = NextResponse.redirect(authorize)
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/linkedin',
    maxAge: 10 * 60,
  })
  response.cookies.set('sc_linkedin_requested_scopes',requestedScopes,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/api/linkedin',maxAge:600})
  return response
}
