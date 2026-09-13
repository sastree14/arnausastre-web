import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated, updateGrowthRow } from '@/lib/growth-admin'
import { parseControlCenterDateTime } from '@/lib/control-center-time'

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const form = await request.formData()
  const contentId = String(form.get('content_id') || '')
  const scheduledRaw = String(form.get('scheduled_at') || '').trim()
  if (!contentId) return new NextResponse('Missing content_id', { status: 400 })

  let scheduledAt: string | null = null
  if (scheduledRaw) {
    try {
      scheduledAt = parseControlCenterDateTime(scheduledRaw).toISOString()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid date'
      return new NextResponse(message, { status: 400 })
    }
  }

  const updated = await updateGrowthRow('content_items', 'content_id', contentId, { scheduled_at: scheduledAt })
  if (!updated) return new NextResponse('Content not found', { status: 404 })
  return NextResponse.redirect(new URL('/growth-admin#calendar', request.url), 303)
}
