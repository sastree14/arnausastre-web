import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { queryGrowthTable } from '@/lib/supabase-growth'

export const dynamic='force-dynamic'

type EventRow={event_key:string;changed_at:string;source_table:string;event_type:string}
/**
 * Admin-only invalidation cursor. Only opaque event metadata leaves the server;
 * the Supabase privileged key, CRM data and private storage never reach clients.
 */
export async function GET(){
  if(!(await isGrowthAdminAuthenticated()))
    return NextResponse.json({error:'Unauthorized'},{status:401,headers:{'Cache-Control':'no-store'}})
  try {
    const rows=await queryGrowthTable<EventRow>('crm_ui_events',{
      select:'event_key,changed_at,source_table,event_type',
      tenant_id:'eq.sc-analytics',
      order:'changed_at.desc',
      limit:'1',
    },{cacheSeconds:0,retries:0,timeoutMs:3500})
    const last=rows[0]
    return NextResponse.json({
      cursor:last?last.event_key+':'+last.changed_at:null,
      table:last?.source_table||'',
      eventType:last?.event_type||'',
      changedAt:last?.changed_at||'',
    },{headers:{'Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff'}})
  } catch(error) {
    console.error('CRM invalidation cursor unavailable',error)
    return NextResponse.json({error:'Temporarily unavailable'},{status:503,headers:{'Cache-Control':'no-store'}})
  }
}
