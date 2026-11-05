import { NextResponse } from 'next/server'
import { getIdentitySession,IDENTITY_COOKIE } from '@/lib/security/admin-identity'
import { updateGrowthRow } from '@/lib/supabase-growth'

export async function POST(request:Request){
  const current=await getIdentitySession()
  if(!current)return new NextResponse('A verified corporate session is required',{status:401})
  try {
    // The equality filter updates all sessions tied to this verified Google subject.
    await updateGrowthRow('security_admin_sessions','provider_subject',current.provider_subject,{
      revoked_at:new Date().toISOString()
    })
    const response=NextResponse.redirect(new URL('/growth-admin/login',request.url),303)
    response.cookies.set(IDENTITY_COOKIE,'',{
      httpOnly:true,secure:process.env.NODE_ENV==='production',
      path:'/',sameSite:'lax',maxAge:0
    })
    response.headers.set('Cache-Control','no-store')
    return response
  }catch(error){
    console.error('Bulk session revocation failed',error instanceof Error?error.name:'Error')
    return new NextResponse('Failed to revoke sessions',{status:503})
  }
}
