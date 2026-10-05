import type { WebsiteProjectGoldStandard } from '@/lib/website-project-gold-standard'
import type { SiteLanguage } from '@/lib/public-copy'

type HorizonLogic = WebsiteProjectGoldStandard['horizonLogic']
type Architecture = WebsiteProjectGoldStandard['architecture']
type Evidence = WebsiteProjectGoldStandard['evidence']

export function HorizonDecisionVisual({ data, lang }: { data: HorizonLogic; lang?: SiteLanguage }) {
  const labels = {
    en: { title: 'Decision sequence', note: 'Each stage answers a different operating question', rule: 'Decision rule' },
    es: { title: 'Secuencia de decisión', note: 'Cada etapa responde a una pregunta operativa distinta', rule: 'Regla de decisión' },
    ca: { title: 'Seqüència de decisió', note: 'Cada etapa respon a una pregunta operativa diferent', rule: 'Regla de decisió' },
  }[lang || 'en']

  const horizonPalette = [
    { bg: '#F8F2E9', border: '#DDCFBD' },
    { bg: '#F2ECF7', border: '#D7C8E3' },
    { bg: '#EAF3F8', border: '#C8DCE8' },
    { bg: '#EDF4EE', border: '#C9D9CD' },
  ]

  return (
    <div className="border border-[#D8DDE3] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8DDE3] bg-[#F4F1EA] px-6 py-4">
        <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-slate-700">{labels.title}</p>
        <p className="text-[14px] font-medium text-slate-600">{labels.note}</p>
      </div>

      <div className="grid gap-3 p-3 md:grid-cols-4">
        {data.horizons.map((item, index) => {
          const palette = horizonPalette[index % horizonPalette.length]
          return (
            <div
              key={`${item.horizon}-${item.label}`}
              className="min-h-[190px] border px-6 py-6"
              style={{ backgroundColor: palette.bg, borderColor: palette.border }}
            >
              <div className="border-b pb-4" style={{ borderColor: palette.border }}>
                <span
                  className="block text-[29px] font-normal leading-none tracking-[-0.02em] text-[#1D2B44]"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {item.horizon}
                </span>
                <span className="mt-3 block text-[14px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                  {item.label}
                </span>
              </div>
              <p className="mt-5 text-[17px] leading-7 text-slate-700">{item.note}</p>
            </div>
          )
        })}
      </div>

      <div className="border-t border-[#D8DDE3] px-6 py-5">
        <p className="text-[17px] leading-8 text-slate-800">
          <span className="font-semibold text-slate-950">{labels.rule} — </span>
          {data.takeaway}
        </p>
      </div>
    </div>
  )
}

function ArchitectureStage({
  label,
  tone,
  children,
}: {
  label: string
  tone: 'blue' | 'violet' | 'teal' | 'slate'
  children: React.ReactNode
}) {
  const palette = {
    blue: { border: '#739AB8', header: '#254A66', body: '#132E45' },
    violet: { border: '#8C8EB8', header: '#454A76', body: '#242D4E' },
    teal: { border: '#79A6A0', header: '#2D5D59', body: '#183E3C' },
    slate: { border: '#9B8FA2', header: '#5A4E5F', body: '#3A3340' },
  }[tone]

  return (
    <div className="min-w-0 overflow-hidden border" style={{ borderColor: palette.border, backgroundColor: palette.body }}>
      <div className="border-b px-5 py-4" style={{ borderColor: palette.border, backgroundColor: palette.header }}>
        <p className="text-[17px] font-semibold uppercase tracking-[0.15em] text-white xl:text-[18px]">{label}</p>
      </div>
      <div>{children}</div>
    </div>
  )
}

function ArchitectureNode({ index, title, detail }: { index: number; title: string; detail: string }) {
  return (
    <div className="min-w-0 border-t border-white/15 bg-black/5 first:border-t-0">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-2.5">
        <span className="font-mono text-[14px] font-semibold text-[#A4A5FF]">{String(index).padStart(2, '0')}</span>
      </div>
      <div className="min-h-[124px] px-5 py-4">
        <h3 className="break-words text-[16px] font-semibold leading-7 text-[#E4ECF3] xl:text-[17px]">{title}</h3>
        <p className="mt-1.5 break-words text-[14px] leading-6 text-[#AFC0CF]">{detail}</p>
      </div>
    </div>
  )
}

