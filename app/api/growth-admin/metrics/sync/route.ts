import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { syncMarketingMetrics } from '@/lib/google-marketing-analytics'

export const maxDuration=60
export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData().catch(()=>new FormData())
  const days=Math.max(7,Math.min(730,Number(String(form.get('days')||'365'))||365))
  const returnTo=String(form.get('return_to')||'/growth-admin/metrics')
  const result=await syncMarketingMetrics(days)
  const url=new URL(returnTo.startsWith('/growth-admin/')?returnTo:'/growth-admin/metrics',request.url)
  url.searchParams.set('synced','1')
  if(!result.ga4.ok) url.searchParams.set('ga4_error',String((result.ga4 as {error?:string}).error||'GA4 sync failed').slice(0,240))
  if(!result.search_console.ok) url.searchParams.set('gsc_error',String((result.search_console as {error?:string}).error||'Search Console sync failed').slice(0,240))
  return NextResponse.redirect(url,303)
}
