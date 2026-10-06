import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, SectionHeading, adminPanel } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getDashboardSummary } from '@/lib/growth-admin-performance'

const money = (value: number) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(value)

function SectorCard({ href, name, eyebrow, description, color, soft, border, metrics, modules }: {
  href: string
  name: string
  eyebrow: string
  description: string
  color: string
  soft: string
  border: string
  metrics: Array<{ label: string; value: string | number }>
  modules: string[]
}) {
  return <a href={href} className={`group relative overflow-hidden rounded-[1.75rem] border bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-xl ${border}`}>
    <div className={`absolute inset-x-0 top-0 h-1.5 ${color}`} />
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${soft}`}>{eyebrow}</p>
        <h2 className="mt-3 text-3xl text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{name}</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-semibold text-white ${color}`}>↗</span>
    </div>
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {metrics.map((metric) => <div key={metric.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xl font-semibold text-slate-950">{metric.value}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">{metric.label}</p></div>)}
    </div>
    <div className="mt-5 flex flex-wrap gap-2">{modules.map((module) => <span key={module} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-500">{module}</span>)}</div>
    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-xs font-semibold text-slate-700">Entrar en {name}</span><span className="text-sm text-slate-400 transition group-hover:translate-x-1">→</span></div>
  </a>
}

export default async function GrowthAdminPage() {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const summary = await getDashboardSummary()
  const outstanding = Math.max(0, Number(summary.invoiced) - Number(summary.collected))

  return <AdminShell active="home">
    <header className="overflow-hidden rounded-[2rem] border border-slate-900 bg-slate-950 text-white shadow-sm">
      <div className="grid gap-8 px-6 py-9 md:px-10 md:py-12 xl:grid-cols-[1fr_auto] xl:items-end">
        <div className="max-w-5xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-indigo-300">SC-Analytics · Business Operating System</p>
          <h1 className="mt-4 text-4xl leading-tight md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>Cuadro de Mando Integral</h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">Entrada única a la empresa. Comercial, Finanzas, Métricas y Operaciones concentran la gestión; las tareas manuales siguen siendo manuales hasta que tenga sentido automatizarlas.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"><p className="text-slate-400">Clientes / accounts</p><p className="mt-1 text-xl font-semibold text-white">{summary.companies}</p></div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"><p className="text-slate-400">Proyectos activos</p><p className="mt-1 text-xl font-semibold text-white">{summary.active_projects}</p></div>
        </div>
      </div>
    </header>

    {summary.degraded && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">El cuadro se ha cargado en modo ligero porque una lectura de datos tardó demasiado. Puedes seguir navegando; los módulos detallados reintentan sus datos al abrirse.</div>}

    <section className="mt-8">
      <SectionHeading eyebrow="Áreas de gestión" title="La empresa en cuatro bloques" description="Cada bloque actúa como una puerta de entrada a sus módulos. Lo que todavía no está integrado aparece como proceso manual o módulo preparado, no como falsa automatización." />
      <div className="grid gap-5 xl:grid-cols-2">
        <SectorCard href="/growth-admin/commercial" name="Comercial" eyebrow="Revenue & Growth" description="Captación, cuentas, contactos, pipeline, discovery, propuestas, competencia y todo el ciclo editorial que alimenta el funnel." color="bg-indigo-600" soft="text-indigo-600" border="border-indigo-100 hover:border-indigo-300" metrics={[{ label: 'Oportunidades', value: summary.opportunities }, { label: 'Reuniones', value: summary.meetings }, { label: 'Acciones', value: summary.manual_actions }, { label: 'Publicados', value: summary.published_content }]} modules={['Pipeline', 'Prospecting', 'Editorial', 'Competencia', 'Proposals', 'Discovery']} />
        <SectorCard href="/growth-admin/finance" name="Finanzas" eyebrow="Cash & Control" description="Facturación, cobros, gastos, tesorería, rentabilidad y control económico. La contabilidad fiscal completa se añadirá cuando corresponda." color="bg-emerald-600" soft="text-emerald-700" border="border-emerald-100 hover:border-emerald-300" metrics={[{ label: 'Facturado', value: `${money(Number(summary.invoiced))} €` }, { label: 'Cobrado', value: `${money(Number(summary.collected))} €` }, { label: 'Pendiente', value: `${money(outstanding)} €` }, { label: 'Gastos', value: `${money(Number(summary.spent))} €` }]} modules={['Facturas', 'Cobros', 'Gastos', 'Tesorería', 'Rentabilidad', 'Forecast']} />
        <SectorCard href="/growth-admin/metrics" name="Métricas" eyebrow="Performance & Intelligence" description="LinkedIn, web, SEO, atribución, funnel y rendimiento editorial/comercial para decidir con datos y no por intuición." color="bg-amber-500" soft="text-amber-700" border="border-amber-100 hover:border-amber-300" metrics={[{ label: 'Sesiones web', value: Number(summary.web_sessions).toLocaleString('es-ES') }, { label: 'Imp. LinkedIn', value: Number(summary.linkedin_impressions).toLocaleString('es-ES') }, { label: 'Posts medidos', value: summary.linkedin_posts_measured }, { label: 'GA4', value: 'Activo' }]} modules={['LinkedIn', 'GA4', 'SEO', 'Attribution', 'Editorial', 'Dashboards']} />
        <SectorCard href="/growth-admin/operations" name="Operaciones" eyebrow="Delivery & Infrastructure" description="Proyectos, tareas, automatizaciones, knowledge, Google Drive, documentación, plantillas, SOPs, integraciones y salud del sistema." color="bg-violet-600" soft="text-violet-700" border="border-violet-100 hover:border-violet-300" metrics={[{ label: 'Proyectos', value: summary.active_projects }, { label: 'Tareas abiertas', value: summary.open_tasks }, { label: 'Fallos', value: summary.failed_tasks }, { label: 'LinkedIn', value: summary.linkedin_connected ? 'OK' : 'Revisar' }]} modules={['Delivery', 'Workflows', 'Knowledge', 'Google Drive', 'SOPs', 'Integraciones']} />
      </div>
    </section>

    <section id="approvals" className="mt-12">
      <SectionHeading eyebrow="Atención ejecutiva" title="Qué requiere revisión" description="No todo debe automatizarse. Esta bandeja concentra los puntos que conviene mirar antes de seguir trabajando." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <a href="/growth-admin/approvals" className={`${adminPanel} p-5 transition hover:border-amber-300`}><Badge tone="amber">Editorial</Badge><p className="mt-4 text-3xl font-semibold text-slate-950">{summary.pending_approvals}</p><p className="mt-1 text-sm text-slate-500">aprobaciones pendientes</p></a>
        <a href="/growth-admin/crm" className={`${adminPanel} p-5 transition hover:border-indigo-300`}><Badge tone="violet">Comercial</Badge><p className="mt-4 text-3xl font-semibold text-slate-950">{summary.manual_actions}</p><p className="mt-1 text-sm text-slate-500">acciones comerciales preparadas</p></a>
        <a href="/growth-admin/finance" className={`${adminPanel} p-5 transition hover:border-rose-300`}><Badge tone={summary.overdue_invoices > 0 ? 'rose' : 'green'}>Finanzas</Badge><p className="mt-4 text-3xl font-semibold text-slate-950">{summary.overdue_invoices}</p><p className="mt-1 text-sm text-slate-500">facturas vencidas sin cerrar</p></a>
        <a href="/growth-admin/operations" className={`${adminPanel} p-5 transition hover:border-violet-300`}><Badge tone={summary.failed_tasks > 0 ? 'rose' : 'green'}>Operaciones</Badge><p className="mt-4 text-3xl font-semibold text-slate-950">{summary.failed_tasks}</p><p className="mt-1 text-sm text-slate-500">tareas con error</p></a>
      </div>
    </section>

    <section className="mt-12">
      <SectionHeading eyebrow="Cadencia directiva" title="Qué revisar de forma habitual" description="Una rutina de gestión para que el sistema no dependa de acordarte de todo. De momento es guía manual; más adelante podremos convertir algunos checks en datos automáticos." />
      <div className="grid gap-5 xl:grid-cols-3">
        <div className={`${adminPanel} p-6`}><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Semanal</p><h3 className="mt-3 text-xl font-semibold text-slate-950">Pulso de la empresa</h3><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600"><li>- Pipeline, follow-ups y nuevas oportunidades.</li><li>- Facturas, cobros pendientes y gastos relevantes.</li><li>- Contenido publicado, tráfico, leads y conversiones.</li><li>- Proyectos, bloqueos, carga y tareas críticas.</li><li>- Movimientos relevantes de competidores y mercado.</li></ul></div>
        <div className={`${adminPanel} p-6`}><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Mensual</p><h3 className="mt-3 text-xl font-semibold text-slate-950">Performance y rentabilidad</h3><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600"><li>- Ingresos, margen, gastos y cash-flow.</li><li>- Win rate, ticket medio y origen de oportunidades.</li><li>- Canales que generan atención cualificada.</li><li>- Rentabilidad por cliente/proyecto y capacidad.</li><li>- Documentación, SOPs y herramientas que faltan.</li></ul></div>
        <div className={`${adminPanel} p-6`}><p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Trimestral</p><h3 className="mt-3 text-xl font-semibold text-slate-950">Dirección y estrategia</h3><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600"><li>- ICP, posicionamiento, pricing y portfolio de servicios.</li><li>- Competidores, partners y mercados prioritarios.</li><li>- Objetivos, capacidad de equipo y contratación.</li><li>- Automatizaciones que ya compensan desarrollar.</li><li>- Herramientas que sobran, faltan o deben cambiar.</li></ul></div>
      </div>
    </section>

    <section className="mt-12 pb-12">
      <SectionHeading eyebrow="Accesos transversales" title="Herramientas y recursos" description="No son un quinto departamento. Son utilidades comunes que dan soporte a los cuatro bloques principales." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <a href="https://drive.google.com/" target="_blank" rel="noreferrer" className={`${adminPanel} p-5 transition hover:-translate-y-0.5 hover:shadow-md`}><p className="text-sm font-semibold text-slate-950">Google Drive ↗</p><p className="mt-2 text-xs leading-5 text-slate-500">Knowledge, documentos, plantillas y archivos.</p></a>
        <a href="/growth-admin/visual-studio" className={`${adminPanel} p-5 transition hover:-translate-y-0.5 hover:shadow-md`}><p className="text-sm font-semibold text-slate-950">Visual Studio</p><p className="mt-2 text-xs leading-5 text-slate-500">Assets para publicaciones y artículos.</p></a>
        <a href="/growth-admin/deal-desk?step=proposal" className={`${adminPanel} p-5 transition hover:-translate-y-0.5 hover:shadow-md`}><p className="text-sm font-semibold text-slate-950">Proposals & budgets</p><p className="mt-2 text-xs leading-5 text-slate-500">Proposal Builder y pricing sobre oportunidades reales del pipeline.</p></a>
        <a href="/growth-admin/operations#knowledge" className={`${adminPanel} p-5 transition hover:-translate-y-0.5 hover:shadow-md`}><p className="text-sm font-semibold text-slate-950">Manuales & SOPs</p><p className="mt-2 text-xs leading-5 text-slate-500">Procedimientos, plantillas y documentación.</p></a>
        <a href="https://analytics.google.com/" target="_blank" rel="noreferrer" className={`${adminPanel} p-5 transition hover:-translate-y-0.5 hover:shadow-md`}><p className="text-sm font-semibold text-slate-950">Google Analytics ↗</p><p className="mt-2 text-xs leading-5 text-slate-500">Consulta directa mientras completamos la Data API.</p></a>
        <a href="/growth-admin/system" className={`${adminPanel} p-5 transition hover:-translate-y-0.5 hover:shadow-md`}><p className="text-sm font-semibold text-slate-950">Integraciones</p><p className="mt-2 text-xs leading-5 text-slate-500">LinkedIn, GA4, Apollo, Calendly y workers.</p></a>
      </div>
    </section>
  </AdminShell>
}
