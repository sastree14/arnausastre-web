import 'server-only'

import { queryGrowthTable } from '@/lib/supabase-growth'

const TENANT_ID='sc-analytics'

type WorkspaceSetting={value?:Record<string,unknown>|null}

export async function getWorkspaceResetAt(settingKey:string):Promise<string|null>{
  const rows=await queryGrowthTable<WorkspaceSetting>('growth_workspace_settings',{
    tenant_id:`eq.${TENANT_ID}`,
    setting_key:`eq.${settingKey}`,
    limit:'1',
  },{cacheSeconds:0})
  const direct=rows[0]?.value?.reset_at
  if(typeof direct==='string'&&direct) return direct
  if(settingKey==='uat_reset') return null
  const globalRows=await queryGrowthTable<WorkspaceSetting>('growth_workspace_settings',{
    tenant_id:`eq.${TENANT_ID}`,
    setting_key:'eq.uat_reset',
    limit:'1',
  },{cacheSeconds:0})
  const global=globalRows[0]?.value?.reset_at
  return typeof global==='string'&&global?global:null
}

export async function createdAfterWorkspaceReset(settingKey:string){
  const resetAt=await getWorkspaceResetAt(settingKey)
  return resetAt?{created_at:`gte.${resetAt}`}:{ }
}
