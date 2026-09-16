import { NextResponse } from 'next/server'
import { getContentItem, isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow, type GrowthApproval } from '@/lib/growth-admin'
import { parseControlCenterDateTime } from '@/lib/control-center-time'

function calendarReturnUrl(request: Request, contentId: string, scheduled: boolean) {
  const fallback = new URL('/growth-admin/calendar', request.url)
  const referer = request.headers.get('referer')
  let url = fallback
  if (referer) {
    try {
      const candidate = new URL(referer)
      const origin = new URL(request.url).origin
      if (candidate.origin === origin && candidate.pathname === '/growth-admin/calendar') url = candidate
    } catch {
      // Ignore invalid referrer and keep the safe internal fallback.
    }
  }
  url.hash = `item-${contentId}`
  url.searchParams.set(scheduled ? 'scheduled' : 'unscheduled', contentId)
  return url
}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const form = await request.formData()
  const contentId = String(form.get('content_id') || '')
  const scheduledRaw = String(form.get('scheduled_at') || '').trim()
  if (!contentId) return new NextResponse('Missing content_id', { status: 400 })

  const item = await getContentItem(contentId)
  if (!item) return new NextResponse('Content not found', { status: 404 })
  if (item.status === 'published') return new NextResponse('Published content must be handled from publication history', { status: 409 })

  let scheduledAt: string | null = null
  if (scheduledRaw) {
    try {
      scheduledAt = parseControlCenterDateTime(scheduledRaw).toISOString()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid date'
      return new NextResponse(message, { status: 400 })
    }
  }

  const approvals = await queryGrowthTable<GrowthApproval>('approvals', {
    target_id: `eq.${contentId}`,
    status: 'eq.approved',
    order: 'decided_at.desc',
    limit: '5',
  })
  const hasApprovedPublication = approvals.some((row) => row.action_type === 'publish_post' || row.action_type === 'publish_article')
  const updates: Record<string, unknown> = { scheduled_at: scheduledAt }

  if (hasApprovedPublication) {
    if (item.content_type === 'article') updates.status = scheduledAt ? 'scheduled' : 'approved'
    else updates.status = 'approved'
  }

  const updated = await updateGrowthRow('content_items', 'content_id', contentId, updates)
  if (!updated) return new NextResponse('Content not found', { status: 404 })
  return NextResponse.redirect(calendarReturnUrl(request, contentId, Boolean(scheduledAt)), 303)
}
