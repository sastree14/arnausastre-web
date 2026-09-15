import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { syncRevolutFinance } from '@/lib/revolut-finance'

export async function POST(request: Request) {
  if(!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData().catch(()=>new FormData())
  const days=Math.max(1,Math.min(365,Number(String(form.get('days')||'90'))||90))
  try{
    const result=await syncRevolutFinance(days)
    return NextResponse.redirect(new URL(`/growth-admin/finance/cash?revolut_synced=${result.transactions}&reconciliations=${result.reconciliations_proposed}`,request.url),303)
  }catch(error){
    console.error('Revolut sync failed',error)
    return NextResponse.redirect(new URL('/growth-admin/finance/integrations?revolut_error=sync_failed',request.url),303)
  }
}
