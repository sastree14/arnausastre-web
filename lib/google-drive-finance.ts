import 'server-only'

import { getCorporateGoogleAccessToken, getCorporateGoogleConnection, gmailOAuthReadiness } from '@/lib/google-oauth-finance'
import { updateGrowthRow } from '@/lib/supabase-growth'

const FOLDER_MIME = 'application/vnd.google-apps.folder'
const SHEET_MIME = 'application/vnd.google-apps.spreadsheet'

export type DriveFile = { id: string; name?: string; mimeType?: string; webViewLink?: string; parents?: string[] }
type FinanceDriveMetadata = { root_id: string; finance_id: string; initialized_at: string }

async function token() { return getCorporateGoogleAccessToken() }

async function googleFetch(url: string, init: RequestInit = {}) {
  const accessToken = await token()
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, ...(init.headers || {}) },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Google API ${response.status}: ${(await response.text()).slice(0, 1000)}`)
  return response
}

function escapeQuery(value: string) { return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'") }

export function financeGoogleReadiness() {
  const oauth = gmailOAuthReadiness()
  return { configured: oauth.configured, missing: oauth.missing, redirectUri: oauth.redirectUri }
}

async function findTopLevelFolder(name: string): Promise<DriveFile | null> {
  const url = new URL('https://www.googleapis.com/drive/v3/files')
  url.searchParams.set('q', `name='${escapeQuery(name)}' and mimeType='${FOLDER_MIME}' and trashed=false`)
  url.searchParams.set('fields', 'files(id,name,mimeType,webViewLink,parents)')
  url.searchParams.set('pageSize', '20')
  const response = await googleFetch(url.toString())
  const body = await response.json() as { files?: DriveFile[] }
  return body.files?.[0] || null
}

async function createTopLevelFolder(name: string): Promise<DriveFile> {
  const response = await googleFetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink,parents', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, mimeType: FOLDER_MIME }),
  })
  return response.json() as Promise<DriveFile>
}

export async function findChild(parentId: string, name: string, mimeType?: string): Promise<DriveFile | null> {
  const clauses = [`'${escapeQuery(parentId)}' in parents`, `name='${escapeQuery(name)}'`, 'trashed=false']
  if (mimeType) clauses.push(`mimeType='${escapeQuery(mimeType)}'`)
  const url = new URL('https://www.googleapis.com/drive/v3/files')
  url.searchParams.set('q', clauses.join(' and '))
  url.searchParams.set('fields', 'files(id,name,mimeType,webViewLink,parents)')
  url.searchParams.set('pageSize', '20')
  url.searchParams.set('supportsAllDrives', 'true')
  url.searchParams.set('includeItemsFromAllDrives', 'true')
  const response = await googleFetch(url.toString())
  const body = await response.json() as { files?: DriveFile[] }
  return body.files?.[0] || null
}

export async function createDriveFolder(parentId: string, name: string): Promise<DriveFile> {
  const response = await googleFetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink,parents&supportsAllDrives=true', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, mimeType: FOLDER_MIME, parents: [parentId] }),
  })
  return response.json() as Promise<DriveFile>
}

export async function ensureFolder(parentId: string, name: string) { return (await findChild(parentId, name, FOLDER_MIME)) || createDriveFolder(parentId, name) }

export async function ensureFinanceRoot() {
  const connection = await getCorporateGoogleConnection()
  if (!connection) throw new Error('Connect the corporate Google Workspace account before using Finance Drive.')
  const metadata = connection.metadata && typeof connection.metadata === 'object' ? connection.metadata as Record<string, unknown> : {}
  const remembered = metadata.finance_drive as FinanceDriveMetadata | undefined
  if (remembered?.finance_id) return { id: remembered.finance_id, name: 'Finance', mimeType: FOLDER_MIME } as DriveFile
  const root = (await findTopLevelFolder('SC-Analytics')) || await createTopLevelFolder('SC-Analytics')
  const finance = await ensureFolder(root.id, 'Finance')
  const financeDrive: FinanceDriveMetadata = { root_id: root.id, finance_id: finance.id, initialized_at: new Date().toISOString() }
  await updateGrowthRow('integration_connections', 'connection_id', String(connection.connection_id), { metadata: { ...metadata, finance_drive: financeDrive }, updated_at: new Date().toISOString() })
  return finance
}

export async function ensureFinancePath(parts: string[]) {
  let current = await ensureFinanceRoot()
  for (const part of parts) current = await ensureFolder(current.id, part)
  return current
}

export async function createSpreadsheet(parentId: string, name: string): Promise<DriveFile> {
  const response = await googleFetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink,parents&supportsAllDrives=true', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, mimeType: SHEET_MIME, parents: [parentId] }),
  })
  return response.json() as Promise<DriveFile>
}

export async function ensureSpreadsheet(parentId: string, name: string) { return (await findChild(parentId, name, SHEET_MIME)) || createSpreadsheet(parentId, name) }

async function sheetMetadata(spreadsheetId: string) {
  const response = await googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=sheets.properties`)
  return response.json() as Promise<{ sheets?: Array<{ properties?: { sheetId?: number; title?: string } }> }>
}

export async function replaceSpreadsheetValues(spreadsheetId: string, title: string, rows: unknown[][]) {
  const metadata = await sheetMetadata(spreadsheetId)
  const first = metadata.sheets?.[0]?.properties
  const sheetId = Number(first?.sheetId || 0)
  const existingTitle = String(first?.title || 'Sheet1')
  if (existingTitle !== title) {
    await googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}:batchUpdate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requests: [{ updateSheetProperties: { properties: { sheetId, title }, fields: 'title' } }] }),
    })
  }
  await googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(`${title}!A:Z`)}:clear`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
  if (rows.length) {
    await googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(`${title}!A1`)}?valueInputOption=USER_ENTERED`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ range: `${title}!A1`, majorDimension: 'ROWS', values: rows }),
    })
  }
  await googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}:batchUpdate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requests: [
      { updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } },
      { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1 }, cell: { userEnteredFormat: { textFormat: { bold: true } } }, fields: 'userEnteredFormat.textFormat.bold' } },
      { autoResizeDimensions: { dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: Math.max(1, Math.min(26, rows[0]?.length || 1)) } } },
    ] }),
  })
}

export async function exportDriveFile(fileId: string, mimeType: string): Promise<Buffer> {
  const url = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/export`)
  url.searchParams.set('mimeType', mimeType)
  const response = await googleFetch(url.toString())
  return Buffer.from(await response.arrayBuffer())
}

export async function uploadBinaryFile(parentId: string, name: string, mimeType: string, bytes: Buffer): Promise<DriveFile> {
  const boundary = `finance_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const metadata = JSON.stringify({ name, mimeType, parents: [parentId] })
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`), bytes, Buffer.from(`\r\n--${boundary}--`),
  ])
  const response = await googleFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,parents&supportsAllDrives=true', {
    method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body,
  })
  return response.json() as Promise<DriveFile>
}

export async function getDriveFile(fileId: string): Promise<DriveFile> {
  const response = await googleFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,webViewLink,parents&supportsAllDrives=true`)
  return response.json() as Promise<DriveFile>
}
