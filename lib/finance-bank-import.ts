import 'server-only'

import { createHash, randomUUID } from 'node:crypto'
import ExcelJS from 'exceljs'
import { insertGrowthRow, queryGrowthTable, updateGrowthRow, upsertGrowthRow } from '@/lib/supabase-growth'
import { recordFinanceAudit } from '@/lib/finance-audit'
import { ensureFinancePath, uploadBinaryFile } from '@/lib/google-drive-finance'

type Json = Record<string, any>
type Cell = string | number | boolean | Date | null | undefined

type ParsedBankRow = {
  bookedAt: string
  completedAt?: string | null
  direction: 'inflow' | 'outflow'
  currency: string
  amount: number
  amountEur?: number | null
  counterpartyName: string
  reference: string
  status: string
  product?: string
  balance?: number | null
  raw: Record<string, unknown>
  signature: string
}

const TENANT_ID = 'sc-analytics'
const PROVIDER = 'revolut_personal_import'

function norm(value: unknown) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function text(value: Cell) {
  if (value instanceof Date) return value.toISOString()
  return String(value ?? '').trim()
}

function numberValue(value: Cell) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const raw = String(value ?? '').trim().replace(/\s/g, '')
  if (!raw) return 0
  const decimalComma = raw.includes(',') && (!raw.includes('.') || raw.lastIndexOf(',') > raw.lastIndexOf('.'))
  const normalized = decimalComma ? raw.replace(/\./g, '').replace(',', '.') : raw.replace(/,/g, '')
  const parsed = Number(normalized.replace(/[^0-9+\-.]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function dateIso(value: Cell) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString()
  if (typeof value === 'number' && value > 20000 && value < 80000) {
    const excelEpoch = Date.UTC(1899, 11, 30)
    return new Date(excelEpoch + value * 86400000).toISOString()
  }
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  const direct = new Date(raw)
  if (!Number.isNaN(direct.getTime())) return direct.toISOString()
  const dmy = raw.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/)
  if (dmy) {
    const year = Number(dmy[3]) < 100 ? 2000 + Number(dmy[3]) : Number(dmy[3])
    const parsed = new Date(Date.UTC(year, Number(dmy[2]) - 1, Number(dmy[1]), Number(dmy[4] || 0), Number(dmy[5] || 0), Number(dmy[6] || 0)))
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  }
  return ''
}

function csvRows(input: string) {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') { field += '"'; i += 1 }
      else if (char === '"') quoted = false
      else field += char
    } else if (char === '"') quoted = true
    else if (char === ',' || char === ';' || char === '\t') { row.push(field); field = '' }
    else if (char === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = '' }
    else field += char
  }
  if (field.length || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row) }
  return rows.filter((r) => r.some((cell) => String(cell).trim()))
}

async function spreadsheetRows(buffer: Buffer) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer)
  const sheet = workbook.worksheets[0]
  if (!sheet) return [] as Cell[][]
  const rows: Cell[][] = []
  sheet.eachRow({ includeEmpty: false }, (row) => {
    rows.push(row.values.slice(1).map((value: any) => {
      if (value && typeof value === 'object' && 'result' in value) return value.result as Cell
      if (value && typeof value === 'object' && 'text' in value) return value.text as Cell
      return value as Cell
    }))
  })
  return rows
}

function indexFor(headers: string[], candidates: string[]) {
  for (const candidate of candidates) {
    const exact = headers.findIndex((header) => header === candidate)
    if (exact >= 0) return exact
  }
  for (const candidate of candidates) {
    const partial = headers.findIndex((header) => header.includes(candidate) || candidate.includes(header))
    if (partial >= 0) return partial
  }
  return -1
}

