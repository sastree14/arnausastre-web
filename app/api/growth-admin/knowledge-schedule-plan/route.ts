import { NextResponse } from 'next/server'
import editorialPlan from '@/content/editorial/knowledge_editorial_plan_v2.json'
import { isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow, type GrowthApproval, type GrowthContentItem } from '@/lib/growth-admin'
import { parseControlCenterDateTime } from '@/lib/control-center-time'

type PlanRow = {
  spec_id: string
  publication_order: number
}

const LANGUAGES = ['es', 'ca', 'en'] as const

function localSlot(baseRaw: string, dayOffset: number) {
  const match = baseRaw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!match) throw new Error('Invalid local start date')
  const [, y, m, d, hh, mm] = match
  const calendar = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm)))
  calendar.setUTCDate(calendar.getUTCDate() + dayOffset)
  const yy = calendar.getUTCFullYear()
  const mo = String(calendar.getUTCMonth() + 1).padStart(2, '0')
  const da = String(calendar.getUTCDate()).padStart(2, '0')
  return `${yy}-${mo}-${da}T${hh}:${mm}`
}

function parseCadence(value: string) {
  const cadence = value.split(',').map(part => Number(part.trim())).filter(day => Number.isInteger(day) && day > 0 && day <= 30)
  if (!cadence.length) throw new Error('Cadence must contain positive day intervals')
  return cadence
}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const form = await request.formData()
  const startLocal = String(form.get('start_local') || '').trim()
  const cadenceRaw = String(form.get('cadence_days') || '2,3').trim()

  let start: Date
  let cadence: number[]
  try {
    start = parseControlCenterDateTime(startLocal)
    cadence = parseCadence(cadenceRaw)
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : 'Invalid schedule', { status: 400 })
  }

  if (start.getTime() < Date.now() + 15 * 60 * 1000) {
    return new NextResponse('Choose a start time at least 15 minutes in the future', { status: 409 })
  }

  const content = await queryGrowthTable<GrowthContentItem>('content_items', {
    tenant_id: 'eq.sc-analytics',
    content_type: 'eq.article',
    channel: 'eq.website',
    limit: '1000',
  }, { cacheSeconds: 0 })
  const bankRows = content.filter(row => (row.critique as Record<string, unknown> | null)?.article_bank === true)

  const approvals = await queryGrowthTable<GrowthApproval>('approvals', {
    tenant_id: 'eq.sc-analytics',
    action_type: 'eq.publish_article',
    limit: '1000',
  }, { cacheSeconds: 0 })
  const approvedTargets = new Set(
    approvals
      .filter(row => row.status === 'approved' && row.payload?.source === 'knowledge_bank_v1')
      .map(row => row.target_id)
  )

  const bySpec = new Map<string, GrowthContentItem[]>()
  for (const row of bankRows) {
    const critique = row.critique as Record<string, unknown> | null
    const meta = critique?.article_meta as Record<string, unknown> | undefined
    const specId = String(meta?.spec_id || '')
    if (!specId) continue
    bySpec.set(specId, [...(bySpec.get(specId) || []), row])
  }

  const plan = (editorialPlan.articles as PlanRow[]).slice().sort((a, b) => a.publication_order - b.publication_order)
  const blockers: string[] = []

  for (const row of plan) {
    const family = bySpec.get(row.spec_id) || []
    const languages = new Set(family.map(item => String(item.language || '')))
    if (!LANGUAGES.every(language => languages.has(language))) {
      blockers.push(`${row.spec_id}: incomplete language family`)
      continue
    }
    const notApproved = family.filter(item => item.status !== 'approved' || !approvedTargets.has(item.content_id))
    if (notApproved.length) blockers.push(`${row.spec_id}: family not fully approved`)
  }

  if (blockers.length) {
    return new NextResponse(
      `Cannot schedule the Knowledge plan until all 200 families are approved. Blockers: ${blockers.slice(0, 20).join('; ')}${blockers.length > 20 ? `; +${blockers.length - 20} more` : ''}`,
      { status: 409 }
    )
  }

  let dayOffset = 0
  for (let index = 0; index < plan.length; index += 1) {
    if (index > 0) dayOffset += cadence[(index - 1) % cadence.length]
    const scheduledAt = parseControlCenterDateTime(localSlot(startLocal, dayOffset)).toISOString()
    const family = bySpec.get(plan[index].spec_id) || []
    await Promise.all(family.map(item => updateGrowthRow('content_items', 'content_id', item.content_id, {
      status: 'scheduled',
      scheduled_at: scheduledAt,
    })))
  }

  const url = new URL('/growth-admin/articles', request.url)
  url.searchParams.set('plan_scheduled', String(plan.length))
  url.searchParams.set('first_slot', start.toISOString())
  return NextResponse.redirect(url, 303)
}
