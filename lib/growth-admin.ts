import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { insertGrowthRow, queryGrowthTable, updateGrowthRow } from '@/lib/supabase-growth'
import type { PublicationMode } from '@/lib/brand-system'

const COOKIE_NAME = 'sc_growth_admin'
const SESSION_SECONDS = 60 * 60 * 24 * 14

export interface GrowthPerson {
  person_id: string
  company_id?: string
  name: string
  role?: string
  linkedin_url?: string
  public_source_url?: string
  relevance_score?: number | string
  status?: string
  created_at?: string
}

export interface GrowthApprovalPayload {
  execution_mode?: string
  company_id?: string
  company?: string
  website?: string
  linkedin_search_url?: string
  message?: string
  person?: Partial<GrowthPerson> | null
  language?: string
  family?: string
  quality_score?: number
  brief_id?: string
  source_urls?: string[]
  title?: string
  body?: string
  visual_path?: string
  visual_type?: string
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
  content_type: string
  visual_type: string
  body?: string
  visual_path?: string
  visual_design_id?: string | null
  publication_mode?: PublicationMode
  source_case?: string
  brief_id?: string
  language?: string
  content_family?: string
  quality_score?: number | string
  source_url?: string
  scheduled_at?: string | null
  published_at?: string | null
  external_post_id?: string | null
  external_post_url?: string | null
  critique?: Record<string, unknown> | null
  created_at?: string
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
  linkedin_url?: string
  score: number | string
  score_reason?: string
  fit_type?: string
  country?: string
  industry?: string
  status?: string
  created_at?: string
}

export interface GrowthTask {
  task_id: string
  type: string
  scheduled_for?: string | null
  status: string
  requires_approval?: boolean
  inputs?: Record<string, unknown> | null
  outputs?: Record<string, unknown> | null
  created_at?: string
}

export interface GrowthInteraction {
  interaction_id: string
  company_id?: string | null
  person_id?: string | null
  channel?: string
  direction?: string
  kind?: string
  content?: string
  occurred_at?: string
  next_action_at?: string | null
}

export interface GrowthMetric {
  metric_id: string
  channel: string
  metric_name: string
  metric_value: number | string
  metric_date: string
  metadata?: Record<string, unknown> | null
}

export interface GrowthWeeklyPlan {
  plan_id: string
  week_start: string
  primary_goal: string
  commercial_focus?: { channel?: string; [key: string]: unknown }
  content_focus?: { objective?: string; [key: string]: unknown }
  targets?: Record<string, unknown>
  tasks?: unknown[]
}

function env(name: string): string {
  return (process.env[name] || '').trim()
}

function sessionSecret(): string {
  const token = env('GROWTH_ADMIN_TOKEN')
  if (!token) throw new Error('GROWTH_ADMIN_TOKEN is not configured')
  return token
}

function sessionSignature(expires: string): string {
  return createHmac('sha256', sessionSecret()).update(`growth-admin:${expires}`).digest('base64url')
}

export function createGrowthAdminSession(): { value: string; maxAge: number } {
  const expires = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS)
  return { value: `v1.${expires}.${sessionSignature(expires)}`, maxAge: SESSION_SECONDS }
}

function validSession(value: string): boolean {
  const [version, expires, signature] = value.split('.')
  if (version !== 'v1' || !expires || !signature) return false
  const expiresNumber = Number(expires)
  if (!Number.isFinite(expiresNumber) || expiresNumber <= Math.floor(Date.now() / 1000)) return false
  const expected = Buffer.from(sessionSignature(expires))
  const actual = Buffer.from(signature)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export async function isGrowthAdminAuthenticated(): Promise<boolean> {
  if (!env('GROWTH_ADMIN_TOKEN')) return false
  const store = await cookies()
  const value = store.get(COOKIE_NAME)?.value || ''
  return validSession(value)
}

export function growthAdminCookieName(): string {
  return COOKIE_NAME
}

export { queryGrowthTable, updateGrowthRow, insertGrowthRow }

export function getPendingApprovals() {
  return queryGrowthTable<GrowthApproval>('approvals', { status: 'eq.pending', order: 'created_at.desc', limit: '100' })
}

export async function getReadyManualActions() {
  const rows = await queryGrowthTable<GrowthApproval>('approvals', { status: 'eq.approved', order: 'decided_at.desc', limit: '100' })
  return rows.filter((row) => row.payload?.execution_mode === 'manual_linkedin_action')
}

export function getRecentContent() {
  return queryGrowthTable<GrowthContentItem>('content_items', { order: 'created_at.desc', limit: '150' })
}

export function getRecentEditorialBriefs() {
  return queryGrowthTable<GrowthEditorialBrief>('editorial_briefs', { order: 'created_at.desc', limit: '40' })
}

export function getTopCompanies() {
  return queryGrowthTable<GrowthCompany>('companies', { order: 'score.desc', limit: '100' })
}

export function getPeople() {
  return queryGrowthTable<GrowthPerson>('people', { order: 'relevance_score.desc', limit: '150' })
}

export function getTasks() {
  return queryGrowthTable<GrowthTask>('tasks', { order: 'scheduled_for.asc', limit: '150' })
}

export function getInteractions() {
  return queryGrowthTable<GrowthInteraction>('interactions', { order: 'occurred_at.desc', limit: '150' })
}

export function getMetrics() {
  return queryGrowthTable<GrowthMetric>('metrics', { order: 'metric_date.desc', limit: '150' })
}

export function getRecentPlans() {
  return queryGrowthTable<GrowthWeeklyPlan>('weekly_plans', { order: 'week_start.desc', limit: '8' })
}

export async function getContentItem(contentId: string) {
  const rows = await queryGrowthTable<GrowthContentItem>('content_items', { content_id: `eq.${contentId}`, limit: '1' })
  return rows[0] || null
}
