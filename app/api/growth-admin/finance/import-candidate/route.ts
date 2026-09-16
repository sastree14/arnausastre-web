/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHash, randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { queryGrowthTable, insertGrowthRow, updateGrowthRow } from '@/lib/supabase-growth'
import { postExpenseAccounting } from '@/lib/finance-accounting'
import { recordFinanceAudit } from '@/lib/finance-audit'
import { syncFinanceRegisters } from '@/lib/finance-documents'

type Row = Record<string, any>
const text=(form:FormData,name:string,fallback='')=>String(form.get(name)||fallback).trim()
const num=(form:FormData,name:string,fallback=0)=>{const value=Number(String(form.get(name)??fallback).replace(',','.'));return Number.isFinite(value)?Math.round(value*100)/100:fallback}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData()
  const candidateId = text(form,'candidate_id')
  const action = text(form,'action','confirm')
  const returnTo = text(form,'return_to','/growth-admin/finance/expenses')
  if (!candidateId) return new NextResponse('Missing candidate_id', { status: 400 })

  const rows = await queryGrowthTable<Row>('finance_import_candidates', { tenant_id: 'eq.sc-analytics', candidate_id: `eq.${candidateId}`, limit: '1' }, { cacheSeconds: 0 })
  const candidate = rows[0]
  if (!candidate) return new NextResponse('Candidate not found', { status: 404 })
  if (action === 'discard') {
    await updateGrowthRow('finance_import_candidates','candidate_id',candidateId,{status:'discarded',reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()})
    await recordFinanceAudit({entityType:'import_candidate',entityId:candidateId,action:'discarded',before:candidate})
    return NextResponse.redirect(new URL(`${returnTo}?candidate_discarded=1`,request.url),303)
  }

  const original = candidate.extracted_data || {}
  const data = {
    ...original,
    vendor:text(form,'vendor',String(original.vendor||'')),
    invoice_number:text(form,'invoice_number',String(original.invoice_number||'')),
    expense_date:text(form,'expense_date',String(original.expense_date||'')),
    category:text(form,'category',String(original.category||'')),
    currency:text(form,'currency',String(original.currency||'EUR')),
    subtotal:form.has('subtotal')?num(form,'subtotal'):Number(original.subtotal||0),
    vat_rate:form.has('vat_rate')?num(form,'vat_rate'):Number(original.vat_rate||0),
    tax:form.has('tax')?num(form,'tax'):Number(original.tax||0),
    withholding_rate:form.has('withholding_rate')?num(form,'withholding_rate'):Number(original.withholding_rate||0),
    withholding_amount:form.has('withholding_amount')?num(form,'withholding_amount'):Number(original.withholding_amount||0),
    total:form.has('total')?num(form,'total'):Number(original.total||0),
  }
  const duplicateKey=createHash('sha256').update([candidate.source_account||'',data.vendor,data.invoice_number,data.expense_date,data.total,data.currency].join('|').toLowerCase()).digest('hex')
  const duplicateRows = await queryGrowthTable<Row>('finance_expenses',{tenant_id:'eq.sc-analytics',duplicate_key:`eq.${duplicateKey}`,limit:'1'},{cacheSeconds:0})
  let expense: Row | null | undefined = duplicateRows[0]
  if (!expense) {
    const expenseId = `expense_${randomUUID().replaceAll('-', '').slice(0,12)}`
    const attachments = Array.isArray(data.attachment_files) ? data.attachment_files : []
    expense = await insertGrowthRow<Row>('finance_expenses', {
      expense_id: expenseId, tenant_id: 'sc-analytics', project_id: null, counterparty_id: null,
      vendor: data.vendor || 'Pendiente identificar', vendor_tax_id: data.vendor_tax_id || null, invoice_number: data.invoice_number || null,
      category: data.category || 'Pendiente de categorizar', expense_date: data.expense_date || null, currency: data.currency || 'EUR',
      subtotal: Number(data.subtotal||0), vat_rate: Number(data.vat_rate||0), tax: Number(data.tax||0), withholding_rate:Number(data.withholding_rate||0), withholding_amount:Number(data.withholding_amount||0), total:Number(data.total||0),
      status:'booked', amount_eur:data.currency==='EUR'?Number(data.total||0):null, fx_rate:null, fx_date:null,
      review_status:'reviewed', reviewed_at:new Date().toISOString(), drive_file_id:attachments[0]?.id||null, receipt_url:attachments[0]?.url||candidate.source_url||null,
      gmail_message_id:candidate.source_message_id||null, gmail_thread_id:candidate.source_thread_id||null, source_account:candidate.source_account||null,
      extraction_confidence:Number(candidate.confidence||0), duplicate_key:duplicateKey, source_system:'gmail',
      metadata:{subject:data.subject||'',from:data.from||'',snippet:data.snippet||'',attachment_files:attachments,reviewed_values:data},created_at:new Date().toISOString(),
    })
    if (expense) {
      await postExpenseAccounting(expenseId)
      await recordFinanceAudit({entityType:'expense',entityId:expenseId,action:'created_from_gmail',after:expense,notes:`Candidate ${candidateId}; user-reviewed extraction`})
    }
  }

  await updateGrowthRow('finance_import_candidates','candidate_id',candidateId,{status:'accepted',extracted_data:data,duplicate_key:duplicateKey,reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()})
  await syncFinanceRegisters().catch((error)=>console.error('Register sync after Gmail candidate failed',error))
  return NextResponse.redirect(new URL(`${returnTo}?candidate_accepted=1`,request.url),303)
}
