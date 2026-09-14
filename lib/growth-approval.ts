import 'server-only'

import { randomUUID } from 'node:crypto'
import {
  getContentItem,
  insertGrowthRow,
  queryGrowthTable,
  updateGrowthRow,
  type GrowthApproval,
  type GrowthContentItem,
  type GrowthEditorialBrief,
} from '@/lib/growth-admin'

export interface PublicationReadiness {
  ready: boolean
  issues: string[]
  rewriteRequired: boolean
  contractValid: boolean
  visualRequired: boolean
  hasVisual: boolean
  qualityScore: number
}

const VISUAL_REQUIRED_MODES = new Set(['text_with_visual', 'visual_first', 'image_only'])

export function evaluatePublicationReadiness(item: GrowthContentItem, brief?: GrowthEditorialBrief | null): PublicationReadiness {
  const critique = item.critique || {}
  const rewriteRequired = critique.rewrite_required === true
  const contractValid = critique.contract_valid !== false
  const qualityScore = Number(item.quality_score || 0)
  const hasVisual = Boolean(item.visual_path)
  const briefNeedsVisual = Boolean(brief?.visual?.needed)
  const modeNeedsVisual = item.content_type === 'linkedin_post' && VISUAL_REQUIRED_MODES.has(String(item.publication_mode || 'text_only'))
  const visualRequired = briefNeedsVisual || modeNeedsVisual
  const issues: string[] = []

  if (!contractValid) issues.push('El contrato editorial no es válido todavía.')
  if (rewriteRequired) issues.push('El crítico todavía exige una reescritura.')
  if (qualityScore < 7.5) issues.push(`La calidad (${qualityScore.toFixed(1)}) está por debajo del mínimo 7.5.`)
  if (visualRequired && !hasVisual) issues.push('Esta pieza requiere un visual antes de aprobarse.')

  return {
    ready: issues.length === 0,
    issues,
    rewriteRequired,
    contractValid,
    visualRequired,
    hasVisual,
    qualityScore,
  }
}

export async function getContentPublicationReadiness(contentId: string) {
  const item = await getContentItem(contentId)
  if (!item) return null
  let brief: GrowthEditorialBrief | null = null
  if (item.brief_id) {
    const rows = await queryGrowthTable<GrowthEditorialBrief>('editorial_briefs', { brief_id: `eq.${item.brief_id}`, limit: '1' })
    brief = rows[0] || null
  }
  return { item, brief, readiness: evaluatePublicationReadiness(item, brief) }
}

export async function ensurePendingPublicationApproval(contentId: string) {
  const gate = await getContentPublicationReadiness(contentId)
  if (!gate) return { created: false, reason: 'content_not_found' }
  const { item, brief, readiness } = gate
  if (!brief) return { created: false, reason: 'brief_not_found', readiness }
  if (!readiness.ready) return { created: false, reason: 'not_ready', readiness }

  if (item.content_type === 'linkedin_post' && item.language !== (brief.primary_linkedin_language || 'es')) {
    return { created: false, reason: 'alternate_variant', readiness }
  }

  const actionType = item.content_type === 'article' ? 'publish_article' : 'publish_post'
  const existing = await queryGrowthTable<GrowthApproval>('approvals', {
    target_id: `eq.${contentId}`,
    action_type: `eq.${actionType}`,
    order: 'created_at.desc',
    limit: '20',
  })
  const active = existing.find((row) => ['pending', 'approved', 'executed'].includes(row.status))
  if (active) return { created: false, reason: 'already_exists', approvalId: active.approval_id, readiness }

  const approvalId = `approval_${randomUUID().replaceAll('-', '').slice(0, 12)}`
  await insertGrowthRow('approvals', {
    approval_id: approvalId,
    tenant_id: 'sc-analytics',
    action_type: actionType,
    target_id: contentId,
    summary: `${actionType === 'publish_article' ? 'Approve website article' : 'Approve LinkedIn post'}: ${item.title}`,
    payload: {
      content_id: contentId,
      brief_id: item.brief_id,
      language: item.language,
      family: item.content_family,
      title: item.title,
      body: item.body,
      visual_type: item.visual_type,
      visual_path: item.visual_path,
      quality_score: Number(item.quality_score || 0),
      critique: item.critique || {},
      source_urls: brief.research?.source_urls || [],
      evidence_ids: [],
      execution_mode: actionType === 'publish_article' ? 'website_publish_after_approval' : 'official_api_when_configured',
    },
    status: 'pending',
    created_at: new Date().toISOString(),
  })

  if (item.status === 'needs_review') {
    await updateGrowthRow('content_items', 'content_id', contentId, { status: 'draft' })
  }
  return { created: true, approvalId, readiness }
}
