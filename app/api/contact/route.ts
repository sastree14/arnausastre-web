import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { randomUUID } from 'node:crypto'
import { insertGrowthRow } from '@/lib/supabase-growth'
import { readLimitedJson, RequestSizeError } from '@/lib/security/request-guards'
import { enforcePublicRateLimit, RateLimitExceeded } from '@/lib/security/public-throttle'

const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'arnau.sastre@sc-analytics.io'
const PRIVACY_NOTICE_VERSION = '2026-10-21-v1'

export async function POST(req: NextRequest) {
  let body: Record<string,unknown>
  try {
    body = await readLimitedJson(req,24*1024)
  } catch(error) {
    return NextResponse.json({error:error instanceof RequestSizeError?'Request too large':'Invalid request body'},
      {status:error instanceof RequestSizeError?413:400})
  }

  const name = typeof body.name==='string'?body.name.trim():''
  const company = typeof body.company==='string'?body.company.trim():''
  const email = typeof body.email==='string'?body.email.trim():''
  const message = typeof body.message==='string'?body.message.trim():''
  const language = ['es','ca','en'].includes(String(body.language)) ? String(body.language) : 'es'
  const sourcePath = String(body.sourcePath || '/contact').trim().slice(0,500)

  // This is acknowledgement of the privacy information, not consent to marketing.
  // Reject requests that bypass the mandatory checkbox in the browser.
  if (body.privacyNoticeAcknowledged !== true) {
    return NextResponse.json({ error: 'Privacy information acknowledgment required' }, { status: 400 })
  }

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  if(name.length>120||company.length>160||email.length>254||message.length>8000)
    return NextResponse.json({error:'Input exceeds maximum length'},{status:422})

  try { await enforcePublicRateLimit(req,'contact',12,3600) } catch(error) {
    if(error instanceof RateLimitExceeded)
      return NextResponse.json({error:'Too many requests, please try again later'},{status:429,headers:{'Retry-After':String(error.retryAfter)}})
    console.error('Contact rate limit unavailable',error)
    return NextResponse.json({error:'Contact service temporarily unavailable'},{status:503})
  }

  const now = new Date().toISOString()
  const inquiryId = `inquiry_${randomUUID().replaceAll('-', '').slice(0,16)}`
  try {
    await insertGrowthRow('website_inquiries', {
      inquiry_id: inquiryId,
      tenant_id: 'sc-analytics',
      name,
      company: company || null,
      email,
      message,
      language,
      source_path: sourcePath,
      privacy_notice_version: PRIVACY_NOTICE_VERSION,
      privacy_notice_acknowledged_at: now,
      status: 'new',
      created_at: now,
      updated_at: now,
    })
  } catch (err) {
    console.error('Failed to persist website inquiry', err)
    return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 502 })
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_SECURE } = process.env

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    console.error('Missing SMTP configuration environment variables; inquiry is safely stored in CRM')
    return NextResponse.json({ ok: true, inquiry_id: inquiryId, notification: false })
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE ? SMTP_SECURE === 'true' : Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  })

  try {
    await transporter.sendMail({
      from: `"SC-Analytics website" <${SMTP_USER}>`,
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `[SC-Analytics] ${name}${company ? ` — ${company}` : ''}`,
      text: `Name: ${name}\n${company ? `Company: ${company}\n` : ''}Email: ${email}\n\n${message}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        ${company ? `<p><strong>Company:</strong> ${escapeHtml(company)}</p>` : ''}
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
      `,
    })
  } catch (err) {
    console.error('Failed to send contact email; inquiry remains stored in CRM', err)
    return NextResponse.json({ ok: true, inquiry_id: inquiryId, notification: false })
  }

  return NextResponse.json({ ok: true, inquiry_id: inquiryId, notification: true })
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
