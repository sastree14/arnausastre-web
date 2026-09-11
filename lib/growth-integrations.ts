import 'server-only'

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { queryGrowthTable, upsertGrowthRow, updateGrowthRow } from '@/lib/supabase-growth'

const TENANT_ID = 'sc-analytics'
const LINKEDIN_PROVIDER = 'linkedin'
const LINKEDIN_ACCOUNT_TYPE = 'member'

export interface IntegrationConnection {
  connection_id: string
  tenant_id: string
  provider: string
  account_type: string
  provider_subject: string
  display_name: string
  access_token_ciphertext: string
  token_expires_at?: string | null
  scopes?: string[]
  metadata?: Record<string, unknown>
  connected_at?: string
  updated_at?: string
}

function encryptionKey(): Buffer {
  const raw = (process.env.GROWTH_ENCRYPTION_KEY || '').trim()
  if (!raw) throw new Error('GROWTH_ENCRYPTION_KEY is not configured')
  const key = Buffer.from(raw, 'base64')
  if (key.length !== 32) throw new Error('GROWTH_ENCRYPTION_KEY must be exactly 32 random bytes encoded as base64')
  return key
}

export function encryptIntegrationSecret(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return ['v1', iv.toString('base64url'), tag.toString('base64url'), ciphertext.toString('base64url')].join('.')
}

export function decryptIntegrationSecret(value: string): string {
  const [version, ivRaw, tagRaw, cipherRaw] = value.split('.')
  if (version !== 'v1' || !ivRaw || !tagRaw || !cipherRaw) throw new Error('Unsupported encrypted secret format')
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivRaw, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(cipherRaw, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}

export async function getLinkedInConnection(): Promise<IntegrationConnection | null> {
  const rows = await queryGrowthTable<IntegrationConnection>('integration_connections', {
    tenant_id: `eq.${TENANT_ID}`,
    provider: `eq.${LINKEDIN_PROVIDER}`,
    account_type: `eq.${LINKEDIN_ACCOUNT_TYPE}`,
    order: 'updated_at.desc',
    limit: '1',
  })
  return rows[0] || null
}

export async function saveLinkedInConnection(input: {
  subject: string
  displayName: string
  accessToken: string
  expiresInSeconds?: number
  scopes: string[]
  metadata?: Record<string, unknown>
}): Promise<IntegrationConnection | null> {
  const now = new Date()
  const expires = input.expiresInSeconds
    ? new Date(now.getTime() + input.expiresInSeconds * 1000).toISOString()
    : null
  return upsertGrowthRow<IntegrationConnection>('integration_connections', {
    tenant_id: TENANT_ID,
    provider: LINKEDIN_PROVIDER,
    account_type: LINKEDIN_ACCOUNT_TYPE,
    provider_subject: input.subject,
    display_name: input.displayName,
    access_token_ciphertext: encryptIntegrationSecret(input.accessToken),
    token_expires_at: expires,
    scopes: input.scopes,
    metadata: input.metadata || {},
    connected_at: now.toISOString(),
    updated_at: now.toISOString(),
  }, 'tenant_id,provider,account_type,provider_subject')
}

export async function getLinkedInAccess(): Promise<{ token: string; personUrn: string; connection: IntegrationConnection }> {
  const connection = await getLinkedInConnection()
  if (!connection) throw new Error('LinkedIn is not connected')
  if (connection.token_expires_at && new Date(connection.token_expires_at).getTime() <= Date.now()) {
    throw new Error('LinkedIn access token has expired; reconnect LinkedIn')
  }
  const personUrn = String(connection.metadata?.person_urn || '')
  if (!personUrn) throw new Error('LinkedIn connection is missing person_urn')
  return {
    token: decryptIntegrationSecret(connection.access_token_ciphertext),
    personUrn,
    connection,
  }
}

export async function disconnectLinkedIn(): Promise<void> {
  const connection = await getLinkedInConnection()
  if (!connection) return
  await updateGrowthRow('integration_connections', 'connection_id', connection.connection_id, {
    access_token_ciphertext: 'disconnected',
    token_expires_at: new Date(0).toISOString(),
    updated_at: new Date().toISOString(),
    metadata: { ...(connection.metadata || {}), disconnected: true },
  })
}

export function linkedInConnectionStatus(connection: IntegrationConnection | null) {
  if (!connection) return { connected: false, expired: false }
  const disconnected = Boolean(connection.metadata?.disconnected)
  const expired = disconnected || Boolean(connection.token_expires_at && new Date(connection.token_expires_at).getTime() <= Date.now())
  return { connected: !expired, expired }
}
