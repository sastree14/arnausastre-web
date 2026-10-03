import { getPortfolioCasePresentation, getPortfolioCaseProfile } from '@/lib/portfolio-case-registry'

export type WebsiteProjectEvidenceMode = 'public_portfolio_implementation' | 'client_case'

export type WebsiteProjectMetric = {
  label: string
  value: string
  note: string
}

export type WebsiteProjectDecision = {
  title: string
  body: string
}

export type WebsiteProjectGoldStandard = {
  slug: string
  projectId: string
  evidenceMode: WebsiteProjectEvidenceMode
  eyebrow: string
  title: string
  description: string
  thesis: string
  industry: string
  capabilities: string[]
  challenge: string
  audience: string[]
  proofUrl: string
  proofLabel: string
  heroFacts: Array<{ label: string; value: string }>
  businessProblem: {
    eyebrow: string
    title: string
    body: string[]
    consequences: Array<{ title: string; body: string }>
  }
  horizonLogic: {
    eyebrow: string
    title: string
    body: string
    horizons: Array<{ horizon: string; label: string; note: string }>
    takeaway: string
  }
  solution: {
    eyebrow: string
    title: string
    body: string
    bullets: string[]
  }
  architecture: {
    eyebrow: string
    title: string
    body: string
    steps: Array<{ title: string; detail: string }>
    integrations: Array<{ title: string; detail: string }>
  }
  decisions: {
    eyebrow: string
    title: string
    body: string
    items: WebsiteProjectDecision[]
  }
  evidence: {
    eyebrow: string
    title: string
    body: string
    metrics: WebsiteProjectMetric[]
    note: string
  }
  technical: {
    eyebrow: string
    title: string
    body: string
    technologies: string[]
    highlights: string[]
  }
  limitations: {
    eyebrow: string
    title: string
    body: string
    items: string[]
  }
  takeaway: {
    eyebrow: string
    title: string
    body: string
  }
  cta: {
    eyebrow: string
    title: string
    body: string
    primaryLabel: string
    primaryHref: string
    secondaryLabel: string
    secondaryHref: string
  }
  businessOutcome: {
    mode: 'verified' | 'illustrative_scenario'
    label: string
    headline: string
    summary: string
    metrics: Array<{ value: string; label: string; note: string }>
    disclaimer: string
  }
  sourceNote: string
}

