import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import GeneratedArticleContent from '@/components/GeneratedArticleContent'
import { getPublicGeneratedArticleVariants } from '@/lib/public-growth'

type Locale='es'|'ca'|'en'
type Props={params:Promise<{slug:string;locale:string}>}
const SUPPORTED=new Set<Locale>(['es','ca','en'])

function clean(value:string){return String(value||'').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'$1').replace(/[\*#_`]+/g,'').replace(/\s+/g,' ').trim()}
function summary(value:string,max=158){const valueClean=clean(value);return valueClean.length<=max?valueClean:valueClean.slice(0,max-1).trim()+'…'}

export const dynamic='force-dynamic'
export const revalidate=0

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const values=await params
  const slug=values.slug
  const raw=values.locale
  if(!SUPPORTED.has(raw as Locale))return{}
  const locale=raw as Locale
  const variants=await getPublicGeneratedArticleVariants(slug)
  const article=variants.find(item=>item.language===locale)
  if(!article)return{}
  const title=clean(article.title),description=summary(article.body)
  const available=Object.fromEntries(
    variants
      .filter(item=>SUPPORTED.has(String(item.language) as Locale))
      .map(item=>[String(item.language),'/knowledge/'+slug+'/'+item.language])
  )
  const canonical='/knowledge/'+slug+'/'+locale
  return{
    title,
    description,
    keywords:[article.topic,article.industry,article.challenge].filter(Boolean) as string[],
    alternates:{canonical,languages:available},
    openGraph:{title,description,url:'https://sc-analytics.io'+canonical,type:'article',locale:locale==='es'?'es_ES':locale==='ca'?'ca_ES':'en_GB',publishedTime:article.published_at||undefined},
  }
}

export default async function LocalizedGeneratedArticle({params}:Props){
  const values=await params
  const slug=values.slug
  const raw=values.locale
  if(!SUPPORTED.has(raw as Locale))notFound()
  const locale=raw as Locale
  const variants=await getPublicGeneratedArticleVariants(slug)
  const article=variants.find(item=>item.language===locale)
  if(!article)notFound()
  const schema={
    '@context':'https://schema.org',
    '@type':'Article',
    headline:clean(article.title),
    description:summary(article.body),
    inLanguage:locale,
    datePublished:article.published_at||undefined,
    author:{'@type':'Organization',name:'SC-Analytics'},
    publisher:{'@type':'Organization',name:'SC-Analytics',url:'https://sc-analytics.io'},
    mainEntityOfPage:'https://sc-analytics.io/knowledge/'+slug+'/'+locale,
  }
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><GeneratedArticleContent variants={variants} forcedLanguage={locale}/></>
}
