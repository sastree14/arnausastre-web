import {getWorkspaceContent,preparedEditorialLibrary} from '@/lib/editorial-workspace'
import CommercialViewRefresh from '@/components/growth-admin/CommercialViewRefresh'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, SectionHeading, adminPanel } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getCommercialIntelligenceBundle, getCommercialSummary, getCrmBundle } from '@/lib/growth-admin-performance'
import { getCompetitors } from '@/lib/competition-admin'

function ModuleCard({href,title,description,status='Disponible',tone='violet'}:{href?:string;title:string;description:string;status?:string;tone?:'violet'|'blue'|'green'|'amber'|'slate'}){
  const body=<div className={`${adminPanel} h-full p-5 transition ${href?'hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md':''}`}><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold text-slate-950">{title}</h3><Badge tone={tone}>{status}</Badge></div><p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>{href&&<p className="mt-5 text-xs font-semibold text-indigo-600">Abrir módulo →</p>}</div>
  return href?<a href={href}>{body}</a>:body
}

export default async function CommercialPage(){
  if(!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const [summary,intelligence,competitors,crm]=await Promise.all([getCommercialSummary(),getCommercialIntelligenceBundle(),getCompetitors(),getCrmBundle()])
  const monitoredCompetitors=competitors.filter((item)=>item.is_monitored).length
  const library=preparedEditorialLibrary(await getWorkspaceContent())
  const posts=library.filter(item=>item.content_type==='linkedin_post').length
  const articles=library.filter(item=>item.content_type==='article').length

  return <AdminShell active="commercial"><CommercialViewRefresh/>
    <header className="overflow-hidden rounded-[2rem] border border-indigo-950 bg-indigo-950 text-white shadow-sm"><div className="grid gap-8 px-6 py-9 md:px-10 md:py-12 xl:grid-cols-[1fr_auto] xl:items-end"><div className="max-w-4xl"><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-300">Cuadro de Mando Integral · Comercial</p><h1 className="mt-4 text-4xl md:text-6xl" style={{fontFamily:'var(--font-playfair)'}}>Comercial</h1><p className="mt-5 max-w-3xl text-sm leading-7 text-indigo-100/80 md:text-base">Adquisición, inteligencia, conversión y seguimiento sobre una única fuente de verdad. Cada bloque tiene una función operativa y evita duplicar información.</p></div><div className="grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl border border-white/10 bg-white/[0.05] p-3"><p className="text-indigo-200/70">Oportunidades</p><p className="mt-1 text-2xl font-semibold">{summary.opportunities}</p></div><div className="rounded-xl border border-white/10 bg-white/[0.05] p-3"><p className="text-indigo-200/70">Reuniones</p><p className="mt-1 text-2xl font-semibold">{summary.meetings}</p></div></div></div></header>

    {(summary.degraded||intelligence.degraded||crm.degraded)&&<div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">Alguna lectura ha entrado en modo ligero. Los módulos siguen operativos, pero conviene refrescar antes de tomar una decisión.</div>}

    <section className="mt-8"><SectionHeading eyebrow="Motores comerciales y de autoridad" title="Relaciones y seguimiento" description="Clientes, partners, red profesional, audiencia propia, señales y competencia tienen objetivos diferentes. La newsletter construye una relación editorial y no convierte automáticamente a nadie en lead."/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><ModuleCard href="/growth-admin/crm" title="Clientes y partners" description="Empresas, contactos, estado, conversaciones y siguiente paso. Selector de clientes directos, LinkedIn freelance/B2B y modelos de partners, con guion de contacto y seguimiento en cada ficha."/><ModuleCard href="/growth-admin/network" title="Red profesional" description="Data, AI, analytics, optimización y founders técnicos. Seguir, conectar, conversar y después invitar a seguir SC-Analytics cuando exista contexto." tone="violet"/><ModuleCard href="/growth-admin/competition" title="Competencia" description={`${competitors.length} firmas visibles · ${monitoredCompetitors} monitorizadas. Comparables reales, movimientos públicos, huecos y respuesta para SC-Analytics.`} tone="green"/></div></section>



    <section className="mt-10"><SectionHeading eyebrow="Conversión y autoridad" title="Soporte comercial" description="Contenido, calendario y research apoyan adquisición y conversión; no duplican los motores comerciales."/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><ModuleCard href="/growth-admin/content" title="Publicaciones y artículos" description={`${posts} publicaciones · ${articles} artículos únicos. Consulta de textos y visuales aprobados.`} tone="green"/><ModuleCard href="/growth-admin/calendar" title="Calendario y distribución" description="Planificación, reprogramación, publicación inmediata e histórico del workspace editorial activo." tone="blue"/></div></section>


  </AdminShell>
}
