import type { SiteLanguage } from '@/lib/public-copy'
import type { Project } from '@/lib/projects'
import { getPortfolioCaseProfile, localizePortfolioCase } from '@/lib/portfolio-case-registry'

type LocalizedProject = { headline: string; description: string; industry: string; challenge: string }

const localized: Record<string, Partial<Record<'es'|'ca', LocalizedProject>>> = {
  'ecommerce-demand-forecasting': {
    es: {
      headline: 'Forecasting de demanda para decidir cuánto comprar y cuánto stock mantener',
      description: 'Sistema multi-horizonte a 1, 3, 6 y 9 meses para separar la calidad del forecast por horizonte y convertirla en mejores decisiones de compra, cobertura y nivel de servicio.',
      industry: 'E-commerce', challenge: 'Forecasting',
    },
    ca: {
      headline: 'Forecasting de demanda per decidir quant comprar i quant estoc mantenir',
      description: 'Sistema multi-horitzó a 1, 3, 6 i 9 mesos per separar la qualitat del forecast per horitzó i convertir-la en millors decisions de compra, cobertura i nivell de servei.',
      industry: 'E-commerce', challenge: 'Forecasting',
    },
  },
  'banking-risk-decision-system': {
    es: {
      headline: 'Sistema de decisión para riesgo de crédito',
      description: 'Sistema analítico para evaluar riesgo de crédito al consumo, mejorar la consistencia de las decisiones, reducir revisión manual y reforzar detección de fraude mediante scoring y lógica de decisión estructurada.',
      industry: 'Servicios financieros', challenge: 'Detección de fraude',
    },
    ca: {
      headline: 'Sistema de decisió per a risc de crèdit',
      description: 'Sistema analític per avaluar risc de crèdit al consum, millorar la consistència de les decisions, reduir revisió manual i reforçar detecció de frau mitjançant scoring i lògica de decisió estructurada.',
      industry: 'Serveis financers', challenge: 'Detecció de frau',
    },
  },
  'investment-analytics-platform': {
    es: {
      headline: 'Plataforma de analytics y gestión del rendimiento de inversiones',
      description: 'Plataforma centralizada para seguir relaciones con clientes, rendimiento de inversiones, actividad de proveedores y rentabilidad, con una visión consistente y actualizada del negocio.',
      industry: 'Servicios financieros', challenge: 'Gestión del rendimiento',
    },
    ca: {
      headline: 'Plataforma d’analytics i gestió del rendiment d’inversions',
      description: 'Plataforma centralitzada per seguir relacions amb clients, rendiment d’inversions, activitat de proveïdors i rendibilitat, amb una visió consistent i actualitzada del negoci.',
      industry: 'Serveis financers', challenge: 'Gestió del rendiment',
    },
  },
  'quantitative-trading-framework': {
    es: {
      headline: 'Framework cuantitativo de trading multi-estrategia',
      description: 'Arquitectura unificada que combina estrategias clásicas, machine learning, deep learning y reinforcement learning con optimización de cartera, procesamiento de señales y control de ejecución.',
      industry: 'Servicios financieros', challenge: 'Sistemas de decisión',
    },
    ca: {
      headline: 'Framework quantitatiu de trading multi-estratègia',
      description: 'Arquitectura unificada que combina estratègies clàssiques, machine learning, deep learning i reinforcement learning amb optimització de cartera, processament de senyals i control d’execució.',
      industry: 'Serveis financers', challenge: 'Sistemes de decisió',
    },
  },
  'ai-accounting-agents': {
    es: { headline:'Agentes contables con Claude para operaciones financieras', description:'Workflow controlado con Claude que convierte facturas, evidencia bancaria, email y reglas financieras en acciones estructuradas manteniendo aprobación humana, trazabilidad y conciliación.', industry:'Operaciones financieras', challenge:'Automatización' },
    ca: { headline:'Agents comptables amb Claude per a operacions financeres', description:'Workflow controlat amb Claude que converteix factures, evidència bancària, email i regles financeres en accions estructurades mantenint aprovació humana, traçabilitat i conciliació.', industry:'Operacions financeres', challenge:'Automatització' },
  },
  'business-operating-crm': {
    es: { headline:'CRM y sistema operativo empresarial integrado', description:'Sistema integrado que conecta actividad comercial, editorial, finanzas, delivery, métricas web y automatización para gestionar el crecimiento desde una única fuente de verdad.', industry:'Servicios profesionales', challenge:'Sistemas de decisión' },
    ca: { headline:'CRM i sistema operatiu empresarial integrat', description:'Sistema integrat que connecta activitat comercial, editorial, finances, delivery, mètriques web i automatització per gestionar el creixement des d’una única font de veritat.', industry:'Serveis professionals', challenge:'Sistemes de decisió' },
  },
  'erp-operations-control': {
    es: { headline:'ERP y capa de control operativo para una empresa en crecimiento', description:'Arquitectura modular tipo ERP para conectar pedidos, proveedores, inventario, clientes, finanzas y reporting sin obligar a sustituir todas las herramientas existentes.', industry:'Operaciones', challenge:'Operaciones' },
    ca: { headline:'ERP i capa de control operatiu per a una empresa en creixement', description:'Arquitectura modular tipus ERP per connectar comandes, proveïdors, inventari, clients, finances i reporting sense obligar a substituir totes les eines existents.', industry:'Operacions', challenge:'Operacions' },
  },
  'reinforcement-learning-decision-system': {
    es: { headline:'Reinforcement learning para decisiones secuenciales', description:'Framework de decisión para problemas donde la acción de hoy modifica el estado de mañana, combinando simulación, restricciones y evaluación offline antes de acercar una política a operaciones reales.', industry:'Ciencia de decisiones', challenge:'Sistemas de decisión' },
    ca: { headline:'Reinforcement learning per a decisions seqüencials', description:'Framework de decisió per a problemes on l’acció d’avui modifica l’estat de demà, combinant simulació, restriccions i avaluació offline abans d’apropar una política a operacions reals.', industry:'Ciència de decisions', challenge:'Sistemes de decisió' },
  },
  'r-shiny-decision-app': {
    es: { headline:'Aplicación R Shiny para apoyo a la decisión', description:'Aplicación interactiva que convierte análisis estadístico, simulación y lógica de negocio en una herramienta utilizable directamente por equipos no técnicos.', industry:'Business Analytics', challenge:'Business Intelligence' },
    ca: { headline:'Aplicació R Shiny per al suport a la decisió', description:'Aplicació interactiva que converteix anàlisi estadística, simulació i lògica de negoci en una eina utilitzable directament per equips no tècnics.', industry:'Business Analytics', challenge:'Business Intelligence' },
  },
  'ai-knowledge-workflow': {
    es: { headline:'Workflow de documentos y conocimiento con IA', description:'Sistema controlado para convertir documentos, email y conocimiento interno en research, borradores y acciones estructuradas manteniendo fuentes, aprobaciones y trazabilidad.', industry:'Servicios profesionales', challenge:'Automatización' },
    ca: { headline:'Workflow de documents i coneixement amb IA', description:'Sistema controlat per convertir documents, email i coneixement intern en research, esborranys i accions estructurades mantenint fonts, aprovacions i traçabilitat.', industry:'Serveis professionals', challenge:'Automatització' },
  },
}

