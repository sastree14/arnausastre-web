import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, PageHeader, SectionHeading, adminPanel } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { CORPORATE_GOOGLE_EMAIL } from '@/lib/google-oauth-finance'

export const dynamic='force-dynamic'
type Mode='auto'|'scheduled'|'human'|'external'
type Row={area:string;process:string;mode:Mode;frequency:string;source:string;result:string;manual:string}
const rows:Row[]=[
  {area:'Editorial',process:'Generar propuestas',mode:'human',frequency:'Bajo demanda',source:'Research library + histórico editorial + LLM',result:'3 propuestas',manual:'Tú eliges cuál desarrollar o descartas'},
  {area:'Editorial',process:'Desarrollar publicación',mode:'human',frequency:'Bajo demanda',source:'Brief/fuentes guardadas + LLM',result:'Copy + checks + metadata',manual:'Puedes editar y aprobar incluso con warnings'},
  {area:'Editorial',process:'Publicación programada',mode:'scheduled',frequency:'Barrido cada 5 min',source:'content_items + approvals',result:'LinkedIn post o artículo web publicado',manual:'Una vez aprobada/programada no requiere acción; LinkedIn Article sigue necesitando flujo específico'},
  {area:'Visual',process:'Diseño',mode:'human',frequency:'Bajo demanda',source:'Publicación + plantillas V3',result:'Visual adjunto',manual:'Tú puedes editar logo, hook, imagen, layout y adjuntar'},
  {area:'Comercial',process:'CRM / Deal Desk',mode:'auto',frequency:'En cada cambio',source:'companies, people, crm_opportunities',result:'Pipeline y métricas actualizadas',manual:'Tú registras decisiones, notas, etapas y datos que no llegan de integraciones'},
  {area:'Operaciones',process:'Deal ganado → proyecto',mode:'human',frequency:'Una vez por deal',source:'Deal Desk',result:'Proyecto de delivery enlazado',manual:'Confirmas conversión a proyecto'},
  {area:'Inbox',process:'Gmail relevante',mode:'scheduled',frequency:'Cada 10 min',source:'Gmail personal/corporativo',result:'Inbox clasificado',manual:'OAuth inicial de cada cuenta'},
  {area:'Finanzas',process:'Captura de facturas/gastos Gmail',mode:'scheduled',frequency:'Diario + botón manual',source:'Gmail autorizado',result:'finance_import_candidates',manual:'Confirmar/descartar antes de contabilizar'},
  {area:'Finanzas',process:'Facturación/gastos/contabilidad',mode:'auto',frequency:'Al confirmar documentos',source:'Finance OS',result:'KPIs + asientos + fiscalidad estimada',manual:'Doble check y revisión fiscal cuando corresponda'},
  {area:'Finanzas',process:'Banco Revolut Personal',mode:'external',frequency:'Cuando importas extracto',source:'CSV/XLSX Revolut',result:'Movimientos + conciliaciones propuestas',manual:'Descargar/subir extracto y confirmar conciliaciones'},
  {area:'Finanzas',process:'Drive/Sheets financieros',mode:'auto',frequency:'Al generar documento/cierre',source:`Google Workspace ${CORPORATE_GOOGLE_EMAIL}`,result:'Docs/Sheets/PDF en SC-Analytics/Finance',manual:'OAuth corporativo inicial'},
  {area:'Métricas',process:'GA4',mode:'scheduled',frequency:'Diario + botón manual',source:'Google Analytics 4',result:'web_analytics_daily',manual:'OAuth corporativo inicial'},
  {area:'Métricas',process:'Search Console',mode:'scheduled',frequency:'Diario + botón manual',source:'Google Search Console',result:'search_console_daily',manual:'OAuth corporativo inicial'},
  {area:'Métricas',process:'LinkedIn Analytics',mode:'external',frequency:'Cuando importas export',source:'XLS/XLSX oficial LinkedIn',result:'linkedin_post_metrics',manual:'Descargar e importar export porque la API analítica restringida no está concedida'},
  {area:'Research',process:'Brave research',mode:'human',frequency:'Bajo demanda',source:'Brave Search API',result:'Briefs/fuentes reutilizables',manual:'El CRM monitoriza cuota; tú decides cuándo investigar'},
]
const modeMeta:Record<Mode,{label:string;tone:'green'|'blue'|'amber'|'violet'}>={auto:{label:'Automático',tone:'green'},scheduled:{label:'Programado',tone:'blue'},human:{label:'Humano + sistema',tone:'violet'},external:{label:'Importación / límite externo',tone:'amber'}}

export default async function OperatingModelPage(){
  if(!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const groups=[...new Set(rows.map(row=>row.area))]
  return <AdminShell active="system">
    <PageHeader eyebrow="Sistema · Operating model" title="Qué funciona solo y qué haces tú" description="Matriz end-to-end del CRM. Si un proceso no aparece como automático o programado, el sistema no debe fingir que lo hace solo."/>
    <section><SectionHeading eyebrow="Principios" title="Reglas de operación"/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><div className={`${adminPanel} p-4`}><Badge tone="green">Automático</Badge><p className="mt-3 text-xs leading-5 text-slate-500">Se recalcula o ejecuta como consecuencia directa de usar el CRM.</p></div><div className={`${adminPanel} p-4`}><Badge tone="blue">Programado</Badge><p className="mt-3 text-xs leading-5 text-slate-500">Un cron/worker lo ejecuta; existe además acción manual cuando aporta seguridad.</p></div><div className={`${adminPanel} p-4`}><Badge tone="violet">Humano + sistema</Badge><p className="mt-3 text-xs leading-5 text-slate-500">La IA prepara/recomienda, pero la decisión final es tuya.</p></div><div className={`${adminPanel} p-4`}><Badge tone="amber">Límite externo</Badge><p className="mt-3 text-xs leading-5 text-slate-500">No existe una API adecuada en nuestro setup; usamos import oficial y lo indicamos explícitamente.</p></div></div></section>
    {groups.map(group=><section key={group} className="mt-12"><SectionHeading eyebrow="Flujo" title={group}/><div className="space-y-3">{rows.filter(row=>row.area===group).map(row=>{const meta=modeMeta[row.mode];return <article key={row.process} className={`${adminPanel} grid gap-4 p-5 xl:grid-cols-[220px_140px_180px_1fr_1fr]`}><div><p className="font-semibold text-slate-900">{row.process}</p><p className="mt-1 text-[10px] text-slate-400">{row.frequency}</p></div><div><Badge tone={meta.tone}>{meta.label}</Badge></div><div className="text-xs text-slate-600"><p className="text-[10px] uppercase text-slate-400">Fuente</p><p className="mt-1">{row.source}</p></div><div className="text-xs text-slate-600"><p className="text-[10px] uppercase text-slate-400">Resultado</p><p className="mt-1">{row.result}</p></div><div className="text-xs text-slate-600"><p className="text-[10px] uppercase text-slate-400">Intervención tuya</p><p className="mt-1">{row.manual}</p></div></article>})}</div></section>)}
    <section className="mt-12 pb-12"><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900"><strong>Acciones externas que todavía requieren tu consentimiento:</strong> autorizar Google OAuth con {CORPORATE_GOOGLE_EMAIL} (y Gmail personal si lo quieres en Inbox), importar extractos de Revolut Personal y exportar/importar LinkedIn Analytics. El código puede preparar esos flujos, pero no puede concederse permisos de tus cuentas por sí mismo.</div></section>
  </AdminShell>
}
