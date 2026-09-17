import 'server-only'
import {queryGrowthTable} from '@/lib/supabase-growth'

type WorkspaceSetting={tenant_id:string;setting_key:string;value?:Record<string,unknown>|null;updated_at?:string}
export type BraveQuota={configured:boolean;available:boolean;monthlyLimit:number|null;monthlyRemaining:number|null;monthlyUsed:number|null;monthlyResetAt:string|null;updatedAt:string|null;statusCode:number|null}
const numberOrNull=(value:unknown)=>Number.isFinite(Number(value))?Number(value):null
export async function getBraveQuota():Promise<BraveQuota>{
  const configured=Boolean((process.env.BRAVE_API_KEY||'').trim())
  const rows=await queryGrowthTable<WorkspaceSetting>('growth_workspace_settings',{tenant_id:'eq.sc-analytics',setting_key:'eq.brave_quota',limit:'1'},{cacheSeconds:0})
  const row=rows[0],value=row?.value||{}
  return{configured,available:Boolean(row),monthlyLimit:numberOrNull(value.monthly_limit),monthlyRemaining:numberOrNull(value.monthly_remaining),monthlyUsed:numberOrNull(value.monthly_used),monthlyResetAt:typeof value.monthly_reset_at==='string'?value.monthly_reset_at:null,updatedAt:typeof value.updated_at==='string'?value.updated_at:row?.updated_at||null,statusCode:numberOrNull(value.status_code)}
}
export function braveQuotaTone(quota:BraveQuota):'green'|'amber'|'rose'{if(!quota.configured||quota.statusCode===429)return'rose';if(quota.monthlyRemaining!==null&&quota.monthlyLimit!==null&&quota.monthlyLimit>0&&quota.monthlyRemaining/quota.monthlyLimit<=0.15)return'amber';return'green'}
