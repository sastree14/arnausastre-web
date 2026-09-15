import 'server-only'

import { queryGrowthRpc } from '@/lib/supabase-growth'
import type { GrowthApproval, GrowthCompany, GrowthInteraction, GrowthMeeting, GrowthOpportunity, GrowthPerson, GrowthTask } from '@/lib/growth-admin'

export type DashboardSummary = {
  companies: number
  active_projects: number
  opportunities: number
  meetings: number
  manual_actions: number
  published_content: number
  pending_approvals: number
  open_tasks: number
  failed_tasks: number
  invoiced: number
  collected: number
  spent: number
  overdue_invoices: number
  web_sessions: number
  linkedin_impressions: number
  linkedin_posts_measured: number
  linkedin_connected: boolean
  degraded?: boolean
}

export type CommercialSummary = {
  companies: number
  people: number
  lead_companies: number
  partner_companies: number
  lead_people: number
  partner_people: number
  opportunities: number
  meetings: number
  manual_actions: number
  active_content: number
  degraded?: boolean
}

export type MetricsSummary = {
  sessions: number
  key_events: number
  linkedin_impressions: number
  linkedin_posts_measured: number
  degraded?: boolean
}

export type FinanceBundle = {
  companies: Array<{ company_id: string; name: string }>
  projects: Array<{ project_id: string; name: string; status: string }>
  invoices: Array<Record<string, unknown>>
  expenses: Array<Record<string, unknown>>
  payments: Array<Record<string, unknown>>
  invoiced: number
  received: number
  spent: number
  degraded?: boolean
}

export type OperationsBundle = {
  tasks: Array<Record<string, unknown>>
  projects: Array<Record<string, unknown>>
  companies: Array<{ company_id: string; name: string }>
  opportunities: Array<{ opportunity_id: string; name: string }>
  degraded?: boolean
}

export type CrmBundle = {
  companies: GrowthCompany[]
  people: GrowthPerson[]
  actions: GrowthApproval[]
  interactions: GrowthInteraction[]
  opportunities: GrowthOpportunity[]
  meetings: GrowthMeeting[]
  prospect_tasks: GrowthTask[]
  calendly_connection?: Record<string, unknown>
  degraded?: boolean
}

const readOptions = { cacheSeconds: 8, timeoutMs: 3000, retries: 1 }

async function safeRpc<T extends object>(name: string, fallback: T): Promise<T & { degraded?: boolean }> {
  try {
    return await queryGrowthRpc<T>(name, {}, readOptions)
  } catch (error) {
    console.error(`Growth performance RPC ${name} failed`, error)
    return { ...fallback, degraded: true }
  }
}

export function getDashboardSummary() {
  return safeRpc<DashboardSummary>('growth_dashboard_summary', {
    companies: 0,
    active_projects: 0,
    opportunities: 0,
    meetings: 0,
    manual_actions: 0,
    published_content: 0,
    pending_approvals: 0,
    open_tasks: 0,
    failed_tasks: 0,
    invoiced: 0,
    collected: 0,
    spent: 0,
    overdue_invoices: 0,
    web_sessions: 0,
    linkedin_impressions: 0,
    linkedin_posts_measured: 0,
    linkedin_connected: false,
  })
}

export function getCommercialSummary() {
  return safeRpc<CommercialSummary>('growth_commercial_summary', {
    companies: 0,
    people: 0,
    lead_companies: 0,
    partner_companies: 0,
    lead_people: 0,
    partner_people: 0,
    opportunities: 0,
    meetings: 0,
    manual_actions: 0,
    active_content: 0,
  })
}

export function getMetricsSummary() {
  return safeRpc<MetricsSummary>('growth_metrics_summary', {
    sessions: 0,
    key_events: 0,
    linkedin_impressions: 0,
    linkedin_posts_measured: 0,
  })
}

export function getFinanceBundle() {
  return safeRpc<FinanceBundle>('growth_finance_bundle', {
    companies: [],
    projects: [],
    invoices: [],
    expenses: [],
    payments: [],
    invoiced: 0,
    received: 0,
    spent: 0,
  })
}

export function getOperationsBundle() {
  return safeRpc<OperationsBundle>('growth_operations_bundle', {
    tasks: [],
    projects: [],
    companies: [],
    opportunities: [],
  })
}

export function getCrmBundle() {
  return safeRpc<CrmBundle>('growth_crm_bundle', {
    companies: [],
    people: [],
    actions: [],
    interactions: [],
    opportunities: [],
    meetings: [],
    prospect_tasks: [],
    calendly_connection: {},
  })
}