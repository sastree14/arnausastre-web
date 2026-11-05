import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { insertGrowthRow, queryGrowthTable, updateGrowthRow } from '@/lib/supabase-growth'

export const IDENTITY_COOKIE='__Host-sc_growth_identity'
export const IDENTITY_STATE_COOKIE='__Host-sc_growth_login_state'
export const IDENTITY_SECONDS=60*60*12

type SessionRow={
  session_hash:string
  provider_subject:string
  email:string
  expires_at:string
  revoked_at:string|null
}

export function googleOnlyMode():boolean{
  return process.env.GROWTH_ADMIN_AUTH_MODE==='google'
}

export function hashIdentityToken(token:string):string{
  return createHash('sha256').update(token).digest('hex')
}

export async function getIdentitySession():Promise<SessionRow|null>{
  const store=await cookies()
  const token=store.get(IDENTITY_COOKIE)?.value||''
  if(!/^[a-f0-9]{96}$/.test(token))return null
  const hash=hashIdentityToken(token)
  try{
    const rows=await queryGrowthTable<SessionRow>('security_admin_sessions',{
      session_hash:'eq.'+hash,
      revoked_at:'is.null',
      expires_at:'gt.'+new Date().toISOString(),
      select:'session_hash,provider_subject,email,expires_at,revoked_at',
      limit:'1',
    },{cacheSeconds:0,retries:0,timeoutMs:3200})
    return rows[0]||null
  }catch(error){
    console.error('Identity session validation unavailable',error)
    return null // Fail closed when Supabase is unavailable
  }
}

export async function createIdentitySession(subject:string,email:string){
  if(!subject||!email)throw new Error('Missing verified identity')
  const raw=randomBytes(48).toString('hex')
  const expires=new Date(Date.now()+IDENTITY_SECONDS*1000)
  await insertGrowthRow('security_admin_sessions',{
    session_hash:hashIdentityToken(raw),
    provider:'google',
    provider_subject:subject,
    email:email.toLowerCase(),
    expires_at:expires.toISOString(),
  })
  return {token:raw,maxAge:IDENTITY_SECONDS}
}

export async function revokeIdentitySession():Promise<void>{
  const cookie=(await cookies()).get(IDENTITY_COOKIE)?.value||''
  if(!/^[a-f0-9]{96}$/.test(cookie))return
  await updateGrowthRow('security_admin_sessions','session_hash',hashIdentityToken(cookie),{
    revoked_at:new Date().toISOString(),
  })
}
