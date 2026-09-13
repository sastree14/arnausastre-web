import Image from 'next/image'
import { redirect } from 'next/navigation'
import {
  GrowthApprovalPayload,
  GrowthContentItem,
  getInteractions,
  getMetrics,
  getPendingApprovals,
  getPeople,
  getReadyManualActions,
  getRecentContent,
  getRecentEditorialBriefs,
  getRecentPlans,
  getTasks,
  getTopCompanies,
  isGrowthAdminAuthenticated,
} from '@/lib/growth-admin'
import { getLinkedInConnection, linkedInConnectionStatus } from '@/lib/growth-integrations'

function Badge({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'slate' | 'green' | 'amber' | 'blue' | 'violet' }) {
  const tones = {
    slate: 'border-slate-700 bg-slate-900 text-slate-300',
    green: 'border-emerald-800 bg-emerald-950/60 text-emerald-300',
    amber: 'border-amber-800 bg-amber-950/50 text-amber-300',
    blue: 'border-sky-800 bg-sky-950/50 text-sky-300',
    violet: 'border-violet-800 bg-violet-950/50 text-violet-300',
  }
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>{children}</span>
}

function StatCard({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold text-white">{value}</p>{note && <p className="mt-2 text-xs text-slate-500">{note}</p>}</div>
}

function SectionHeading({ eyebrow, title, count }: { eyebrow: string; title: string; count?: number | string }) {
  return <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p><h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2></div>{count !== undefined && <Badge>{count}</Badge>}</div>
}

function assetUrl(item: GrowthContentItem) {
  return item.visual_path?.startsWith('supabase://') ? `/api/growth-admin/asset?ref=${encodeURIComponent(item.visual_path)}` : null
}

function formatDate(value?: string | null, withTime = false) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('es-ES', withTime ? { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: 'short', year: 'numeric' })
}

function scheduleInputValue(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function ActionLinks({ payload }: { payload: GrowthApprovalPayload }) {
  const sources = Array.isArray(payload.source_urls) ? payload.source_urls : []
  return <div className="mt-4 flex flex-wrap gap-3 text-xs">
    {payload.person?.linkedin_url && <a className="font-medium text-sky-300 hover:text-sky-200" href={payload.person.linkedin_url} target="_blank" rel="noreferrer">Open LinkedIn profile ↗</a>}
    {!payload.person?.linkedin_url && typeof payload.linkedin_search_url === 'string' && payload.linkedin_search_url && <a className="text-sky-300 hover:text-sky-200" href={payload.linkedin_search_url} target="_blank" rel="noreferrer">Search on LinkedIn ↗</a>}
    {typeof payload.website === 'string' && payload.website && <a className="text-slate-400 hover:text-slate-200" href={payload.website} target="_blank" rel="noreferrer">Company website ↗</a>}
    {sources.slice(0, 4).map((url, index) => <a key={url} className="text-slate-400 hover:text-slate-200" href={url} target="_blank" rel="noreferrer">Source {index + 1} ↗</a>)}
  </div>
}

function ContentPreview({ item }: { item?: GrowthContentItem }) {
  if (!item) return null
  const image = assetUrl(item)
  return <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_300px]">
    <div className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-5 text-sm leading-7 text-slate-300">{item.body}</div>
    <div>
      {image ? <img src={image} alt={item.title} className="aspect-square w-full rounded-xl border border-slate-800 object-cover" /> : <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-slate-700 p-6 text-center text-xs text-slate-500">Text-first content. No visual attached.</div>}
      <div className="mt-3 flex flex-wrap gap-2"><Badge>{item.visual_type || 'none'}</Badge><Badge>{item.language || '—'}</Badge>{item.quality_score && <Badge tone="violet">quality {Number(item.quality_score).toFixed(1)}</Badge>}</div>
    </div>
  </div>
}

function buildCalendarDays(content: GrowthContentItem[], days = 14) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return Array.from({ length: days }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    const key = day.toISOString().slice(0, 10)
    const items = content.filter((item) => item.scheduled_at?.slice(0, 10) === key || item.published_at?.slice(0, 10) === key)
    return { day, key, items }
  })
}

