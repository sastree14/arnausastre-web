import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, EmptyState, PageHeader, SectionHeading, adminPanel, formatDate } from '@/components/growth-admin/AdminUi'
import { getMeetings, getOpportunities, isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function stageTone(stage?: string): 'slate'|'blue'|'amber'|'green'|'violet'|'rose' {
  if (stage === 'won') return 'green'
  if (stage === 'lost') return 'rose'
  if (stage === 'proposal' || stage === 'negotiation') return 'violet'
  if (stage === 'discovery' || stage === 'discovery_booked') return 'blue'
  return 'slate'
}

export default async function CommercialPage() {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')

  const [opportunities, meetings] = await Promise.all([getOpportunities(), getMeetings()])
  const activeOpportunities = opportunities
    .filter((item) => !['lost', 'won', 'archived'].includes(String(item.stage || '').toLowerCase()))
    .sort((a,b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))

  const upcomingMeetings = meetings
    .filter((item) => item.starts_at && new Date(item.starts_at).getTime() >= Date.now() && item.status !== 'cancelled')
    .sort((a,b) => String(a.starts_at).localeCompare(String(b.starts_at)))

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
        {activeOpportunities.map((item) => <article key={item.opportunity_id} className={adminPanel + ' p-5'}>
          <div className="flex flex-wrap gap-2">
            <Badge tone={stageTone(item.stage)}>{item.stage || 'nueva'}</Badge>
            {item.source && <Badge>{item.source}</Badge>}
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-950">{item.name}</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div><p className="text-slate-400">Valor</p><p className="mt-1 font-semibold text-slate-800">{Number(item.value||0).toLocaleString('es-ES')} {item.currency||'EUR'}</p></div>
            <div><p className="text-slate-400">Probabilidad</p><p className="mt-1 font-semibold text-slate-800">{Number(item.probability||0)}%</p></div>
          </div>
          {item.next_action_at && <p className="mt-4 text-xs text-slate-500">Siguiente acción: <strong>{formatDate(item.next_action_at,true)}</strong></p>}
        </article>)}
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
