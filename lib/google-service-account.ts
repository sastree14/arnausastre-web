import 'server-only'

import { createSign } from 'node:crypto'

type CachedToken = { accessToken: string; expiresAt: number; scopeKey: string }
let cached: CachedToken | null = null

function env(name: string) {
  return (process.env[name] || '').trim()
}

export function googleServiceAccountReadiness() {
  const required = [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
    'GOOGLE_DRIVE_FINANCE_FOLDER_ID',
  ]
  const missing = required.filter((name) => !env(name))
  return { configured: missing.length === 0, missing }
}

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url')
}

function privateKey() {
  const value = env('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
  if (!value) throw new Error('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY is not configured')
  return value.replace(/\\n/g, '\n')
}

export async function getGoogleServiceAccountAccessToken(scopes: string[]) {
  const readiness = googleServiceAccountReadiness()
  if (!readiness.configured) throw new Error(`Google service account is not configured: ${readiness.missing.join(', ')}`)

  const normalizedScopes = [...new Set(scopes)].sort()
  const scopeKey = normalizedScopes.join(' ')
  const now = Math.floor(Date.now() / 1000)
  if (cached && cached.scopeKey === scopeKey && cached.expiresAt - 60 > now) return cached.accessToken

  const email = env('GOOGLE_SERVICE_ACCOUNT_EMAIL')
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64url(JSON.stringify({
    iss: email,
    scope: scopeKey,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }))
  const unsigned = `${header}.${payload}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsigned)
  signer.end()
  const assertion = `${unsigned}.${signer.sign(privateKey()).toString('base64url')}`

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  })
  const body = await response.json() as { access_token?: string; expires_in?: number; error?: string; error_description?: string }
  if (!response.ok || !body.access_token) throw new Error(`Google service account token failed: ${body.error_description || body.error || response.status}`)
  cached = { accessToken: body.access_token, expiresAt: now + Number(body.expires_in || 3600), scopeKey }
  return cached.accessToken
}

export function financeDriveRootId() {
  const value = env('GOOGLE_DRIVE_FINANCE_FOLDER_ID')
  if (!value) throw new Error('GOOGLE_DRIVE_FINANCE_FOLDER_ID is not configured')
  return value
}
