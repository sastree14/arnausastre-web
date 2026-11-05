import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export const dynamic='force-dynamic'

/** The anonymous Supabase WebSocket is no longer part of the CMI. */
export async function GET(){
  if(!(await isGrowthAdminAuthenticated()))
    return NextResponse.json({error:'Unauthorized'},{status:401,headers:{'Cache-Control':'no-store'}})
  return NextResponse.json({error:'Realtime config retired; use authenticated realtime-state'},
    {status:410,headers:{'Cache-Control':'no-store'}})
}
