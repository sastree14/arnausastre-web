export type KnowledgeServiceKey =
  | 'forecasting-planning'
  | 'optimisation'
  | 'machine-learning'
  | 'ai-automation'
  | 'analytics-bi'
  | 'simulation-modelling'

export type KnowledgePresentationVariant =
  | 'statement'
  | 'duo'
  | 'triad'
  | 'matrix'
  | 'sequence'
  | 'diagnostic'
  | 'evidence'
  | 'architecture'

export type KnowledgeLocale = 'es' | 'ca' | 'en'

export const KNOWLEDGE_SERVICES: Record<KnowledgeServiceKey, {
  anchor: string
  labels: Record<KnowledgeLocale, string>
  cta: Record<KnowledgeLocale, string>
}> = {
  'forecasting-planning': {
    anchor: 'forecasting-planning',
    labels: {
      es: 'Forecasting y planning',
      ca: 'Forecasting i planning',
      en: 'Forecasting and planning',
    },
    cta: {
      es: 'Ver cómo trabajamos forecasting y planning',
      ca: 'Veure com treballem forecasting i planning',
      en: 'See how we approach forecasting and planning',
    },
  },
  optimisation: {
    anchor: 'optimisation',
    labels: {
      es: 'Optimización',
      ca: 'Optimització',
      en: 'Optimisation',
    },
    cta: {
      es: 'Ver nuestro enfoque de optimización',
      ca: 'Veure el nostre enfocament d’optimització',
      en: 'See our optimisation approach',
    },
  },
  'machine-learning': {
    anchor: 'machine-learning',
    labels: {
      es: 'Machine learning',
      ca: 'Machine learning',
      en: 'Machine learning',
    },
    cta: {
      es: 'Ver cómo aplicamos machine learning',
      ca: 'Veure com apliquem machine learning',
      en: 'See how we apply machine learning',
    },
  },
  'ai-automation': {
    anchor: 'ai-automation',
    labels: {
      es: 'Inteligencia artificial y automatización',
      ca: 'Intel·ligència artificial i automatització',
      en: 'Artificial intelligence & automation',
    },
    cta: {
      es: 'Ver nuestro enfoque de IA y automatización',
      ca: 'Veure el nostre enfocament d’IA i automatització',
      en: 'See our AI and automation approach',
    },
  },
  'analytics-bi': {
    anchor: 'analytics-bi',
    labels: {
      es: 'Analytics y BI',
      ca: 'Analytics i BI',
      en: 'Analytics and BI',
    },
    cta: {
      es: 'Ver cómo trabajamos datos, analytics y BI',
      ca: 'Veure com treballem dades, analytics i BI',
      en: 'See how we approach data, analytics and BI',
    },
  },
  'simulation-modelling': {
    anchor: 'simulation-modelling',
    labels: {
      es: 'Simulación y modelización',
      ca: 'Simulació i modelització',
      en: 'Simulation & modelling',
    },
    cta: {
      es: 'Ver nuestro enfoque de simulación y modelización',
      ca: 'Veure el nostre enfocament de simulació i modelització',
      en: 'See our simulation and modelling approach',
    },
  },
}

export function serviceHref(serviceKey: KnowledgeServiceKey) {
  return `/services#${KNOWLEDGE_SERVICES[serviceKey].anchor}`
}

export function fallbackServiceForArticle(input: {
  cluster?: string | null
  specId?: string | null
}): KnowledgeServiceKey {
  const cluster = String(input.cluster || '')
  const spec = Number(String(input.specId || '').replace(/\D/g, '')) || 0

  if (cluster === 'Forecasting & Planning') return 'forecasting-planning'
  if (cluster === 'Inventory & Supply Chain') return 'optimisation'
  if (cluster === 'Optimization & OR') return 'optimisation'
  if (cluster === 'Machine Learning') return 'machine-learning'
  if (cluster === 'AI & Automation') return 'ai-automation'
  if (cluster === 'Analytics & Decision Intelligence') return 'analytics-bi'
  if (cluster === 'Data Engineering & Architecture') return 'analytics-bi'
  if (cluster === 'Cloud & Platforms') return 'analytics-bi'

  if (cluster === 'Finance, Risk & Pricing') {
    if (spec >= 165 && spec <= 168) return 'forecasting-planning'
    if (spec >= 173 && spec <= 176) return 'machine-learning'
    return 'simulation-modelling'
  }

  if (cluster === 'Simulation & Business Systems') {
    if (spec >= 189 && spec <= 192) return 'analytics-bi'
    if (spec >= 193 && spec <= 196) return 'forecasting-planning'
    if (spec >= 197) return 'ai-automation'
    return 'simulation-modelling'
  }

  return 'analytics-bi'
}

export function presentationForFamily(contentFamily?: string | null): KnowledgePresentationVariant {
  switch (String(contentFamily || '')) {
    case 'point_of_view_contrarian': return 'statement'
    case 'compare': return 'duo'
    case 'decision_guide': return 'triad'
    case 'failure_modes_mistakes': return 'matrix'
    case 'framework_playbook': return 'sequence'
    case 'diagnose': return 'diagnostic'
    case 'evidence_measurement': return 'evidence'
    case 'system_architecture': return 'architecture'
    default: return 'triad'
  }
}

export function summaryCountForPresentation(variant: KnowledgePresentationVariant) {
  switch (variant) {
    case 'statement': return 1
    case 'duo': return 2
    case 'triad': return 3
    case 'matrix': return 4
    case 'sequence': return 5
    case 'diagnostic': return 4
    case 'evidence': return 3
    case 'architecture': return 4
    default: return 3
  }
}

export function summaryGridClass(count: number) {
  if (count <= 1) return 'grid-cols-1'
  if (count === 2) return 'md:grid-cols-2'
  if (count === 3) return 'md:grid-cols-3'
  if (count === 4) return 'md:grid-cols-2 xl:grid-cols-4'
  if (count <= 6) return 'md:grid-cols-2 xl:grid-cols-3'
  return 'md:grid-cols-2 xl:grid-cols-4'
}
