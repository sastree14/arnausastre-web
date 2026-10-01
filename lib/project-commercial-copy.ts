import type { SiteLanguage } from '@/lib/public-copy'

export const projectOverviewUi = {
  en: {
    back: 'All cases',
    caseStudy: 'Read the full case',
    repository: 'Technical repository',
    contact: 'Talk to us about a similar problem',
    snapshot: 'The case in 30 seconds',
    problem: 'Business problem',
    changed: 'What changed',
    utility: 'Business utility',
    evidence: 'Evidence & provenance',
    publicImplementation: 'Public portfolio implementation',
    context: 'What this system is for',
    scenario: 'Case economics',
    scenarioNote: 'Reference economics — not attributed to a specific client',
  },
  es: {
    back: 'Todos los casos',
    caseStudy: 'Ver el caso completo',
    repository: 'Repositorio técnico',
    contact: 'Háblanos de un problema similar',
    snapshot: 'El caso en 30 segundos',
    problem: 'Problema de negocio',
    changed: 'Qué cambió',
    utility: 'Utilidad para el negocio',
    evidence: 'Evidencia y procedencia',
    publicImplementation: 'Implementación pública de portfolio',
    context: 'Para qué sirve este sistema',
    scenario: 'Economía del caso',
    scenarioNote: 'Modelo económico de referencia — no se atribuye a un cliente concreto',
  },
  ca: {
    back: 'Tots els casos',
    caseStudy: 'Veure el cas complet',
    repository: 'Repositori tècnic',
    contact: 'Parla’ns d’un problema similar',
    snapshot: 'El cas en 30 segons',
    problem: 'Problema de negoci',
    changed: 'Què va canviar',
    utility: 'Utilitat per al negoci',
    evidence: 'Evidència i procedència',
    publicImplementation: 'Implementació pública de portfolio',
    context: 'Per a què serveix aquest sistema',
    scenario: 'Economia del cas',
    scenarioNote: 'Model econòmic de referència — no s’atribueix a un client concret',
  },
} as const

export const sc12CommercialCopy: Record<SiteLanguage, {
  hook: string
  problem: string
  changed: string
  utility: string
  scenarioHeadline: string
  scenarioSummary: string
  proofStatement: string
}> = {
  en: {
    hook: 'Forecast demand so inventory decisions change before stock becomes a problem.',
    problem: 'A blended forecast can hide weak accuracy exactly where purchasing and stock decisions are being made.',
    changed: 'Demand is estimated separately at 1, 3, 6 and 9 months so each decision uses the horizon that actually matters.',
    utility: 'The system makes the trade-off between availability, excess stock and working capital visible before purchasing decisions are made.',
    scenarioHeadline: '€2.0M inventory → 5% less excess → €100k released.',
    scenarioSummary: 'Forecasting creates value when it improves stock, service and cash without unnecessary complexity.',
    proofStatement: 'Public implementation, open technical proof and decision-focused validation.',
  },
  es: {
    hook: 'Predecir la demanda para cambiar la decisión de inventario antes de que el stock se convierta en un problema.',
    problem: 'Un forecast agregado puede ocultar una mala precisión justo en el horizonte donde compras e inventario toman decisiones.',
    changed: 'La demanda se estima por separado a 1, 3, 6 y 9 meses para que cada decisión use el horizonte que realmente importa.',
    utility: 'El sistema hace visible el equilibrio entre disponibilidad, exceso de stock y capital circulante antes de decidir cuánto comprar o mantener.',
    scenarioHeadline: '€2,0M de inventario → 5% menos exceso → €100k liberados.',
    scenarioSummary: 'El forecasting crea valor cuando mejora stock, servicio y caja sin añadir complejidad innecesaria.',
    proofStatement: 'Implementación pública, prueba técnica abierta y validación orientada a la decisión.',
  },
  ca: {
    hook: 'Predir la demanda per canviar la decisió d’inventari abans que l’estoc es converteixi en un problema.',
    problem: 'Un forecast agregat pot ocultar una mala precisió just a l’horitzó on compres i inventari prenen decisions.',
    changed: 'La demanda s’estima per separat a 1, 3, 6 i 9 mesos perquè cada decisió utilitzi l’horitzó que realment importa.',
    utility: 'El sistema fa visible l’equilibri entre disponibilitat, excés d’estoc i capital circulant abans de decidir quant comprar o mantenir.',
    scenarioHeadline: '€2,0M d’inventari → 5% menys excés → €100k alliberats.',
    scenarioSummary: 'El forecasting crea valor quan millora estoc, servei i caixa sense afegir complexitat innecessària.',
    proofStatement: 'Implementació pública, prova tècnica oberta i validació orientada a la decisió.',
  },
}


