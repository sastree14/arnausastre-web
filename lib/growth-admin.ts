import 'server-only'

import { cookies } from 'next/headers'

const COOKIE_NAME = 'sc_growth_admin'

export interface GrowthPerson {
  person_id?: string
  name?: string
  role?: string
  linkedin_url?: string
}

export interface GrowthApprovalPayload {
  execution_mode?: string
  company_id?: string
  company?: string
  website?: string
  linkedin_search_url?: string
  message?: string
  person?: GrowthPerson | null
  [key: string]: unknown
}

export interface GrowthApproval {
  approval_id: string
  tenant_id: string
  action_type: string
  target_id: string
  summary: string
  status: string
  payload?: GrowthApprovalPayload | null
  created_at?: string
  decided_at?: string | null
  executed_at?: string | null
}

export interface GrowthContentItem {
  content_id: string
  title: string
  status: string
  channel: string
  visual_type: string
  body?: string
  visual_path?: string
  source_case?: string
}

export interface GrowthCompany {
  company_id: string
  name: string
  website: string
  score: number | string
  score_reason?: string
  fit_type?: string
  country?: string
  industry?: string
}

export interface GrowthWeeklyPlan {
  plan_id: string
  week_start: string
  primary_goal: string
  commercial_focus?: { channel?: string; [key: string]: unknown }
  content_focus?: { objective?: string; [key: string]: unknown }
}

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
  return response.json() as Promise<T[]>
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
  const rows = await response.json() as T[]
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
  const rows = await response.json() as T[]
  return rows[0] || null
}

export function getPendingApprovals() {
  return queryGrowthTable<GrowthApproval>('approvals', { status: 'eq.pending', order: 'created_at.desc' })
}

export async function getReadyManualActions() {
  const rows = await queryGrowthTable<GrowthApproval>('approvals', { status: 'eq.approved', order: 'decided_at.desc' })
  return rows.filter((row) => row.payload?.execution_mode === 'manual_linkedin_action')
}

export function getRecentContent() {
  return queryGrowthTable<GrowthContentItem>('content_items', { order: 'created_at.desc', limit: '20' })
}

export function getTopCompanies() {
  return queryGrowthTable<GrowthCompany>('companies', { order: 'score.desc', limit: '30' })
}

export function getRecentPlans() {
  return queryGrowthTable<GrowthWeeklyPlan>('weekly_plans', { order: 'week_start.desc', limit: '4' })
}
