import { redirect } from 'next/navigation'
import VisualStudioClient from '@/components/visual-studio/VisualStudioClient'
import { getRecentContent, isGrowthAdminAuthenticated, queryGrowthTable } from '@/lib/growth-admin'
import type { PublicationMode, VisualFormatKey } from '@/lib/brand-system'
import type { VisualDesign, VisualStudioContentSeed, VisualTemplateKey } from '@/lib/visual-studio'

type VisualDesignRow = {
  design_id: string
  content_id?: string | null
  name: string
  template_key: VisualTemplateKey
  format_key: VisualFormatKey
  publication_mode: PublicationMode
  design_json: VisualDesign
  asset_path?: string
  status?: string
  is_template?: boolean
  updated_at?: string
}

export const dynamic = 'force-dynamic'

export default async function VisualStudioPage() {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')

  const [contentRows, savedDesigns] = await Promise.all([
    getRecentContent(),
    queryGrowthTable<VisualDesignRow>('visual_designs', { order: 'updated_at.desc', limit: '100' }),
  ])

  const content: VisualStudioContentSeed[] = contentRows
    .filter((item) => ['linkedin_post', 'article'].includes(item.content_type))
    .filter((item) => !['rejected', 'failed', 'superseded_test'].includes(item.status))
    .map((item) => ({
      content_id: item.content_id,
      title: item.title,
      body: item.body,
      channel: item.channel,
      content_type: item.content_type,
      language: item.language,
      content_family: item.content_family,
      visual_type: item.visual_type,
      visual_path: item.visual_path,
      publication_mode: item.publication_mode,
    }))

  return <VisualStudioClient content={content} savedDesigns={savedDesigns} />
}
