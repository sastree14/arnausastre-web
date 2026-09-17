import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'
import { decryptIntegrationSecret, encryptIntegrationSecret, encryptionConfigured } from '@/lib/integration-secrets'
import { queryGrowthTable, updateGrowthRow } from '@/lib/supabase-growth'

type Connection = Record<string, unknown>
const env = (name: string) => (process.env[name] || '').trim()
const firstEnv = (...names: string[]) => names.map(env).find(Boolean) || ''

export const CORPORATE_GOOGLE_EMAIL = 'arnau.sastre@sc-analytics.io'

export const GOOGLE_SCOPES = {
  personal: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/gmail.readonly'],
  corporate: [
    'openid', 'email', 'profile',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
  ],
} as const

export function googleOAuthConfig(origin = '') {
  const clientId = firstEnv('GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_CLIENT_ID')
  const clientSecret = firstEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'GOOGLE_CLIENT_SECRET')
  const configuredRedirect = env('GOOGLE_OAUTH_REDIRECT_URI')
  const redirectUri = configuredRedirect || (origin ? `${origin}/api/growth-admin/google/callback` : '')
  const missing: string[] = []
  if (!clientId) missing.push('GOOGLE_OAUTH_CLIENT_ID / GOOGLE_CLIENT_ID')
  if (!clientSecret) missing.push('GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_CLIENT_SECRET')
  if (!env('GROWTH_ENCRYPTION_KEY') || !encryptionConfigured()) missing.push('GROWTH_ENCRYPTION_KEY')
  return { clientId, clientSecret, redirectUri, configured: missing.length === 0, missing, redirectMode: configuredRedirect ? 'env' as const : 'runtime' as const }
}

export function gmailOAuthReadiness(origin = '') {
  const config = googleOAuthConfig(origin)
  return { configured: config.configured, missing: config.missing, redirectUri: config.redirectUri, redirectMode: config.redirectMode }
}

function stateSecret() {
  const value = env('GROWTH_ADMIN_TOKEN')
  if (!value) throw new Error('GROWTH_ADMIN_TOKEN is not configured')
  return value
}

export function createGoogleOAuthState(accountType: string, returnTo = '', redirectUri = '') {
  const safeReturn = returnTo.startsWith('/growth-admin/') ? returnTo : ''
  const payload = Buffer.from(JSON.stringify({ accountType, returnTo: safeReturn, redirectUri, ts: Date.now() })).toString('base64url')
  const signature = createHmac('sha256', stateSecret()).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function verifyGoogleOAuthState(value: string) {
  const [payload, signature] = value.split('.')
  if (!payload || !signature) throw new Error('Invalid OAuth state')
  const expected = createHmac('sha256', stateSecret()).update(payload).digest('base64url')
  const a = Buffer.from(signature), b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error('Invalid OAuth state signature')
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { accountType?: string; returnTo?: string; redirectUri?: string; ts?: number }
  if (!decoded.ts || Math.abs(Date.now() - decoded.ts) > 15 * 60 * 1000) throw new Error('Expired OAuth state')
  return decoded
}

export function gmailAuthorizationUrl(accountType: string, returnTo = '', origin = '') {
  const config = googleOAuthConfig(origin)
  if (!config.configured) throw new Error(`Google OAuth is not configured: ${config.missing.join(', ')}`)
  if (!config.redirectUri) throw new Error('Google OAuth callback URL could not be resolved')
  const kind = accountType === 'personal' ? 'personal' : 'corporate'
  const scopes = GOOGLE_SCOPES[kind]
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('redirect_uri', config.redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent select_account')
  url.searchParams.set('include_granted_scopes', 'true')
  url.searchParams.set('scope', scopes.join(' '))
  url.searchParams.set('state', createGoogleOAuthState(kind, returnTo, config.redirectUri))
  return url.toString()
}

export async function exchangeGoogleCode(code: string, redirectUri = '') {
  const config = googleOAuthConfig()
  const actualRedirect = redirectUri || config.redirectUri
  if (!config.clientId || !config.clientSecret || !actualRedirect) throw new Error('Google OAuth configuration is incomplete')
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: actualRedirect, grant_type: 'authorization_code' }), cache: 'no-store',
  })
  const body = await response.json() as Record<string, unknown>
  if (!response.ok || !body.access_token) throw new Error(`Google OAuth token exchange failed: ${String(body.error_description || body.error || response.status)}`)
  return body
}

export async function gmailProfile(accessToken: string) {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' })
  const body = await response.json() as Record<string, unknown>
  if (!response.ok) throw new Error(`Gmail profile failed: ${response.status}`)
  return body
}

async function refreshAccessToken(refreshToken: string) {
  const config = googleOAuthConfig()
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ refresh_token: refreshToken, client_id: config.clientId, client_secret: config.clientSecret, grant_type: 'refresh_token' }), cache: 'no-store',
  })
  const body = await response.json() as Record<string, unknown>
  if (!response.ok || !body.access_token) throw new Error(`Google token refresh failed: ${String(body.error_description || body.error || response.status)}`)
  return body
}

export async function getGmailAccessToken(connection: Connection) {
  const expiry = connection.token_expires_at ? new Date(String(connection.token_expires_at)).getTime() : 0
  if (connection.access_token_ciphertext && expiry > Date.now() + 120000) return decryptIntegrationSecret(String(connection.access_token_ciphertext))
  if (!connection.refresh_token_ciphertext) throw new Error(`Google connection ${String(connection.display_name || connection.connection_id)} has no refresh token`)
  const refreshed = await refreshAccessToken(decryptIntegrationSecret(String(connection.refresh_token_ciphertext)))
  const expiresAt = new Date(Date.now() + Number(refreshed.expires_in || 3600) * 1000).toISOString()
  await updateGrowthRow('integration_connections', 'connection_id', String(connection.connection_id), { access_token_ciphertext: encryptIntegrationSecret(String(refreshed.access_token)), token_expires_at: expiresAt, updated_at: new Date().toISOString() })
  return String(refreshed.access_token)
}

export function encryptGoogleToken(value: string) { return encryptIntegrationSecret(value) }
export function getGmailConnections() { return queryGrowthTable<Connection>('integration_connections', { tenant_id: 'eq.sc-analytics', provider: 'eq.gmail', order: 'updated_at.desc', limit: '10' }, { cacheSeconds: 0 }) }
export async function getCorporateGoogleConnection() {
  const rows = await queryGrowthTable<Connection>('integration_connections', { tenant_id: 'eq.sc-analytics', provider: 'eq.gmail', account_type: 'eq.corporate', order: 'updated_at.desc', limit: '1' }, { cacheSeconds: 0 })
  return rows[0] || null
}
export async function getCorporateGoogleAccessToken() {
  const connection = await getCorporateGoogleConnection()
  if (!connection) throw new Error(`Corporate Google Workspace account is not connected. Connect ${CORPORATE_GOOGLE_EMAIL} from the CRM.`)
  const connectedEmail = String(connection.provider_subject || connection.display_name || '').toLowerCase()
  if (connectedEmail && connectedEmail !== CORPORATE_GOOGLE_EMAIL) throw new Error(`The corporate Google connection is ${connectedEmail}; reconnect ${CORPORATE_GOOGLE_EMAIL} as the corporate account.`)
  const scopes = Array.isArray(connection.scopes) ? connection.scopes.map(String) : []
  const required = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']
  const missing = required.filter((scope) => !scopes.includes(scope))
  if (missing.length) throw new Error('Corporate Google Workspace connection must be re-authorized with Drive and Sheets permissions.')
  return getGmailAccessToken(connection)
}
