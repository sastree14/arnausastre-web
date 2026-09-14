import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, EmptyState, PageHeader, SectionHeading, adminButtonPrimary, adminInput, adminPanel } from '@/components/growth-admin/AdminUi'
import { getRecentEditorialBriefs, isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ResearchPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params=await searchParams
  const briefs=await getRecentEditorialBriefs()
  const queued=typeof params.queued==='string'?params.queued:''

  return <AdminShell active="research">
    <PageHeader eyebrow="CRM · Editorial Intelligence" title="Research y briefs" description="La investigación no vive aparte: alimenta el mismo CRM que después publica, mide, atribuye y convierte. Aquí se decide qué merece contenido y por qué." actions={<a href="/growth-admin/content" className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">Ver contenido generado</a>}/>
    {queued&&<div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">Research encolado: {queued}.</div>}

    <section className="rounded-3xl border border-indigo-100 bg-indigo-50/60 p-5 md:p-7">
      <SectionHeading eyebrow="Discovery editorial" title="Generar nuevas oportunidades" description="Dos entradas, un único pipeline: búsqueda abierta o una fuente concreta. Ambas pasan por el mismo evidence gate." />
      <div className="grid gap-5 xl:grid-cols-2">
        <form action="/api/growth-admin/operator-task" method="post" className={`${adminPanel} p-5`}><input type="hidden" name="action" value="editorial_run"/><input type="hidden" name="return_to" value="/growth-admin/research"/><p className="text-sm font-semibold text-slate-950">Barrida editorial manual</p><p className="mt-2 text-xs leading-5 text-slate-500">Busca señales actuales y deja que el gate editorial seleccione las mejores con evidencia.</p><textarea name="theme_hint" className={`mt-4 min-h-24 w-full ${adminInput}`} placeholder="Tema opcional; dejar vacío permite búsqueda diversificada."/><div className="mt-3 flex flex-wrap gap-2"><input type="number" name="max_signals" defaultValue="30" className={`w-24 ${adminInput}`}/><input type="number" name="max_briefs" defaultValue="2" className={`w-20 ${adminInput}`}/><button className={`ml-auto ${adminButtonPrimary}`}>Ejecutar</button></div></form>
        <form action="/api/growth-admin/operator-task" method="post" className={`${adminPanel} p-5`}><input type="hidden" name="action" value="editorial_url"/><input type="hidden" name="return_to" value="/growth-admin/research"/><p className="text-sm font-semibold text-slate-950">Investigar una fuente concreta</p><p className="mt-2 text-xs leading-5 text-slate-500">Introduce una noticia, paper, informe o URL y pasa por el mismo evidence gate.</p><input type="url" name="url" required placeholder="https://..." className={`mt-4 w-full ${adminInput}`}/><input name="title" placeholder="Título opcional" className={`mt-2 w-full ${adminInput}`}/><button className={`mt-3 ${adminButtonPrimary}`}>Investigar</button></form>
      </div>
    </section>

    <section className="mt-12 pb-12"><SectionHeading eyebrow="CRM · Canonical briefs" title="Ideas investigadas" description="Tesis, evidencia, problema de negocio, audiencia y decisión editorial permanecen vinculados al contenido que salga de cada brief." count={briefs.length}/><div className="space-y-4">{briefs.length===0&&<EmptyState>Todavía no hay briefs.</EmptyState>}{briefs.map((brief)=>{const sources=brief.research?.source_urls||[];return <details key={brief.brief_id} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"><summary className="cursor-pointer list-none"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap gap-2"><Badge>{brief.family}</Badge><Badge tone="violet">{Number(brief.weighted_score||0).toFixed(1)}/10</Badge><Badge>{brief.output_decision}</Badge><Badge>{brief.status}</Badge>{brief.visual?.needed&&<Badge tone="blue">visual: {brief.visual.type||'sí'}</Badge>}</div><h2 className="mt-4 text-xl font-semibold text-slate-950">{brief.canonical_title}</h2><p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{brief.thesis}</p></div><span className="text-xs font-semibold text-indigo-600">Abrir brief ↓</span></div></summary><div className="mt-5 grid gap-5 border-t border-slate-200 pt-5 lg:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Problema de negocio</p><p className="mt-2 text-sm leading-6 text-slate-700">{brief.business_problem||'—'}</p><p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">Audiencia</p><p className="mt-2 text-sm text-slate-700">{(brief.target_audience||[]).join(', ')||'—'}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fuentes</p><div className="mt-2 flex flex-col gap-2">{sources.map((url,index)=><a key={url} href={url} target="_blank" rel="noreferrer" className="truncate text-sm font-medium text-indigo-600">Fuente {index+1} ↗ · {url}</a>)}</div></div></div></details>})}</div></section>
  </AdminShell>
}
