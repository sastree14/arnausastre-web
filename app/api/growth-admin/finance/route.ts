import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { insertGrowthRow, isGrowthAdminAuthenticated, updateGrowthRow } from '@/lib/growth-admin'

function money(value: FormDataEntryValue | null) {
  const parsed = Number(String(value || '0').replace(',', '.'))
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0
}

function text(form: FormData, name: string) {
  return String(form.get(name) || '').trim()
}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData()
  const type = text(form, 'type')
  const now = new Date().toISOString()

  if (type === 'counterparty') {
    await insertGrowthRow('finance_counterparties', {
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
      currency: text(form, 'currency') || 'EUR',
      tax_profile: text(form, 'tax_profile') || 'spain_b2b',
      status: 'active',
      metadata: {},
      created_at: now,
      updated_at: now,
    })
  } else if (type === 'invoice') {
    const subtotal = money(form.get('subtotal'))
    const vatRate = money(form.get('vat_rate'))
    const withholdingRate = money(form.get('withholding_rate'))
    const tax = Math.round(subtotal * vatRate) / 100
    const withholdingAmount = Math.round(subtotal * withholdingRate) / 100
    const explicitTotal = money(form.get('total'))
    const total = explicitTotal || Math.round((subtotal + tax - withholdingAmount) * 100) / 100
    const currency = text(form, 'currency') || 'EUR'
    const fxRate = money(form.get('fx_rate')) || null
    await insertGrowthRow('finance_invoices', {
      invoice_id: `invoice_${randomUUID().replaceAll('-', '').slice(0, 12)}`,
      tenant_id: 'sc-analytics',
      company_id: text(form, 'company_id') || null,
      counterparty_id: text(form, 'counterparty_id') || null,
      project_id: text(form, 'project_id') || null,
      invoice_number: text(form, 'invoice_number'),
      issue_date: text(form, 'issue_date') || null,
      due_date: text(form, 'due_date') || null,
      currency,
      subtotal,
      tax,
      total,
      status: 'draft',
      recipient_legal_name: text(form, 'recipient_legal_name') || null,
      recipient_tax_id: text(form, 'recipient_tax_id') || null,
      recipient_country_code: text(form, 'recipient_country_code').toUpperCase() || null,
      tax_profile: text(form, 'tax_profile') || 'spain_b2b',
      vat_rate: vatRate,
      withholding_rate: withholdingRate,
      withholding_amount: withholdingAmount,
      amount_eur: currency === 'EUR' ? total : (fxRate ? Math.round(total * fxRate * 100) / 100 : null),
      fx_rate: fxRate,
      fx_date: text(form, 'fx_date') || null,
      review_status: 'pending_review',
      source_system: 'crm',
      metadata: { concept: text(form, 'concept') },
      created_at: now,
      updated_at: now,
    })
  } else if (type === 'expense') {
    const subtotal = money(form.get('subtotal'))
    const vatRate = money(form.get('vat_rate'))
    const tax = money(form.get('tax')) || Math.round(subtotal * vatRate) / 100
    const explicitTotal = money(form.get('total'))
    const total = explicitTotal || Math.round((subtotal + tax) * 100) / 100
    const currency = text(form, 'currency') || 'EUR'
    const fxRate = money(form.get('fx_rate')) || null
    await insertGrowthRow('finance_expenses', {
      expense_id: `expense_${randomUUID().replaceAll('-', '').slice(0, 12)}`,
      tenant_id: 'sc-analytics',
      project_id: text(form, 'project_id') || null,
      counterparty_id: text(form, 'counterparty_id') || null,
      vendor: text(form, 'vendor'),
      vendor_tax_id: text(form, 'vendor_tax_id') || null,
      category: text(form, 'category'),
      expense_date: text(form, 'expense_date') || null,
      currency,
      subtotal,
      vat_rate: vatRate,
      tax,
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
  } else if (type === 'payment') {
    const amount = money(form.get('amount'))
    const currency = text(form, 'currency') || 'EUR'
    const fxRate = money(form.get('fx_rate')) || null
    await insertGrowthRow('finance_payments', {
      payment_id: `payment_${randomUUID().replaceAll('-', '').slice(0, 12)}`,
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
      metadata: {},
      created_at: now,
    })
  } else if (type === 'review') {
    const entity = text(form, 'entity')
    const entityId = text(form, 'entity_id')
    const decision = text(form, 'decision') || 'confirmed'
    if (!entityId || !['invoice', 'expense', 'payment'].includes(entity)) return new NextResponse('Invalid review target', { status: 400 })
    const table = entity === 'invoice' ? 'finance_invoices' : entity === 'expense' ? 'finance_expenses' : 'finance_payments'
    const key = entity === 'invoice' ? 'invoice_id' : entity === 'expense' ? 'expense_id' : 'payment_id'
    await updateGrowthRow(table, key, entityId, { review_status: decision })
  } else {
    return new NextResponse('Unsupported finance action', { status: 400 })
  }

  return NextResponse.redirect(new URL('/growth-admin/finance', request.url), 303)
}