export const SC12_WEBSITE_GOLD_STANDARD: WebsiteProjectGoldStandard = {
  slug: 'ecommerce-demand-forecasting',
  projectId: 'SC-12',
  evidenceMode: 'public_portfolio_implementation',
  eyebrow: 'PUBLIC PORTFOLIO IMPLEMENTATION · SC-12',
  title: 'Multi-horizon demand forecasting built for inventory decisions.',
  description:
    'A forecasting system that compares statistical baselines and machine-learning models across multiple planning horizons, then turns the selected forecast into inspectable planning outputs.',
  thesis:
    'Forecast quality is not one number. A model can look strong in aggregate while becoming weak exactly where longer-range decisions are made.',
  industry: 'E-commerce & Retail',
  capabilities: ['Forecasting', 'Inventory Planning', 'Decision Systems'],
  challenge: 'Multi-horizon forecasting',
  audience: ['CEO', 'COO', 'Supply Chain', 'Head of Data'],
  proofUrl:
    'https://github.com/sastree14/Portfolio_SC_Analytics/tree/main/projects/sc-12-multi-horizon-demand-forecasting',
  proofLabel: 'Inspect the technical implementation',
  heroFacts: [
    { label: 'Planning horizons', value: '1 · 3 · 6 · 9 months' },
    { label: 'Decision', value: 'Purchasing · Inventory' },
    { label: 'Trade-off', value: 'Service · Stock · Cash' },
    { label: 'Measured through', value: 'WAPE · Bias · Coverage' },
  ],
  businessProblem: {
    eyebrow: '01 · BUSINESS PROBLEM',
    title: 'One forecast score can hide the exact failure that matters operationally.',
    body: [
      'Forecasting systems are often judged through one aggregate accuracy number. That is convenient, but it can conceal very different behaviour across planning horizons.',
      'For inventory and purchasing decisions, the relevant question is not simply whether a model predicts well on average. It is whether performance remains useful at the horizon where a decision must actually be made.',
    ],
    consequences: [
      {
        title: 'False confidence',
        body: 'An aggregate score can look healthy while long-range performance degrades.',
      },
      {
        title: 'Weak benchmark discipline',
        body: 'Complex models can appear impressive without proving that they beat a simple operational baseline.',
      },
      {
        title: 'Decision disconnect',
        body: 'A prediction has limited value if it is not translated into a planning output that a team can act on.',
      },
    ],
  },
  horizonLogic: {
    eyebrow: '02 · WHY HORIZON MATTERS',
    title: 'The same model can be useful at one horizon and weak at another.',
    body:
      'SC-12 evaluates forecasting quality separately at 1, 3, 6 and 9 months. Each horizon is backtested rather than hidden inside a single blended metric.',
    horizons: [
      { horizon: '1M', label: 'Near-term', note: 'Evaluate immediate forecast behaviour separately.' },
      { horizon: '3M', label: 'Short range', note: 'Retain an independent error and bias view.' },
      { horizon: '6M', label: 'Medium range', note: 'Make degradation visible instead of averaging it away.' },
      { horizon: '9M', label: 'Longer range', note: 'Treat long-horizon usefulness as its own decision question.' },
    ],
    takeaway:
      'The objective is not to make every horizon look equally accurate. It is to make the trade-off explicit enough to support a better planning decision.',
  },
  solution: {
    eyebrow: '03 · WHAT WAS BUILT',
    title: 'A forecasting pipeline with model competition, horizon-level backtesting and planning outputs.',
    body:
      'The public implementation keeps the analytical chain explicit from source data to decision output. Baselines remain part of the competition, machine-learning candidates are evaluated out of sample, and results are surfaced by horizon.',
    bullets: [
      'Feature engineering over orders, inventory and product attributes.',
      'Statistical baselines alongside XGBoost and LightGBM candidates.',
      'Backtesting by horizon instead of one aggregate evaluation.',
      'Forecast selection based on out-of-sample behaviour.',
      'Prediction intervals and planning-oriented outputs.',
      'Serving through a FastAPI boundary with PostgreSQL as a historical source.',
    ],
  },
  architecture: {
    eyebrow: '04 · SYSTEM ARCHITECTURE',
    title: 'The architecture keeps modelling, evaluation and operational delivery separate.',
    body:
      'Each stage has a narrow responsibility so models, data sources or serving components can change without redesigning the entire system.',
    steps: [
      { title: 'Orders + inventory', detail: 'Historical operating inputs and product attributes.' },
      { title: 'Feature engineering', detail: 'Prepare model-ready signals and horizon context.' },
      { title: 'Baseline models', detail: 'Maintain simple reference points for every comparison.' },
      { title: 'ML candidates', detail: 'Evaluate XGBoost and LightGBM alongside statistical approaches.' },
      { title: 'Backtesting by horizon', detail: 'Measure performance separately at 1, 3, 6 and 9 months.' },
      { title: 'Forecast selection', detail: 'Prefer out-of-sample performance and operational simplicity.' },
      { title: 'Planning output', detail: 'Expose forecasts, intervals and decision-relevant KPIs.' },
    ],
    integrations: [
      { title: 'PostgreSQL', detail: 'Historical source for orders, inventory and product attributes.' },
      { title: 'FastAPI', detail: 'Serving boundary for forecast requests and scenario outputs.' },
      { title: 'Object storage', detail: 'Backtests, trained artefacts and model outputs.' },
    ],
  },
  decisions: {
    eyebrow: '05 · DECISION LOGIC',
    title: 'Three technical decisions keep the system honest.',
    body:
      'The project is designed around evaluation discipline rather than model novelty.',
    items: [
      {
        title: 'Backtest by horizon',
        body: 'Horizon-level backtesting prevents one aggregate metric from hiding weak long-range performance.',
      },
      {
        title: 'Keep simple baselines',
        body: 'Statistical baselines remain mandatory reference points. Complexity has to earn its place.',
      },
      {
        title: 'Select out of sample',
        body: 'Model selection is based on out-of-sample performance, not in-sample fit.',
      },
    ],
  },
  evidence: {
    eyebrow: '06 · WHAT IS MEASURED',
    title: 'Evidence is structured around error, bias and decision relevance.',
    body:
      'The public project exposes the metrics required to inspect model behaviour without presenting the example as a production client KPI.',
    metrics: [
      { label: 'WAPE', value: '6.45%', note: 'Public backtest forecast error.' },
      { label: 'MAE', value: '7.39', note: 'Average absolute error in public example units.' },
      { label: 'Forecast bias', value: '-6.45%', note: 'Negative bias in the public backtest.' },
      { label: 'Planning horizons', value: '4', note: '1, 3, 6 and 9 months.' },
      { label: 'Backtest observations', value: '6', note: 'Deterministic public validation observations.' },
    ],
    note:
      'The repository contains representative public inputs and outputs. These values are implementation evidence, not claims of organisation-wide client impact.',
  },
  technical: {
    eyebrow: '07 · TECHNICAL OVERVIEW',
    title: 'A replaceable stack, not a list of logos.',
    body:
      'Every technology has a defined responsibility in the analytical or serving path.',
    technologies: [
      'Python',
      'Pandas',
      'Statsmodels',
      'Machine Learning',
      'Plotly',
      'FastAPI',
      'PostgreSQL',
      'Prefect',
    ],
    highlights: [
      'The core public example can be inspected without production credentials.',
      'Integrations are kept behind explicit boundaries.',
      'Simpler components are preferred when they meet the same operational requirement with lower maintenance cost.',
      'The implementation includes documented inputs, outputs, logs, technical decisions and execution paths.',
    ],
  },
  limitations: {
    eyebrow: '08 · LIMITATIONS',
    title: 'What this public implementation does not claim.',
    body:
      'A useful project page should make its boundaries as clear as its capabilities.',
    items: [
      'Public sample data is compact and representative.',
      'Real assortment changes require product lifecycle features.',
      'Production retraining cadence depends on demand volatility.',
      'The project is capability and implementation proof; it is not presented as a named client engagement.',
    ],
  },
  takeaway: {
    eyebrow: '09 · BUSINESS TAKEAWAY',
    title: 'Forecasting becomes useful when model quality is evaluated at the horizon of the decision.',
    body:
      'The practical value is not “using machine learning”. It is making forecast quality inspectable, benchmarked and connected to planning decisions without hiding uncertainty behind one aggregate score.',
  },
  cta: {
    eyebrow: '10 · NEXT STEP',
    title: 'Facing a forecasting or inventory-planning problem?',
    body:
      'We can review the decision process first, identify where forecasting would actually change an operational decision, and only then choose the appropriate modelling approach.',
    primaryLabel: 'Discuss a similar problem',
    primaryHref: '/contact',
    secondaryLabel: 'Open technical proof',
    secondaryHref:
      'https://github.com/sastree14/Portfolio_SC_Analytics/tree/main/projects/sc-12-multi-horizon-demand-forecasting',
  },
  businessOutcome: {
    mode: 'illustrative_scenario',
    label: 'Illustrative business economics',
    headline: 'Better forecasting only matters when it changes stock, service or cash.',
    summary:
      'For an illustrative €2.0M inventory position, a 5% reduction in excess inventory would release €100k of working capital. The arithmetic is explicit so the commercial relevance can be understood without presenting a hypothetical scenario as a measured client result.',
    metrics: [
      { value: '€2.0M', label: 'Scenario inventory', note: 'Illustrative operating base.' },
      { value: '5%', label: 'Scenario reduction', note: 'Assumed reduction in excess inventory.' },
      { value: '€100k', label: 'Capital released', note: '€2.0M × 5%; illustrative arithmetic.' },
    ],
    disclaimer:
      'Illustrative scenario, not a client result or forecasted guarantee. Actual value depends on inventory economics, service targets, margins and operating constraints.',
  },
  sourceNote:
    'SC-12 is a public portfolio implementation. It is presented as capability and implementation proof, not as a named client case or a claim of measured organisation-wide impact.',
}

