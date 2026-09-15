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
  personal_hook?: string
  open_question?: string
  recommended_service?: string
  recommended_offer?: string
  research_context?: Record<string, unknown> | null
  source?: string
  completed_at?: string | null
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
  recommended_service?: string
  recommended_offer?: string
  partnership_model?: string
  partnership_value?: string
  completed_at?: string | null
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
  external_id?: string | null
  starts_at?: string | null
  status: string
  booking_url?: string | null
  metadata?: Record<string, unknown> | null
  created_at?: string
}

export interface GrowthVisualDesign {
  design_id: string
  content_id?: string | null
  name: string
  template_key: string
  format_key: string
  publication_mode: PublicationMode
  design_json?: Record<string, unknown> | null
  asset_path?: string | null
  status: string
  is_template?: boolean
  created_at?: string
  updated_at?: string
}

function hex(value: Buffer) { return value.toString('hex') }
function sign(value: string) { return createHmac('sha256', process.env.GROWTH_ADMIN_PASSWORD || '').update(value).digest() }

export async function isGrowthAdminAuthenticated() {
  const password = process.env.GROWTH_ADMIN_PASSWORD || ''
  if (!password) return false
  const value = (await cookies()).get(COOKIE_NAME)?.value || ''
  const [timestamp, signature] = value.split('.')
  if (!timestamp || !signature) return false
  const age = Math.floor(Date.now() / 1000) - Number(timestamp)
  if (!Number.isFinite(age) || age < 0 || age > SESSION_SECONDS) return false
  const expected = sign(timestamp)
  const actual = Buffer.from(signature, 'hex')
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export function growthAdminCookieValue() {
  const timestamp = String(Math.floor(Date.now() / 1000))
  return `${timestamp}.${hex(sign(timestamp))}`
}

export { insertGrowthRow, queryGrowthTable, updateGrowthRow }