export function publicProject(project: Project, lang: SiteLanguage) {
  const profile = getPortfolioCaseProfile(project.slug)
  if (profile) {
    const local = localizePortfolioCase(profile, lang)
    return {
      ...project,
      headline: local.title,
      description: local.summary,
      industry: local.industry,
      challenge: local.challenge,
      sourceLanguage: 'en' as const,
    }
  }

  if (lang === 'en') return { ...project, sourceLanguage: 'en' as const }
  const local = localized[project.slug]?.[lang]
  return {
    ...project,
    headline: local?.headline || project.headline,
    description: local?.description || project.description,
    industry: local?.industry || project.industry,
    challenge: local?.challenge || project.challenge,
    sourceLanguage: 'en' as const,
  }
}

export const projectUi = {
  en: {
    label: 'SUCCESS STORIES', title: 'Problems, systems and decisions.', sub: 'Selected work across forecasting, optimisation, AI, automation, risk and decision systems. Start with the case closest to the problem you are trying to solve.',
    back: '← All success stories', sourceNote: 'The public success story is localized here; technical repository evidence may remain in English when that is the implementation language.',
    detailCta: 'Have a similar decision or process to improve?', detailCtaSub: 'We can start by understanding the operating problem and decide whether an analytical system is justified.', contact: 'Discuss the problem',
  },
  es: {
    label: 'CASOS DE ÉXITO', title: 'Problemas, sistemas y decisiones.', sub: 'Una selección de trabajos de forecasting, optimización, IA, automatización, riesgo y sistemas de decisión. Empieza por el caso que más se parece al problema que quieres resolver.',
    back: '← Todos los casos de éxito', sourceNote: 'El caso de éxito público está localizado aquí; la evidencia del repositorio técnico puede mantenerse en inglés cuando sea el idioma de implementación.',
    detailCta: '¿Tienes una decisión o proceso parecido que mejorar?', detailCtaSub: 'Podemos empezar por comprender el problema operativo y decidir si un sistema analítico está justificado.', contact: 'Hablar del problema',
  },
  ca: {
    label: 'CASOS D’ÈXIT', title: 'Problemes, sistemes i decisions.', sub: 'Una selecció de treballs de forecasting, optimització, IA, automatització, risc i sistemes de decisió. Comença pel cas que més s’assembla al problema que vols resoldre.',
    back: '← Tots els casos d’èxit', sourceNote: 'El cas d’èxit públic està localitzat aquí; l’evidència del repositori tècnic es pot mantenir en anglès quan sigui l’idioma d’implementació.',
    detailCta: 'Tens una decisió o procés semblant que cal millorar?', detailCtaSub: 'Podem començar per comprendre el problema operatiu i decidir si un sistema analític està justificat.', contact: 'Parlar del problema',
  },
} as const


