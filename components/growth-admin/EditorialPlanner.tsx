import type { GrowthContentItem, GrowthTask } from '@/lib/growth-admin'

type ScoreSet = {
  repetition_risk?: number
  commercial_potential?: number
  cta_fit?: number
  evidenceability?: number
  opportunity?: number
}

type Proposal = {
  proposal_id?: string
  title?: string
  hook?: string
  industry?: string
  service?: string
  business_problem?: string
  thesis?: string
  recommended_format?: string
  primary_language?: string
  cta?: string
  rationale?: string
  generation_hint?: string
  scores?: ScoreSet
}

type PlannerOutput = {
  focus?: string
  avoid?: string
  proposals?: Proposal[]
}

type MixRow = { name: string; count: number }
type Portfolio = { pieces: number; industries: MixRow[]; services: MixRow[] }

const INDUSTRIES: Array<[string, string[]]> = [
  ['E-commerce / Retail', ['ecommerce', 'e-commerce', 'retail', 'marketplace', 'amazon', 'shopify', 'sku']],
  ['Supply Chain / Logistics', ['supply chain', 'logistics', 'warehouse', 'transport', 'routing', 'delivery', 'procurement', 'inventory']],
  ['Banking / Financial Services', ['bank', 'banking', 'credit', 'fraud', 'risk', 'loan', 'lending']],
  ['Manufacturing / Industrial', ['manufacturing', 'factory', 'production', 'industrial', 'plant', 'oee']],
  ['SaaS / Technology', ['saas', 'software', 'platform', 'subscription', 'product analytics']],
  ['Healthcare / Pharma', ['healthcare', 'hospital', 'clinic', 'pharma', 'patient', 'medical']],
  ['Telecom', ['telecom', 'telco', 'network operator', 'churn']],
  ['Energy / Utilities', ['energy', 'utility', 'utilities', 'electricity', 'power', 'renewable']],
]

const SERVICES: Array<[string, string[]]> = [
  ['Forecasting & Planning', ['forecast', 'forecasting', 'demand planning', 'time series']],
  ['Optimization / OR', ['optimization', 'optimisation', 'routing', 'scheduling', 'linear programming', 'operations research', 'vrp', 'allocation']],
  ['Machine Learning', ['machine learning', 'predictive', 'classification', 'risk model', 'propensity', 'churn', 'fraud detection']],
  ['AI Automation & Agents', ['agent', 'agents', 'automation', 'llm', 'generative ai', 'workflow automation', 'copilot']],
  ['Data Engineering', ['data engineering', 'pipeline', 'etl', 'elt', 'warehouse', 'lakehouse', 'data quality', 'integration']],
  ['BI & Decision Intelligence', ['business intelligence', 'dashboard', 'reporting', 'kpi', 'decision intelligence', 'analytics']],
  ['Pricing & Revenue', ['pricing', 'price optimization', 'revenue management', 'margin', 'promotion']],
  ['Finance Analytics / FP&A', ['fp&a', 'cash flow', 'p&l', 'finance analytics', 'financial model', 'budget', 'treasury']],
]

function classify(text: string, rules: Array<[string, string[]]>, fallback: string) {
  const haystack = text.toLowerCase()
  let best = fallback
  let bestScore = 0
  for (const [label, terms] of rules) {
    const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0)
    if (score > bestScore) { best = label; bestScore = score }
  }
  return best
}

function contentIndustry(item: GrowthContentItem) {
  if (item.industry?.trim()) return item.industry.trim()
  return classify(`${item.title} ${item.body || ''} ${item.challenge || ''} ${item.audience || ''}`, INDUSTRIES, 'Cross-industry')
}

function contentService(item: GrowthContentItem) {
  return classify(`${item.title} ${item.body || ''} ${item.challenge || ''} ${item.topic || ''}`, SERVICES, 'Data & AI Strategy')
}

