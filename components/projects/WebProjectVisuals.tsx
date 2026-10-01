import type { WebsiteProjectGoldStandard } from '@/lib/website-project-gold-standard'

type HorizonLogic = WebsiteProjectGoldStandard['horizonLogic']
type Architecture = WebsiteProjectGoldStandard['architecture']
type Evidence = WebsiteProjectGoldStandard['evidence']

export function HorizonDecisionVisual({ data }: { data: HorizonLogic }) {
  return (
    <div className="border border-[#D8DDE3] bg-[#FAFAF7]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8DDE3] px-6 py-4">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-600">Horizon-level evaluation</p>
        <p className="text-[13px] text-slate-500">Each planning horizon is evaluated separately</p>
      </div>

      <div className="grid divide-y divide-[#D8DDE3] md:grid-cols-4 md:divide-x md:divide-y-0">
        {data.horizons.map((item) => (
          <div key={item.horizon} className="min-h-[188px] px-6 py-6">
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-200 pb-4">
              <span className="text-[30px] font-normal leading-none tracking-[-0.02em] text-[#1D2B44]" style={{ fontFamily: 'var(--font-playfair)' }}>{item.horizon}</span>
              <span className="text-right text-[13px] font-medium uppercase tracking-[0.1em] text-slate-500">{item.label}</span>
            </div>
            <p className="mt-6 text-[15px] leading-7 text-slate-600">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-[#D8DDE3] px-6 py-5">
        <p className="text-[15px] leading-7 text-slate-700">
          <span className="font-semibold text-slate-950">Decision rule — </span>
          {data.takeaway}
        </p>
      </div>
    </div>
  )
}

function Connector() {
  return (
    <div className="hidden min-w-8 flex-1 items-center lg:flex" aria-hidden="true">
      <div className="h-px flex-1 bg-[#5E86A8]" />
      <svg viewBox="0 0 12 12" className="-ml-px h-3 w-3 shrink-0 text-[#5E86A8]">
        <path d="M1 1l8 5-8 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    </div>
  )
}

function ArchitectureColumn({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#A8BACB]">{label}</p>
      {children}
    </div>
  )
}

function ArchitectureNode({
  index,
  title,
  detail,
}: {
  index: number
  title: string
  detail: string
}) {
  return (
    <div className="border border-[#5E86A8] bg-[#13283C]">
      <div className="border-b border-[#496C8A] px-4 py-2.5 text-center">
        <span className="font-mono text-[13px] text-[#7A7DFF]">{String(index).padStart(2, '0')}</span>
      </div>
      <div className="px-5 py-5">
        <h3 className="text-[16px] font-semibold leading-6 text-[#EAF0F6]">{title}</h3>
        <p className="mt-2 text-[14px] leading-6 text-[#A8BACB]">{detail}</p>
      </div>
    </div>
  )
}

export function ArchitectureSystemVisual({ data }: { data: Architecture }) {
  const [orders, feature, baseline, ml, backtest, selection, planning] = data.steps

  return (
    <div className="border border-[#5E86A8] bg-[#0D1B2A] text-white">
      <div className="grid gap-2 border-b border-[#5E86A8] px-6 py-5 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">SC-12 · System architecture</p>
          <p className="mt-2 text-[15px] leading-6 text-[#A8BACB]">Data → modelling → evaluation → planning</p>
        </div>
        <p className="text-[13px] text-[#A8BACB]">Public portfolio implementation</p>
      </div>

      <div className="px-6 py-7 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-4">
          <ArchitectureColumn label="Inputs">
            <div className="space-y-3">
              {orders ? <ArchitectureNode index={1} title={orders.title} detail={orders.detail} /> : null}
              {feature ? <ArchitectureNode index={2} title={feature.title} detail={feature.detail} /> : null}
            </div>
          </ArchitectureColumn>

          <Connector />

          <ArchitectureColumn label="Models">
            <div className="space-y-3">
              {baseline ? <ArchitectureNode index={3} title={baseline.title} detail={baseline.detail} /> : null}
              {ml ? <ArchitectureNode index={4} title={ml.title} detail={ml.detail} /> : null}
            </div>
          </ArchitectureColumn>

          <Connector />

          <ArchitectureColumn label="Evaluation">
            <div className="space-y-3">
              {backtest ? <ArchitectureNode index={5} title={backtest.title} detail={backtest.detail} /> : null}
              {selection ? <ArchitectureNode index={6} title={selection.title} detail={selection.detail} /> : null}
            </div>
          </ArchitectureColumn>

          <Connector />

          <ArchitectureColumn label="Decision output">
            {planning ? <ArchitectureNode index={7} title={planning.title} detail={planning.detail} /> : null}
          </ArchitectureColumn>
        </div>

        <div className="mt-8 border-t border-[#5E86A8] pt-5">
          <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#A8BACB]">Integration boundaries</p>
          <div className="grid border-y border-[#5E86A8] md:grid-cols-3 md:divide-x md:divide-[#5E86A8]">
            {data.integrations.map((integration) => (
              <div key={integration.title} className="border-b border-[#5E86A8] px-5 py-5 last:border-b-0 md:border-b-0">
                <h4 className="text-[15px] font-semibold text-[#EAF0F6]">{integration.title}</h4>
                <p className="mt-2 text-[14px] leading-6 text-[#A8BACB]">{integration.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function EvidenceFrameworkVisual({ data }: { data: Evidence }) {
  return (
    <div className="border border-[#D8DDE3] bg-white">
      <div className="grid border-b border-[#D8DDE3] md:grid-cols-[3fr_2fr]">
        <div className="border-b border-[#D8DDE3] px-6 py-4 md:border-b-0 md:border-r">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-600">Forecast evaluation</p>
        </div>
        <div className="px-6 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-600">Decision relevance</p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 md:divide-x md:divide-[#D8DDE3]">
        {data.metrics.map((metric, index) => (
          <div key={metric.label} className="border-b border-[#D8DDE3] px-5 py-6 last:border-b-0 md:border-b-0">
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-500">{metric.label}</p>
            <p className="mt-5 text-[20px] font-semibold text-[#1D2B44]">{metric.value}</p>
            <p className="mt-3 text-[14px] leading-6 text-slate-600">{metric.note}</p>
            {index === 2 ? <div className="mt-5 h-px bg-[#496C8A] md:hidden" /> : null}
          </div>
        ))}
      </div>
    </div>
  )
}
