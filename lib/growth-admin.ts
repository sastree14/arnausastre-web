import 'server-only'

import { cookies } from 'next/headers'

const COOKIE_NAME = 'sc_growth_admin'

function env(name: string): string {
  return (process.env[name] || '').trim()
}

export async function isGrowthAdminAuthenticated(): Promise<boolean> {
  const token = env('GROWTH_ADMIN_TOKEN')
  if (!token) return false
  const store = await cookies()
  return store.get(COOKIE_NAME)?.value === token
}

export function growthAdminCookieName(): string {
  return COOKIE_NAME
}

function supabaseHeaders(): Record<string, string> {
  const key = env('SUPABASE_SERVICE_ROLE_KEY')
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}

function supabaseUrl(): string {
  const url = env('SUPABASE_URL').replace(/\/$/, '')
  if (!url) throw new Error('SUPABASE_URL is not configured')
  return url
}

export async function queryGrowthTable<T>(table: string, params: Record<string, string> = {}): Promise<T[]> {
  const url = new URL(`${supabaseUrl()}/rest/v1/${table}`)
  url.searchParams.set('select', '*')
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  const response = await fetch(url, { headers: supabaseHeaders(), cache: 'no-store' })
  if (!response.ok) throw new Error(`Supabase ${table} query failed: ${response.status}`)
  return response.json()
}

export async function updateGrowthRow<T>(table: string, key: string, value: string, changes: Record<string, unknown>): Promise<T | null> {
  const url = new URL(`${supabaseUrl()}/rest/v1/${table}`)
  url.searchParams.set(key, `eq.${value}`)
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { ...supabaseHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify(changes),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Supabase ${table} update failed: ${response.status}`)
  const rows = await response.json()
  return rows[0] || null
}

export async function insertGrowthRow<T>(table: string, row: Record<string, unknown>): Promise<T | null> {
  const response = await fetch(`${supabaseUrl()}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...supabaseHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify(row),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Supabase ${table} insert failed: ${response.status}`)
  const rows = await response.json()
  return rows[0] || null
}

export async function getPendingApprovals() {
  return queryGrowthTable<any>('approvals', { status: 'eq.pending', order: 'created_at.desc' })
}

export async function getReadyManualActions() {
  const rows = await queryGrowthTable<any>('approvals', { status: 'eq.approved', order: 'decided_at.desc' })
  return rows.filter((row: any) => row.payload?.execution_mode === 'manual_linkedin_action')
}

export async function getRecentContent() {
  return queryGrowthTable<any>('content_items', { order: 'created_at.desc', limit: '20' })
}

export async function getTopCompanies() {
  return queryGrowthTable<any>('companies', { order: 'score.desc', limit: '30' })
}

export async function getRecentPlans() {
  return queryGrowthTable<any>('weekly_plans', { order: 'week_start.desc', limit: '4' })
}