function portfolio(content: GrowthContentItem[], days: number): Portfolio {
  const cutoff = Date.now() - days * 86400000
  const recent = content.filter((item) => {
    const timestamp = item.created_at ? Date.parse(item.created_at) : NaN
    return Number.isFinite(timestamp) && timestamp >= cutoff
  })
  const count = (values: string[]) => {
    const map = new Map<string, number>()
    values.forEach((value) => map.set(value, (map.get(value) || 0) + 1))
    return [...map.entries()].map(([name, n]) => ({ name, count: n })).sort((a, b) => b.count - a.count).slice(0, 6)
  }
  return { pieces: recent.length, industries: count(recent.map(contentIndustry)), services: count(recent.map(contentService)) }
}

function Mix({ title, rows }: { title: string; rows: MixRow[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count))
  return <div>
    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</p>
    <div className="mt-2 space-y-2">
      {rows.length === 0 && <p className="text-xs text-slate-400">Todavía no hay histórico suficiente.</p>}
      {rows.map((row) => <div key={row.name}>
        <div className="flex items-center justify-between gap-3 text-[11px]"><span className="truncate text-slate-600">{row.name}</span><span className="font-semibold text-slate-900">{row.count}</span></div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-400" style={{ width: `${Math.max(8, (row.count / max) * 100)}%` }} /></div>
      </div>)}
    </div>
  </div>
}

function score(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(1) : '—'
}

