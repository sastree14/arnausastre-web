import { redirect } from 'next/navigation'
import {
  GrowthApprovalPayload,
  getPendingApprovals,
  getReadyManualActions,
  getRecentContent,
  getRecentPlans,
  getTopCompanies,
  isGrowthAdminAuthenticated,
} from '@/lib/growth-admin'
import { getLinkedInConnection, linkedInConnectionStatus } from '@/lib/growth-integrations'

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-300">{children}</span>
}

function ActionLinks({ payload }: { payload: GrowthApprovalPayload }) {
  return (
    <div className="mt-4 flex flex-wrap gap-3 text-sm">
      {payload.person?.linkedin_url && <a className="font-medium text-sky-300 hover:text-sky-200" href={payload.person.linkedin_url} target="_blank" rel="noreferrer">Open LinkedIn profile ↗</a>}
      {!payload.person?.linkedin_url && typeof payload.linkedin_search_url === 'string' && payload.linkedin_search_url && <a className="text-slate-300 underline" href={payload.linkedin_search_url} target="_blank" rel="noreferrer">Search person on LinkedIn</a>}
      {typeof payload.website === 'string' && payload.website && <a className="text-slate-400 hover:text-slate-200" href={payload.website} target="_blank" rel="noreferrer">Company website ↗</a>}
    </div>
  )
}

function PublishPreview({ payload }: { payload: GrowthApprovalPayload }) {
  const body = typeof payload.body === 'string' ? payload.body : ''
  if (!body) return null
  const visualPath = typeof payload.visual_path === 'string' ? payload.visual_path : ''
  const visualUrl = visualPath.startsWith('supabase://')
    ? `/api/growth-admin/asset?ref=${encodeURIComponent(visualPath)}`
    : null
  const title = typeof payload.title === 'string' ? payload.title : 'Generated post visual'
  const visualType = typeof payload.visual_type === 'string' ? payload.visual_type : 'visual'
  const sourceCase = typeof payload.source_case === 'string' ? payload.source_case : 'n/a'
  return (
    <div className="mt-5 grid gap-5 md:grid-cols-[1fr_320px]">
      <div className="whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-5 text-sm leading-6 text-slate-300">{body}</div>
      <div>
        {visualUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={visualUrl} alt={title} className="aspect-square w-full rounded-xl border border-slate-800 object-cover" />
        ) : (
          <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-slate-700 p-5 text-center text-xs text-slate-500">Visual preview appears here once the asset is rendered.</div>
        )}
        <p className="mt-2 text-xs text-slate-500">{visualType} · source: {sourceCase}</p>
      </div>
    </div>
  )
}

