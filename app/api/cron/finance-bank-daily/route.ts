import { NextResponse } from 'next/server'
import { revolutReadiness, syncRevolutFinance } from '@/lib/revolut-finance'

export const maxDuration=60

function authorized(request:Request){const secret=(process.env.CRON_SECRET||'').trim();return Boolean(secret)&&request.headers.get('authorization')===`Bearer ${secret}`}

export async function GET(request:Request){
  if(!authorized(request)) return new NextResponse('Unauthorized',{status:401})
  const ready=revolutReadiness()
  if(!ready.configured) return NextResponse.json({ok:true,skipped:true,missing:ready.missing})
  try{return NextResponse.json({ok:true,result:await syncRevolutFinance(14),executed_at:new Date().toISOString()})}
  catch(error){console.error('Daily bank sync failed',error);return NextResponse.json({ok:false,error:error instanceof Error?error.message:String(error)},{status:500})}
}
