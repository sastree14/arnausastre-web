/* eslint-disable @typescript-eslint/no-explicit-any */
import 'server-only'

import { createSign, randomUUID } from 'node:crypto'
import { decryptIntegrationSecret, encryptIntegrationSecret, encryptionConfigured } from '@/lib/integration-secrets'
import { insertGrowthRow, queryGrowthTable, updateGrowthRow, upsertGrowthRow } from '@/lib/supabase-growth'

type Json = Record<string, any>
const TENANT_ID = 'sc-analytics'
const API_BASE = 'https://b2b.revolut.com/api/1.0'

function env(name: string) { return (process.env[name] || '').trim() }
function b64(value: string | Buffer) { return Buffer.from(value).toString('base64url') }
function rows(value: unknown): Json[] {
  if (Array.isArray(value)) return value as Json[]
  const object = value as Json | null
  for (const key of ['accounts','transactions','data','items']) if (Array.isArray(object?.[key])) return object![key] as Json[]
  return []
}

export function revolutReadiness() {
  const required = ['REVOLUT_CLIENT_ID','REVOLUT_PRIVATE_KEY','REVOLUT_REDIRECT_URI','GROWTH_ENCRYPTION_KEY']
  const missing = required.filter((name)=>!env(name))
  if (!encryptionConfigured() && !missing.includes('GROWTH_ENCRYPTION_KEY')) missing.push('GROWTH_ENCRYPTION_KEY')
  return { configured: missing.length === 0, missing }
}

function privateKey() {
  const value = env('REVOLUT_PRIVATE_KEY')
  if (!value) throw new Error('REVOLUT_PRIVATE_KEY is not configured')
  return value.replace(/\\n/g,'\n')
}