export default async function GrowthAdminPage() {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')

  const [approvals, readyActions, content, companies, plans, linkedinConnection] = await Promise.all([
    getPendingApprovals(),
    getReadyManualActions(),
    getRecentContent(),
    getTopCompanies(),
    getRecentPlans(),
    getLinkedInConnection(),
  ])
  const currentPlan = plans[0]
  const linkedin = linkedInConnectionStatus(linkedinConnection)
  const linkedinMeta = linkedinConnection?.metadata || {}
  const linkedinEmail = typeof linkedinMeta.email === 'string' ? linkedinMeta.email : ''

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.25em] text-slate-500">SC-ANALYTICS</p>
            <h1 className="mt-2 text-3xl font-semibold">Growth Agent Console</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Research, content and prioritization are automated. You approve decisions; only LinkedIn actions that cannot be executed through the official API stay manual.</p>
          </div>
          <form action="/api/growth-admin/logout" method="post">
            <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500">Log out</button>
          </form>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-sky-400/80">LinkedIn</p>
                <h2 className="mt-2 text-xl font-semibold">Arnau Sastre</h2>
                <p className="mt-1 text-sm text-slate-400">Personal publishing connection</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${linkedin.connected ? 'border-emerald-700/70 bg-emerald-950/40 text-emerald-300' : 'border-amber-700/70 bg-amber-950/30 text-amber-300'}`}>
                {linkedin.connected ? 'Connected' : linkedin.expired ? 'Reconnect required' : 'Not connected'}
              </span>
            </div>
            {linkedinConnection && (
              <div className="mt-5 grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
                <div><span className="text-slate-500">Account</span><br /><span className="text-slate-200">{linkedinConnection.display_name}</span></div>
                <div><span className="text-slate-500">Email</span><br /><span className="text-slate-200">{linkedinEmail || 'Not returned by LinkedIn'}</span></div>
                <div><span className="text-slate-500">Scopes</span><br /><span className="text-slate-200">{(linkedinConnection.scopes || []).join(', ') || '—'}</span></div>
                <div><span className="text-slate-500">Token expires</span><br /><span className="text-slate-200">{linkedinConnection.token_expires_at ? new Date(linkedinConnection.token_expires_at).toLocaleDateString('es-ES') : 'Unknown'}</span></div>
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/api/linkedin/connect" className="rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400">{linkedin.connected ? 'Reconnect LinkedIn' : 'Connect LinkedIn'}</a>
              {linkedinConnection && <form action="/api/linkedin/disconnect" method="post"><button className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:border-slate-500">Disconnect</button></form>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Automation boundary</p>
            <h2 className="mt-2 text-xl font-semibold">Minimal manual work</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Posts on Arnau&apos;s profile can publish through the official API after approval. Connect, follow, DM, company-page invitations and company reposts remain one-click/manual actions, always with the exact LinkedIn URL prepared.</p>
          </div>
        </section>

        {currentPlan && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-xs uppercase tracking-wider text-slate-500">Current weekly goal</p>
            <h2 className="mt-2 text-xl font-medium">{currentPlan.primary_goal}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{currentPlan.week_start}</Badge>
              {currentPlan.commercial_focus?.channel && <Badge>{currentPlan.commercial_focus.channel}</Badge>}
              {currentPlan.content_focus?.objective && <Badge>{currentPlan.content_focus.objective}</Badge>}
            </div>
          </section>
        )}

        {readyActions.length > 0 && (
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div><p className="text-xs uppercase tracking-wider text-emerald-400/70">Approved by you</p><h2 className="mt-1 text-2xl font-semibold">Ready for manual LinkedIn action</h2></div>
              <Badge>{readyActions.length} ready</Badge>
            </div>
            <div className="space-y-4">
              {readyActions.map((approval) => {
                const payload = approval.payload || {}
                return (
                  <article key={approval.approval_id} className="rounded-2xl border border-emerald-900/60 bg-slate-900 p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
                      <div className="max-w-3xl">
                        <div className="mb-3 flex flex-wrap gap-2"><Badge>{approval.action_type}</Badge><Badge>approved</Badge></div>
                        <h3 className="text-lg font-medium">{approval.summary}</h3>
                        {payload.person?.name && <p className="mt-2 text-sm text-slate-400">{payload.person.name} · {payload.person.role}</p>}
                        {typeof payload.message === 'string' && payload.message && <div className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-300">{payload.message}</div>}
                        <ActionLinks payload={payload} />
                      </div>
                      <form action="/api/growth-admin/mark-executed" method="post" className="self-start">
                        <input type="hidden" name="approval_id" value={approval.approval_id} />
                        <button className="rounded-lg border border-emerald-700 px-5 py-2.5 text-sm text-emerald-200 hover:border-emerald-500">Mark done</button>
                      </form>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div><p className="text-xs uppercase tracking-wider text-slate-500">Human-in-the-loop</p><h2 className="mt-1 text-2xl font-semibold">Pending approvals</h2></div>
            <Badge>{approvals.length} pending</Badge>
          </div>
          <div className="space-y-4">
            {approvals.length === 0 && <div className="rounded-2xl border border-slate-800 p-6 text-slate-400">Nothing requires your approval.</div>}
            {approvals.map((approval) => {
              const payload = approval.payload || {}
              return (
                <article key={approval.approval_id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                      <div className="max-w-3xl">
                        <div className="mb-3 flex flex-wrap gap-2"><Badge>{approval.action_type}</Badge><Badge>{approval.approval_id}</Badge></div>
                        <h3 className="text-lg font-medium">{approval.summary}</h3>
                        {payload.person?.name && <p className="mt-2 text-sm text-slate-400">{payload.person.name} · {payload.person.role}</p>}
                        {typeof payload.message === 'string' && payload.message && <div className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-300">{payload.message}</div>}
                        {payload.execution_mode === 'manual_linkedin_action' && <p className="mt-3 text-xs text-amber-300/80">Research and preparation are automated; LinkedIn executes the final connection/follow/message action manually.</p>}
                        {approval.action_type === 'publish_post' && <p className="mt-3 text-xs text-sky-300/80">After approval, the publisher can send this exact post through the official LinkedIn API.</p>}
                        <ActionLinks payload={payload} />
                      </div>
                      <div className="flex gap-2 sm:flex-col">
                        <form action="/api/growth-admin/decide" method="post"><input type="hidden" name="approval_id" value={approval.approval_id} /><input type="hidden" name="decision" value="approved" /><button className="w-full rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-950 hover:bg-white">Approve</button></form>
                        <form action="/api/growth-admin/decide" method="post"><input type="hidden" name="approval_id" value={approval.approval_id} /><input type="hidden" name="decision" value="rejected" /><button className="w-full rounded-lg border border-slate-700 px-5 py-2.5 text-sm text-slate-300 hover:border-slate-500">Reject</button></form>
                      </div>
                    </div>
                    {approval.action_type === 'publish_post' && <PublishPreview payload={payload} />}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div><h2 className="mb-4 text-xl font-semibold">Recent content</h2><div className="space-y-3">{content.slice(0, 8).map((item) => <div key={item.content_id} className="rounded-xl border border-slate-800 p-4"><div className="flex items-center justify-between gap-3"><p className="font-medium">{item.title}</p><Badge>{item.status}</Badge></div><p className="mt-2 text-xs text-slate-500">{item.channel} · {item.visual_type}</p></div>)}</div></div>
          <div><h2 className="mb-4 text-xl font-semibold">Top company candidates</h2><div className="space-y-3">{companies.slice(0, 10).map((company) => <div key={company.company_id} className="rounded-xl border border-slate-800 p-4"><div className="flex items-center justify-between gap-3"><a className="font-medium hover:underline" href={company.website} target="_blank" rel="noreferrer">{company.name}</a><Badge>{Number(company.score).toFixed(1)}/10</Badge></div><p className="mt-2 text-sm text-slate-400">{company.score_reason}</p><p className="mt-2 text-xs text-slate-500">{company.fit_type} · {company.country || 'country unknown'} · {company.industry || 'industry unknown'}</p></div>)}</div></div>
        </section>
      </div>
    </main>
  )
}
