import { redirect } from 'next/navigation'
import {
  getPendingApprovals,
  getReadyManualActions,
  getRecentContent,
  getRecentPlans,
  getTopCompanies,
  isGrowthAdminAuthenticated,
} from '@/lib/growth-admin'

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">{children}</span>
}

function ActionLinks({ payload }: { payload: any }) {
  return (
    <div className="mt-4 flex flex-wrap gap-3 text-sm">
      {payload.person?.linkedin_url && <a className="underline text-slate-300" href={payload.person.linkedin_url} target="_blank" rel="noreferrer">Open LinkedIn profile</a>}
      {!payload.person?.linkedin_url && payload.linkedin_search_url && <a className="underline text-slate-300" href={payload.linkedin_search_url} target="_blank" rel="noreferrer">Search person on LinkedIn</a>}
      {payload.website && <a className="underline text-slate-300" href={payload.website} target="_blank" rel="noreferrer">Company website</a>}
    </div>
  )
}

export default async function GrowthAdminPage() {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')

  const [approvals, readyActions, content, companies, plans] = await Promise.all([
    getPendingApprovals(),
    getReadyManualActions(),
    getRecentContent(),
    getTopCompanies(),
    getRecentPlans(),
  ])
  const currentPlan = plans[0]

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.25em] text-slate-500">SC-ANALYTICS</p>
            <h1 className="mt-2 text-3xl font-semibold">Growth Agent Console</h1>
            <p className="mt-2 text-sm text-slate-400">Approve public actions, then execute only the LinkedIn actions that require you.</p>
          </div>
          <form action="/api/growth-admin/logout" method="post">
            <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500">Log out</button>
          </form>
        </header>

        {currentPlan && (
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
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
              <div>
                <p className="text-xs uppercase tracking-wider text-emerald-400/70">Approved by you</p>
                <h2 className="mt-1 text-2xl font-semibold">Ready for manual LinkedIn action</h2>
              </div>
              <Badge>{readyActions.length} ready</Badge>
            </div>
            <div className="space-y-4">
              {readyActions.map((approval: any) => {
                const payload = approval.payload || {}
                return (
                  <article key={approval.approval_id} className="rounded-xl border border-emerald-900/60 bg-slate-900 p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
                      <div className="max-w-3xl">
                        <div className="flex flex-wrap gap-2 mb-3"><Badge>{approval.action_type}</Badge><Badge>approved</Badge></div>
                        <h3 className="text-lg font-medium">{approval.summary}</h3>
                        {payload.person?.name && <p className="mt-2 text-sm text-slate-400">{payload.person.name} · {payload.person.role}</p>}
                        {payload.message && <div className="mt-4 whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-300">{payload.message}</div>}
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
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Human-in-the-loop</p>
              <h2 className="mt-1 text-2xl font-semibold">Pending approvals</h2>
            </div>
            <Badge>{approvals.length} pending</Badge>
          </div>
          <div className="space-y-4">
            {approvals.length === 0 && <div className="rounded-xl border border-slate-800 p-6 text-slate-400">Nothing requires your approval.</div>}
            {approvals.map((approval: any) => {
              const payload = approval.payload || {}
              return (
                <article key={approval.approval_id} className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap gap-2 mb-3"><Badge>{approval.action_type}</Badge><Badge>{approval.approval_id}</Badge></div>
                      <h3 className="text-lg font-medium">{approval.summary}</h3>
                      {payload.person?.name && <p className="mt-2 text-sm text-slate-400">{payload.person.name} · {payload.person.role}</p>}
                      {payload.message && <div className="mt-4 whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-300">{payload.message}</div>}
                      {payload.execution_mode === 'manual_linkedin_action' && <p className="mt-3 text-xs text-amber-300/80">The agent prepares and ranks this action; LinkedIn connection/follow/message execution stays manual.</p>}
                      {approval.action_type === 'publish_post' && <p className="mt-3 text-xs text-sky-300/80">After approval, the publishing workflow can post it through the official LinkedIn API when configured.</p>}
                      <ActionLinks payload={payload} />
                    </div>
                    <div className="flex gap-2 sm:flex-col">
                      <form action="/api/growth-admin/decide" method="post">
                        <input type="hidden" name="approval_id" value={approval.approval_id} />
                        <input type="hidden" name="decision" value="approved" />
                        <button className="w-full rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-950 hover:bg-white">Approve</button>
                      </form>
                      <form action="/api/growth-admin/decide" method="post">
                        <input type="hidden" name="approval_id" value={approval.approval_id} />
                        <input type="hidden" name="decision" value="rejected" />
                        <button className="w-full rounded-lg border border-slate-700 px-5 py-2.5 text-sm text-slate-300 hover:border-slate-500">Reject</button>
                      </form>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-semibold">Recent content</h2>
            <div className="space-y-3">
              {content.slice(0, 8).map((item: any) => (
                <div key={item.content_id} className="rounded-lg border border-slate-800 p-4">
                  <div className="flex items-center justify-between gap-3"><p className="font-medium">{item.title}</p><Badge>{item.status}</Badge></div>
                  <p className="mt-2 text-xs text-slate-500">{item.channel} · {item.visual_type}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">Top company candidates</h2>
            <div className="space-y-3">
              {companies.slice(0, 10).map((company: any) => (
                <div key={company.company_id} className="rounded-lg border border-slate-800 p-4">
                  <div className="flex items-center justify-between gap-3"><a className="font-medium hover:underline" href={company.website} target="_blank" rel="noreferrer">{company.name}</a><Badge>{Number(company.score).toFixed(1)}/10</Badge></div>
                  <p className="mt-2 text-sm text-slate-400">{company.score_reason}</p>
                  <p className="mt-2 text-xs text-slate-500">{company.fit_type} · {company.country || 'country unknown'} · {company.industry || 'industry unknown'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
