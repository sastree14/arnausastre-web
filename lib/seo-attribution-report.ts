import { serviceSlugFromInquiryPath } from '@/lib/seo-booking-attribution'

type Inquiry={source_path?:string|null}
type Meeting={
  provider?:string|null
  status?:string|null
  metadata?:Record<string,unknown>|null
}
export type SeoFunnelReport={
  inquiries:number
  attributedServiceInquiries:number
  confirmedCalendlyMeetings:number
  websiteAttributedBookings:number
  sourceByService:Record<string,{inquiries:number;bookings:number}>
}

/**
 * These are four INDEPENDENT observations, not one assumed user journey:
 * - Form received, possibly from an explicit service URL;
 * - Actual scheduled event synchronized from Calendly;
 * - A Calendly event bearing our non-personal website UTM values.
 * No click is counted as a booked meeting and no email identity is joined.
 */
export function summarizeSeoFunnel(inquiries:Inquiry[],meetings:Meeting[]):SeoFunnelReport{
  const sourceByService:Record<string,{inquiries:number;bookings:number}>={}
  const ensure=(slug:string)=>sourceByService[slug] ||= {inquiries:0,bookings:0}
  for(const inquiry of inquiries){
    const slug=serviceSlugFromInquiryPath(inquiry.source_path)
    if(slug)ensure(slug).inquiries++
  }
  const confirmed=meetings.filter(m=>m.provider==='calendly'&&m.status==='active')
  let websiteAttributedBookings=0
  for(const meeting of confirmed){
    const attr=meeting.metadata?.booking_attribution
    if(!attr||typeof attr!=='object'||Array.isArray(attr))continue
    const a=attr as Record<string,unknown>
    if(a.source!=='sc_analytics_website'||a.medium!=='website'||a.campaign!=='discovery')continue
    websiteAttributedBookings++
    if(typeof a.service_slug==='string' && /^([a-z0-9]+-?)+$/.test(a.service_slug) && a.service_slug.length<=110)
      ensure(a.service_slug).bookings++
  }
  return {
    inquiries:inquiries.length,
    attributedServiceInquiries:Object.values(sourceByService).reduce((n,item)=>n+item.inquiries,0),
    confirmedCalendlyMeetings:confirmed.length,
    websiteAttributedBookings,
    sourceByService,
  }
}
