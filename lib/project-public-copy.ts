import type { SiteLanguage } from '@/lib/public-copy'
import type { Project } from '@/lib/projects'

type LocalizedProject = { headline: string; description: string; industry: string; challenge: string }

const localized: Record<string, Partial<Record<'es'|'ca', LocalizedProject>>> = {
  'ecommerce-demand-forecasting': {
    es: {
      headline: 'Sistema de forecasting de demanda y planificación de inventario',
      description: 'Sistema multi-horizonte a 30, 90, 180 y 270 días para mejorar decisiones de inventario, reducir roturas de stock y dar soporte a compras y planificación de capital circulante.',
      industry: 'E-commerce', challenge: 'Forecasting',
    },
    ca: {
      headline: 'Sistema de forecasting de demanda i planificació d’inventari',
      description: 'Sistema multi-horitzó a 30, 90, 180 i 270 dies per millorar decisions d’inventari, reduir ruptures d’estoc i donar suport a compres i planificació de capital circulant.',
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
    label: 'PROJECTS', title: 'Real systems built around real decisions.', sub: 'Selected work across forecasting, optimisation, risk, analytics and quantitative systems. Client-sensitive information is anonymised where required.',
    back: '← All projects', sourceNote: 'Detailed case documentation is currently maintained in English to preserve the original evidence record.',
    detailCta: 'Have a similar decision or process to improve?', detailCtaSub: 'We can start by understanding the operating problem and decide whether an analytical system is justified.', contact: 'Discuss the problem',
  },
  es: {
    label: 'PROYECTOS', title: 'Sistemas reales construidos alrededor de decisiones reales.', sub: 'Una selección de trabajos de forecasting, optimización, riesgo, analytics y sistemas cuantitativos. La información sensible de clientes se anonimiza cuando corresponde.',
    back: '← Todos los proyectos', sourceNote: 'La documentación detallada de estos casos históricos se mantiene actualmente en inglés para conservar el registro original de evidencia.',
    detailCta: '¿Tienes una decisión o proceso parecido que mejorar?', detailCtaSub: 'Podemos empezar por comprender el problema operativo y decidir si un sistema analítico está justificado.', contact: 'Hablar del problema',
  },
  ca: {
    label: 'PROJECTES', title: 'Sistemes reals construïts al voltant de decisions reals.', sub: 'Una selecció de treballs de forecasting, optimització, risc, analytics i sistemes quantitatius. La informació sensible de clients s’anonimitza quan correspon.',
    back: '← Tots els projectes', sourceNote: 'La documentació detallada d’aquests casos històrics es manté actualment en anglès per conservar el registre original d’evidència.',
    detailCta: 'Tens una decisió o procés semblant que cal millorar?', detailCtaSub: 'Podem començar per comprendre el problema operatiu i decidir si un sistema analític està justificat.', contact: 'Parlar del problema',
  },
} as const
