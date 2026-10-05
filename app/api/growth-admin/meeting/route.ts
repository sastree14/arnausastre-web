import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { parseControlCenterDateTime } from '@/lib/control-center-time'
import { insertGrowthRow, isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const form = await request.formData()
  const title = String(form.get('title') || '').trim()
  const startsAtRaw = String(form.get('starts_at') || '').trim()
  const notes = String(form.get('notes') || '').trim()

  if (!title || !startsAtRaw) return new NextResponse('title and starts_at are required', { status: 400 })

  let startsAt: Date
  try {
    startsAt = parseControlCenterDateTime(startsAtRaw)
  } catch {
    return new NextResponse('Invalid starts_at', { status: 400 })
  }

  const meetingId = 'meeting_' + randomUUID().replaceAll('-', '').slice(0, 12)
  await insertGrowthRow('crm_meetings', {
    meeting_id: meetingId,
    tenant_id: 'sc-analytics',
    company_id: null,
    person_id: null,
    opportunity_id: null,
    provider: 'manual',
    external_id: '',
    starts_at: startsAt.toISOString(),
    status: 'scheduled',
    booking_url: '',
    metadata: { event_name: title, notes },
    created_at: new Date().toISOString(),
  })

  return NextResponse.redirect(new URL('/growth-admin/calendar#nuevo-evento', request.url), 303)
}
