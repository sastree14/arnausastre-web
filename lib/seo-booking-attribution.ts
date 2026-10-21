/**
 * First-party, low-data attribution for commercial pages and Calendly.
 * Tracks a service route, never a person, session identifier or cookie.
 */
const REF_PATTERN=/^service:([a-z0-9]+(?:-[a-z0-9]+)*)$/

export function serviceSlugFromRef(value:string|null|undefined):string|null {
  const match=REF_PATTERN.exec(String(value||''))
  return match && match[1].length<=110 ? match[1]:null
}
export function serviceSlugFromInquiryPath(sourcePath:string|null|undefined):string|null {
  try {
    const url=new URL(sourcePath||'', 'https://www.sc-analytics.io')
    if(url.origin!=='https://www.sc-analytics.io' || url.pathname!=='/contact')return null
    return serviceSlugFromRef(url.searchParams.get('ref'))
  }catch{return null}
}
export function calendlyDiscoveryLink(serviceRef:string|null|undefined):string {
  const url=new URL('https://calendly.com/arnau-sastre-sc-analytics')
  url.searchParams.set('utm_source','sc_analytics_website')
  url.searchParams.set('utm_medium','website')
  url.searchParams.set('utm_campaign','discovery')
  const slug=serviceSlugFromRef(serviceRef)
  if(slug)url.searchParams.set('utm_content','service:'+slug)
  return url.toString()
}
export type BookingAttribution={
  source:'sc_analytics_website'
  medium:'website'
  campaign:'discovery'
  service_slug:string|null
}
export function bookingAttributionFromInvitee(tracking:unknown):BookingAttribution|null {
  if(!tracking||typeof tracking!=='object'||Array.isArray(tracking))return null
  const v=tracking as Record<string,unknown>
  if(v.utm_source!=='sc_analytics_website' || v.utm_medium!=='website' || v.utm_campaign!=='discovery')return null
  const slug=serviceSlugFromRef(typeof v.utm_content==='string'?v.utm_content:null)
  return {source:'sc_analytics_website',medium:'website',campaign:'discovery',service_slug:slug}
}
