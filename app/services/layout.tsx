import type { Metadata } from 'next'
import Link from 'next/link'
import { queryGrowthTable } from '@/lib/supabase-growth'

export const dynamic='force-dynamic';export const revalidate=0
export const metadata:Metadata={title:'Data, AI, Forecasting & Optimization Services',description:'SC-Analytics helps companies improve forecasting, optimisation, machine learning, AI automation, data engineering and decision intelligence.',keywords:['demand forecasting','demand planning','inventory optimization','logistics optimization','route optimization','operations research consulting','pricing optimization','data science consulting','machine learning consulting','AI automation services','data engineering consulting','business intelligence consulting']}
type SeoPage={slug:string;primary_keyword:string;h1:string;status:string}
async function links(){try{return await queryGrowthTable<SeoPage>('seo_pages',{tenant_id:'eq.sc-analytics',status:'eq.published',order:'updated_at.desc',limit:'18'},{cacheSeconds:0})}catch{return[]}}
export default async function Layout({children}:{children:React.ReactNode}){const pages=await links();return <>{children}{pages.length>0&&<aside className="border-t border-slate-200 bg-slate-50"><div className="mx-auto max-w-7xl px-6 py-12"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Explore by business problem</p><div className="mt-5 flex flex-wrap gap-2">{pages.map(page=><Link key={page.slug} href={`/services/${page.slug}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-700">{page.primary_keyword}</Link>)}</div></div></aside>}</>}
