import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, EmptyState, PageHeader, SectionHeading, adminButtonPrimary, adminButtonSecondary, adminInput, adminPanel } from '@/components/growth-admin/AdminUi'
import ConfirmFormButton from '@/components/growth-admin/ConfirmFormButton'
import { isGrowthAdminAuthenticated, queryGrowthTable } from '@/lib/growth-admin'
import { summarizeSeoFunnel } from '@/lib/seo-attribution-report'
import { compareNonBrandWindows } from '@/lib/seo-organic-trends'
import { calendlySyncHealth } from '@/lib/seo-calendly-health'
import { getRecentSeoSearchMetrics } from '@/lib/seo-search-console'
import { classifyOrganicSearchQuery } from '@/lib/seo-search-query-classification'

export const dynamic='force-dynamic';export const revalidate=0
type Keyword={keyword_id:string;keyword:string;search_intent:string;service_area:string;priority:number|string;target_path?:string;status:string;metrics?:{google_index_inspection?:{verdict?:string;coverageState?:string;googleCanonical?:string|null;userCanonical?:string|null;lastCrawlTime?:string|null;checked_at?:string}}}
type Recommendation={recommendation_id:string;keyword_id?:string;target_path:string;title:string;rationale?:string;priority:number|string;payload:Record<string,unknown>;status:string;created_at?:string}
type SeoPage={seo_page_id:string;slug:string;primary_keyword:string;secondary_keywords?:string[];search_intent:string;title:string;meta_description:string;h1:string;intro:string;sections?:Array<Record<string,unknown>>;cta_title?:string;cta_body?:string;internal_links?:Array<Record<string,unknown>>;status:string;version:number|string;updated_at?:string}
type InquiryRow={source_path?:string|null}
type BookingRow={provider?:string|null;status?:string|null;metadata?:Record<string,unknown>|null}
type SyncRow={metadata?:Record<string,unknown>|null}

