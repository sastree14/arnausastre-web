import { SERVICE_HUBS, SERVICE_HUB_ORDER, type ServiceHubKey } from './service-hubs.ts'
import { SERVICE_LANGUAGE_GROUPS, type CommercialLocale } from './seo-service-locales.ts'

/** The database is the source of truth for which specialist landings are published.
 * A landing is linked only if its language is explicitly reviewed as en/es/ca.
 * New pages can join a hub by a service-area target or an explicit hub_key.
 */
export type PublishedServiceRow = {
  slug: string
  content_locale?: string | null
  hub_key?: string | null
  primary_keyword?: string | null
  h1?: string | null
  status: string
}
export type ActiveServiceTarget = {
  target_path?: string | null
  service_area?: string | null
  status: string
  priority?: number | string | null
}
export type HubServiceLink = {
  slug: string
  label: string
  locale: CommercialLocale
  hubKeys: ServiceHubKey[]
  priority: number
}

const LOCALES = new Set<string>(['en','es','ca'])
const HUBS = new Set<string>(SERVICE_HUB_ORDER)
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// Exact names of service_area values written by the current keyword planner.
const AREA_TO_HUB: Record<string,ServiceHubKey> = {
  'ai automation & agents': 'ai',
  'forecasting & planning': 'forecasting',
  'optimization / or': 'optimisation',
  'pricing & revenue': 'optimisation',
  'machine learning': 'ml',
  'data & ai strategy': 'ml',
  'data engineering': 'analytics',
  'bi & decision intelligence': 'analytics',
  'supply chain / logistics': 'analytics',
  'simulation & modelling': 'simulation',
  'simulation and modelling': 'simulation'
}

const curated = new Map<string, Array<{hubKey: ServiceHubKey; label: string; rank: number}>>()
for (const key of SERVICE_HUB_ORDER) {
  SERVICE_HUBS[key].related.forEach(([slug,label], rank) => {
    const previous = curated.get(slug) || []
    previous.push({hubKey: key,label,rank})
    curated.set(slug,previous)
  })
}

const groupOfSlug = new Map<string,string>()
for (const [groupKey,variants] of Object.entries(SERVICE_LANGUAGE_GROUPS)) {
  for (const slug of Object.values(variants)) {
    if (typeof slug === 'string') groupOfSlug.set(slug,groupKey)
  }
}

function readableLabel(row: PublishedServiceRow): string {
  const text = String(row.primary_keyword || row.h1 || row.slug.replaceAll('-',' ')).trim()
  // Editorially reviewed labels from the registry take precedence for known pages.
  return text.length <= 54 ? text.charAt(0).toUpperCase() + text.slice(1)
    : text.slice(0,51).trimEnd() + '…'
}

/** Deterministic, read-only directory builder; no speculative URLs or translations. */
export function buildHubServiceDirectory(
  published: readonly PublishedServiceRow[],
  targets: readonly ActiveServiceTarget[]
): HubServiceLink[] {
  const targetAreas = new Map<string, {key: ServiceHubKey; priority:number}[]>()
  for (const target of targets) {
    if (target.status !== 'active') continue
    const match = /^\/services\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(String(target.target_path||''))
    if (!match) continue
    const key = AREA_TO_HUB[String(target.service_area||'').toLowerCase().trim()]
    if (!key) continue
    const matches = targetAreas.get(match[1]) || []
    matches.push({key,priority:Number(target.priority)||0})
    targetAreas.set(match[1], matches)
  }

  const bySlug = new Map<string,HubServiceLink>()
  for (const row of published) {
    if (row.status !== 'published' || !SLUG.test(row.slug) ||
        !LOCALES.has(String(row.content_locale||''))) continue
    const locale = row.content_locale as CommercialLocale
    const seeds = curated.get(row.slug) || []
    const override = HUBS.has(String(row.hub_key||'')) ? row.hub_key as ServiceHubKey : null
    const areas = targetAreas.get(row.slug) || []
    const hubKeys:ServiceHubKey[] = override ? [override]
      : [...new Set<ServiceHubKey>([...seeds.map(s=>s.hubKey),...areas.map(a=>a.key)])]
    if (!hubKeys.length) continue
    const label = seeds[0]?.label || readableLabel(row)
    bySlug.set(row.slug,{slug:row.slug,label,locale,hubKeys,
      priority:Math.max(0,...areas.map(x=>x.priority))})
  }
  return [...bySlug.values()]
}

/** Select one destination for each topic and *only* the currently selected language. */
export function selectHubServiceLinks(
  links: readonly HubServiceLink[], hubKey: ServiceHubKey, locale: CommercialLocale
): HubServiceLink[] {
  const selected = links.filter(link=>link.locale===locale && link.hubKeys.includes(hubKey))
  const order = new Map<string,number>(SERVICE_HUBS[hubKey].related.map(([slug],index)=>[slug,index]))
  selected.sort((a,b)=>(order.get(a.slug)??999)-(order.get(b.slug)??999) ||
    b.priority-a.priority || a.label.localeCompare(b.label,locale))
  const seenGroups = new Set<string>()
  return selected.filter(link=>{
    const group = groupOfSlug.get(link.slug) || link.slug
    if (seenGroups.has(group)) return false
    seenGroups.add(group)
    return true
  })
}
