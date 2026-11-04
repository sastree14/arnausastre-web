import { cache } from 'react'
import { queryGrowthTable } from '@/lib/supabase-growth'
import {
  buildHubServiceDirectory,
  type PublishedServiceRow,
  type ActiveServiceTarget
} from '@/lib/service-hub-directory'

/** Only published SEO pages can be suggested in public navigation.
 * A new page appears automatically once it is published, assigned a reviewed
 * content_locale and has an active service_area target or an explicit hub_key.
 * Keep this list fresh rather than freezing the directory in application code.
 */
export const getPublicServiceHubDirectory = cache(async () => {
  try {
    const [pages, targets] = await Promise.all([
      queryGrowthTable<PublishedServiceRow>('seo_pages',{
        select:'slug,content_locale,hub_key,primary_keyword,h1,status',
        tenant_id:'eq.sc-analytics',status:'eq.published',limit:'300'
      },{cacheSeconds:60,timeoutMs:9000}),
      queryGrowthTable<ActiveServiceTarget>('seo_keyword_targets',{
        select:'target_path,service_area,status,priority',
        tenant_id:'eq.sc-analytics',status:'eq.active',limit:'500'
      },{cacheSeconds:60,timeoutMs:9000}),
    ])
    return buildHubServiceDirectory(pages,targets)
  } catch(error) {
    // Never invent pages on a database outage or leak draft-only content.
    console.error('Service hub directory temporarily unavailable',error)
    return []
  }
})
