import type { SiteLanguage } from '@/lib/public-copy'
import type { Project } from '@/lib/projects'

type LocalizedProject = { headline: string; description: string; industry: string; challenge: string }

const localized: Record<string, Partial<Record<'es'|'ca', LocalizedProject>>> = {
  'ecommerce-demand-forecasting': {
    es: {
      headline: 'Forecasting de demanda para decidir cuánto comprar y cuánto stock mantener',
      description: 'Sistema multi-horizonte a 1, 3, 6 y 9 días para separar la calidad del forecast por horizonte y convertirla en mejores decisiones de compra, cobertura y nivel de servicio.',
      industry: 'E-commerce', challenge: 'Forecasting',
    },
    ca: {
      headline: 'Forecasting de demanda per decidir quant comprar i quant estoc mantenir',
      description: 'Sistema multi-horitzó a 1, 3, 6 i 9 dies per separar la qualitat del forecast per horitzó i convertir-la en millors decisions de compra, cobertura i nivell de servei.',
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
    label: 'CASE STUDIES', title: 'Problems, systems and decisions.', sub: 'Selected work across forecasting, optimisation, AI, automation, risk and decision systems. Start with the case closest to the problem you are trying to solve.',
    back: '← All projects', sourceNote: 'Detailed case documentation is currently maintained in English to preserve the original evidence record.',
    detailCta: 'Have a similar decision or process to improve?', detailCtaSub: 'We can start by understanding the operating problem and decide whether an analytical system is justified.', contact: 'Discuss the problem',
  },
  es: {
    label: 'CASOS', title: 'Problemas, sistemas y decisiones.', sub: 'Una selección de trabajos de forecasting, optimización, IA, automatización, riesgo y sistemas de decisión. Empieza por el caso que más se parece al problema que quieres resolver.',
    back: '← Todos los proyectos', sourceNote: 'La documentación detallada de estos casos históricos se mantiene actualmente en inglés para conservar el registro original de evidencia.',
    detailCta: '¿Tienes una decisión o proceso parecido que mejorar?', detailCtaSub: 'Podemos empezar por comprender el problema operativo y decidir si un sistema analítico está justificado.', contact: 'Hablar del problema',
  },
  ca: {
    label: 'CASOS', title: 'Problemes, sistemes i decisions.', sub: 'Una selecció de treballs de forecasting, optimització, IA, automatització, risc i sistemes de decisió. Comença pel cas que més s’assembla al problema que vols resoldre.',
    back: '← Tots els projectes', sourceNote: 'La documentació detallada d’aquests casos històrics es manté actualment en anglès per conservar el registre original d’evidència.',
    detailCta: 'Tens una decisió o procés semblant que cal millorar?', detailCtaSub: 'Podem començar per comprendre el problema operatiu i decidir si un sistema analític està justificat.', contact: 'Parlar del problema',
  },
} as const


const caseIndexTitles: Record<SiteLanguage, Record<string, string>> = {
  es: {
    'ai-accounting-agents': 'Automatizar operaciones contables sin perder control humano',
    'ai-knowledge-workflow': 'Convertir documentos y conocimiento interno en acciones con IA',
    'banking-risk-decision-system': 'Reducir riesgo y revisión manual en decisiones de crédito',
    'business-operating-crm': 'Centralizar ventas, operaciones y métricas en un único sistema',
    'ecommerce-demand-forecasting': 'Predecir la demanda para decidir mejor el inventario',
    'erp-operations-control': 'Controlar pedidos, proveedores, inventario y finanzas desde una sola capa',
    'investment-analytics-platform': 'Entender rentabilidad, clientes e inversiones desde una única visión',
    'quantitative-trading-framework': 'Combinar señales, riesgo y ejecución en un sistema cuantitativo',
    'reinforcement-learning-decision-system': 'Optimizar decisiones que cambian el estado del negocio con el tiempo',
    'r-shiny-decision-app': 'Convertir análisis estadístico en una herramienta que el negocio pueda usar',
  },
  ca: {
    'ai-accounting-agents': 'Automatitzar operacions comptables sense perdre control humà',
    'ai-knowledge-workflow': 'Convertir documents i coneixement intern en accions amb IA',
    'banking-risk-decision-system': 'Reduir risc i revisió manual en decisions de crèdit',
    'business-operating-crm': 'Centralitzar vendes, operacions i mètriques en un únic sistema',
    'ecommerce-demand-forecasting': 'Predir la demanda per decidir millor l’inventari',
    'erp-operations-control': 'Controlar comandes, proveïdors, inventari i finances des d’una sola capa',
    'investment-analytics-platform': 'Entendre rendibilitat, clients i inversions des d’una única visió',
    'quantitative-trading-framework': 'Combinar senyals, risc i execució en un sistema quantitatiu',
    'reinforcement-learning-decision-system': 'Optimitzar decisions que canvien l’estat del negoci amb el temps',
    'r-shiny-decision-app': 'Convertir anàlisi estadística en una eina que el negoci pugui utilitzar',
  },
  en: {
    'ai-accounting-agents': 'Automate accounting operations without losing human control',
    'ai-knowledge-workflow': 'Turn documents and internal knowledge into AI-assisted actions',
    'banking-risk-decision-system': 'Reduce risk and manual review in credit decisions',
    'business-operating-crm': 'Bring sales, operations and metrics into one operating system',
    'ecommerce-demand-forecasting': 'Forecast demand to make better inventory decisions',
    'erp-operations-control': 'Control orders, suppliers, inventory and finance from one layer',
    'investment-analytics-platform': 'Understand clients, investment performance and profitability in one view',
    'quantitative-trading-framework': 'Combine signals, risk and execution in one quantitative system',
    'reinforcement-learning-decision-system': 'Optimise decisions whose consequences evolve over time',
    'r-shiny-decision-app': 'Turn statistical analysis into a tool business teams can use',
  },
}

export function projectCaseIndexTitle(project: Project, lang: SiteLanguage) {
  return caseIndexTitles[lang]?.[project.slug] || publicProject(project, lang).headline
}
