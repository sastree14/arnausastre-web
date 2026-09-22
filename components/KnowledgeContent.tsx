'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import type { Article } from '@/lib/content'
import type { PublicGeneratedArticle } from '@/lib/public-growth'

const INDUSTRIES = ['Retail','E-commerce','Manufacturing','Logistics','Financial Services','Banking','Insurance','Real Estate','Healthcare','Pharmaceutical','Energy','Utilities','Telecommunications','Professional Services','SaaS','Technology','Hospitality','Food & Beverage','Distribution','Transportation','Public Sector']
const CHALLENGES = ['Forecasting','Planning','Optimization','Resource Allocation','Pricing','Risk Management','Customer Analytics','Operations','Automation','Decision Systems','Inventory Management','Supply Chain','Fraud Detection','Performance Management','Business Intelligence','Data Quality','Compliance','Growth Strategy']
const AUDIENCES = ['CEO','COO','CFO','CTO','CIO','CDO','Operations Director','Supply Chain Director','Finance Director','Commercial Director','Analytics Manager','Data Scientist','Data Analyst','Planning Manager','Risk Manager']

const ui = {
  en: { industry:'Industry', challenge:'Challenge', audience:'Audience', clear:'Clear', article:'article', articles:'articles', filtered:'filtered from', read:'Read', min:'min read', empty:'No analysis available for this selection.', emptyBody:'The editorial system is selective. New material appears when there is something useful to add.', more:'Load more', generated:'SC-Analytics editorial' },
  es: { industry:'Industria', challenge:'Reto', audience:'Audiencia', clear:'Limpiar', article:'artículo', articles:'artículos', filtered:'filtrado de', read:'Leer', min:'min de lectura', empty:'No hay análisis disponibles para esta selección.', emptyBody:'El sistema editorial es selectivo. Publicamos nuevo material cuando existe algo útil que aportar.', more:'Cargar más', generated:'Editorial SC-Analytics' },
  ca: { industry:'Indústria', challenge:'Repte', audience:'Audiència', clear:'Netejar', article:'article', articles:'articles', filtered:'filtrat de', read:'Llegir', min:'min de lectura', empty:'No hi ha anàlisis disponibles per a aquesta selecció.', emptyBody:'El sistema editorial és selectiu. Publiquem material nou quan hi ha alguna cosa útil a aportar.', more:'Carregar més', generated:'Editorial SC-Analytics' },
} as const

const ES: Record<string,string> = {
  'Manufacturing':'Manufactura','Logistics':'Logística','Financial Services':'Servicios financieros','Banking':'Banca','Insurance':'Seguros','Real Estate':'Inmobiliario','Healthcare':'Sanidad','Pharmaceutical':'Farmacéutica','Energy':'Energía','Telecommunications':'Telecomunicaciones','Professional Services':'Servicios profesionales','Technology':'Tecnología','Hospitality':'Hostelería','Food & Beverage':'Alimentación y bebidas','Distribution':'Distribución','Transportation':'Transporte','Public Sector':'Sector público',
  'Planning':'Planificación','Optimization':'Optimización','Resource Allocation':'Asignación de recursos','Pricing':'Precios','Risk Management':'Gestión del riesgo','Customer Analytics':'Analítica de clientes','Operations':'Operaciones','Automation':'Automatización','Decision Systems':'Sistemas de decisión','Inventory Management':'Gestión de inventario','Supply Chain':'Cadena de suministro','Fraud Detection':'Detección de fraude','Performance Management':'Gestión del rendimiento','Data Quality':'Calidad de datos','Compliance':'Cumplimiento','Growth Strategy':'Estrategia de crecimiento',
  'Operations Director':'Director de Operaciones','Supply Chain Director':'Director de Supply Chain','Finance Director':'Director Financiero','Commercial Director':'Director Comercial','Analytics Manager':'Responsable de Analítica','Data Analyst':'Analista de Datos','Planning Manager':'Responsable de Planificación','Risk Manager':'Responsable de Riesgos',
}
const CA: Record<string,string> = {
  'Manufacturing':'Manufactura','Logistics':'Logística','Financial Services':'Serveis financers','Banking':'Banca','Insurance':'Assegurances','Real Estate':'Immobiliari','Healthcare':'Salut','Pharmaceutical':'Farmacèutica','Energy':'Energia','Telecommunications':'Telecomunicacions','Professional Services':'Serveis professionals','Technology':'Tecnologia','Hospitality':'Hostaleria','Food & Beverage':'Alimentació i begudes','Distribution':'Distribució','Transportation':'Transport','Public Sector':'Sector públic',
  'Planning':'Planificació','Optimization':'Optimització','Resource Allocation':'Assignació de recursos','Pricing':'Preus','Risk Management':'Gestió del risc','Customer Analytics':'Analítica de clients','Operations':'Operacions','Automation':'Automatització','Decision Systems':'Sistemes de decisió','Inventory Management':'Gestió d’inventari','Supply Chain':'Cadena de subministrament','Fraud Detection':'Detecció de frau','Performance Management':'Gestió del rendiment','Data Quality':'Qualitat de dades','Compliance':'Compliment','Growth Strategy':'Estratègia de creixement',
  'Operations Director':'Director d’Operacions','Supply Chain Director':'Director de Supply Chain','Finance Director':'Director Financer','Commercial Director':'Director Comercial','Analytics Manager':'Responsable d’Analítica','Data Analyst':'Analista de Dades','Planning Manager':'Responsable de Planificació','Risk Manager':'Responsable de Riscos',
}

