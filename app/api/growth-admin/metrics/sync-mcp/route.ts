import { NextResponse } from 'next/server'
import { syncMarketingMetrics } from '@/lib/google-marketing-analytics'
import { insertGrowthRow } from '@/lib/supabase-growth'

export const maxDuration = 60

function env(name: string) {
  return (process.env[name] || '').trim()
}

async function authorizedSupabaseUser(request: Request) {
  const authorization = request.headers.get('authorization') || ''
  if (!authorization.toLowerCase().startsWith('bearer ')) return null

  const supabaseUrl = env('SUPABASE_URL').replace(/\/$/, '')
  const publishableKey = env('SUPABASE_PUBLISHABLE_KEY')
  if (!supabaseUrl || !publishableKey) throw new Error('Supabase OAuth verification is not configured')

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: publishableKey,
      Authorization: authorization,
    },
    cache: 'no-store',
  })
  if (!userResponse.ok) return null
  const user = await userResponse.json() as { id?: string; email?: string }
  if (!user.id) return null

  const accessUrl = new URL(`${supabaseUrl}/rest/v1/mcp_authorized_users`)
  accessUrl.searchParams.set('select', 'enabled,label')
  accessUrl.searchParams.set('user_id', `eq.${user.id}`)
  accessUrl.searchParams.set('limit', '1')

  const accessResponse = await fetch(accessUrl, {
    headers: {
      apikey: publishableKey,
      Authorization: authorization,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })
  if (!accessResponse.ok) return null
  const rows = await accessResponse.json() as Array<{ enabled?: boolean; label?: string }>
  if (!rows[0]?.enabled) return null

  return { id: user.id, email: user.email || null, label: rows[0].label || null }
}

export async function POST(request: Request) {
  try {
    const user = await authorizedSupabaseUser(request)
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    const body = await request.json().catch(() => ({})) as { days?: number }
    const days = Math.max(7, Math.min(730, Number(body.days || 365) || 365))
    const result = await syncMarketingMetrics(days)

    await insertGrowthRow('sc_operational_activities', {
      tenant_id: 'sc-analytics',
      user_id: user.id,
      occurred_at: new Date().toISOString(),
      activity_type: 'metrics_sync',
      channel: 'google',
      entity_type: 'metrics',
      entity_id: 'ga4_search_console',
      title: 'Google metrics synchronized',
      summary: `GA4: ${result.ga4.ok ? 'ok' : 'error'} · Search Console: ${result.search_console.ok ? 'ok' : 'error'} · ${days} days`,
      status: result.ga4.ok && result.search_console.ok ? 'completed' : 'partial',
      metadata: { days, result, source: 'sc_analytics_mcp' },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('SC-Analytics MCP Google sync failed', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
