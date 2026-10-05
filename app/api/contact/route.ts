import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { randomUUID } from "node:crypto";
import { validateContact } from "@/lib/contact-validation";
import { insertGrowthRow, queryGrowthTable } from "@/lib/supabase-growth";

const CONTACT_TO_EMAIL =
  process.env.CONTACT_TO_EMAIL || "arnau.sastre@sc-analytics.io";

const requestWindows = new Map<string, { count: number; until: number }>();
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      const parsed = new URL(origin);
      if (
        !["http:", "https:"].includes(parsed.protocol) ||
        parsed.host !== req.headers.get("host")
      )
        return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    } catch {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
  }
  if (Number(req.headers.get("content-length") || 0) > 16000)
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  let body: unknown;
  try {
    const text = await req.text();
    if (text.length > 16000)
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
  const validation = validateContact(body);
  if ("error" in validation)
    return NextResponse.json({ error: validation.error }, { status: 400 });
  if ((body as Record<string, unknown>).website)
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  const { name, company, email, message, language, sourcePath, requestId } =
    validation.data;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const timestamp = Date.now();
  for (const [key, value] of requestWindows)
    if (value.until < timestamp) requestWindows.delete(key);
  const window = requestWindows.get(ip) || {
    count: 0,
    until: timestamp + 600000,
  };
  if (window.count >= 8)
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  window.count++;
  requestWindows.set(ip, window);
  if (requestWindows.size > 5000)
    requestWindows.delete(requestWindows.keys().next().value!);

  const now = new Date().toISOString();
  const inquiryId = `inquiry_${(requestId || randomUUID()).replaceAll("-", "")}`;
  // Stable request IDs prevent duplicate CRM rows on browser/network retries.
  try {
    const existing = await queryGrowthTable<{
      inquiry_id: string;
      email: string;
      message: string;
    }>(
      "website_inquiries",
      {
        tenant_id: "eq.sc-analytics",
        inquiry_id: `eq.${inquiryId}`,
        limit: "1",
      },
      { cacheSeconds: 0 },
    );
    if (existing[0]) {
      if (existing[0].email !== email || existing[0].message !== message)
        return NextResponse.json(
          { error: "Request identifier reused" },
          { status: 409 },
        );
      return NextResponse.json({
        ok: true,
        inquiry_id: inquiryId,
        notification: false,
        duplicate: true,
      });
    }
  } catch {
    /* Persistence below remains authoritative. */
  }
  try {
    await insertGrowthRow("website_inquiries", {
      inquiry_id: inquiryId,
      tenant_id: "sc-analytics",
      name,
      company: company || null,
      email,
      message,
      language,
      source_path: sourcePath,
      status: "new",
      created_at: now,
      updated_at: now,
    });
  } catch (err) {
    console.error("Failed to persist website inquiry", {
      inquiryId,
      error: err instanceof Error ? err.name : "UnknownError",
    });
    return NextResponse.json(
      { error: "Failed to save inquiry" },
      { status: 502 },
    );
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_SECURE } =
    process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    console.error(
      "Missing SMTP configuration environment variables; inquiry is safely stored in CRM",
    );
    return NextResponse.json({
      ok: true,
      inquiry_id: inquiryId,
      notification: false,
    });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE ? SMTP_SECURE === "true" : Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"SC-Analytics website" <${SMTP_USER}>`,
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `[SC-Analytics] ${name}${company ? ` — ${company}` : ""}`,
      text: `Name: ${name}\n${company ? `Company: ${company}\n` : ""}Email: ${email}\n\n${message}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        ${company ? `<p><strong>Company:</strong> ${escapeHtml(company)}</p>` : ""}
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      `,
    });
  } catch (err) {
    console.error("Contact notification failed; CRM review required", {
      inquiryId,
      error: err instanceof Error ? err.name : "UnknownError",
    });
    return NextResponse.json({
      ok: true,
      inquiry_id: inquiryId,
      notification: false,
    });
  }

  return NextResponse.json({
    ok: true,
    inquiry_id: inquiryId,
    notification: true,
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
