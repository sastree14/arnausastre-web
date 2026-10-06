import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, EmptyState, PageHeader, SectionHeading, StatCard, adminPanel } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getMetricsBundle } from '@/lib/growth-admin-performance'
import MetricsPeriodComparison from '@/components/growth-admin/MetricsPeriodComparison'
import { getMetricsComparison, normalizePeriodKind, periodOptions } from '@/lib/metrics-periods'

export const dynamic='force-dynamic'

const n=(value:unknown)=>Number(value||0)
const euro=(value:unknown)=>n(value).toLocaleString('es-ES',{minimumFractionDigits:0,maximumFractionDigits:0}) + ' €'
const date=(value:unknown)=>value?new Date(String(value)).toLocaleString('es-ES',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Madrid'}):'Nunca'
const show=(ready:boolean,value:unknown,format:(v:unknown)=>string=(v)=>n(v).toLocaleString('es-ES'))=>ready?format(value):'—'

export default async function MetricsPage({searchParams}:{searchParams:Promise<{period_kind?:string;period_a?:string;period_b?:string;trend_metric?:string;synced?:string;ga4_error?:string;gsc_error?:string}>}){
  if(!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params=await searchParams
  const kind=normalizePeriodKind(params.period_kind)
  const options=periodOptions(kind)
  const [metrics,comparison]=await Promise.all([
    getMetricsBundle(),
    getMetricsComparison({kind,periodA:params.period_a,periodB:params.period_b,trendMetric:params.trend_metric}),
  ])

  const liReady=n(metrics.linkedin.posts_measured)>0
  const webReady=Boolean(metrics.website.latest_date)
  const seoReady=Boolean(metrics.seo.latest_date)
  const liDenominator=n(metrics.linkedin.reach||metrics.linkedin.impressions)
  const liEngagement=n(metrics.linkedin.reactions)+n(metrics.linkedin.comments)+n(metrics.linkedin.reposts)+n(metrics.linkedin.saves)+n(metrics.linkedin.clicks)
  const webSessions=n(metrics.website.sessions)
  const webEngagement=webSessions>0?n(metrics.website.engaged_sessions)/webSessions:null
  const seoCtr=n(metrics.seo.impressions)>0?n(metrics.seo.clicks)/n(metrics.seo.impressions):null

  return <AdminShell active="metrics">
    <PageHeader
      eyebrow="CMI · Métricas"
      title="Métricas"
      description="Una vista sencilla para saber qué está pasando en web, SEO, LinkedIn y negocio. Actualizar Google solo sincroniza datos; no consume API de OpenAI."
      actions={<>
        <form action="/api/growth-admin/metrics/sync" method="post">
          <input type="hidden" name="days" value="365"/>
          <input type="hidden" name="return_to" value="/growth-admin/metrics"/>
          <button className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">Actualizar Google</button>
        </form>
        <a href="/growth-admin/metrics/dictionary" className="rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white">Diccionario KPI</a>
        <a href="/growth-admin/analytics" className="rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white">Detalle por fuente</a>
      </>}
    />

    {params.synced === '1' && !params.ga4_error && !params.gsc_error && (
      <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Google Analytics y Search Console se han actualizado correctamente.
      </div>
    )}
    {(params.ga4_error || params.gsc_error) && (
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-semibold">La sincronización ha terminado con incidencias.</p>
        {params.ga4_error && <p className="mt-1">GA4: {params.ga4_error}</p>}
        {params.gsc_error && <p className="mt-1">Search Console: {params.gsc_error}</p>}
      </div>
    )}

    <MetricsPeriodComparison bundle={comparison} options={options}/>

    <section className="mt-12">
      <SectionHeading eyebrow="Negocio" title="Actividad comercial" description="Oportunidades y reuniones guardadas en el CMI; finanzas siguen leyendo la base operativa."/>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Oportunidades" value={n(metrics.commercial.opportunities)} tone="blue"/>
        <StatCard label="Reuniones" value={n(metrics.commercial.meetings)} tone="violet"/>
        <StatCard label="Pipeline abierto" value={euro(metrics.commercial.open_pipeline)} tone="blue"/>
        <StatCard label="Facturado" value={euro(metrics.finance.invoiced)} tone="green"/>
        <StatCard label="Cobrado" value={euro(metrics.finance.collected)} tone="green"/>
        <StatCard label="Gasto" value={euro(metrics.finance.spent)} tone="amber"/>
      </div>
    </section>

    <section className="mt-12">
      <SectionHeading eyebrow="Website · GA4" title="Web" description={webReady?'Último snapshot: ' + metrics.website.latest_date:'Todavía no hay un snapshot GA4 disponible en el CMI.'}/>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        <StatCard label="Usuarios" value={show(webReady,metrics.website.users)}/>
        <StatCard label="Sesiones" value={show(webReady,metrics.website.sessions)}/>
        <StatCard label="Engagement" value={webReady&&webEngagement!==null?(webEngagement*100).toFixed(1)+'%':'—'} tone="blue"/>
        <StatCard label="Page views" value={show(webReady,metrics.website.page_views)}/>
        <StatCard label="Key events" value={show(webReady,metrics.website.key_events)} tone="violet"/>
        <StatCard label="Discovery intent" value={show(webReady,metrics.website.discovery_clicks)} tone="amber"/>
        <StatCard label="Bookings" value={show(webReady,metrics.website.bookings)} tone="green"/>
      </div>
      {!webReady&&<div className="mt-4"><EmptyState>Pulsa “Actualizar Google” para traer GA4 y Search Console. Después podrás pedir a @SC-Analytics que analice los resultados.</EmptyState></div>}
    </section>

    <section className="mt-12">
      <SectionHeading eyebrow="SEO · Search Console" title="Visibilidad orgánica" description={seoReady?'Último snapshot: ' + metrics.seo.latest_date:'Todavía no hay un snapshot Search Console disponible.'}/>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clicks orgánicos" value={show(seoReady,metrics.seo.clicks)} tone="green"/>
        <StatCard label="Impresiones SEO" value={show(seoReady,metrics.seo.impressions)} tone="blue"/>
        <StatCard label="CTR" value={seoReady&&seoCtr!==null?(seoCtr*100).toFixed(2)+'%':'—'} tone="violet"/>
        <StatCard label="Posición media" value={seoReady?n(metrics.seo.position).toFixed(1):'—'} tone="amber"/>
      </div>
    </section>

    <section className="mt-12">
      <SectionHeading eyebrow="LinkedIn" title="Rendimiento editorial" description="Se muestran únicamente métricas disponibles y persistidas; si una fuente no está conectada no inventamos ceros."/>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Impressions" value={show(liReady,metrics.linkedin.impressions)}/>
        <StatCard label="Reach" value={show(liReady,metrics.linkedin.reach)}/>
        <StatCard label="Engagement" value={liReady&&liDenominator>0?(liEngagement/liDenominator*100).toFixed(2)+'%':'—'} tone="blue"/>
        <StatCard label="Saves" value={show(liReady,metrics.linkedin.saves)} tone="violet"/>
        <StatCard label="Clicks" value={show(liReady,metrics.linkedin.clicks)} tone="green"/>
        <StatCard label="Followers" value={show(liReady,metrics.linkedin.followers_gained)} tone="green"/>
      </div>
    </section>

    <section className="mt-12 pb-12">
      <SectionHeading eyebrow="Fuentes" title="Estado de datos" description="El CMI enseña qué datos existen y cuándo se actualizaron; la ejecución vive fuera de esta pantalla."/>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={adminPanel + ' p-5'}><div className="flex items-center justify-between"><p className="font-semibold text-slate-950">CRM + Finance</p><Badge tone="green">Directo</Badge></div><p className="mt-3 text-xs leading-5 text-slate-500">Misma base Supabase.</p></div>
        <div className={adminPanel + ' p-5'}><div className="flex items-center justify-between"><p className="font-semibold text-slate-950">LinkedIn</p><Badge tone={liReady?'green':'amber'}>{liReady?'Datos disponibles':'Sin analítica'}</Badge></div><p className="mt-3 text-xs leading-5 text-slate-500">Posts medidos: {n(metrics.linkedin.posts_measured)}.</p></div>
        <div className={adminPanel + ' p-5'}><div className="flex items-center justify-between"><p className="font-semibold text-slate-950">GA4</p><Badge tone={webReady?'green':'amber'}>{webReady?'Disponible':'Pendiente'}</Badge></div><p className="mt-3 text-xs leading-5 text-slate-500">Última actualización: {date(metrics.sources.last_ga4_sync)}</p></div>
        <div className={adminPanel + ' p-5'}><div className="flex items-center justify-between"><p className="font-semibold text-slate-950">Search Console</p><Badge tone={seoReady?'green':'amber'}>{seoReady?'Disponible':'Pendiente'}</Badge></div><p className="mt-3 text-xs leading-5 text-slate-500">Última actualización: {date(metrics.sources.last_search_console_sync)}</p></div>
      </div>
    </section>
  </AdminShell>
}
