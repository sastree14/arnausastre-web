import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, EmptyState, PageHeader, SectionHeading, assetUrl, scheduleInputValue, statusTone } from '@/components/growth-admin/AdminUi'
import { evaluatePublicationReadiness } from '@/lib/growth-approval'
import { getApprovalHistory, getPendingApprovals, getRecentContent, getRecentEditorialBriefs, isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ApprovalsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params = await searchParams
  const [approvals, history, content, briefs] = await Promise.all([getPendingApprovals(), getApprovalHistory(), getRecentContent(), getRecentEditorialBriefs()])
  const contentById = new Map(content.map((item) => [item.content_id, item]))
  const briefById = new Map(briefs.map((brief) => [brief.brief_id, brief]))
  const blocked = typeof params.blocked === 'string' ? params.blocked : ''
  const decided = history.filter((row) => row.status !== 'pending').slice(0, 30)

  return <AdminShell active="approvals">
    <PageHeader eyebrow="Human-in-the-loop" title="Aprobaciones" description="Aquí una aprobación significa únicamente que una pieza queda autorizada. Publicar ahora o en una fecha concreta es una acción separada y trazable." actions={<a href="/growth-admin/content" className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300">Biblioteca de contenido</a>}/>
    {blocked && <div className="mb-6 rounded-xl border border-rose-900 bg-rose-950/20 p-4 text-sm text-rose-200"><strong>Aprobación bloqueada:</strong> {blocked}</div>}

    <SectionHeading eyebrow="Decisión humana" title="Pendientes" description="No se puede aprobar una pieza que todavía falle el critic, el contrato o el visual requerido. Revisa siempre la preview de destino." count={approvals.length}/>
    <div className="space-y-5">{approvals.length===0 && <EmptyState>No hay decisiones pendientes.</EmptyState>}{approvals.map((approval) => {
      const item = contentById.get(approval.target_id)
      const isPublish = ['publish_post','publish_article'].includes(approval.action_type)
      const brief = item?.brief_id ? briefById.get(item.brief_id) : undefined
      const readiness = item && isPublish ? evaluatePublicationReadiness(item, brief) : null
      const image = item ? assetUrl(item) : null
      const payload = approval.payload || {}
      return <article key={approval.approval_id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"><div className="grid xl:grid-cols-[220px_1fr]">
        {isPublish && item ? <div className="border-b border-slate-800 bg-slate-950/70 p-4 xl:border-b-0 xl:border-r">{image?<img src={image} alt={item.title} className="h-48 w-full rounded-xl border border-slate-800 object-contain"/>:<div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-700 p-4 text-center text-xs text-slate-600">Sin visual adjunto</div>}<div className="mt-3 grid gap-2"><a href={`/growth-admin/preview/${item.content_id}`} className="rounded-lg bg-white px-3 py-2 text-center text-xs font-semibold text-slate-950">Preview final</a><a href={`/growth-admin/visual-studio?content=${encodeURIComponent(item.content_id)}`} className="rounded-lg border border-sky-800 px-3 py-2 text-center text-xs text-sky-300">{image?'Editar visual':'Diseñar visual'}</a></div></div>:<div className="hidden xl:block"/>}
        <div className="p-5 md:p-6"><div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between"><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><Badge tone={approval.action_type==='publish_article'?'violet':approval.action_type==='publish_post'?'blue':'slate'}>{approval.action_type}</Badge>{payload.family&&<Badge>{String(payload.family)}</Badge>}{payload.language&&<Badge>{String(payload.language).toUpperCase()}</Badge>}{typeof payload.quality_score==='number'&&<Badge tone="green">quality {payload.quality_score.toFixed(1)}</Badge>}{readiness?.ready&&<Badge tone="green">READY</Badge>}</div><h2 className="mt-4 text-lg font-semibold text-white">{item?.title||approval.summary}</h2>{typeof payload.message==='string'&&payload.message&&<p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">{payload.message}</p>}
          {readiness && !readiness.ready && <div className="mt-4 rounded-xl border border-amber-900/50 bg-amber-950/15 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-amber-300">No está lista para aprobar</p><ul className="mt-2 space-y-1 text-xs leading-5 text-amber-100">{readiness.issues.map((issue)=><li key={issue}>- {issue}</li>)}</ul>{item&&<form action="/api/growth-admin/operator-task" method="post" className="mt-3"><input type="hidden" name="action" value="rewrite_content"/><input type="hidden" name="content_id" value={item.content_id}/><input type="hidden" name="return_to" value="/growth-admin/approvals"/><button className="rounded-lg border border-violet-700 px-3 py-2 text-xs text-violet-200">Reescribir en mi estilo y revalidar</button></form>}</div>}
          {!isPublish && <div className="mt-4 flex flex-wrap gap-3 text-xs">{payload.person && typeof payload.person==='object' && 'linkedin_url' in payload.person && payload.person.linkedin_url ? <a href={String(payload.person.linkedin_url)} target="_blank" className="text-sky-300">Abrir LinkedIn ↗</a>:null}{typeof payload.linkedin_search_url==='string'&&payload.linkedin_search_url&&<a href={payload.linkedin_search_url} target="_blank" className="text-sky-300">Buscar en LinkedIn ↗</a>}{typeof payload.website==='string'&&payload.website&&<a href={payload.website} target="_blank" className="text-slate-400">Web empresa ↗</a>}</div>}
        </div>
        <div className="flex shrink-0 gap-2"><form action="/api/growth-admin/decide" method="post"><input type="hidden" name="approval_id" value={approval.approval_id}/><input type="hidden" name="decision" value="approved"/><button disabled={Boolean(readiness&&!readiness.ready)} className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">Aprobar</button></form><form action="/api/growth-admin/decide" method="post"><input type="hidden" name="approval_id" value={approval.approval_id}/><input type="hidden" name="decision" value="rejected"/><button className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm text-slate-300">Rechazar</button></form></div></div>
        {isPublish&&item&&item.status!=='published'&&<form action="/api/growth-admin/schedule" method="post" className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4 sm:flex-row sm:items-end"><input type="hidden" name="content_id" value={item.content_id}/><label className="flex-1 text-xs text-slate-500">Programar · Europe/Madrid<input name="scheduled_at" type="datetime-local" defaultValue={scheduleInputValue(item.scheduled_at)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"/></label><button className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300">Guardar fecha</button></form>}
        </div>
      </div></article>
    })}</div>

    <section className="mt-12 pb-12"><SectionHeading eyebrow="Trazabilidad" title="Historial de decisiones" description="Aprobado, rechazado y ejecutado dejan de desaparecer: aquí queda el rastro operativo." count={decided.length}/><div className="overflow-x-auto rounded-2xl border border-slate-800"><table className="min-w-full text-left text-sm"><thead className="bg-slate-950 text-xs uppercase tracking-wide text-slate-600"><tr><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Acción</th><th className="px-4 py-3">Resumen</th><th className="px-4 py-3">Decisión</th><th className="px-4 py-3">Ejecución</th></tr></thead><tbody>{decided.map((row)=><tr key={row.approval_id} className="border-t border-slate-800 bg-slate-900/40"><td className="px-4 py-3"><Badge tone={statusTone(row.status)}>{row.status}</Badge></td><td className="px-4 py-3 text-slate-400">{row.action_type}</td><td className="max-w-xl px-4 py-3 text-slate-200">{row.summary}</td><td className="px-4 py-3 text-xs text-slate-500">{row.decided_at||'—'}</td><td className="px-4 py-3 text-xs text-slate-500">{row.executed_at||'—'}</td></tr>)}</tbody></table></div></section>
  </AdminShell>
}
