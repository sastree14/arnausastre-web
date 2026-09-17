import type { MetadataRoute } from 'next'
export default function robots():MetadataRoute.Robots{return{rules:[{userAgent:'*',allow:'/',disallow:['/growth-admin/','/api/growth-admin/']}],sitemap:'https://sc-analytics.io/sitemap.xml',host:'https://sc-analytics.io'}}
