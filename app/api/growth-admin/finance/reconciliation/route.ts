/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { queryGrowthTable, updateGrowthRow } from '@/lib/supabase-growth'
import { postPaymentAccounting } from '@/lib/finance-accounting'
import { recordFinanceAudit } from '@/lib/finance-audit'
import { syncFinanceRegisters } from '@/lib/finance-documents'

type Row=Record<string,any>

async function settleLinkedEntity(payment:Row){
  const now=new Date().toISOString()
  if(payment.invoice_id){
    const [invoices,payments]=await Promise.all([
      queryGrowthTable<Row>('finance_invoices',{tenant_id:'eq.sc-analytics',invoice_id:`eq.${payment.invoice_id}`,limit:'1'},{cacheSeconds:0}),
      queryGrowthTable<Row>('finance_payments',{tenant_id:'eq.sc-analytics',invoice_id:`eq.${payment.invoice_id}`,direction:'eq.inflow',limit:'500'},{cacheSeconds:0}),
    ])
    const invoice=invoices[0]
    const received=payments.filter((p)=>['confirmed','matched','received'].includes(String(p.status||''))).reduce((sum,p)=>sum+Number(p.amount_eur||p.amount||0),0)
    const due=Number(invoice?.amount_eur||invoice?.total||0)
    if(invoice&&due>0&&received+.01>=due) await updateGrowthRow('finance_invoices','invoice_id',String(payment.invoice_id),{status:'paid',paid_at:now,updated_at:now})
  }
  if(payment.expense_id){
    const [expenses,payments]=await Promise.all([
      queryGrowthTable<Row>('finance_expenses',{tenant_id:'eq.sc-analytics',expense_id:`eq.${payment.expense_id}`,limit:'1'},{cacheSeconds:0}),
      queryGrowthTable<Row>('finance_payments',{tenant_id:'eq.sc-analytics',expense_id:`eq.${payment.expense_id}`,direction:'eq.outflow',limit:'500'},{cacheSeconds:0}),
    ])
    const expense=expenses[0]
    const paid=payments.filter((p)=>['confirmed','matched','received'].includes(String(p.status||''))).reduce((sum,p)=>sum+Number(p.amount_eur||p.amount||0),0)
    const due=Number(expense?.amount_eur||expense?.total||0)
    if(expense&&due>0&&paid+.01>=due) await updateGrowthRow('finance_expenses','expense_id',String(payment.expense_id),{status:'paid',paid_at:now})
  }
}

export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData()
  const reconciliationId=String(form.get('reconciliation_id')||'').trim()
  const action=String(form.get('action')||'confirm').trim()
  if(!reconciliationId) return new NextResponse('Missing reconciliation_id',{status:400})
  const rows=await queryGrowthTable<Row>('finance_reconciliations',{tenant_id:'eq.sc-analytics',reconciliation_id:`eq.${reconciliationId}`,limit:'1'},{cacheSeconds:0})
  const reconciliation=rows[0]
  if(!reconciliation) return new NextResponse('Reconciliation not found',{status:404})
  const now=new Date().toISOString()

  if(action==='reject'){
    await updateGrowthRow('finance_reconciliations','reconciliation_id',reconciliationId,{status:'rejected',confirmed_at:now})
    await updateGrowthRow('finance_bank_transactions','bank_transaction_id',String(reconciliation.bank_transaction_id),{reconciliation_status:'unmatched',updated_at:now})
    const payments=await queryGrowthTable<Row>('finance_payments',{tenant_id:'eq.sc-analytics',bank_transaction_id:`eq.${String(reconciliation.bank_transaction_id)}`,limit:'10'},{cacheSeconds:0})
    for(const payment of payments) await updateGrowthRow('finance_payments','payment_id',String(payment.payment_id),{reconciliation_status:'rejected',status:'rejected',review_status:'rejected'})
    await recordFinanceAudit({entityType:'reconciliation',entityId:reconciliationId,action:'rejected',before:reconciliation})
    return NextResponse.redirect(new URL('/growth-admin/finance/cash?reconciliation=rejected',request.url),303)
  }

  if(reconciliation.status==='confirmed') return NextResponse.redirect(new URL('/growth-admin/finance/cash?reconciliation=already_confirmed',request.url),303)
  const payments=await queryGrowthTable<Row>('finance_payments',{tenant_id:'eq.sc-analytics',bank_transaction_id:`eq.${String(reconciliation.bank_transaction_id)}`,limit:'10'},{cacheSeconds:0})
  const payment=payments.find((p)=>String(p.status||'')!=='rejected')
  if(!payment) return NextResponse.redirect(new URL('/growth-admin/finance/cash?reconciliation=payment_missing',request.url),303)

  const updatedPayment=await updateGrowthRow<Row>('finance_payments','payment_id',String(payment.payment_id),{status:'matched',review_status:'reviewed',reviewed_at:now,reconciliation_status:'matched'})
  await updateGrowthRow('finance_reconciliations','reconciliation_id',reconciliationId,{status:'confirmed',confirmed_at:now,matched_by:'arnau'})
  await updateGrowthRow('finance_bank_transactions','bank_transaction_id',String(reconciliation.bank_transaction_id),{reconciliation_status:'matched',updated_at:now})
  await postPaymentAccounting(String(payment.payment_id))
  if(updatedPayment) await settleLinkedEntity(updatedPayment)
  await recordFinanceAudit({entityType:'reconciliation',entityId:reconciliationId,action:'confirmed',before:reconciliation,after:{payment_id:payment.payment_id,entity_type:reconciliation.entity_type,entity_id:reconciliation.entity_id}})
  await syncFinanceRegisters().catch((error)=>console.error('Register sync after reconciliation failed',error))
  return NextResponse.redirect(new URL('/growth-admin/finance/cash?reconciliation=confirmed',request.url),303)
}
