import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { upsertGrowthRow } from '@/lib/supabase-growth'

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const resetAt = new Date().toISOString()
  await upsertGrowthRow('growth_workspace_settings', {
    tenant_id: 'sc-analytics',
    setting_key: 'editorial_reset',
    value: {
      reset_at: resetAt,
      mode: 'hide_prior_workspace_history',
      preserves_published_content: true,
    },
    updated_at: resetAt,
  }, 'tenant_id,setting_key')

  const url = new URL('/growth-admin/content', request.url)
  url.searchParams.set('reset', '1')
  return NextResponse.redirect(url, 303)
}
