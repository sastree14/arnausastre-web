import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createGrowthAdminSession, growthAdminCookieName } from '@/lib/growth-admin'
import { insertGrowthRow, queryGrowthTable } from '@/lib/supabase-growth'

const WINDOW_MINUTES=15
const MAX_FAILURES=6

/** Keep raw IP addresses and submitted passwords out of logs and the database. */
function clientFingerprint(request:Request,secret:string):string{
  const ip=(request.headers.get('x-forwarded-for')||request.headers.get('x-real-ip')||'unidentified').split(',')[0].trim()
  return createHmac('sha256',secret).update('admin-login:'+ip).digest('hex')
}

export async function POST(request: Request) {
  const expected=(process.env.GROWTH_ADMIN_TOKEN||'').trim()
  if(!expected)return new NextResponse('Service not configured',{status:503})
  const fingerprint=clientFingerprint(request,expected)
  const since=new Date(Date.now()-WINDOW_MINUTES*60_000).toISOString()
  try {
    const prior=await queryGrowthTable<{attempt_id:number}>('security_login_attempts',{
      ip_hash:'eq.'+fingerprint,
      created_at:'gte.'+since,
      select:'attempt_id',
      limit:String(MAX_FAILURES),
    },{cacheSeconds:0,retries:0,timeoutMs:2500})
    if(prior.length>=MAX_FAILURES)
      return new NextResponse('Too many attempts. Try again later.',{
        status:429,headers:{'Retry-After':String(WINDOW_MINUTES*60)}
      })
  }catch(error){
    console.error('Login throttle check unavailable',error)
    return new NextResponse('Login temporarily unavailable',{status:503})
  }

  let submitted=''
  try {
    const form=await request.formData()
    submitted=String(form.get('token')||'')
  } catch { return new NextResponse('Invalid form',{status:400}) }
  const actualHash=createHash('sha256').update(submitted).digest()
  const expectedHash=createHash('sha256').update(expected).digest()
  const good=submitted.length<=512&&timingSafeEqual(actualHash,expectedHash)
  if(!good){
    try {
      await insertGrowthRow('security_login_attempts',{
        ip_hash:fingerprint,
        created_at:new Date().toISOString(),
      })
    }catch(error){
      console.error('Login throttle record unavailable',error)
      return new NextResponse('Login temporarily unavailable',{status:503})
    }
    return new NextResponse('Unauthorized',{status:401})
  }

  const session=createGrowthAdminSession()
  const response=NextResponse.redirect(new URL('/growth-admin',request.url),303)
  response.cookies.set(growthAdminCookieName(),session.value,{
    httpOnly:true,
    secure:process.env.NODE_ENV==='production',
    sameSite:'lax',
    path:'/',
    maxAge:session.maxAge,
  })
  response.headers.set('Cache-Control','no-store')
  return response
}
