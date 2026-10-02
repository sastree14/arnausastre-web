import 'server-only'

import { queryGrowthTable } from '@/lib/supabase-growth'
import type { GrowthContentItem, GrowthEditorialBrief, GrowthTask } from '@/lib/growth-admin'

const TENANT_ID = 'sc-analytics'

interface WorkspaceSetting {
  tenant_id: string
  setting_key: string
  value?: Record<string, unknown> | null
  updated_at?: string
}

export async function getEditorialWorkspaceResetAt(): Promise<string | null> {
  const rows = await queryGrowthTable<WorkspaceSetting>('growth_workspace_settings', {
    tenant_id: `eq.${TENANT_ID}`,
    setting_key: 'eq.editorial_reset',
    limit: '1',
  }, { cacheSeconds: 0 })
  const resetAt = rows[0]?.value?.reset_at
  return typeof resetAt === 'string' && resetAt ? resetAt : null
}

function createdAfter(resetAt: string | null): Record<string, string> {
  return resetAt ? { created_at: `gte.${resetAt}` } : {}
}

export async function getWorkspaceContent(): Promise<GrowthContentItem[]> {
  const resetAt = await getEditorialWorkspaceResetAt()
  return queryGrowthTable<GrowthContentItem>('content_items', {
    ...createdAfter(resetAt),
    order: 'created_at.desc',
    limit: '1000',
  }, { cacheSeconds: 0 })
}

export async function getWorkspaceEditorialBriefs(): Promise<GrowthEditorialBrief[]> {
  const resetAt = await getEditorialWorkspaceResetAt()
  return queryGrowthTable<GrowthEditorialBrief>('editorial_briefs', {
    ...createdAfter(resetAt),
    order: 'created_at.desc',
    limit: '100',
  }, { cacheSeconds: 0 })
}

export async function getWorkspaceEditorialTasks(): Promise<GrowthTask[]> {
  const resetAt = await getEditorialWorkspaceResetAt()
  return queryGrowthTable<GrowthTask>('tasks', {
    ...createdAfter(resetAt),
    type: 'in.(OPERATOR_EDITORIAL_PROPOSALS,OPERATOR_EDITORIAL_RUN,OPERATOR_EDITORIAL_URL,OPERATOR_REWRITE_CONTENT,OPERATOR_PUBLISH_LINKEDIN,OPERATOR_PUBLISH_ARTICLE)',
    order: 'created_at.desc',
    limit: '100',
  }, { cacheSeconds: 0 })
}


export function collapseWebsiteArticleFamilies(items: GrowthContentItem[]): GrowthContentItem[] {
  const result: GrowthContentItem[] = []
  const articleFamilies = new Map<string, GrowthContentItem[]>()

  for (const item of items) {
    if (item.content_type === 'article' && item.channel === 'website' && item.brief_id) {
      const key = item.brief_id
      articleFamilies.set(key, [...(articleFamilies.get(key) || []), item])
    } else {
      result.push(item)
    }
  }

  for (const family of articleFamilies.values()) {
    const representative =
      family.find((item) => item.language === 'es')
      || family.find((item) => item.language === 'en')
      || family.find((item) => item.language === 'ca')
      || family[0]
    if (representative) result.push(representative)
  }

  return result.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
}