function buildPortfolioGoldStandard(slug: string): WebsiteProjectGoldStandard | undefined {
  if (slug === SC12_WEBSITE_GOLD_STANDARD.slug) return SC12_WEBSITE_GOLD_STANDARD

  const profile = getPortfolioCaseProfile(slug)
  if (!profile) return undefined
  const presentation = getPortfolioCasePresentation(profile.id, 'en')
  if (!presentation) return undefined

  return {
    slug: profile.slug,
    projectId: profile.id,
    evidenceMode: 'public_portfolio_implementation',
    eyebrow: `PUBLIC PORTFOLIO IMPLEMENTATION · ${profile.id}`,
    title: presentation.title,
    description: presentation.summary,
    thesis: presentation.case.thesis,
    industry: presentation.industry,
    capabilities: profile.technologies.slice(0, 4),
    challenge: presentation.challenge,
    audience: ['Business decision-makers', 'Operations', 'Data & AI'],
    proofUrl: `https://github.com/sastree14/Portfolio_SC_Analytics/tree/main/projects/${profile.repoSlug}`,
    proofLabel: presentation.case.repository,
    heroFacts: presentation.heroFacts,
    businessProblem: {
      eyebrow: presentation.case.problemLabel,
      title: presentation.case.problemTitle,
      body: [presentation.case.problemBody],
      consequences: presentation.case.problemRows,
    },
    horizonLogic: presentation.case.logicVisual,
    solution: {
      eyebrow: presentation.case.systemLabel,
      title: presentation.case.systemTitle,
      body: presentation.case.systemBody,
      bullets: presentation.case.systemRows,
    },
    architecture: presentation.case.architecture,
    decisions: {
      eyebrow: 'DECISION LOGIC',
      title: presentation.case.logicTitle,
      body: presentation.case.logicBody,
      items: presentation.case.problemRows,
    },
    evidence: {
      eyebrow: presentation.case.evidenceGroupLabels[0],
      title: presentation.case.evidenceGroupLabels[1],
      body: presentation.case.evidenceBody,
      metrics: presentation.case.evidence,
      note: presentation.proofStatement,
    },
    technical: {
      eyebrow: presentation.case.technicalLabel,
      title: presentation.case.technicalTitle,
      body: presentation.proofStatement,
      technologies: profile.technologies,
      highlights: presentation.case.systemRows,
    },
    limitations: {
      eyebrow: 'BOUNDARIES',
      title: 'Public implementation boundaries',
      body: 'Public examples demonstrate the decision structure and technical implementation without presenting illustrative values as measured client impact.',
      items: [
        'Reference metrics are public-example values unless explicitly documented as measured.',
        'Production integrations, credentials and operating constraints remain environment-specific.',
        'The technical repository is capability evidence, not a claim of a named client engagement.',
      ],
    },
    takeaway: {
      eyebrow: presentation.case.takeawayLabel,
      title: presentation.case.takeawayTitle,
      body: presentation.case.takeawayBody,
    },
    cta: {
      eyebrow: 'NEXT STEP',
      title: presentation.case.takeawayTitle,
      body: presentation.case.takeawayBody,
      primaryLabel: presentation.case.contact,
      primaryHref: '/contact',
      secondaryLabel: presentation.case.repository,
      secondaryHref: `https://github.com/sastree14/Portfolio_SC_Analytics/tree/main/projects/${profile.repoSlug}`,
    },
    businessOutcome: {
      mode: 'illustrative_scenario',
      label: presentation.case.referenceEconomics,
      headline: presentation.scenarioHeadline,
      summary: presentation.scenarioSummary,
      metrics: presentation.businessMetrics,
      disclaimer: presentation.scenarioSummary,
    },
    sourceNote: `${profile.id} is a public portfolio implementation. Reference economics are illustrative and technical evidence is inspectable in the repository.`,
  }
}

export function getWebsiteProjectGoldStandard(slug: string) {
  return buildPortfolioGoldStandard(slug)
}
