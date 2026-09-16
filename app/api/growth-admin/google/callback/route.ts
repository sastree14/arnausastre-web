import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { exchangeGoogleCode, gmailProfile, verifyGoogleOAuthState, encryptGoogleToken } from '@/lib/google-oauth-finance'
import { queryGrowthTable, insertGrowthRow, updateGrowthRow } from '@/lib/supabase-growth'

type Row=Record<string,any>

export async function GET(request:Request){
  const url=new URL(request.url)
  const code=url.searchParams.get('code')||''
  const state=url.searchParams.get('state')||''
  const oauthError=url.searchParams.get('error')||''
  if(oauthError) return NextResponse.redirect(new URL(`/growth-admin/finance/integrations?google_error=${encodeURIComponent(oauthError)}`,request.url))
  if(!code||!state) return new NextResponse('Missing code/state',{status:400})
  try{
    const stateData=verifyGoogleOAuthState(state)
    const token=await exchangeGoogleCode(code)
    const profile=await gmailProfile(String(token.access_token))
    const email=String(profile.emailAddress||'')
    if(!email) throw new Error('Gmail profile did not return an email address')
    const existing=await queryGrowthTable<Row>('integration_connections',{tenant_id:'eq.sc-analytics',provider:'eq.gmail',provider_subject:`eq.${email}`,limit:'1'},{cacheSeconds:0})
    const now=new Date().toISOString(),expiresAt=new Date(Date.now()+Number(token.expires_in||3600)*1000).toISOString()
    const previousMetadata=(existing[0]?.metadata&&typeof existing[0].metadata==='object')?existing[0].metadata:{}
    const changes:Record<string,unknown>={account_type:String(stateData.accountType||'corporate'),provider_subject:email,display_name:email,access_token_ciphertext:encryptGoogleToken(String(token.access_token)),token_expires_at:expiresAt,scopes:String(token.scope||'openid email https://www.googleapis.com/auth/gmail.readonly').split(' '),metadata:{...previousMetadata,email,history_id:profile.historyId||'',messages_total:profile.messagesTotal||0,threads_total:profile.threadsTotal||0},updated_at:now}
    if(token.refresh_token) changes.refresh_token_ciphertext=encryptGoogleToken(String(token.refresh_token))
    if(existing[0]) await updateGrowthRow('integration_connections','connection_id',String(existing[0].connection_id),changes)
    else await insertGrowthRow('integration_connections',{connection_id:randomUUID(),tenant_id:'sc-analytics',provider:'gmail',connected_at:now,...changes})
    const returnTo=String(stateData.returnTo||'')
    const destination=returnTo.startsWith('/growth-admin/')?returnTo:'/growth-admin/finance/integrations'
    const next=new URL(destination,request.url);next.searchParams.set('google_connected','1')
    return NextResponse.redirect(next)
  }catch(error){console.error('Google OAuth callback failed',error);const message=error instanceof Error?error.message:String(error);return NextResponse.redirect(new URL(`/growth-admin/finance/integrations?google_error=${encodeURIComponent(message)}`,request.url))}
}
