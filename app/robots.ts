import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/growth-admin', '/growth-admin/', '/api/growth-admin/', '/api/linkedin/'],
    },
    sitemap: 'https://sc-analytics.io/sitemap.xml',
  }
}
