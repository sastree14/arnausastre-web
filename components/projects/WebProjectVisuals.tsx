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
          note: 'A different business decision at each horizon',
          rule: 'Decision rule',
          takeaway: 'Use each horizon to support the planning decision it actually drives.',
          horizons: [
            { horizon: '1 month', label: 'Near term', note: 'Immediate demand signal with less accumulated uncertainty.' },
            { horizon: '3 months', label: 'Short range', note: 'Error and bias before the planning window broadens.' },
            { horizon: '6 months', label: 'Medium range', note: 'Forecast degradation made visible, not averaged away.' },
            { horizon: '9 months', label: 'Longer range', note: 'Long-horizon usefulness for purchasing and inventory.' },
          ],
        },
        es: {
          title: 'Evaluación por horizonte de planificación',
          note: 'Una decisión de negocio distinta en cada horizonte',
          rule: 'Regla de decisión',
          takeaway: 'Usar cada horizonte para apoyar la decisión de planificación que realmente mueve.',
          horizons: [
            { horizon: '1 mes', label: 'Muy corto plazo', note: 'Señal inmediata de demanda con menor incertidumbre acumulada.' },
            { horizon: '3 meses', label: 'Corto plazo', note: 'Error y sesgo antes de ampliar la ventana de planificación.' },
            { horizon: '6 meses', label: 'Medio plazo', note: 'La degradación del forecast queda visible, no escondida en un promedio.' },
            { horizon: '9 meses', label: 'Largo plazo', note: 'Utilidad real del forecast para compras e inventario.' },
          ],
        },
        ca: {
          title: 'Avaluació per horitzó de planificació',
          note: 'Una decisió de negoci diferent a cada horitzó',
          rule: 'Regla de decisió',
          takeaway: 'Utilitzar cada horitzó per donar suport a la decisió de planificació que realment mou.',
          horizons: [
            { horizon: '1 mes', label: 'Molt curt termini', note: 'Senyal immediat de demanda amb menys incertesa acumulada.' },
            { horizon: '3 mesos', label: 'Curt termini', note: 'Error i biaix abans d’ampliar la finestra de planificació.' },
            { horizon: '6 mesos', label: 'Mitjà termini', note: 'La degradació del forecast queda visible, no amagada en una mitjana.' },
            { horizon: '9 mesos', label: 'Llarg termini', note: 'Utilitat real del forecast per a compres i inventari.' },
          ],
        },
      }[lang]
    : null

  const horizons = localized?.horizons || data.horizons

  return (
    <div className="border border-[#D8DDE3] bg-[#FAFAF7]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8DDE3] px-6 py-4">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-700">
          {localized?.title || 'Horizon-level evaluation'}
        </p>
        <p className="text-[14px] font-medium text-slate-600">
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
              <span className="mt-3 block text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                {item.label}
              </span>
            </div>
            <p className="mt-5 text-[17px] leading-7 text-slate-700">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-[#D8DDE3] px-6 py-5">
        <p className="text-[17px] leading-8 text-slate-800">
          <span className="font-semibold text-slate-950">{localized?.rule || 'Decision rule'} — </span>
          {localized?.takeaway || data.takeaway}
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
    blue: { border: '#6F91AF', header: '#1B3D59', body: '#10283E' },
    violet: { border: '#7A82AF', header: '#29395B', body: '#172A42' },
    teal: { border: '#6F9A99', header: '#1D4649', body: '#123437' },
    slate: { border: '#8293A5', header: '#314355', body: '#1D3042' },
  }[tone]

  return (
    <div className="min-w-0 overflow-hidden border" style={{ borderColor: palette.border, backgroundColor: palette.body }}>
      <div className="border-b px-5 py-4" style={{ borderColor: palette.border, backgroundColor: palette.header }}>
        <p className="text-[17px] font-semibold uppercase tracking-[0.15em] text-white xl:text-[18px]">{label}</p>
      </div>
      <div className="grid h-full auto-rows-fr">{children}</div>
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
    <div className="h-full min-w-0 border-t border-[#496C8A] bg-black/5 first:border-t-0">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-2.5">
        <span className="font-mono text-[12px] font-semibold text-[#8F91FF]">{String(index).padStart(2, '0')}</span>
      </div>
      <div className="min-w-0 px-5 py-5">
        <h3 className="break-words text-[16px] font-semibold leading-7 text-[#E4ECF3] xl:text-[17px]">{title}</h3>
        <p className="mt-2 break-words text-[14px] leading-6 text-[#9FB2C4]">{detail}</p>
      </div>
    </div>
  )
}