export const sc12CaseStudyCopy: Record<SiteLanguage, {
  back: string
  eyebrow: string
  title: string
  intro: string
  thesisLabel: string
  thesis: string
  scenarioLabel: string
  scenarioHeadline: string
  economicsNote: string
  problemLabel: string
  problemTitle: string
  problemBody: string
  problemRows: Array<{ title: string; body: string }>
  horizonLabel: string
  horizonTitle: string
  horizonBody: string
  systemLabel: string
  systemTitle: string
  systemBody: string
  systemRows: string[]
  architectureLabel: string
  architectureTitle: string
  architectureBody: string
  evidenceLabel: string
  evidenceTitle: string
  evidenceBody: string
  technicalLabel: string
  technicalTitle: string
  technicalBody: string
  technicalProof: string
  limitationsLabel: string
  limitations: string[]
  takeawayLabel: string
  takeawayTitle: string
  takeawayBody: string
  repository: string
  contact: string
}> = {
  en: {
    back: 'Project overview',
    eyebrow: 'FORECASTING · INVENTORY · SC-12',
    title: 'Better forecasts matter when they change how much stock the business holds.',
    intro: 'SC-12 separates demand forecasting by planning horizon and connects model evaluation to purchasing, service level and inventory coverage.',
    thesisLabel: 'Starting point',
    thesis: 'The case starts with a concrete operating problem: purchasing needs to decide how much stock to hold without knowing whether forecast quality remains reliable across the planning horizon. We designed the system to turn that uncertainty into a more defensible inventory decision.',
    scenarioLabel: 'Case economics',
    scenarioHeadline: '€2.0M inventory → 5% less excess → €100k released.',
    economicsNote: 'Reference economics; this figure is not attributed to a specific client.',
    problemLabel: '01 · BUSINESS PROBLEM',
    problemTitle: 'One blended forecast can hide the horizon where the decision actually fails.',
    problemBody: 'One average error can hide the exact horizon where forecast uncertainty becomes expensive for purchasing and inventory.',
    problemRows: [
      { title: 'Stock-outs', body: 'Too little stock means weaker service and lost sales.' },
      { title: 'Excess stock', body: 'Too much stock traps cash and increases obsolescence risk.' },
      { title: 'False confidence', body: 'A good average can hide the horizon that actually fails.' },
    ],
    horizonLabel: '02 · DECISION HORIZONS',
    horizonTitle: 'Evaluate the forecast at the same horizon where the business acts.',
    horizonBody: 'Forecast quality is evaluated separately at 1, 3, 6 and 9 months — the same horizons where inventory decisions change.',
    systemLabel: '03 · WHAT CHANGED',
    systemTitle: 'From one forecast score to a decision system for inventory.',
    systemBody: 'Demand signal → horizon-level evaluation → selected forecast → inventory decision.',
    systemRows: [
      'Forecast demand separately at 1, 3, 6 and 9 months.',
      'Compare every candidate against simple operational baselines.',
      'Measure absolute error and bias instead of relying on one accuracy number.',
      'Expose service level and inventory coverage next to the forecast.',
    ],
    architectureLabel: '04 · SYSTEM ARCHITECTURE',
    architectureTitle: 'A clear path from demand data to a planning decision.',
    architectureBody: 'The technical architecture stays modular, but the reader should be able to follow the business logic without understanding the model stack.',
    evidenceLabel: '05 · EVIDENCE & ECONOMICS',
    evidenceTitle: 'Measure the forecast. Translate the decision into business economics.',
    evidenceBody: 'Measure error and bias first. Then translate forecast quality into stock, service and working-capital decisions.',
    technicalLabel: '06 · TECHNICAL PROOF',
    technicalTitle: 'Review the structure, models and code behind this project.',
    technicalBody: 'Open the repository to inspect how the forecasting system is organised, validated and implemented.',
    technicalProof: 'Python · Statsmodels · Machine Learning · FastAPI · PostgreSQL · Prefect',
    limitationsLabel: 'Boundaries',
    limitations: [
      'Public data is representative rather than a production client extract.',
      'The €100k economics model is a reference calculation, not measured client impact.',
      'Production retraining and inventory policy depend on real volatility, margins and service constraints.',
    ],
    takeawayLabel: 'BUSINESS TAKEAWAY',
    takeawayTitle: 'Forecasting creates value when it changes a purchasing or inventory decision.',
    takeawayBody: 'Understand the decision first. Measure what matters. Add complexity only when it improves stock, service or cash.',
    repository: 'Open technical repository',
    contact: 'Tell us about a similar problem',
  },
  es: {
    back: 'Resumen del proyecto',
    eyebrow: 'FORECASTING · INVENTARIO · SC-12',
    title: 'Una mejor predicción importa cuando cambia cuánto stock mantiene el negocio.',
    intro: 'SC-12 separa el forecasting por horizonte de decisión y conecta la evaluación del modelo con compras, nivel de servicio y cobertura de inventario.',
    thesisLabel: 'Punto de partida',
    thesis: 'El caso parte de un problema operativo concreto: compras necesita decidir cuánto stock mantener sin saber si la calidad del forecast se sostiene a lo largo del horizonte de planificación. Diseñamos el sistema para convertir esa incertidumbre en una decisión de inventario más defendible.',
    scenarioLabel: 'Economía del caso',
    scenarioHeadline: '€2,0M de inventario → 5% menos exceso → €100k liberados.',
    economicsNote: 'Modelo económico de referencia; esta cifra no se atribuye a un cliente concreto.',
    problemLabel: '01 · PROBLEMA DE NEGOCIO',
    problemTitle: 'Un forecast agregado puede ocultar el horizonte donde la decisión realmente falla.',
    problemBody: 'Un único error medio puede ocultar justo el horizonte donde la incertidumbre del forecast se vuelve cara para compras e inventario.',
    problemRows: [
      { title: 'Roturas de stock', body: 'Menos stock del necesario: peor servicio y ventas perdidas.' },
      { title: 'Exceso de stock', body: 'Más stock del necesario: caja inmovilizada y riesgo de obsolescencia.' },
      { title: 'Confianza equivocada', body: 'Un buen promedio puede ocultar el horizonte que realmente falla.' },
    ],
    horizonLabel: '02 · HORIZONTES DE DECISIÓN',
    horizonTitle: 'Evaluar el forecast en el mismo horizonte en el que actúa el negocio.',
    horizonBody: 'La calidad del forecast se evalúa por separado a 1, 3, 6 y 9 meses: los mismos horizontes donde cambia la decisión de inventario.',
    systemLabel: '03 · QUÉ CAMBIÓ',
    systemTitle: 'De un único forecast a un sistema de decisión para inventario.',
    systemBody: 'Señal de demanda → evaluación por horizonte → forecast seleccionado → decisión de inventario.',
    systemRows: [
      'Predecir la demanda por separado a 1, 3, 6 y 9 meses.',
      'Comparar cada alternativa contra baselines operativos sencillos.',
      'Medir error absoluto y sesgo en lugar de depender de una única cifra de precisión.',
      'Mostrar nivel de servicio y cobertura junto al forecast.',
    ],
    architectureLabel: '04 · ARQUITECTURA',
    architectureTitle: 'Un camino claro desde los datos de demanda hasta una decisión de planificación.',
    architectureBody: 'La arquitectura técnica es modular, pero la lógica de negocio debe entenderse sin necesidad de conocer el stack de modelos.',
    evidenceLabel: '05 · EVIDENCIA Y ECONOMÍA',
    evidenceTitle: 'Medir el forecast y traducir la decisión a economía de negocio.',
    evidenceBody: 'Primero medimos error y sesgo. Después traducimos la calidad del forecast a decisiones de stock, servicio y capital circulante.',
    technicalLabel: '06 · PRUEBA TÉCNICA',
    technicalTitle: 'Revisa la estructura, los modelos y el código detrás de este proyecto.',
    technicalBody: 'Abre el repositorio para ver cómo está organizado, validado e implementado el sistema de forecasting.',
    technicalProof: 'Python · Statsmodels · Machine Learning · FastAPI · PostgreSQL · Prefect',
    limitationsLabel: 'Límites',
    limitations: [
      'Los datos públicos son representativos y no una extracción de producción de un cliente.',
      'El modelo económico de €100k es un cálculo de referencia, no impacto medido de cliente.',
      'La frecuencia de reentrenamiento y la política de inventario dependen de volatilidad, márgenes y objetivos de servicio reales.',
    ],
    takeawayLabel: 'CONCLUSIÓN DE NEGOCIO',
    takeawayTitle: 'El forecasting crea valor cuando cambia una decisión de compra o inventario.',
    takeawayBody: 'Comprender la decisión primero. Medir lo que importa. Añadir complejidad solo cuando mejora stock, servicio o caja.',
    repository: 'Abrir repositorio técnico',
    contact: 'Háblanos de un problema similar',
  },
  ca: {
    back: 'Resum del projecte',
    eyebrow: 'FORECASTING · INVENTARI · SC-12',
    title: 'Una millor predicció importa quan canvia quant estoc manté el negoci.',
    intro: 'SC-12 separa el forecasting per horitzó de decisió i connecta l’avaluació del model amb compres, nivell de servei i cobertura d’inventari.',
    thesisLabel: 'Punt de partida',
    thesis: 'El cas parteix d’un problema operatiu concret: compres necessita decidir quant estoc mantenir sense saber si la qualitat del forecast es manté al llarg de l’horitzó de planificació. Vam dissenyar el sistema per convertir aquesta incertesa en una decisió d’inventari més defensable.',
    scenarioLabel: 'Economia del cas',
    scenarioHeadline: '€2,0M d’inventari → 5% menys excés → €100k alliberats.',
    economicsNote: 'Model econòmic de referència; aquesta xifra no s’atribueix a un client concret.',
    problemLabel: '01 · PROBLEMA DE NEGOCI',
    problemTitle: 'Un forecast agregat pot ocultar l’horitzó on la decisió realment falla.',
    problemBody: 'Un únic error mitjà pot ocultar just l’horitzó on la incertesa del forecast es torna cara per a compres i inventari.',
    problemRows: [
      { title: 'Ruptures d’estoc', body: 'Menys estoc del necessari: pitjor servei i vendes perdudes.' },
      { title: 'Excés d’estoc', body: 'Més estoc del necessari: caixa immobilitzada i risc d’obsolescència.' },
      { title: 'Confiança equivocada', body: 'Un bon promig pot ocultar l’horitzó que realment falla.' },
    ],
    horizonLabel: '02 · HORITZONS DE DECISIÓ',
    horizonTitle: 'Avaluar el forecast al mateix horitzó en què actua el negoci.',
    horizonBody: 'La qualitat del forecast s’avalua per separat a 1, 3, 6 i 9 mesos: els mateixos horitzons on canvia la decisió d’inventari.',
    systemLabel: '03 · QUÈ VA CANVIAR',
    systemTitle: 'D’un únic forecast a un sistema de decisió per a inventari.',
    systemBody: 'Senyal de demanda → avaluació per horitzó → forecast seleccionat → decisió d’inventari.',
    systemRows: [
      'Predir la demanda per separat a 1, 3, 6 i 9 mesos.',
      'Comparar cada alternativa contra baselines operatius senzills.',
      'Mesurar error absolut i biaix en lloc de dependre d’una única xifra de precisió.',
      'Mostrar nivell de servei i cobertura al costat del forecast.',
    ],
    architectureLabel: '04 · ARQUITECTURA',
    architectureTitle: 'Un camí clar des de les dades de demanda fins a una decisió de planificació.',
    architectureBody: 'L’arquitectura tècnica és modular, però la lògica de negoci s’ha d’entendre sense necessitat de conèixer l’stack de models.',
    evidenceLabel: '05 · EVIDÈNCIA I ECONOMIA',
    evidenceTitle: 'Mesurar el forecast i traduir la decisió a economia de negoci.',
    evidenceBody: 'Primer mesurem error i biaix. Després traduïm la qualitat del forecast a decisions d’estoc, servei i capital circulant.',
    technicalLabel: '06 · PROVA TÈCNICA',
    technicalTitle: 'Revisa l’estructura, els models i el codi darrere d’aquest projecte.',
    technicalBody: 'Obre el repositori per veure com està organitzat, validat i implementat el sistema de forecasting.',
    technicalProof: 'Python · Statsmodels · Machine Learning · FastAPI · PostgreSQL · Prefect',
    limitationsLabel: 'Límits',
    limitations: [
      'Les dades públiques són representatives i no una extracció de producció d’un client.',
      'El model econòmic de €100k és un càlcul de referència, no impacte mesurat de client.',
      'La freqüència de reentrenament i la política d’inventari depenen de volatilitat, marges i objectius de servei reals.',
    ],
    takeawayLabel: 'CONCLUSIÓ DE NEGOCI',
    takeawayTitle: 'El forecasting crea valor quan canvia una decisió de compra o inventari.',
    takeawayBody: 'Comprendre la decisió primer. Mesurar el que importa. Afegir complexitat només quan millora estoc, servei o caixa.',
    repository: 'Obrir repositori tècnic',
    contact: 'Parla’ns d’un problema similar',
  },
}


export const sc12BusinessOutcomeMetrics: Record<SiteLanguage, Array<{ value: string; label: string; note: string }>> = {
  en: [
    { value: '€2.0M', label: 'Inventory base', note: 'Reference operating base.' },
    { value: '5%', label: 'Excess stock reduction', note: 'Assumed reduction in excess inventory.' },
    { value: '€100k', label: 'Working capital released', note: '€2.0M × 5%; reference arithmetic.' },
  ],
  es: [
    { value: '€2,0M', label: 'Base de inventario', note: 'Base operativa de referencia.' },
    { value: '5%', label: 'Reducción de exceso', note: 'Reducción asumida del exceso de inventario.' },
    { value: '€100k', label: 'Capital liberado', note: '€2,0M × 5%; cálculo de referencia.' },
  ],
  ca: [
    { value: '€2,0M', label: 'Base d’inventari', note: 'Base operativa de referència.' },
    { value: '5%', label: 'Reducció d’excés', note: 'Reducció assumida de l’excés d’inventari.' },
    { value: '€100k', label: 'Capital alliberat', note: '€2,0M × 5%; càlcul de referència.' },
  ],
}
