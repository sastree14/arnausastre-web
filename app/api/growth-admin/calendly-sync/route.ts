import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { ensureCalendlyWebhook, syncCalendlyCrm } from '@/lib/calendly-crm'

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const result = await syncCalendlyCrm()
  let webhookStatus = 'not_configured'
  let webhookError = ''
  try {
    const origin = new URL(request.url).origin
    const callbackUrl = `${origin}/api/calendly/webhook`
    const webhook = await ensureCalendlyWebhook(callbackUrl)
    webhookStatus = webhook.status
  } catch (error) {
    webhookError = error instanceof Error ? error.message : String(error)
    console.error('Calendly webhook setup failed', error)
  }

  const url = new URL('/growth-admin/crm', request.url)
  url.searchParams.set('calendly_sync', String(result.meetings_synced))
  url.searchParams.set('calendly_people', String(result.people_linked))
  url.searchParams.set('calendly_opportunities', String(result.opportunities_linked))
  url.searchParams.set('calendly_webhook', webhookStatus)
  if (webhookError) url.searchParams.set('calendly_warning', '1')
  return NextResponse.redirect(url, 303)
}
