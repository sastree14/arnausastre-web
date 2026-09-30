import type { SiteLanguage } from '@/lib/public-copy'

export const projectOverviewUi = {
  en: {
    back: 'All cases',
    caseStudy: 'Read the full case',
    repository: 'Technical repository',
    contact: 'Discuss a similar problem',
    snapshot: 'The case in 30 seconds',
    problem: 'Business problem',
    changed: 'What changed',
    utility: 'Business utility',
    evidence: 'Evidence & provenance',
    publicImplementation: 'Public portfolio implementation',
    context: 'What this system is for',
    scenario: 'Illustrative economics',
    scenarioNote: 'Business scenario — not a measured client result',
  },
  es: {
    back: 'Todos los casos',
    caseStudy: 'Ver el caso completo',
    repository: 'Repositorio técnico',
    contact: 'Hablar de un problema similar',
    snapshot: 'El caso en 30 segundos',
    problem: 'Problema de negocio',
    changed: 'Qué cambió',
    utility: 'Utilidad para el negocio',
    evidence: 'Evidencia y procedencia',
    publicImplementation: 'Implementación pública de portfolio',
    context: 'Para qué sirve este sistema',
    scenario: 'Economía del caso',
    scenarioNote: 'Escenario ilustrativo — no es un resultado medido de cliente',
  },
  ca: {
    back: 'Tots els casos',
    caseStudy: 'Veure el cas complet',
    repository: 'Repositori tècnic',
    contact: 'Parlar d’un problema similar',
    snapshot: 'El cas en 30 segons',
    problem: 'Problema de negoci',
    changed: 'Què va canviar',
    utility: 'Utilitat per al negoci',
    evidence: 'Evidència i procedència',
    publicImplementation: 'Implementació pública de portfolio',
    context: 'Per a què serveix aquest sistema',
    scenario: 'Economia del cas',
    scenarioNote: 'Escenari il·lustratiu — no és un resultat mesurat de client',
  },
} as const

