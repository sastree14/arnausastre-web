import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getBankArticle } from '@/lib/article-bank'
import {
  insertGrowthRow,
  isGrowthAdminAuthenticated,
  queryGrowthTable,
  updateGrowthRow,
  type GrowthApproval,
  type GrowthContentItem,
} from '@/lib/growth-admin'

const LANGUAGES = ['es', 'ca', 'en'] as const

function safeReturnTo(value: string) {
  return value.startsWith('/growth-admin/') ? value : '/growth-admin/articles'
}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const form = await request.formData()
  const specId = String(form.get('spec_id') || '').trim()
  const decision = String(form.get('decision') || '').trim()
  const returnTo = safeReturnTo(String(form.get('return_to') || '/growth-admin/articles'))

  if (!specId || !['approved', 'changes_requested'].includes(decision)) {
    return new NextResponse('Invalid knowledge-family decision', { status: 400 })
  }

  const article = getBankArticle(specId)
  if (!article) return new NextResponse('Knowledge article not found', { status: 404 })

  const family = await queryGrowthTable<GrowthContentItem>('content_items', {
    tenant_id: 'eq.sc-analytics',
    content_type: 'eq.article',
    channel: 'eq.website',
    brief_id: `eq.${article.slug}`,
    limit: '10',
  }, { cacheSeconds: 0 })

  const byLanguage = new Map(family.map(row => [String(row.language || ''), row]))
  const missing = LANGUAGES.filter(language => !byLanguage.has(language))
  if (missing.length) {
    return new NextResponse(`Article family is incomplete: missing ${missing.join(', ')}`, { status: 409 })
  }

  const now = new Date().toISOString()

  for (const language of LANGUAGES) {
    const item = byLanguage.get(language)!
    const approvals = await queryGrowthTable<GrowthApproval>('approvals', {
      target_id: `eq.${item.content_id}`,
      action_type: 'eq.publish_article',
      order: 'created_at.desc',
      limit: '10',
    }, { cacheSeconds: 0 })
    const approval = approvals[0]

    if (decision === 'approved') {
      await updateGrowthRow('content_items', 'content_id', item.content_id, {
        status: 'approved',
        scheduled_at: null,
      })

      const payload = {
        ...(approval?.payload || {}),
        content_id: item.content_id,
        brief_id: article.slug,
        language,
        spec_id: article.spec_id,
        source: 'knowledge_bank_v1',
        execution_mode: 'website_publish_after_schedule',
        family_reviewed: true,
        family_reviewed_at: now,
      }

      if (approval) {
        await updateGrowthRow('approvals', 'approval_id', approval.approval_id, {
          status: 'approved',
          decided_at: now,
          executed_at: null,
          payload,
        })
      } else {
        await insertGrowthRow('approvals', {
          approval_id: `approval_${randomUUID().replaceAll('-', '').slice(0, 12)}`,
          tenant_id: 'sc-analytics',
          action_type: 'publish_article',
          target_id: item.content_id,
          summary: `Knowledge family approved: ${item.title}`,
          payload,
          status: 'approved',
          created_at: now,
          decided_at: now,
        })
      }
    } else {
      const critique = {
        ...(item.critique || {}),
        family_review: {
          status: 'changes_requested',
          reviewed_at: now,
          spec_id: article.spec_id,
        },
      }
      await updateGrowthRow('content_items', 'content_id', item.content_id, {
        status: 'needs_review',
        scheduled_at: null,
        critique,
      })

      if (approval) {
        await updateGrowthRow('approvals', 'approval_id', approval.approval_id, {
          status: 'pending',
          decided_at: null,
          executed_at: null,
          payload: {
            ...(approval.payload || {}),
            family_reviewed: false,
            changes_requested_at: now,
          },
        })
      }
    }
  }

  const url = new URL(returnTo, request.url)
  url.searchParams.set(decision === 'approved' ? 'family_approved' : 'family_changes', specId)
  return NextResponse.redirect(url, 303)
}
