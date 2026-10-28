/**
 * Canonical index URL for one published knowledge article.
 * Unlocalized article routes are useful for visitors, but the indexed
 * representative has an explicit locale segment.
 */
export function knowledgeCanonicalPath(slug: string, locale: string = 'en'): string {
  const normalizedLocale = (locale === 'es' || locale === 'ca' || locale === 'en') ? locale : 'en'
  return `/knowledge/${slug}/${normalizedLocale}`
}

export function knowledgeCanonicalUrl(slug: string, locale: string = 'en'): string {
  return `https://www.sc-analytics.io${knowledgeCanonicalPath(slug, locale)}`
}
