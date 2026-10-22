import type { Metadata } from 'next'
import Link from 'next/link'
import { cache } from 'react'
import { languageAlternatesForPublishedSlugs,serviceLocaleForSlug,serviceGroupForSlug } from '@/lib/seo-service-locales'
import { notFound } from 'next/navigation'
import { queryGrowthTable } from '@/lib/supabase-growth'
import { commercialServiceStructuredData } from '@/lib/seo-service-structured-data'

export const dynamic='force-dynamic';export const revalidate=0
type SeoPage={slug:string;primary_keyword:string;secondary_keywords?:string[];title:string;meta_description:string;h1:string;intro:string;sections?:Array<{heading?:string;body?:string}>;cta_title?:string;cta_body?:string;internal_links?:Array<{href?:string;label?:string}>;status:string}
const getPage=cache(async (slug:string)=>{try{return(await queryGrowthTable<SeoPage>('seo_pages',{tenant_id:'eq.sc-analytics',slug:`eq.${slug}`,status:'eq.published',limit:'1'},{cacheSeconds:0}))[0]||null}catch(error){console.error('SEO service page unavailable',{slug,error:error instanceof Error?error.message:String(error)});return null}})
const getPublishedServiceSlugs=cache(async()=>{
  const rows=await queryGrowthTable<{slug:string}>('seo_pages',{select:'slug',tenant_id:'eq.sc-analytics',status:'eq.published',limit:'150'},{cacheSeconds:60,timeoutMs:9000})
  return new Set(rows.map(row=>row.slug))
})
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params,row=await getPage(slug);if(!row)return{};
  const locale=serviceLocaleForSlug(row.slug)
  const alternates=serviceGroupForSlug(row.slug)
    ? await getPublishedServiceSlugs().then(slugs=>languageAlternatesForPublishedSlugs(row.slug,slugs)).catch(()=>({}))
    : {}
  return {title:row.title,description:row.meta_description,
    keywords:[row.primary_keyword,...(row.secondary_keywords||[])],
    alternates:{canonical:`/services/${row.slug}`,...(Object.keys(alternates).length>1?{languages:alternates}:{})},
    openGraph:{title:row.title,description:row.meta_description,url:`https://www.sc-analytics.io/services/${row.slug}`,
      locale:locale==='ca'?'ca_ES':locale==='es'?'es_ES':'en_US',type:'website'}}
}
export default async function SeoServicePage({params}:{params:Promise<{slug:string}>}){const{slug}=await params,row=await getPage(slug);if(!row)notFound();const locale=serviceLocaleForSlug(row.slug);const structuredData=commercialServiceStructuredData({slug:row.slug,headline:row.h1,description:row.meta_description,primaryKeyword:row.primary_keyword,locale});
return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,'\\u003c')}}/><main className="bg-white text-slate-950"><section className="border-b border-slate-200 bg-slate-950 text-white"><div className="mx-auto max-w-6xl px-6 py-24"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">{`SC-Analytics · ${locale==='ca'?'Serveis':locale==='es'?'Servicios':'Services'}`}</p><h1 className="mt-5 max-w-4xl text-5xl leading-tight md:text-6xl" style={{fontFamily:'var(--font-playfair)'}}>{row.h1}</h1><div className="mt-7 max-w-3xl whitespace-pre-wrap text-lg leading-8 text-slate-300">{row.intro}</div></div></section><section className="mx-auto max-w-6xl px-6 py-20"><div className="grid gap-12">{(row.sections||[]).map((section,index)=><article key={`${section.heading}-${index}`} className="grid gap-4 border-b border-slate-200 pb-12 md:grid-cols-[0.38fr_0.62fr]"><h2 className="text-2xl md:text-3xl" style={{fontFamily:'var(--font-playfair)'}}>{section.heading}</h2><p className="whitespace-pre-wrap text-base leading-8 text-slate-600">{section.body}</p></article>)}</div>{(row.internal_links||[]).length>0&&<div className="mt-12 flex flex-wrap gap-2">{row.internal_links?.map((link,index)=><Link key={`${link.href}-${index}`} href={link.href||'/services'} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">{link.label||'Learn more'}</Link>)}</div>}</section><section className="border-t border-slate-200 bg-indigo-50"><div className="mx-auto max-w-6xl px-6 py-16 md:flex md:items-end md:justify-between"><div><h2 className="text-3xl" style={{fontFamily:'var(--font-playfair)'}}>{row.cta_title||'Talk through the decision'}</h2><p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">{row.cta_body}</p></div><Link href={`/contact?ref=service:${row.slug}`} className="mt-6 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white md:mt-0">{locale==='ca'?'Contacta amb SC-Analytics':locale==='es'?'Contactar con SC-Analytics':'Contact SC-Analytics'}</Link></div></section></main></>}
