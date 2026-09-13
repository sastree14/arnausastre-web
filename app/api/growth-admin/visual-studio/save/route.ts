import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { upsertGrowthRow } from '@/lib/supabase-growth'
import type { PublicationMode, VisualFormatKey } from '@/lib/brand-system'
import type { VisualDesign, VisualTemplateKey } from '@/lib/visual-studio'

interface SavePayload {
  designId?: string
  contentId?: string
  name?: string
  templateKey?: VisualTemplateKey
  formatKey?: VisualFormatKey
  publicationMode?: PublicationMode
  design?: VisualDesign
  isTemplate?: boolean
}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const payload = await request.json() as SavePayload
  if (!payload.design || !payload.templateKey || !payload.formatKey || !payload.publicationMode) {
    return new NextResponse('Invalid visual design payload', { status: 400 })
  }

  const designId = payload.designId || `design_${randomUUID().replaceAll('-', '')}`
  const now = new Date().toISOString()
  const row = await upsertGrowthRow<Record<string, unknown>>('visual_designs', {
    design_id: designId,
    tenant_id: 'sc-analytics',
    content_id: payload.contentId || null,
    name: (payload.name || payload.design.name || 'Untitled visual').slice(0, 240),
    template_key: payload.templateKey,
    format_key: payload.formatKey,
    publication_mode: payload.publicationMode,
    design_json: { ...payload.design, designId },
    status: payload.isTemplate ? 'template' : 'draft',
    is_template: Boolean(payload.isTemplate),
    updated_at: now,
  }, 'design_id')

  return NextResponse.json({ designId, row })
}
