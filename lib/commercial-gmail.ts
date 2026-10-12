import 'server-only'
import { getGmailAccessToken, getGmailConnections } from '@/lib/google-oauth-finance'
import { queryGrowthTable, upsertGrowthRow } from '@/lib/supabase-growth'
import { updateCommercialMemory } from '@/lib/commercial-memory'
import { commercialMailKind, mailAddresses, mailHeader, matchCommercialCompany, type Json, type MailMessage } from '@/lib/commercial-mail-rules'

async function gmail(token:string,path:string) {
 const r=await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store',signal:AbortSignal.timeout(15000)})
 if(!r.ok)throw new Error(`Gmail request failed (${r.status})`)
 return r.json()
}
export async function syncCommercialGmail(days=14,limit=40) {
 const [connections,companies,people]=await Promise.all([getGmailConnections(),queryGrowthTable<Json>('companies',{tenant_id:'eq.sc-analytics',limit:'1000'},{cacheSeconds:0}),queryGrowthTable<Json>('people',{tenant_id:'eq.sc-analytics',limit:'1000'},{cacheSeconds:0})])
 const accounts:Json[]=[];const deadline=Date.now()+45000
 for(const connection of connections) {
  const account=String(connection.provider_subject||'').toLowerCase(),metadata=(connection.metadata||{}) as Json
  if(!account||metadata.disconnected===true||metadata.disconnected==='true')continue
  const result:Json={account,linked:0,unmatched:0,messages:0,complete:false,errors:[]};const errors:string[]=[]
  try {
   const token=await getGmailAccessToken(connection),threadIds=new Set<string>();let cursor:string|undefined
   do {
    const page=await gmail(token,`/messages?q=${encodeURIComponent(`newer_than:${days}d -in:trash -in:spam`)}&maxResults=${Math.min(100,limit)}${cursor?`&pageToken=${encodeURIComponent(cursor)}`:''}`)
    for(const ref of page.messages||[])threadIds.add(String(ref.threadId))
    cursor=page.nextPageToken
   }while(cursor&&threadIds.size<limit&&Date.now()<deadline)
   result.complete=!cursor&&threadIds.size<=limit
   for(const threadId of [...threadIds].slice(0,limit)) {
    if(Date.now()>deadline){result.complete=false;break}
    try {
     const thread=await gmail(token,`/threads/${encodeURIComponent(threadId)}?format=full`)
     const messages=(thread.messages||[]) as MailMessage[]
     messages.sort((a,b)=>Number(a.internalDate||0)-Number(b.internalDate||0))
     for(const message of messages) {
      result.messages=Number(result.messages)+1
      const kind=commercialMailKind(message,account),outbound=kind==='email_sent'
      const addresses=mailAddresses(outbound?mailHeader(message,'To')+' '+mailHeader(message,'Cc'):mailHeader(message,'From')).filter(a=>a!==account)
      const cid=matchCommercialCompany(addresses,companies,people)
      const received=new Date(Number(message.internalDate)||Date.now()).toISOString()
      const key=`gmail:${account}:${message.id}`,url=`https://mail.google.com/mail/u/?authuser=${encodeURIComponent(account)}#all/${message.threadId}`
      const existing=await queryGrowthTable<Json>('crm_inbox_messages',{message_key:`eq.${key}`,limit:'1'},{cacheSeconds:0})
      await upsertGrowthRow('crm_inbox_messages',{message_key:key,tenant_id:'sc-analytics',provider:'gmail',account_email:account,external_message_id:message.id,thread_id:message.threadId,sender_email:mailAddresses(mailHeader(message,'From'))[0]||'',recipients:addresses,subject:mailHeader(message,'Subject'),snippet:message.snippet||'',received_at:received,unread:message.labelIds?.includes('UNREAD')||false,labels:message.labelIds||[],relevance_score:cid?8:kind==='newsletter'?2:5,category:cid?'lead':'other',summary:(message.snippet||'').slice(0,500),recommended_action:kind==='human_reply'?'Revisar conversación':kind==='email_sent'?'Esperar respuesta':'Sin interés comercial confirmado',status:cid?'linked':'unmatched',metadata:{...existing[0]?.metadata as Json,company_id:cid,commercial_kind:kind,url},updated_at:new Date().toISOString()},'message_key')
      if(!cid||kind==='newsletter'){result.unmatched=Number(result.unmatched)+1;continue}
      // Keep the exact normalized event deterministic across retries.
      const recorded=await queryGrowthTable<Json>('interactions',{tenant_id:'eq.sc-analytics',idempotency_key:`eq.${key}`,limit:'1'},{cacheSeconds:0})
      if(recorded[0]) {
       if(recorded[0].company_id!==cid||recorded[0].external_message_id!==message.id||recorded[0].external_thread_id!==message.threadId)throw new Error('El mensaje ya está asociado a otra identidad; requiere revisión.')
      }else await updateCommercialMemory({action:'event',event:{idempotency_key:key,company_id:cid,channel:'email',direction:outbound?'outbound':'inbound',event_type:kind,summary:`${mailHeader(message,'Subject')}\n${(message.snippet||'').slice(0,500)}`,source:'gmail',occurred_at:received,external_message_id:message.id,external_thread_id:message.threadId,evidence:{url,account_email:account,auto_ack:['auto_ack','out_of_office'].includes(kind)}}})
      result.linked=Number(result.linked)+1
     }
    }catch(e){errors.push(e instanceof Error?e.message:'Error al leer hilo');result.complete=false}
   }
  }catch(e){errors.push(e instanceof Error?e.message:'Error de conexión');result.complete=false}
  result.errors=errors;result.finished_at=new Date().toISOString();accounts.push(result)
  await upsertGrowthRow('growth_workspace_settings',{tenant_id:'sc-analytics',setting_key:`gmail_commercial_sync:${account}`,value:result,updated_at:result.finished_at},'tenant_id,setting_key')
 }
 return {accounts,complete:accounts.length>0&&accounts.every(a=>a.complete&&!(a.errors as string[]).length),readonly:true}
}
