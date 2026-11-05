import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { growthSupabaseUrl } from '@/lib/supabase-growth'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isGrowthAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const publishableKey = String(
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim()

  if(!publishableKey)return NextResponse.json({error:'Realtime not configured'},{status:503})

  return NextResponse.json(
    {
      url: growthSupabaseUrl(),
      publishableKey,
      table: 'crm_ui_events',
      tenantId: 'sc-analytics',
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  )
}