const caseIndexTitles: Record<SiteLanguage, Record<string, string>> = {
  es: {
    'ai-accounting-agents': 'Agentes de IA para operaciones contables',
    'ai-knowledge-workflow': 'Automatización documental y knowledge workflows con IA',
    'banking-risk-decision-system': 'Scoring y riesgo de crédito',
    'business-operating-crm': 'CRM operativo y control comercial',
    'ecommerce-demand-forecasting': 'Forecasting y planificación de inventario',
    'erp-operations-control': 'ERP y control operativo',
    'investment-analytics-platform': 'Modelización financiera y analytics de inversión',
    'quantitative-trading-framework': 'Sistemas cuantitativos de trading',
    'reinforcement-learning-decision-system': 'Optimización secuencial con reinforcement learning',
    'r-shiny-decision-app': 'Aplicaciones analíticas y de decisión con R Shiny',
  },
  ca: {
    'ai-accounting-agents': 'Agents d’IA per a operacions comptables',
    'ai-knowledge-workflow': 'Automatització documental i knowledge workflows amb IA',
    'banking-risk-decision-system': 'Scoring i risc de crèdit',
    'business-operating-crm': 'CRM operatiu i control comercial',
    'ecommerce-demand-forecasting': 'Forecasting i planificació d’inventari',
    'erp-operations-control': 'ERP i control operatiu',
    'investment-analytics-platform': 'Modelització financera i analytics d’inversió',
    'quantitative-trading-framework': 'Sistemes quantitatius de trading',
    'reinforcement-learning-decision-system': 'Optimització seqüencial amb reinforcement learning',
    'r-shiny-decision-app': 'Aplicacions analítiques i de decisió amb R Shiny',
  },
  en: {
    'ai-accounting-agents': 'AI agents for accounting operations',
    'ai-knowledge-workflow': 'Document automation and AI knowledge workflows',
    'banking-risk-decision-system': 'Credit scoring and risk',
    'business-operating-crm': 'Operational CRM and commercial control',
    'ecommerce-demand-forecasting': 'Demand forecasting and inventory planning',
    'erp-operations-control': 'ERP and operational control',
    'investment-analytics-platform': 'Financial modelling and investment analytics',
    'quantitative-trading-framework': 'Quantitative trading systems',
    'reinforcement-learning-decision-system': 'Sequential optimisation with reinforcement learning',
    'r-shiny-decision-app': 'Analytical and decision applications with R Shiny',
  },
}

export function projectCaseIndexTitle(project: Project, lang: SiteLanguage) {
  return caseIndexTitles[lang]?.[project.slug] || publicProject(project, lang).headline
}