function clientAssertion() {
  const ready = revolutReadiness()
  if (!ready.configured) throw new Error(`Revolut is not configured: ${ready.missing.join(', ')}`)
  const now = Math.floor(Date.now()/1000)
  const issuer = env('REVOLUT_ISSUER_DOMAIN') || new URL(env('REVOLUT_REDIRECT_URI')).hostname
  const header = b64(JSON.stringify({alg:'RS256',typ:'JWT'}))
  const payload = b64(JSON.stringify({iss:issuer,sub:env('REVOLUT_CLIENT_ID'),aud:'https://revolut.com',exp:now+300}))
  const unsigned = `${header}.${payload}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsigned); signer.end()
  return `${unsigned}.${signer.sign(privateKey()).toString('base64url')}`
}

export function revolutAuthorizationUrl() {
  const ready = revolutReadiness()
  if (!ready.configured) throw new Error(`Revolut is not configured: ${ready.missing.join(', ')}`)
  const url = new URL('https://business.revolut.com/app-confirm')
  url.searchParams.set('client_id',env('REVOLUT_CLIENT_ID'))
  url.searchParams.set('redirect_uri',env('REVOLUT_REDIRECT_URI'))
  url.searchParams.set('response_type','code')
  url.searchParams.set('scope','READ')
  return url.toString()
}

async function tokenRequest(fields: Record<string,string>) {
  const response = await fetch(`${API_BASE}/auth/token`,{
    method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({...fields,client_assertion_type:'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',client_assertion:clientAssertion()}),cache:'no-store'
  })
  const body = await response.json() as Json
  if(!response.ok || !body.access_token) throw new Error(`Revolut token failed: ${body.error_description || body.error || response.status}`)
  return body
}

export function exchangeRevolutCode(code:string){ return tokenRequest({grant_type:'authorization_code',code}) }
async function refreshRevolutToken(refreshToken:string){ return tokenRequest({grant_type:'refresh_token',refresh_token:refreshToken}) }

async function connection() {
  const result=await queryGrowthTable<Json>('integration_connections',{tenant_id:'eq.sc-analytics',provider:'eq.revolut',account_type:'eq.business',order:'updated_at.desc',limit:'1'},{cacheSeconds:0})
  return result[0] || null
}

export async function getRevolutAccessToken() {
  const row=await connection()
  if(!row) throw new Error('Revolut Business is not connected')
  const expiry=row.token_expires_at?new Date(String(row.token_expires_at)).getTime():0
  if(row.access_token_ciphertext && expiry>Date.now()+120000) return decryptIntegrationSecret(String(row.access_token_ciphertext))
  if(!row.refresh_token_ciphertext) throw new Error('Revolut connection has no refresh token')
  const refreshed=await refreshRevolutToken(decryptIntegrationSecret(String(row.refresh_token_ciphertext)))
  const expiresAt=new Date(Date.now()+Number(refreshed.expires_in||2399)*1000).toISOString()
  await updateGrowthRow('integration_connections','connection_id',String(row.connection_id),{
    access_token_ciphertext:encryptIntegrationSecret(String(refreshed.access_token)),token_expires_at:expiresAt,updated_at:new Date().toISOString(),
    ...(refreshed.refresh_token?{refresh_token_ciphertext:encryptIntegrationSecret(String(refreshed.refresh_token))}:{})
  })
  return String(refreshed.access_token)
}

async function revolutFetch(accessToken:string,path:string) {
  const response=await fetch(`${API_BASE}${path}`,{headers:{Authorization:`Bearer ${accessToken}`},cache:'no-store'})
  const body=await response.json() as Json
  if(!response.ok) throw new Error(`Revolut ${response.status}: ${JSON.stringify(body).slice(0,600)}`)
  return body
}

export async function saveInitialRevolutConnection(token:Json) {
  const accessToken=String(token.access_token)
  const accounts=rows(await revolutFetch(accessToken,'/accounts'))
  const existing=await connection()
  const now=new Date().toISOString()
  const changes={
    provider_subject:env('REVOLUT_CLIENT_ID'),display_name:'Revolut Business',
    access_token_ciphertext:encryptIntegrationSecret(accessToken),
    refresh_token_ciphertext:token.refresh_token?encryptIntegrationSecret(String(token.refresh_token)):existing?.refresh_token_ciphertext || null,
    token_expires_at:new Date(Date.now()+Number(token.expires_in||2399)*1000).toISOString(),
    scopes:['READ'],metadata:{...(existing?.metadata||{}),accounts_count:accounts.length,last_connected_at:now},updated_at:now,
  }
  if(existing) await updateGrowthRow('integration_connections','connection_id',String(existing.connection_id),changes)
  else await insertGrowthRow('integration_connections',{connection_id:randomUUID(),tenant_id:TENANT_ID,provider:'revolut',account_type:'business',connected_at:now,...changes})
  return accounts
}

function primaryLeg(tx:Json, accountId:string) {
  const legs=Array.isArray(tx.legs)?tx.legs:[]
  return legs.find((leg:Json)=>String(leg.account_id||'')===accountId) || null
}

async function proposedOrConfirmed(bankTransactionId:string) {
  const result=await queryGrowthTable<Json>('finance_reconciliations',{tenant_id:'eq.sc-analytics',bank_transaction_id:`eq.${bankTransactionId}`,order:'created_at.desc',limit:'1'},{cacheSeconds:0})
  return result[0] || null
}

async function paymentForBankTransaction(bankTransactionId:string) {
  const result=await queryGrowthTable<Json>('finance_payments',{tenant_id:'eq.sc-analytics',bank_transaction_id:`eq.${bankTransactionId}`,limit:'1'},{cacheSeconds:0})
  return result[0] || null
}

async function proposeMatch(bankTx:Json) {
  const existingReconciliation=await proposedOrConfirmed(String(bankTx.bank_transaction_id))
  if(existingReconciliation) return {entity:existingReconciliation.entity_type,id:existingReconciliation.entity_id,confidence:Number(existingReconciliation.confidence||0),existing:true}
  const existingPayment=await paymentForBankTransaction(String(bankTx.bank_transaction_id))
  if(existingPayment) return null
  const amount=Math.abs(Number(bankTx.amount||0))
  if(!amount) return null

  let entityType=''
  let entity:Json|null=null
  let confidence=0
  let notes=''
  if(bankTx.direction==='inflow') {
    const invoices=await queryGrowthTable<Json>('finance_invoices',{tenant_id:'eq.sc-analytics',currency:`eq.${bankTx.currency}`,order:'issue_date.desc',limit:'200'},{cacheSeconds:0})
    const candidates=invoices.filter((invoice)=>!['paid','void','cancelled'].includes(String(invoice.status||'')) && Math.abs(Number(invoice.total||0)-amount)<=0.01)
    const byReference=candidates.find((invoice)=>invoice.invoice_number && String(bankTx.reference||'').toLowerCase().includes(String(invoice.invoice_number).toLowerCase()))
    entity=byReference || (candidates.length===1?candidates[0]:null)
    if(entity){entityType='invoice';confidence=byReference?0.99:0.88;notes=byReference?'Importe y referencia de factura coinciden':'Único importe exacto compatible'}
  } else {
    const expenses=await queryGrowthTable<Json>('finance_expenses',{tenant_id:'eq.sc-analytics',currency:`eq.${bankTx.currency}`,order:'expense_date.desc',limit:'200'},{cacheSeconds:0})
    const candidates=expenses.filter((expense)=>expense.status!=='paid' && Math.abs(Number(expense.total||0)-amount)<=0.01)
    entity=candidates.length===1?candidates[0]:null
    if(entity){entityType='expense';confidence=0.85;notes='Único importe exacto compatible'}
  }
  if(!entity) return null

  const reconciliationId=`recon_${randomUUID().replaceAll('-','').slice(0,16)}`
  await insertGrowthRow('finance_reconciliations',{reconciliation_id:reconciliationId,tenant_id:TENANT_ID,bank_transaction_id:bankTx.bank_transaction_id,entity_type:entityType,entity_id:entityType==='invoice'?entity.invoice_id:entity.expense_id,matched_amount:amount,currency:bankTx.currency,confidence,status:'proposed',matched_by:'system',notes,created_at:new Date().toISOString()})
  await insertGrowthRow('finance_payments',{payment_id:`payment_${randomUUID().replaceAll('-','').slice(0,12)}`,tenant_id:TENANT_ID,invoice_id:entityType==='invoice'?entity.invoice_id:null,expense_id:entityType==='expense'?entity.expense_id:null,company_id:entityType==='invoice'?entity.company_id||null:null,payment_date:String(bankTx.booked_at||'').slice(0,10)||null,currency:bankTx.currency,amount,amount_eur:bankTx.amount_eur||null,direction:bankTx.direction,method:'Revolut Business',reference:bankTx.reference||'',status:'recorded',review_status:'pending_review',source_system:'revolut',bank_transaction_id:bankTx.bank_transaction_id,reconciliation_status:'proposed',metadata:{reconciliation_id:reconciliationId,confidence},created_at:new Date().toISOString()})
  await updateGrowthRow('finance_bank_transactions','bank_transaction_id',String(bankTx.bank_transaction_id),{reconciliation_status:'proposed',updated_at:new Date().toISOString()})
  return {entity:entityType,id:entityType==='invoice'?entity.invoice_id:entity.expense_id,confidence,existing:false}
}

export async function syncRevolutFinance(days=90) {
  const accessToken=await getRevolutAccessToken()
  const accounts=rows(await revolutFetch(accessToken,'/accounts'))
  const accountByProvider=new Map<string,Json>()
  for(const account of accounts) {
    const existing=await queryGrowthTable<Json>('finance_bank_accounts',{tenant_id:'eq.sc-analytics',provider:'eq.revolut',provider_account_id:`eq.${String(account.id)}`,limit:'1'},{cacheSeconds:0})
    const row=await upsertGrowthRow<Json>('finance_bank_accounts',{
      bank_account_id:existing[0]?.bank_account_id || `bank_${String(account.id).replace(/-/g,'').slice(0,16)}`,tenant_id:TENANT_ID,provider:'revolut',provider_account_id:String(account.id),display_name:String(account.name||`Revolut ${account.currency}`),currency:String(account.currency||'EUR'),status:String(account.state||'active'),metadata:{balance:account.balance,account_type:account.account_type,public:account.public},updated_at:new Date().toISOString(),created_at:existing[0]?.created_at||new Date().toISOString()
    },'tenant_id,provider,provider_account_id')
    if(row) accountByProvider.set(String(account.id),row)
  }

  const from=new Date(Date.now()-Math.max(1,days)*86400000).toISOString()
  const txs=rows(await revolutFetch(accessToken,`/transactions?from=${encodeURIComponent(from)}&count=1000`))
  let stored=0,proposed=0
  for(const tx of txs) {
    for(const account of accounts) {
      const leg=primaryLeg(tx,String(account.id))
      if(!leg) continue
      const signed=Number(leg.amount||0)
      if(!signed) continue
      const providerId=`${tx.id}:${leg.leg_id||account.id}`
      const previous=await queryGrowthTable<Json>('finance_bank_transactions',{tenant_id:'eq.sc-analytics',provider:'eq.revolut',provider_transaction_id:`eq.${providerId}`,limit:'1'},{cacheSeconds:0})
      const existing=previous[0]
      const bankId=existing?.bank_transaction_id || `banktx_${Buffer.from(providerId).toString('base64url').replace(/[^a-zA-Z0-9]/g,'').slice(0,24)}`
      const row=await upsertGrowthRow<Json>('finance_bank_transactions',{
        bank_transaction_id:bankId,tenant_id:TENANT_ID,bank_account_id:accountByProvider.get(String(account.id))?.bank_account_id||existing?.bank_account_id||null,provider:'revolut',provider_transaction_id:providerId,booked_at:tx.created_at||existing?.booked_at||null,completed_at:tx.completed_at||existing?.completed_at||null,direction:signed>=0?'inflow':'outflow',currency:String(leg.currency||account.currency||'EUR'),amount:Math.abs(signed),amount_eur:String(leg.currency||account.currency)==='EUR'?Math.abs(signed):existing?.amount_eur||null,fx_rate:existing?.fx_rate||null,counterparty_name:String(tx.merchant?.name||leg.counterparty?.name||leg.description||existing?.counterparty_name||''),reference:String(tx.reference||leg.description||existing?.reference||''),status:String(tx.state||existing?.status||'completed'),raw_payload:tx,reconciliation_status:existing?.reconciliation_status||'unmatched',updated_at:new Date().toISOString(),created_at:existing?.created_at||new Date().toISOString()
      },'tenant_id,provider,provider_transaction_id')
      if(row){ stored+=1; if(row.reconciliation_status==='unmatched'){const match=await proposeMatch(row); if(match && !match.existing) proposed+=1} }
    }
  }
  const conn=await connection(); if(conn) await updateGrowthRow('integration_connections','connection_id',String(conn.connection_id),{metadata:{...(conn.metadata||{}),accounts_count:accounts.length,last_synced_at:new Date().toISOString(),transactions_seen:txs.length},updated_at:new Date().toISOString()})
  return {accounts:accounts.length,transactions:stored,reconciliations_proposed:proposed}
}
