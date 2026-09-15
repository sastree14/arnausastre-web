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
  email?: string
  phone?: string
  phone_source_url?: string
  phone_kind?: string
  linkedin_url?: string
  public_source_url?: string
  relevance_score?: number | string
  status?: string
  evidence?: string
  notes?: string
  recommended_message?: string
  outreach_angle?: string
  connection_note?: string
  follow_up_message?: string
  recommended_action?: string
  sc_analytics_action?: string
  contact_reason?: string
  research_context?: Record<string, unknown> | null
  source?: string
  completed_at?: string | null
  personal_hook?: string
  open_question?: string
  recommended_service?: string
  recommended_offer?: string
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
  critique?: Record<string, unknown>
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
  tenant_id?: string
  title: string
  status: string
  channel: string
  content_type: string
  objective?: string
  target_audience?: string[]
  evidence_ids?: string[]
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
  topic?: string | null
  industry?: string | null
  challenge?: string | null
  audience?: string | null
  funnel_stage?: string | null
  hook_type?: string | null
  cta_type?: string | null
  cta_url?: string | null
  hashtags?: string[] | null
  visual_strategy?: Record<string, unknown> | null
  last_rewritten_at?: string | null
}

export interface GrowthEditorialBrief {
  brief_id: string
  canonical_title: string
  family: string
  thesis?: string
  business_problem?: string
  target_audience?: string[]
  output_decision: string
  primary_linkedin_language?: string
  weighted_score?: number | string
  visual?: { type?: string; needed?: boolean; concept?: string; [key: string]: unknown }
  research?: { source_urls?: string[]; [key: string]: unknown }
  status: string
  created_at?: string
}

export interface GrowthCompany {
  company_id: string
  name: string
  website: string
  phone?: string
  phone_source_url?: string
  linkedin_url?: string
  source_url?: string
  score: number | string
  score_reason?: string
  fit_type?: string
  country?: string
  industry?: string
  employee_range?: string
  capabilities?: string[]
  capability_gaps?: string[]
  status?: string
  notes?: string
  completed_at?: string | null
  recommended_service?: string
  recommended_offer?: string
  partnership_model?: string
  partnership_value?: string
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
  actor?: string
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

export interface LinkedInAnalyticsImport {
  import_id: string
  account_type: 'arnau' | 'sc_analytics'
  report_type: string
  period_start?: string | null
  period_end?: string | null
  source_filename?: string
  rows_imported: number
  metadata?: Record<string, unknown> | null
  imported_at: string
}

export interface LinkedInPostMetric {
  metric_id: string
  account_type: 'arnau' | 'sc_analytics'
  content_id?: string | null
  external_post_id?: string
  external_post_url?: string
  snapshot_date: string
  impressions: number | string
  reach: number | string
  reactions: number | string
  comments: number | string
  reposts: number | string
  saves: number | string
  sends: number | string
  clicks: number | string
  profile_views: number | string
  followers_gained: number | string
  metadata?: Record<string, unknown> | null
}

export interface WebAnalyticsDaily {
  metric_id: string
  metric_date: string
  source: string
  medium: string
  campaign: string
  content_id?: string | null
  page_path: string
  users: number | string
  sessions: number | string
  engaged_sessions: number | string
  page_views: number | string
  key_events: number | string
  discovery_clicks: number | string
  bookings: number | string
  metadata?: Record<string, unknown> | null
}

export interface GrowthOpportunity {
  opportunity_id: string
  company_id?: string | null
  primary_person_id?: string | null
  source_content_id?: string | null
  source_signal_id?: string | null
  name: string
  stage: string
  value: number | string
  currency: string
  probability: number | string
  source?: string
  next_action_at?: string | null
  metadata?: Record<string, unknown> | null
  created_at?: string
  updated_at?: string
}

export interface GrowthMeeting {
  meeting_id: string
  company_id?: string | null
  person_id?: string | null
  opportunity_id?: string | null
  provider: string
  external_id?: string
  starts_at?: string | null
  status: string
  booking_url?: string
  metadata?: Record<string, unknown> | null
  created_at?: string
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
  return queryGrowthTable<GrowthApproval>('approvals', { status: 'eq.pending', order: 'created_at.desc', limit: '150' })
}

export function getApprovalHistory() {
  return queryGrowthTable<GrowthApproval>('approvals', { order: 'created_at.desc', limit: '250' })
}

export async function getReadyManualActions() {
  const rows = await queryGrowthTable<GrowthApproval>('approvals', { status: 'eq.approved', order: 'decided_at.desc', limit: '150' })
  return rows.filter((row) => row.payload?.execution_mode === 'manual_linkedin_action')
}

export function getRecentContent() {
  return queryGrowthTable<GrowthContentItem>('content_items', { order: 'created_at.desc', limit: '250' })
}

export function getRecentEditorialBriefs() {
  return queryGrowthTable<GrowthEditorialBrief>('editorial_briefs', { order: 'created_at.desc', limit: '100' })
}

export function getTopCompanies() {
  return queryGrowthTable<GrowthCompany>('companies', { order: 'score.desc', limit: '200' })
}

export function getPeople() {
  return queryGrowthTable<GrowthPerson>('people', { order: 'relevance_score.desc', limit: '250' })
}

export function getTasks() {
  return queryGrowthTable<GrowthTask>('tasks', { order: 'created_at.desc', limit: '250' })
}

export function getInteractions() {
  return queryGrowthTable<GrowthInteraction>('interactions', { order: 'occurred_at.desc', limit: '250' })
}

export function getMetrics() {
  return queryGrowthTable<GrowthMetric>('metrics', { order: 'metric_date.desc', limit: '500' })
}

export function getLinkedInAnalyticsImports() {
  return queryGrowthTable<LinkedInAnalyticsImport>('linkedin_analytics_imports', { order: 'imported_at.desc', limit: '100' })
}

export function getLinkedInPostMetrics() {
  return queryGrowthTable<LinkedInPostMetric>('linkedin_post_metrics', { order: 'snapshot_date.desc', limit: '1000' })
}

export function getWebAnalyticsDaily() {
  return queryGrowthTable<WebAnalyticsDaily>('web_analytics_daily', { order: 'metric_date.desc', limit: '1000' })
}

export function getOpportunities() {
  return queryGrowthTable<GrowthOpportunity>('crm_opportunities', { order: 'updated_at.desc', limit: '250' })
}

export function getMeetings() {
  return queryGrowthTable<GrowthMeeting>('crm_meetings', { order: 'starts_at.desc', limit: '250' })
}

export function getRecentPlans() {
  return queryGrowthTable<GrowthWeeklyPlan>('weekly_plans', { order: 'week_start.desc', limit: '12' })
}

export async function getContentItem(contentId: string) {
  const rows = await queryGrowthTable<GrowthContentItem>('content_items', { content_id: `eq.${contentId}`, limit: '1' })
  return rows[0] || null
}
