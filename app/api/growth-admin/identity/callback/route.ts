import { NextRequest, NextResponse } from 'next/server'
import { exchangeGoogleCode, googleOAuthConfig, CORPORATE_GOOGLE_EMAIL } from '@/lib/google-oauth-finance'
import { verifyIdentityOAuthState } from '@/lib/security/admin-google-oauth'
import { createIdentitySession, IDENTITY_COOKIE, IDENTITY_STATE_COOKIE } from '@/lib/security/admin-identity'

export const dynamic='force-dynamic'

function returnToLogin(error:string,request:Request){
  const next=new URL('/growth-admin/login',request.url)
  next.searchParams.set('sso_error',error)
  const response=NextResponse.redirect(next,303)
  response.cookies.delete(IDENTITY_STATE_COOKIE)
  response.headers.set('Cache-Control','no-store')
  response.headers.set('Referrer-Policy','no-referrer')
  return response
}

export async function GET(request:NextRequest){
  const url=request.nextUrl
  const code=url.searchParams.get('code')||''
  const state=url.searchParams.get('state')||''
  const cookieNonce=request.cookies.get(IDENTITY_STATE_COOKIE)?.value||''
  if(url.searchParams.get('error'))return returnToLogin('cancelled',request)
  if(!code||!verifyIdentityOAuthState(state,cookieNonce))
    return returnToLogin('invalid_state',request)
  try {
    const redirectUri=googleOAuthConfig(url.origin).redirectUri
    const token=await exchangeGoogleCode(code,redirectUri)
    const accessToken=String(token.access_token||'')
    const response=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{
      headers:{Authorization:`Bearer ${accessToken}`},
      cache:'no-store',
      signal:AbortSignal.timeout(6500),
    })
    if(!response.ok)throw new Error('Identity verification unavailable')
    const profile=await response.json() as {
      sub?:string;email?:string;email_verified?:boolean|string
    }
    // Never trust hd, user_metadata, or a URL query parameter for authorization.
    if(!profile.sub||profile.email_verified!==true&&profile.email_verified!=='true'||
       String(profile.email||'').toLowerCase()!==CORPORATE_GOOGLE_EMAIL)
       return returnToLogin('unauthorized_identity',request)
    const session=await createIdentitySession(profile.sub,CORPORATE_GOOGLE_EMAIL)
    const result=NextResponse.redirect(new URL('/growth-admin',url.origin),303)
    result.cookies.set(IDENTITY_COOKIE,session.token,{
      httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',
      path:'/',maxAge:session.maxAge,
    })
    result.cookies.delete(IDENTITY_STATE_COOKIE)
    result.headers.set('Cache-Control','no-store')
    result.headers.set('Referrer-Policy','no-referrer')
    return result
  }catch(error){
    console.error('Corporate Google sign-in failed',error instanceof Error?error.name:'Error')
    return returnToLogin('unavailable',request)
  }
}
