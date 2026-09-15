import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { insertGrowthRow, isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow } from '@/lib/growth-admin'
import { calculateInvoiceAmounts, suggestTaxTreatment } from '@/lib/finance-tax'
import { postExpenseAccounting, postPaymentAccounting } from '@/lib/finance-accounting'
import { recordFinanceAudit } from '@/lib/finance-audit'
import { syncFinanceRegisters } from '@/lib/finance-documents'

type Row = Record<string, any>

function money(value: FormDataEntryValue | null) {
  const raw = String(value || '0').trim().replace(/\s/g, '').replace(',', '.')
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0
}

function text(form: FormData, name: string) {
  return String(form.get(name) || '').trim()
}

function hasValue(form: FormData, name: string) {
  return String(form.get(name) || '').trim() !== ''
}

async function maybeMarkSettled(payment: Row) {
  const now = new Date().toISOString()
  if (payment.direction === 'inflow' && payment.invoice_id) {
    const [invoices, payments] = await Promise.all([
      queryGrowthTable<Row>('finance_invoices', { tenant_id: 'eq.sc-analytics', invoice_id: `eq.${payment.invoice_id}`, limit: '1' }, { cacheSeconds: 0 }),
      queryGrowthTable<Row>('finance_payments', { tenant_id: 'eq.sc-analytics', invoice_id: `eq.${payment.invoice_id}`, direction: 'eq.inflow', order: 'payment_date.asc', limit: '500' }, { cacheSeconds: 0 }),
    ])
    const invoice = invoices[0]
    const confirmed = payments.filter((row) => ['confirmed','matched','received'].includes(String(row.status || '')) && ['reviewed','confirmed'].includes(String(row.review_status || '')))
    const paid = confirmed.reduce((sum,row) => sum + Number(row.amount_eur || row.amount || 0), 0)
    const due = Number(invoice?.amount_eur || invoice?.total || 0)
    if (invoice && due > 0 && paid + 0.01 >= due) await updateGrowthRow('finance_invoices','invoice_id',String(invoice.invoice_id),{status:'paid',paid_at:now,updated_at:now})
  }
  if (payment.direction === 'outflow' && payment.expense_id) {
    const [expenses, payments] = await Promise.all([
      queryGrowthTable<Row>('finance_expenses', { tenant_id: 'eq.sc-analytics', expense_id: `eq.${payment.expense_id}`, limit: '1' }, { cacheSeconds: 0 }),
      queryGrowthTable<Row>('finance_payments', { tenant_id: 'eq.sc-analytics', expense_id: `eq.${payment.expense_id}`, direction: 'eq.outflow', order: 'payment_date.asc', limit: '500' }, { cacheSeconds: 0 }),
    ])
    const expense = expenses[0]
    const confirmed = payments.filter((row) => ['confirmed','matched','received'].includes(String(row.status || '')) && ['reviewed','confirmed'].includes(String(row.review_status || '')))
    const paid = confirmed.reduce((sum,row) => sum + Number(row.amount_eur || row.amount || 0), 0)
    const due = Number(expense?.amount_eur || expense?.total || 0)
    if (expense && due > 0 && paid + 0.01 >= due) await updateGrowthRow('finance_expenses','expense_id',String(expense.expense_id),{status:'paid',paid_at:now})
  }
}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData()
  const type = text(form, 'type')
  const returnTo = text(form, 'return_to') || '/growth-admin/finance'
  const now = new Date().toISOString()

  if (type === 'settings') {
    const rows = await queryGrowthTable<Row>('finance_settings', { tenant_id: 'eq.sc-analytics', limit: '1' }, { cacheSeconds: 0 })
    const before = rows[0] || {}
    const changes = {
      legal_name: text(form,'legal_name') || null,
      tax_id: text(form,'tax_id') || null,
      billing_address: text(form,'billing_address') || null,
      billing_email: text(form,'billing_email') || null,
      phone: text(form,'phone') || null,
      website: text(form,'website') || null,
      default_currency: text(form,'default_currency') || 'EUR',
      invoice_series: text(form,'invoice_series') || 'SC',
      default_payment_terms_days: Math.max(0, Number(text(form,'default_payment_terms_days') || '30')),
      bank_details: text(form,'bank_details') || null,
      updated_at: now,
    }
    await updateGrowthRow('finance_settings','tenant_id','sc-analytics',changes)
    await recordFinanceAudit({entityType:'settings',entityId:'sc-analytics',action:'updated',before,after:changes})
  } else if (type === 'counterparty') {
    const row = await insertGrowthRow<Row>('finance_counterparties', {
      counterparty_id: `counterparty_${randomUUID().replaceAll('-', '').slice(0, 12)}`,
      tenant_id: 'sc-analytics',
      kind: text(form, 'kind') || 'client',
      company_id: text(form, 'company_id') || null,
      legal_name: text(form, 'legal_name'),
      trade_name: text(form, 'trade_name') || null,
      tax_id: text(form, 'tax_id') || null,
      vat_id: text(form, 'vat_id') || null,
      country_code: text(form, 'country_code').toUpperCase() || null,
      billing_address: text(form, 'billing_address') || null,
      email: text(form, 'email') || null,
      billing_email: text(form, 'billing_email') || text(form,'email') || null,
      phone: text(form,'phone') || null,
      payment_terms_days: Math.max(0, Number(text(form,'payment_terms_days') || '30')),
      currency: text(form, 'currency') || 'EUR',
      tax_profile: text(form, 'tax_profile') || 'spain_b2b',
      notes: text(form,'notes') || null,
      status: 'active',
      metadata: {},
      created_at: now,
      updated_at: now,
    })
    if (row) await recordFinanceAudit({entityType:'counterparty',entityId:String(row.counterparty_id),action:'created',after:row})
  } else if (type === 'invoice') {
    const counterpartyId = text(form,'counterparty_id')
    const counterparties = counterpartyId ? await queryGrowthTable<Row>('finance_counterparties',{tenant_id:'eq.sc-analytics',counterparty_id:`eq.${counterpartyId}`,limit:'1'},{cacheSeconds:0}) : []
    const counterparty = counterparties[0] || {}
    const subtotal = money(form.get('subtotal'))
    const countryCode = (text(form,'recipient_country_code') || String(counterparty.country_code || '')).toUpperCase()
    const taxProfile = text(form,'tax_profile') || String(counterparty.tax_profile || '')
    const suggested = suggestTaxTreatment({countryCode,vatId:String(counterparty.vat_id || ''),taxProfile,withholdingRate:hasValue(form,'withholding_rate')?money(form.get('withholding_rate')):0})
    const vatRate = hasValue(form,'vat_rate') ? money(form.get('vat_rate')) : suggested.vatRate
    const withholdingRate = hasValue(form,'withholding_rate') ? money(form.get('withholding_rate')) : suggested.withholdingRate
    const amounts = calculateInvoiceAmounts(subtotal,vatRate,withholdingRate)
    const explicitTotal = money(form.get('total'))
    const total = explicitTotal || amounts.total
    const currency = text(form, 'currency') || String(counterparty.currency || 'EUR')
    const fxRate = money(form.get('fx_rate')) || null
    const invoiceId = `invoice_${randomUUID().replaceAll('-', '').slice(0, 12)}`
    const concept = text(form,'concept') || 'Servicios profesionales'
    const row = await insertGrowthRow<Row>('finance_invoices', {
      invoice_id: invoiceId,
      tenant_id: 'sc-analytics',
      company_id: text(form, 'company_id') || counterparty.company_id || null,
      counterparty_id: counterpartyId || null,
      project_id: text(form, 'project_id') || null,
      invoice_number: text(form, 'invoice_number'),
      series: text(form,'series') || 'SC',
      issue_date: text(form, 'issue_date') || null,
      due_date: text(form, 'due_date') || null,
      currency,
      subtotal: amounts.subtotal,
      tax: amounts.tax,
      total,
      status: 'draft',
      recipient_legal_name: text(form, 'recipient_legal_name') || counterparty.legal_name || null,
      recipient_tax_id: text(form, 'recipient_tax_id') || counterparty.tax_id || counterparty.vat_id || null,
      recipient_country_code: countryCode || null,
      tax_profile: suggested.profile,
      tax_rule_key: suggested.ruleKey,
      tax_notes: suggested.note,
      vat_rate: vatRate,
      withholding_rate: withholdingRate,
      withholding_amount: amounts.withholding,
      amount_eur: currency === 'EUR' ? total : (fxRate ? Math.round(total * fxRate * 100) / 100 : null),
      fx_rate: fxRate,
      fx_date: text(form, 'fx_date') || null,
      review_status: 'pending_review',
      source_system: 'crm',
      notes: text(form,'notes') || null,
      metadata: { concept, tax_review_required: suggested.reviewRequired },
      created_at: now,
      updated_at: now,
    })
    await insertGrowthRow('finance_invoice_lines', {
      line_id: `line_${randomUUID().replaceAll('-', '').slice(0,16)}`,
      tenant_id: 'sc-analytics', invoice_id: invoiceId, position: 1, description: concept,
      quantity: money(form.get('quantity')) || 1, unit_price: money(form.get('unit_price')) || amounts.subtotal,
      vat_rate: vatRate, line_subtotal: amounts.subtotal, line_tax: amounts.tax, line_total: amounts.subtotal + amounts.tax,
      created_at: now,
    })
    if (row) await recordFinanceAudit({entityType:'invoice',entityId:invoiceId,action:'draft_created',after:row,notes:suggested.note})
  } else if (type === 'expense') {
    const subtotal = money(form.get('subtotal'))
    const vatRate = money(form.get('vat_rate'))
    const withholdingRate = money(form.get('withholding_rate'))
    const tax = money(form.get('tax')) || Math.round(subtotal * vatRate) / 100
    const withholdingAmount = Math.round(subtotal * withholdingRate) / 100
    const explicitTotal = money(form.get('total'))
    const total = explicitTotal || Math.round((subtotal + tax - withholdingAmount) * 100) / 100
    const currency = text(form, 'currency') || 'EUR'
    const fxRate = money(form.get('fx_rate')) || null
    const expenseId = `expense_${randomUUID().replaceAll('-', '').slice(0, 12)}`
    const row = await insertGrowthRow<Row>('finance_expenses', {
      expense_id: expenseId,
      tenant_id: 'sc-analytics',
      project_id: text(form, 'project_id') || null,
      counterparty_id: text(form, 'counterparty_id') || null,
      vendor: text(form, 'vendor'),
      vendor_tax_id: text(form, 'vendor_tax_id') || null,
      invoice_number: text(form,'invoice_number') || null,
      category: text(form, 'category'),
      expense_date: text(form, 'expense_date') || null,
      currency,
      subtotal,
      vat_rate: vatRate,
      tax,
      withholding_rate: withholdingRate,
      withholding_amount: withholdingAmount,
      total,
      status: 'recorded',
      amount_eur: currency === 'EUR' ? total : (fxRate ? Math.round(total * fxRate * 100) / 100 : null),
      fx_rate: fxRate,
      fx_date: text(form, 'fx_date') || null,
      review_status: 'pending_review',
      source_system: 'crm',
      metadata: { notes: text(form, 'notes') },
      created_at: now,
    })
    if (row) await recordFinanceAudit({entityType:'expense',entityId:expenseId,action:'created',after:row})
  } else if (type === 'payment') {
    const amount = money(form.get('amount'))
    const currency = text(form, 'currency') || 'EUR'
    const fxRate = money(form.get('fx_rate')) || null
    const paymentId = `payment_${randomUUID().replaceAll('-', '').slice(0, 12)}`
    const row = await insertGrowthRow<Row>('finance_payments', {
      payment_id: paymentId,
      tenant_id: 'sc-analytics',
      invoice_id: text(form, 'invoice_id') || null,
      expense_id: text(form, 'expense_id') || null,
      company_id: text(form, 'company_id') || null,
      payment_date: text(form, 'payment_date') || null,
      currency,
      amount,
      amount_eur: currency === 'EUR' ? amount : (fxRate ? Math.round(amount * fxRate * 100) / 100 : null),
      fx_rate: fxRate,
      fx_date: text(form, 'fx_date') || null,
      direction: text(form, 'direction') || 'inflow',
      method: text(form, 'method'),
      reference: text(form, 'reference'),
      status: 'recorded',
      review_status: 'pending_review',
      source_system: 'crm',
      reconciliation_status: 'unmatched',
      metadata: {},
      created_at: now,
    })
    if (row) await recordFinanceAudit({entityType:'payment',entityId:paymentId,action:'created',after:row})
  } else if (type === 'review') {
    const entity = text(form, 'entity')
    const entityId = text(form, 'entity_id')
    const decision = text(form, 'decision') || 'reviewed'
    if (!entityId || !['invoice', 'expense', 'payment'].includes(entity)) return new NextResponse('Invalid review target', { status: 400 })
    const table = entity === 'invoice' ? 'finance_invoices' : entity === 'expense' ? 'finance_expenses' : 'finance_payments'
    const key = entity === 'invoice' ? 'invoice_id' : entity === 'expense' ? 'expense_id' : 'payment_id'
    const beforeRows = await queryGrowthTable<Row>(table,{tenant_id:'eq.sc-analytics',[key]:`eq.${entityId}`,limit:'1'},{cacheSeconds:0})
    const changes: Record<string,unknown> = { review_status: decision }
    if (decision === 'reviewed' || decision === 'confirmed') {
      changes.reviewed_at = now
      if (entity === 'invoice') changes.status = 'reviewed'
      if (entity === 'expense') changes.status = 'booked'
      if (entity === 'payment') changes.status = 'confirmed'
    }
    const after = await updateGrowthRow<Row>(table, key, entityId, changes)
    await recordFinanceAudit({entityType:entity,entityId,action:`review_${decision}`,before:beforeRows[0],after})
    if ((decision === 'reviewed' || decision === 'confirmed') && entity === 'expense') await postExpenseAccounting(entityId)
    if ((decision === 'reviewed' || decision === 'confirmed') && entity === 'payment') {
      await postPaymentAccounting(entityId)
      if (after) await maybeMarkSettled(after)
    }
    await syncFinanceRegisters().catch((error)=>console.error('Register sync after review failed',error))
  } else {
    return new NextResponse('Unsupported finance action', { status: 400 })
  }

  return NextResponse.redirect(new URL(returnTo, request.url), 303)
}
