import { NextResponse } from 'next/server'
import { subscribeNewsletter } from '@/lib/newsletter'

const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request:Request){
  let body:Record<string,unknown>
  try{body=await request.json() as Record<string,unknown>}catch{return NextResponse.json({error:'invalid_body'},{status:400})}
  const email=String(body.email||'').trim().toLowerCase()
  if(!EMAIL.test(email))return NextResponse.json({error:'invalid_email'},{status:400})
  if(body.consent!==true)return NextResponse.json({error:'consent_required'},{status:400})
  try{
    const row=await subscribeNewsletter({
      email,
      name:String(body.name||''),
      company:String(body.company||''),
      language:['es','ca','en'].includes(String(body.language))?String(body.language) as 'es'|'ca'|'en':'es',
      interests:Array.isArray(body.interests)?body.interests.map(String):[],
      sourcePath:String(body.sourcePath||''),
    })
    return NextResponse.json({ok:true,subscriber_id:row?.subscriber_id||null})
  }catch(error){
    console.error('Newsletter subscription failed',error)
    return NextResponse.json({error:'subscription_failed'},{status:500})
  }
}
