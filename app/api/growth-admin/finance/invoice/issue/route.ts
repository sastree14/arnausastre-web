import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { queryGrowthRpc, queryGrowthTable, updateGrowthRow } from '@/lib/supabase-growth'
import { generateInvoiceDriveArtifacts, syncFinanceRegisters } from '@/lib/finance-documents'
import { postInvoiceAccounting } from '@/lib/finance-accounting'
import { recordFinanceAudit } from '@/lib/finance-audit'
import { financeGoogleReadiness } from '@/lib/google-drive-finance'

type Row = Record<string, any>

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData()
  const invoiceId = String(form.get('invoice_id') || '').trim()
  const returnTo = String(form.get('return_to') || '/growth-admin/finance/invoices')
  if (!invoiceId) return new NextResponse('Missing invoice_id', { status: 400 })

  const invoices = await queryGrowthTable<Row>('finance_invoices', { tenant_id: 'eq.sc-analytics', invoice_id: `eq.${invoiceId}`, limit: '1' }, { cacheSeconds: 0 })
  const invoice = invoices[0]
  if (!invoice) return new NextResponse('Invoice not found', { status: 404 })
  if (invoice.status === 'issued' || invoice.issued_at) return NextResponse.redirect(new URL(`${returnTo}?invoice_already_issued=1`, request.url), 303)
  if (invoice.review_status !== 'reviewed' && invoice.review_status !== 'confirmed') return NextResponse.redirect(new URL(`${returnTo}?invoice_error=review_required`, request.url), 303)

  const settingsRows = await queryGrowthTable<Row>('finance_settings', { tenant_id: 'eq.sc-analytics', limit: '1' }, { cacheSeconds: 0 })
  const settings = settingsRows[0] || {}
  const missingIssuer = ['legal_name','tax_id','billing_address'].filter((key) => !String(settings[key] || '').trim())
  if (missingIssuer.length) return NextResponse.redirect(new URL(`${returnTo}?invoice_error=issuer_settings`, request.url), 303)
  const googleReady = financeGoogleReadiness()
  if (!googleReady.configured) return NextResponse.redirect(new URL(`${returnTo}?invoice_error=google_not_configured`, request.url), 303)

  let invoiceNumber = String(invoice.invoice_number || '').trim()
  if (!invoiceNumber) {
    const year = Number(String(invoice.issue_date || new Date().toISOString().slice(0,10)).slice(0,4))
    invoiceNumber = await queryGrowthRpc<string>('finance_next_invoice_number', {
      p_tenant_id: 'sc-analytics',
      p_series: String(invoice.series || settings.invoice_series || 'SC'),
      p_fiscal_year: String(year),
    }, { cacheSeconds: 0 })
    await updateGrowthRow('finance_invoices', 'invoice_id', invoiceId, { invoice_number: invoiceNumber, updated_at: new Date().toISOString() })
  }

  const lines = await queryGrowthTable<Row>('finance_invoice_lines', { tenant_id: 'eq.sc-analytics', invoice_id: `eq.${invoiceId}`, order: 'position.asc', limit: '100' }, { cacheSeconds: 0 })
  const canonical = JSON.stringify({
    invoice_id: invoiceId,
    invoice_number: invoiceNumber,
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    recipient_legal_name: invoice.recipient_legal_name,
    recipient_tax_id: invoice.recipient_tax_id,
    recipient_country_code: invoice.recipient_country_code,
    currency: invoice.currency,
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    withholding_amount: invoice.withholding_amount,
    total: invoice.total,
    tax_rule_key: invoice.tax_rule_key,
    lines,
  })
  const immutableHash = createHash('sha256').update(canonical).digest('hex')

  try {
    const artifacts = await generateInvoiceDriveArtifacts(invoiceId)
    await postInvoiceAccounting(invoiceId)
    const now = new Date().toISOString()
    await updateGrowthRow('finance_invoices', 'invoice_id', invoiceId, {
      invoice_number: invoiceNumber,
      status: 'issued',
      issued_at: now,
      immutable_hash: immutableHash,
      verifactu_status: 'not_submitted',
      updated_at: now,
    })
    await recordFinanceAudit({ entityType: 'invoice', entityId: invoiceId, action: 'issued', actor: 'arnau', before: invoice, after: { invoice_number: invoiceNumber, immutable_hash: immutableHash, artifacts } })
    await syncFinanceRegisters(Number(String(invoice.issue_date || now).slice(0,4))).catch((error) => console.error('Finance register sync after issue failed', error))
    return NextResponse.redirect(new URL(`${returnTo}?invoice_issued=${encodeURIComponent(invoiceNumber)}`, request.url), 303)
  } catch (error) {
    console.error('Invoice issuance failed', error)
    await recordFinanceAudit({ entityType: 'invoice', entityId: invoiceId, action: 'issue_failed', actor: 'system', notes: error instanceof Error ? error.message : String(error) }).catch(() => undefined)
    return NextResponse.redirect(new URL(`${returnTo}?invoice_error=generation_failed`, request.url), 303)
  }
}
