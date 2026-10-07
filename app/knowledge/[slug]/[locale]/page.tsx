import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import GeneratedKnowledgeArticleGoldStandard from '@/components/GeneratedKnowledgeArticleGoldStandard'
import KnowledgeArticleGoldStandard from '@/components/KnowledgeArticleGoldStandard'
import { getArticleBySlug } from '@/lib/content'
import { getPublicGeneratedArticleVariants } from '@/lib/public-growth'

type Locale='es'|'ca'|'en'
type Props={params:Promise<{slug:string;locale:string}>}
const SUPPORTED=new Set<Locale>(['es','ca','en'])

function clean(value:string){return String(value||'').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'$1').replace(/[\*#_`]+/g,'').replace(/\s+/g,' ').trim()}
function summary(value:string,max=158){const valueClean=clean(value);return valueClean.length<=max?valueClean:valueClean.slice(0,max-1).trim()+'…'}

function staticVariant(article:ReturnType<typeof getArticleBySlug>,locale:Locale){
  if(!article)return null
  if(locale==='en')return{title:article.titleEn,description:article.excerptEn||summary(article.bodyEn),body:article.bodyEn,tags:article.tagsEn}
  if(locale==='ca')return{title:article.titleCa||article.titleEs,description:article.excerptCa||article.excerptEs||summary(article.bodyCa||article.bodyEs),body:article.bodyCa||article.bodyEs,tags:article.tagsCa||article.tagsEs}
  return{title:article.titleEs,description:article.excerptEs||summary(article.bodyEs),body:article.bodyEs,tags:article.tagsEs}
}

export const dynamic='force-dynamic'
export const revalidate=0

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const values=await params
  const slug=values.slug
  const raw=values.locale
  if(!SUPPORTED.has(raw as Locale))return{}
  const locale=raw as Locale
  const canonical='/knowledge/'+slug+'/'+locale

  const staticArticle=getArticleBySlug(slug)
  if(staticArticle){
    const local=staticVariant(staticArticle,locale)!
    return{
      title:local.title,
      description:local.description,
      authors:[{name:'SC-Analytics',url:'https://sc-analytics.io/about'}],
      robots:{index:true,follow:true},
      alternates:{canonical,languages:{en:'/knowledge/'+slug+'/en',es:'/knowledge/'+slug+'/es',ca:'/knowledge/'+slug+'/ca','x-default':'/knowledge/'+slug+'/es'}},
      openGraph:{title:local.title,description:local.description,url:'https://sc-analytics.io'+canonical,type:'article',locale:locale==='es'?'es_ES':locale==='ca'?'ca_ES':'en_GB',publishedTime:staticArticle.date},
    }
  }

  const variants=await getPublicGeneratedArticleVariants(slug)
  const article=variants.find(item=>item.language===locale)||variants.find(item=>item.language==='es')||variants.find(item=>item.language==='en')||variants[0]
  if(!article)return{}
  const articleMeta=(article.critique && typeof article.critique==='object' ? (article.critique as Record<string,unknown>).article_meta : null) as Record<string,unknown>|null
  const title=clean(String(articleMeta?.seo_title||article.title)),description=summary(String(articleMeta?.seo_description||articleMeta?.excerpt||article.body))
  const available=Object.fromEntries(
    variants
      .filter(item=>SUPPORTED.has(String(item.language) as Locale))
      .map(item=>[String(item.language),'/knowledge/'+slug+'/'+item.language])
  )
  available['x-default']='/knowledge/'+slug+'/es'
  return{
    title,
    description,
    authors:[{name:'SC-Analytics',url:'https://sc-analytics.io/about'}],
    robots:{index:true,follow:true},
    alternates:{canonical,languages:available},
    openGraph:{title,description,url:'https://sc-analytics.io'+canonical,type:'article',locale:locale==='es'?'es_ES':locale==='ca'?'ca_ES':'en_GB',publishedTime:article.published_at||undefined},
  }
}

export default async function LocalizedArticle({params}:Props){
  const values=await params
  const slug=values.slug
  const raw=values.locale
  if(!SUPPORTED.has(raw as Locale))notFound()
  const locale=raw as Locale

  const staticArticle=getArticleBySlug(slug)
  if(staticArticle){
    const local=staticVariant(staticArticle,locale)!
    const schema={
      '@context':'https://schema.org',
      '@type':'Article',
      headline:local.title,
      description:local.description,
      inLanguage:locale,
      datePublished:staticArticle.date,
      author:{'@type':'Organization',name:'SC-Analytics'},
      publisher:{'@type':'Organization',name:'SC-Analytics',url:'https://sc-analytics.io'},
      mainEntityOfPage:'https://sc-analytics.io/knowledge/'+slug+'/'+locale,
    }
    return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><KnowledgeArticleGoldStandard article={staticArticle} forcedLanguage={locale}/></>
  }

  const variants=await getPublicGeneratedArticleVariants(slug)
  const article=variants.find(item=>item.language===locale)||variants.find(item=>item.language==='es')||variants.find(item=>item.language==='en')||variants[0]
  if(!article)notFound()
  const schema={
    '@context':'https://schema.org',
    '@type':'Article',
    headline:clean(article.title),
    description:summary(article.body),
    inLanguage:locale,
    datePublished:article.published_at||undefined,
    dateModified:article.created_at||article.published_at||undefined,
    author:{'@type':'Organization',name:'SC-Analytics',url:'https://sc-analytics.io/about'},
    publisher:{'@type':'Organization',name:'SC-Analytics',url:'https://sc-analytics.io'},
    mainEntityOfPage:'https://sc-analytics.io/knowledge/'+slug+'/'+locale,
    isPartOf:{'@type':'CollectionPage',name:'SC-Analytics Knowledge',url:'https://sc-analytics.io/knowledge'},
  }
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><GeneratedKnowledgeArticleGoldStandard variants={variants} forcedLanguage={locale}/></>
}
