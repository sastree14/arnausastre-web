import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { sendNewsletterDigest } from '@/lib/newsletter'

export const maxDuration=60

export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated()))return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData()
  const returnTo=String(form.get('return_to')||'/growth-admin/audience')
  const force=String(form.get('force')||'')==='1'
  try{
    const result=await sendNewsletterDigest({force})
    const url=new URL(returnTo,request.url)
    url.searchParams.set('newsletter_sent',String(result.sent))
    url.searchParams.set('newsletter_skipped',String(result.skipped))
    url.searchParams.set('newsletter_failed',String(result.failed))
    return NextResponse.redirect(url,303)
  }catch(error){
    console.error('Manual newsletter send failed',error)
    return new NextResponse(error instanceof Error?error.message:String(error),{status:500})
  }
}
