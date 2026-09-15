import 'server-only'

import { randomUUID } from 'node:crypto'
import { insertGrowthRow, queryGrowthTable } from '@/lib/supabase-growth'

type Row = Record<string, any>
const TENANT_ID = 'sc-analytics'

function n(value: unknown) { const parsed = Number(value || 0); return Number.isFinite(parsed) ? parsed : 0 }
function amountBase(row: Row, field: string) { return n(row.amount_eur || row[field] || 0) }

async function existingPosted(sourceType: string, sourceId: string) {
  const rows = await queryGrowthTable<Row>('finance_journal_entries', {
    tenant_id: `eq.${TENANT_ID}`,
    source_type: `eq.${sourceType}`,
    source_id: `eq.${sourceId}`,
    status: 'eq.posted',
    limit: '1',
  }, { cacheSeconds: 0 })
  return rows[0] || null
}

async function postEntry(input: { date: string; sourceType: string; sourceId: string; description: string; lines: Array<{ account: string; debit?: number; credit?: number; currency?: string; native?: number; fxRate?: number }> }) {
  const existing = await existingPosted(input.sourceType, input.sourceId)
  if (existing) return existing
  const debit = input.lines.reduce((sum, line) => sum + n(line.debit), 0)
  const credit = input.lines.reduce((sum, line) => sum + n(line.credit), 0)
  if (Math.abs(debit - credit) > 0.01) throw new Error(`Journal entry is not balanced: debit ${debit}, credit ${credit}`)

  const entryId = `journal_${randomUUID().replaceAll('-', '').slice(0, 16)}`
  const now = new Date().toISOString()
  const entry = await insertGrowthRow<Row>('finance_journal_entries', {
    journal_entry_id: entryId,
    tenant_id: TENANT_ID,
    entry_date: input.date,
    source_type: input.sourceType,
    source_id: input.sourceId,
    description: input.description,
    status: 'posted',
    posted_at: now,
    metadata: {},
    created_at: now,
    updated_at: now,
  })
  for (const line of input.lines) {
    await insertGrowthRow('finance_journal_lines', {
      journal_line_id: `line_${randomUUID().replaceAll('-', '').slice(0, 16)}`,
      tenant_id: TENANT_ID,
      journal_entry_id: entryId,
      account_code: line.account,
      description: input.description,
      debit: Math.round(n(line.debit) * 100) / 100,
      credit: Math.round(n(line.credit) * 100) / 100,
      currency: line.currency || 'EUR',
      amount_native: line.native ?? null,
      fx_rate: line.fxRate ?? null,
      created_at: now,
    })
  }
  return entry
}

export async function postInvoiceAccounting(invoiceId: string) {
  const rows = await queryGrowthTable<Row>('finance_invoices', { tenant_id: `eq.${TENANT_ID}`, invoice_id: `eq.${invoiceId}`, limit: '1' }, { cacheSeconds: 0 })
  const invoice = rows[0]
  if (!invoice) throw new Error('Invoice not found')
  const subtotal = n(invoice.amount_eur && invoice.currency !== 'EUR' ? n(invoice.subtotal) * n(invoice.fx_rate) : invoice.subtotal)
  const vat = n(invoice.amount_eur && invoice.currency !== 'EUR' ? n(invoice.tax) * n(invoice.fx_rate) : invoice.tax)
  const withholding = n(invoice.amount_eur && invoice.currency !== 'EUR' ? n(invoice.withholding_amount) * n(invoice.fx_rate) : invoice.withholding_amount)
  const receivable = Math.round((subtotal + vat - withholding) * 100) / 100
  const lines = [
    { account: '1200', debit: receivable, currency: 'EUR' },
    ...(withholding > 0 ? [{ account: '2120', debit: withholding, currency: 'EUR' }] : []),
    { account: '4000', credit: subtotal, currency: 'EUR' },
    ...(vat > 0 ? [{ account: '2100', credit: vat, currency: 'EUR' }] : []),
  ]
  return postEntry({ date: String(invoice.issue_date || new Date().toISOString().slice(0, 10)), sourceType: 'invoice', sourceId: invoiceId, description: `Factura ${invoice.invoice_number || invoiceId}`, lines })
}

export async function postExpenseAccounting(expenseId: string) {
  const rows = await queryGrowthTable<Row>('finance_expenses', { tenant_id: `eq.${TENANT_ID}`, expense_id: `eq.${expenseId}`, limit: '1' }, { cacheSeconds: 0 })
  const expense = rows[0]
  if (!expense) throw new Error('Expense not found')
  const fx = expense.currency === 'EUR' ? 1 : n(expense.fx_rate || 0)
  const subtotal = expense.currency === 'EUR' ? n(expense.subtotal) : n(expense.subtotal) * fx
  const vat = expense.currency === 'EUR' ? n(expense.tax) : n(expense.tax) * fx
  const withholding = expense.currency === 'EUR' ? n(expense.withholding_amount) : n(expense.withholding_amount) * fx
  const payable = Math.round((subtotal + vat - withholding) * 100) / 100
  const category = String(expense.category || '').toLowerCase()
  const expenseAccount = category.includes('software') || category.includes('claude') ? '5100' : category.includes('comisi') || category.includes('upwork') ? '5200' : category.includes('autón') || category.includes('seguridad') ? '5300' : '5000'
  const lines = [
    { account: expenseAccount, debit: subtotal, currency: 'EUR' },
    ...(vat > 0 ? [{ account: '2110', debit: vat, currency: 'EUR' }] : []),
    { account: '2000', credit: payable, currency: 'EUR' },
    ...(withholding > 0 ? [{ account: '2130', credit: withholding, currency: 'EUR' }] : []),
  ]
  return postEntry({ date: String(expense.expense_date || new Date().toISOString().slice(0, 10)), sourceType: 'expense', sourceId: expenseId, description: `Gasto ${expense.vendor || expenseId}`, lines })
}

export async function postPaymentAccounting(paymentId: string) {
  const rows = await queryGrowthTable<Row>('finance_payments', { tenant_id: `eq.${TENANT_ID}`, payment_id: `eq.${paymentId}`, limit: '1' }, { cacheSeconds: 0 })
  const payment = rows[0]
  if (!payment) throw new Error('Payment not found')
  const amount = amountBase(payment, 'amount')
  const direction = String(payment.direction || 'inflow')
  const lines = direction === 'inflow'
    ? [{ account: '1000', debit: amount, currency: 'EUR' }, { account: '1200', credit: amount, currency: 'EUR' }]
    : [{ account: '2000', debit: amount, currency: 'EUR' }, { account: '1000', credit: amount, currency: 'EUR' }]
  return postEntry({ date: String(payment.payment_date || new Date().toISOString().slice(0, 10)), sourceType: 'payment', sourceId: paymentId, description: `${direction === 'inflow' ? 'Cobro' : 'Pago'} ${payment.reference || paymentId}`, lines })
}
