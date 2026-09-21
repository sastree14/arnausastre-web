import { redirect, notFound } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, PageHeader, adminPanel, statusTone } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated, queryGrowthTable, type GrowthTask } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const TASK_NAMES:Record<string,string>={
  OPERATOR_EDITORIAL_PROPOSALS:'Propuestas editoriales',
  OPERATOR_EDITORIAL_RUN:'Desarrollo de publicación',
  OPERATOR_EDITORIAL_URL:'Contenido desde fuente',
  OPERATOR_REWRITE_CONTENT:'Nueva versión editorial',
  OPERATOR_GENERATE_VISUAL:'Símbolo editorial',
  OPERATOR_PROSPECT:'Prospección comercial',
  OPERATOR_COMMERCIAL_SIGNALS:'Inteligencia comercial',
  OPERATOR_COMPETITOR_DISCOVER:'Descubrimiento de competencia',
  OPERATOR_COMPETITOR_REFRESH:'Actualización de competidor',
  OPERATOR_COMPETITOR_REFRESH_ALL:'Actualización de monitorizadas',
  OPERATOR_PUBLISH_LINKEDIN:'Publicación en LinkedIn',
  OPERATOR_PUBLISH_ARTICLE:'Publicación web',
  OPERATOR_UNPUBLISH_LINKEDIN:'Retirada de LinkedIn',
  OPERATOR_UNPUBLISH_ARTICLE:'Retirada de artículo',
  OPERATOR_DEAL_PROPOSAL:'Propuesta comercial',
  OPERATOR_DEAL_BUDGET:'Presupuesto interno',
  OPERATOR_GMAIL_SYNC:'Sincronización de Inbox',
  OPERATOR_SEO_AUDIT:'Auditoría SEO',
}

function outputCount(outputs:unknown){
  if(Array.isArray(outputs))return outputs.length
  if(outputs&&typeof outputs==='object'){
    const row=outputs as Record<string,unknown>
    for(const key of ['created','count','results','companies','new_relevant']){
      const value=row[key]
      if(Array.isArray(value))return value.length
      if(typeof value==='number')return value
    }
  }
  return null
}

function friendlySummary(task:GrowthTask){
  const outputs=task.outputs as unknown
  if(task.status==='failed'){
    const error=outputs&&typeof outputs==='object'&&!Array.isArray(outputs)?String((outputs as Record<string,unknown>).error||''):''
    return error?'El proceso falló: '+error:'El proceso terminó con error. Revisa el detalle técnico inferior.'
  }
  if(task.status!=='completed')return 'El proceso todavía está en ejecución o en cola.'
  const count=outputCount(outputs)
  if(task.type==='OPERATOR_PROSPECT'&&count===0)return 'El workflow terminó correctamente, pero ningún candidato superó los filtros. No existe un problema de refresco en esta ejecución: el resultado persistido es 0.'
  if(task.type==='OPERATOR_PROSPECT'&&count!==null)return 'El workflow terminó correctamente y produjo '+count+' resultado'+(count===1?'':'s')+'.'
  if(count!==null)return 'El workflow terminó correctamente. Resultados registrados: '+count+'.'
  return 'El workflow terminó correctamente y el resultado quedó persistido en Supabase.'
}

export default async function TracePage({params}:{params:Promise<{taskId:string}>}){
  if(!(await isGrowthAdminAuthenticated()))redirect('/growth-admin/login')
  const parsed=await params
  const taskId=parsed.taskId
  const task=(await queryGrowthTable<GrowthTask>('tasks',{tenant_id:'eq.sc-analytics',task_id:'eq.'+taskId,limit:'1'},{cacheSeconds:0}))[0]
  if(!task)notFound()
  const inputs=(task.inputs||{}) as Record<string,unknown>
  const outputs=task.outputs as unknown
  const resultCount=outputCount(outputs)

  return <AdminShell active="operations">
    <PageHeader eyebrow="CRM · Trazabilidad" title={TASK_NAMES[task.type]||task.type} description="Esta vista corresponde exactamente al proceso seleccionado: qué se pidió, qué estado alcanzó y qué dejó persistido." actions={<a href="/growth-admin/operations" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">Volver a Operaciones</a>}/>

    <section className={adminPanel+' p-5 md:p-6'}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-600">Proceso</p><p className="mt-2 font-mono text-xs text-slate-500">{task.task_id}</p><p className="mt-4 max-w-3xl text-sm leading-6 text-slate-700">{friendlySummary(task)}</p></div>
        <Badge tone={statusTone(task.status)}>{task.status}</Badge>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] font-semibold uppercase text-slate-400">Creado</p><p className="mt-1 text-sm font-semibold text-slate-800">{task.created_at||'—'}</p></div>
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] font-semibold uppercase text-slate-400">Tipo</p><p className="mt-1 text-sm font-semibold text-slate-800">{task.type}</p></div>
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] font-semibold uppercase text-slate-400">Modo</p><p className="mt-1 text-sm font-semibold text-slate-800">{String(inputs.mode||'—')}</p></div>
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] font-semibold uppercase text-slate-400">Resultados</p><p className="mt-1 text-sm font-semibold text-slate-800">{resultCount===null?'—':resultCount}</p></div>
      </div>
    </section>

    <section className="mt-6 grid gap-5 lg:grid-cols-2">
      <div className={adminPanel+' p-5'}><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Solicitud</p><pre className="mt-4 max-h-[520px] overflow-auto rounded-xl bg-slate-950 p-4 text-[11px] leading-5 text-slate-100">{JSON.stringify(inputs,null,2)}</pre></div>
      <div className={adminPanel+' p-5'}><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Resultado persistido</p><pre className="mt-4 max-h-[520px] overflow-auto rounded-xl bg-slate-950 p-4 text-[11px] leading-5 text-slate-100">{JSON.stringify(outputs??{},null,2)}</pre></div>
    </section>
  </AdminShell>
}
