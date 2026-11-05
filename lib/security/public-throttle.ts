import 'server-only'
import { createHmac } from 'node:crypto'
import { insertGrowthRow, queryGrowthTable } from '@/lib/supabase-growth'

export class RateLimitExceeded extends Error {
  retryAfter:number
  constructor(retryAfter:number){super('Too many requests');this.retryAfter=retryAfter}
}

export async function enforcePublicRateLimit(
  request:Request,route:'contact'|'newsletter',maximum:number,windowSeconds:number
):Promise<void>{
  const secret=(process.env.GROWTH_ENCRYPTION_KEY||process.env.GROWTH_ADMIN_TOKEN||'').trim()
  if(!secret)throw new Error('Rate-limit secret unavailable')
  const address=(request.headers.get('x-forwarded-for')||request.headers.get('x-real-ip')||'unidentified').split(',')[0].trim()
  const ipHash=createHmac('sha256',secret).update('public-form:'+address).digest('hex')
  const since=new Date(Date.now()-windowSeconds*1000).toISOString()
  const previous=await queryGrowthTable<{attempt_id:number}>('security_public_requests',{
    route_key:'eq.'+route,
    ip_hash:'eq.'+ipHash,
    created_at:'gte.'+since,
    select:'attempt_id',
    limit:String(maximum),
  },{cacheSeconds:0,retries:0,timeoutMs:2500})
  if(previous.length>=maximum)throw new RateLimitExceeded(windowSeconds)
  await insertGrowthRow('security_public_requests',{
    route_key:route,ip_hash:ipHash,created_at:new Date().toISOString()
  })
}
