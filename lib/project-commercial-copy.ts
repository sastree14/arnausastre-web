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
