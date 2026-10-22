import { NextResponse } from 'next/server'
import { inspectCommercialServiceIndexStatus } from '@/lib/google-marketing-analytics'

export const maxDuration=60
export const dynamic='force-dynamic'
export const revalidate=0

/**
 * Daily index-status inspection. Google URL Inspection is read-only.
 * Uses the existing corporate OAuth Search Console connection.
 */
export async function GET(request:Request){
  const secret=(process.env.CRON_SECRET||'').trim()
  if(!secret||request.headers.get('authorization')!==`Bearer ${secret}`)
    return new NextResponse('Unauthorized',{status:401})
  try{
    const result=await inspectCommercialServiceIndexStatus()
    return NextResponse.json({ok:true,...result})
  }catch(error){
    console.error('Daily SEO index status check failed',error)
    return NextResponse.json({ok:false,error:'Google Search Console inspection unavailable'},{status:503})
  }
}
