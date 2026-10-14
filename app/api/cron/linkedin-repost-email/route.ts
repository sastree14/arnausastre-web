import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { growthSupabaseHeaders, growthSupabaseUrl } from '@/lib/supabase-growth'

export const runtime = 'nodejs'
export const maxDuration = 60

// Avoid notifying about posts published before this integration was requested.
const ACTIVE_FROM = '2026-10-14T10:35:00Z'

type Published = {
  content_id: string
  title: string
  external_post_url: string | null
  published_at: string | null
}
type Notification = {
  content_id: string
  title: string
  post_url: string
  status: 'pending' | 'processing' | 'failed' | 'sent'
  attempts: number
  next_attempt_at: string | null
  lease_until: string | null
}
type ChangeOptions = { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown; prefer?: string }
async function requestDb<T>(
  table: string,
  params: Record<string, string> = {},
  options: ChangeOptions = {},
): Promise<T[]> {
  const url = new URL(`${growthSupabaseUrl()}/rest/v1/${table}`)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: growthSupabaseHeaders(options.prefer ? { Prefer: options.prefer } : {}),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error(`Notification database ${table} request failed (${response.status})`)
  const result = await response.text()
  return result ? JSON.parse(result) as T[] : []
}
function validPostUrl(url: string | null | undefined): url is string {
  return typeof url === 'string' && /^https:\/\/www\.linkedin\.com\/feed\/update\/urn:li:(?:share|ugcPost):\d+\/$/.test(url)
}
function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}
async function consumeInvocation(req: NextRequest): Promise<boolean> {
  const body: unknown = await req.json().catch(() => null)
  const nonce = body && typeof body === 'object' && 'nonce' in body ? String(body.nonce) : ''
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(nonce)) return false
  // A nonce is minted by the Supabase 5-minute scheduler and can be consumed once.
  // Validation is an atomic DELETE, with no reusable secrets in the HTTP request.
  const consumed = await requestDb<{ nonce: string }>('linkedin_notification_invocations', {
    nonce: `eq.${nonce}`, expires_at: `gt.${new Date().toISOString()}`, select: 'nonce',
  }, { method: 'DELETE', prefer: 'return=representation' })
  return consumed.length === 1
}
function due(row: Notification, now: number) {
  if (row.status === 'pending') return true
  if (row.status === 'failed') return !row.next_attempt_at || Date.parse(row.next_attempt_at) <= now
  return row.status === 'processing' && !!row.lease_until && Date.parse(row.lease_until) <= now
}

export async function POST(req: NextRequest) {
  if (!await consumeInvocation(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_SECURE } = process.env
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    return NextResponse.json({ error: 'Mail service is not configured' }, { status: 503 })
  }

  try {
    // Only confirmed personal LinkedIn posts qualify, never scheduled or uncertain jobs.
    const published = await requestDb<Published>('content_items', {
      select: 'content_id,title,external_post_url,published_at',
      channel: 'eq.arnau_linkedin',
      status: 'eq.published',
      published_at: `gte.${ACTIVE_FROM}`,
      external_post_url: 'not.is.null',
      order: 'published_at.desc',
      limit: '150',
    })
    for (const post of published) {
      if (!validPostUrl(post.external_post_url) || !post.published_at) continue
      await requestDb('linkedin_repost_notifications', { on_conflict: 'content_id' }, {
        method: 'POST',
        prefer: 'resolution=ignore-duplicates,return=minimal',
        body: {
          content_id: post.content_id,
          title: post.title,
          post_url: post.external_post_url,
          published_at: post.published_at,
        },
      })
    }

    const pending = await requestDb<Notification>('linkedin_repost_notifications', {
      select: 'content_id,title,post_url,status,attempts,next_attempt_at,lease_until',
      status: 'in.(pending,failed,processing)',
      order: 'created_at.asc',
      limit: '30',
    })
    const mailer = nodemailer.createTransport({
      host: SMTP_HOST, port: Number(SMTP_PORT),
      secure: SMTP_SECURE ? SMTP_SECURE === 'true' : Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    })
    let sent = 0, failed = 0
    for (const row of pending) {
      const now = Date.now()
      if (!due(row, now) || !validPostUrl(row.post_url)) continue
      const extra: Record<string,string> = {}
      if (row.status === 'processing') extra.lease_until = `lte.${new Date(now).toISOString()}`
      const claimed = await requestDb<Notification>('linkedin_repost_notifications', {
        content_id: `eq.${row.content_id}`,
        status: `eq.${row.status}`,
        ...extra,
        select: 'content_id',
      }, {
        method: 'PATCH',
        prefer: 'return=representation',
        body: {
          status: 'processing',
          attempts: row.attempts + 1,
          lease_until: new Date(now + 15 * 60 * 1000).toISOString(),
          updated_at: new Date(now).toISOString(),
        },
      })
      if (!claimed.length) continue // A different invocation already claimed it.
      const to = process.env.LINKEDIN_REPOST_NOTIFY_EMAIL || 'arnau.sastre@sc-analytics.io'
      try {
        const info = await mailer.sendMail({
          from: `"SC-Analytics · LinkedIn" <${SMTP_USER}>`,
          to,
          subject: `[SC-Analytics] Publicación lista para republicar · ${row.content_id}`,
          messageId: `<sc-linkedin-repost-${row.content_id.toLowerCase()}@sc-analytics.io>`,
          text: `Publicación confirmada en tu LinkedIn personal.\n\n${row.title}\nID: ${row.content_id}\n\nAbrir publicación: ${row.post_url}\n\nAcción pendiente: republicarla manualmente desde la página de SC-Analytics.\n\nEste aviso se ha generado después de confirmar su publicación.`,
          html: `<p>La publicación <strong>${escapeHtml(row.content_id)}</strong> ya está publicada en tu LinkedIn personal.</p><p><strong>${escapeHtml(row.title)}</strong></p><p><a href="${escapeHtml(row.post_url)}">Abrir publicación en LinkedIn</a></p><p><strong>Pendiente:</strong> republicarla manualmente desde la página de SC-Analytics.</p>`,
        })
        await requestDb('linkedin_repost_notifications', {
          content_id: `eq.${row.content_id}`, status: 'eq.processing',
        }, {
          method: 'PATCH', prefer: 'return=minimal',
          body: {
            status: 'sent', sent_at: new Date().toISOString(),
            message_id: info.messageId || null, lease_until: null,
            last_error: null, updated_at: new Date().toISOString(),
          },
        })
        sent++
      } catch (error) {
        failed++
        await requestDb('linkedin_repost_notifications', {
          content_id: `eq.${row.content_id}`, status: 'eq.processing',
        }, {
          method: 'PATCH', prefer: 'return=minimal',
          body: {
            status: 'failed', lease_until: null,
            next_attempt_at: new Date(Date.now() + 15 * Math.min(8, row.attempts + 1) * 60 * 1000).toISOString(),
            last_error: error instanceof Error ? error.message.slice(0,250) : 'Mail delivery failed',
            updated_at: new Date().toISOString(),
          },
        })
        console.error('LinkedIn repost notification failed', row.content_id)
      }
    }
    return NextResponse.json({ ok: true, confirmed_posts: published.length, sent, failed })
  } catch (error) {
    console.error('LinkedIn notification batch failed', error)
    return NextResponse.json({ error: 'Notification processing failed' }, { status: 500 })
  }
}
