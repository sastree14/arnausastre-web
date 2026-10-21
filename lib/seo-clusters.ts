/**
 * Editorial intent → published service destination.
 *
 * Keep this deliberately conservative: every target below exists as a
 * published /services/[slug] page in the SC-Analytics SEO inventory.
 * The relationship is based on user intent, not keyword stuffing.
 * Existing article design and markup remain unchanged.
 */
export type SeoKnowledgeArea =
  | 'planning'
  | 'operations'
  | 'risk_decision'
  | 'ai_automation'
  | 'analytics'
  | 'finance'
  | 'business_systems'

export const SEO_SERVICE_CLUSTERS = {
  planning: {
    serviceSlug: 'demand-forecasting',
    topic: 'Forecasting & Planning',
    primaryKeyword: 'demand forecasting',
  },
  operations: {
    serviceSlug: 'operations-research',
    topic: 'Optimization & Operations',
    primaryKeyword: 'operations research consulting',
  },
  risk_decision: {
    serviceSlug: 'operations-research',
    topic: 'Decision Optimization',
    primaryKeyword: 'operations research consulting',
  },
  ai_automation: {
    serviceSlug: 'ai-automation',
    topic: 'AI Automation',
    primaryKeyword: 'AI automation services',
  },
  analytics: {
    serviceSlug: 'business-intelligence',
    topic: 'Business Intelligence',
    primaryKeyword: 'business intelligence consulting',
  },
  finance: {
    serviceSlug: 'pricing-optimization',
    topic: 'Pricing & Financial Decisions',
    primaryKeyword: 'pricing optimization',
  },
  business_systems: {
    serviceSlug: 'data-engineering',
    topic: 'Data Engineering',
    primaryKeyword: 'data engineering consulting',
  },
} as const satisfies Record<SeoKnowledgeArea, {
  serviceSlug: string
  topic: string
  primaryKeyword: string
}>

/**
 * Stable commercial destination for an editorial area.
 *
 * This is deliberately independent of the reader's locale for now:
 * the current 13 service landing pages are published in English only.
 * When localized service routes are launched, change this resolver rather
 * than altering dozens of individual article templates.
 */
export function serviceHrefForArea(area: string | null | undefined): string {
  const key = String(area || '').trim() as SeoKnowledgeArea
  const cluster = SEO_SERVICE_CLUSTERS[key]
  return `/services/${cluster?.serviceSlug || 'data-science-consulting'}`
}
