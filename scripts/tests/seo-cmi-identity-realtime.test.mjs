import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const code=path=>readFileSync(new URL('../../'+path,import.meta.url),'utf8')
test('CRM invalidation uses authenticated same-origin endpoint, not public Supabase WebSocket',()=>{
  const client=code('components/growth-admin/SupabaseRealtimeInvalidator.tsx')
  const route=code('app/api/growth-admin/realtime-state/route.ts')
  assert.match(client,/fetch\('\/api\/growth-admin\/realtime-state'/)
  assert.doesNotMatch(client,/new WebSocket|publishableKey|apikey/)
  assert.match(client,/CRM_REALTIME_EVENT/)
  assert.match(route,/isGrowthAdminAuthenticated\(\)/)
  assert.match(route,/tenant_id:'eq.sc-analytics'/)
  assert.match(route,/Cache-Control':'no-store/)
  assert.doesNotMatch(route,/SUPABASE_SECRET_KEY|service_role/)
})
test('corporate Google OAuth sign-in requests identity only and preserves Gmail integration',()=>{
  const start=code('app/api/growth-admin/identity/start/route.ts')
  const callback=code('app/api/growth-admin/identity/callback/route.ts')
  const gmail=code('app/api/google/gmail/callback/route.ts')
  assert.match(start,/scope','openid email profile'/)
  assert.doesNotMatch(start,/gmail\.readonly|spreadsheets|calendar\.events|\/auth\/drive/)
  assert.match(callback,/email_verified/)
  assert.match(callback,/CORPORATE_GOOGLE_EMAIL/)
  assert.match(callback,/createIdentitySession/)
  assert.match(gmail,/returnedState\.startsWith\('sc-growth-login\.'/)
  assert.match(gmail,/\/api\/growth-admin\/identity\/callback/)
})
test('identity sessions are random, hashed, revocable and fail closed if the DB is down',()=>{
  const auth=code('lib/security/admin-identity.ts')
  const guard=code('lib/growth-admin.ts')
  const logout=code('app/api/growth-admin/logout/route.ts')
  assert.match(auth,/randomBytes\(48\)/)
  assert.match(auth,/hashIdentityToken/)
  assert.match(auth,/security_admin_sessions/)
  assert.match(auth,/revoked_at:'is.null'/)
  assert.match(auth,/return null \/\/ Fail closed/)
  assert.match(guard,/googleOnlyMode\(\)/)
  assert.match(guard,/getIdentitySession\(\)/)
  assert.match(logout,/revokeIdentitySession\(\)/)
})
test('legacy shared token can be disabled after the owner tests Google 2FA',()=>{
  const login=code('app/api/growth-admin/login/route.ts')
  const page=code('app/growth-admin/login/page.tsx')
  assert.match(login,/googleOnlyMode\(\)/)
  assert.match(page,/googleOnly/)
  assert.match(page,/api\/growth-admin\/identity\/start/)
})

test('corporate Google login never redirects from www to apex (Vercel redirects apex to www)',()=>{
  const loginStart=code('app/api/growth-admin/identity/start/route.ts')
  const config=code('lib/google-oauth-finance.ts')
  const state=code('lib/security/admin-identity.ts')
  assert.doesNotMatch(loginStart,/const canonical='https:\/\/sc-analytics\.io'/)
  assert.doesNotMatch(loginStart,/NextResponse\.redirect\(new URL\('\/api\/growth-admin\/identity\/start',canonical\)/)
  assert.match(loginStart,/const origin=new URL\(request\.url\)\.origin/)
  assert.match(loginStart,/response\.cookies\.set\(IDENTITY_STATE_COOKIE,nonce/)
  assert.match(state,/__Host-sc_growth_login_state/)
  // The existing Google Cloud redirect URI remains unchanged; only the
  // initiating request is now kept on Vercel's browser-facing www hostname.
  assert.match(config,/const productionRedirect = 'https:\/\/sc-analytics\.io\/api\/google\/gmail\/callback'/)
})
