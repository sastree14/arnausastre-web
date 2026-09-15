import 'server-only'

import { createHash, randomUUID } from 'node:crypto'
import { getGmailAccessToken, getGmailConnections } from '@/lib/google-oauth-finance'
import { upsertGrowthRow } from '@/lib/supabase-growth'
import { ensureFinancePath, financeGoogleReadiness, uploadBinaryFile } from '@/lib/google-drive-finance'

type Json = Record<string, any>
type Attachment = { filename: string; mimeType: string; attachmentId?: string; inlineData?: string }

function decodeB64Url(value: string) { return Buffer.from(value, 'base64url') }
function header(headers: Json[], name: string) { return String(headers.find((h) => String(h.name).toLowerCase() === name.toLowerCase())?.value || '') }
function parseDate(value: string) { const d = new Date(value); return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0,10) : d.toISOString().slice(0,10) }
function quarter(dateValue: string) { const month = Number(dateValue.slice(5,7)) || 1; return `Q${Math.min(4, Math.max(1, Math.ceil(month/3)))}` }

async function gmailFetch(accessToken: string, path: string) {
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' })
  const body = await response.json() as Json
  if (!response.ok) throw new Error(`Gmail ${response.status}: ${JSON.stringify(body).slice(0,500)}`)
  return body
}

function walkParts(part: Json, textParts: string[], attachments: Attachment[]) {
  const mimeType = String(part.mimeType || '')
  const filename = String(part.filename || '')
  if (mimeType === 'text/plain' && part.body?.data) textParts.push(decodeB64Url(String(part.body.data)).toString('utf8'))
  if (filename) attachments.push({ filename, mimeType: mimeType || 'application/octet-stream', attachmentId: part.body?.attachmentId, inlineData: part.body?.data })
  for (const child of part.parts || []) walkParts(child, textParts, attachments)
}

function vendorFromFrom(value: string) {
  const name = value.split('<')[0].replace(/^"|"$/g,'').trim()
  if (name) return name
  return (value.match(/<([^>]+)>/)?.[1] || value).split('@')[0]
}

function parseAmount(text: string) {
  const normalized = text.replace(/\u00a0/g,' ')
  const patterns = [
    /(?:total|importe\s+total|amount\s+due|grand\s+total)\s*[:\-]?\s*(?:EUR|USD|€|\$)?\s*([0-9][0-9., ]{0,15})\s*(EUR|USD|€|\$)?/i,
    /(?:EUR|€)\s*([0-9][0-9., ]{0,15})/i,
    /(?:USD|\$)\s*([0-9][0-9., ]{0,15})/i,
  ]
  for (const pattern of patterns) {
    const match = normalized.match(pattern)
    if (!match) continue
    const raw = String(match[1] || '').replace(/\s/g,'')
    const decimalComma = raw.includes(',') && (!raw.includes('.') || raw.lastIndexOf(',') > raw.lastIndexOf('.'))
    const clean = decimalComma ? raw.replace(/\./g,'').replace(',','.') : raw.replace(/,/g,'')
    const amount = Number(clean)
    if (!Number.isFinite(amount) || amount <= 0) continue
    const currencyToken = String(match[2] || match[0]).toUpperCase()
    const currency = currencyToken.includes('USD') || currencyToken.includes('$') ? 'USD' : 'EUR'
    return { amount: Math.round(amount * 100) / 100, currency }
  }
  return { amount: 0, currency: /USD|\$/i.test(normalized) ? 'USD' : 'EUR' }
}

function parseVat(text: string) {
  const match = text.match(/(?:IVA|VAT)\s*(?:\(?\s*([0-9]{1,2}(?:[.,][0-9]+)?)\s*%\s*\)?)?\s*[:\-]?\s*(?:EUR|USD|€|\$)?\s*([0-9][0-9., ]{0,12})/i)
  if (!match) return { rate: 0, amount: 0 }
  const rate = Number(String(match[1] || '0').replace(',','.')) || 0
  const raw = String(match[2] || '0').replace(/\s/g,'')
  const decimalComma = raw.includes(',') && (!raw.includes('.') || raw.lastIndexOf(',') > raw.lastIndexOf('.'))
  const amount = Number(decimalComma ? raw.replace(/\./g,'').replace(',','.') : raw.replace(/,/g,'')) || 0
  return { rate, amount: Math.round(amount*100)/100 }
}