export default async function GrowthAdminPage() {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')

  const [approvals, readyActions, content, editorialBriefs, companies, people, tasks, interactions, metrics, plans, linkedinConnection] = await Promise.all([
    getPendingApprovals(), getReadyManualActions(), getRecentContent(), getRecentEditorialBriefs(), getTopCompanies(), getPeople(), getTasks(), getInteractions(), getMetrics(), getRecentPlans(), getLinkedInConnection(),
  ])

  const currentPlan = plans[0]
  const linkedin = linkedInConnectionStatus(linkedinConnection)
  const linkedinMeta = linkedinConnection?.metadata || {}
  const companyById = new Map(companies.map((company) => [company.company_id, company]))
  const contentById = new Map(content.map((item) => [item.content_id, item]))
  const scheduled = content.filter((item) => item.scheduled_at && ['approved', 'scheduled', 'published'].includes(item.status))
  const visuals = content.filter((item) => item.visual_path).slice(0, 16)
  const openTasks = tasks.filter((task) => !['done', 'completed', 'executed'].includes(task.status))
  const targetPeople = people.filter((person) => !['done', 'rejected', 'ignored'].includes(person.status || '')).slice(0, 20)
  const calendar = buildCalendarDays(content)

  return (
    <main className="min-h-screen bg-[#050816] text-slate-100">
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[250px_1fr]">
        <aside className="hidden min-h-screen border-r border-slate-800/80 bg-slate-950/80 p-6 lg:block">
          <div className="sticky top-6">
            <div className="flex items-center gap-3">
              <Image src="/brand/Monograma-simple.png" alt="SC-Analytics" width={44} height={44} className="h-10 w-10 rounded-lg" />
              <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">SC-Analytics</p><p className="font-semibold text-white">Control Center</p></div>
            </div>
            <div className="mt-6 rounded-xl border border-violet-800/60 bg-violet-950/30 p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Private</p><p className="mt-2 text-xs leading-5 text-slate-400">Internal operating surface. Nothing here is public until an explicit publishing action occurs.</p></div>
            <nav className="mt-7 space-y-1 text-sm">
              {[['#overview','Overview'],['#calendar','Publishing calendar'],['#approvals','Approvals'],['#content','Content & visuals'],['#outreach','Outreach'],['#intelligence','Editorial intelligence'],['#data','Data & integrations']].map(([href,label]) => <a key={href} href={href} className="block rounded-lg px-3 py-2.5 text-slate-400 hover:bg-slate-900 hover:text-white">{label}</a>)}
            </nav>
            <div className="mt-8 border-t border-slate-800 pt-5"><p className="text-xs uppercase tracking-[0.16em] text-slate-600">Future modules</p><div className="mt-3 space-y-2 text-xs text-slate-600"><p>Finance</p><p>Operations</p><p>Knowledge</p><p>Agents</p></div></div>
          </div>
        </aside>

        <div className="min-w-0 px-5 py-6 md:px-8 lg:px-10 lg:py-8">
          <header className="mb-8 flex flex-col gap-5 border-b border-slate-800 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2"><Badge tone="violet">PRIVATE CONTROL CENTER</Badge><Badge tone={linkedin.connected ? 'green' : 'amber'}>LinkedIn {linkedin.connected ? 'connected' : 'attention'}</Badge></div>
              <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">SC-Analytics Control Center</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">One place to review what the agents found, decide what deserves approval, schedule publication, inspect visuals and execute the manual actions that still require you.</p>
            </div>
            <div className="flex flex-wrap gap-2"><a href="/" target="_blank" className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:border-slate-500">View public site ↗</a><form action="/api/growth-admin/logout" method="post"><button className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:border-slate-500">Log out</button></form></div>
          </header>

          <section id="overview" className="scroll-mt-6">
            <SectionHeading eyebrow="Today" title="What needs your attention" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard label="Pending approvals" value={approvals.length} note="Human decision required" />
              <StatCard label="Manual actions" value={readyActions.length} note="LinkedIn / outreach" />
              <StatCard label="Open tasks" value={openTasks.length} note="Current operating queue" />
              <StatCard label="Scheduled content" value={scheduled.length} note="Next publication slots" />
              <StatCard label="Target people" value={targetPeople.length} note="Current shortlist" />
            </div>
            {currentPlan && <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Current weekly goal</p><p className="mt-2 text-lg font-medium text-white">{currentPlan.primary_goal}</p><div className="mt-4 flex flex-wrap gap-2"><Badge>{currentPlan.week_start}</Badge>{currentPlan.commercial_focus?.channel && <Badge>{currentPlan.commercial_focus.channel}</Badge>}{currentPlan.content_focus?.objective && <Badge>{currentPlan.content_focus.objective}</Badge>}</div></div>}
          </section>

          <section id="calendar" className="mt-12 scroll-mt-6">
            <SectionHeading eyebrow="Publishing" title="14-day content calendar" count={scheduled.length} />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
              {calendar.map(({ day, key, items }) => <div key={key} className="min-h-40 rounded-2xl border border-slate-800 bg-slate-900/50 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">{day.toLocaleDateString('es-ES',{weekday:'short'})}</p><p className="mt-1 text-lg font-semibold text-white">{day.toLocaleDateString('es-ES',{day:'2-digit',month:'short'})}</p><div className="mt-4 space-y-2">{items.length === 0 && <p className="text-xs text-slate-700">No slot</p>}{items.map((item) => <div key={item.content_id} className="rounded-lg border border-slate-800 bg-slate-950 p-2.5"><p className="line-clamp-2 text-xs font-medium text-slate-200">{item.title}</p><div className="mt-2 flex flex-wrap gap-1"><Badge tone={item.channel.includes('linkedin') ? 'blue' : 'violet'}>{item.channel.includes('linkedin') ? 'LinkedIn' : 'Web'}</Badge><Badge>{item.language || '—'}</Badge></div></div>)}</div></div>)}
            </div>
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs leading-5 text-slate-500">Scheduling is stored in Supabase. LinkedIn publication waits until the scheduled time; approved website articles can also be held until their scheduled time.</div>
          </section>

          <section id="approvals" className="mt-12 scroll-mt-6">
            <SectionHeading eyebrow="Human-in-the-loop" title="Pending approvals" count={approvals.length} />
            <div className="space-y-5">
              {approvals.length === 0 && <div className="rounded-2xl border border-slate-800 p-6 text-slate-500">Nothing requires your approval.</div>}
              {approvals.map((approval) => {
                const payload = approval.payload || {}
                const item = contentById.get(approval.target_id)
                const isPublish = approval.action_type === 'publish_post' || approval.action_type === 'publish_article'
                return <article key={approval.approval_id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><Badge tone={approval.action_type === 'publish_article' ? 'violet' : approval.action_type === 'publish_post' ? 'blue' : 'slate'}>{approval.action_type}</Badge>{payload.family && <Badge>{payload.family}</Badge>}{payload.language && <Badge>{payload.language}</Badge>}{typeof payload.quality_score === 'number' && <Badge tone="green">quality {payload.quality_score.toFixed(1)}</Badge>}</div><h3 className="mt-4 text-lg font-semibold text-white">{approval.summary}</h3>{typeof payload.message === 'string' && payload.message && <div className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-300">{payload.message}</div>}<ActionLinks payload={payload} /></div>
                    <div className="flex shrink-0 gap-2 xl:flex-col"><form action="/api/growth-admin/decide" method="post"><input type="hidden" name="approval_id" value={approval.approval_id}/><input type="hidden" name="decision" value="approved"/><button className="w-full rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-100">Approve</button></form><form action="/api/growth-admin/decide" method="post"><input type="hidden" name="approval_id" value={approval.approval_id}/><input type="hidden" name="decision" value="rejected"/><button className="w-full rounded-lg border border-slate-700 px-5 py-2.5 text-sm text-slate-300 hover:border-slate-500">Reject</button></form></div>
                  </div>
                  {isPublish && item && <><div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4 sm:flex-row sm:items-end"><form action="/api/growth-admin/schedule" method="post" className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end"><input type="hidden" name="content_id" value={item.content_id}/><label className="flex-1 text-xs text-slate-500">Schedule (optional)<input name="scheduled_at" type="datetime-local" defaultValue={scheduleInputValue(item.scheduled_at)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"/></label><button className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500">Save schedule</button></form><div className="text-xs text-slate-600">Current: {item.scheduled_at ? formatDate(item.scheduled_at,true) : 'publish after approval'}</div></div><ContentPreview item={item}/></>}
                </article>
              })}
            </div>
          </section>

          {readyActions.length > 0 && <section className="mt-12"><SectionHeading eyebrow="Checklist" title="Manual actions ready" count={readyActions.length}/><div className="grid gap-4 lg:grid-cols-2">{readyActions.map((approval) => { const payload = approval.payload || {}; return <article key={approval.approval_id} className="rounded-2xl border border-emerald-900/50 bg-emerald-950/10 p-5"><div className="flex items-start justify-between gap-4"><div><Badge tone="green">ready</Badge><h3 className="mt-3 font-semibold text-white">{approval.summary}</h3>{payload.person?.name && <p className="mt-2 text-sm text-slate-400">{payload.person.name} · {payload.person.role}</p>}<ActionLinks payload={payload}/></div><form action="/api/growth-admin/mark-executed" method="post"><input type="hidden" name="approval_id" value={approval.approval_id}/><button className="rounded-lg border border-emerald-800 px-3 py-2 text-xs text-emerald-300">Mark done</button></form></div></article> })}</div></section>}

          <section id="content" className="mt-12 scroll-mt-6">
            <SectionHeading eyebrow="Content library" title="Texts and visuals in Supabase" count={content.length} />
            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-3">{content.slice(0,24).map((item) => <article key={item.content_id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="font-medium text-white">{item.title}</p><div className="mt-2 flex flex-wrap gap-2"><Badge tone={item.status === 'published' ? 'green' : item.status === 'approved' ? 'blue' : item.status === 'needs_review' ? 'amber' : 'slate'}>{item.status}</Badge><Badge>{item.content_type}</Badge><Badge>{item.language || '—'}</Badge>{item.quality_score && <Badge tone="violet">{Number(item.quality_score).toFixed(1)}</Badge>}</div><p className="mt-2 text-xs text-slate-600">{item.channel} · {item.visual_type || 'no visual'} · scheduled {formatDate(item.scheduled_at,true)}</p></div>{item.external_post_url && <a href={item.external_post_url} target="_blank" className="text-xs text-sky-300">Open public ↗</a>}</div></article>)}</div>
              <div><h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Visual library</h3><div className="grid grid-cols-2 gap-3">{visuals.length === 0 && <div className="col-span-2 rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-600">No visual assets yet.</div>}{visuals.map((item) => { const image = assetUrl(item); return image ? <a key={item.content_id} href={image} target="_blank" className="group"><img src={image} alt={item.title} className="aspect-square w-full rounded-xl border border-slate-800 object-cover transition group-hover:border-slate-600"/><p className="mt-2 line-clamp-1 text-xs text-slate-500">{item.visual_type} · {item.language}</p></a> : null })}</div></div>
            </div>
          </section>

          <section id="outreach" className="mt-12 scroll-mt-6">
            <SectionHeading eyebrow="Commercial" title="People and companies to review" count={targetPeople.length} />
            <div className="grid gap-5 xl:grid-cols-2">
              <div className="space-y-3">{targetPeople.map((person) => { const company = person.company_id ? companyById.get(person.company_id) : undefined; return <article key={person.person_id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-medium text-white">{person.name}</p><p className="mt-1 text-sm text-slate-500">{person.role || 'Role unknown'}{company ? ` · ${company.name}` : ''}</p><div className="mt-2 flex gap-2"><Badge>{person.status || 'new'}</Badge>{person.relevance_score && <Badge tone="violet">fit {Number(person.relevance_score).toFixed(1)}</Badge>}</div></div>{person.linkedin_url ? <a href={person.linkedin_url} target="_blank" rel="noreferrer" className="rounded-lg border border-sky-800 px-3 py-2 text-xs text-sky-300">LinkedIn ↗</a> : person.public_source_url ? <a href={person.public_source_url} target="_blank" rel="noreferrer" className="text-xs text-slate-400">Source ↗</a> : null}</div></article> })}</div>
              <div className="space-y-3">{companies.slice(0,15).map((company) => <article key={company.company_id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-medium text-white">{company.name}</p><p className="mt-1 text-sm text-slate-500">{company.industry || 'Industry unknown'} · {company.country || '—'}</p><p className="mt-2 text-xs leading-5 text-slate-600">{company.score_reason}</p></div><Badge tone="violet">{Number(company.score || 0).toFixed(1)}</Badge></div><div className="mt-3 flex gap-3 text-xs">{company.linkedin_url && <a href={company.linkedin_url} target="_blank" className="text-sky-300">LinkedIn ↗</a>}{company.website && <a href={company.website} target="_blank" className="text-slate-400">Website ↗</a>}</div></article>)}</div>
            </div>
          </section>

          <section id="intelligence" className="mt-12 scroll-mt-6">
            <SectionHeading eyebrow="Editorial intelligence" title="Recent content briefs" count={editorialBriefs.length} />
            <div className="grid gap-4 md:grid-cols-2">{editorialBriefs.slice(0,10).map((brief) => { const sources = brief.research?.source_urls || []; return <article key={brief.brief_id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><div className="flex flex-wrap gap-2"><Badge>{brief.family}</Badge><Badge tone="violet">{Number(brief.weighted_score || 0).toFixed(1)}/10</Badge><Badge>{brief.output_decision}</Badge></div><h3 className="mt-4 font-semibold text-white">{brief.canonical_title}</h3>{brief.thesis && <p className="mt-3 text-sm leading-6 text-slate-400">{brief.thesis}</p>}<div className="mt-4 flex gap-3 text-xs">{sources.slice(0,3).map((url,index) => <a key={url} href={url} target="_blank" className="text-sky-300">Source {index+1} ↗</a>)}</div></article> })}</div>
          </section>

          <section id="data" className="mt-12 scroll-mt-6 pb-14">
            <SectionHeading eyebrow="System" title="Data and integrations" />
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">LinkedIn</p><p className="mt-2 font-semibold text-white">{linkedinConnection?.display_name || 'Not connected'}</p></div><Badge tone={linkedin.connected ? 'green' : 'amber'}>{linkedin.connected ? 'connected' : 'attention'}</Badge></div>{linkedinConnection && <div className="mt-4 space-y-2 text-xs text-slate-500"><p>Scopes: {(linkedinConnection.scopes || []).join(', ')}</p><p>Expires: {formatDate(linkedinConnection.token_expires_at)}</p><p>Email: {typeof linkedinMeta.email === 'string' ? linkedinMeta.email : '—'}</p></div>}<div className="mt-5 flex gap-2"><a href="/api/linkedin/connect" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300">{linkedin.connected ? 'Reconnect' : 'Connect'}</a>{linkedinConnection && <form action="/api/linkedin/disconnect" method="post"><button className="rounded-lg border border-slate-800 px-3 py-2 text-xs text-slate-500">Disconnect</button></form>}</div></div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Supabase snapshot</p><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-2xl font-semibold text-white">{content.length}</p><p className="text-xs text-slate-500">content items loaded</p></div><div><p className="text-2xl font-semibold text-white">{editorialBriefs.length}</p><p className="text-xs text-slate-500">briefs loaded</p></div><div><p className="text-2xl font-semibold text-white">{people.length}</p><p className="text-xs text-slate-500">people loaded</p></div><div><p className="text-2xl font-semibold text-white">{companies.length}</p><p className="text-xs text-slate-500">companies loaded</p></div></div></div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Operating data</p><div className="mt-4 space-y-3 text-sm text-slate-400"><div className="flex justify-between"><span>Tasks</span><span className="text-white">{tasks.length}</span></div><div className="flex justify-between"><span>Interactions</span><span className="text-white">{interactions.length}</span></div><div className="flex justify-between"><span>Metrics</span><span className="text-white">{metrics.length}</span></div><div className="flex justify-between"><span>Plans</span><span className="text-white">{plans.length}</span></div></div></div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
