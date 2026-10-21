import 'server-only'
import { queryGrowthTable } from '@/lib/supabase-growth'
import { readSeoPages } from '@/lib/seo-postgrest-pagination'

export type SeoSearchMetric={
  metric_date:string
  query:string
  page:string
  clicks:number|string
  impressions:number|string
  ctr:number|string
  position:number|string
}

/**
 * Only fetch recent records used in the admin SEO reporting view.
 * Uses small stable PostgREST pages to avoid the default max_rows cap.
 * No data is sent to the public site.
 */
export async function getRecentSeoSearchMetrics(fromISODate:string){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(fromISODate))
    throw new Error('Invalid GSC date filter')
  return readSeoPages<SeoSearchMetric>(
    (offset,limit)=>queryGrowthTable<SeoSearchMetric>('search_console_daily',{
      select:'metric_date,query,page,clicks,impressions,ctr,position',
      tenant_id:'eq.sc-analytics',
      metric_date:`gte.${fromISODate}`,
      order:'metric_date.desc,impressions.desc',
      limit:String(limit),
      offset:String(offset),
    },{cacheSeconds:0,timeoutMs:9500}),
    500,12,
  )
}
