import 'server-only'

import { randomUUID } from 'node:crypto'
import { insertGrowthRow } from '@/lib/supabase-growth'

export async function recordFinanceAudit(input: {
  entityType: string
  entityId: string
  action: string
  actor?: string
  before?: unknown
  after?: unknown
  notes?: string
}) {
  return insertGrowthRow('finance_audit_events', {
    audit_event_id: `audit_${randomUUID().replaceAll('-', '').slice(0, 16)}`,
    tenant_id: 'sc-analytics',
    entity_type: input.entityType,
    entity_id: input.entityId,
    action: input.action,
    actor: input.actor || 'arnau',
    before_data: input.before ?? null,
    after_data: input.after ?? null,
    notes: input.notes || '',
    occurred_at: new Date().toISOString(),
  })
}
