import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { syncCalendlyCrm } from '@/lib/calendly-crm'

function verifySignature(rawBody: string, header: string, signingKey: string) {
  const parts = Object.fromEntries(header.split(',').map((part) => {
    const [key, ...rest] = part.trim().split('=')
    return [key, rest.join('=')]
  }))
  const timestamp = parts.t
  const signature = parts.v1
  if (!timestamp || !signature) return false

  const ts = Number(timestamp)
  if (!Number.isFinite(ts)) return false
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - ts) > 300) return false

  const expected = createHmac('sha256', signingKey).update(`${timestamp}.${rawBody}`).digest('hex')
  const expectedBuffer = Buffer.from(expected)
  const actualBuffer = Buffer.from(signature)
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer)
}

export async function POST(request: Request) {
  const signingKey = (process.env.CALENDLY_WEBHOOK_SIGNING_KEY || '').trim()
  if (!signingKey) return new NextResponse('Calendly signing key not configured', { status: 503 })

  const rawBody = await request.text()
  const signature = request.headers.get('Calendly-Webhook-Signature') || ''
  if (!verifySignature(rawBody, signature, signingKey)) return new NextResponse('Invalid signature', { status: 401 })

  try {
    const payload = JSON.parse(rawBody || '{}')
    const event = String(payload?.event || '')
    if (!['invitee.created', 'invitee.canceled'].includes(event)) return NextResponse.json({ ok: true, ignored: event })
    const result = await syncCalendlyCrm()
    return NextResponse.json({ ok: true, event, synced: result.meetings_synced })
  } catch (error) {
    console.error('Calendly webhook processing failed', error)
    return new NextResponse('Webhook processing failed', { status: 500 })
  }
}
