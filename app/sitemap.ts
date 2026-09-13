import type { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/content'
import { getAllProjects } from '@/lib/projects'
import { getPublicGeneratedArticles } from '@/lib/public-growth'

const BASE_URL = 'https://sc-analytics.io'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/knowledge`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/projects`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  const articleRoutes: MetadataRoute.Sitemap = getAllArticles().map((article) => ({
    url: `${BASE_URL}/knowledge/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const generated = await getPublicGeneratedArticles()
  const generatedBySlug = new Map<string, (typeof generated)[number]>()
  generated.forEach((article) => {
    const slug = article.brief_id || article.content_id
    const current = generatedBySlug.get(slug)
    if (!current || String(article.published_at || article.created_at || '') > String(current.published_at || current.created_at || '')) {
      generatedBySlug.set(slug, article)
    }
  })
  const generatedRoutes: MetadataRoute.Sitemap = [...generatedBySlug.entries()].map(([slug, article]) => ({
    url: `${BASE_URL}/knowledge/${slug}`,
    lastModified: new Date(article.published_at || article.created_at || Date.now()),
    changeFrequency: 'monthly',
    priority: 0.65,
  }))

  const projectRoutes: MetadataRoute.Sitemap = getAllProjects().map((project) => ({
    url: `${BASE_URL}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...articleRoutes, ...generatedRoutes, ...projectRoutes]
}
