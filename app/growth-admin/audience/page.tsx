import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, EmptyState, PageHeader, SectionHeading, adminButtonPrimary, adminPanel } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated, queryGrowthTable } from '@/lib/growth-admin'

export const dynamic='force-dynamic';export const revalidate=0

type Subscriber={subscriber_id:string;email:string;name?:string;company?:string;language:string;interests?:string[];status:string;source_path?:string;last_sent_at?:string;created_at?:string}
type Inquiry={inquiry_id:string;name:string;company?:string;email:string;message:string;language:string;source_path?:string;status:string;created_at?:string}
type Campaign={campaign_id:string;recipients_count:number;sent_count:number;failed_count:number;status:string;sent_at?:string;created_at?:string}

export default async function AudiencePage({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  if(!(await isGrowthAdminAuthenticated()))redirect('/growth-admin/login')
  const params=await searchParams
  const [subscribers,inquiries,campaigns]=await Promise.all([
    queryGrowthTable<Subscriber>('newsletter_subscribers',{tenant_id:'eq.sc-analytics',order:'created_at.desc',limit:'500'},{cacheSeconds:0}).catch(()=>[]),
    queryGrowthTable<Inquiry>('website_inquiries',{tenant_id:'eq.sc-analytics',order:'created_at.desc',limit:'250'},{cacheSeconds:0}).catch(()=>[]),
    queryGrowthTable<Campaign>('newsletter_campaigns',{tenant_id:'eq.sc-analytics',order:'created_at.desc',limit:'50'},{cacheSeconds:0}).catch(()=>[]),
  ])
  const active=subscribers.filter(row=>row.status==='active')
  const newInquiries=inquiries.filter(row=>row.status==='new')
  return <AdminShell active="audience">
    <PageHeader eyebrow="Comercial · Owned audience" title="Audiencia propia" description="Suscriptores del SC-Analytics Briefing e inbound de la web. La suscripción es una relación editorial; no convierte automáticamente a nadie en lead comercial." actions={<form action="/api/growth-admin/newsletter/send" method="post"><input type="hidden" name="return_to" value="/growth-admin/audience"/><button className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">Enviar digest con contenido nuevo</button></form>}/>

    {(params.newsletter_sent!==undefined)&&<div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">Digest terminado: {params.newsletter_sent} enviados · {params.newsletter_skipped||0} sin novedades · {params.newsletter_failed||0} errores.</div>}

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className={`${adminPanel} p-5`}><p className="text-[10px] font-semibold uppercase text-slate-400">Suscriptores activos</p><p className="mt-2 text-3xl font-semibold">{active.length}</p></div>
      <div className={`${adminPanel} p-5`}><p className="text-[10px] font-semibold uppercase text-slate-400">Inbound nuevo</p><p className="mt-2 text-3xl font-semibold">{newInquiries.length}</p></div>
      <div className={`${adminPanel} p-5`}><p className="text-[10px] font-semibold uppercase text-slate-400">Consultas totales</p><p className="mt-2 text-3xl font-semibold">{inquiries.length}</p></div>
      <div className={`${adminPanel} p-5`}><p className="text-[10px] font-semibold uppercase text-slate-400">Digests enviados</p><p className="mt-2 text-3xl font-semibold">{campaigns.filter(row=>row.sent_count>0).length}</p></div>
    </section>

    <section className="mt-10"><SectionHeading eyebrow="Inbound web" title="Personas que han pedido hablar" description="Esto sí es intención comercial explícita. El formulario queda persistido aunque falle la notificación por email." count={inquiries.length}/>{inquiries.length===0?<EmptyState>Todavía no hay consultas guardadas desde la web.</EmptyState>:<div className="space-y-3">{inquiries.slice(0,100).map(row=><article key={row.inquiry_id} className={`${adminPanel} p-5`}><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex gap-2"><Badge tone={row.status==='new'?'amber':'green'}>{row.status}</Badge><Badge>{row.language.toUpperCase()}</Badge></div><h3 className="mt-3 font-semibold">{row.name}{row.company?` · ${row.company}`:''}</h3><a href={`mailto:${row.email}`} className="mt-1 block text-sm text-indigo-600">{row.email}</a></div><p className="text-xs text-slate-400">{row.created_at?new Date(row.created_at).toLocaleString('es-ES',{timeZone:'Europe/Madrid'}):''}</p></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{row.message}</p><p className="mt-3 text-[10px] text-slate-400">Origen: {row.source_path||'web'}</p></article>)}</div>}</section>

    <section className="mt-10"><SectionHeading eyebrow="SC-Analytics Briefing" title="Suscriptores" description="Audiencia propia interesada en artículos, sectores, proyectos y actualidad. Mantén separada la suscripción editorial del outreach comercial salvo que la persona exprese intención." count={subscribers.length}/>{subscribers.length===0?<EmptyState>Todavía no hay suscriptores. El formulario público ya está preparado.</EmptyState>:<div className={`${adminPanel} overflow-hidden`}><div className="divide-y divide-slate-100">{subscribers.slice(0,200).map(row=><div key={row.subscriber_id} className="grid gap-2 p-4 md:grid-cols-[1.2fr_.7fr_.4fr_1fr] md:items-center"><div><p className="text-sm font-semibold">{row.name||row.email}</p>{row.name&&<p className="text-xs text-slate-500">{row.email}</p>}</div><p className="text-xs text-slate-500">{row.company||'—'}</p><div className="flex gap-2"><Badge tone={row.status==='active'?'green':'slate'}>{row.status}</Badge><Badge>{row.language.toUpperCase()}</Badge></div><p className="text-[10px] text-slate-400">{(row.interests||[]).slice(0,3).join(' · ')||row.source_path||'web'}</p></div>)}</div></div>}</section>

    <section className="mt-10 pb-12"><SectionHeading eyebrow="Cadencia" title="Cómo funciona el briefing" description="El digest semanal solo se envía cuando existe contenido web nuevo desde el último envío del suscriptor. También puedes ejecutarlo manualmente."/><div className={`${adminPanel} p-6`}><p className="text-sm leading-7 text-slate-600">La automatización no inventa newsletters para cumplir una frecuencia. Agrupa los artículos publicados, selecciona la variante ES/CA/EN de cada suscriptor y mantiene enlace de baja individual. Si no hay novedades, no envía nada.</p><form action="/api/growth-admin/newsletter/send" method="post" className="mt-5"><input type="hidden" name="return_to" value="/growth-admin/audience"/><input type="hidden" name="force" value="1"/><button className={adminButtonPrimary}>Enviar prueba/digest aunque no haya novedad</button></form></div></section>
  </AdminShell>
}
