import type { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/content'
import { getAllProjects } from '@/lib/projects'
import { queryGrowthTable } from '@/lib/supabase-growth'

type SeoPage={slug:string;updated_at?:string;status:string}
type Article={brief_id?:string;content_id:string;language?:string;published_at?:string;status:string}

function uniqueByUrl(entries:MetadataRoute.Sitemap):MetadataRoute.Sitemap{
  const seen=new Set<string>()
  return entries.filter(entry=>{
    if(seen.has(entry.url))return false
    seen.add(entry.url)
    return true
  })
}

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const base='https://sc-analytics.io'
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

  try{
    const[pages,articles]=await Promise.all([
      queryGrowthTable<SeoPage>('seo_pages',{tenant_id:'eq.sc-analytics',status:'eq.published',limit:'200'},{cacheSeconds:300}),
      queryGrowthTable<Article>('content_items',{content_type:'eq.article',status:'eq.published',order:'published_at.desc',limit:'200'},{cacheSeconds:300}),
    ])
    const dynamicRoutes:MetadataRoute.Sitemap=[
      ...pages.map(row=>({url:`${base}/services/${row.slug}`,lastModified:row.updated_at?new Date(row.updated_at):new Date(),changeFrequency:'monthly' as const,priority:0.85})),
      ...articles.map(row=>({url:row.language?`${base}/knowledge/${row.brief_id||row.content_id}/${row.language}`:`${base}/knowledge/${row.brief_id||row.content_id}`,lastModified:row.published_at?new Date(row.published_at):new Date(),changeFrequency:'monthly' as const,priority:0.72})),
    ]
    return uniqueByUrl([...staticRoutes,...repositoryContent,...dynamicRoutes])
  }catch{
    return uniqueByUrl([...staticRoutes,...repositoryContent])
  }
}