export function ArchitectureSystemVisual({ data, lang }: { data: Architecture; lang?: SiteLanguage }) {
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

  const localizedArchitecture = lang
    ? {
        en: null,
        es: {
          steps: [
            { title: 'Pedidos + inventario', detail: 'Histórico operativo de pedidos, inventario y atributos de producto.' },
            { title: 'Ingeniería de variables', detail: 'Prepara señales para modelado y contexto específico por horizonte.' },
            { title: 'Modelos de referencia', detail: 'Mantienen una referencia sencilla para comparar cada alternativa.' },
            { title: 'Candidatos de ML', detail: 'XGBoost y LightGBM se evalúan junto a enfoques estadísticos.' },
            { title: 'Backtesting por horizonte', detail: 'Mide el rendimiento por separado a 1, 3, 6 y 9 meses.' },
            { title: 'Selección del forecast', detail: 'Prioriza comportamiento fuera de muestra y simplicidad operativa.' },
            { title: 'Salida de planificación', detail: 'Expone forecasts, intervalos e indicadores para la decisión.' },
          ],
          integrations: [
            { title: 'PostgreSQL', detail: 'Fuente histórica para pedidos, inventario y atributos de producto.' },
            { title: 'FastAPI', detail: 'Capa de servicio para solicitudes de forecast y escenarios.' },
            { title: 'Almacenamiento de objetos', detail: 'Backtests, artefactos entrenados y resultados del modelo.' },
          ],
        },
        ca: {
          steps: [
            { title: 'Comandes + inventari', detail: 'Històric operatiu de comandes, inventari i atributs de producte.' },
            { title: 'Enginyeria de variables', detail: 'Prepara senyals per al modelatge i context específic per horitzó.' },
            { title: 'Models de referència', detail: 'Mantenen una referència senzilla per comparar cada alternativa.' },
            { title: 'Candidats de ML', detail: 'XGBoost i LightGBM s’avaluen juntament amb enfocaments estadístics.' },
            { title: 'Backtesting per horitzó', detail: 'Mesura el rendiment per separat a 1, 3, 6 i 9 mesos.' },
            { title: 'Selecció del forecast', detail: 'Prioritza comportament fora de mostra i simplicitat operativa.' },
            { title: 'Sortida de planificació', detail: 'Exposa forecasts, intervals i indicadors per a la decisió.' },
          ],
          integrations: [
            { title: 'PostgreSQL', detail: 'Font històrica per a comandes, inventari i atributs de producte.' },
            { title: 'FastAPI', detail: 'Capa de servei per a peticions de forecast i escenaris.' },
            { title: 'Emmagatzematge d’objectes', detail: 'Backtests, artefactes entrenats i resultats del model.' },
          ],
        },
      }[lang]
    : null

  const steps = localizedArchitecture?.steps || data.steps
  const integrations = localizedArchitecture?.integrations || data.integrations
  const [orders, feature, baseline, ml, backtest, selection, planning] = steps

  return (
    <div className="min-w-0 border border-[#5E86A8] bg-[#0D1B2A] text-white">
      <div className="grid gap-3 border-b border-[#5E86A8] px-5 py-5 sm:px-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">
            {labels?.title || 'SC-12 · System architecture'}
          </p>
          <p className="mt-2 text-[16px] leading-7 text-[#C2D2E0]">
            {labels?.flow || 'Data → modelling → evaluation → planning'}
          </p>
        </div>
        <p className="text-[13px] leading-6 text-[#9DB3C7]">
          {labels?.provenance || 'Public portfolio implementation'}
        </p>
      </div>

      <div className="min-w-0 px-5 py-7 sm:px-6 lg:px-7 xl:px-8">
        <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-4 2xl:gap-5">
          <ArchitectureStage label={labels?.inputs || 'Inputs'} tone="blue">
            {orders ? <ArchitectureNode index={1} title={orders.title} detail={orders.detail} /> : null}
            {feature ? <ArchitectureNode index={2} title={feature.title} detail={feature.detail} /> : null}
          </ArchitectureStage>

          <ArchitectureStage label={labels?.models || 'Models'} tone="violet">
            {baseline ? <ArchitectureNode index={3} title={baseline.title} detail={baseline.detail} /> : null}
            {ml ? <ArchitectureNode index={4} title={ml.title} detail={ml.detail} /> : null}
          </ArchitectureStage>

          <ArchitectureStage label={labels?.evaluation || 'Evaluation'} tone="teal">
            {backtest ? <ArchitectureNode index={5} title={backtest.title} detail={backtest.detail} /> : null}
            {selection ? <ArchitectureNode index={6} title={selection.title} detail={selection.detail} /> : null}
          </ArchitectureStage>

          <ArchitectureStage label={labels?.decision || 'Decision output'} tone="slate">
            {planning ? <ArchitectureNode index={7} title={planning.title} detail={planning.detail} /> : null}
          </ArchitectureStage>
        </div>

        <div className="mt-8 border-t border-[#5E86A8] pt-5">
          <p className="mb-4 text-[14px] font-semibold uppercase tracking-[0.14em] text-[#C2D2E0]">
            {labels?.integrations || 'Integration boundaries'}
          </p>
          <div className="grid border border-[#5E86A8] lg:grid-cols-3 lg:divide-x lg:divide-[#5E86A8]">
            {integrations.map((integration) => (
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
      </div>
    </div>
  )
}

export function EvidenceFrameworkVisual({ data, lang }: { data: Evidence; lang?: SiteLanguage }) {
  const localized = lang
    ? {
        en: {
          left: 'Forecast evaluation',
          right: 'Validation coverage',
          labels: {
            WAPE: 'WAPE',
            MAE: 'MAE',
            'Forecast bias': 'Forecast bias',
            'Planning horizons': 'Planning horizons',
            'Backtest observations': 'Backtest observations',
          },
          notes: {
            WAPE: 'Weighted percentage error',
            MAE: 'Mean absolute error',
            'Forecast bias': 'Systematic forecast direction',
            'Planning horizons': '1 · 3 · 6 · 9 months',
            'Backtest observations': 'Public validation observations',
          },
        },
        es: {
          left: 'Evaluación del forecast',
          right: 'Cobertura de validación',
          labels: {
            WAPE: 'WAPE',
            MAE: 'MAE',
            'Forecast bias': 'Sesgo del forecast',
            'Planning horizons': 'Horizontes de planificación',
            'Backtest observations': 'Observaciones de backtest',
          },
          notes: {
            WAPE: 'Error porcentual ponderado',
            MAE: 'Error absoluto medio',
            'Forecast bias': 'Sesgo sistemático',
            'Planning horizons': '1 · 3 · 6 · 9 meses',
            'Backtest observations': 'Observaciones de validación',
          },
        },
        ca: {
          left: 'Avaluació del forecast',
          right: 'Cobertura de validació',
          labels: {
            WAPE: 'WAPE',
            MAE: 'MAE',
            'Forecast bias': 'Biaix del forecast',
            'Planning horizons': 'Horitzons de planificació',
            'Backtest observations': 'Observacions de backtest',
          },
          notes: {
            WAPE: 'Error percentual ponderat',
            MAE: 'Error absolut mitjà',
            'Forecast bias': 'Biaix sistemàtic',
            'Planning horizons': '1 · 3 · 6 · 9 mesos',
            'Backtest observations': 'Observacions de validació',
          },
        },
      }[lang]
    : null

  const evaluationMetrics = data.metrics.slice(0, 3)
  const validationMetrics = data.metrics.slice(3, 5)

  const renderMetric = (metric: Evidence['metrics'][number]) => {
    const metricKey = metric.label as keyof typeof localized.notes
    const label = localized?.labels[metricKey] || metric.label
    const note = localized?.notes[metricKey] || metric.note

    return (
      <div key={metric.label} className="flex min-h-[170px] flex-col px-5 py-5">
        <p className="min-h-[30px] text-[12px] font-semibold uppercase leading-[1.25] tracking-[0.1em] text-indigo-700">
          {label}
        </p>
        <p className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.02em] text-[#1D2B44]">{metric.value}</p>
        <p className="mt-auto pt-4 text-[13px] leading-5 text-slate-600">{note}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
      <section className="overflow-hidden border border-[#D8CBE5] bg-[#F4EFF8]">
        <div className="border-b border-[#D8CBE5] bg-[#ECE3F3] px-6 py-4">
          <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#40385F]">
            {localized?.left || 'Forecast evaluation'}
          </p>
        </div>
        <div className="grid divide-y divide-[#D8CBE5] bg-[#FBF9FC] md:grid-cols-3 md:divide-x md:divide-y-0">
          {evaluationMetrics.map(renderMetric)}
        </div>
      </section>

      <section className="overflow-hidden border border-[#C6DCE8] bg-[#EAF3F8]">
        <div className="border-b border-[#C6DCE8] bg-[#DDECF4] px-6 py-4">
          <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#31536B]">
            {localized?.right || 'Validation coverage'}
          </p>
        </div>
        <div className="grid divide-y divide-[#C6DCE8] bg-[#F7FBFD] md:grid-cols-2 md:divide-x md:divide-y-0">
          {validationMetrics.map(renderMetric)}
        </div>
      </section>
    </div>
  )
}

