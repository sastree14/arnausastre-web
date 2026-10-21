/**
 * Conservative categories for the Search Console query dimension.
 * Branded: clearly the business/founder name.
 * Ambiguous: short SC/close abbreviations, which are not reliable independent
 * commercial demand even if the website happens to appear for them.
 * Nonbrand: contains no recognized brand/founder reference.
 */
export type OrganicQueryClass='branded'|'ambiguous'|'nonbrand'|'unavailable'
const BRAND=/(?:\bsc[\s-]?analytics\b|\bscanalytics\b|\bsc[\s-]?analytix\b|\b(?:arnau\s+)?sastre(?:\s+conde)?\b)/i
const AMBIGUOUS=/(?:\bsc\b|\bscdata\b|\bscca\b|\bscio\b)/i

export function classifyOrganicSearchQuery(input:string|null|undefined):OrganicQueryClass {
  const query=String(input||'').trim()
  if(!query)return 'unavailable'
  if(BRAND.test(query))return 'branded'
  if(AMBIGUOUS.test(query))return 'ambiguous'
  return 'nonbrand'
}
