import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { queryGrowthTable, insertGrowthRow, updateGrowthRow } from '@/lib/supabase-growth'
import { postExpenseAccounting } from '@/lib/finance-accounting'
import { recordFinanceAudit } from '@/lib/finance-audit'
import { syncFinanceRegisters } from '@/lib/finance-documents'

type Row = Record<string, any>

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData()
  const candidateId = String(form.get('candidate_id') || '').trim()
  const action = String(form.get('action') || 'confirm').trim()
  const returnTo = String(form.get('return_to') || '/growth-admin/finance/expenses')
  if (!candidateId) return new NextResponse('Missing candidate_id', { status: 400 })

  const rows = await queryGrowthTable<Row>('finance_import_candidates', { tenant_id: 'eq.sc-analytics', candidate_id: `eq.${candidateId}`, limit: '1' }, { cacheSeconds: 0 })
  const candidate = rows[0]
  if (!candidate) return new NextResponse('Candidate not found', { status: 404 })
  if (action === 'discard') {
    await updateGrowthRow('finance_import_candidates','candidate_id',candidateId,{status:'discarded',reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()})
    await recordFinanceAudit({entityType:'import_candidate',entityId:candidateId,action:'discarded',before:candidate})
    return NextResponse.redirect(new URL(`${returnTo}?candidate_discarded=1`,request.url),303)
  }

  const data = candidate.extracted_data || {}
  const duplicateRows = candidate.duplicate_key ? await queryGrowthTable<Row>('finance_expenses',{tenant_id:'eq.sc-analytics',duplicate_key:`eq.${candidate.duplicate_key}`,limit:'1'},{cacheSeconds:0}) : []
  let expense = duplicateRows[0]
  if (!expense) {
    const expenseId = `expense_${randomUUID().replaceAll('-', '').slice(0,12)}`
    const attachments = Array.isArray(data.attachment_files) ? data.attachment_files : []
    expense = await insertGrowthRow<Row>('finance_expenses', {
      expense_id: expenseId,
      tenant_id: 'sc-analytics',
      project_id: null,
      counterparty_id: null,
      vendor: String(data.vendor || 'Pendiente identificar'),
      vendor_tax_id: data.vendor_tax_id || null,
      invoice_number: data.invoice_number || null,
      category: String(data.category || 'Pendiente de categorizar'),
      expense_date: data.expense_date || null,
      currency: String(data.currency || 'EUR'),
      subtotal: Number(data.subtotal || 0),
      vat_rate: Number(data.vat_rate || 0),
      tax: Number(data.tax || 0),
      withholding_rate: Number(data.withholding_rate || 0),
      withholding_amount: Number(data.withholding_amount || 0),
      total: Number(data.total || 0),
      status: 'booked',
      amount_eur: String(data.currency || 'EUR') === 'EUR' ? Number(data.total || 0) : null,
      fx_rate: null,
      fx_date: null,
      review_status: 'reviewed',
      reviewed_at: new Date().toISOString(),
      drive_file_id: attachments[0]?.id || null,
      receipt_url: attachments[0]?.url || candidate.source_url || null,
      gmail_message_id: candidate.source_message_id || null,
      gmail_thread_id: candidate.source_thread_id || null,
      source_account: candidate.source_account || null,
      extraction_confidence: Number(candidate.confidence || 0),
      duplicate_key: candidate.duplicate_key || null,
      source_system: 'gmail',
      metadata: { subject: data.subject || '', from: data.from || '', snippet: data.snippet || '', attachment_files: attachments },
      created_at: new Date().toISOString(),
    })
    if (expense) {
      await postExpenseAccounting(expenseId)
      await recordFinanceAudit({entityType:'expense',entityId:expenseId,action:'created_from_gmail',after:expense,notes:`Candidate ${candidateId}`})
    }
  }

  await updateGrowthRow('finance_import_candidates','candidate_id',candidateId,{status:'accepted',reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()})
  await syncFinanceRegisters().catch((error)=>console.error('Register sync after Gmail candidate failed',error))
  return NextResponse.redirect(new URL(`${returnTo}?candidate_accepted=1`,request.url),303)
}
