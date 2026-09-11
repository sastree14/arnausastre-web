import 'server-only'

import { cookies } from 'next/headers'
import { insertGrowthRow, queryGrowthTable, updateGrowthRow } from '@/lib/supabase-growth'

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
  language?: string
  family?: string
  quality_score?: number
  brief_id?: string
  source_urls?: string[]
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
  brief_id?: string
  language?: string
  content_family?: string
  quality_score?: number | string
  source_url?: string
}

export interface GrowthEditorialBrief {
  brief_id: string
  canonical_title: string
  family: string
  thesis?: string
  business_problem?: string
  output_decision: string
  primary_linkedin_language?: string
  weighted_score?: number | string
  visual?: { type?: string; needed?: boolean; [key: string]: unknown }
  research?: { source_urls?: string[]; [key: string]: unknown }
  status: string
  created_at?: string
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

export { queryGrowthTable, updateGrowthRow, insertGrowthRow }

export function getPendingApprovals() {
  return queryGrowthTable<GrowthApproval>('approvals', { status: 'eq.pending', order: 'created_at.desc' })
}

export async function getReadyManualActions() {
  const rows = await queryGrowthTable<GrowthApproval>('approvals', { status: 'eq.approved', order: 'decided_at.desc' })
  return rows.filter((row) => row.payload?.execution_mode === 'manual_linkedin_action')
}

export function getRecentContent() {
  return queryGrowthTable<GrowthContentItem>('content_items', { order: 'created_at.desc', limit: '40' })
}

export function getRecentEditorialBriefs() {
  return queryGrowthTable<GrowthEditorialBrief>('editorial_briefs', { order: 'created_at.desc', limit: '20' })
}

export function getTopCompanies() {
  return queryGrowthTable<GrowthCompany>('companies', { order: 'score.desc', limit: '30' })
}

export function getRecentPlans() {
  return queryGrowthTable<GrowthWeeklyPlan>('weekly_plans', { order: 'week_start.desc', limit: '4' })
}