function ScoreCard({ label, value, inverse = false }: { label: string; value: unknown; inverse?: boolean }) {
  const number = Number(value)
  const good = Number.isFinite(number) && (inverse ? number <= 3.5 : number >= 7.5)
  return <div className={`rounded-lg border px-2.5 py-2 ${good ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
    <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-900">{score(value)}/10</p>
  </div>
}

export default function EditorialPlanner({ content, latestProposalTask, currentTask }: { content: GrowthContentItem[]; latestProposalTask?: GrowthTask; currentTask?: GrowthTask }) {
  const last30 = portfolio(content, 30)
  const last60 = portfolio(content, 60)
  const output = (latestProposalTask?.outputs || {}) as PlannerOutput
  const proposals = Array.isArray(output.proposals) ? output.proposals : []
  const focus = String(output.focus || latestProposalTask?.inputs?.focus || '')
  const avoid = String(output.avoid || latestProposalTask?.inputs?.avoid || '')
  const proposalRunning = currentTask?.type === 'OPERATOR_EDITORIAL_PROPOSALS' && ['queued', 'pending', 'running'].includes(currentTask.status)
  const generationRunning = currentTask?.type === 'OPERATOR_EDITORIAL_RUN' && ['queued', 'pending', 'running'].includes(currentTask.status)

  return <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
    <div className="grid gap-0 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-500">Content Operating System</p><h2 className="mt-2 text-2xl font-semibold text-slate-950">Decide qué merece escribirse antes de escribirlo</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Pide tres direcciones editoriales, fuerza un tema o excluye uno. El sistema compara el histórico y puntúa repetición, potencial comercial, CTA y facilidad de sostenerlo con evidencia.</p></div>
          <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[10px] font-semibold text-indigo-700">3 propuestas → 1 selección → research → copy</span>
        </div>

        <form action="/api/growth-admin/operator-task" method="post" className="mt-6 grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <input type="hidden" name="action" value="editorial_proposals" />
          <input type="hidden" name="count" value="3" />
          <input type="hidden" name="history_days" value="60" />
          <input type="hidden" name="return_to" value="/growth-admin/content" />
          <label className="text-[11px] font-medium text-slate-500">Quiero contenido sobre…<input name="focus" defaultValue={focus} placeholder="Ej. supply chain, banca, pricing, automatización…" className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-300" /></label>
          <label className="text-[11px] font-medium text-slate-500">Pero evita…<input name="avoid" defaultValue={avoid} placeholder="Ej. forecasting, e-commerce, agentes IA…" className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-300" /></label>
          <button disabled={proposalRunning} className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-50">{proposalRunning ? 'Pensando…' : 'Generar 3 propuestas'}</button>
        </form>

        {generationRunning && <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-800">La propuesta seleccionada ya está pasando por research, evidencia y generación de copy.</div>}

        <div className="mt-6 grid gap-4 2xl:grid-cols-3">
          {proposals.length === 0 && <div className="2xl:col-span-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-500">Todavía no hay propuestas preparadas. Puedes dejar los dos campos vacíos para que el sistema busque oportunidades infrautilizadas, o pedir algo tan concreto como “supply chain” y excluir “forecasting”.</div>}
          {proposals.map((proposal, index) => {
            const scores = proposal.scores || {}
            return <article key={proposal.proposal_id || `${proposal.title}-${index}`} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="flex items-start justify-between gap-3"><span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-indigo-700">Opción {index + 1}</span><span className="text-sm font-semibold text-slate-950">{score(scores.opportunity)}/10</span></div>
              <div className="mt-3 flex flex-wrap gap-1.5"><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-600">{proposal.industry || 'Cross-industry'}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-600">{proposal.service || 'Data & AI'}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-600">{proposal.recommended_format || 'linkedin_post'}</span></div>
              <h3 className="mt-3 text-base font-semibold leading-6 text-slate-950">{proposal.title}</h3>
              {proposal.hook && <p className="mt-2 text-xs font-medium leading-5 text-indigo-700">{proposal.hook}</p>}
              {proposal.business_problem && <p className="mt-3 text-xs leading-5 text-slate-600"><strong className="text-slate-800">Problema:</strong> {proposal.business_problem}</p>}
              {proposal.thesis && <p className="mt-2 text-xs leading-5 text-slate-600"><strong className="text-slate-800">Tesis:</strong> {proposal.thesis}</p>}
              <div className="mt-4 grid grid-cols-2 gap-2"><ScoreCard label="Repetición" value={scores.repetition_risk} inverse /><ScoreCard label="Comercial" value={scores.commercial_potential} /><ScoreCard label="CTA" value={scores.cta_fit} /><ScoreCard label="Evidencia" value={scores.evidenceability} /></div>
              {proposal.cta && <p className="mt-3 rounded-lg bg-slate-50 p-2.5 text-[11px] leading-5 text-slate-600"><strong>Salida comercial:</strong> {proposal.cta}</p>}
              <form action="/api/growth-admin/operator-task" method="post" className="mt-auto pt-4">
                <input type="hidden" name="action" value="editorial_run" />
                <input type="hidden" name="theme_hint" value={proposal.generation_hint || `${proposal.industry}. ${proposal.service}. ${proposal.title}. ${proposal.thesis || ''}`} />
                <input type="hidden" name="avoid" value={avoid} />
                <input type="hidden" name="strict_theme" value="1" />
                <input type="hidden" name="force_new" value="1" />
                <input type="hidden" name="max_briefs" value="1" />
                <input type="hidden" name="max_signals" value="36" />
                <input type="hidden" name="return_to" value="/growth-admin/content?filter=review" />
                <button className="w-full rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100">Desarrollar esta propuesta →</button>
              </form>
            </article>
          })}
        </div>
      </div>

      <aside className="border-t border-slate-200 bg-slate-50/70 p-5 md:p-7 xl:border-l xl:border-t-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Cobertura editorial</p><h3 className="mt-2 text-lg font-semibold text-slate-950">¿Qué estamos repitiendo?</h3><p className="mt-2 text-xs leading-5 text-slate-500">Se calcula con el contenido generado en el sistema. Sirve para detectar sesgo hacia una industria o servicio antes de crear más piezas.</p>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">Últimos 30 días</p><span className="text-xs text-slate-400">{last30.pieces} piezas</span></div><div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"><Mix title="Industrias" rows={last30.industries} /><Mix title="Servicios" rows={last30.services} /></div></div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">Últimos 60 días</p><span className="text-xs text-slate-400">{last60.pieces} piezas</span></div><div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"><Mix title="Industrias" rows={last60.industries} /><Mix title="Servicios" rows={last60.services} /></div></div>
      </aside>
    </div>
  </section>
}
