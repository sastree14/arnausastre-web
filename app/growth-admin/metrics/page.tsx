import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, SectionHeading, adminPanel } from '@/components/growth-admin/AdminUi'
import { getLinkedInPostMetrics, getWebAnalyticsDaily, isGrowthAdminAuthenticated } from '@/lib/growth-admin'

function MetricModule({ href, title, description, status, tone = 'amber' }: { href?: string; title: string; description: string; status: string; tone?: 'amber' | 'blue' | 'green' | 'violet' | 'slate' }) {
  const body = <div className={`${adminPanel} h-full p-5 transition ${href ? 'hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md' : ''}`}>
    <div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold text-slate-950">{title}</h3><Badge tone={tone}>{status}</Badge></div>
    <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    {href && <p className="mt-5 text-xs font-semibold text-amber-700">Abrir módulo →</p>}
  </div>
  return href ? <a href={href}>{body}</a> : body
}

export default async function MetricsPage() {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const [linkedin, web] = await Promise.all([getLinkedInPostMetrics(), getWebAnalyticsDaily()])
  const sessions = web.reduce((total, row) => total + Number(row.sessions || 0), 0)
  const keyEvents = web.reduce((total, row) => total + Number(row.key_events || 0), 0)
  const latest = new Map<string, (typeof linkedin)[number]>()
  linkedin.forEach((row) => { const key = row.content_id || row.external_post_id || row.external_post_url || row.metric_id; if (!latest.has(key)) latest.set(key, row) })
  const impressions = [...latest.values()].reduce((total, row) => total + Number(row.impressions || 0), 0)

  return <AdminShell active="metrics">
    <header className="overflow-hidden rounded-[2rem] border border-amber-950 bg-[#3a2a05] text-white shadow-sm">
      <div className="grid gap-8 px-6 py-9 md:px-10 md:py-12 xl:grid-cols-[1fr_auto] xl:items-end">
        <div className="max-w-4xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-300">Cuadro de Mando Integral · Métricas</p>
          <h1 className="mt-4 text-4xl md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>Métricas</h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-amber-100/80 md:text-base">Medición transversal de adquisición, contenido, web, SEO y conversión. El objetivo es conectar actividad con leads, oportunidades e ingresos.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs"><div className="rounded-xl border border-white/10 bg-white/[0.05] p-3"><p className="text-amber-100/60">Sesiones</p><p className="mt-1 text-2xl font-semibold">{sessions.toLocaleString('es-ES')}</p></div><div className="rounded-xl border border-white/10 bg-white/[0.05] p-3"><p className="text-amber-100/60">Imp. LinkedIn</p><p className="mt-1 text-2xl font-semibold">{impressions.toLocaleString('es-ES')}</p></div><div className="rounded-xl border border-white/10 bg-white/[0.05] p-3"><p className="text-amber-100/60">Key events</p><p className="mt-1 text-2xl font-semibold">{keyEvents}</p></div></div>
      </div>
    </header>

    <section className="mt-8">
      <SectionHeading eyebrow="Módulos" title="Inteligencia de negocio" description="La pantalla Analytics existente concentra la medición detallada. Esta portada define la arquitectura completa y deja visibles las capas que todavía están pendientes." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricModule href="/growth-admin/analytics?account=arnau" title="LinkedIn · Arnau" description="Impresiones, reach, engagement, saves, clicks, profile activity y crecimiento atribuible al contenido." status="Import XLSX" tone="blue" />
        <MetricModule href="/growth-admin/analytics?account=sc_analytics" title="LinkedIn · SC-Analytics" description="Rendimiento de la página, contenidos y audiencia mediante exports oficiales mientras la API restringida no esté disponible." status="Import XLSX" tone="blue" />
        <MetricModule href="/growth-admin/analytics#website" title="Website · GA4" description="Sesiones, engagement, CTA, discovery y funnel web. Tracking activo; reporting automático dependerá de Data API." status="Tracking activo" tone="green" />
        <MetricModule href="/growth-admin/analytics#seo" title="SEO · Search Console" description="Queries, impresiones orgánicas, CTR, posición, landing pages y contenido Knowledge." status="Pendiente" tone="amber" />
        <MetricModule href="/growth-admin/analytics" title="Attribution & funnel" description="UTMs y relación Content → Web → Lead → Opportunity → Revenue. Es la capa que permite medir valor comercial real." status="Modelo preparado" tone="violet" />
        <MetricModule href="/growth-admin/analytics" title="Editorial Intelligence" description="Comparación por familia, tema, industria, idioma, CTA y visual para aprender qué atrae, retiene y convierte." status="Evolutivo" tone="slate" />
      </div>
    </section>

    <section className="mt-12 pb-12">
      <SectionHeading eyebrow="Cadencia" title="Qué revisar" description="Métricas sin una rutina de lectura terminan siendo decoración. Esta es la cadencia mínima recomendada." />
      <div className="grid gap-5 xl:grid-cols-3">
        <div className={`${adminPanel} p-6`}><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Semanal</p><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600"><li>- Posts y artículos con mejor/peor rendimiento.</li><li>- Tráfico web, CTA y discovery intent.</li><li>- Leads y oportunidades originadas por canal.</li><li>- Señales de saturación o temas que conviene repetir.</li></ul></div>
        <div className={`${adminPanel} p-6`}><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Mensual</p><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600"><li>- Funnel completo por canal.</li><li>- SEO, landing pages y crecimiento orgánico.</li><li>- Coste/tiempo invertido frente a pipeline generado.</li><li>- Benchmarks internos y objetivos del siguiente mes.</li></ul></div>
        <div className={`${adminPanel} p-6`}><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Trimestral</p><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600"><li>- Canales que merecen más o menos inversión.</li><li>- ICP que realmente convierte.</li><li>- Temas y servicios que generan negocio.</li><li>- Revisión de KPIs del Cuadro de Mando Integral.</li></ul></div>
      </div>
    </section>
  </AdminShell>
}
