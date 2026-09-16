import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { updateGrowthRow } from '@/lib/supabase-growth'

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData()
  const competitorId = String(form.get('competitor_id') || '').trim()
  if (!competitorId) return new NextResponse('Missing competitor_id', { status: 400 })

  const enabled = ['1', 'true', 'on', 'yes'].includes(String(form.get('enabled') || '').toLowerCase())
  const frequency = String(form.get('monitoring_frequency') || 'daily').trim()
  const allowed = new Set(['daily', 'weekly'])
  await updateGrowthRow('competitors', 'competitor_id', competitorId, {
    is_monitored: enabled,
    monitoring_frequency: allowed.has(frequency) ? frequency : 'daily',
    updated_at: new Date().toISOString(),
  })

  const url = new URL('/growth-admin/competition', request.url)
  url.searchParams.set('monitor', enabled ? 'on' : 'off')
  return NextResponse.redirect(url, 303)
}
