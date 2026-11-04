import type { Metadata } from 'next'
import Link from 'next/link'
import { cache } from 'react'
import { languageAlternatesForPublishedSlugs,serviceLocaleForSlug,serviceGroupForSlug } from '@/lib/seo-service-locales'
import { notFound } from 'next/navigation'
import { queryGrowthTable } from '@/lib/supabase-growth'
import { commercialServiceStructuredData } from '@/lib/seo-service-structured-data'
import ServiceHubPage from '@/components/ServiceHubPage'
import { getServiceHubBySlug } from '@/lib/service-hubs'
import { getPublicServiceHubDirectory } from '@/lib/service-hub-directory-data'

export const dynamic='force-dynamic';export const revalidate=0
type SeoPage={slug:string;primary_keyword:string;secondary_keywords?:string[];title:string;meta_description:string;h1:string;intro:string;sections?:Array<{heading?:string;body?:string}>;cta_title?:string;cta_body?:string;internal_links?:Array<{href?:string;label?:string}>;status:string;content_locale?:string|null}
const getPage=cache(async (slug:string)=>{try{return(await queryGrowthTable<SeoPage>('seo_pages',{tenant_id:'eq.sc-analytics',slug:`eq.${slug}`,status:'eq.published',limit:'1'},{cacheSeconds:0}))[0]||null}catch(error){console.error('SEO service page unavailable',{slug,error:error instanceof Error?error.message:String(error)});return null}})
const getPublishedServiceSlugs=cache(async()=>{
  const rows=await queryGrowthTable<{slug:string}>('seo_pages',{select:'slug',tenant_id:'eq.sc-analytics',status:'eq.published',limit:'150'},{cacheSeconds:60,timeoutMs:9000})
  return new Set(rows.map(row=>row.slug))
})
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params;
  const serviceHub=getServiceHubBySlug(slug);
  if(serviceHub)return {
    title:serviceHub.hub.titles.en,
    description:serviceHub.hub.intro.en,
    alternates:{canonical:'/services/'+slug},
    openGraph:{title:serviceHub.hub.titles.en,description:serviceHub.hub.intro.en,url:'https://www.sc-analytics.io/services/'+slug,type:'website'},
  };
  const row=await getPage(slug);if(!row)return{};
  const locale=row.content_locale==='es'||row.content_locale==='ca'||row.content_locale==='en'?row.content_locale:serviceLocaleForSlug(row.slug)
  const alternates=serviceGroupForSlug(row.slug)
    ? await getPublishedServiceSlugs().then(slugs=>languageAlternatesForPublishedSlugs(row.slug,slugs)).catch(()=>({}))
    : {}
  return {title:row.title,description:row.meta_description,
    keywords:[row.primary_keyword,...(row.secondary_keywords||[])],
    alternates:{canonical:`/services/${row.slug}`,...(Object.keys(alternates).length>1?{languages:alternates}:{})},
    openGraph:{title:row.title,description:row.meta_description,url:`https://www.sc-analytics.io/services/${row.slug}`,
      locale:locale==='ca'?'ca_ES':locale==='es'?'es_ES':'en_US',type:'website'}}
}
export default async function SeoServicePage({params}:{params:Promise<{slug:string}>}){const{slug}=await params;
  const serviceHub=getServiceHubBySlug(slug);
  if(serviceHub) {
    const directory=await getPublicServiceHubDirectory();
    return <ServiceHubPage hubKey={serviceHub.key} directory={directory}/>;
  }
  const row=await getPage(slug);if(!row)notFound();const locale=row.content_locale==='es'||row.content_locale==='ca'||row.content_locale==='en'?row.content_locale:serviceLocaleForSlug(row.slug);const structuredData=commercialServiceStructuredData({slug:row.slug,headline:row.h1,description:row.meta_description,primaryKeyword:row.primary_keyword,locale});
  const text = {
    es:{
      service:'SERVICIO ESPECIALIZADO',
      services:'Servicios',
      applications:'QUÉ TRABAJAMOS',
      exploreLabel:'SEGUIR EXPLORANDO',
      exploreTitle:'Más formas de avanzar.',
      related:'Servicio relacionado',
      browse:'Explorar otros servicios',
      relatedBody:'Profundiza en otra solución relacionada con tus necesidades.',
      project:'Casos de éxito',
      projectBody:'Descubre ejemplos de proyectos y cómo abordamos problemas empresariales.',
      contact:'Cuéntanos tu caso',
      contactBody:'Hablemos de tus objetivos, restricciones y próximos pasos.',
      visit:'Explorar',
      other:'Otros recursos relacionados',
      cta:'Contactar con SC-Analytics'
    },
    ca:{
      service:'SERVEI ESPECIALITZAT',
      services:'Serveis',
      applications:'QUÈ TREBALLEM',
      exploreLabel:'CONTINUA EXPLORANT',
      exploreTitle:'Més maneres d’avançar.',
      related:'Servei relacionat',
      browse:'Explorar altres serveis',
      relatedBody:'Aprofundeix en una altra solució relacionada amb les teves necessitats.',
      project:'Casos d’èxit',
      projectBody:'Descobreix exemples de projectes i com abordem reptes empresarials.',
      contact:'Explica’ns el teu cas',
      contactBody:'Parlem dels teus objectius, les restriccions i els passos següents.',
      visit:'Explorar',
      other:'Altres recursos relacionats',
      cta:'Contacta amb SC-Analytics'
    },
    en:{
      service:'SPECIALISED SERVICE',
      services:'Services',
      applications:'WHAT WE WORK ON',
      exploreLabel:'EXPLORE NEXT',
      exploreTitle:'Keep moving forward.',
      related:'Related service',
      browse:'Explore other services',
      relatedBody:'Explore another solution connected to your business needs.',
      project:'Success stories',
      projectBody:'See examples of projects and how we approach business challenges.',
      contact:'Discuss your challenge',
      contactBody:'Talk through your goals, constraints and next steps.',
      visit:'Explore',
      other:'Other related resources',
      cta:'Contact SC-Analytics'
    }
  }[locale]
  // Only render existing, local links. Keep extra editorial links as text links,
  // rather than losing them when replacing the former row of pill buttons.
  const internalLinks=(row.internal_links||[]).filter((link):link is {href:string;label:string} =>
    typeof link.href==='string' && /^\/(?!\/)[a-z0-9/_?=&#%-]*$/i.test(link.href) &&
    typeof link.label==='string' && link.label.trim().length>0
  )
  const related=internalLinks.find(link=>
    /^\/services\/[a-z0-9-]+$/i.test(link.href) && link.href!== '/services/'+row.slug
  )
  const caseLink=internalLinks.find(link=>/^\/projects(?:\/|$)/.test(link.href))
  const contactHref='/contact?ref=service:'+encodeURIComponent(row.slug)
  const actionCards=[
    {href:related?.href || '/services',number:'01',title:related?.label || text.browse,body:text.relatedBody},
    {href:caseLink?.href || '/projects',number:'02',title:caseLink?.label || text.project,body:text.projectBody},
    {href:contactHref,number:'03',title:text.contact,body:text.contactBody}
  ]
  const featured=new Set([related?.href,caseLink?.href,contactHref])
  const otherLinks=internalLinks.filter(link=>!featured.has(link.href) &&
    !link.href.startsWith('/contact'))
  return <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,'\\u003c')}}
    />
    <main className="bg-white text-[#0D1B2A]">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="site-container py-14 md:py-16">
          <nav aria-label="Breadcrumb" className="text-[13px] text-[#C7D9E8]">
            <Link href="/services" className="underline-offset-4 hover:underline">{text.services}</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <span aria-current="page" className="text-white">{row.h1}</span>
          </nav>
          <p className="mt-7 text-[12px] font-semibold uppercase tracking-[0.17em] text-[#C7D9E8]">{text.service}</p>
          <h1 className="mt-4 max-w-[24ch] text-[39px] font-normal leading-[1.12] sm:text-[48px] md:text-[54px]" style={{fontFamily:'var(--font-playfair)'}}>{row.h1}</h1>
          <p className="mt-5 max-w-3xl whitespace-pre-wrap text-[17px] leading-8 text-[#EAF0F6]">{row.intro}</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="site-container py-12 md:py-16">
          <p className="mb-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#254A66]">{text.applications}</p>
          <div className="border-x border-t border-[#CBD5E1]">
            {(row.sections||[]).map((section,index)=>(
              <article
                key={String(section.heading||index)+'-'+index}
                className={'grid gap-5 border-b border-[#CBD5E1] px-6 py-8 md:grid-cols-[minmax(0,0.39fr)_minmax(0,0.61fr)] md:gap-12 md:px-10 md:py-10 '+
                  (index%2===0?'bg-white':'bg-[#EAF0F6]')}
              >
                <h2 className="text-[26px] font-normal leading-[1.2] text-[#0D1B2A] md:text-[29px]" style={{fontFamily:'var(--font-playfair)'}}>{section.heading}</h2>
                <p className="whitespace-pre-wrap text-[16px] leading-[1.85] text-[#254A66]">{section.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#CBD5E1] bg-[#F7F9FC]">
        <div className="site-container py-12 md:py-16">
          <div className="mx-auto max-w-3xl border-y border-[#CBD5E1] py-5 text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#254A66]">{text.exploreLabel}</p>
            <h2 className="mt-2 text-[31px] font-normal leading-[1.2] md:text-[37px]" style={{fontFamily:'var(--font-playfair)'}}>{text.exploreTitle}</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {actionCards.map((card,index)=>(
              <Link
                key={card.number}
                href={card.href}
                className={'group flex min-h-[230px] flex-col border border-[#CBD5E1] p-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#496C8A] '+
                  (index===1?'bg-[#EAF0F6] hover:bg-[#DFEAF3]':'bg-white hover:bg-[#F0F5FA]')}
              >
                <div className="flex items-center justify-between text-[#496C8A]">
                  <span className="font-mono text-xs font-semibold">{card.number}</span>
                  <span aria-hidden="true" className="text-lg transition-transform group-hover:translate-x-1">→</span>
                </div>
                <h3 className="mt-6 text-[25px] font-normal leading-tight" style={{fontFamily:'var(--font-playfair)'}}>{card.title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-slate-700">{card.body}</p>
                <span className="mt-auto pt-5 text-sm font-semibold text-[#254A66]">{text.visit} <span aria-hidden="true">→</span></span>
              </Link>
            ))}
          </div>
          {otherLinks.length>0 && (
            <div className="mt-7 flex flex-wrap items-baseline gap-x-5 gap-y-2 text-[14px]">
              <span className="font-semibold text-[#254A66]">{text.other}:</span>
              {otherLinks.map((link,index)=>(
                <Link key={link.href+'-'+index} href={link.href} className="text-[#254A66] underline underline-offset-4 hover:text-[#0D1B2A]">{link.label} <span aria-hidden="true">→</span></Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="site-container flex flex-col gap-6 py-12 md:flex-row md:items-end md:justify-between md:py-14">
          <div className="max-w-3xl">
            <h2 className="text-[31px] font-normal leading-tight md:text-[37px]" style={{fontFamily:'var(--font-playfair)'}}>{row.cta_title||text.contact}</h2>
            {row.cta_body&&<p className="mt-4 text-[16px] leading-8 text-[#EAF0F6]">{row.cta_body}</p>}
          </div>
          <Link href={contactHref} className="inline-flex shrink-0 items-center gap-3 bg-white px-6 py-3.5 text-[15px] font-semibold text-[#0D1B2A] transition-colors hover:bg-[#EAF0F6]">{text.cta}<span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </main>
  </>
}