function invoiceNumber(subject: string, text: string) {
  const source = `${subject}\n${text}`
  return String(source.match(/(?:invoice|factura|receipt|recibo)\s*(?:n[oº°.]?|number|#)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9_\-/]{2,30})/i)?.[1] || '')
}

function categoryFor(vendor: string, subject: string) {
  const value = `${vendor} ${subject}`.toLowerCase()
  if (/(claude|anthropic|openai|chatgpt|notion|vercel|supabase|software|subscription)/.test(value)) return 'Software y suscripciones'
  if (/(upwork|stripe|paypal|commission|comisi)/.test(value)) return 'Comisiones y plataformas'
  if (/(seguridad social|autonom|autónom)/.test(value)) return 'Cuota autónomo y seguridad social'
  if (/(google|meta|linkedin|advert|marketing)/.test(value)) return 'Marketing y publicidad'
  return 'Pendiente de categorizar'
}

async function attachmentBytes(accessToken: string, messageId: string, attachment: Attachment) {
  if (attachment.inlineData) return decodeB64Url(attachment.inlineData)
  if (!attachment.attachmentId) return null
  const body = await gmailFetch(accessToken, `/messages/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(attachment.attachmentId)}`)
  return body.data ? decodeB64Url(String(body.data)) : null
}

export async function scanFinanceGmail(days = 8) {
  const connections = await getGmailConnections()
  const driveReady = financeGoogleReadiness().configured
  const summary = { accounts: connections.length, messages: 0, candidates: 0, attachmentsUploaded: 0, errors: [] as string[] }

  for (const connection of connections) {
    try {
      const accessToken = await getGmailAccessToken(connection)
      const q = encodeURIComponent(`newer_than:${Math.max(1,days)}d (factura OR invoice OR receipt OR recibo OR has:attachment)`)
      const list = await gmailFetch(accessToken, `/messages?q=${q}&maxResults=100`)
      for (const item of list.messages || []) {
        summary.messages += 1
        try {
          const message = await gmailFetch(accessToken, `/messages/${encodeURIComponent(item.id)}?format=full`)
          const headers = message.payload?.headers || []
          const subject = header(headers, 'Subject')
          const from = header(headers, 'From')
          const date = parseDate(header(headers, 'Date'))
          const textParts: string[] = []
          const attachments: Attachment[] = []
          walkParts(message.payload || {}, textParts, attachments)
          const plainText = textParts.join('\n').slice(0, 80_000)
          const amount = parseAmount(`${subject}\n${plainText}`)
          const vat = parseVat(`${subject}\n${plainText}`)
          const vendor = vendorFromFrom(from)
          const number = invoiceNumber(subject, plainText)
          const subtotal = amount.amount && vat.amount ? Math.max(0, Math.round((amount.amount - vat.amount) * 100) / 100) : amount.amount
          const duplicateKey = createHash('sha256').update([connection.provider_subject || connection.display_name || '',vendor,number,date,amount.amount,amount.currency].join('|').toLowerCase()).digest('hex')
          const driveFiles: Array<{ id: string; name: string; url?: string }> = []

          if (driveReady && attachments.length) {
            const folder = await ensureFinancePath(['02 Facturas recibidas y gastos', date.slice(0,4), quarter(date)])
            for (const attachment of attachments.slice(0,5)) {
              if (!/pdf|image|spreadsheet|excel|octet-stream/i.test(attachment.mimeType) && !/\.pdf$|\.png$|\.jpe?g$|\.xlsx?$/i.test(attachment.filename)) continue
              const bytes = await attachmentBytes(accessToken, String(item.id), attachment)
              if (!bytes) continue
              const uploaded = await uploadBinaryFile(folder.id, attachment.filename || `adjunto-${item.id}`, attachment.mimeType || 'application/octet-stream', bytes)
              driveFiles.push({ id: uploaded.id, name: uploaded.name || attachment.filename, url: uploaded.webViewLink })
              summary.attachmentsUploaded += 1
            }
          }

          const confidence = Math.min(0.99, 0.45 + (amount.amount > 0 ? 0.2 : 0) + (number ? 0.12 : 0) + (attachments.length ? 0.12 : 0) + (vat.amount > 0 ? 0.06 : 0))
          await upsertGrowthRow('finance_import_candidates', {
            candidate_id: `candidate_${randomUUID().replaceAll('-', '').slice(0,16)}`,
            tenant_id: 'sc-analytics',
            source_provider: 'gmail',
            source_account: String(connection.provider_subject || connection.display_name || ''),
            source_message_id: String(item.id),
            source_thread_id: String(message.threadId || ''),
            source_url: `https://mail.google.com/mail/u/0/#search/rfc822msgid:${encodeURIComponent(header(headers,'Message-ID'))}`,
            candidate_type: 'expense',
            extracted_data: {
              vendor, invoice_number: number, expense_date: date, currency: amount.currency,
              subtotal, tax: vat.amount, vat_rate: vat.rate, total: amount.amount,
              category: categoryFor(vendor,subject), subject, from,
              attachment_files: driveFiles,
              snippet: String(message.snippet || '').slice(0,1000),
            },
            confidence,
            duplicate_key: duplicateKey,
            status: 'pending_review',
            updated_at: new Date().toISOString(),
          }, 'tenant_id,source_provider,source_account,source_message_id')
          summary.candidates += 1
        } catch (error) {
          summary.errors.push(`${connection.display_name || 'gmail'}:${item.id}:${error instanceof Error ? error.message : String(error)}`)
        }
      }
    } catch (error) {
      summary.errors.push(`${connection.display_name || 'gmail'}:${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return summary
}