function label(value:string, lang:'en'|'es'|'ca') { return lang === 'en' ? value : (lang === 'ca' ? CA[value] : ES[value]) || value }

function Filter({ title, options, value, onChange, lang }:{ title:string; options:string[]; value:string|null; onChange:(value:string|null)=>void; lang:'en'|'es'|'ca' }) {
  return <select value={value || ''} onChange={(event)=>onChange(event.target.value || null)} className="min-w-[170px] flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none focus:border-slate-400"><option value="">{title}</option>{options.map((option)=><option key={option} value={option}>{label(option,lang)}</option>)}</select>
}

const PAGE_SIZE = 8

function chooseGeneratedVariant(items: PublicGeneratedArticle[], lang: 'en'|'es'|'ca') {
  return items.find((item) => item.language === lang)
    || items.find((item) => item.language === 'es')
    || items.find((item) => item.language === 'en')
    || items[0]
}

function compactExcerpt(body: string) {
  return body
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 260)
}

type Props = { articles: Article[]; generated?: PublicGeneratedArticle[] }

export default function KnowledgeContent({ articles, generated = [] }: Props) {
  const { lang } = useSiteLanguage()
  const t = ui[lang]
  const [industry,setIndustry] = useState<string|null>(null)
  const [challenge,setChallenge] = useState<string|null>(null)
  const [audience,setAudience] = useState<string|null>(null)
  const [visibleCount,setVisibleCount] = useState(PAGE_SIZE)
  const hasFilters = Boolean(industry || challenge || audience)
  const reset = () => setVisibleCount(PAGE_SIZE)
  const contentLanguage = lang === 'en' ? 'en' : 'es'

  const generatedGroups = useMemo(() => {
    const groups = new Map<string, PublicGeneratedArticle[]>()
    generated.forEach((article) => {
      const key = article.brief_id || article.content_id
      groups.set(key, [...(groups.get(key) || []), article])
    })
    return [...groups.entries()]
  }, [generated])

  const items = useMemo(() => {
    const staticItems = articles.map((article) => ({
      key: `static:${article.slug}`,
      href: `/knowledge/${article.slug}`,
      title: contentLanguage === 'en' ? article.titleEn : article.titleEs,
      excerpt: contentLanguage === 'en' ? article.excerptEn : article.excerptEs,
      industry: article.industry,
      challenge: article.challenge,
      audience: article.audience,
      date: article.date,
      readingTime: article.readingTime,
      generated: false,
      family: '',
      language: contentLanguage,
    }))

    const generatedItems = generatedGroups.map(([key, variants]) => {
      const item = chooseGeneratedVariant(variants, lang)
      const published = item?.published_at || item?.created_at || ''
      const locale = lang === 'ca' ? 'ca-ES' : lang === 'es' ? 'es-ES' : 'en-GB'
      return item ? {
        key: `generated:${key}`,
        href: `/knowledge/${key}/${lang}`,
        title: item.title,
        excerpt: compactExcerpt(item.body),
        industry: item.industry || '',
        challenge: item.challenge || item.topic || '',
        audience: item.audience || '',
        date: published ? new Date(published).toLocaleDateString(locale) : '',
        readingTime: Math.max(3, Math.ceil(item.body.split(/\s+/).filter(Boolean).length / 220)),
        generated: true,
        family: item.content_family || 'insight',
        language: item.language || lang,
      } : null
    }).filter(Boolean) as Array<{
      key:string; href:string; title:string; excerpt:string; industry:string; challenge:string; audience:string; date:string; readingTime:number; generated:boolean; family:string; language:string
    }>

    return [...generatedItems, ...staticItems]
  }, [articles, contentLanguage, generatedGroups, lang])

  const filtered = items.filter((item) =>
    (!industry || item.industry === industry)
    && (!challenge || item.challenge === challenge)
    && (!audience || item.audience === audience)
  )
  const visible = filtered.slice(0,visibleCount)

  return <section className="mx-auto max-w-5xl px-6 py-16">
    <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <Filter title={t.industry} options={INDUSTRIES} value={industry} onChange={(value)=>{setIndustry(value);reset()}} lang={lang}/>
      <Filter title={t.challenge} options={CHALLENGES} value={challenge} onChange={(value)=>{setChallenge(value);reset()}} lang={lang}/>
      <Filter title={t.audience} options={AUDIENCES} value={audience} onChange={(value)=>{setAudience(value);reset()}} lang={lang}/>
      {hasFilters && <button onClick={()=>{setIndustry(null);setChallenge(null);setAudience(null);reset()}} className="rounded-lg border border-slate-200 px-4 py-3 text-xs font-medium text-slate-500 hover:text-slate-900">{t.clear}</button>}
    </div>
    <p className="mt-3 text-xs text-slate-400">{filtered.length} {filtered.length===1?t.article:t.articles}{hasFilters?` · ${t.filtered} ${items.length}`:''}</p>

    {filtered.length===0 ? <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center"><p className="font-semibold text-slate-700">{t.empty}</p><p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">{t.emptyBody}</p></div> : <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-6 md:px-8">
      {visible.map((item)=><Link key={item.key} href={item.href} className="group block py-7">
        <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          {item.generated ? <><span className="text-indigo-600">{item.industry ? label(item.industry,lang) : t.generated}</span><span>·</span><span>{item.challenge ? label(item.challenge,lang) : item.family}</span><span>·</span><span>{item.audience ? label(item.audience,lang) : item.language.toUpperCase()}</span></> : <><span className="text-indigo-600">{label(item.industry,lang)}</span><span>·</span><span>{label(item.challenge,lang)}</span><span>·</span><span>{label(item.audience,lang)}</span></>}
        </div>
        <h2 className="mt-3 text-xl leading-snug text-slate-950 transition group-hover:text-indigo-700" style={{fontFamily:'var(--font-playfair)'}}>{item.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-600">{item.excerpt}</p>
        <div className="mt-4 flex items-center justify-between text-xs"><span className="text-slate-400">{item.date} · {item.readingTime} {t.min}</span><span className="font-medium text-indigo-600">{t.read} →</span></div>
      </Link>)}
    </div>}

    {visibleCount<filtered.length && <div className="mt-6 text-center"><button onClick={()=>setVisibleCount((value)=>value+PAGE_SIZE)} className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:border-slate-500">{t.more} · {filtered.length-visibleCount}</button></div>}
    {lang==='ca' && articles.length>0 && <p className="mt-6 text-xs leading-5 text-slate-400">Els articles històrics anteriors a la versió trilingüe es mostren en castellà. Les noves publicacions editorials poden tenir versió nativa en català.</p>}
  </section>
}
