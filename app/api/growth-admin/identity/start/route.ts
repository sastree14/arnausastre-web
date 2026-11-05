import { NextResponse } from 'next/server'
import { googleOAuthConfig } from '@/lib/google-oauth-finance'
import { createIdentityOAuthState } from '@/lib/security/admin-google-oauth'
import { IDENTITY_STATE_COOKIE } from '@/lib/security/admin-identity'

export const dynamic='force-dynamic'

export async function GET(request:Request){
  const origin=new URL(request.url).origin
  // Vercel permanently redirects the apex to www.sc-analytics.io.
  // Do not redirect the login start back to the apex: that creates a loop.
  // Set the __Host- OAuth nonce cookie on the actual browser-facing host (www).
  // Google's previously registered apex redirect URI is preserved by
  // googleOAuthConfig(); Vercel forwards its callback to www, where the
  // host-only nonce cookie can be read and verified by identity/callback.
  const config=googleOAuthConfig(origin)
  if(!config.clientId||!config.clientSecret||!config.redirectUri)
    return new NextResponse('Corporate sign-in temporarily unavailable',{status:503})
  const {nonce,state}=createIdentityOAuthState()
  const url=new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id',config.clientId)
  url.searchParams.set('redirect_uri',config.redirectUri)
  url.searchParams.set('response_type','code')
  url.searchParams.set('scope','openid email profile') // No Gmail, Drive or Calendar scopes
  url.searchParams.set('state',state)
  url.searchParams.set('prompt','select_account')
  url.searchParams.set('hd','sc-analytics.io') // UI hint only; callback verifies exact identity
  const response=NextResponse.redirect(url,302)
  response.cookies.set(IDENTITY_STATE_COOKIE,nonce,{
    httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',
    path:'/',maxAge:10*60,
  })
  response.headers.set('Cache-Control','no-store')
  response.headers.set('Referrer-Policy','no-referrer')
  return response
}
