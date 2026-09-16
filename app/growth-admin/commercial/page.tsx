import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, SectionHeading, adminPanel } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getCommercialIntelligenceBundle, getCommercialSummary } from '@/lib/growth-admin-performance'
import { getCompetitors } from '@/lib/competition-admin'

function ModuleCard({ href, title, description, status = 'Disponible', tone = 'violet' }: { href?: string; title: string; description: string; status?: string; tone?: 'violet' | 'blue' | 'green' | 'amber' | 'slate' }) {
  const body = <div className={`${adminPanel} h-full p-5 transition ${href ? 'hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md' : ''}`}>
    <div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold text-slate-950">{title}</h3><Badge tone={tone}>{status}</Badge></div>
    <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    {href && <p className="mt-5 text-xs font-semibold text-indigo-600">Abrir módulo →</p>}
  </div>
  return href ? <a href={href}>{body}</a> : body
}

export default async function CommercialPage() {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const [summary, intelligence, competitors] = await Promise.all([getCommercialSummary(), getCommercialIntelligenceBundle(), getCompetitors()])
  const strongSignals = intelligence.signals.filter((signal) => Number(signal.strength || 0) >= 8).length
  const monitoredCompetitors = competitors.filter((item) => item.is_monitored).length

  return <AdminShell active="commercial">
    <header className="overflow-hidden rounded-[2rem] border border-indigo-950 bg-indigo-950 text-white shadow-sm">
      <div className="grid gap-8 px-6 py-9 md:px-10 md:py-12 xl:grid-cols-[1fr_auto] xl:items-end">
        <div className="max-w-4xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-300">Cuadro de Mando Integral · Comercial</p>
          <h1 className="mt-4 text-4xl md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>Comercial</h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-indigo-100/80 md:text-base">Cuatro motores separados: clientes directos, partners/canales, inteligencia comercial y radar competitivo. Después, discovery, propuestas y contenido alimentan el mismo sistema.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl border border-white/10 bg-white/[0.05] p-3"><p className="text-indigo-200/70">Oportunidades</p><p className="mt-1 text-2xl font-semibold">{summary.opportunities}</p></div><div className="rounded-xl border border-white/10 bg-white/[0.05] p-3"><p className="text-indigo-200/70">Reuniones</p><p className="mt-1 text-2xl font-semibold">{summary.meetings}</p></div></div>
      </div>
    </header>

    {(summary.degraded || intelligence.degraded) && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">Resumen cargado en modo ligero. Los módulos siguen disponibles aunque Supabase haya tardado en una lectura.</div>}

    <section className="mt-8">
      <SectionHeading eyebrow="Motores comerciales" title="Cuatro trabajos distintos" description="No repetimos la misma información: cada módulo responde a una pregunta comercial diferente y todos convergen en el mismo sistema." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ModuleCard href="/growth-admin/crm" title="Clientes potenciales" description={`${summary.lead_companies} empresas objetivo · ${summary.lead_people} decisores. ¿A qué empresas finales debemos vender directamente y con qué persona debemos hablar?`} />
        <ModuleCard href="/growth-admin/partners" title="Partners & canales" description={`${summary.partner_companies} partners · ${summary.partner_people} contactos. ¿Qué terceros pueden derivarnos demanda, ampliar su delivery con nosotros o trabajar white-label?`} tone="blue" />
        <ModuleCard href="/growth-admin/intelligence" title="Inteligencia comercial" description={`${intelligence.signals.length} señales · ${strongSignals} de alta prioridad · ${intelligence.offers.length} ofertas. ¿Por qué contactar ahora, con qué oferta entrar y por qué canal distribuir?`} tone="amber" />
        <ModuleCard href="/growth-admin/competition" title="Competencia" description={`${competitors.length} firmas persistentes · ${monitoredCompetitors} monitorizadas. ¿Quién se parece realmente a SC-Analytics, qué está moviendo y qué huecos podemos aprovechar?`} tone="green" />
      </div>
    </section>

    <section className="mt-10">
      <SectionHeading eyebrow="Conversión y autoridad" title="Módulos de soporte comercial" description="Editorial, calendario y research apoyan captación y conversión; no sustituyen a los motores de adquisición e inteligencia." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ModuleCard href="/growth-admin/content" title="Editorial & contenido" description={`${summary.active_content} piezas registradas. El workspace activo puede reiniciarse sin borrar publicaciones ni histórico. Generación, revisión, aprobaciones, artículos, LinkedIn, CTA y visuales viven juntos.`} tone="green" />
        <ModuleCard href="/growth-admin/calendar" title="Calendario y distribución" description="Planificación de publicaciones, reprogramación, publicación inmediata e histórico del workspace editorial activo." tone="blue" />
        <ModuleCard href="/growth-admin/research" title="Research editorial" description="Señales, evidencia, briefs e ideas que alimentan publicaciones y artículos con criterio de negocio." />
      </div>
    </section>

    <section className="mt-12" id="competition">
      <SectionHeading eyebrow="Mercado" title="Competencia y contexto" description="El radar ya no es una checklist manual. La watchlist conserva empresas comparables y puede monitorizar movimientos públicos de cada una." />
      <div className="grid gap-5 xl:grid-cols-2">
        <a href="/growth-admin/competition" className={`${adminPanel} p-6 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md`}><div className="flex items-center justify-between"><h3 className="text-xl font-semibold text-slate-950">Radar de competencia</h3><Badge tone="green">Operativo</Badge></div><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600"><li>- Descubrimiento de consultoras boutique y comparables; gigantes excluidos.</li><li>- Watchlist persistente: volver a buscar no borra las empresas guardadas.</li><li>- Monitorización por empresa y actualización manual bajo demanda.</li><li>- Movimientos con fuente, impacto para SC y respuesta sugerida.</li></ul><p className="mt-5 text-xs font-semibold text-indigo-600">Abrir radar →</p></a>
        <div className={`${adminPanel} p-6`}><div className="flex items-center justify-between"><h3 className="text-xl font-semibold text-slate-950">Distribución</h3><Badge>Operativo</Badge></div><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600"><li>- Outbound directo basado en señales.</li><li>- Partners, referrals y white-label.</li><li>- Brokers, marketplaces, ecosystems y procurement.</li><li>- Inbound, contenido, networking y referencias.</li></ul></div>
      </div>
    </section>

    <section className="mt-12" id="proposals">
      <SectionHeading eyebrow="Conversión" title="Discovery, proposals y presupuesto" description="La documentación puede seguir viviendo en Drive/Docs/Slides; el CRM fija cuándo existe cada fase y conserva la trazabilidad." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ModuleCard title="Discovery call" description="Identificar oportunidades, cuellos de botella, déficits, riesgos, escalabilidad y mejoras antes de proponer una solución." status="Proceso" tone="green" />
        <ModuleCard title="Qualification" description="Problema, impacto, urgencia, presupuesto, decisor, datos/sistemas y siguiente paso comercial." status="Proceso" tone="blue" />
        <ModuleCard title="Proposal builder" description="Alcance, entregables, fases, timings, supuestos, riesgos y condiciones." status="Manual" tone="amber" />
        <ModuleCard title="Budget helper" description="Horas, perfiles, margen, costes, contingencia y precio final." status="Manual" tone="amber" />
      </div>
    </section>

    <section className="mt-12 pb-12">
      <SectionHeading eyebrow="Rutina comercial" title="Checklist semanal" />
      <div className={`${adminPanel} grid gap-3 p-6 md:grid-cols-2 xl:grid-cols-4`}>
        {['Revisar clientes y siguientes acciones', 'Revisar señales de alta prioridad', 'Buscar partners y canales complementarios', 'Revisar propuestas y follow-ups', 'Comprobar discovery calls próximas', 'Revisar radar competitivo y movimientos', 'Revisar rendimiento de contenido', 'Elegir prioridades comerciales de la semana'].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600"><span className="mr-2 text-indigo-600">□</span>{item}</div>)}
      </div>
    </section>
  </AdminShell>
}
