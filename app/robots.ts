import type { MetadataRoute } from 'next'
export default function robots():MetadataRoute.Robots{return{rules:[{userAgent:'*',allow:'/',disallow:['/growth-admin/','/api/']}],sitemap:'https://www.sc-analytics.io/sitemap.xml',host:'https://www.sc-analytics.io'}}