export function ArchitectureSystemVisual({ data, lang }: { data: Architecture; lang?: SiteLanguage }) {
  const labels = {
    en: { inputs: 'Inputs', core: 'Core system', validation: 'Validation', decision: 'Decision output', integrations: 'Integration boundaries', provenance: 'Public portfolio implementation' },
    es: { inputs: 'Entradas', core: 'Sistema central', validation: 'Validación', decision: 'Salida de decisión', integrations: 'Capas de integración', provenance: 'Implementación pública de portfolio' },
    ca: { inputs: 'Entrades', core: 'Sistema central', validation: 'Validació', decision: 'Sortida de decisió', integrations: 'Capes d’integració', provenance: 'Implementació pública de portfolio' },
  }[lang || 'en']

  const groups = [
    { label: labels.inputs, tone: 'blue' as const, steps: data.steps.slice(0, 2), offset: 0 },
    { label: labels.core, tone: 'violet' as const, steps: data.steps.slice(2, 4), offset: 2 },
    { label: labels.validation, tone: 'teal' as const, steps: data.steps.slice(4, 6), offset: 4 },
    { label: labels.decision, tone: 'slate' as const, steps: data.steps.slice(6, 8), offset: 6 },
  ]

  return (
    <div className="min-w-0 border border-[#5E86A8] bg-[#0D1B2A] text-white">
      <div className="grid gap-3 border-b border-[#5E86A8] px-5 py-5 sm:px-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{data.eyebrow}</p>
          <p className="mt-2 text-[16px] leading-7 text-[#C2D2E0]">{data.body}</p>
        </div>
        <p className="text-[14px] leading-6 text-[#9DB3C7]">{labels.provenance}</p>
      </div>

      <div className="min-w-0 px-5 py-7 sm:px-6 lg:px-7 xl:px-8">
        <div className="grid min-w-0 items-start grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
          {groups.map((group) => (
            <ArchitectureStage key={group.label} label={group.label} tone={group.tone}>
              {group.steps.map((step, index) => (
                <ArchitectureNode
                  key={`${group.label}-${step.title}`}
                  index={group.offset + index + 1}
                  title={step.title}
                  detail={step.detail}
                />
              ))}
            </ArchitectureStage>
          ))}
        </div>

        {data.integrations.length ? (
          <div className="mt-8 border-t border-[#5E86A8] pt-5">
            <p className="mb-4 text-[14px] font-semibold uppercase tracking-[0.14em] text-[#C2D2E0]">{labels.integrations}</p>
            <div className="grid border border-[#5E86A8] lg:grid-cols-3 lg:divide-x lg:divide-[#5E86A8]">
              {data.integrations.map((integration) => (
                <div
                  key={integration.title}
                  className="min-w-0 border-b border-[#5E86A8] px-5 py-5 last:border-b-0 lg:border-b-0"
                >
                  <h4 className="break-words text-[17px] font-semibold leading-7 text-white">{integration.title}</h4>
                  <p className="mt-2 break-words text-[15px] leading-7 text-[#C2D2E0]">{integration.detail}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function EvidenceFrameworkVisual({
  data,
  lang,
  groupLabels,
}: {
  data: Evidence
  lang?: SiteLanguage
  groupLabels?: [string, string]
}) {
  const fallback = {
    en: ['Primary evidence', 'Validation coverage'],
    es: ['Evidencia principal', 'Cobertura de validación'],
    ca: ['Evidència principal', 'Cobertura de validació'],
  }[lang || 'en'] as [string, string]

  const labels = groupLabels || fallback
  const evaluationMetrics = data.metrics.slice(0, 3)
  const validationMetrics = data.metrics.slice(3, 5)

  const renderMetric = (metric: Evidence['metrics'][number]) => (
    <div key={`${metric.label}-${metric.value}`} className="flex min-h-[170px] flex-col px-5 py-5">
      <p className="min-h-[30px] text-[14px] font-semibold uppercase leading-[1.25] tracking-[0.1em] text-[#4F46E5]">{metric.label}</p>
      <p className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.02em] text-[#1D2B44]">{metric.value}</p>
      <p className="mt-auto pt-4 text-[14px] leading-5 text-slate-600">{metric.note}</p>
    </div>
  )

  return (
    <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
      <section className="overflow-hidden border border-[#D8CBE5] bg-[#F4F1EA]">
        <div className="border-b border-[#D8CBE5] bg-[#F4F1EA] px-6 py-4">
          <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#40385F]">{labels[0]}</p>
        </div>
        <div className="grid divide-y divide-[#D8CBE5] bg-[#F4F1EA] md:grid-cols-3 md:divide-x md:divide-y-0">
          {evaluationMetrics.map(renderMetric)}
        </div>
      </section>

      <section className="overflow-hidden border border-[#C6DCE8] bg-[#EAF0F6]">
        <div className="border-b border-[#C6DCE8] bg-[#EAF0F6] px-6 py-4">
          <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#31536B]">{labels[1]}</p>
        </div>
        <div className="grid divide-y divide-[#C6DCE8] bg-[#EAF0F6] md:grid-cols-2 md:divide-x md:divide-y-0">
          {validationMetrics.map(renderMetric)}
        </div>
      </section>
    </div>
  )
}
