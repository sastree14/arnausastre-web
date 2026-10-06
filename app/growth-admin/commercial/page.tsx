import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, EmptyState, PageHeader, SectionHeading, adminPanel, formatDate } from '@/components/growth-admin/AdminUi'
import { getFollowups, getMeetings, getOperationalActivities, getOpportunities, isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function stageTone(stage?: string): 'slate'|'blue'|'amber'|'green'|'violet'|'rose' {
  if (stage === 'won') return 'green'
  if (stage === 'lost') return 'rose'
  if (stage === 'proposal' || stage === 'negotiation') return 'violet'
  if (stage === 'replied' || stage === 'meeting' || stage === 'discovery' || stage === 'discovery_booked') return 'blue'
  if (stage === 'applied' || stage === 'contacted') return 'amber'
  return 'slate'
}

export default async function CommercialPage() {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')

  const [opportunities, meetings, activities, followups] = await Promise.all([
    getOpportunities(),
    getMeetings(),
    getOperationalActivities(),
    getFollowups(),
  ])
  const activeOpportunities = opportunities
    .filter((item) => !['lost', 'won', 'archived'].includes(String(item.stage || '').toLowerCase()))
    .sort((a,b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))

  // Server-rendered opportunity view intentionally evaluates the current instant on each dynamic request.
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now()
  const upcomingMeetings = meetings
    .filter((item) => item.starts_at && new Date(item.starts_at).getTime() >= nowMs && item.status !== 'cancelled')
    .sort((a,b) => String(a.starts_at).localeCompare(String(b.starts_at)))

  const latestActivityByOpportunity = new Map<string, (typeof activities)[number]>()
  activities.forEach((activity) => {
    if (activity.entity_type !== 'opportunity' || !activity.entity_id) return
    if (!latestActivityByOpportunity.has(activity.entity_id)) latestActivityByOpportunity.set(activity.entity_id, activity)
  })

  const nextFollowupByOpportunity = new Map<string, (typeof followups)[number]>()
  followups
    .filter((followup) => followup.status === 'open' && followup.entity_type === 'opportunity' && followup.entity_id)
    .sort((a,b) => String(a.due_at || '9999').localeCompare(String(b.due_at || '9999')))
    .forEach((followup) => {
      if (followup.entity_id && !nextFollowupByOpportunity.has(followup.entity_id)) nextFollowupByOpportunity.set(followup.entity_id, followup)
    })

  return <AdminShell active="commercial">
    <PageHeader
      eyebrow="CMI · Oportunidades"
      title="Oportunidades"
      description="Aquí solo guardamos lo que merece seguimiento: proyectos de Upwork, oportunidades encontradas fuera, conversaciones reales y reuniones. La búsqueda ocurre en ChatGPT; el CMI conserva el resultado."
      actions={<a href="/growth-admin/calendar#nuevo-evento" className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">Añadir reunión</a>}
    />

    <div className="grid gap-4 md:grid-cols-2">
      <div className={adminPanel + ' p-5'}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Oportunidades activas</p>
        <p className="mt-3 text-4xl font-semibold text-slate-950">{activeOpportunities.length}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">Solo elementos seleccionados para seguir. No guardamos cada resultado de búsqueda.</p>
      </div>
      <div className={adminPanel + ' p-5'}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Próximas reuniones</p>
        <p className="mt-3 text-4xl font-semibold text-slate-950">{upcomingMeetings.length}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">Reuniones manuales, Calendly o citas asociadas a oportunidades.</p>
      </div>
    </div>

    <section className="mt-10">
      <SectionHeading eyebrow="Seguimiento" title="Oportunidades guardadas" description="El plugin puede añadir aquí únicamente las oportunidades que decidas conservar." count={activeOpportunities.length}/>
      {activeOpportunities.length===0 ? <EmptyState>No hay oportunidades activas. Cuando encuentres una interesante desde ChatGPT, podremos guardarla aquí.</EmptyState> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {activeOpportunities.map((item) => {
          const activity = latestActivityByOpportunity.get(item.opportunity_id)
          const followup = nextFollowupByOpportunity.get(item.opportunity_id)
          const company = String(item.metadata?.company || item.metadata?.client || '')
          const person = String(item.metadata?.person || item.metadata?.contact_name || '')
          const sourceUrl = String(item.metadata?.url || item.metadata?.source_url || item.metadata?.job_url || '')
          return <article key={item.opportunity_id} className={adminPanel + ' p-5'}>
            <div className="flex flex-wrap gap-2">
              <Badge tone={stageTone(item.stage)}>{item.stage || 'nueva'}</Badge>
              {item.source && <Badge>{item.source}</Badge>}
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-950">{item.name}</h2>
            {(company || person) && <p className="mt-1 text-xs text-slate-500">{[company,person].filter(Boolean).join(' · ')}</p>}

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div><p className="text-slate-400">Valor</p><p className="mt-1 font-semibold text-slate-800">{Number(item.value||0).toLocaleString('es-ES')} {item.currency||'EUR'}</p></div>
              <div><p className="text-slate-400">Probabilidad</p><p className="mt-1 font-semibold text-slate-800">{Number(item.probability||0)}%</p></div>
            </div>

            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-xs">
              <div>
                <p className="text-slate-400">Última actividad</p>
                <p className="mt-1 font-medium text-slate-700">{activity?.title || 'Sin actividad registrada'}</p>
                {activity?.occurred_at && <p className="mt-0.5 text-slate-400">{formatDate(activity.occurred_at,true)}</p>}
              </div>
              <div>
                <p className="text-slate-400">Próximo seguimiento</p>
                <p className="mt-1 font-medium text-slate-700">{followup?.title || (item.next_action_at ? 'Siguiente acción' : 'Sin seguimiento pendiente')}</p>
                {(followup?.due_at || item.next_action_at) && <p className="mt-0.5 text-slate-400">{formatDate(followup?.due_at || item.next_action_at,true)}</p>}
              </div>
            </div>

            {sourceUrl && <a href={sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-xs font-semibold text-indigo-700 hover:text-indigo-900">Abrir fuente ↗</a>}
          </article>
        })}
      </div>}
    </section>

    <section className="mt-12 pb-12">
      <SectionHeading eyebrow="Agenda" title="Próximas reuniones" description="La agenda comercial también aparece en Calendario junto a las publicaciones." count={upcomingMeetings.length}/>
      {upcomingMeetings.length===0 ? <EmptyState>No hay reuniones futuras guardadas.</EmptyState> : <div className={adminPanel + ' divide-y divide-slate-100'}>
        {upcomingMeetings.map((item) => <div key={item.meeting_id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><Badge tone="green">{item.provider || 'manual'}</Badge><p className="mt-2 font-semibold text-slate-950">{String(item.metadata?.event_name || item.metadata?.name || 'Reunión')}</p></div>
          <p className="text-xs font-semibold text-slate-500">{formatDate(item.starts_at,true)}</p>
        </div>)}
      </div>}
    </section>
  </AdminShell>
}
