import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'
import { decryptIntegrationSecret, encryptIntegrationSecret, encryptionConfigured } from '@/lib/integration-secrets'
import { queryGrowthTable, updateGrowthRow } from '@/lib/supabase-growth'

type Connection = Record<string, any>

function env(name: string) { return (process.env[name] || '').trim() }

export function gmailOAuthReadiness() {
  const required = ['GOOGLE_OAUTH_CLIENT_ID','GOOGLE_OAUTH_CLIENT_SECRET','GOOGLE_OAUTH_REDIRECT_URI','GROWTH_ENCRYPTION_KEY']
  const missing = required.filter((name) => !env(name))
  if (!encryptionConfigured() && !missing.includes('GROWTH_ENCRYPTION_KEY')) missing.push('GROWTH_ENCRYPTION_KEY')
  return { configured: missing.length === 0, missing }
}

function stateSecret() {
  const value = env('GROWTH_ADMIN_TOKEN')
  if (!value) throw new Error('GROWTH_ADMIN_TOKEN is not configured')
  return value
}

export function createGoogleOAuthState(accountType: string) {
  const payload = Buffer.from(JSON.stringify({ accountType, ts: Date.now() })).toString('base64url')
  const signature = createHmac('sha256', stateSecret()).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function verifyGoogleOAuthState(value: string) {
  const [payload, signature] = value.split('.')
  if (!payload || !signature) throw new Error('Invalid OAuth state')
  const expected = createHmac('sha256', stateSecret()).update(payload).digest('base64url')
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a,b)) throw new Error('Invalid OAuth state signature')
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { accountType?: string; ts?: number }
  if (!decoded.ts || Math.abs(Date.now() - decoded.ts) > 15 * 60 * 1000) throw new Error('Expired OAuth state')
  return decoded
}

export function gmailAuthorizationUrl(accountType: string) {
  const ready = gmailOAuthReadiness()
  if (!ready.configured) throw new Error(`Google OAuth is not configured: ${ready.missing.join(', ')}`)
  const corporate = accountType !== 'personal'
  const scopes = [
    'openid',
    'email',
    'https://www.googleapis.com/auth/gmail.readonly',
    ...(corporate ? [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ] : []),
  ]
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', env('GOOGLE_OAUTH_CLIENT_ID'))
  url.searchParams.set('redirect_uri', env('GOOGLE_OAUTH_REDIRECT_URI'))
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('include_granted_scopes', 'true')
  url.searchParams.set('scope', scopes.join(' '))
  url.searchParams.set('state', createGoogleOAuthState(accountType))
  return url.toString()
}

export async function exchangeGoogleCode(code: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env('GOOGLE_OAUTH_CLIENT_ID'),
      client_secret: env('GOOGLE_OAUTH_CLIENT_SECRET'),
      redirect_uri: env('GOOGLE_OAUTH_REDIRECT_URI'),
      grant_type: 'authorization_code',
    }),
    cache: 'no-store',
  })
  const body = await response.json() as Record<string, any>
  if (!response.ok || !body.access_token) throw new Error(`Google OAuth token exchange failed: ${body.error_description || body.error || response.status}`)
  return body
}

export async function gmailProfile(accessToken: string) {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' })
  const body = await response.json() as Record<string, any>
  if (!response.ok) throw new Error(`Gmail profile failed: ${response.status}`)
  return body
}

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: env('GOOGLE_OAUTH_CLIENT_ID'),
      client_secret: env('GOOGLE_OAUTH_CLIENT_SECRET'),
      grant_type: 'refresh_token',
    }),
    cache: 'no-store',
  })
  const body = await response.json() as Record<string, any>
  if (!response.ok || !body.access_token) throw new Error(`Google token refresh failed: ${body.error_description || body.error || response.status}`)
  return body
}

export async function getGmailAccessToken(connection: Connection) {
  const expiry = connection.token_expires_at ? new Date(String(connection.token_expires_at)).getTime() : 0
  if (connection.access_token_ciphertext && expiry > Date.now() + 120_000) return decryptIntegrationSecret(String(connection.access_token_ciphertext))
  if (!connection.refresh_token_ciphertext) throw new Error(`Google connection ${connection.display_name || connection.connection_id} has no refresh token`)
  const refreshed = await refreshAccessToken(decryptIntegrationSecret(String(connection.refresh_token_ciphertext)))
  const expiresAt = new Date(Date.now() + Number(refreshed.expires_in || 3600) * 1000).toISOString()
  await updateGrowthRow('integration_connections', 'connection_id', String(connection.connection_id), {
    access_token_ciphertext: encryptIntegrationSecret(String(refreshed.access_token)),
    token_expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  })
  return String(refreshed.access_token)
}

export function encryptGoogleToken(value: string) { return encryptIntegrationSecret(value) }

export function getGmailConnections() {
  return queryGrowthTable<Connection>('integration_connections', { tenant_id: 'eq.sc-analytics', provider: 'eq.gmail', order: 'updated_at.desc', limit: '10' }, { cacheSeconds: 0 })
}

export async function getCorporateGoogleConnection() {
  const rows = await queryGrowthTable<Connection>('integration_connections', {
    tenant_id: 'eq.sc-analytics',
    provider: 'eq.gmail',
    account_type: 'eq.corporate',
    order: 'updated_at.desc',
    limit: '1',
  }, { cacheSeconds: 0 })
  return rows[0] || null
}

export async function getCorporateGoogleAccessToken() {
  const connection = await getCorporateGoogleConnection()
  if (!connection) throw new Error('Corporate Google Workspace account is not connected. Connect arnau.sastre@sc-analytics.io from Finance > Integrations.')
  const scopes = Array.isArray(connection.scopes) ? connection.scopes.map(String) : []
  const required = ['https://www.googleapis.com/auth/drive','https://www.googleapis.com/auth/spreadsheets']
  const missing = required.filter((scope)=>!scopes.includes(scope))
  if (missing.length) throw new Error('Corporate Google Workspace connection must be re-authorized with Drive and Sheets permissions.')
  return getGmailAccessToken(connection)
}
