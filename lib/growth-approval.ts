import 'server-only'

import { getContentItem, queryGrowthTable, type GrowthContentItem, type GrowthEditorialBrief } from '@/lib/growth-admin'

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
  if (item.content_type === 'linkedin_post' && item.publication_mode === 'text_only' && hasVisual) {
    // This is not a blocker: text-only deliberately ignores the attached asset.
  }

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