export const sc12CommercialCopy: Record<SiteLanguage, {
  hook: string
  problem: string
  changed: string
  utility: string
  scenarioHeadline: string
  scenarioSummary: string
}> = {
  en: {
    hook: 'Forecast demand so inventory decisions change before stock becomes a problem.',
    problem: 'A blended forecast can hide weak accuracy exactly where purchasing and stock decisions are being made.',
    changed: 'Demand is estimated separately at 1, 3, 6 and 9 days so each decision uses the horizon that actually matters.',
    utility: 'The system makes the trade-off between availability, excess stock and working capital visible before purchasing decisions are made.',
    scenarioHeadline: 'A small inventory improvement can release material cash.',
    scenarioSummary: 'If a €2.0M inventory position can be reduced by 5% without damaging service, €100k of working capital is released. This is illustrative arithmetic, not a claimed client result.',
  },
  es: {
    hook: 'Predecir la demanda para cambiar la decisión de inventario antes de que el stock se convierta en un problema.',
    problem: 'Un forecast agregado puede ocultar una mala precisión justo en el horizonte donde compras e inventario toman decisiones.',
    changed: 'La demanda se estima por separado a 1, 3, 6 y 9 días para que cada decisión use el horizonte que realmente importa.',
    utility: 'El sistema hace visible el equilibrio entre disponibilidad, exceso de stock y capital circulante antes de decidir cuánto comprar o mantener.',
    scenarioHeadline: 'Una pequeña mejora de inventario puede liberar una cantidad material de caja.',
    scenarioSummary: 'Si una posición de inventario de €2,0M puede reducirse un 5% sin deteriorar el servicio, se liberan €100k de capital circulante. Es aritmética ilustrativa, no un resultado atribuido a un cliente.',
  },
  ca: {
    hook: 'Predir la demanda per canviar la decisió d’inventari abans que l’estoc es converteixi en un problema.',
    problem: 'Un forecast agregat pot ocultar una mala precisió just a l’horitzó on compres i inventari prenen decisions.',
    changed: 'La demanda s’estima per separat a 1, 3, 6 i 9 dies perquè cada decisió utilitzi l’horitzó que realment importa.',
    utility: 'El sistema fa visible l’equilibri entre disponibilitat, excés d’estoc i capital circulant abans de decidir quant comprar o mantenir.',
    scenarioHeadline: 'Una petita millora d’inventari pot alliberar una quantitat material de caixa.',
    scenarioSummary: 'Si una posició d’inventari de €2,0M es pot reduir un 5% sense deteriorar el servei, s’alliberen €100k de capital circulant. És aritmètica il·lustrativa, no un resultat atribuït a un client.',
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
    thesisLabel: 'Business thesis',
    thesis: 'The objective is not to maximise model complexity. It is to make the inventory decision better before cash is tied up in the wrong stock.',
    scenarioLabel: 'Illustrative economics',
    scenarioHeadline: '€2.0M inventory × 5% less excess stock = €100k of working capital released.',
    problemLabel: '01 · BUSINESS PROBLEM',
    problemTitle: 'One blended forecast can hide the horizon where the decision actually fails.',
    problemBody: 'Purchasing teams make different decisions for tomorrow, next week and the longer planning horizon. A single average error can conceal the exact point where uncertainty becomes operationally expensive.',
    problemRows: [
      { title: 'Stock-outs', body: 'Too little inventory can turn forecast error into lost service and missed sales.' },
      { title: 'Excess stock', body: 'Too much inventory traps cash and creates markdown or obsolescence risk.' },
      { title: 'Wrong confidence', body: 'A strong aggregate score can hide weak performance at the horizon that matters for purchasing.' },
    ],
    horizonLabel: '02 · DECISION HORIZONS',
    horizonTitle: 'Evaluate the forecast at the same horizon where the business acts.',
    horizonBody: 'The public implementation separates H1, H3, H6 and H9 so forecast quality can be read against the timing of the inventory decision.',
    systemLabel: '03 · WHAT CHANGED',
    systemTitle: 'From one forecast score to a decision system for inventory.',
    systemBody: 'The system keeps the business chain explicit: demand signal → horizon-level evaluation → selected forecast → inventory-oriented decision metrics.',
    systemRows: [
      'Forecast daily demand separately at 1, 3, 6 and 9 days.',
      'Compare every candidate against simple operational baselines.',
      'Measure absolute error and bias instead of relying on one accuracy number.',
      'Expose service level and inventory coverage next to the forecast.',
    ],
    architectureLabel: '04 · SYSTEM ARCHITECTURE',
    architectureTitle: 'A clear path from demand data to a planning decision.',
    architectureBody: 'The technical architecture stays modular, but the reader should be able to follow the business logic without understanding the model stack.',
    evidenceLabel: '05 · EVIDENCE & ECONOMICS',
    evidenceTitle: 'Measure the forecast. Translate the decision into business economics.',
    evidenceBody: 'WAPE, MAE and bias describe forecasting behaviour. Service level and inventory coverage connect that behaviour to the operating decision. When client impact is not measured, commercial value is shown only through explicitly illustrative scenarios.',
    technicalLabel: '06 · TECHNICAL PROOF',
    technicalTitle: 'Enough technical depth to verify the work — without making the case study a code review.',
    technicalBody: 'The public repository contains the implementation path, architecture, validation notes, limitations and reproducible example evidence.',
    technicalProof: 'Python · Statsmodels · XGBoost · LightGBM · FastAPI · PostgreSQL · Prefect',
    limitationsLabel: 'Boundaries',
    limitations: [
      'Public data is representative rather than a production client extract.',
      'The €100k economics example is illustrative arithmetic, not measured client impact.',
      'Production retraining and inventory policy depend on real volatility, margins and service constraints.',
    ],
    takeawayLabel: 'BUSINESS TAKEAWAY',
    takeawayTitle: 'Forecasting creates value when it changes a purchasing or inventory decision.',
    takeawayBody: 'The useful system is not the most sophisticated model. It is the one that makes uncertainty visible early enough to improve stock, service and cash decisions.',
    repository: 'Open technical repository',
    contact: 'Discuss a similar problem',
  },
  es: {
    back: 'Resumen del proyecto',
    eyebrow: 'FORECASTING · INVENTARIO · SC-12',
    title: 'Una mejor predicción importa cuando cambia cuánto stock mantiene el negocio.',
    intro: 'SC-12 separa el forecasting por horizonte de decisión y conecta la evaluación del modelo con compras, nivel de servicio y cobertura de inventario.',
    thesisLabel: 'Tesis de negocio',
    thesis: 'El objetivo no es maximizar la complejidad del modelo. Es mejorar la decisión de inventario antes de inmovilizar caja en el stock equivocado.',
    scenarioLabel: 'Economía ilustrativa',
    scenarioHeadline: '€2,0M de inventario × 5% menos exceso de stock = €100k de capital circulante liberado.',
    problemLabel: '01 · PROBLEMA DE NEGOCIO',
    problemTitle: 'Un forecast agregado puede ocultar el horizonte donde la decisión realmente falla.',
    problemBody: 'Compras toma decisiones distintas para mañana, la próxima semana y horizontes más largos. Un único error medio puede esconder justo el punto donde la incertidumbre se vuelve cara para la operación.',
    problemRows: [
      { title: 'Roturas de stock', body: 'Demasiado poco inventario convierte el error de previsión en pérdida de servicio y ventas.' },
      { title: 'Exceso de stock', body: 'Demasiado inventario inmoviliza caja y aumenta el riesgo de descuento u obsolescencia.' },
      { title: 'Confianza equivocada', body: 'Un buen resultado agregado puede esconder un rendimiento débil en el horizonte que importa para comprar.' },
    ],
    horizonLabel: '02 · HORIZONTES DE DECISIÓN',
    horizonTitle: 'Evaluar el forecast en el mismo horizonte en el que actúa el negocio.',
    horizonBody: 'La implementación separa H1, H3, H6 y H9 para leer la calidad del forecast contra el momento real de la decisión de inventario.',
    systemLabel: '03 · QUÉ CAMBIÓ',
    systemTitle: 'De un único forecast a un sistema de decisión para inventario.',
    systemBody: 'La cadena queda explícita: señal de demanda → evaluación por horizonte → forecast seleccionado → indicadores orientados a inventario.',
    systemRows: [
      'Predecir demanda diaria por separado a 1, 3, 6 y 9 días.',
      'Comparar cada alternativa contra baselines operativos sencillos.',
      'Medir error absoluto y sesgo en lugar de depender de una única cifra de precisión.',
      'Mostrar nivel de servicio y cobertura junto al forecast.',
    ],
    architectureLabel: '04 · ARQUITECTURA',
    architectureTitle: 'Un camino claro desde los datos de demanda hasta una decisión de planificación.',
    architectureBody: 'La arquitectura técnica es modular, pero la lógica de negocio debe entenderse sin necesidad de conocer el stack de modelos.',
    evidenceLabel: '05 · EVIDENCIA Y ECONOMÍA',
    evidenceTitle: 'Medir el forecast y traducir la decisión a economía de negocio.',
    evidenceBody: 'WAPE, MAE y bias describen el comportamiento del forecast. Nivel de servicio y cobertura lo conectan con la operación. Cuando no existe impacto de cliente medido, el valor comercial se muestra únicamente con escenarios ilustrativos claramente identificados.',
    technicalLabel: '06 · PRUEBA TÉCNICA',
    technicalTitle: 'Profundidad suficiente para verificar el trabajo, sin convertir el caso en una revisión de código.',
    technicalBody: 'El repositorio público contiene la implementación, arquitectura, validación, limitaciones y evidencia reproducible del ejemplo.',
    technicalProof: 'Python · Statsmodels · XGBoost · LightGBM · FastAPI · PostgreSQL · Prefect',
    limitationsLabel: 'Límites',
    limitations: [
      'Los datos públicos son representativos y no una extracción de producción de un cliente.',
      'El ejemplo de €100k es aritmética ilustrativa, no impacto medido de cliente.',
      'La frecuencia de reentrenamiento y la política de inventario dependen de volatilidad, márgenes y objetivos de servicio reales.',
    ],
    takeawayLabel: 'CONCLUSIÓN DE NEGOCIO',
    takeawayTitle: 'El forecasting crea valor cuando cambia una decisión de compra o inventario.',
    takeawayBody: 'El sistema útil no es el modelo más sofisticado. Es el que hace visible la incertidumbre con suficiente antelación para mejorar decisiones de stock, servicio y caja.',
    repository: 'Abrir repositorio técnico',
    contact: 'Hablar de un problema similar',
  },
  ca: {
    back: 'Resum del projecte',
    eyebrow: 'FORECASTING · INVENTARI · SC-12',
    title: 'Una millor predicció importa quan canvia quant estoc manté el negoci.',
    intro: 'SC-12 separa el forecasting per horitzó de decisió i connecta l’avaluació del model amb compres, nivell de servei i cobertura d’inventari.',
    thesisLabel: 'Tesi de negoci',
    thesis: 'L’objectiu no és maximitzar la complexitat del model. És millorar la decisió d’inventari abans d’immobilitzar caixa en l’estoc equivocat.',
    scenarioLabel: 'Economia il·lustrativa',
    scenarioHeadline: '€2,0M d’inventari × 5% menys excés d’estoc = €100k de capital circulant alliberat.',
    problemLabel: '01 · PROBLEMA DE NEGOCI',
    problemTitle: 'Un forecast agregat pot ocultar l’horitzó on la decisió realment falla.',
    problemBody: 'Compres pren decisions diferents per demà, la setmana vinent i horitzons més llargs. Un únic error mitjà pot amagar just el punt on la incertesa es torna cara per a l’operació.',
    problemRows: [
      { title: 'Ruptures d’estoc', body: 'Massa poc inventari converteix l’error de previsió en pèrdua de servei i vendes.' },
      { title: 'Excés d’estoc', body: 'Massa inventari immobilitza caixa i augmenta el risc de descompte o obsolescència.' },
      { title: 'Confiança equivocada', body: 'Un bon resultat agregat pot amagar un rendiment dèbil a l’horitzó que importa per comprar.' },
    ],
    horizonLabel: '02 · HORITZONS DE DECISIÓ',
    horizonTitle: 'Avaluar el forecast al mateix horitzó en què actua el negoci.',
    horizonBody: 'La implementació separa H1, H3, H6 i H9 per llegir la qualitat del forecast contra el moment real de la decisió d’inventari.',
    systemLabel: '03 · QUÈ VA CANVIAR',
    systemTitle: 'D’un únic forecast a un sistema de decisió per a inventari.',
    systemBody: 'La cadena queda explícita: senyal de demanda → avaluació per horitzó → forecast seleccionat → indicadors orientats a inventari.',
    systemRows: [
      'Predir demanda diària per separat a 1, 3, 6 i 9 dies.',
      'Comparar cada alternativa contra baselines operatius senzills.',
      'Mesurar error absolut i biaix en lloc de dependre d’una única xifra de precisió.',
      'Mostrar nivell de servei i cobertura al costat del forecast.',
    ],
    architectureLabel: '04 · ARQUITECTURA',
    architectureTitle: 'Un camí clar des de les dades de demanda fins a una decisió de planificació.',
    architectureBody: 'L’arquitectura tècnica és modular, però la lògica de negoci s’ha d’entendre sense necessitat de conèixer l’stack de models.',
    evidenceLabel: '05 · EVIDÈNCIA I ECONOMIA',
    evidenceTitle: 'Mesurar el forecast i traduir la decisió a economia de negoci.',
    evidenceBody: 'WAPE, MAE i bias descriuen el comportament del forecast. Nivell de servei i cobertura el connecten amb l’operació. Quan no existeix impacte de client mesurat, el valor comercial es mostra només amb escenaris il·lustratius clarament identificats.',
    technicalLabel: '06 · PROVA TÈCNICA',
    technicalTitle: 'Profunditat suficient per verificar la feina, sense convertir el cas en una revisió de codi.',
    technicalBody: 'El repositori públic conté la implementació, arquitectura, validació, limitacions i evidència reproduïble de l’exemple.',
    technicalProof: 'Python · Statsmodels · XGBoost · LightGBM · FastAPI · PostgreSQL · Prefect',
    limitationsLabel: 'Límits',
    limitations: [
      'Les dades públiques són representatives i no una extracció de producció d’un client.',
      'L’exemple de €100k és aritmètica il·lustrativa, no impacte mesurat de client.',
      'La freqüència de reentrenament i la política d’inventari depenen de volatilitat, marges i objectius de servei reals.',
    ],
    takeawayLabel: 'CONCLUSIÓ DE NEGOCI',
    takeawayTitle: 'El forecasting crea valor quan canvia una decisió de compra o inventari.',
    takeawayBody: 'El sistema útil no és el model més sofisticat. És el que fa visible la incertesa amb prou antelació per millorar decisions d’estoc, servei i caixa.',
    repository: 'Obrir repositori tècnic',
    contact: 'Parlar d’un problema similar',
  },
}
