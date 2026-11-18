import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { insertGrowthRow, isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow } from '@/lib/growth-admin'

type DayTask = {
  id: string
  tenant_id: string
  title: string
  status: 'open' | 'waiting' | 'done' | 'archived'
  lane: 'today' | 'week' | 'waiting'
  followup_count: number
  metadata?: Record<string, unknown> | null
}

const TENANT = 'sc-analytics'
const RETURN_TO = '/growth-admin/dia-a-dia'
const isDay = (raw: string) => /^\d{4}-\d{2}-\d{2}$/.test(raw) && !Number.isNaN(Date.parse(raw + 'T12:00:00Z'))
const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
function daysAfter(raw: string, n: number): string {
  const date = new Date(raw + 'T12:00:00Z')
  date.setUTCDate(date.getUTCDate() + n)
  return date.toISOString().slice(0, 10)
}
function safeUrl(raw: string): string | null {
  if (!raw) return null
  try { const u = new URL(raw); return u.protocol === 'https:' ? u.toString() : null } catch { return null }
}
function resultRedirect(req: Request, result: string) {
  const url = new URL(RETURN_TO, req.url)
  url.searchParams.set('result', result)
  return NextResponse.redirect(url, 303)
}
function errorRedirect(req: Request, message: string) {
  const url = new URL(RETURN_TO, req.url)
  url.searchParams.set('error', message)
  return NextResponse.redirect(url, 303)
}
function numberIn(raw: FormDataEntryValue | null, fallback: number, min: number, max: number) {
  const n = Number(raw)
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback
}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return new NextResponse('Forbidden origin', { status: 403 })
  const data = await request.formData()
  const action = String(data.get('action') || '').trim()
  const date = today()

  try {
    if (action === 'settings') {
      const meetingMinutesRaw = numberIn(data.get('meeting_minutes'), 30, 15, 60)
      const meetingMinutes = [15, 20, 30, 45, 60].includes(meetingMinutesRaw) ? meetingMinutesRaw : 30
      await updateGrowthRow('day_settings', 'tenant_id', TENANT, {
        max_meetings_per_day: numberIn(data.get('max_meetings'), 3, 1, 10),
        max_tasks_per_day: numberIn(data.get('max_tasks'), 6, 1, 20),
        default_meeting_minutes: meetingMinutes,
        updated_at: new Date().toISOString(),
      })
      return resultRedirect(request, 'settings')
    }

    if (action === 'create') {
      const title = String(data.get('title') || '').trim().slice(0, 240)
      if (!title) return errorRedirect(request, 'Introduce un título')
      const laneRaw = String(data.get('lane') || 'today')
      const lane = laneRaw === 'week' || laneRaw === 'waiting' ? laneRaw : 'today'
      const scheduledRaw = String(data.get('scheduled_on') || '').trim()
      const dueRaw = String(data.get('due_on') || '').trim()
      const waitRaw = String(data.get('waiting_until') || '').trim()
      const scheduled_on = isDay(scheduledRaw) ? scheduledRaw : lane === 'today' ? date : null
      const due_on = isDay(dueRaw) ? dueRaw : null
      const waiting_until = lane === 'waiting' ? (isDay(waitRaw) ? waitRaw : daysAfter(date, 7)) : null
      await insertGrowthRow('day_tasks', {
        id: randomUUID(), tenant_id: TENANT, title,
        details: String(data.get('details') || '').trim().slice(0, 6000),
        status: lane === 'waiting' ? 'waiting' : 'open', lane,
        priority: numberIn(data.get('priority'), 2, 1, 3),
        scheduled_on, due_on, waiting_until,
        contact_email: String(data.get('contact_email') || '').trim().slice(0, 320) || null,
        related_url: safeUrl(String(data.get('related_url') || '')),
        related_document_url: safeUrl(String(data.get('related_document_url') || '')),
        source: 'manual',
        metadata: { created_from: 'day_to_day_dashboard' },
      })
      return resultRedirect(request, 'created')
    }

    const id = String(data.get('id') || '').trim()
    if (!/^[a-f0-9-]{36}$/i.test(id)) return errorRedirect(request, 'Tarea no válida')
    const rows = await queryGrowthTable<DayTask>('day_tasks', { id: 'eq.' + id, tenant_id: 'eq.' + TENANT, limit: '1' }, { cacheSeconds: 0 })
    const task = rows[0]
    if (!task) return errorRedirect(request, 'Tarea no encontrada')
    const now = new Date().toISOString()

    if (action === 'done') {
      await updateGrowthRow('day_tasks', 'id', id, { status: 'done', completed_at: now, updated_at: now })
    } else if (action === 'reopen') {
      await updateGrowthRow('day_tasks', 'id', id, { status: 'open', lane: 'today', scheduled_on: date, completed_at: null, updated_at: now })
    } else if (action === 'tomorrow') {
      await updateGrowthRow('day_tasks', 'id', id, { status: 'open', lane: 'today', scheduled_on: daysAfter(date, 1), completed_at: null, updated_at: now })
    } else if (action === 'wait') {
      const untilRaw = String(data.get('waiting_until') || '')
      await updateGrowthRow('day_tasks', 'id', id, { status: 'waiting', lane: 'waiting', scheduled_on: null, waiting_until: isDay(untilRaw) ? untilRaw : daysAfter(date, 7), completed_at: null, updated_at: now })
    } else if (action === 'followup_sent') {
      if (task.status !== 'waiting') return errorRedirect(request, 'Esta tarea no está en espera')
      const n = Math.min(2, Number(task.followup_count || 0) + 1)
      const closed = n >= 2
      await updateGrowthRow('day_tasks', 'id', id, {
        followup_count: n, status: closed ? 'archived' : 'waiting',
        waiting_until: closed ? null : daysAfter(date, 7),
        scheduled_on: null, last_outbound_at: now, updated_at: now,
        metadata: { ...(task.metadata || {}), active_conversation: false, last_followup_at: now, closed_after_two_followups: closed },
      })
    } else if (action === 'reply_received') {
      await updateGrowthRow('day_tasks', 'id', id, {
        status: 'open', lane: 'today', scheduled_on: date,
        waiting_until: null, followup_count: 0, last_inbound_at: now,
        updated_at: now, completed_at: null,
        metadata: { ...(task.metadata || {}), active_conversation: true, reactivated_on: now },
      })
    } else if (action === 'archive') {
      await updateGrowthRow('day_tasks', 'id', id, { status: 'archived', completed_at: now, updated_at: now })
    } else {
      return errorRedirect(request, 'Acción no admitida')
    }
    return resultRedirect(request, action)
  } catch (error) {
    console.error('Day-to-day action failed', error)
    return errorRedirect(request, 'No se ha podido guardar el cambio')
  }
}
