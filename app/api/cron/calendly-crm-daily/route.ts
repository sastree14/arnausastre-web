import { NextResponse } from 'next/server'
import { syncCalendlyCrm } from '@/lib/calendly-crm'

export const dynamic='force-dynamic'
export const revalidate=0

/**
 * Vercel Cron provides CRON_SECRET in the Authorization bearer header.
 * The current Calendly sync is idempotent by provider + external_id and
 * only imports recent/upcoming meetings, not historical test data.
 *
 * No GA4 cookies, external tracking pixels, or user-visible layout changes.
 */
export async function GET(request:Request){
  const secret=(process.env.CRON_SECRET||'').trim()
  if(!secret||request.headers.get('authorization')!==`Bearer ${secret}`)
    return new NextResponse('Unauthorized',{status:401})
  if(!(process.env.CALENDLY_ACCESS_TOKEN||'').trim())
    return new NextResponse('Calendly access token not configured',{status:503})
  try{
    const data=await syncCalendlyCrm()
    return NextResponse.json({
      ok:true,
      meetings_synced:data.meetings_synced,
      people_linked:data.people_linked,
      opportunities_linked:data.opportunities_linked,
    })
  }catch(error){
    console.error('Calendly daily CRM sync failed',error)
    return new NextResponse('Calendly sync failed',{status:500})
  }
}