function parseRows(rows: Cell[][]) {
  if (rows.length < 2) throw new Error('El extracto no contiene movimientos')
  const headers = rows[0].map(norm)
  const dateIdx = indexFor(headers, ['completeddate','bookingdate','bookeddate','fechaoperacion','fechacontable','fecha','date'])
  const startedIdx = indexFor(headers, ['starteddate','createddate','startdate'])
  const amountIdx = indexFor(headers, ['amount','importe','monto'])
  const debitIdx = indexFor(headers, ['debit','debito','cargo','salida'])
  const creditIdx = indexFor(headers, ['credit','credito','abono','entrada'])
  const currencyIdx = indexFor(headers, ['currency','divisa','moneda'])
  const descriptionIdx = indexFor(headers, ['description','descripcion','concepto','merchant','beneficiary','counterparty','contraparte','referencia','reference'])
  const referenceIdx = indexFor(headers, ['reference','referencia','concepto','description','descripcion'])
  const stateIdx = indexFor(headers, ['state','status','estado'])
  const productIdx = indexFor(headers, ['product','producto','account','cuenta'])
  const balanceIdx = indexFor(headers, ['balance','saldo'])
  const typeIdx = indexFor(headers, ['type','tipo','transactiontype'])

  if (dateIdx < 0 && startedIdx < 0) throw new Error('No se ha reconocido la columna de fecha. Exporta el extracto con encabezados.')
  if (amountIdx < 0 && debitIdx < 0 && creditIdx < 0) throw new Error('No se ha reconocido la columna de importe.')

  const occurrences = new Map<string, number>()
  const parsed: ParsedBankRow[] = []
  for (const row of rows.slice(1)) {
    const bookedAt = dateIso(row[dateIdx >= 0 ? dateIdx : startedIdx]) || dateIso(row[startedIdx])
    if (!bookedAt) continue
    let signed = amountIdx >= 0 ? numberValue(row[amountIdx]) : 0
    if (amountIdx < 0) signed = Math.abs(numberValue(row[creditIdx])) - Math.abs(numberValue(row[debitIdx]))
    if (!signed) continue
    const currency = (currencyIdx >= 0 ? text(row[currencyIdx]) : 'EUR').toUpperCase() || 'EUR'
    const reference = referenceIdx >= 0 ? text(row[referenceIdx]) : ''
    const description = descriptionIdx >= 0 ? text(row[descriptionIdx]) : reference
    const statusRaw = stateIdx >= 0 ? text(row[stateIdx]).toLowerCase() : 'completed'
    const status = /revert|rejected|failed|cancel/.test(statusRaw) ? statusRaw : 'completed'
    const product = productIdx >= 0 ? text(row[productIdx]) : ''
    const balance = balanceIdx >= 0 ? numberValue(row[balanceIdx]) : null
    const type = typeIdx >= 0 ? text(row[typeIdx]) : ''
    const completedAt = dateIdx >= 0 ? dateIso(row[dateIdx]) : null
    const raw: Record<string, unknown> = {}
    rows[0].forEach((header, index) => { raw[text(header) || `column_${index + 1}`] = row[index] instanceof Date ? (row[index] as Date).toISOString() : row[index] ?? null })
    const baseSignature = [bookedAt.slice(0,19), signed.toFixed(2), currency, description, reference, product, balance ?? '', type].join('|').toLowerCase()
    const occurrence = (occurrences.get(baseSignature) || 0) + 1
    occurrences.set(baseSignature, occurrence)
    const signature = `${baseSignature}|${occurrence}`
    parsed.push({
      bookedAt,
      completedAt,
      direction: signed >= 0 ? 'inflow' : 'outflow',
      currency,
      amount: Math.abs(Math.round(signed * 100) / 100),
      amountEur: currency === 'EUR' ? Math.abs(Math.round(signed * 100) / 100) : null,
      counterpartyName: description,
      reference: reference || description,
      status,
      product,
      balance,
      raw,
      signature,
    })
  }
  if (!parsed.length) throw new Error('No se han encontrado movimientos bancarios válidos en el archivo')
  return parsed
}

