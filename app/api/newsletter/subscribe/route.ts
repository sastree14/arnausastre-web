import { NextResponse } from 'next/server'
import { subscribeNewsletter } from '@/lib/newsletter'
import { readLimitedJson, RequestSizeError } from '@/lib/security/request-guards'
import { enforcePublicRateLimit, RateLimitExceeded } from '@/lib/security/public-throttle'

const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request:Request){
  let body:Record<string,unknown>
  try{body=await readLimitedJson(request,8*1024)}catch(error){return NextResponse.json({error:error instanceof RequestSizeError?'too_large':'invalid_body'},{status:error instanceof RequestSizeError?413:400})}
  const email=String(body.email||'').trim().toLowerCase()
  if(!EMAIL.test(email))return NextResponse.json({error:'invalid_email'},{status:400})
  if(body.consent!==true)return NextResponse.json({error:'consent_required'},{status:400})
  const name=String(body.name||''),company=String(body.company||''),sourcePath=String(body.sourcePath||'')
  if(email.length>254||name.length>120||company.length>160||sourcePath.length>350||
     (Array.isArray(body.interests)&&body.interests.length>16))
    return NextResponse.json({error:'input_too_large'},{status:422})
  try{await enforcePublicRateLimit(request,'newsletter',20,3600)}catch(error){
    if(error instanceof RateLimitExceeded)
      return NextResponse.json({error:'rate_limited'},{status:429,headers:{'Retry-After':String(error.retryAfter)}})
    console.error('Newsletter rate limit unavailable',error)
    return NextResponse.json({error:'temporarily_unavailable'},{status:503})
  }
  try{
    const row=await subscribeNewsletter({
      email,
      name,
      company,
      language:['es','ca','en'].includes(String(body.language))?String(body.language) as 'es'|'ca'|'en':'es',
      interests:Array.isArray(body.interests)?body.interests.map(String):[],
      sourcePath,
    })
    return NextResponse.json({ok:true,subscriber_id:row?.subscriber_id||null})
  }catch(error){
    console.error('Newsletter subscription failed',error)
    return NextResponse.json({error:'subscription_failed'},{status:500})
  }
}
