/**
 * Public service areas: six navigation hubs, each linking ONLY to already-published
 * specialist landing pages. No replacement or redirect of existing SEO URLs.
 */
export const SERVICE_HUBS = {
  "ai": {
    "slug": "artificial-intelligence-automation",
    "capabilityIndex": 3,
    "titles": {
      "es": "Inteligencia artificial y automatización",
      "ca": "Intel·ligència artificial i automatització",
      "en": "Artificial intelligence & automation"
    },
    "intro": {
      "es": "Automatizaciones e IA para tareas concretas, conectadas con tus procesos y con supervisión humana.",
      "ca": "Automatitzacions i IA per a tasques concretes, connectades amb els teus processos i amb supervisió humana.",
      "en": "Practical AI and automation for specific workflows, integrated into your operations with human oversight."
    },
    "related": [
      [
        "ai-automation",
        "AI Automation Services",
        "en"
      ],
      [
        "automatizacion-ia-empresas",
        "Automatización con IA",
        "es"
      ],
      [
        "consultoria-intelligencia-artificial",
        "Consultoria d'intel·ligència artificial",
        "ca"
      ]
    ]
  },
  "forecasting": {
    "slug": "forecasting-planning",
    "capabilityIndex": 0,
    "titles": {
      "es": "Forecasting y planificación",
      "ca": "Forecasting i planificació",
      "en": "Forecasting and planning"
    },
    "intro": {
      "es": "Previsiones, escenarios y planificación para anticipar decisiones operativas y comerciales.",
      "ca": "Previsions, escenaris i planificació per anticipar decisions operatives i comercials.",
      "en": "Forecasts, scenarios and planning processes for better operational and commercial decisions."
    },
    "related": [
      [
        "demand-planning",
        "Demand Planning",
        "en"
      ],
      [
        "demand-forecasting",
        "Demand Forecasting",
        "en"
      ],
      [
        "prediccion-demanda",
        "Predicción de demanda",
        "es"
      ],
      [
        "previsio-demanda",
        "Previsió de demanda",
        "ca"
      ]
    ]
  },
  "optimisation": {
    "slug": "business-optimisation",
    "capabilityIndex": 1,
    "titles": {
      "es": "Optimización",
      "ca": "Optimització",
      "en": "Optimisation"
    },
    "intro": {
      "es": "Modelos de decisión para asignar recursos, gestionar restricciones y comparar alternativas.",
      "ca": "Models de decisió per assignar recursos, gestionar restriccions i comparar alternatives.",
      "en": "Decision models for allocating resources, managing constraints and comparing alternatives."
    },
    "related": [
      [
        "operations-research",
        "Operations Research",
        "en"
      ],
      [
        "optimizacion-operaciones",
        "Optimización de operaciones",
        "es"
      ],
      [
        "optimitzacio-empresarial",
        "Optimització empresarial",
        "ca"
      ],
      [
        "inventory-optimization",
        "Inventory Optimization",
        "en"
      ],
      [
        "optimizacion-inventario",
        "Optimización de inventario",
        "es"
      ],
      [
        "logistics-optimization",
        "Logistics Optimization",
        "en"
      ],
      [
        "route-optimization",
        "Route Optimization",
        "en"
      ],
      [
        "pricing-optimization",
        "Pricing Optimization",
        "en"
      ]
    ]
  },
  "ml": {
    "slug": "machine-learning-solutions",
    "capabilityIndex": 2,
    "titles": {
      "es": "Machine learning",
      "ca": "Machine learning",
      "en": "Machine learning"
    },
    "intro": {
      "es": "Predicción y detección de patrones aplicadas a problemas concretos del negocio.",
      "ca": "Predicció i detecció de patrons aplicades a problemes concrets del negoci.",
      "en": "Predictive modelling and pattern detection applied to real business decisions."
    },
    "related": [
      [
        "machine-learning-consulting",
        "Machine Learning Consulting",
        "en"
      ],
      [
        "data-science-consulting",
        "Data Science Consulting",
        "en"
      ],
      [
        "consultoria-datos",
        "Consultoría de datos",
        "es"
      ],
      [
        "consultoria-dades",
        "Consultoria de dades",
        "ca"
      ]
    ]
  },
  "analytics": {
    "slug": "analytics-business-intelligence",
    "capabilityIndex": 4,
    "titles": {
      "es": "Analytics y BI",
      "ca": "Analytics i BI",
      "en": "Analytics and BI"
    },
    "intro": {
      "es": "Datos organizados, indicadores fiables y visualizaciones para comprender y mejorar las operaciones.",
      "ca": "Dades organitzades, indicadors fiables i visualitzacions per comprendre i millorar les operacions.",
      "en": "Reliable data, clear metrics and dashboards for understanding and improving business operations."
    },
    "related": [
      [
        "business-intelligence",
        "Business Intelligence Consulting",
        "en"
      ],
      [
        "analitica-datos-empresas",
        "Analítica de datos para empresas",
        "es"
      ],
      [
        "data-engineering",
        "Data Engineering",
        "en"
      ],
      [
        "supply-chain-analytics",
        "Supply Chain Analytics",
        "en"
      ]
    ]
  },
  "simulation": {
    "slug": "simulation-modelling",
    "capabilityIndex": 5,
    "titles": {
      "es": "Simulación y modelización",
      "ca": "Simulació i modelització",
      "en": "Simulation & modelling"
    },
    "intro": {
      "es": "Modelos y escenarios para evaluar riesgos y alternativas antes de tomar decisiones.",
      "ca": "Models i escenaris per avaluar riscos i alternatives abans de prendre decisions.",
      "en": "Models and scenarios for assessing risks and alternatives before committing to a decision."
    },
    "related": [
      [
        "operations-research",
        "Operations Research",
        "en"
      ],
      [
        "demand-planning",
        "Demand Planning",
        "en"
      ],
      [
        "route-optimization",
        "Route Optimization",
        "en"
      ],
      [
        "pricing-optimization",
        "Pricing Optimization",
        "en"
      ],
      [
        "supply-chain-analytics",
        "Supply Chain Analytics",
        "en"
      ]
    ]
  }
} as const

export type ServiceHubKey = keyof typeof SERVICE_HUBS
export const SERVICE_HUB_ORDER = ['ai','forecasting','optimisation','ml','analytics','simulation'] as const satisfies readonly ServiceHubKey[]

export function getServiceHubBySlug(slug: string): { key: ServiceHubKey, hub: (typeof SERVICE_HUBS)[ServiceHubKey] } | null {
  for (const key of SERVICE_HUB_ORDER) {
    if (SERVICE_HUBS[key].slug === slug) return { key, hub: SERVICE_HUBS[key] }
  }
  return null
}
export function isServiceHubSlug(slug: string): boolean {
  return getServiceHubBySlug(slug) !== null
}
