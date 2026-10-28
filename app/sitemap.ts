import type { MetadataRoute } from 'next'

// Knowledge content is published independently of Vercel deploys by Supabase
// cron. The sitemap MUST be generated at request time, otherwise Next.js can
// freeze its XML during a build and never list newly published knowledge pages.
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { getAllArticles } from '@/lib/content'
import { getAllProjects } from '@/lib/projects'
import { queryGrowthTable } from '@/lib/supabase-growth'
import { getPublishedKnowledgeSitemapRows } from '@/lib/public-knowledge-sitemap'

type SeoPage={slug:string;updated_at?:string;status:string}

function uniqueByUrl(entries:MetadataRoute.Sitemap):MetadataRoute.Sitemap{
  const seen=new Set<string>()
  return entries.filter(entry=>{
    if(seen.has(entry.url))return false
    seen.add(entry.url)
    return true
  })
}

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const base='https://www.sc-analytics.io'
  const staticRoutes:MetadataRoute.Sitemap=['','/services','/projects','/knowledge','/about','/contact','/partner-analitico','/briefing'].map(path=>({
    url:`${base}${path}`,
    changeFrequency:path===''?'weekly':'monthly',
    priority:path===''?1:0.8,
  }))

  const repositoryContent:MetadataRoute.Sitemap=[
    ...getAllArticles().flatMap(article=>(['en','es','ca'] as const).map(locale=>({
      url:`${base}/knowledge/${article.slug}/${locale}`,
      lastModified:article.date?new Date(article.date):undefined,
      changeFrequency:'monthly' as const,
      priority:0.72,
    }))),
    ...getAllProjects().map(project=>({
      url:`${base}/projects/${project.slug}`,
      changeFrequency:'monthly' as const,
      priority:0.78,
    })),
  ]

  // Read the published-service index without fetch caching so newly approved
  // landings enter the sitemap on the next request; the sitemap route is dynamic.
  // Retrieve service and article sources independently: one transient backend
  // failure must not erase the other inventory from XML.
  const [serviceResult, articleResult] = await Promise.allSettled([
    queryGrowthTable<SeoPage>('seo_pages',{
      select:'slug,updated_at,status',tenant_id:'eq.sc-analytics',status:'eq.published',
      order:'slug.asc',limit:'200',
    },{cacheSeconds:0,timeoutMs:10000,retries:1}),
    getPublishedKnowledgeSitemapRows(),
  ])
  // A 200 response omitting an entire category is more damaging than a
  // temporary error: crawlers could treat previously indexed URLs as removed.
  // Fail the request so Google retries rather than publishing incomplete XML.
  if(serviceResult.status==='rejected'){
    console.error('SEO sitemap service index unavailable',serviceResult.reason)
    throw new Error('SEO sitemap unavailable: published service index could not be verified')
  }
  if(articleResult.status==='rejected'){
    console.error('SEO sitemap knowledge index unavailable',articleResult.reason)
    throw new Error('SEO sitemap unavailable: published knowledge index could not be verified')
  }
  const pages=serviceResult.value
  const articles=articleResult.value
  const dynamicRoutes:MetadataRoute.Sitemap=[
    ...pages.map(row=>({url:`${base}/services/${row.slug}`,lastModified:row.updated_at?new Date(row.updated_at):new Date(),changeFrequency:'monthly' as const,priority:0.85})),
    ...articles.map(row=>({url:row.language?`${base}/knowledge/${row.brief_id||row.content_id}/${row.language}`:`${base}/knowledge/${row.brief_id||row.content_id}`,lastModified:row.published_at?new Date(row.published_at):new Date(),changeFrequency:'monthly' as const,priority:0.72})),
  ]
  return uniqueByUrl([...staticRoutes,...repositoryContent,...dynamicRoutes])
}
