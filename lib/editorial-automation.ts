import 'server-only'
import { mutateGrowthRpc, queryGrowthRpc, queryGrowthTable } from '@/lib/supabase-growth'

export interface EditorialSchedulerStatus {
  cron_enabled: boolean
  key_configured: boolean
  organization_configured: boolean
  organization_permission: boolean
  personal_permission?: boolean
  token_expired: boolean
  token_expires_at: string | null
  assets_expected: number
  assets_stored: number
  scheduled: number
  reserved: number
  last_run: { at: string; status: string; detail: Record<string, unknown> } | null
}
export interface EditorialJob {
  content_id: string
  state: string
  last_error: string | null
  attempts: number
}
export async function getEditorialAutomationStatus() {
  const status=await queryGrowthRpc<EditorialSchedulerStatus>('editorial_scheduler_status', {}, { cacheSeconds: 0 })
  // Authenticated CMI server initializes the worker from its existing configuration.
  // Secrets remain server-side and are never returned in this status response.
  if(!status.key_configured && process.env.GROWTH_ENCRYPTION_KEY?.trim()) {
    await mutateGrowthRpc('editorial_configure_worker',{p_encryption_key:process.env.GROWTH_ENCRYPTION_KEY.trim(),p_organization_id:process.env.LINKEDIN_ORGANIZATION_ID?.trim()||''})
    return getEditorialAutomationStatus()
  }
  const connections=await queryGrowthTable<{scopes?:string[];metadata?:{person_urn?:string;disconnected?:boolean}}>('integration_connections',{tenant_id:'eq.sc-analytics',provider:'eq.linkedin',order:'connected_at.desc',limit:'1',select:'scopes,metadata'},{cacheSeconds:0})
  return {...status,personal_permission:Boolean(connections[0]?.scopes?.includes('w_member_social')&&connections[0]?.metadata?.person_urn&&!connections[0]?.metadata?.disconnected)}
}
export async function getEditorialJobs() {
  return queryGrowthTable<EditorialJob>('editorial_publication_jobs', { limit: '200' }, { cacheSeconds: 0 })
}

export async function getExternalEditorialEvents() {
  const rows=await queryGrowthTable<{value?:{events?:{event_id:string;title:string;scheduled_at:string}[];website_already_scheduled?:boolean}}>('growth_workspace_settings',{tenant_id:'eq.sc-analytics',setting_key:'eq.editorial_external_publications',limit:'1'},{cacheSeconds:0})
  return rows[0]?.value?.events||[]
}
