import { NextResponse } from 'next/server'
import { queryGrowthTable, updateGrowthRow } from '@/lib/supabase-growth'
import type { NewsletterSubscriber } from '@/lib/newsletter'

export async function POST(request:Request){
  let body:Record<string,unknown>
  try{body=await request.json() as Record<string,unknown>}catch{return NextResponse.json({error:'invalid_body'},{status:400})}
  const token=String(body.token||'').trim()
  if(!token)return NextResponse.json({error:'missing_token'},{status:400})
  const row=(await queryGrowthTable<NewsletterSubscriber>('newsletter_subscribers',{tenant_id:'eq.sc-analytics',unsubscribe_token:`eq.${token}`,limit:'1'},{cacheSeconds:0}))[0]
  if(!row)return NextResponse.json({ok:true})
  await updateGrowthRow('newsletter_subscribers','subscriber_id',row.subscriber_id,{status:'unsubscribed',updated_at:new Date().toISOString()})
  return NextResponse.json({ok:true})
}
