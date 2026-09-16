import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { generateFinanceClosure, resolveFinancePeriod, type PeriodKind } from '@/lib/finance-reporting'

export const maxDuration=60

export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData()
  const rawKind=String(form.get('kind')||'quarter')
  const kind=(['month','quarter','semester','year'].includes(rawKind)?rawKind:'quarter') as PeriodKind
  const anchor=String(form.get('anchor')||new Date().toISOString().slice(0,10))
  try{
    const period=resolveFinancePeriod(kind,anchor)
    await generateFinanceClosure(period)
    return NextResponse.redirect(new URL(`/growth-admin/finance/reports?kind=${kind}&anchor=${encodeURIComponent(anchor)}&closure=generated`,request.url),303)
  }catch(error){
    console.error('Finance closure generation failed',error)
    return NextResponse.redirect(new URL(`/growth-admin/finance/reports?kind=${kind}&anchor=${encodeURIComponent(anchor)}&closure=failed`,request.url),303)
  }
}
