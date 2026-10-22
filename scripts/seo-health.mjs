#!/usr/bin/env node
/**
 * SC-Analytics SEO health check.
 * Read-only, no paid API, no credentials and no new web services.
 * Run: npm run seo:health
 * Override: SEO_AUDIT_BASE_URL=https://preview-host npm run seo:health
 * Exit 1 for actionable errors; warnings are reported separately.
 */
import { URL } from 'node:url'

const origin = new URL(process.env.SEO_AUDIT_BASE_URL || 'https://www.sc-analytics.io').origin
const concurrency = 4
const timeoutMs = 20_000
const checkedAt = new Date().toISOString()
const issues = []
const findings = []
const report = (severity, code, url, detail) =>
  (severity === 'error' ? issues : findings).push({ code, url, detail })

async function request(url) {
  let lastError
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs),
        headers: { 'User-Agent': 'SC-Analytics-SEO-QA/1.0' },
      })
      return { response, text: await response.text() }
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

function attributes(tag) {
  const attrs = {}
  const rx = /([a-zA-Z][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
  for (const m of tag.matchAll(rx)) attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? ''
  return attrs
}

function headTags(html, tagName) {
  const result = []
  const regex = new RegExp('<' + tagName + '\\b[^>]*>', 'gi')
  for (const match of html.matchAll(regex)) result.push(attributes(match[0]))
  return result
}

const normalize = value => {
  try {
    const u = new URL(value)
    return u.origin + u.pathname.replace(/\/+$/, '') + u.search
  } catch {
    return value
  }
}

function metadata(html) {
  const links = headTags(html, 'link')
  const metas = headTags(html, 'meta')
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || ''
  const canons = links.filter(l => (l.rel || '').toLowerCase() === 'canonical').map(l => l.href)
  const alts = Object.fromEntries(links.filter(l => l.rel === 'alternate' && l.hreflang && l.href)
    .map(l => [l.hreflang, l.href]))
  const description = metas.find(m => m.name?.toLowerCase() === 'description')?.content || ''
  const robots = metas.find(m => m.name?.toLowerCase() === 'robots')?.content || ''
  const schemas = [...html.matchAll(/<script\b[^>]*type=(?:"application\/ld\+json"|'application\/ld\+json')[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(x => x[1])
  return { title, canons, alts, description, robots, schemas }
}

async function main() {
  const robotsUrl = origin + '/robots.txt'
  const robots = await request(robotsUrl)
  if (!robots.response.ok) report('error', 'ROBOTS_HTTP', robotsUrl, robots.response.status)
  if (!robots.text.includes('/sitemap.xml')) report('warning', 'ROBOTS_SITEMAP', robotsUrl, 'Sitemap not advertised')

  const sitemapUrl = origin + '/sitemap.xml'
  const sitemap = await request(sitemapUrl)
  if (!sitemap.response.ok) throw new Error('Sitemap HTTP ' + sitemap.response.status)
  const urls = [...sitemap.text.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map(x => x[1].trim().replaceAll('&amp;', '&'))
  if (urls.length === 0) throw new Error('Sitemap has no URLs')
  // Fail closed if a temporary database error silently drops most service
  // pages from the dynamic sitemap. Baseline: 93 public URLs (October 2026).
  const minimum = Number(process.env.SEO_MIN_SITEMAP_URLS || 85)
  if (Number.isFinite(minimum) && urls.length < minimum) {
    report('error', 'SITEMAP_MISSING_SECTIONS', sitemapUrl,
      `Only ${urls.length} URLs found; expected at least ${minimum}`)
  }

  const duplicates = urls.filter((url, index) => urls.indexOf(url) !== index)
  for (const url of new Set(duplicates)) report('error', 'DUPLICATE_SITEMAP_URL', url, 'Repeated <loc>')
  const unique = [...new Set(urls)]
  const pages = new Map()
  let next = 0
  async function worker() {
    while (next < unique.length) {
      const url = unique[next++]
      if (url !== origin && !url.startsWith(origin + '/')) {
        report('error', 'OUTSIDE_CANONICAL_ORIGIN', url, origin)
        continue
      }
      try {
        const { response, text } = await request(url)
        if (!response.ok) {
          report('error', 'PAGE_HTTP', url, String(response.status))
          continue
        }
        if (normalize(response.url) !== normalize(url)) {
          report('error', 'SITEMAP_REDIRECT', url, response.url)
        }
        const meta = metadata(text)
        pages.set(url, meta)
        if (meta.canons.length !== 1 || normalize(meta.canons[0]) !== normalize(url)) {
          report('error', 'CANONICAL', url, meta.canons)
        }
        if (!meta.title) report('error', 'TITLE_MISSING', url, '')
        else if (meta.title.length > 70) report('warning', 'LONG_TITLE', url, meta.title.length)
        if (!meta.description) report('warning', 'DESCRIPTION_MISSING', url, '')
        if (meta.robots.toLowerCase().includes('noindex')) {
          report('error', 'SITEMAP_NOINDEX', url, meta.robots)
        }
        for (const [lang, href] of Object.entries(meta.alts)) {
          if (!href.startsWith(origin + '/')) {
            report('error', 'HREFLANG_DOMAIN', url, { lang, href })
          } else if (!unique.includes(href)) {
            report('error', 'HREFLANG_MISSING_DESTINATION', url, { lang, href })
          }
        }
        const structuredTypes = new Set()
        for (const schema of meta.schemas) {
          try {
            const parsed = JSON.parse(schema)
            const nodes = Array.isArray(parsed['@graph']) ? parsed['@graph'] : [parsed]
            for (const item of nodes) {
              if (!item || typeof item !== 'object') continue
              const kind = item['@type']
              structuredTypes.add(kind)
              // Schema.org inLanguage is a CreativeWork/WebPage property,
              // not a Service property. This was incorrect on 23 landings.
              if (kind === 'Service' && Object.hasOwn(item, 'inLanguage')) {
                report('error', 'INVALID_SERVICE_LANGUAGE_DOMAIN', url,
                  'Move inLanguage from Service to a WebPage node')
              }
              if (kind === 'WebPage' && item.mainEntity?.['@id']?.endsWith('#service')
                  && !['en', 'es', 'ca'].includes(item.inLanguage)) {
                report('error', 'SERVICE_WEBPAGE_LANGUAGE', url,
                  'Commercial service WebPage needs a valid language')
              }
            }
          } catch {
            report('error', 'INVALID_JSONLD', url, 'Unparseable structured data')
          }
        }
        if (new URL(url).pathname.startsWith('/services/') &&
            !structuredTypes.has('Service')) {
          report('error', 'SERVICE_SCHEMA_MISSING', url, 'Expected a Service JSON-LD node')
        }
      } catch (error) {
        report('error', 'REQUEST_FAILED', url, String(error))
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()))

  for (const [sourceUrl, page] of pages) {
    if (Object.keys(page.alts).length === 0) continue
    for (const [lang, target] of Object.entries(page.alts)) {
      const targetPage = pages.get(target)
      if (!targetPage) continue
      if (!Object.values(targetPage.alts).includes(sourceUrl)) {
        report('error', 'HREFLANG_NOT_RECIPROCAL', sourceUrl, { lang, target })
      }
    }
  }

  const titleGroups = new Map()
  for (const [url, page] of pages) {
    if (!page.title) continue
    const group = titleGroups.get(page.title) || []
    group.push(url)
    titleGroups.set(page.title, group)
  }
  for (const [title, found] of titleGroups) {
    if (found.length > 1) report('warning', 'REPEATED_TITLE', found.join(', '), title)
  }

  const output = {
    checkedAt,
    origin,
    urlsInSitemap: urls.length,
    fetched: pages.size,
    errorCount: issues.length,
    warningCount: findings.length,
    errors: issues,
    warnings: findings,
  }
  console.log(JSON.stringify(output, null, 2))
  if (issues.length) process.exitCode = 1
}

main().catch(error => {
  console.error(JSON.stringify({ checkedAt, origin, fatal: String(error) }))
  process.exitCode = 1
})
