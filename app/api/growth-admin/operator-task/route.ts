import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { insertGrowthRow, isGrowthAdminAuthenticated } from '@/lib/growth-admin'

const ACTION_TO_TYPE: Record<string, string> = {
  editorial_run: 'OPERATOR_EDITORIAL_RUN',
  editorial_url: 'OPERATOR_EDITORIAL_URL',
  rewrite_content: 'OPERATOR_REWRITE_CONTENT',
  prospect: 'OPERATOR_PROSPECT',
  publish_linkedin: 'OPERATOR_PUBLISH_LINKEDIN',
  publish_article: 'OPERATOR_PUBLISH_ARTICLE',
}

function int(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : fallback
}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData()
  const action = String(form.get('action') || '')
  const type = ACTION_TO_TYPE[action]
  if (!type) return new NextResponse('Unsupported operator action', { status: 400 })

  let inputs: Record<string, unknown> = {}
  if (action === 'editorial_run') {
    inputs = {
      theme_hint: String(form.get('theme_hint') || '').trim(),
      max_signals: int(form.get('max_signals'), 30),
      max_briefs: int(form.get('max_briefs'), 1),
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
      limit: int(form.get('limit'), 10),
    }
  }

  const taskId = `task_${randomUUID().replaceAll('-', '').slice(0, 12)}`
  await insertGrowthRow('tasks', {
    task_id: taskId,
    tenant_id: 'sc-analytics',
    type,
    scheduled_for: new Date().toISOString(),
    status: 'queued',
    requires_approval: false,
    inputs,
    outputs: {},
    created_at: new Date().toISOString(),
  })

  const returnTo = String(form.get('return_to') || '/growth-admin')
  const url = new URL(returnTo.startsWith('/') ? returnTo : '/growth-admin', request.url)
  url.searchParams.set('queued', taskId)
  return NextResponse.redirect(url, 303)
}
