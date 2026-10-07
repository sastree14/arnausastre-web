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


export const KNOWLEDGE_GOLD_STANDARD_IDS = new Set([
  'KB-001',
  'KB-004',
  'KB-041',
  'KB-061',
  'KB-081',
  'KB-088',
  'KB-101',
  'KB-117',
  'KB-173',
  'KB-197',
  'KB-200',
])

const PUBLICATION_LOCAL_ORDER = [1, 5, 9, 13, 17, 4, 8, 12, 16, 20, 2, 6, 10, 14, 18, 3, 7, 11, 15, 19]

export function publicationOrderForSequence(sequence: number) {
  const safe = Math.max(1, Math.min(200, Number(sequence) || 1))
  const clusterIndex = Math.floor((safe - 1) / 20)
  const localIndex = ((safe - 1) % 20) + 1
  const round = PUBLICATION_LOCAL_ORDER.indexOf(localIndex)
  return (round < 0 ? localIndex - 1 : round) * 10 + clusterIndex + 1
}

const EXPERIENCE_NOTES: Record<string, Record<KnowledgeLocale, string>> = {
  'KB-001': {
    es: 'En proyectos de forecasting, la mejora estadística solo se vuelve útil cuando cada horizonte termina conectado con una decisión real: compra, capacidad, inventario o priorización.',
    ca: 'En projectes de forecasting, la millora estadística només es torna útil quan cada horitzó acaba connectat amb una decisió real: compra, capacitat, inventari o priorització.',
    en: 'In forecasting work, statistical improvement only becomes useful when each horizon is connected to a real decision: purchasing, capacity, inventory or prioritisation.',
  },
  'KB-009': {
    es: 'Trabajar con horizontes H1, H3, H6 o H9 obliga a separar decisiones. Un horizonte corto puede alimentar operación; uno largo puede servir para capacidad, caja o compras con otra lógica.',
    ca: 'Treballar amb horitzons H1, H3, H6 o H9 obliga a separar decisions. Un horitzó curt pot alimentar operació; un de llarg pot servir per capacitat, caixa o compres amb una altra lògica.',
    en: 'Working with H1, H3, H6 or H9 horizons forces decisions apart. A short horizon may drive operations while a longer one supports capacity, cash or purchasing under different logic.',
  },
  'KB-021': {
    es: 'En planificación de demanda e inventario, los buffers fijos tienden a esconder el problema: mezclan incertidumbre real con decisiones heredadas de reposición, proveedor o nivel de servicio.',
    ca: 'En planificació de demanda i inventari, els buffers fixos tendeixen a amagar el problema: barregen incertesa real amb decisions heretades de reposició, proveïdor o nivell de servei.',
    en: 'In demand and inventory planning, fixed buffers tend to hide the real problem: they mix genuine uncertainty with inherited replenishment, supplier or service-level decisions.',
  },
  'KB-061': {
    es: 'En proyectos de machine learning, una baseline sencilla suele ser una de las pruebas más valiosas: obliga a demostrar cuánto valor incremental compra realmente la complejidad del modelo.',
    ca: 'En projectes de machine learning, una baseline senzilla acostuma a ser una de les proves més valuoses: obliga a demostrar quant valor incremental compra realment la complexitat del model.',
    en: 'In machine-learning projects, a simple baseline is often one of the most valuable tests: it forces the team to show how much incremental value the model complexity actually buys.',
  },
  'KB-065': {
    es: 'En scoring y riesgo, optimizar AUC sin revisar el cutoff, la capacidad de actuación y el coste de falsos positivos y falsos negativos deja incompleta la decisión.',
    ca: 'En scoring i risc, optimitzar AUC sense revisar el cutoff, la capacitat d’actuació i el cost de falsos positius i falsos negatius deixa incompleta la decisió.',
    en: 'In scoring and risk work, optimising AUC without reviewing the cutoff, intervention capacity and the cost of false positives and false negatives leaves the decision incomplete.',
  },
  'KB-080': {
    es: 'Cuando un modelo llega a producción, la parte difícil deja de ser el entrenamiento. Datos, drift, thresholds, outcomes y overrides necesitan una lectura conjunta para saber si la decisión sigue funcionando.',
    ca: 'Quan un model arriba a producció, la part difícil deixa de ser l’entrenament. Dades, drift, thresholds, outcomes i overrides necessiten una lectura conjunta per saber si la decisió continua funcionant.',
    en: 'Once a model reaches production, training stops being the hard part. Data, drift, thresholds, outcomes and overrides have to be read together to know whether the decision still works.',
  },
  'KB-081': {
    es: 'Al construir agentes y automatizaciones, separar interpretación de ejecución reduce mucho el riesgo: la IA puede decidir qué camino seguir y una capa determinista puede validar qué acciones están realmente permitidas.',
    ca: 'En construir agents i automatitzacions, separar interpretació d’execució redueix molt el risc: la IA pot decidir quin camí seguir i una capa determinista pot validar quines accions estan realment permeses.',
    en: 'When building agents and automations, separating interpretation from execution reduces risk considerably: AI can choose the path while a deterministic layer validates which actions are actually allowed.',
  },
  'KB-088': {
    es: 'En sistemas de datos e IA, una combinación frecuente funciona mejor que una elección absoluta: comprar infraestructura commodity, conservar la lógica diferencial y apoyarse en especialistas para acelerar integración y delivery.',
    ca: 'En sistemes de dades i IA, una combinació freqüent funciona millor que una elecció absoluta: comprar infraestructura commodity, conservar la lògica diferencial i recolzar-se en especialistes per accelerar integració i delivery.',
    en: 'In data and AI systems, a mixed model often works better than an absolute choice: buy commodity infrastructure, retain differentiated logic and use specialists to accelerate integration and delivery.',
  },
  'KB-101': {
    es: 'Al construir cuadros de mando y CMI, el salto de valor aparece cuando el sistema deja de limitarse a enseñar métricas y empieza a conectar señal, contexto, siguiente acción y trazabilidad.',
    ca: 'En construir quadres de comandament i CMI, el salt de valor apareix quan el sistema deixa de limitar-se a mostrar mètriques i comença a connectar senyal, context, següent acció i traçabilitat.',
    en: 'When building management dashboards and decision interfaces, the value jump appears when the system stops merely showing metrics and starts connecting signal, context, next action and traceability.',
  },
  'KB-117': {
    es: 'En automatización y reporting, hemos visto que acelerar el dato no sirve si la aprobación, la interpretación o la ejecución siguen bloqueando la acción. La latencia debe medirse hasta la decisión real.',
    ca: 'En automatització i reporting, accelerar la dada no serveix si l’aprovació, la interpretació o l’execució continuen bloquejant l’acció. La latència s’ha de mesurar fins a la decisió real.',
    en: 'In automation and reporting work, faster data does not help if approval, interpretation or execution still blocks action. Latency has to be measured all the way to the real decision.',
  },
  'KB-173': {
    es: 'En modelos de riesgo y crédito, una AUC fuerte puede convivir con una mala política. El valor aparece al conectar ranking, calibración, cutoff, expected loss y restricciones reales del portfolio.',
    ca: 'En models de risc i crèdit, una AUC forta pot conviure amb una mala política. El valor apareix en connectar ranking, calibratge, cutoff, expected loss i restriccions reals del portfolio.',
    en: 'In credit-risk models, strong AUC can coexist with a poor policy. Value appears when ranking, calibration, cutoff, expected loss and real portfolio constraints are connected.',
  },
  'KB-193': {
    es: 'En entornos de planning con Anaplan y reporting, migrar la hoja de cálculo sin revisar la lógica de decisión solo traslada complejidad. El modelo operativo debe revisarse antes que la interfaz.',
    ca: 'En entorns de planning amb Anaplan i reporting, migrar el full de càlcul sense revisar la lògica de decisió només trasllada complexitat. El model operatiu s’ha de revisar abans que la interfície.',
    en: 'In planning environments using Anaplan and reporting, migrating the spreadsheet without revisiting the decision logic merely moves complexity. The operating model should be reviewed before the interface.',
  },
  'KB-197': {
    es: 'En automatización, machine learning y agentes, una parte importante del trabajo es descartar complejidad. Una regla, un SQL o un workflow determinista pueden ser la mejor solución cuando compran casi todo el valor.',
    ca: 'En automatització, machine learning i agents, una part important de la feina és descartar complexitat. Una regla, un SQL o un workflow determinista poden ser la millor solució quan compren gairebé tot el valor.',
    en: 'In automation, machine learning and agent work, an important part of the job is rejecting unnecessary complexity. A rule, SQL query or deterministic workflow can be the best solution when it captures almost all the value.',
  },
}

export function experienceNoteForArticle(specId: string | undefined | null, locale: KnowledgeLocale) {
  return specId ? EXPERIENCE_NOTES[specId]?.[locale] : undefined
}
