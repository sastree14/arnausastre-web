import type { WebsiteProjectGoldStandard } from '@/lib/website-project-gold-standard'
import type { SiteLanguage } from '@/lib/public-copy'

type HorizonLogic = WebsiteProjectGoldStandard['horizonLogic']
type Architecture = WebsiteProjectGoldStandard['architecture']
type Evidence = WebsiteProjectGoldStandard['evidence']

export function HorizonDecisionVisual({ data, lang }: { data: HorizonLogic; lang?: SiteLanguage }) {
  const localized = lang
    ? {
        en: {
          title: 'Evaluation by planning horizon',
          note: 'Each horizon is evaluated as a separate business decision',
          rule: 'Decision rule',
          takeaway: 'The objective is not to make every horizon look equally accurate. It is to make the trade-off explicit enough to support a better planning decision.',
          horizons: [
            { horizon: '1 month', label: 'Near term', note: 'Read the most immediate demand signal separately from longer-range uncertainty.' },
            { horizon: '3 months', label: 'Short range', note: 'Keep a separate view of forecast error and bias before the planning window expands.' },
            { horizon: '6 months', label: 'Medium range', note: 'Make degradation visible instead of hiding it inside an aggregate score.' },
            { horizon: '9 months', label: 'Longer range', note: 'Treat long-horizon usefulness as its own inventory and purchasing question.' },
          ],
        },
        es: {
          title: 'Evaluación por horizonte de planificación',
          note: 'Cada horizonte se evalúa como una decisión de negocio distinta',
          rule: 'Regla de decisión',
          takeaway: 'El objetivo no es que todos los horizontes parezcan igual de precisos, sino hacer explícito el trade-off para tomar una mejor decisión de planificación.',
          horizons: [
            { horizon: '1 mes', label: 'Muy corto plazo', note: 'Leer la señal de demanda más inmediata por separado de la incertidumbre de horizontes más largos.' },
            { horizon: '3 meses', label: 'Corto plazo', note: 'Mantener una visión independiente del error y el sesgo antes de ampliar la ventana de planificación.' },
            { horizon: '6 meses', label: 'Medio plazo', note: 'Hacer visible la degradación del forecast en lugar de esconderla dentro de una cifra agregada.' },
            { horizon: '9 meses', label: 'Largo plazo', note: 'Tratar la utilidad del forecast de largo plazo como una decisión propia de compras e inventario.' },
          ],
        },
        ca: {
          title: 'Avaluació per horitzó de planificació',
          note: 'Cada horitzó s’avalua com una decisió de negoci diferent',
          rule: 'Regla de decisió',
          takeaway: 'L’objectiu no és que tots els horitzons semblin igual de precisos, sinó fer explícit el trade-off per prendre una millor decisió de planificació.',
          horizons: [
            { horizon: '1 mes', label: 'Molt curt termini', note: 'Llegir el senyal de demanda més immediat per separat de la incertesa dels horitzons més llargs.' },
            { horizon: '3 mesos', label: 'Curt termini', note: 'Mantenir una visió independent de l’error i el biaix abans d’ampliar la finestra de planificació.' },
            { horizon: '6 mesos', label: 'Mitjà termini', note: 'Fer visible la degradació del forecast en lloc d’amagar-la dins d’una xifra agregada.' },
            { horizon: '9 mesos', label: 'Llarg termini', note: 'Tractar la utilitat del forecast de llarg termini com una decisió pròpia de compres i inventari.' },
          ],
        },
      }[lang]
    : null

  const horizons = localized?.horizons || data.horizons

  return (
    <div className="border border-[#D8DDE3] bg-[#FAFAF7]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8DDE3] px-6 py-4">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-600">
          {localized?.title || 'Horizon-level evaluation'}
        </p>
        <p className="text-[13px] text-slate-500">
          {localized?.note || 'Each planning horizon is evaluated separately'}
        </p>
      </div>

      <div className="grid divide-y divide-[#D8DDE3] md:grid-cols-4 md:divide-x md:divide-y-0">
        {horizons.map((item) => (
          <div key={item.horizon} className="min-h-[198px] px-6 py-6">
            <div className="border-b border-slate-200 pb-4">
              <span
                className="block text-[29px] font-normal leading-none tracking-[-0.02em] text-[#1D2B44]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {item.horizon}
              </span>
              <span className="mt-3 block text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                {item.label}
              </span>
            </div>
            <p className="mt-5 text-[15px] leading-7 text-slate-600">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-[#D8DDE3] px-6 py-5">
        <p className="text-[15px] leading-7 text-slate-700">
          <span className="font-semibold text-slate-950">{localized?.rule || 'Decision rule'} — </span>
          {localized?.takeaway || data.takeaway}
        </p>
      </div>
    </div>
  )
}

function ArchitectureStage({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <div className="mb-3 border-b border-[#5E86A8] pb-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#A8BACB]">{label}</p>
      </div>
      <div className="space-y-3">{children}</div>
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
    <div className="min-w-0 border border-[#5E86A8] bg-[#13283C]">
      <div className="border-b border-[#496C8A] px-4 py-2.5 text-center">
        <span className="font-mono text-[12px] text-[#7A7DFF]">{String(index).padStart(2, '0')}</span>
      </div>
      <div className="min-w-0 px-5 py-5">
        <h3 className="break-words text-[15px] font-semibold leading-6 text-[#EAF0F6] xl:text-[16px]">{title}</h3>
        <p className="mt-2 break-words text-[14px] leading-6 text-[#A8BACB]">{detail}</p>
      </div>
    </div>
  )
}

export function ArchitectureSystemVisual({ data, lang }: { data: Architecture; lang?: SiteLanguage }) {
  const [orders, feature, baseline, ml, backtest, selection, planning] = data.steps
  const labels = lang
    ? {
        en: {
          title: 'SC-12 · System architecture',
          flow: 'Data → modelling → evaluation → planning',
          inputs: 'Inputs',
          models: 'Models',
          evaluation: 'Evaluation',
          decision: 'Decision output',
          integrations: 'Integration boundaries',
          provenance: 'Public portfolio implementation',
        },
        es: {
          title: 'SC-12 · Arquitectura del sistema',
          flow: 'Datos → modelización → evaluación → planificación',
          inputs: 'Entradas',
          models: 'Modelos',
          evaluation: 'Evaluación',
          decision: 'Salida de decisión',
          integrations: 'Capas de integración',
          provenance: 'Implementación pública de portfolio',
        },
        ca: {
          title: 'SC-12 · Arquitectura del sistema',
          flow: 'Dades → modelització → avaluació → planificació',
          inputs: 'Entrades',
          models: 'Models',
          evaluation: 'Avaluació',
          decision: 'Sortida de decisió',
          integrations: 'Capes d’integració',
          provenance: 'Implementació pública de portfolio',
        },
      }[lang]
    : null

  return (
    <div className="min-w-0 border border-[#5E86A8] bg-[#0D1B2A] text-white">
      <div className="grid gap-3 border-b border-[#5E86A8] px-5 py-5 sm:px-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">
            {labels?.title || 'SC-12 · System architecture'}
          </p>
          <p className="mt-2 text-[15px] leading-6 text-[#A8BACB]">
            {labels?.flow || 'Data → modelling → evaluation → planning'}
          </p>
        </div>
        <p className="text-[12px] leading-5 text-[#7F9BB5]">
          {labels?.provenance || 'Public portfolio implementation'}
        </p>
      </div>

      <div className="min-w-0 px-5 py-7 sm:px-6 lg:px-7 xl:px-8">
        <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-4 2xl:gap-5">
          <ArchitectureStage label={labels?.inputs || 'Inputs'}>
            {orders ? <ArchitectureNode index={1} title={orders.title} detail={orders.detail} /> : null}
            {feature ? <ArchitectureNode index={2} title={feature.title} detail={feature.detail} /> : null}
          </ArchitectureStage>

          <ArchitectureStage label={labels?.models || 'Models'}>
            {baseline ? <ArchitectureNode index={3} title={baseline.title} detail={baseline.detail} /> : null}
            {ml ? <ArchitectureNode index={4} title={ml.title} detail={ml.detail} /> : null}
          </ArchitectureStage>

          <ArchitectureStage label={labels?.evaluation || 'Evaluation'}>
            {backtest ? <ArchitectureNode index={5} title={backtest.title} detail={backtest.detail} /> : null}
            {selection ? <ArchitectureNode index={6} title={selection.title} detail={selection.detail} /> : null}
          </ArchitectureStage>

          <ArchitectureStage label={labels?.decision || 'Decision output'}>
            {planning ? <ArchitectureNode index={7} title={planning.title} detail={planning.detail} /> : null}
          </ArchitectureStage>
        </div>

        <div className="mt-8 border-t border-[#5E86A8] pt-5">
          <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#A8BACB]">
            {labels?.integrations || 'Integration boundaries'}
          </p>
          <div className="grid border border-[#5E86A8] lg:grid-cols-3 lg:divide-x lg:divide-[#5E86A8]">
            {data.integrations.map((integration) => (
              <div
                key={integration.title}
                className="min-w-0 border-b border-[#5E86A8] px-5 py-5 last:border-b-0 lg:border-b-0"
              >
                <h4 className="break-words text-[15px] font-semibold text-[#EAF0F6]">{integration.title}</h4>
                <p className="mt-2 break-words text-[14px] leading-6 text-[#A8BACB]">{integration.detail}</p>
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
