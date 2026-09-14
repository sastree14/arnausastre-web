import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { insertGrowthRow, isGrowthAdminAuthenticated } from '@/lib/growth-admin'

function money(value: FormDataEntryValue | null) {
  const parsed=Number(String(value||'0').replace(',','.'))
  return Number.isFinite(parsed)?Math.round(parsed*100)/100:0
}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData()
  const type=String(form.get('type')||'')
  const now=new Date().toISOString()
  if(type==='invoice'){
    const subtotal=money(form.get('subtotal'));const tax=money(form.get('tax'));const explicitTotal=money(form.get('total'))
    await insertGrowthRow('finance_invoices',{invoice_id:`invoice_${randomUUID().replaceAll('-','').slice(0,12)}`,tenant_id:'sc-analytics',company_id:String(form.get('company_id')||'')||null,project_id:String(form.get('project_id')||'')||null,invoice_number:String(form.get('invoice_number')||''),issue_date:String(form.get('issue_date')||'')||null,due_date:String(form.get('due_date')||'')||null,currency:String(form.get('currency')||'EUR'),subtotal,tax,total:explicitTotal||subtotal+tax,status:String(form.get('status')||'issued'),metadata:{},created_at:now,updated_at:now})
  } else if(type==='expense'){
    const subtotal=money(form.get('subtotal'));const tax=money(form.get('tax'));const explicitTotal=money(form.get('total'))
    await insertGrowthRow('finance_expenses',{expense_id:`expense_${randomUUID().replaceAll('-','').slice(0,12)}`,tenant_id:'sc-analytics',project_id:String(form.get('project_id')||'')||null,vendor:String(form.get('vendor')||''),category:String(form.get('category')||''),expense_date:String(form.get('expense_date')||'')||null,currency:String(form.get('currency')||'EUR'),subtotal,tax,total:explicitTotal||subtotal+tax,status:'recorded',metadata:{},created_at:now})
  } else if(type==='payment'){
    await insertGrowthRow('finance_payments',{payment_id:`payment_${randomUUID().replaceAll('-','').slice(0,12)}`,tenant_id:'sc-analytics',invoice_id:String(form.get('invoice_id')||'')||null,company_id:String(form.get('company_id')||'')||null,payment_date:String(form.get('payment_date')||'')||null,currency:String(form.get('currency')||'EUR'),amount:money(form.get('amount')),method:String(form.get('method')||''),reference:String(form.get('reference')||''),status:'received',metadata:{},created_at:now})
  } else return new NextResponse('Unsupported finance action',{status:400})
  return NextResponse.redirect(new URL('/growth-admin/finance',request.url),303)
}