async function proposeMatch(bankTx: Json) {
  const existing = await queryGrowthTable<Json>('finance_reconciliations', {
    tenant_id: 'eq.sc-analytics', bank_transaction_id: `eq.${bankTx.bank_transaction_id}`, limit: '10',
  }, { cacheSeconds: 0 })
  if (existing.some((row) => !['rejected','cancelled'].includes(String(row.status || '')))) return null

  const amount = Math.abs(Number(bankTx.amount || 0))
  if (!amount) return null
  const reference = String(bankTx.reference || bankTx.counterparty_name || '').toLowerCase()

  if (bankTx.direction === 'inflow') {
    const invoices = await queryGrowthTable<Json>('finance_invoices', { tenant_id: 'eq.sc-analytics', currency: `eq.${bankTx.currency}`, order: 'issue_date.desc', limit: '300' }, { cacheSeconds: 0 })
    const candidates = invoices.filter((invoice) => !['paid','void','cancelled'].includes(String(invoice.status || '')) && Math.abs(Number(invoice.total || 0) - amount) <= 0.01)
    const byReference = candidates.find((invoice) => invoice.invoice_number && reference.includes(String(invoice.invoice_number).toLowerCase()))
    const byName = candidates.find((invoice) => invoice.recipient_legal_name && reference.includes(String(invoice.recipient_legal_name).toLowerCase()))
    const match = byReference || byName || (candidates.length === 1 ? candidates[0] : null)
    if (!match) return null
    const confidence = byReference ? 0.99 : byName ? 0.95 : 0.88
    const reconciliationId = `recon_${randomUUID().replaceAll('-', '').slice(0,16)}`
    await insertGrowthRow('finance_reconciliations', { reconciliation_id: reconciliationId, tenant_id: TENANT_ID, bank_transaction_id: bankTx.bank_transaction_id, entity_type: 'invoice', entity_id: match.invoice_id, matched_amount: amount, currency: bankTx.currency, confidence, status: 'proposed', matched_by: 'system', notes: byReference ? 'Coinciden importe y número de factura' : byName ? 'Coinciden importe y cliente' : 'Importe exacto con una única factura candidata', created_at: new Date().toISOString() })
    await insertGrowthRow('finance_payments', { payment_id: `payment_${randomUUID().replaceAll('-', '').slice(0,12)}`, tenant_id: TENANT_ID, invoice_id: match.invoice_id, company_id: match.company_id || null, payment_date: String(bankTx.booked_at || '').slice(0,10) || null, currency: bankTx.currency, amount, amount_eur: bankTx.amount_eur || null, direction: 'inflow', method: 'Revolut Personal', reference: bankTx.reference || '', status: 'recorded', review_status: 'pending_review', source_system: 'revolut_import', bank_transaction_id: bankTx.bank_transaction_id, reconciliation_status: 'proposed', metadata: { reconciliation_id: reconciliationId, confidence }, created_at: new Date().toISOString() })
    await updateGrowthRow('finance_bank_transactions', 'bank_transaction_id', String(bankTx.bank_transaction_id), { reconciliation_status: 'proposed', updated_at: new Date().toISOString() })
    return { entity: 'invoice', id: match.invoice_id, confidence }
  }

  const expenses = await queryGrowthTable<Json>('finance_expenses', { tenant_id: 'eq.sc-analytics', currency: `eq.${bankTx.currency}`, order: 'expense_date.desc', limit: '300' }, { cacheSeconds: 0 })
  const candidates = expenses.filter((expense) => expense.status !== 'paid' && Math.abs(Number(expense.total || 0) - amount) <= 0.01)
  const byVendor = candidates.find((expense) => expense.vendor && reference.includes(String(expense.vendor).toLowerCase()))
  const match = byVendor || (candidates.length === 1 ? candidates[0] : null)
  if (!match) return null
  const confidence = byVendor ? 0.95 : 0.85
  const reconciliationId = `recon_${randomUUID().replaceAll('-', '').slice(0,16)}`
  await insertGrowthRow('finance_reconciliations', { reconciliation_id: reconciliationId, tenant_id: TENANT_ID, bank_transaction_id: bankTx.bank_transaction_id, entity_type: 'expense', entity_id: match.expense_id, matched_amount: amount, currency: bankTx.currency, confidence, status: 'proposed', matched_by: 'system', notes: byVendor ? 'Coinciden importe y proveedor' : 'Importe exacto con un único gasto candidato', created_at: new Date().toISOString() })
  await insertGrowthRow('finance_payments', { payment_id: `payment_${randomUUID().replaceAll('-', '').slice(0,12)}`, tenant_id: TENANT_ID, expense_id: match.expense_id, payment_date: String(bankTx.booked_at || '').slice(0,10) || null, currency: bankTx.currency, amount, amount_eur: bankTx.amount_eur || null, direction: 'outflow', method: 'Revolut Personal', reference: bankTx.reference || '', status: 'recorded', review_status: 'pending_review', source_system: 'revolut_import', bank_transaction_id: bankTx.bank_transaction_id, reconciliation_status: 'proposed', metadata: { reconciliation_id: reconciliationId, confidence }, created_at: new Date().toISOString() })
  await updateGrowthRow('finance_bank_transactions', 'bank_transaction_id', String(bankTx.bank_transaction_id), { reconciliation_status: 'proposed', updated_at: new Date().toISOString() })
  return { entity: 'expense', id: match.expense_id, confidence }
}

