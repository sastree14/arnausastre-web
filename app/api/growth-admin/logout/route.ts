import { NextResponse } from 'next/server'
import { growthAdminCookieName } from '@/lib/growth-admin'
import { IDENTITY_COOKIE, IDENTITY_STATE_COOKIE, revokeIdentitySession } from '@/lib/security/admin-identity'

export async function POST(request:Request){
  let revoked=true
  try{await revokeIdentitySession()}catch(error){
    revoked=false
    console.error('Admin session revocation unavailable',error instanceof Error?error.name:'Error')
  }
  const response=revoked
    ? NextResponse.redirect(new URL('/growth-admin/login',request.url),303)
    : new NextResponse('Session revocation unavailable. Retry signing out.',{status:503})
  for(const cookie of [growthAdminCookieName(),IDENTITY_COOKIE,IDENTITY_STATE_COOKIE]){
    response.cookies.set(cookie,'',{
      httpOnly:true,
      secure:process.env.NODE_ENV==='production',
      sameSite:'lax',path:'/',maxAge:0,
    })
  }
  response.headers.set('Cache-Control','no-store')
  return response
}
