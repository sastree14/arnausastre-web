import 'server-only'

import { randomUUID } from 'node:crypto'
import { queryGrowthTable, insertGrowthRow, updateGrowthRow } from '@/lib/supabase-growth'
import { ensureFinancePath, ensureSpreadsheet, exportDriveFile, financeGoogleReadiness, replaceSpreadsheetValues, uploadBinaryFile } from '@/lib/google-drive-finance'

type Row = Record<string, any>
const TENANT_ID = 'sc-analytics'

function n(value: unknown) { const parsed = Number(value || 0); return Number.isFinite(parsed) ? parsed : 0 }
function money(value: unknown) { return Math.round(n(value) * 100) / 100 }
function quarter(dateValue: string) { const month = Number(String(dateValue || '').slice(5, 7)) || 1; return `Q${Math.min(4, Math.max(1, Math.ceil(month / 3)))}` }

async function financeSettings() {
  const rows = await queryGrowthTable<Row>('finance_settings', { tenant_id: `eq.${TENANT_ID}`, limit: '1' }, { cacheSeconds: 0 })
  return rows[0] || {}
}

export async function generateInvoiceDriveArtifacts(invoiceId: string) {
  const ready = financeGoogleReadiness()
  if (!ready.configured) throw new Error(`Google Finance integration is not configured: ${ready.missing.join(', ')}`)

  const invoices = await queryGrowthTable<Row>('finance_invoices', { tenant_id: `eq.${TENANT_ID}`, invoice_id: `eq.${invoiceId}`, limit: '1' }, { cacheSeconds: 0 })
  const invoice = invoices[0]
  if (!invoice) throw new Error('Invoice not found')
  if (invoice.pdf_drive_file_id && invoice.sheet_drive_file_id && invoice.xlsx_drive_file_id) {
    return { alreadyGenerated: true, pdfId: invoice.pdf_drive_file_id, sheetId: invoice.sheet_drive_file_id, xlsxId: invoice.xlsx_drive_file_id }
  }

  const [settings, lines, counterparties] = await Promise.all([
    financeSettings(),
    queryGrowthTable<Row>('finance_invoice_lines', { tenant_id: `eq.${TENANT_ID}`, invoice_id: `eq.${invoiceId}`, order: 'position.asc', limit: '100' }, { cacheSeconds: 0 }),
    invoice.counterparty_id ? queryGrowthTable<Row>('finance_counterparties', { tenant_id: `eq.${TENANT_ID}`, counterparty_id: `eq.${invoice.counterparty_id}`, limit: '1' }, { cacheSeconds: 0 }) : Promise.resolve([]),
  ])
  const counterparty = counterparties[0] || {}
  const issueDate = String(invoice.issue_date || new Date().toISOString().slice(0, 10))
  const year = issueDate.slice(0, 4)
  const folder = await ensureFinancePath(['01 Facturas emitidas', year, quarter(issueDate)])
  const number = String(invoice.invoice_number || invoiceId)
  const sheetName = `Factura ${number}`
  const sheet = await ensureSpreadsheet(folder.id, sheetName)
  const currency = String(invoice.currency || 'EUR')

  const detailRows = lines.length ? lines.map((line) => [
    String(line.description || ''),
    n(line.quantity),
    money(line.unit_price),
    money(line.line_subtotal),
    n(line.vat_rate),
    money(line.line_total),
  ]) : [[String(invoice.metadata?.description || invoice.notes || 'Servicios profesionales'), 1, money(invoice.subtotal), money(invoice.subtotal), n(invoice.vat_rate), money(invoice.subtotal) + money(invoice.tax)]]

  const rows: unknown[][] = [
    ['SC-Analytics', '', '', '', 'FACTURA', number],
    ['Emisor', String(settings.legal_name || 'PENDIENTE CONFIGURAR'), '', 'NIF', String(settings.tax_id || 'PENDIENTE CONFIGURAR'), ''],
    ['Dirección', String(settings.billing_address || ''), '', 'Email', String(settings.billing_email || ''), ''],
    ['Cliente', String(invoice.recipient_legal_name || counterparty.legal_name || ''), '', 'NIF/VAT', String(invoice.recipient_tax_id || counterparty.tax_id || counterparty.vat_id || ''), ''],
    ['País', String(invoice.recipient_country_code || counterparty.country_code || ''), '', 'Fecha', issueDate, ''],
    ['Vencimiento', String(invoice.due_date || ''), '', 'Moneda', currency, ''],
    ['', '', '', '', '', ''],
    ['Concepto', 'Cantidad', 'Precio unit.', 'Base', 'IVA %', 'Total'],
    ...detailRows,
    ['', '', '', '', '', ''],
    ['Subtotal', money(invoice.subtotal), '', '', '', ''],
    ['IVA', money(invoice.tax), '', '', '', ''],
    ['Retención', money(invoice.withholding_amount), '', '', '', ''],
    ['TOTAL', money(invoice.total), currency, '', '', ''],
    ['', '', '', '', '', ''],
    ['Tratamiento fiscal', String(invoice.tax_notes || invoice.tax_rule_key || ''), '', '', '', ''],
    ['Notas', String(invoice.notes || ''), '', '', '', ''],
    ['Datos de cobro', String(settings.bank_details || ''), '', '', '', ''],
  ]
  await replaceSpreadsheetValues(sheet.id, 'Factura', rows)

  const [pdfBytes, xlsxBytes] = await Promise.all([
    exportDriveFile(sheet.id, 'application/pdf'),
    exportDriveFile(sheet.id, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
  ])
  const [pdf, xlsx] = await Promise.all([
    uploadBinaryFile(folder.id, `${sheetName}.pdf`, 'application/pdf', pdfBytes),
    uploadBinaryFile(folder.id, `${sheetName}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', xlsxBytes),
  ])

  const now = new Date().toISOString()
  for (const document of [
    { type: 'google_sheet', file: sheet, mime: 'application/vnd.google-apps.spreadsheet', editable: true },
    { type: 'pdf', file: pdf, mime: 'application/pdf', editable: false },
    { type: 'xlsx', file: xlsx, mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', editable: true },
  ]) {
    await insertGrowthRow('finance_documents', {
      document_id: `document_${randomUUID().replaceAll('-', '').slice(0, 16)}`,
      tenant_id: TENANT_ID,
      entity_type: 'invoice',
      entity_id: invoiceId,
      document_type: document.type,
      drive_file_id: document.file.id,
      drive_url: document.file.webViewLink || '',
      file_name: document.file.name || '',
      mime_type: document.mime,
      editable: document.editable,
      version_no: 1,
      metadata: { generated_by: 'finance_os', generated_at: now },
      created_at: now,
    })
  }

  await updateGrowthRow('finance_invoices', 'invoice_id', invoiceId, {
    drive_folder_id: folder.id,
    sheet_drive_file_id: sheet.id,
    pdf_drive_file_id: pdf.id,
    xlsx_drive_file_id: xlsx.id,
    external_file_url: sheet.webViewLink || '',
    updated_at: now,
  })
  return { alreadyGenerated: false, folderId: folder.id, sheetId: sheet.id, pdfId: pdf.id, xlsxId: xlsx.id, sheetUrl: sheet.webViewLink || '' }
}

export async function syncFinanceRegisters(year = new Date().getFullYear()) {
  const ready = financeGoogleReadiness()
  if (!ready.configured) return { skipped: true, reason: `Missing: ${ready.missing.join(', ')}` }

  const start = `${year}-01-01`
  const end = `${year}-12-31`
  const [invoices, expenses, payments] = await Promise.all([
    queryGrowthTable<Row>('finance_invoices', { tenant_id: `eq.${TENANT_ID}`, issue_date: `gte.${start}`, and: `(issue_date.lte.${end})`, order: 'issue_date.asc', limit: '2000' }, { cacheSeconds: 0 }),
    queryGrowthTable<Row>('finance_expenses', { tenant_id: `eq.${TENANT_ID}`, expense_date: `gte.${start}`, and: `(expense_date.lte.${end})`, order: 'expense_date.asc', limit: '2000' }, { cacheSeconds: 0 }),
    queryGrowthTable<Row>('finance_payments', { tenant_id: `eq.${TENANT_ID}`, payment_date: `gte.${start}`, and: `(payment_date.lte.${end})`, order: 'payment_date.asc', limit: '2000' }, { cacheSeconds: 0 }),
  ])
  const folder = await ensureFinancePath(['03 Libros registro', String(year)])
  const books = [
    {
      name: `Libro facturas emitidas ${year}`,
      title: 'Facturas emitidas',
      rows: [
        ['Fecha','Nº factura','Cliente','NIF/VAT','País','Moneda','Base','IVA','Retención','Total','Estado','Revisión'],
        ...invoices.map((r) => [r.issue_date,r.invoice_number,r.recipient_legal_name,r.recipient_tax_id,r.recipient_country_code,r.currency,money(r.subtotal),money(r.tax),money(r.withholding_amount),money(r.total),r.status,r.review_status]),
      ],
    },
    {
      name: `Libro gastos ${year}`,
      title: 'Gastos',
      rows: [
        ['Fecha','Proveedor','Nº factura','Categoría','Moneda','Base','IVA','Retención','Total','Estado','Revisión','Origen'],
        ...expenses.map((r) => [r.expense_date,r.vendor,r.invoice_number,r.category,r.currency,money(r.subtotal),money(r.tax),money(r.withholding_amount),money(r.total),r.status,r.review_status,r.source_system]),
      ],
    },
    {
      name: `Libro cobros y pagos ${year}`,
      title: 'Cobros y pagos',
      rows: [
        ['Fecha','Dirección','Moneda','Importe','Método','Referencia','Estado','Conciliación'],
        ...payments.map((r) => [r.payment_date,r.direction,r.currency,money(r.amount),r.method,r.reference,r.status,r.reconciliation_status]),
      ],
    },
  ]

  const result: Record<string, string> = {}
  for (const book of books) {
    const sheet = await ensureSpreadsheet(folder.id, book.name)
    await replaceSpreadsheetValues(sheet.id, book.title, book.rows)
    result[book.name] = sheet.webViewLink || sheet.id
  }
  return { skipped: false, year, books: result }
}
