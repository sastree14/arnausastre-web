import { NextResponse } from 'next/server'
import { syncMarketingMetrics } from '@/lib/google-marketing-analytics'

export const maxDuration=60
function authorized(request:Request){const secret=(process.env.CRON_SECRET||'').trim();return Boolean(secret)&&request.headers.get('authorization')===`Bearer ${secret}`}
export async function GET(request:Request){
  if(!authorized(request)) return new NextResponse('Unauthorized',{status:401})
  try{return NextResponse.json({ok:true,result:await syncMarketingMetrics(365),executed_at:new Date().toISOString()})}catch(error){console.error('Metrics daily sync failed',error);return NextResponse.json({ok:false,error:error instanceof Error?error.message:String(error)},{status:500})}
}
