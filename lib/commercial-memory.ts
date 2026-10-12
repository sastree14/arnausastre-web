import 'server-only'
import { randomUUID } from 'node:crypto'
import { mutateGrowthRpc, queryGrowthRpc } from '@/lib/supabase-growth'

type Json = Record<string, unknown>
const object = (value: unknown): Json => value && typeof value === 'object' && !Array.isArray(value) ? value as Json : {}
export function normalizeCommercialPayload(input: Json): Json {
  const action = String(input.action || '')
  if (!['company','person','event','patch','preferences'].includes(action)) throw new Error('Unsupported commercial action')
  if (input[action] && typeof input[action] === 'object' && !(action === 'patch' && input.entity)) return input
  const { action: _action, ...fields } = input
  void _action
  if (action === 'patch') {
    const changes = object(input.patch)
    // UI patches carry their target outside the changes; RPC objects preserve it.
    if (input.entity === 'person') return {action:'person',person:{person_id:input.id,...changes,linkedin_status_source:'user_report'}}
    return {action:'patch',patch:{company_id:input.id,...changes}}
  }
  if (action === 'company') {
    const {domain,...company} = fields
    if (domain) company.website = `https://${String(domain).replace(/^https?:\/\//,'').replace(/\/$/,'')}`
    return {action,company}
  }
  if (action === 'event') {
    const {evidence_url,...event} = fields
    return {action,event:{...event,direction:event.direction || 'internal',idempotency_key:event.idempotency_key || `manual:${randomUUID()}`,evidence: evidence_url ? {url:evidence_url} : event.evidence || {}}}
  }
  return {[action]:fields,action}
}
export function getCommercialMemory(companyId?:string,limit=500) {
  return queryGrowthRpc<Json>('commercial_memory_snapshot',{p_limit:String(limit),...(companyId?{p_company_id:companyId}:{})},{cacheSeconds:0,timeoutMs:12000})
}
export function updateCommercialMemory(input:Json) {
  return mutateGrowthRpc<Json>('commercial_memory_mutate',{p_payload:normalizeCommercialPayload(input)})
}
