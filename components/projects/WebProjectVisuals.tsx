import type { WebsiteProjectGoldStandard } from '@/lib/website-project-gold-standard'

type HorizonLogic = WebsiteProjectGoldStandard['horizonLogic']
type Architecture = WebsiteProjectGoldStandard['architecture']
type Evidence = WebsiteProjectGoldStandard['evidence']

export function HorizonDecisionVisual({ data }: { data: HorizonLogic }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[#FAFAF7]">
      <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Horizon-level evaluation</p>
          <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-700">
            Conceptual view
          </span>
        </div>
      </div>

      <div className="relative px-6 py-8 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute left-8 right-8 top-[92px] hidden h-px bg-slate-300 md:block" />
        <div className="grid gap-4 md:grid-cols-4">
          {data.horizons.map((item, index) => (
            <div key={item.horizon} className="relative">
              <div className="mb-5 hidden items-center md:flex">
                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-[#FAFAF7] text-[10px] font-bold text-slate-700">
                  {index + 1}
                </span>
              </div>
              <div className="min-h-[186px] rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_-28px_rgba(15,23,42,.35)]">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-xl font-semibold text-indigo-700">{item.horizon}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</span>
                </div>
                <p className="mt-7 text-sm leading-6 text-slate-600">{item.note}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-5 py-4 text-sm leading-6 text-slate-700 sm:px-6">
          <span className="font-semibold text-slate-950">Decision rule:</span> {data.takeaway}
        </div>
      </div>
    </div>
  )
}

const layerStyles = [
  'border-sky-200 bg-sky-50 text-sky-950',
  'border-indigo-200 bg-indigo-50 text-indigo-950',
  'border-violet-200 bg-violet-50 text-violet-950',
  'border-slate-300 bg-white text-slate-950',
]

export function ArchitectureSystemVisual({ data }: { data: Architecture }) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-800 bg-[#0D1B2A] text-white shadow-[0_24px_80px_-45px_rgba(15,23,42,.85)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-5 sm:px-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300">SC-12 · System map</p>
          <p className="mt-1 text-sm text-slate-400">Data → modelling → evaluation → planning</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-slate-300">
          Public implementation
        </span>
      </div>

      <div className="px-5 py-8 sm:px-8 sm:py-10">
        <div className="grid gap-3 lg:grid-cols-7 lg:items-stretch">
          {data.steps.map((step, index) => (
            <div key={step.title} className="relative flex min-w-0">
              <div className="flex w-full flex-col rounded-2xl border border-[#496C8A] bg-[#13283C] px-4 py-5">
                <span className="mb-4 flex h-7 w-7 items-center justify-center rounded-full border border-sky-300/30 bg-sky-300/10 text-[10px] font-bold text-sky-200">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-sm font-semibold leading-5 text-white">{step.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-400">{step.detail}</p>
              </div>
              {index < data.steps.length - 1 && (
                <div className="pointer-events-none absolute -right-[9px] top-1/2 z-10 hidden -translate-y-1/2 text-sky-300/70 lg:block">
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          {data.integrations.map((integration, index) => (
            <div key={integration.title} className={`rounded-2xl border p-4 ${layerStyles[index % layerStyles.length]}`}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-60">Integration boundary</p>
              <h4 className="mt-2 text-sm font-semibold">{integration.title}</h4>
              <p className="mt-2 text-xs leading-5 opacity-75">{integration.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function EvidenceFrameworkVisual({ data }: { data: Evidence }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-7">
      <div className="grid gap-4 md:grid-cols-5">
        {data.metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={`rounded-2xl border p-4 ${index < 3 ? 'border-slate-200 bg-slate-50' : 'border-indigo-100 bg-indigo-50/55'}`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{metric.label}</p>
            <p className="mt-4 text-lg font-semibold text-slate-950">{metric.value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{metric.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 rounded-2xl bg-slate-950 p-5 text-white md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-400">Forecast layer</p>
          <p className="mt-1 text-sm text-slate-200">Error magnitude + bias by horizon</p>
        </div>
        <div className="hidden text-slate-600 md:block">→</div>
        <div className="md:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-400">Decision layer</p>
          <p className="mt-1 text-sm text-slate-200">Service level + inventory coverage</p>
        </div>
      </div>
    </div>
  )
}