export default async function SeoPage(){
  if(!(await isGrowthAdminAuthenticated()))redirect('/growth-admin/login')
  const windowStart=new Date()
  windowStart.setUTCDate(windowStart.getUTCDate()-90)
  const since=windowStart.toISOString()
  // Restrict the admin report to recent GSC observations and paginate safely.
  // A single 5,000-row PostgREST request can silently truncate at 1,000.
  const [keywords,recommendations,pages,searchDataset]=await Promise.all([
    queryGrowthTable<Keyword>('seo_keyword_targets',{tenant_id:'eq.sc-analytics',status:'eq.active',order:'priority.desc',limit:'100'},{cacheSeconds:0}),
    queryGrowthTable<Recommendation>('seo_recommendations',{tenant_id:'eq.sc-analytics',status:'eq.proposed',order:'priority.desc,created_at.desc',limit:'50'},{cacheSeconds:0}),
    queryGrowthTable<SeoPage>('seo_pages',{tenant_id:'eq.sc-analytics',order:'updated_at.desc',limit:'100'},{cacheSeconds:0}),
    getRecentSeoSearchMetrics(since.slice(0,10))
      .then(result=>({...result,available:true}))
      .catch(()=>({rows:[],truncated:false,available:false})),
  ])
  // Admin-only, server-side comparison of distinct confirmed funnel events.
  // Do NOT treat a Calendly outbound click as a confirmed booking.
  const searchRows=searchDataset.rows
  const [inquiryResult,bookingResult,connectionResult]=await Promise.allSettled([
    queryGrowthTable<InquiryRow>('website_inquiries',{
      select:'source_path',tenant_id:'eq.sc-analytics',created_at:`gte.${since}`,
      order:'created_at.desc',limit:'500',
    },{cacheSeconds:0}),
    queryGrowthTable<BookingRow>('crm_meetings',{
      select:'provider,status,metadata',tenant_id:'eq.sc-analytics',created_at:`gte.${since}`,
      order:'created_at.desc',limit:'500',
    },{cacheSeconds:0}),
    queryGrowthTable<SyncRow>('integration_connections',{
      select:'metadata',tenant_id:'eq.sc-analytics',provider:'eq.calendly',
      order:'updated_at.desc',limit:'1',
    },{cacheSeconds:0}),
  ])
  const formAvailable=inquiryResult.status==='fulfilled'
  const bookingAvailable=bookingResult.status==='fulfilled'
  const syncInfo=calendlySyncHealth(
    connectionResult.status==='fulfilled'?connectionResult.value[0]?.metadata?.last_synced_at:null,
    new Date(),connectionResult.status==='fulfilled',
  )
  const bookingsVerified=bookingAvailable&&syncInfo.status==='fresh'
  const funnel=summarizeSeoFunnel(
    formAvailable?inquiryResult.value:[],
    bookingAvailable?bookingResult.value:[],
  )
  const published=pages.filter(row=>row.status==='published')
  const queryMap=new Map<string,{query:string;clicks:number;impressions:number;positionWeighted:number}>()
  searchRows.forEach(row=>{const query=String(row.query||'').trim();if(!query)return;const impressions=Number(row.impressions||0),clicks=Number(row.clicks||0),position=Number(row.position||0);const current=queryMap.get(query)||{query,clicks:0,impressions:0,positionWeighted:0};current.clicks+=clicks;current.impressions+=impressions;current.positionWeighted+=position*impressions;queryMap.set(query,current)})
  const allOrganicQueries=[...queryMap.values()].map(row=>({...row,position:row.positionWeighted/Math.max(row.impressions,1)})).sort((a,b)=>b.impressions-a.impressions)
  const organicQueries=allOrganicQueries.slice(0,20)
  // Brand/non-brand totals must use the full query inventory, not only
  // the first twenty ranking queries. Search Console is the source of truth.
  const nonBrandQueries=allOrganicQueries.filter(row=>classifyOrganicSearchQuery(row.query)==='nonbrand')
  const ambiguousQueries=allOrganicQueries.filter(row=>classifyOrganicSearchQuery(row.query)==='ambiguous')
  const nonBrandClicks=nonBrandQueries.reduce((acc,row)=>acc+row.clicks,0)
  const nonBrandImpressions=nonBrandQueries.reduce((acc,row)=>acc+row.impressions,0)
  const nonBrandTrend=compareNonBrandWindows(searchRows)
  const publishedPaths=new Set(published.map(page=>'/services/'+page.slug))
  const coveredKeywords=keywords.filter(keyword=>keyword.target_path && publishedPaths.has(keyword.target_path))
  const awaitingLanding=keywords.filter(keyword=>!keyword.target_path || !publishedPaths.has(keyword.target_path))
  return <AdminShell active="seo">
    <PageHeader eyebrow="Métricas · Organic Growth" title="SEO Control" description="Convierte intención de búsqueda real en contenido útil e indexable. El agente propone; tú apruebas cada cambio antes de que aparezca en la web." actions={<form action="/api/growth-admin/operator-task" method="post"><input type="hidden" name="action" value="seo_audit"/><input type="hidden" name="return_to" value="/growth-admin/seo"/><button className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">Generar auditoría SEO</button></form>}/>
    <section className="mb-8 grid gap-3 sm:grid-cols-3"><div className={`${adminPanel} p-4`}><p className="text-xs uppercase text-slate-400">Keywords objetivo</p><p className="mt-2 text-3xl font-semibold">{keywords.length}</p></div><div className={`${adminPanel} p-4`}><p className="text-xs uppercase text-slate-400">Propuestas pendientes</p><p className="mt-2 text-3xl font-semibold">{recommendations.length}</p></div><div className={`${adminPanel} p-4`}><p className="text-xs uppercase text-slate-400">Landings publicadas</p><p className="mt-2 text-3xl font-semibold">{published.length}</p></div></section>
    <section className="mb-8 grid gap-3 sm:grid-cols-3"><div className={`${adminPanel} p-4`}><p className="text-xs uppercase text-slate-400">Keywords con landing publicada</p><p className="mt-2 text-3xl font-semibold">{coveredKeywords.length} / {keywords.length}</p><p className="mt-1 text-xs text-slate-500">{awaitingLanding.length} objetivos pendientes; no son necesariamente enlaces públicos rotos.</p></div><div className={`${adminPanel} p-4`}><p className="text-xs uppercase text-slate-400">Clics de consultas sin marca</p><p className="mt-2 text-3xl font-semibold">{searchDataset.available?nonBrandClicks:'—'}</p><p className="mt-1 text-xs text-slate-500">Últimos 90 días importados de Search Console</p></div><div className={`${adminPanel} p-4`}><p className="text-xs uppercase text-slate-400">Impresiones sin marca</p><p className="mt-2 text-3xl font-semibold">{searchDataset.available?nonBrandImpressions:'—'}</p><p className="mt-1 text-xs text-slate-500">Últimos 90 días; excluye marca, acrónimos ambiguos y consultas anónimas</p></div></section>
    {(!searchDataset.available||searchDataset.truncated)&&
      <p className="mb-5 text-sm text-amber-700">
        {!searchDataset.available?'Datos Search Console temporalmente no disponibles; no interpretar cifras vacías como cero tráfico.':'Se alcanzó el límite de 6.000 registros del panel SEO; ampliar paginación antes de usar estos totales como completos.'}
      </p>}
    <section className="mb-10">
      <SectionHeading eyebrow="SEO → consulta → reunión" title="Embudo comercial verificable"
        description="Registros de los últimos 90 días: formularios recibidos y citas confirmadas realmente sincronizadas desde Calendly. Los pasos se miden por separado, sin atribuir reservas a simples clics."/>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className={`${adminPanel} p-4`}><p className="text-xs uppercase text-slate-400">Formularios recibidos</p><p className="mt-2 text-3xl font-semibold">{formAvailable?funnel.inquiries:'—'}</p></div>
        <div className={`${adminPanel} p-4`}><p className="text-xs uppercase text-slate-400">Formularios desde servicios</p><p className="mt-2 text-3xl font-semibold">{formAvailable?funnel.attributedServiceInquiries:'—'}</p></div>
        <div className={`${adminPanel} p-4`}><p className="text-xs uppercase text-slate-400">Reservas Calendly confirmadas</p><p className="mt-2 text-3xl font-semibold">{bookingsVerified?funnel.confirmedCalendlyMeetings:'—'}</p></div>
        <div className={`${adminPanel} p-4`}><p className="text-xs uppercase text-slate-400">Reservas con origen web</p><p className="mt-2 text-3xl font-semibold">{bookingsVerified?funnel.websiteAttributedBookings:'—'}</p></div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        {bookingsVerified
          ? 'Calendly sincronizado recientemente. Solo se cuentan reuniones activas confirmadas; los enlaces del calendario no son reservas.'
          : `Reservas todavía no verificables: estado de sincronización Calendly ${syncInfo.status==='stale'?'desactualizado':syncInfo.status==='never'?'sin primera ejecución':syncInfo.status==='unavailable'?'no disponible':'sin datos de reuniones'}.`}
        {' '}Última sincronización confirmada: {syncInfo.lastSyncedAt||'ninguna'}.

        {' '}Se consultan hasta 500 registros por fuente. La sincronización Calendly se ejecuta diariamente mediante cron y puede tener retraso.
      </p>
      {Object.keys(funnel.sourceByService).length>0&&<div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(funnel.sourceByService).sort((a,b)=>b[1].inquiries+b[1].bookings-a[1].inquiries-a[1].bookings).map(([slug,counts])=>
          <div key={slug} className={`${adminPanel} p-3`}><p className="text-xs font-semibold">/services/{slug}</p><p className="mt-1 text-xs text-slate-500">{counts.inquiries} formularios · {bookingsVerified?counts.bookings:'—'} reservas de origen web</p></div>
        )}
      </div>}
    </section>
    <section className="mb-10">
      <SectionHeading eyebrow="Search Console · evolución" title="Búsquedas sin marca: últimos 28 días frente a los anteriores"
        description="Comparación cerrada en la última fecha disponible de Search Console, no en la fecha de hoy. Evita interpretar el retraso de Google como una caída de tráfico."/>
      {nonBrandTrend?<div className="grid gap-3 md:grid-cols-2">
        <div className={`${adminPanel} p-5`}>
          <p className="text-xs uppercase text-slate-400">Impresiones de búsquedas sin marca</p>
          <p className="mt-3 text-3xl font-semibold">{nonBrandTrend.current.impressions.toLocaleString('es-ES')}</p>
          <p className="mt-2 text-sm text-slate-500">Periodo anterior: {nonBrandTrend.previous.impressions.toLocaleString('es-ES')}</p>
          <p className="mt-2 text-sm font-semibold text-slate-700">{nonBrandTrend.impressionsChangePct===null?'Sin base anterior comparable':`${nonBrandTrend.impressionsChangePct>0?'+':''}${nonBrandTrend.impressionsChangePct}% respecto al anterior`}</p>
        </div>
        <div className={`${adminPanel} p-5`}>
          <p className="text-xs uppercase text-slate-400">Clics de búsquedas sin marca</p>
          <p className="mt-3 text-3xl font-semibold">{nonBrandTrend.current.clicks.toLocaleString('es-ES')}</p>
          <p className="mt-2 text-sm text-slate-500">Periodo anterior: {nonBrandTrend.previous.clicks.toLocaleString('es-ES')}</p>
          <p className="mt-2 text-sm font-semibold text-slate-700">{nonBrandTrend.clicksChangePct===null?'Sin base anterior comparable':`${nonBrandTrend.clicksChangePct>0?'+':''}${nonBrandTrend.clicksChangePct}% respecto al anterior`}</p>
        </div>
      </div>:<EmptyState>Search Console aún no ha importado días con consultas verificables.</EmptyState>}
      {nonBrandTrend&&<p className="mt-3 text-xs leading-5 text-slate-500">
        Último dato: {nonBrandTrend.latestDate}. Periodo actual: {nonBrandTrend.current.from} → {nonBrandTrend.current.to} ({nonBrandTrend.current.reportedDays}/28 días con registros).
        Periodo anterior: {nonBrandTrend.previous.from} → {nonBrandTrend.previous.to} ({nonBrandTrend.previous.reportedDays}/28 días con registros).
        Solo consultas identificables de Search Console; Google puede anonimizar otras búsquedas. Cifras orgánicas ≠ oportunidades comerciales.
      </p>}
    </section>
    <p className="mb-5 text-xs leading-5 text-slate-500">
      Clasificación prudente de Search Console: las consultas claramente relacionadas con SC-Analytics o su fundador no se incluyen en los indicadores sin marca. Tampoco se contabilizan como demanda no branded las {ambiguousQueries.length} consultas de abreviaturas ambiguas (por ejemplo, «SC data»). Esta separación no demuestra por sí sola intención comercial.
    </p>
    <section className="mb-10"><SectionHeading eyebrow="Organic demand" title="Lo que Google ya está enseñando" description="Consultas reales de Search Console. Se actualizan con la sincronización de métricas y sirven para decidir qué páginas reforzar antes de inventar nuevas keywords." count={organicQueries.length}/>{organicQueries.length===0?<EmptyState>Search Console todavía no tiene consultas suficientes.</EmptyState>:<div className="grid gap-3 md:grid-cols-2">{organicQueries.slice(0,10).map(row=><div key={row.query} className={`${adminPanel} p-4`}><div className="flex items-start justify-between gap-3"><p className="font-semibold text-slate-950">{row.query}</p><Badge tone={row.position<=10?'green':row.position<=30?'amber':'slate'}>Pos. {row.position.toFixed(1)}</Badge></div><div className="mt-3 flex gap-4 text-xs text-slate-500"><span>{row.impressions} impresiones</span><span>{row.clicks} clics</span></div></div>)}</div>}<div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-sm leading-6 text-indigo-900"><strong>Lectura:</strong> {nonBrandQueries.length? `Ya hay ${nonBrandQueries.length} consultas no branded entre las principales. Prioriza las que tienen impresiones y posición 8–30: suelen ser la mejora SEO más barata.`:'De momento la visibilidad real está concentrada en búsquedas de marca. El objetivo de las landings y artículos nuevos es abrir consultas no branded de Data, IA, forecasting y optimización.'}</div></section>

    <section className="mb-10"><SectionHeading eyebrow="SEO + SEM readiness" title="Cobertura antes de comprar tráfico" description="El CRM trabaja primero intención, landing, contenido y atribución. Cuando una landing convierta o tenga señales orgánicas, esa misma página queda preparada para campañas de pago sin enviar tráfico a una home genérica."/><div className="grid gap-3 md:grid-cols-3"><div className={`${adminPanel} p-5`}><Badge tone="violet">1 · Intent</Badge><p className="mt-3 text-sm leading-6 text-slate-600">Keywords comerciales ES/CA/EN agrupadas por forecasting, Data Science, IA, optimización y analytics.</p></div><div className={`${adminPanel} p-5`}><Badge tone="blue">2 · Landing</Badge><p className="mt-3 text-sm leading-6 text-slate-600">Página específica, proyecto relacionado, CTA de diagnóstico gratuito y medición GA4/Search Console.</p></div><div className={`${adminPanel} p-5`}><Badge tone="green">3 · Paid</Badge><p className="mt-3 text-sm leading-6 text-slate-600">SEM se activa sobre páginas con mensaje y atribución listos; campaña y UTM quedan medibles hasta inquiry, reunión y oportunidad.</p></div></div></section>

    <section className="mb-10"><SectionHeading eyebrow="Search intent" title="Mapa de keywords" description="No son palabras para repetir: son problemas y servicios que deben tener una respuesta útil y específica en la web." count={keywords.length}/><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{keywords.map(row=><div key={row.keyword_id} className={`${adminPanel} p-4`}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-950">{row.keyword}</p><p className="mt-1 text-xs text-slate-500">{row.service_area}</p></div><Badge tone={Number(row.priority)>=9?'rose':'blue'}>P{row.priority}</Badge></div><p className="mt-3 text-[11px] text-slate-400">Objetivo: {row.target_path||'por decidir'}</p>{row.metrics?.google_index_inspection?<p className="mt-2 text-[11px] text-slate-600">Google: {row.metrics.google_index_inspection.verdict==='PASS'?'Indexada':row.metrics.google_index_inspection.coverageState||'Sin veredicto'} · Comprobado: {row.metrics.google_index_inspection.checked_at?.slice(0,10)||'sin fecha'}</p>:<p className="mt-2 text-[11px] text-slate-500">Indexación: pendiente de inspección real de Google</p>}</div>)}</div></section>
    <section className="mb-10"><SectionHeading eyebrow="Agent recommendations" title="Cambios propuestos" description="El motor SEO propone diagnósticos con evidencia real. Ninguna propuesta analítica publica cambios; las propuestas editoriales requieren aprobación individual." count={recommendations.length}/><div className="space-y-3">{recommendations.length===0&&<EmptyState>No hay propuestas abiertas. Ejecuta una auditoría cuando quieras ampliar o refrescar cobertura.</EmptyState>}{recommendations.map(row=>{const payload=row.payload||{};const evidence=(payload.evidence||{}) as Record<string,unknown>;const analysisOnly=payload.kind==='seo_opportunity'||payload.publishable===false;return <details key={row.recommendation_id} className={`${adminPanel} group p-5`}><summary className="cursor-pointer list-none"><div className="flex items-start justify-between gap-4"><div><div className="flex gap-2"><Badge tone="violet">SEO</Badge><Badge>P{row.priority}</Badge></div><h2 className="mt-3 text-lg font-semibold text-slate-950">{row.title}</h2><p className="mt-2 text-sm text-slate-600">{row.rationale}</p></div><span className="text-xs font-semibold text-indigo-600">Abrir</span></div></summary><div className="mt-5 border-t border-slate-200 pt-5">{analysisOnly&&<div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
  <p className="font-semibold">Diagnóstico automático · pendiente de validación editorial</p>
  <p className="mt-2">
    {payload.action==='research_keyword_candidate'
      ? `Consulta observada: ${String(evidence.query||'sin datos')}. Impresiones identificadas: ${String(evidence.observed_impressions??'no disponible')} (NO equivale a volumen de mercado).`
      : `Impresiones sin marca de esta URL (28 días): ${String(evidence.nonbrand_impressions_28d??'sin datos')}; clics: ${String(evidence.nonbrand_clicks_28d??'sin datos')}; posición ponderada: ${String(evidence.weighted_position??'sin muestra')}. Fecha GSC: ${String(evidence.last_imported_date??'sin datos')}.`}
  </p>
  <p className="mt-2">Google URL Inspection: <strong>{String(evidence.google_indexation||'no verificado')}</strong>.
    {typeof (evidence.google_inspection as Record<string,unknown>|undefined)?.checked_at==='string'
      ? ` Última inspección: ${String((evidence.google_inspection as Record<string,unknown>).checked_at)}.`:''}
    {' '}No implica garantía de ranking ni autoriza publicar automáticamente.
  </p>
  {Boolean(payload.workplan&&typeof payload.workplan==='object')&&<div className="mt-3 rounded-lg border border-amber-200 bg-white/70 p-3 text-slate-800">
    <p className="font-semibold">Plan de revisión, sin publicación automática</p>
    <p className="mt-1">Tipo de cambio: {String((payload.workplan as Record<string,unknown>).change_scope||'revisión técnica')}.</p>
    <p className="mt-1">Campos: {Array.isArray((payload.workplan as Record<string,unknown>).fields_to_review)
      ? ((payload.workplan as Record<string,unknown>).fields_to_review as string[]).join(', ')
      :'revisión manual'}.</p>
    <p className="mt-1">Casos reales relacionados: {Array.isArray((payload.workplan as Record<string,unknown>).real_portfolio_links)
      ? ((payload.workplan as Record<string,unknown>).real_portfolio_links as string[]).join(', ')||'no vinculados'
      :'no comprobados'}.</p>
  </div>}
  {Boolean(payload.commercial_plan && typeof payload.commercial_plan==='object')&&<div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-slate-700">
    <p className="font-semibold">Preparación comercial y autoridad (solo análisis)</p>
    <p className="mt-1">Señales verificables de la propia landing: {String((payload.commercial_plan as Record<string,unknown>).onsite_readiness_checks_passed??'—')} / {String((payload.commercial_plan as Record<string,unknown>).onsite_readiness_checks_total??'—')}. No es una puntuación de Google ni una previsión de ventas.</p>
    <p className="mt-1">Posiciones SERP, demanda global, backlinks externos y nuevos clientes: pendientes de verificación independiente.</p>
    {Array.isArray((payload.commercial_plan as Record<string,unknown>).tasks)&&<ul className="mt-2 list-disc space-y-1 pl-5">
      {((payload.commercial_plan as Record<string,unknown>).tasks as Array<{kind?:string;status?:string;action?:string}>).slice(0,8).map((task,i)=><li key={i}><strong>{String(task.kind||'verificación')} · {String(task.status||'pendiente')}</strong>: {String(task.action||'Revisión manual')}</li>)}
    </ul>}
    <p className="mt-2 text-xs">Las referencias externas requieren relevancia editorial, URL verificable y aprobación antes de contactar. No se envían correos ni se crean backlinks automáticamente.</p>
  </div>}
</div>}{!analysisOnly&&<><p className="text-xs font-semibold text-slate-500">H1</p><p className="mt-1 text-sm text-slate-800">{String(payload.h1||'')}</p><p className="mt-4 text-xs font-semibold text-slate-500">Intro</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{String(payload.intro||'')}</p></>}<div className="mt-5 flex flex-wrap gap-2">{!analysisOnly&&<form action="/api/growth-admin/seo-page" method="post"><input type="hidden" name="action" value="apply_recommendation"/><input type="hidden" name="recommendation_id" value={row.recommendation_id}/><button className={adminButtonPrimary}>Aprobar y publicar en web</button></form>}<form action="/api/growth-admin/seo-page" method="post"><input type="hidden" name="action" value="reject_recommendation"/><input type="hidden" name="recommendation_id" value={row.recommendation_id}/><button className={adminButtonSecondary}>Descartar</button></form></div></div></details>})}</div></section>
    <section id="pages"><SectionHeading eyebrow="Published coverage" title="Páginas SEO gestionables" description="Puedes retocar contenido o retirar una landing desde el CRM sin tocar el repositorio." count={pages.length}/><div className="space-y-3">{pages.map(row=><details key={row.seo_page_id} className={`${adminPanel} p-5`}><summary className="cursor-pointer list-none"><div className="flex items-center justify-between gap-4"><div><div className="flex gap-2"><Badge tone={row.status==='published'?'green':'slate'}>{row.status}</Badge><Badge>v{row.version}</Badge></div><p className="mt-2 font-semibold">/services/{row.slug}</p><p className="mt-1 text-xs text-slate-500">{row.primary_keyword}</p></div>{row.status==='published'&&<a href={`/services/${row.slug}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-indigo-600">Ver web</a>}</div></summary><form action="/api/growth-admin/seo-page" method="post" className="mt-5 grid gap-3 border-t border-slate-200 pt-5"><input type="hidden" name="action" value="save_page"/><input type="hidden" name="seo_page_id" value={row.seo_page_id}/><input type="hidden" name="slug" value={row.slug}/><input type="hidden" name="status" value={row.status}/><label className="text-xs font-semibold text-slate-600">Keyword principal<input name="primary_keyword" defaultValue={row.primary_keyword} className={`mt-1 w-full ${adminInput}`}/></label><label className="text-xs font-semibold text-slate-600">Keywords secundarias<input name="secondary_keywords" defaultValue={(row.secondary_keywords||[]).join(', ')} className={`mt-1 w-full ${adminInput}`}/></label><input type="hidden" name="search_intent" value={row.search_intent}/><label className="text-xs font-semibold text-slate-600">SEO title<input name="title" defaultValue={row.title} className={`mt-1 w-full ${adminInput}`}/></label><label className="text-xs font-semibold text-slate-600">Meta description<textarea name="meta_description" defaultValue={row.meta_description} rows={2} className={`mt-1 w-full ${adminInput}`}/></label><label className="text-xs font-semibold text-slate-600">H1<input name="h1" defaultValue={row.h1} className={`mt-1 w-full ${adminInput}`}/></label><label className="text-xs font-semibold text-slate-600">Intro<textarea name="intro" defaultValue={row.intro} rows={5} className={`mt-1 w-full ${adminInput}`}/></label><input type="hidden" name="sections_json" value={JSON.stringify(row.sections||[])}/><input type="hidden" name="internal_links_json" value={JSON.stringify(row.internal_links||[])}/><label className="text-xs font-semibold text-slate-600">CTA título<input name="cta_title" defaultValue={row.cta_title||''} className={`mt-1 w-full ${adminInput}`}/></label><label className="text-xs font-semibold text-slate-600">CTA texto<textarea name="cta_body" defaultValue={row.cta_body||''} rows={2} className={`mt-1 w-full ${adminInput}`}/></label><div className="flex gap-2"><button className={adminButtonPrimary}>Guardar cambios</button></div></form>{row.status==='published'&&<div className="mt-3"><ConfirmFormButton action="/api/growth-admin/seo-page" fields={{action:'archive_page',seo_page_id:row.seo_page_id}} label="Retirar landing" message="¿Retirar esta landing de la web? Dejará de aparecer públicamente y en el sitemap."/></div>}</details>)}</div></section>
  </AdminShell>
}
