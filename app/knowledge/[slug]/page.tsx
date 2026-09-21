import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticleBySlug } from '@/lib/content'
import { getPublicGeneratedArticleVariants } from '@/lib/public-growth'
import ArticleContent from '@/components/ArticleContent'
import GeneratedArticleContent from '@/components/GeneratedArticleContent'

type Props = { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'
export const revalidate = 0

function clean(value:string){
  return String(value||'').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'$1').replace(/[\*#_`]+/g,'').replace(/\s+/g,' ').trim()
}
function summary(value:string,max=158){
  const text=clean(value)
  return text.length<=max?text:`${text.slice(0,max-1).trim()}…`
}

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug}=await params
  const canonical=`/knowledge/${slug}`
  const staticArticle=getArticleBySlug(slug)
  if(staticArticle){
    const title=staticArticle.titleEn||staticArticle.titleEs
    const description=staticArticle.excerptEn||staticArticle.excerptEs||summary(staticArticle.bodyEn||staticArticle.bodyEs)
    return {
      title,
      description,
      keywords:staticArticle.tagsEn?.length?staticArticle.tagsEn:staticArticle.tagsEs,
      alternates:{canonical},
      openGraph:{title,description,url:`https://sc-analytics.io${canonical}`,type:'article',publishedTime:staticArticle.date},
    }
  }

  const generated=await getPublicGeneratedArticleVariants(slug)
  const article=generated.find(item=>item.language==='en')||generated.find(item=>item.language==='es')||generated[0]
  if(!article)return{}
  const title=clean(article.title)
  const description=summary(article.body)
  return {
    title,
    description,
    keywords:[article.topic,article.industry,article.challenge].filter(Boolean) as string[],
    alternates:{canonical},
    openGraph:{title,description,url:`https://sc-analytics.io${canonical}`,type:'article',publishedTime:article.published_at||undefined},
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const staticArticle = getArticleBySlug(slug)
  if (staticArticle) {
    const schema={
      '@context':'https://schema.org',
      '@type':'Article',
      headline:staticArticle.titleEn||staticArticle.titleEs,
      description:staticArticle.excerptEn||staticArticle.excerptEs,
      datePublished:staticArticle.date,
      author:{'@type':'Organization',name:'SC-Analytics'},
      publisher:{'@type':'Organization',name:'SC-Analytics',url:'https://sc-analytics.io'},
      mainEntityOfPage:`https://sc-analytics.io/knowledge/${slug}`,
    }
    return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><ArticleContent article={staticArticle} /></>
  }

  const generated = await getPublicGeneratedArticleVariants(slug)
  if (!generated.length) notFound()
  const preferred=generated.find(item=>item.language==='en')||generated.find(item=>item.language==='es')||generated[0]
  const schema={
    '@context':'https://schema.org',
    '@type':'Article',
    headline:clean(preferred.title),
    description:summary(preferred.body),
    datePublished:preferred.published_at||undefined,
    author:{'@type':'Organization',name:'SC-Analytics'},
    publisher:{'@type':'Organization',name:'SC-Analytics',url:'https://sc-analytics.io'},
    mainEntityOfPage:`https://sc-analytics.io/knowledge/${slug}`,
  }
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><GeneratedArticleContent variants={generated} /></>
}
