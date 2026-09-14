import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { insertGrowthRow, isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData()
  const name=String(form.get('name')||'').trim()
  if(!name) return new NextResponse('Missing project name',{status:400})
  const now=new Date().toISOString()
  await insertGrowthRow('operations_projects',{
    project_id:`project_${randomUUID().replaceAll('-','').slice(0,12)}`,
    tenant_id:'sc-analytics',company_id:String(form.get('company_id')||'')||null,opportunity_id:String(form.get('opportunity_id')||'')||null,
    name,status:String(form.get('status')||'planned'),owner:String(form.get('owner')||''),start_date:String(form.get('start_date')||'')||null,end_date:String(form.get('end_date')||'')||null,
    budget:Number(String(form.get('budget')||'0').replace(',','.'))||0,currency:String(form.get('currency')||'EUR'),metadata:{},created_at:now,updated_at:now,
  })
  return NextResponse.redirect(new URL('/growth-admin/operations',request.url),303)
}
