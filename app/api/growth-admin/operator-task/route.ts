import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { insertGrowthRow, isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { queryGrowthTable } from '@/lib/supabase-growth'
import { dispatchOperatorQueue } from '@/lib/github-actions'

const ACTION_TO_TYPE: Record<string, string> = {
  editorial_proposals: 'OPERATOR_EDITORIAL_PROPOSALS',
  editorial_run: 'OPERATOR_EDITORIAL_RUN',
  editorial_url: 'OPERATOR_EDITORIAL_URL',
  rewrite_content: 'OPERATOR_REWRITE_CONTENT',
  prospect: 'OPERATOR_PROSPECT',
  commercial_signals: 'OPERATOR_COMMERCIAL_SIGNALS',
  competitor_discover: 'OPERATOR_COMPETITOR_DISCOVER',
  competitor_refresh: 'OPERATOR_COMPETITOR_REFRESH',
  competitor_refresh_all: 'OPERATOR_COMPETITOR_REFRESH_ALL',
  publish_linkedin: 'OPERATOR_PUBLISH_LINKEDIN',
  publish_article: 'OPERATOR_PUBLISH_ARTICLE',
}

type TaskRow = {
  task_id: string
  type: string
  status: string
  inputs?: Record<string, unknown> | null
  created_at?: string | null
}

function int(value: FormDataEntryValue | null, fallback: number, max = 100) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.min(max, Math.max(1, Math.floor(parsed))) : fallback
}

function bool(value: FormDataEntryValue | null) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase())
}

function sameInputs(a: Record<string, unknown> | null | undefined, b: Record<string, unknown>) {
  const left = Object.entries(a || {}).sort(([ka], [kb]) => ka.localeCompare(kb))
  const right = Object.entries(b).sort(([ka], [kb]) => ka.localeCompare(kb))
  return JSON.stringify(left) === JSON.stringify(right)
}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData()
  const action = String(form.get('action') || '')
  const type = ACTION_TO_TYPE[action]
  if (!type) return new NextResponse('Unsupported operator action', { status: 400 })

  let inputs: Record<string, unknown> = {}
  if (action === 'editorial_proposals') {
    inputs = {
      focus: String(form.get('focus') || '').trim(),
      avoid: String(form.get('avoid') || '').trim(),
      count: int(form.get('count'), 3, 6),
      history_days: int(form.get('history_days'), 60, 180),
    }
  } else if (action === 'editorial_run') {
    inputs = {
      theme_hint: String(form.get('theme_hint') || '').trim(),
      avoid: String(form.get('avoid') || '').trim(),
      max_signals: int(form.get('max_signals'), 30),
      max_briefs: int(form.get('max_briefs'), 1),
      strict_theme: bool(form.get('strict_theme')),
      force_new: bool(form.get('force_new')),
    }
  } else if (action === 'editorial_url') {
    const url = String(form.get('url') || '').trim()
    if (!url) return new NextResponse('Missing URL', { status: 400 })
    inputs = { url, title: String(form.get('title') || '').trim() }
  } else if (action === 'rewrite_content' || action === 'publish_linkedin' || action === 'publish_article') {
    const contentId = String(form.get('content_id') || '').trim()
    if (!contentId) return new NextResponse('Missing content_id', { status: 400 })
    inputs = { content_id: contentId }
  } else if (action === 'prospect') {
    inputs = {
      mode: String(form.get('mode') || 'lead'),
      limit: int(form.get('limit'), 10, 50),
    }
  } else if (action === 'commercial_signals') {
    inputs = { limit: int(form.get('limit'), 12, 40) }
  } else if (action === 'competitor_discover') {
    inputs = {
      limit: int(form.get('limit'), 8, 20),
      focus: String(form.get('focus') || '').trim(),
    }
  } else if (action === 'competitor_refresh') {
    const competitorId = String(form.get('competitor_id') || '').trim()
    if (!competitorId) return new NextResponse('Missing competitor_id', { status: 400 })
    inputs = { competitor_id: competitorId, max_events: int(form.get('max_events'), 8, 12) }
  } else if (action === 'competitor_refresh_all') {
    inputs = { limit: int(form.get('limit'), 20, 50) }
  }

  const recent = await queryGrowthTable<TaskRow>('tasks', {
    tenant_id: 'eq.sc-analytics',
    type: `eq.${type}`,
    order: 'created_at.desc',
    limit: '5',
  }, { cacheSeconds: 0 })
  const duplicate = recent.find((task) => {
    if (!['queued', 'pending', 'running'].includes(String(task.status || ''))) return false
    const created = task.created_at ? Date.parse(task.created_at) : NaN
    if (!Number.isFinite(created) || Date.now() - created > 30_000) return false
    return sameInputs(task.inputs, inputs)
  })

  const taskId = duplicate?.task_id || `task_${randomUUID().replaceAll('-', '').slice(0, 12)}`
  if (!duplicate) {
    const now = new Date().toISOString()
    await insertGrowthRow('tasks', {
      task_id: taskId,
      tenant_id: 'sc-analytics',
      type,
      scheduled_for: now,
      status: 'queued',
      requires_approval: false,
      inputs,
      outputs: {},
      created_at: now,
    })
  }

  const dispatch = await dispatchOperatorQueue()
  const returnTo = String(form.get('return_to') || '/growth-admin')
  const url = new URL(returnTo.startsWith('/') ? returnTo : '/growth-admin', request.url)
  url.searchParams.set('queued', taskId)
  url.searchParams.set('dispatched', dispatch.dispatched ? '1' : '0')
  url.searchParams.set('deduplicated', duplicate ? '1' : '0')
  if (!dispatch.dispatched) url.searchParams.set('dispatch_reason', dispatch.reason)
  return NextResponse.redirect(url, 303)
}
