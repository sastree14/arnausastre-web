import 'server-only'

import { getCorporateGoogleAccessToken, getCorporateGoogleConnection } from '@/lib/google-oauth-finance'
import { updateGrowthRow } from '@/lib/supabase-growth'

type DriveFile = { id: string; name: string; mimeType?: string; webViewLink?: string; parents?: string[] }
type DriveStructure = {
  root_id: string
  operations_id: string
  sops_id: string
  templates_id: string
  proposals_id: string
  budgets_id: string
  initialized_at: string
}

async function driveFetch(path: string, init: RequestInit = {}) {
  const token = await getCorporateGoogleAccessToken()
  const response = await fetch(`https://www.googleapis.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init.headers || {}) },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Google Drive API ${response.status}: ${(await response.text()).slice(0, 500)}`)
  return response
}

function q(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")
}

async function findFolder(name: string, parentId?: string) {
  const clauses = [`name='${q(name)}'`, "mimeType='application/vnd.google-apps.folder'", 'trashed=false']
  if (parentId) clauses.push(`'${q(parentId)}' in parents`)
  const params = new URLSearchParams({ q: clauses.join(' and '), fields: 'files(id,name,mimeType,webViewLink,parents)', pageSize: '10' })
  const response = await driveFetch(`/drive/v3/files?${params}`)
  const data = await response.json() as { files?: DriveFile[] }
  return data.files?.[0] || null
}

async function createFolder(name: string, parentId?: string) {
  const response = await driveFetch('/drive/v3/files?fields=id,name,mimeType,webViewLink,parents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', ...(parentId ? { parents: [parentId] } : {}) }),
  })
  return response.json() as Promise<DriveFile>
}

async function ensureFolder(name: string, parentId?: string) {
  return (await findFolder(name, parentId)) || createFolder(name, parentId)
}

export async function ensureOperationsDriveStructure(): Promise<DriveStructure> {
  const connection = await getCorporateGoogleConnection()
  if (!connection) throw new Error('Conecta primero la cuenta corporativa de Google Workspace.')
  const root = await ensureFolder('SC-Analytics')
  const operations = await ensureFolder('Operations', root.id)
  const [sops, templates, proposals, budgets] = await Promise.all([
    ensureFolder('SOPs', operations.id),
    ensureFolder('Templates', operations.id),
    ensureFolder('Proposals', operations.id),
    ensureFolder('Budgets', operations.id),
  ])
  const structure: DriveStructure = {
    root_id: root.id,
    operations_id: operations.id,
    sops_id: sops.id,
    templates_id: templates.id,
    proposals_id: proposals.id,
    budgets_id: budgets.id,
    initialized_at: new Date().toISOString(),
  }
  const metadata = connection.metadata && typeof connection.metadata === 'object' ? connection.metadata as Record<string, unknown> : {}
  await updateGrowthRow('integration_connections', 'connection_id', String(connection.connection_id), { metadata: { ...metadata, operations_drive: structure }, updated_at: new Date().toISOString() })
  return structure
}

export function driveFolderUrl(id?: string | null) {
  return id ? `https://drive.google.com/drive/folders/${encodeURIComponent(id)}` : ''
}

async function uploadConverted(name: string, parentId: string, targetMimeType: string, sourceMimeType: string, body: string) {
  const token = await getCorporateGoogleAccessToken()
  const boundary = `sc_analytics_${Date.now()}_${Math.random().toString(16).slice(2)}`
  const metadata = JSON.stringify({ name, mimeType: targetMimeType, parents: [parentId] })
  const payload = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${sourceMimeType}; charset=UTF-8\r\n\r\n${body}\r\n--${boundary}--`
  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body: payload,
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Google Drive upload ${response.status}: ${(await response.text()).slice(0, 500)}`)
  return response.json() as Promise<DriveFile>
}

export async function createProposalDocument(name: string, html: string) {
  const folders = await ensureOperationsDriveStructure()
  return uploadConverted(name, folders.proposals_id, 'application/vnd.google-apps.document', 'text/html', html)
}

export async function createBudgetSheet(name: string, csv: string) {
  const folders = await ensureOperationsDriveStructure()
  return uploadConverted(name, folders.budgets_id, 'application/vnd.google-apps.spreadsheet', 'text/csv', csv)
}

export async function getOperationsDriveStructure() {
  const connection = await getCorporateGoogleConnection()
  const metadata = connection?.metadata && typeof connection.metadata === 'object' ? connection.metadata as Record<string, unknown> : {}
  return { connection, structure: (metadata.operations_drive || null) as DriveStructure | null }
}
