import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { randomUUID } from 'node:crypto'
import { insertGrowthRow } from '@/lib/supabase-growth'

const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'arnau.sastre@sc-analytics.io'

export async function POST(req: NextRequest) {
  let body: { name?: string; company?: string; email?: string; message?: string; language?: string; sourcePath?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const name = (body.name || '').trim()
  const company = (body.company || '').trim()
  const email = (body.email || '').trim()
  const message = (body.message || '').trim()
  const language = ['es','ca','en'].includes(String(body.language)) ? String(body.language) : 'es'
  const sourcePath = String(body.sourcePath || '/contact').trim().slice(0,500)

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
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
