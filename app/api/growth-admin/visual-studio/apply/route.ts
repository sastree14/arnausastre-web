import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getContentItem, isGrowthAdminAuthenticated, updateGrowthRow } from '@/lib/growth-admin'
import { uploadGrowthAsset } from '@/lib/growth-assets'
import { upsertGrowthRow } from '@/lib/supabase-growth'
import type { PublicationMode, VisualFormatKey } from '@/lib/brand-system'
import type { VisualDesign, VisualTemplateKey } from '@/lib/visual-studio'

interface ApplyPayload {
  designId?: string
  contentId?: string
  name?: string
  templateKey?: VisualTemplateKey
  formatKey?: VisualFormatKey
  publicationMode?: PublicationMode
  design?: VisualDesign
  pngDataUrl?: string
}

function safePart(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120) || 'visual'
}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const payload = await request.json() as ApplyPayload
  if (!payload.contentId || !payload.design || !payload.templateKey || !payload.formatKey || !payload.publicationMode || !payload.pngDataUrl) {
    return new NextResponse('Incomplete visual attachment payload', { status: 400 })
  }

  const item = await getContentItem(payload.contentId)
  if (!item) return new NextResponse('Content item not found', { status: 404 })

  const match = payload.pngDataUrl.match(/^data:image\/png;base64,(.+)$/)
  if (!match) return new NextResponse('PNG export is required', { status: 400 })
  const bytes = Buffer.from(match[1], 'base64')
  if (!bytes.length || bytes.length > 4_000_000) return new NextResponse('PNG payload is empty or too large', { status: 413 })

  const designId = payload.designId || `design_${randomUUID().replaceAll('-', '')}`
  const key = `visual-studio/${safePart(payload.contentId)}/${safePart(designId)}-${safePart(payload.formatKey)}.png`
  const assetPath = await uploadGrowthAsset(key, bytes, 'image/png')
  const now = new Date().toISOString()

  await upsertGrowthRow('visual_designs', {
    design_id: designId,
    tenant_id: 'sc-analytics',
    content_id: payload.contentId,
    name: (payload.name || payload.design.name || item.title).slice(0, 240),
    template_key: payload.templateKey,
    format_key: payload.formatKey,
    publication_mode: payload.publicationMode,
    design_json: { ...payload.design, designId, assetPath },
    asset_path: assetPath,
    status: 'attached',
    is_template: false,
    updated_at: now,
  }, 'design_id')

  await updateGrowthRow('content_items', 'content_id', payload.contentId, {
    visual_path: assetPath,
    visual_type: `visual_studio:${payload.templateKey}:${payload.formatKey}`,
    publication_mode: payload.publicationMode,
    visual_design_id: designId,
  })

  return NextResponse.json({ designId, assetPath, contentId: payload.contentId, publicationMode: payload.publicationMode })
}
