import 'server-only'

import { queryGrowthTable } from '@/lib/supabase-growth'
import type { GrowthTask } from '@/lib/growth-admin'

export interface CompetitorRow {
  competitor_id: string
  tenant_id: string
  name: string
  website: string
  country?: string
  city?: string
  employee_range?: string
  category?: 'direct' | 'adjacent' | string
  positioning?: string
  services?: string[]
  philosophy_fit?: number | string
  market_overlap?: number | string
  relevance_score?: number | string
  why_relevant?: string
  differentiation?: string
  primary_source_url?: string
  linkedin_url?: string
  status?: string
  is_monitored?: boolean
  monitoring_frequency?: string
  last_discovered_at?: string | null
  last_checked_at?: string | null
  last_change_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface CompetitorEventRow {
  event_id: string
  tenant_id: string
  competitor_id: string
  event_type: string
  title: string
  summary?: string
  evidence?: string
  source_url: string
  observed_at?: string | null
  significance?: number | string
  impact_for_sc?: string
  recommended_response?: string
  fingerprint: string
  created_at?: string
}

export async function getCompetitors() {
  return queryGrowthTable<CompetitorRow>('competitors', {
    tenant_id: 'eq.sc-analytics',
    status: 'eq.active',
    order: 'relevance_score.desc,updated_at.desc',
    limit: '100',
  }, { cacheSeconds: 0 })
}

export async function getCompetitorEvents() {
  return queryGrowthTable<CompetitorEventRow>('competitor_events', {
    tenant_id: 'eq.sc-analytics',
    order: 'created_at.desc',
    limit: '250',
  }, { cacheSeconds: 0 })
}

export async function getCompetitionTasks() {
  return queryGrowthTable<GrowthTask>('tasks', {
    type: 'in.(OPERATOR_COMPETITOR_DISCOVER,OPERATOR_COMPETITOR_REFRESH,OPERATOR_COMPETITOR_REFRESH_ALL)',
    order: 'created_at.desc',
    limit: '100',
  }, { cacheSeconds: 0 })
}