export async function importBankStatement(fileName: string, mimeType: string, buffer: Buffer) {
  if (!buffer.length) throw new Error('El archivo está vacío')
  if (buffer.length > 12 * 1024 * 1024) throw new Error('El extracto supera el límite de 12 MB')
  const lower = fileName.toLowerCase()
  let rows: Cell[][]
  if (lower.endsWith('.xlsx') || /spreadsheetml/.test(mimeType)) rows = await spreadsheetRows(buffer)
  else if (lower.endsWith('.csv') || /csv|text\//.test(mimeType)) rows = csvRows(buffer.toString('utf8'))
  else throw new Error('Formato no compatible. Usa CSV o XLSX.')

  const parsed = parseRows(rows)
  const fileHash = createHash('sha256').update(buffer).digest('hex')
  const importId = `bankimport_${fileHash.slice(0,16)}`
  let driveFile: { id?: string; url?: string } | null = null
  try {
    const year = parsed[0].bookedAt.slice(0,4)
    const folder = await ensureFinancePath(['06 Exportaciones', year, 'Extractos bancarios'])
    const uploaded = await uploadBinaryFile(folder.id, fileName, mimeType || (lower.endsWith('.csv') ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'), buffer)
    driveFile = { id: uploaded.id, url: uploaded.webViewLink }
  } catch (error) {
    console.warn('Bank statement Drive archive skipped', error)
  }

  let inserted = 0
  let skipped = 0
  let proposed = 0
  const accounts = new Map<string, Json>()
  for (const row of parsed) {
    const accountKey = `${row.product || 'Personal'}|${row.currency}`
    let account = accounts.get(accountKey)
    if (!account) {
      account = await upsertGrowthRow<Json>('finance_bank_accounts', {
        bank_account_id: `bank_${createHash('sha256').update(`${PROVIDER}|${accountKey}`).digest('hex').slice(0,16)}`,
        tenant_id: TENANT_ID,
        provider: PROVIDER,
        provider_account_id: accountKey,
        display_name: `Revolut Personal · ${row.product || row.currency}`,
        currency: row.currency,
        status: 'active',
        metadata: { source: 'manual_statement_import' },
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }, 'tenant_id,provider,provider_account_id')
      if (account) accounts.set(accountKey, account)
    }

    const providerTransactionId = createHash('sha256').update(row.signature).digest('hex')
    const existing = await queryGrowthTable<Json>('finance_bank_transactions', { tenant_id: 'eq.sc-analytics', provider: `eq.${PROVIDER}`, provider_transaction_id: `eq.${providerTransactionId}`, limit: '1' }, { cacheSeconds: 0 })
    if (existing[0]) { skipped += 1; continue }
    const bankTransactionId = `banktx_${providerTransactionId.slice(0,24)}`
    const stored = await insertGrowthRow<Json>('finance_bank_transactions', {
      bank_transaction_id: bankTransactionId,
      tenant_id: TENANT_ID,
      bank_account_id: account?.bank_account_id || null,
      provider: PROVIDER,
      provider_transaction_id: providerTransactionId,
      booked_at: row.bookedAt,
      completed_at: row.completedAt || null,
      direction: row.direction,
      currency: row.currency,
      amount: row.amount,
      amount_eur: row.amountEur ?? null,
      fx_rate: null,
      counterparty_name: row.counterpartyName,
      reference: row.reference,
      status: row.status,
      raw_payload: { ...row.raw, _import: { import_id: importId, file_name: fileName, file_sha256: fileHash, drive_file_id: driveFile?.id || null, drive_url: driveFile?.url || null } },
      reconciliation_status: 'unmatched',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (!stored) continue
    inserted += 1
    if (stored.status === 'completed') {
      const match = await proposeMatch(stored)
      if (match) proposed += 1
    }
  }

  await recordFinanceAudit({
    entityType: 'bank_import', entityId: importId, action: 'statement_imported', actor: 'arnau',
    after: { file_name: fileName, file_sha256: fileHash, parsed_rows: parsed.length, inserted, skipped, reconciliations_proposed: proposed, drive_file_id: driveFile?.id || null, drive_url: driveFile?.url || null },
  })

  return { importId, parsed: parsed.length, inserted, skipped, proposed, driveFile }
}
