#!/usr/bin/env node
/**
 * Read-only SEO quality audit for the existing Supabase article publishing bank.
 *
 * Does NOT change article status, schedules, titles or publication workflow.
 * Required only for live mode: SUPABASE_URL and SUPABASE_SECRET_KEY.
 * Script output is intended for a trusted environment: article IDs may reveal
 * unpublished editorial topics. Never publish detailed reports in a public CI log.
 *
 * Usage:
 *   node --test scripts/tests/seo-editorial-audit.test.mjs
 *   node scripts/seo-editorial-audit.mjs
 */
import { pathToFileURL } from 'node:url'

const LANGS = ['es', 'ca', 'en']
const SLUG = /^[a-z0-9][a-z0-9_-]{1,179}$/i
const safeString = value => typeof value === 'string' ? value.trim() : ''
const metaOf = row => {
  const m = row?.critique?.article_meta
  return m && typeof m === 'object' && !Array.isArray(m) ? m : {}
}

export function auditEditorialRows(rows) {
  const failures = []
  const warnings = []
  const add = (severity, row, code) => {
    const result = { content_id: safeString(row.content_id), brief_id: safeString(row.brief_id), locale: row.language, code }
    ;(severity === 'error' ? failures : warnings).push(result)
  }
  const grouped = new Map()
  for (const row of rows) {
    if (!['scheduled', 'published'].includes(row.status)) continue
    const slug = safeString(row.brief_id || row.content_id)
    const language = safeString(row.language)
    const meta = metaOf(row)
    const seoTitle = safeString(meta.seo_title)
    const seoDescription = safeString(meta.seo_description)
    if (!SLUG.test(slug)) add('error', row, 'INVALID_SLUG')
    if (!LANGS.includes(language)) add('error', row, 'INVALID_LOCALE')
    if (safeString(row.body).length < 400) add('error', row, 'BODY_TOO_SHORT')
    if (row.status === 'scheduled' && !row.scheduled_at) add('error', row, 'MISSING_SCHEDULE')
    if (row.status === 'published' && !row.published_at) add('error', row, 'MISSING_PUBLICATION_TIME')
    if (!seoTitle) add('warning', row, 'MISSING_META_TITLE')
    else if (seoTitle.length > 70) add('warning', row, 'LONG_META_TITLE')
    if (!seoDescription) add('warning', row, 'MISSING_META_DESCRIPTION')
    else if (seoDescription.length < 70) add('warning', row, 'SHORT_META_DESCRIPTION')
    else if (seoDescription.length > 160) add('warning', row, 'LONG_META_DESCRIPTION')
    if (!safeString(meta.knowledge_area)) add('warning', row, 'MISSING_KNOWLEDGE_AREA')
    if (!safeString(meta.primary_keyword)) add('warning', row, 'MISSING_PRIMARY_KEYWORD')
    if (!safeString(meta.search_intent)) add('warning', row, 'MISSING_SEARCH_INTENT')

    // Links declared in the editorial record should be internal, HTTPS, or empty.
    // They are not automatically published, and this audit does not HTTP-fetch them.
    for (const key of ['related_article', 'related_case']) {
      const link = safeString(meta[key])
      if (link && !(link.startsWith('/') && !link.startsWith('//')) && !/^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(link)) {
        add('warning', row, key.toUpperCase() + '_SUSPICIOUS_LINK')
      }
    }
    if (!grouped.has(slug)) grouped.set(slug, [])
    grouped.get(slug).push({ row, title: seoTitle, language })
  }
  for (const versions of grouped.values()) {
    const byLocale = new Set(versions.map(v => v.language))
    if (versions.some(v => v.row.status === 'scheduled')) {
      for (const locale of LANGS) if (!byLocale.has(locale)) {
        add('warning', versions[0].row, 'MISSING_TRANSLATION_' + locale.toUpperCase())
      }
    }
    for (const item of versions) {
      if (item.title && versions.some(other => other !== item && other.language !== item.language && other.title === item.title)) {
        add('warning', item.row, 'CROSS_LOCALE_DUPLICATE_META_TITLE')
      }
    }
  }
  return {
    records: rows.length,
    articles: grouped.size,
    errors: failures,
    warnings,
    byCode: Object.fromEntries(
      [...failures, ...warnings].reduce((counts, issue) => counts.set(issue.code, (counts.get(issue.code) || 0) + 1), new Map())
    ),
  }
}

async function readEditorialRows() {
  const url = safeString(process.env.SUPABASE_URL).replace(/\/+$/, '')
  const token = safeString(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (!url || !token) throw new Error('SUPABASE_URL and an existing server-only Supabase secret are required')
  if (!/^https:\/\/[a-z0-9.-]+\.supabase\.co$/i.test(url)) throw new Error('Unexpected Supabase URL origin')
  const all = []
  let offset = 0
  for (;;) {
    const path = new URL(url + '/rest/v1/content_items')
    path.searchParams.set('select', 'content_id,brief_id,language,title,body,status,scheduled_at,published_at,critique')
    path.searchParams.set('tenant_id', 'eq.sc-analytics')
    path.searchParams.set('channel', 'eq.website')
    path.searchParams.set('content_type', 'eq.article')
    path.searchParams.set('status', 'in.(scheduled,published)')
    path.searchParams.set('order', 'content_id.asc')
    path.searchParams.set('limit', '250')
    path.searchParams.set('offset', String(offset))
    const response = await fetch(path, {
      headers: { apikey: token, Authorization: 'Bearer ' + token, Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    })
    if (!response.ok) throw new Error('Supabase read returned ' + response.status)
    const page = await response.json()
    if (!Array.isArray(page)) throw new Error('Unexpected Supabase data shape')
    all.push(...page)
    if (page.length < 250) return all
    offset += page.length
    if (offset > 10000) throw new Error('Too many rows')
  }
}

async function main() {
  const rows = await readEditorialRows()
  const audit = auditEditorialRows(rows)
  console.log(JSON.stringify({
    records: audit.records,
    articles: audit.articles,
    errorCount: audit.errors.length,
    warningCount: audit.warnings.length,
    byCode: audit.byCode,
  }, null, 2))
  // Avoid dumping article IDs and other confidential content in shared logs.
  if (audit.errors.length) process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error('Editorial SEO audit could not finish:', String(error))
    process.exitCode = 1
  })
}
