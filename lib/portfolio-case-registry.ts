import type { SiteLanguage } from '@/lib/public-copy'

export type PortfolioCaseArchetype =
  | 'agent'
  | 'data'
  | 'forecast'
  | 'bi'
  | 'customer'
  | 'risk'
  | 'optimization'
  | 'finance'
  | 'quant'
  | 'specialized'
  | 'vision'

type Localized = Record<SiteLanguage, string>

export type PortfolioCaseProfile = {
  id: string
  slug: string
  repoSlug: string
  aliases?: string[]
  title: Localized
  summary: Localized
  archetype: PortfolioCaseArchetype
  metricPack?: 'forecast' | 'service' | 'credit' | 'fraud' | 'property' | 'diligence'
  technologies: string[]
}

const L = (en: string, es: string, ca: string): Localized => ({ en, es, ca })

export const portfolioCaseProfiles: PortfolioCaseProfile[] = [
  {
    id: 'SC-01',
    slug: 'long-running-agent-platform',
    repoSlug: 'sc-01-long-running-agent-platform',
    title: L('Long-Running AI Agent Platform', 'Plataforma de agentes de IA de larga duración', 'Plataforma d’agents d’IA de llarga durada'),
    summary: L(
      'Durable execution for AI workflows that must pause, resume, call external systems and preserve an audit trail.',
      'Ejecución durable para workflows de IA que deben pausar, reanudar, interactuar con sistemas externos y conservar trazabilidad.',
      'Execució durable per a workflows d’IA que han de pausar, reprendre, interactuar amb sistemes externs i conservar traçabilitat.',
    ),
    archetype: 'agent',
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Celery', 'Docker', 'OpenAI', 'Anthropic', 'SQL'],
  },
  {
    id: 'SC-02',
    slug: 'multi-agent-operations-orchestrator',
    repoSlug: 'sc-02-multi-agent-operations-orchestrator',
    title: L('Multi-Agent Operations Orchestrator', 'Orquestador operativo multiagente', 'Orquestrador operatiu multiagent'),
    summary: L(
      'A controlled multi-agent system that separates planning, specialist work, review and execution.',
      'Sistema multiagente controlado que separa planificación, trabajo especializado, revisión y ejecución.',
      'Sistema multiagent controlat que separa planificació, treball especialitzat, revisió i execució.',
    ),
    archetype: 'agent',
    technologies: ['Python', 'FastAPI', 'LangGraph', 'PostgreSQL', 'Redis', 'Docker', 'OpenAI', 'Anthropic', 'Pydantic'],
  },
  {
    id: 'SC-03',
    slug: 'ai-sales-crm-automation',
    repoSlug: 'sc-03-ai-sales-crm-automation',
    aliases: ['business-operating-crm'],
    title: L('AI Sales & CRM Automation System', 'Sistema de automatización de ventas y CRM con IA', 'Sistema d’automatització de vendes i CRM amb IA'),
    summary: L(
      'A sales-operations system that scores inbound activity, prepares follow-ups and controls CRM actions.',
      'Sistema comercial que prioriza actividad entrante, prepara seguimientos y controla las acciones que llegan al CRM.',
      'Sistema comercial que prioritza activitat entrant, prepara seguiments i controla les accions que arriben al CRM.',
    ),
    archetype: 'agent',
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'n8n', 'HubSpot API', 'Webhooks', 'OpenAI', 'Docker', 'SQL'],
  },
  {
    id: 'SC-04',
    slug: 'ai-receptionist-lead-qualification',
    repoSlug: 'sc-04-ai-receptionist-lead-qualification',
    title: L('AI Receptionist & Lead Qualification', 'Recepcionista IA y cualificación de leads', 'Recepcionista IA i qualificació de leads'),
    summary: L(
      'A conversational intake layer that qualifies enquiries, captures structured requirements and routes the next action.',
      'Capa conversacional que cualifica consultas, captura requisitos estructurados y dirige la siguiente acción.',
      'Capa conversacional que qualifica consultes, captura requisits estructurats i dirigeix la següent acció.',
    ),
    archetype: 'agent',
    technologies: ['TypeScript', 'Node.js', 'Fastify', 'Twilio', 'Calendly', 'OpenAI', 'PostgreSQL', 'Docker', 'Webhooks'],
  },
  {
    id: 'SC-05',
    slug: 'document-intelligence-due-diligence-agent',
    repoSlug: 'sc-05-document-intelligence-due-diligence-agent',
    aliases: ['ai-knowledge-workflow'],
    title: L('Document Intelligence & Due Diligence Agent', 'Agente de inteligencia documental y due diligence', 'Agent d’intel·ligència documental i due diligence'),
    summary: L(
      'A document-analysis system that extracts evidence, retrieves supporting passages and produces reviewable findings.',
      'Sistema de análisis documental que extrae evidencia, recupera fuentes y produce conclusiones revisables.',
      'Sistema d’anàlisi documental que extreu evidència, recupera fonts i produeix conclusions revisables.',
    ),
    archetype: 'agent',
    technologies: ['Python', 'FastAPI', 'Qdrant', 'pgvector', 'PostgreSQL', 'PyMuPDF', 'OpenAI', 'S3 / MinIO', 'Docker'],
  },
  {
    id: 'SC-06',
    slug: 'ai-workflow-automation-hub',
    repoSlug: 'sc-06-ai-workflow-automation-hub',
    aliases: ['ai-accounting-agents'],
    title: L('AI Workflow Automation Hub', 'Hub de automatización de workflows con IA', 'Hub d’automatització de workflows amb IA'),
    summary: L(
      'An event-driven automation layer that combines deterministic workflows with AI only where interpretation is useful.',
      'Capa de automatización orientada a eventos que combina workflows deterministas con IA solo donde aporta interpretación.',
      'Capa d’automatització orientada a esdeveniments que combina workflows deterministes amb IA només on aporta interpretació.',
    ),
    archetype: 'agent',
    technologies: ['n8n', 'Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Webhooks', 'Zapier', 'Make', 'Docker'],
  },
  {
    id: 'SC-07',
    slug: 'full-stack-llm-business-copilot',
    repoSlug: 'sc-07-full-stack-llm-business-copilot',
    title: L('Full-Stack LLM Business Copilot', 'Copiloto empresarial LLM full-stack', 'Copilot empresarial LLM full-stack'),
    summary: L(
      'A full-stack application that combines conversational analysis, structured tools and persistent business context.',
      'Aplicación full-stack que combina análisis conversacional, herramientas estructuradas y contexto empresarial persistente.',
      'Aplicació full-stack que combina anàlisi conversacional, eines estructurades i context empresarial persistent.',
    ),
    archetype: 'agent',
    technologies: ['Next.js', 'TypeScript', 'React', 'PostgreSQL', 'Supabase', 'OpenAI', 'Vercel', 'Zod', 'Tailwind CSS'],
  },
  {
    id: 'SC-08',
    slug: 'enterprise-data-integration-api-platform',
    repoSlug: 'sc-08-enterprise-data-integration-api-platform',
    aliases: ['erp-operations-control'],
    title: L('Enterprise Data Integration & API Platform', 'Plataforma empresarial de integración de datos y APIs', 'Plataforma empresarial d’integració de dades i APIs'),
    summary: L(
      'A governed integration layer that moves operational data into analytical storage and exposes controlled downstream APIs.',
      'Capa gobernada que integra datos operativos, los lleva a almacenamiento analítico y expone APIs controladas.',
      'Capa governada que integra dades operatives, les porta a emmagatzematge analític i exposa APIs controlades.',
    ),
    archetype: 'data',
    technologies: ['Python', 'FastAPI', 'Apache Airflow', 'PostgreSQL', 'ClickHouse', 'AWS S3', 'Snowflake', 'BigQuery', 'Terraform'],
  },
  {
    id: 'SC-09',
    slug: 'etl-elt-data-quality-pipeline',
    repoSlug: 'sc-09-etl-elt-data-quality-pipeline',
    title: L('ETL / ELT & Data Quality Pipeline', 'Pipeline ETL / ELT y calidad de datos', 'Pipeline ETL / ELT i qualitat de dades'),
    summary: L(
      'A reproducible analytics-engineering pipeline with SQL transformations and explicit quality gates.',
      'Pipeline reproducible de analytics engineering con transformaciones SQL y controles explícitos de calidad.',
      'Pipeline reproduïble d’analytics engineering amb transformacions SQL i controls explícits de qualitat.',
    ),
    archetype: 'data',
    technologies: ['dbt', 'DuckDB', 'Python', 'Pandera', 'Parquet', 'Apache Airflow', 'SQL', 'Docker', 'GitHub Actions'],
  },
  {
    id: 'SC-10',
    slug: 'real-time-analytics-platform',
    repoSlug: 'sc-10-real-time-analytics-platform',
    title: L('Real-Time Analytics & Monitoring Platform', 'Plataforma de analytics y monitorización en tiempo real', 'Plataforma d’analytics i monitorització en temps real'),
    summary: L(
      'A streaming architecture for ingesting events, updating analytical state and exposing low-latency operational views.',
      'Arquitectura streaming para ingerir eventos, actualizar el estado analítico y servir vistas operativas de baja latencia.',
      'Arquitectura streaming per ingerir esdeveniments, actualitzar l’estat analític i servir vistes operatives de baixa latència.',
    ),
    archetype: 'data',
    technologies: ['Redpanda / Kafka', 'ClickHouse', 'Python', 'FastAPI', 'WebSockets', 'Grafana', 'Kubernetes', 'OpenTelemetry', 'Docker'],
  },
  {
    id: 'SC-11',
    slug: 'mlops-evaluation-monitoring',
    repoSlug: 'sc-11-mlops-evaluation-monitoring',
    title: L('ML / AI Evaluation & Monitoring Platform', 'Plataforma de evaluación y monitorización de ML / IA', 'Plataforma d’avaluació i monitorització de ML / IA'),
    summary: L(
      'A production-oriented layer for model evaluation, version tracking, drift checks and release gates.',
      'Capa orientada a producción para evaluar modelos, controlar versiones, detectar drift y gobernar releases.',
      'Capa orientada a producció per avaluar models, controlar versions, detectar drift i governar releases.',
    ),
    archetype: 'data',
    technologies: ['Python', 'MLflow', 'Evidently', 'FastAPI', 'PostgreSQL', 'Prometheus', 'Kubernetes', 'Docker', 'GitHub Actions'],
  },
  {
    id: 'SC-12',
    slug: 'ecommerce-demand-forecasting',
    repoSlug: 'sc-12-multi-horizon-demand-forecasting',
    title: L('Multi-Horizon Demand Forecasting & Inventory Planning', 'Forecasting de demanda y planificación de inventario', 'Forecasting de demanda i planificació d’inventari'),
    summary: L(
      'A forecasting system that compares baselines and machine-learning models across multiple planning horizons.',
      'Sistema de forecasting que compara baselines y modelos de machine learning en distintos horizontes de planificación.',
      'Sistema de forecasting que compara baselines i models de machine learning en diferents horitzons de planificació.',
    ),
    archetype: 'forecast',
    metricPack: 'forecast',
    technologies: ['Python', 'Statsmodels', 'Machine Learning', 'FastAPI', 'PostgreSQL', 'Prefect'],
  },
  {
    id: 'SC-13',
    slug: 'r-shiny-decision-app',
    repoSlug: 'sc-13-r-shiny-forecasting-scenario-planning',
    title: L('R Shiny Forecasting & Scenario Planning Application', 'Aplicación R Shiny de forecasting y escenarios', 'Aplicació R Shiny de forecasting i escenaris'),
    summary: L(
      'An interactive R application for decomposition, forecasting and business what-if scenarios.',
      'Aplicación interactiva en R para descomposición, forecasting y escenarios de negocio.',
      'Aplicació interactiva en R per descomposició, forecasting i escenaris de negoci.',
    ),
    archetype: 'forecast',
    technologies: ['R', 'Shiny', 'forecast', 'fable', 'ggplot2', 'dplyr', 'DBI', 'PostgreSQL'],
  },
  {
    id: 'SC-14',
    slug: 'power-bi-executive-decision-system',
    repoSlug: 'sc-14-power-bi-executive-decision-system',
    title: L('Power BI Executive Decision System', 'Sistema ejecutivo de decisión en Power BI', 'Sistema executiu de decisió en Power BI'),
    summary: L(
      'A semantic-model-driven executive reporting system for revenue, margin, pipeline and operating performance.',
      'Sistema ejecutivo basado en modelo semántico para ingresos, margen, pipeline y rendimiento operativo.',
      'Sistema executiu basat en model semàntic per ingressos, marge, pipeline i rendiment operatiu.',
    ),
    archetype: 'bi',
    technologies: ['Power BI', 'DAX', 'Power Query', 'SQL', 'Star Schema', 'PostgreSQL', 'Excel'],
  },
  {
    id: 'SC-15',
    slug: 'tableau-commercial-analytics',
    repoSlug: 'sc-15-tableau-commercial-analytics',
    title: L('Tableau Commercial Analytics & Drill-Down', 'Analytics comercial y drill-down en Tableau', 'Analytics comercial i drill-down en Tableau'),
    summary: L(
      'A Tableau-oriented commercial analytics system focused on interactive exploration, cohorts and drill-down behaviour.',
      'Sistema de analytics comercial en Tableau orientado a exploración interactiva, cohortes y drill-down.',
      'Sistema d’analytics comercial en Tableau orientat a exploració interactiva, cohorts i drill-down.',
    ),
    archetype: 'bi',
    technologies: ['Tableau', 'LOD Expressions', 'SQL', 'PostgreSQL', 'CSV', 'Calculated Fields'],
  },
  {
    id: 'SC-16',
    slug: 'recommendation-search-ranking-engine',
    repoSlug: 'sc-16-recommendation-search-ranking-engine',
    title: L('Recommendation, Search & Ranking Engine', 'Motor de recomendación, búsqueda y ranking', 'Motor de recomanació, cerca i ranking'),
    summary: L(
      'A hybrid recommendation and ranking system combining behavioural signals, semantic similarity and business rules.',
      'Sistema híbrido de recomendación y ranking que combina comportamiento, similitud semántica y reglas de negocio.',
      'Sistema híbrid de recomanació i ranking que combina comportament, similitud semàntica i regles de negoci.',
    ),
    archetype: 'customer',
    technologies: ['Python', 'Scikit-learn', 'LightGBM', 'Sentence Transformers', 'FAISS', 'FastAPI', 'PostgreSQL', 'Redis'],
  },
  {
    id: 'SC-17',
    slug: 'customer-intelligence-churn-clv',
    repoSlug: 'sc-17-customer-intelligence-churn-clv',
    title: L('Customer Intelligence: Churn, CLV & Segmentation', 'Inteligencia de cliente: churn, CLV y segmentación', 'Intel·ligència de client: churn, CLV i segmentació'),
    summary: L(
      'A customer analytics system combining churn probability, lifetime value, segmentation and time-to-event analysis.',
      'Sistema de customer analytics que combina churn, lifetime value, segmentación y análisis temporal.',
      'Sistema de customer analytics que combina churn, lifetime value, segmentació i anàlisi temporal.',
    ),
    archetype: 'customer',
    technologies: ['Python', 'Scikit-learn', 'XGBoost', 'Lifelines', 'SHAP', 'Pandas', 'FastAPI', 'PostgreSQL'],
  },
  {
    id: 'SC-18',
    slug: 'banking-risk-decision-system',
    repoSlug: 'sc-18-credit-risk-profit-optimization',
    title: L('Credit Risk & Profit Optimization Engine', 'Motor de riesgo de crédito y optimización de beneficio', 'Motor de risc de crèdit i optimització de benefici'),
    summary: L(
      'A lending decision engine combining default risk, expected loss, pricing and constrained contribution optimization.',
      'Motor de decisión crediticia que combina riesgo de impago, pérdida esperada, pricing y optimización de contribución.',
      'Motor de decisió creditícia que combina risc d’impagament, pèrdua esperada, pricing i optimització de contribució.',
    ),
    archetype: 'risk',
    metricPack: 'credit',
    technologies: ['Python', 'XGBoost', 'SHAP', 'Scikit-learn', 'Optuna', 'FastAPI', 'PostgreSQL', 'Plotly', 'Streamlit'],
  },
  {
    id: 'SC-19',
    slug: 'fraud-detection-explainability',
    repoSlug: 'sc-19-fraud-detection-explainability',
    title: L('Fraud Detection & Explainability System', 'Sistema de detección de fraude y explicabilidad', 'Sistema de detecció de frau i explicabilitat'),
    summary: L(
      'A cost-sensitive fraud scoring system with threshold optimization, explanations and investigation prioritization.',
      'Sistema de scoring de fraude sensible al coste con optimización de umbrales, explicabilidad y priorización de investigación.',
      'Sistema de scoring de frau sensible al cost amb optimització de llindars, explicabilitat i priorització d’investigació.',
    ),
    archetype: 'risk',
    metricPack: 'fraud',
    technologies: ['Python', 'XGBoost', 'SHAP', 'Scikit-learn', 'Imbalanced-learn', 'FastAPI', 'PostgreSQL', 'Plotly'],
  },
  {
    id: 'SC-20',
    slug: 'supply-chain-optimization',
    repoSlug: 'sc-20-supply-chain-optimization',
    title: L('Supply Chain & Marketplace Optimization', 'Optimización de supply chain y marketplace', 'Optimització de supply chain i marketplace'),
    summary: L(
      'A constrained optimization system for inventory allocation, replenishment and service-level trade-offs.',
      'Sistema de optimización con restricciones para asignación de inventario, reposición y trade-offs de nivel de servicio.',
      'Sistema d’optimització amb restriccions per assignació d’inventari, reposició i trade-offs de nivell de servei.',
    ),
    archetype: 'optimization',
    technologies: ['Python', 'OR-Tools', 'Pandas', 'NumPy', 'FastAPI', 'PostgreSQL', 'Plotly', 'Docker'],
  },
  {
    id: 'SC-21',
    slug: 'pricing-revenue-optimization',
    repoSlug: 'sc-21-pricing-revenue-optimization',
    title: L('Pricing & Revenue Optimization Engine', 'Motor de optimización de pricing e ingresos', 'Motor d’optimització de pricing i ingressos'),
    summary: L(
      'A pricing system combining demand response, margin economics and constrained scenario optimization.',
      'Sistema de pricing que combina respuesta de demanda, economía de margen y optimización de escenarios con restricciones.',
      'Sistema de pricing que combina resposta de demanda, economia de marge i optimització d’escenaris amb restriccions.',
    ),
    archetype: 'optimization',
    technologies: ['Python', 'Pandas', 'NumPy', 'SciPy', 'Statsmodels', 'XGBoost', 'Optuna', 'FastAPI', 'Plotly'],
  },
  {
    id: 'SC-22',
    slug: 'resource-capacity-scheduling-optimization',
    repoSlug: 'sc-22-resource-capacity-scheduling-optimization',
    title: L('Resource, Capacity & Scheduling Optimization', 'Optimización de recursos, capacidad y scheduling', 'Optimització de recursos, capacitat i scheduling'),
    summary: L(
      'A scheduling engine that assigns work to limited resources while respecting skills, capacity and service targets.',
      'Motor de scheduling que asigna trabajo a recursos limitados respetando habilidades, capacidad y objetivos de servicio.',
      'Motor de scheduling que assigna treball a recursos limitats respectant habilitats, capacitat i objectius de servei.',
    ),
    archetype: 'optimization',
    technologies: ['Python', 'OR-Tools', 'Pyomo', 'Pandas', 'FastAPI', 'PostgreSQL', 'Docker', 'Plotly'],
  },
  {
    id: 'SC-23',
    slug: 'operations-simulation-what-if',
    repoSlug: 'sc-23-operations-simulation-what-if',
    aliases: ['reinforcement-learning-decision-system'],
    title: L('Operations Simulation & What-If Engine', 'Motor de simulación operativa y what-if', 'Motor de simulació operativa i what-if'),
    summary: L(
      'A discrete-event and Monte Carlo environment for testing operational changes before implementation.',
      'Entorno de simulación de eventos discretos y Monte Carlo para probar cambios operativos antes de implantarlos.',
      'Entorn de simulació d’esdeveniments discrets i Monte Carlo per provar canvis operatius abans d’implantar-los.',
    ),
    archetype: 'optimization',
    technologies: ['Python', 'SimPy', 'NumPy', 'Pandas', 'Monte Carlo', 'Plotly', 'FastAPI', 'Docker'],
  },
  {
    id: 'SC-24',
    slug: 'financial-modelling-scenario-engine',
    repoSlug: 'sc-24-financial-modelling-scenario-engine',
    aliases: ['investment-analytics-platform'],
    title: L('Financial Modelling & Scenario Engine', 'Motor de modelización financiera y escenarios', 'Motor de modelització financera i escenaris'),
    summary: L(
      'A driver-based financial model linking revenue, margin, operating costs and cash flow to explicit assumptions.',
      'Modelo financiero por drivers que conecta ingresos, margen, costes operativos y cash flow con supuestos explícitos.',
      'Model financer per drivers que connecta ingressos, marge, costos operatius i cash flow amb supòsits explícits.',
    ),
    archetype: 'finance',
    technologies: ['Python', 'Pandas', 'NumPy', 'OpenPyXL', 'Plotly', 'FastAPI', 'PostgreSQL', 'Excel'],
  },
  {
    id: 'SC-25',
    slug: 'debt-cashflow-investment-model',
    repoSlug: 'sc-25-debt-cashflow-investment-model',
    title: L('Debt, Cash Flow & Investment Model', 'Modelo de deuda, cash flow e inversión', 'Model de deute, cash flow i inversió'),
    summary: L(
      'An integrated debt and investment model for repayment schedules, covenant headroom, returns and downside analysis.',
      'Modelo integrado de deuda e inversión para calendarios de repago, covenants, retornos y análisis downside.',
      'Model integrat de deute i inversió per calendaris de repagament, covenants, retorns i anàlisi downside.',
    ),
    archetype: 'finance',
    technologies: ['Python', 'Pandas', 'NumPy', 'OpenPyXL', 'Plotly', 'XIRR', 'PostgreSQL', 'Excel'],
  },
  {
    id: 'SC-26',
    slug: 'portfolio-risk-capital-allocation',
    repoSlug: 'sc-26-portfolio-risk-capital-allocation',
    title: L('Portfolio Risk & Capital Allocation Engine', 'Motor de riesgo de cartera y asignación de capital', 'Motor de risc de cartera i assignació de capital'),
    summary: L(
      'A portfolio engine for expected return, covariance, stress testing and constrained capital allocation.',
      'Motor de cartera para retorno esperado, covarianza, stress testing y asignación de capital con restricciones.',
      'Motor de cartera per retorn esperat, covariància, stress testing i assignació de capital amb restriccions.',
    ),
    archetype: 'finance',
    technologies: ['Python', 'NumPy', 'Pandas', 'SciPy', 'CVXPY', 'Plotly', 'Monte Carlo', 'FastAPI'],
  },
  {
    id: 'SC-27',
    slug: 'quantitative-trading-framework',
    repoSlug: 'sc-27-quant-trading-market-microstructure',
    title: L('Quantitative Trading & Market Microstructure System', 'Sistema cuantitativo de trading y microestructura de mercado', 'Sistema quantitatiu de trading i microestructura de mercat'),
    summary: L(
      'A research stack for order-book events, microstructure signals, backtesting and strategy evaluation.',
      'Stack de research para order book, señales de microestructura, backtesting y evaluación de estrategias.',
      'Stack de research per order book, senyals de microestructura, backtesting i avaluació d’estratègies.',
    ),
    archetype: 'quant',
    technologies: ['Python', 'TypeScript', 'Vite', 'WebSockets', 'ClickHouse', 'Redis', 'Pandas', 'NumPy', 'Plotly', 'Docker'],
  },
  {
    id: 'SC-28',
    slug: 'ai-property-development-feasibility',
    repoSlug: 'sc-28-ai-property-development-feasibility',
    title: L('AI Property Development Feasibility & Operations System', 'Sistema de viabilidad y operaciones para promoción inmobiliaria con IA', 'Sistema de viabilitat i operacions per promoció immobiliària amb IA'),
    summary: L(
      'A property-development decision system combining feasibility modelling, documents, scenarios and workflow automation.',
      'Sistema de decisión para promoción inmobiliaria que combina viabilidad, documentos, escenarios y automatización de workflows.',
      'Sistema de decisió per promoció immobiliària que combina viabilitat, documents, escenaris i automatització de workflows.',
    ),
    archetype: 'specialized',
    metricPack: 'property',
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Pandas', 'GeoPandas', 'OpenAI', 'n8n', 'Docker', 'Plotly'],
  },
  {
    id: 'SC-29',
    slug: 'commercial-due-diligence-market-intelligence',
    repoSlug: 'sc-29-commercial-due-diligence-market-intelligence',
    title: L('Commercial Due Diligence & Market Intelligence System', 'Sistema de due diligence comercial e inteligencia de mercado', 'Sistema de due diligence comercial i intel·ligència de mercat'),
    summary: L(
      'A structured research system for market sizing, competitors, company signals and evidence-backed investment questions.',
      'Sistema de research estructurado para market sizing, competidores, señales empresariales y preguntas de inversión respaldadas por evidencia.',
      'Sistema de research estructurat per market sizing, competidors, senyals empresarials i preguntes d’inversió recolzades per evidència.',
    ),
    archetype: 'specialized',
    metricPack: 'diligence',
    technologies: ['Python', 'Pandas', 'DuckDB', 'FastAPI', 'Playwright', 'BeautifulSoup', 'OpenAI', 'PostgreSQL', 'Plotly'],
  },
  {
    id: 'SC-30',
    slug: 'computer-vision-waste-detection-sorting',
    repoSlug: 'sc-30-computer-vision-waste-detection-sorting',
    title: L('Computer Vision Waste Detection & Sorting System', 'Sistema de visión artificial para detección y clasificación de residuos', 'Sistema de visió artificial per detecció i classificació de residus'),
    summary: L(
      'A computer-vision system for detecting, counting and classifying waste items and routing uncertain detections to review.',
      'Sistema de visión artificial para detectar, contar y clasificar residuos y enviar casos ambiguos a revisión.',
      'Sistema de visió artificial per detectar, comptar i classificar residus i enviar casos ambigus a revisió.',
    ),
    archetype: 'vision',
    technologies: ['Python', 'PyTorch', 'Ultralytics YOLO', 'OpenCV', 'FastAPI', 'NumPy', 'Pandas', 'Plotly', 'Docker'],
  },
  {
    id: 'SC-31',
    slug: 'power-bi-forecast-inventory-planning',
    repoSlug: 'sc-31-power-bi-forecast-inventory-planning',
    title: L('Power BI Forecast & Inventory Planning Dashboard', 'Dashboard Power BI de forecasting y planificación de inventario', 'Dashboard Power BI de forecasting i planificació d’inventari'),
    summary: L(
      'A Power BI planning interface connecting multi-horizon forecast accuracy with inventory coverage, service level and replenishment decisions.',
      'Interfaz Power BI que conecta precisión del forecast por horizonte con cobertura, nivel de servicio y reposición.',
      'Interfície Power BI que connecta precisió del forecast per horitzó amb cobertura, nivell de servei i reposició.',
    ),
    archetype: 'bi',
    metricPack: 'forecast',
    technologies: ['Power BI', 'DAX', 'Power Query', 'SQL', 'Star Schema', 'PostgreSQL', 'Excel'],
  },
  {
    id: 'SC-32',
    slug: 'power-bi-order-fulfilment-control-tower',
    repoSlug: 'sc-32-power-bi-order-fulfilment-control-tower',
    title: L('Power BI Order Fulfilment & Service Control Tower', 'Torre de control Power BI para pedidos, servicio y entregas', 'Torre de control Power BI per comandes, servei i entregues'),
    summary: L(
      'A Power BI operations control tower for service level, delivery lead times, order status and exception management.',
      'Torre de control Power BI para nivel de servicio, lead times, estado de pedidos y gestión de excepciones.',
      'Torre de control Power BI per nivell de servei, lead times, estat de comandes i gestió d’excepcions.',
    ),
    archetype: 'bi',
    metricPack: 'service',
    technologies: ['Power BI', 'DAX', 'Power Query', 'SQL', 'Star Schema', 'PostgreSQL', 'Excel'],
  },
]

const directBySlug = new Map(portfolioCaseProfiles.map((profile) => [profile.slug, profile]))
const aliasToSlug = new Map<string, string>()
for (const profile of portfolioCaseProfiles) {
  for (const alias of profile.aliases || []) aliasToSlug.set(alias, profile.slug)
}

export function getPortfolioCaseProfile(slug: string) {
  return directBySlug.get(slug) || directBySlug.get(aliasToSlug.get(slug) || '')
}

export function getPortfolioCaseProfileById(id: string) {
  return portfolioCaseProfiles.find((profile) => profile.id === id)
}

export function localizePortfolioCase(profile: PortfolioCaseProfile, lang: SiteLanguage) {
  const industry = {
    agent: L('Business operations', 'Operaciones empresariales', 'Operacions empresarials'),
    data: L('Data platforms', 'Plataformas de datos', 'Plataformes de dades'),
    forecast: L('Planning', 'Planificación', 'Planificació'),
    bi: L('Business intelligence', 'Business intelligence', 'Business intelligence'),
    customer: L('Customer analytics', 'Customer analytics', 'Customer analytics'),
    risk: L('Financial services', 'Servicios financieros', 'Serveis financers'),
    optimization: L('Operations', 'Operaciones', 'Operacions'),
    finance: L('Finance', 'Finanzas', 'Finances'),
    quant: L('Capital markets', 'Mercados financieros', 'Mercats financers'),
    specialized: L('Strategy & operations', 'Estrategia y operaciones', 'Estratègia i operacions'),
    vision: L('Computer vision', 'Visión artificial', 'Visió artificial'),
  }[profile.archetype][lang]

  const challenge = {
    agent: L('AI & automation', 'IA y automatización', 'IA i automatització'),
    data: L('Data engineering', 'Ingeniería de datos', 'Enginyeria de dades'),
    forecast: L('Forecasting & planning', 'Forecasting y planificación', 'Forecasting i planificació'),
    bi: L('Analytics & reporting', 'Analytics y reporting', 'Analytics i reporting'),
    customer: L('Prediction & customer decisions', 'Predicción y decisiones de cliente', 'Predicció i decisions de client'),
    risk: L('Risk & decision', 'Riesgo y decisión', 'Risc i decisió'),
    optimization: L('Optimisation', 'Optimización', 'Optimització'),
    finance: L('Financial modelling', 'Modelización financiera', 'Modelització financera'),
    quant: L('Quantitative systems', 'Sistemas cuantitativos', 'Sistemes quantitatius'),
    specialized: L('Decision systems', 'Sistemas de decisión', 'Sistemes de decisió'),
    vision: L('Computer vision', 'Visión artificial', 'Visió artificial'),
  }[profile.archetype][lang]

  return {
    title: profile.title[lang],
    summary: profile.summary[lang],
    industry,
    challenge,
  }
}

type Metric = { label: string; value: string; note: string }

export type PortfolioCasePresentation = {
  title: string
  summary: string
  industry: string
  challenge: string
  hook: string
  overviewProblem: string
  overviewChanged: string
  overviewUtility: string
  proofStatement: string
  heroFacts: Array<{ label: string; value: string }>
  scenarioHeadline: string
  scenarioSummary: string
  businessMetrics: Metric[]
  case: {
    back: string
    eyebrow: string
    title: string
    intro: string
    thesisLabel: string
    thesis: string
    problemLabel: string
    problemTitle: string
    problemBody: string
    problemRows: Array<{ title: string; body: string }>
    logicLabel: string
    logicTitle: string
    logicBody: string
    logicVisual: {
      eyebrow: string
      title: string
      body: string
      horizons: Array<{ horizon: string; label: string; note: string }>
      takeaway: string
    }
    systemLabel: string
    systemTitle: string
    systemBody: string
    systemRows: string[]
    architectureLabel: string
    architectureTitle: string
    architectureBody: string
    architecture: {
      eyebrow: string
      title: string
      body: string
      steps: Array<{ title: string; detail: string }>
      integrations: Array<{ title: string; detail: string }>
    }
    evidenceLabel: string
    evidenceTitle: string
    evidenceBody: string
    evidenceGroupLabels: [string, string]
    evidence: Metric[]
    technicalLabel: string
    technicalTitle: string
    technicalProof: string
    takeawayLabel: string
    takeawayTitle: string
    takeawayBody: string
    repository: string
    contact: string
    referenceEconomics: string
  }
}

type ArchetypeCopy = {
  problemTitle: Localized
  problemBody: Localized
  problemRows: Record<SiteLanguage, Array<{ title: string; body: string }>>
  logicTitle: Localized
  logicBody: Localized
  stages: Record<SiteLanguage, Array<{ horizon: string; label: string; note: string }>>
  logicTakeaway: Localized
  systemTitle: Localized
  systemBody: Localized
  systemRows: Record<SiteLanguage, string[]>
  takeawayTitle: Localized
  takeawayBody: Localized
}

const archetypeCopy: Record<PortfolioCaseArchetype, ArchetypeCopy> = {
  agent: {
    problemTitle: L('Automation fails when reasoning and action are mixed without control.', 'La automatización falla cuando razonamiento y acción se mezclan sin control.', 'L’automatització falla quan raonament i acció es barregen sense control.'),
    problemBody: L('The operating risk is not the model itself; it is losing state, accountability or approval around a business action.', 'El riesgo operativo no es el modelo: es perder estado, responsabilidad o aprobación alrededor de una acción de negocio.', 'El risc operatiu no és el model: és perdre estat, responsabilitat o aprovació al voltant d’una acció de negoci.'),
    problemRows: {
      en: [{ title: 'Lost context', body: 'Long workflows break when state lives inside one model call.' }, { title: 'Uncontrolled actions', body: 'Sensitive actions need explicit gates, not implicit trust.' }, { title: 'Invisible exceptions', body: 'Retries and failures must stay observable and recoverable.' }],
      es: [{ title: 'Contexto perdido', body: 'Los workflows largos fallan si el estado vive dentro de una única llamada.' }, { title: 'Acciones sin control', body: 'Las acciones sensibles necesitan gates explícitos, no confianza implícita.' }, { title: 'Excepciones invisibles', body: 'Retries y fallos deben quedar visibles y ser recuperables.' }],
      ca: [{ title: 'Context perdut', body: 'Els workflows llargs fallen si l’estat viu dins d’una única crida.' }, { title: 'Accions sense control', body: 'Les accions sensibles necessiten gates explícits, no confiança implícita.' }, { title: 'Excepcions invisibles', body: 'Retries i errors han de quedar visibles i ser recuperables.' }],
    },
    logicTitle: L('From request to controlled action.', 'De una petición a una acción controlada.', 'D’una petició a una acció controlada.'),
    logicBody: L('Each stage has one responsibility and one observable hand-off.', 'Cada etapa tiene una responsabilidad y un hand-off observable.', 'Cada etapa té una responsabilitat i un hand-off observable.'),
    stages: {
      en: [{ horizon: '01', label: 'Understand', note: 'Capture intent, context and constraints.' }, { horizon: '02', label: 'Plan', note: 'Choose the workflow and tools required.' }, { horizon: '03', label: 'Approve', note: 'Gate material actions before execution.' }, { horizon: '04', label: 'Execute', note: 'Run, log and recover the external action.' }],
      es: [{ horizon: '01', label: 'Entender', note: 'Capturar intención, contexto y restricciones.' }, { horizon: '02', label: 'Planificar', note: 'Elegir workflow y herramientas necesarias.' }, { horizon: '03', label: 'Aprobar', note: 'Validar acciones materiales antes de ejecutarlas.' }, { horizon: '04', label: 'Ejecutar', note: 'Ejecutar, registrar y recuperar la acción externa.' }],
      ca: [{ horizon: '01', label: 'Entendre', note: 'Capturar intenció, context i restriccions.' }, { horizon: '02', label: 'Planificar', note: 'Escollir workflow i eines necessàries.' }, { horizon: '03', label: 'Aprovar', note: 'Validar accions materials abans d’executar-les.' }, { horizon: '04', label: 'Executar', note: 'Executar, registrar i recuperar l’acció externa.' }],
    },
    logicTakeaway: L('AI adds value when control survives the hand-off from reasoning to action.', 'La IA aporta valor cuando el control sobrevive al paso del razonamiento a la acción.', 'La IA aporta valor quan el control sobreviu al pas del raonament a l’acció.'),
    systemTitle: L('A workflow system, not a chain of prompts.', 'Un sistema de workflows, no una cadena de prompts.', 'Un sistema de workflows, no una cadena de prompts.'),
    systemBody: L('The implementation separates context, orchestration, approval and execution.', 'La implementación separa contexto, orquestación, aprobación y ejecución.', 'La implementació separa context, orquestració, aprovació i execució.'),
    systemRows: {
      en: ['Persist workflow state outside the model.', 'Keep deterministic steps deterministic.', 'Insert approval where business risk changes.', 'Log every hand-off, exception and external action.'],
      es: ['Persistir el estado del workflow fuera del modelo.', 'Mantener determinista lo que no necesita IA.', 'Insertar aprobación donde cambia el riesgo de negocio.', 'Registrar cada hand-off, excepción y acción externa.'],
      ca: ['Persistir l’estat del workflow fora del model.', 'Mantenir determinista allò que no necessita IA.', 'Inserir aprovació on canvia el risc de negoci.', 'Registrar cada hand-off, excepció i acció externa.'],
    },
    takeawayTitle: L('Useful AI automation is controlled automation.', 'La automatización con IA solo es útil cuando sigue bajo control.', 'L’automatització amb IA només és útil quan continua sota control.'),
    takeawayBody: L('The commercial value comes from reducing repetitive work without making sensitive decisions less traceable.', 'El valor comercial aparece al reducir trabajo repetitivo sin volver menos trazables las decisiones sensibles.', 'El valor comercial apareix en reduir treball repetitiu sense fer menys traçables les decisions sensibles.'),
  },
  data: {
    problemTitle: L('Data becomes expensive when every downstream use rebuilds the same logic.', 'Los datos se vuelven caros cuando cada uso reconstruye la misma lógica.', 'Les dades es tornen cares quan cada ús reconstrueix la mateixa lògica.'),
    problemBody: L('The issue is reliability: inconsistent contracts, late failures and unclear ownership turn analytics into manual reconciliation.', 'El problema es la fiabilidad: contratos inconsistentes, fallos tardíos y ownership difuso convierten analytics en conciliación manual.', 'El problema és la fiabilitat: contractes inconsistents, errors tardans i ownership difús converteixen analytics en conciliació manual.'),
    problemRows: {
      en: [{ title: 'Broken inputs', body: 'Schema or source changes reach consumers too late.' }, { title: 'Repeated logic', body: 'Teams rebuild transformations and definitions independently.' }, { title: 'Slow diagnosis', body: 'Failures are difficult to locate across the data path.' }],
      es: [{ title: 'Inputs rotos', body: 'Cambios de esquema o fuente llegan demasiado tarde al consumidor.' }, { title: 'Lógica repetida', body: 'Cada equipo reconstruye transformaciones y definiciones.' }, { title: 'Diagnóstico lento', body: 'Los fallos son difíciles de localizar a lo largo del flujo.' }],
      ca: [{ title: 'Inputs trencats', body: 'Canvis d’esquema o font arriben massa tard al consumidor.' }, { title: 'Lògica repetida', body: 'Cada equip reconstrueix transformacions i definicions.' }, { title: 'Diagnòstic lent', body: 'Els errors són difícils de localitzar al llarg del flux.' }],
    },
    logicTitle: L('From raw event to trusted analytical state.', 'Del dato bruto a un estado analítico fiable.', 'De la dada bruta a un estat analític fiable.'),
    logicBody: L('Quality is checked before the data becomes someone else’s decision problem.', 'La calidad se controla antes de que el dato se convierta en el problema de decisión de otro equipo.', 'La qualitat es controla abans que la dada es converteixi en el problema de decisió d’un altre equip.'),
    stages: {
      en: [{ horizon: '01', label: 'Ingest', note: 'Capture data with explicit contracts.' }, { horizon: '02', label: 'Transform', note: 'Create stable analytical grain.' }, { horizon: '03', label: 'Validate', note: 'Fail early on quality and schema rules.' }, { horizon: '04', label: 'Serve', note: 'Expose governed data to downstream users.' }],
      es: [{ horizon: '01', label: 'Ingerir', note: 'Capturar datos con contratos explícitos.' }, { horizon: '02', label: 'Transformar', note: 'Crear un grano analítico estable.' }, { horizon: '03', label: 'Validar', note: 'Fallar pronto ante reglas de calidad y esquema.' }, { horizon: '04', label: 'Servir', note: 'Exponer datos gobernados a consumidores.' }],
      ca: [{ horizon: '01', label: 'Ingerir', note: 'Capturar dades amb contractes explícits.' }, { horizon: '02', label: 'Transformar', note: 'Crear un gra analític estable.' }, { horizon: '03', label: 'Validar', note: 'Fallar aviat davant regles de qualitat i esquema.' }, { horizon: '04', label: 'Servir', note: 'Exposar dades governades als consumidors.' }],
    },
    logicTakeaway: L('Trust is built upstream, before a dashboard or model consumes the data.', 'La confianza se construye upstream, antes de que un dashboard o modelo consuma el dato.', 'La confiança es construeix upstream, abans que un dashboard o model consumeixi la dada.'),
    systemTitle: L('One governed path from source to consumption.', 'Un camino gobernado desde la fuente hasta el consumo.', 'Un camí governat des de la font fins al consum.'),
    systemBody: L('Extraction, transformation, quality and serving stay separated and observable.', 'Extracción, transformación, calidad y serving permanecen separados y observables.', 'Extracció, transformació, qualitat i serving es mantenen separats i observables.'),
    systemRows: {
      en: ['Define source and schema contracts.', 'Separate raw, staging and business-ready layers.', 'Automate tests and release gates.', 'Monitor latency, freshness and failures.'],
      es: ['Definir contratos de fuente y esquema.', 'Separar capas raw, staging y business-ready.', 'Automatizar tests y gates de release.', 'Monitorizar latencia, frescura y fallos.'],
      ca: ['Definir contractes de font i esquema.', 'Separar capes raw, staging i business-ready.', 'Automatitzar tests i gates de release.', 'Monitoritzar latència, frescor i errors.'],
    },
    takeawayTitle: L('Good data engineering makes downstream decisions boringly reliable.', 'Una buena ingeniería de datos hace que las decisiones posteriores sean predeciblemente fiables.', 'Una bona enginyeria de dades fa que les decisions posteriors siguin predeciblement fiables.'),
    takeawayBody: L('The value is less reconciliation, fewer silent failures and a faster path from operational events to trusted decisions.', 'El valor está en menos conciliación, menos fallos silenciosos y un camino más rápido desde el evento operativo hasta la decisión.', 'El valor és menys conciliació, menys errors silenciosos i un camí més ràpid des de l’esdeveniment operatiu fins a la decisió.'),
  },
  forecast: {
    problemTitle: L('A forecast only matters at the horizon where a decision is made.', 'Un forecast solo importa en el horizonte donde se toma una decisión.', 'Un forecast només importa a l’horitzó on es pren una decisió.'),
    problemBody: L('Aggregate accuracy can hide weak planning performance and lead to the wrong stock, capacity or financial action.', 'La precisión agregada puede esconder un mal rendimiento de planificación y llevar a decisiones equivocadas de stock, capacidad o finanzas.', 'La precisió agregada pot amagar un mal rendiment de planificació i portar a decisions equivocades d’estoc, capacitat o finances.'),
    problemRows: {
      en: [{ title: 'Hidden bias', body: 'Average error can look acceptable while direction is systematically wrong.' }, { title: 'Wrong horizon', body: 'A model can be useful short term and weak for longer planning.' }, { title: 'No decision link', body: 'Accuracy without an operating action creates little value.' }],
      es: [{ title: 'Sesgo oculto', body: 'El error medio puede parecer correcto mientras la dirección falla de forma sistemática.' }, { title: 'Horizonte equivocado', body: 'Un modelo puede funcionar a corto plazo y fallar para planificación larga.' }, { title: 'Sin decisión', body: 'La precisión sin una acción operativa crea poco valor.' }],
      ca: [{ title: 'Biaix ocult', body: 'L’error mitjà pot semblar correcte mentre la direcció falla de manera sistemàtica.' }, { title: 'Horitzó equivocat', body: 'Un model pot funcionar a curt termini i fallar per planificació llarga.' }, { title: 'Sense decisió', body: 'La precisió sense una acció operativa crea poc valor.' }],
    },
    logicTitle: L('Evaluate the model where the business uses it.', 'Evaluar el modelo donde el negocio lo utiliza.', 'Avaluar el model on el negoci l’utilitza.'),
    logicBody: L('Forecast quality is separated by horizon and compared with simple baselines.', 'La calidad del forecast se separa por horizonte y se compara con baselines sencillos.', 'La qualitat del forecast se separa per horitzó i es compara amb baselines senzills.'),
    stages: {
      en: [{ horizon: '1M', label: 'Near term', note: 'Immediate operating signal.' }, { horizon: '3M', label: 'Short range', note: 'Planning before uncertainty compounds.' }, { horizon: '6M', label: 'Medium range', note: 'Model degradation becomes visible.' }, { horizon: '9M', label: 'Long range', note: 'Usefulness is judged as its own decision.' }],
      es: [{ horizon: '1M', label: 'Muy corto plazo', note: 'Señal operativa inmediata.' }, { horizon: '3M', label: 'Corto plazo', note: 'Planificación antes de que se acumule incertidumbre.' }, { horizon: '6M', label: 'Medio plazo', note: 'La degradación del modelo queda visible.' }, { horizon: '9M', label: 'Largo plazo', note: 'La utilidad se evalúa como una decisión propia.' }],
      ca: [{ horizon: '1M', label: 'Molt curt termini', note: 'Senyal operatiu immediat.' }, { horizon: '3M', label: 'Curt termini', note: 'Planificació abans que s’acumuli incertesa.' }, { horizon: '6M', label: 'Mitjà termini', note: 'La degradació del model queda visible.' }, { horizon: '9M', label: 'Llarg termini', note: 'La utilitat s’avalua com una decisió pròpia.' }],
    },
    logicTakeaway: L('Model complexity only matters if it changes a planning decision.', 'La complejidad del modelo solo importa si cambia una decisión de planificación.', 'La complexitat del model només importa si canvia una decisió de planificació.'),
    systemTitle: L('From forecast quality to planning action.', 'De la calidad del forecast a una acción de planificación.', 'De la qualitat del forecast a una acció de planificació.'),
    systemBody: L('The system connects prediction, backtesting, scenario assumptions and the decision layer.', 'El sistema conecta predicción, backtesting, supuestos de escenario y la capa de decisión.', 'El sistema connecta predicció, backtesting, supòsits d’escenari i la capa de decisió.'),
    systemRows: {
      en: ['Benchmark against simple statistical baselines.', 'Evaluate error and bias by horizon.', 'Expose scenarios and planning assumptions.', 'Translate outputs into stock, capacity or financial decisions.'],
      es: ['Comparar contra baselines estadísticos sencillos.', 'Evaluar error y sesgo por horizonte.', 'Exponer escenarios y supuestos de planificación.', 'Traducir outputs a decisiones de stock, capacidad o finanzas.'],
      ca: ['Comparar contra baselines estadístics senzills.', 'Avaluar error i biaix per horitzó.', 'Exposar escenaris i supòsits de planificació.', 'Traduir outputs a decisions d’estoc, capacitat o finances.'],
    },
    takeawayTitle: L('Forecasting creates value when it changes the plan.', 'El forecasting crea valor cuando cambia el plan.', 'El forecasting crea valor quan canvia el pla.'),
    takeawayBody: L('The useful output is not the prediction itself; it is a better decision made with explicit uncertainty.', 'El output útil no es la predicción en sí, sino una mejor decisión tomada con incertidumbre explícita.', 'L’output útil no és la predicció en si, sinó una millor decisió presa amb incertesa explícita.'),
  },
  bi: {
    problemTitle: L('A dashboard is useful only when the KPI structure leads to an action.', 'Un dashboard solo es útil cuando la estructura de KPIs conduce a una acción.', 'Un dashboard només és útil quan l’estructura de KPIs condueix a una acció.'),
    problemBody: L('Reporting becomes noise when definitions differ, drill-down stops too early or nobody knows what decision follows the metric.', 'El reporting se convierte en ruido cuando cambian las definiciones, el drill-down se queda corto o nadie sabe qué decisión sigue a la métrica.', 'El reporting es converteix en soroll quan canvien les definicions, el drill-down es queda curt o ningú sap quina decisió segueix la mètrica.'),
    problemRows: {
      en: [{ title: 'Conflicting KPIs', body: 'Teams read different definitions for the same business question.' }, { title: 'Static reporting', body: 'A top-line number does not reveal the driver underneath.' }, { title: 'No next action', body: 'The report explains what happened but not where to investigate.' }],
      es: [{ title: 'KPIs contradictorios', body: 'Los equipos leen definiciones distintas para la misma pregunta.' }, { title: 'Reporting estático', body: 'El número agregado no revela el driver que hay debajo.' }, { title: 'Sin siguiente acción', body: 'El informe explica qué pasó, pero no dónde investigar.' }],
      ca: [{ title: 'KPIs contradictoris', body: 'Els equips llegeixen definicions diferents per la mateixa pregunta.' }, { title: 'Reporting estàtic', body: 'El número agregat no revela el driver que hi ha a sota.' }, { title: 'Sense següent acció', body: 'L’informe explica què va passar, però no on investigar.' }],
    },
    logicTitle: L('From KPI to driver to action.', 'Del KPI al driver y del driver a la acción.', 'Del KPI al driver i del driver a l’acció.'),
    logicBody: L('The information architecture follows the questions a manager actually asks.', 'La arquitectura de información sigue las preguntas que realmente hace un responsable.', 'L’arquitectura d’informació segueix les preguntes que realment fa un responsable.'),
    stages: {
      en: [{ horizon: '01', label: 'See', note: 'Read the state of the business.' }, { horizon: '02', label: 'Compare', note: 'Contrast plan, period or segment.' }, { horizon: '03', label: 'Drill', note: 'Locate the driver behind the variance.' }, { horizon: '04', label: 'Act', note: 'Move from metric to management action.' }],
      es: [{ horizon: '01', label: 'Ver', note: 'Leer el estado del negocio.' }, { horizon: '02', label: 'Comparar', note: 'Contrastar plan, periodo o segmento.' }, { horizon: '03', label: 'Profundizar', note: 'Localizar el driver detrás de la desviación.' }, { horizon: '04', label: 'Actuar', note: 'Pasar de la métrica a la acción de gestión.' }],
      ca: [{ horizon: '01', label: 'Veure', note: 'Llegir l’estat del negoci.' }, { horizon: '02', label: 'Comparar', note: 'Contrastar pla, període o segment.' }, { horizon: '03', label: 'Aprofundir', note: 'Localitzar el driver darrere la desviació.' }, { horizon: '04', label: 'Actuar', note: 'Passar de la mètrica a l’acció de gestió.' }],
    },
    logicTakeaway: L('The interface should shorten the path from question to decision.', 'La interfaz debe acortar el camino entre pregunta y decisión.', 'La interfície ha d’escurçar el camí entre pregunta i decisió.'),
    systemTitle: L('One semantic layer, multiple management questions.', 'Una capa semántica, múltiples preguntas de gestión.', 'Una capa semàntica, múltiples preguntes de gestió.'),
    systemBody: L('Definitions live in the model; visuals expose them through a repeatable drill-down path.', 'Las definiciones viven en el modelo; los visuales las exponen mediante un drill-down repetible.', 'Les definicions viuen al model; els visuals les exposen mitjançant un drill-down repetible.'),
    systemRows: {
      en: ['Define KPIs once in the semantic layer.', 'Design filters around management questions.', 'Connect summary views to operational detail.', 'Keep refresh and data quality visible.'],
      es: ['Definir KPIs una sola vez en la capa semántica.', 'Diseñar filtros alrededor de preguntas de gestión.', 'Conectar vistas ejecutivas con detalle operativo.', 'Hacer visibles refresh y calidad de datos.'],
      ca: ['Definir KPIs una sola vegada a la capa semàntica.', 'Dissenyar filtres al voltant de preguntes de gestió.', 'Connectar vistes executives amb detall operatiu.', 'Fer visibles refresh i qualitat de dades.'],
    },
    takeawayTitle: L('Good BI reduces the distance between a signal and a management action.', 'Un buen BI reduce la distancia entre una señal y una acción de gestión.', 'Un bon BI redueix la distància entre un senyal i una acció de gestió.'),
    takeawayBody: L('The value is not a prettier dashboard; it is a common definition layer and a faster path to the underlying driver.', 'El valor no es un dashboard más bonito, sino una definición común y un camino más rápido hasta el driver real.', 'El valor no és un dashboard més bonic, sinó una definició comuna i un camí més ràpid fins al driver real.'),
  },
  customer: {
    problemTitle: L('Prediction is useful only when it changes who gets attention and why.', 'La predicción solo es útil cuando cambia quién recibe atención y por qué.', 'La predicció només és útil quan canvia qui rep atenció i per què.'),
    problemBody: L('Ranking, churn or segmentation models fail commercially when relevance is disconnected from value, timing or the next action.', 'Los modelos de ranking, churn o segmentación fallan comercialmente cuando la relevancia no se conecta con valor, timing o siguiente acción.', 'Els models de ranking, churn o segmentació fallen comercialment quan la rellevància no es connecta amb valor, timing o següent acció.'),
    problemRows: {
      en: [{ title: 'Wrong priority', body: 'High probability is not always high business value.' }, { title: 'Weak explanation', body: 'Teams need to know why an item or customer is prioritized.' }, { title: 'No action layer', body: 'A score without an intervention path stays analytical.' }],
      es: [{ title: 'Prioridad equivocada', body: 'Alta probabilidad no siempre significa alto valor de negocio.' }, { title: 'Explicación débil', body: 'El equipo necesita saber por qué se prioriza un cliente o elemento.' }, { title: 'Sin capa de acción', body: 'Un score sin intervención se queda en análisis.' }],
      ca: [{ title: 'Prioritat equivocada', body: 'Alta probabilitat no sempre significa alt valor de negoci.' }, { title: 'Explicació feble', body: 'L’equip necessita saber per què es prioritza un client o element.' }, { title: 'Sense capa d’acció', body: 'Un score sense intervenció es queda en anàlisi.' }],
    },
    logicTitle: L('Score, rank and act with context.', 'Puntuar, priorizar y actuar con contexto.', 'Puntuar, prioritzar i actuar amb context.'),
    logicBody: L('The model is evaluated as part of a prioritization system, not in isolation.', 'El modelo se evalúa como parte de un sistema de priorización, no de forma aislada.', 'El model s’avalua com a part d’un sistema de priorització, no de manera aïllada.'),
    stages: {
      en: [{ horizon: '01', label: 'Signal', note: 'Build behavioural and contextual features.' }, { horizon: '02', label: 'Score', note: 'Estimate relevance, risk or value.' }, { horizon: '03', label: 'Rank', note: 'Apply business constraints and priority.' }, { horizon: '04', label: 'Act', note: 'Expose the next action to the user.' }],
      es: [{ horizon: '01', label: 'Señal', note: 'Construir features de comportamiento y contexto.' }, { horizon: '02', label: 'Score', note: 'Estimar relevancia, riesgo o valor.' }, { horizon: '03', label: 'Priorizar', note: 'Aplicar restricciones y prioridad de negocio.' }, { horizon: '04', label: 'Actuar', note: 'Exponer la siguiente acción al usuario.' }],
      ca: [{ horizon: '01', label: 'Senyal', note: 'Construir features de comportament i context.' }, { horizon: '02', label: 'Score', note: 'Estimar rellevància, risc o valor.' }, { horizon: '03', label: 'Prioritzar', note: 'Aplicar restriccions i prioritat de negoci.' }, { horizon: '04', label: 'Actuar', note: 'Exposar la següent acció a l’usuari.' }],
    },
    logicTakeaway: L('The score matters only when the ranking improves a real intervention.', 'El score solo importa cuando la priorización mejora una intervención real.', 'El score només importa quan la priorització millora una intervenció real.'),
    systemTitle: L('From behavioural data to a prioritized action list.', 'De datos de comportamiento a una lista de acciones priorizadas.', 'De dades de comportament a una llista d’accions prioritzades.'),
    systemBody: L('Prediction, explanation and business rules stay connected in the serving layer.', 'Predicción, explicación y reglas de negocio permanecen conectadas en la capa de serving.', 'Predicció, explicació i regles de negoci romanen connectades a la capa de serving.'),
    systemRows: {
      en: ['Combine behavioural and contextual signals.', 'Benchmark predictive models against simple rules.', 'Make explanations visible at decision time.', 'Apply business constraints before ranking or intervention.'],
      es: ['Combinar señales de comportamiento y contexto.', 'Comparar modelos predictivos contra reglas sencillas.', 'Mostrar explicaciones en el momento de decidir.', 'Aplicar restricciones de negocio antes de priorizar o intervenir.'],
      ca: ['Combinar senyals de comportament i context.', 'Comparar models predictius contra regles senzilles.', 'Mostrar explicacions en el moment de decidir.', 'Aplicar restriccions de negoci abans de prioritzar o intervenir.'],
    },
    takeawayTitle: L('Customer analytics creates value when prioritization changes.', 'Customer analytics crea valor cuando cambia la prioridad de actuación.', 'Customer analytics crea valor quan canvia la prioritat d’actuació.'),
    takeawayBody: L('A useful model does not stop at prediction; it makes the next intervention more selective and explainable.', 'Un modelo útil no termina en la predicción: hace la siguiente intervención más selectiva y explicable.', 'Un model útil no acaba en la predicció: fa la següent intervenció més selectiva i explicable.'),
  },
  risk: {
    problemTitle: L('Risk decisions fail when the score is separated from the cost of being wrong.', 'Las decisiones de riesgo fallan cuando el score se separa del coste de equivocarse.', 'Les decisions de risc fallen quan el score se separa del cost d’equivocar-se.'),
    problemBody: L('Accuracy alone cannot choose a lending, fraud or review threshold. The business needs expected loss, false-positive cost and capacity constraints.', 'La accuracy por sí sola no puede elegir un umbral de crédito, fraude o revisión. El negocio necesita pérdida esperada, coste de falsos positivos y capacidad.', 'L’accuracy per si sola no pot escollir un llindar de crèdit, frau o revisió. El negoci necessita pèrdua esperada, cost de falsos positius i capacitat.'),
    problemRows: {
      en: [{ title: 'Wrong threshold', body: 'A technically strong model can create a poor operating decision.' }, { title: 'Hidden trade-off', body: 'False positives and false negatives have different economics.' }, { title: 'No explanation', body: 'Material decisions need inspectable drivers.' }],
      es: [{ title: 'Umbral equivocado', body: 'Un buen modelo puede generar una mala decisión operativa.' }, { title: 'Trade-off oculto', body: 'Falsos positivos y falsos negativos tienen economías distintas.' }, { title: 'Sin explicación', body: 'Las decisiones materiales necesitan drivers inspeccionables.' }],
      ca: [{ title: 'Llindar equivocat', body: 'Un bon model pot generar una mala decisió operativa.' }, { title: 'Trade-off ocult', body: 'Falsos positius i falsos negatius tenen economies diferents.' }, { title: 'Sense explicació', body: 'Les decisions materials necessiten drivers inspeccionables.' }],
    },
    logicTitle: L('From probability to an explicit risk decision.', 'De una probabilidad a una decisión de riesgo explícita.', 'D’una probabilitat a una decisió de risc explícita.'),
    logicBody: L('The operating threshold is chosen using cost, risk appetite and review capacity.', 'El umbral operativo se elige con coste, apetito de riesgo y capacidad de revisión.', 'El llindar operatiu s’escull amb cost, apetit de risc i capacitat de revisió.'),
    stages: {
      en: [{ horizon: '01', label: 'Estimate', note: 'Produce a calibrated risk score.' }, { horizon: '02', label: 'Explain', note: 'Expose material drivers.' }, { horizon: '03', label: 'Threshold', note: 'Price the cost of each error type.' }, { horizon: '04', label: 'Decide', note: 'Approve, review, decline or investigate.' }],
      es: [{ horizon: '01', label: 'Estimar', note: 'Producir un score de riesgo calibrado.' }, { horizon: '02', label: 'Explicar', note: 'Exponer drivers materiales.' }, { horizon: '03', label: 'Umbral', note: 'Valorar el coste de cada tipo de error.' }, { horizon: '04', label: 'Decidir', note: 'Aprobar, revisar, rechazar o investigar.' }],
      ca: [{ horizon: '01', label: 'Estimar', note: 'Produir un score de risc calibrat.' }, { horizon: '02', label: 'Explicar', note: 'Exposar drivers materials.' }, { horizon: '03', label: 'Llindar', note: 'Valorar el cost de cada tipus d’error.' }, { horizon: '04', label: 'Decidir', note: 'Aprovar, revisar, rebutjar o investigar.' }],
    },
    logicTakeaway: L('The best threshold is a business decision supported by model evidence.', 'El mejor umbral es una decisión de negocio respaldada por evidencia del modelo.', 'El millor llindar és una decisió de negoci recolzada per evidència del model.'),
    systemTitle: L('Risk model, economics and decision logic in one path.', 'Modelo de riesgo, economía y lógica de decisión en un mismo camino.', 'Model de risc, economia i lògica de decisió en un mateix camí.'),
    systemBody: L('Prediction is connected to expected cost, explanation and review workflow.', 'La predicción se conecta con coste esperado, explicación y workflow de revisión.', 'La predicció es connecta amb cost esperat, explicació i workflow de revisió.'),
    systemRows: {
      en: ['Calibrate the probability estimate.', 'Measure performance beyond accuracy.', 'Optimize the operating threshold under explicit costs.', 'Expose explanations and review queues.'],
      es: ['Calibrar la probabilidad estimada.', 'Medir rendimiento más allá de accuracy.', 'Optimizar el umbral operativo con costes explícitos.', 'Exponer explicaciones y colas de revisión.'],
      ca: ['Calibrar la probabilitat estimada.', 'Mesurar rendiment més enllà d’accuracy.', 'Optimitzar el llindar operatiu amb costos explícits.', 'Exposar explicacions i cues de revisió.'],
    },
    takeawayTitle: L('Risk modelling creates value when it improves the decision threshold.', 'El modelado de riesgo crea valor cuando mejora el umbral de decisión.', 'El modelatge de risc crea valor quan millora el llindar de decisió.'),
    takeawayBody: L('The commercial outcome comes from better allocation of risk and review capacity, not from a higher headline accuracy.', 'El resultado comercial viene de asignar mejor riesgo y capacidad de revisión, no de una accuracy más alta en portada.', 'El resultat comercial ve d’assignar millor risc i capacitat de revisió, no d’una accuracy més alta en portada.'),
  },
  optimization: {
    problemTitle: L('Operational decisions become expensive when constraints are handled manually.', 'Las decisiones operativas se vuelven caras cuando las restricciones se gestionan manualmente.', 'Les decisions operatives es tornen cares quan les restriccions es gestionen manualment.'),
    problemBody: L('Allocation, pricing, scheduling or capacity problems require explicit trade-offs that heuristics often hide.', 'Asignación, pricing, scheduling o capacidad requieren trade-offs explícitos que las heurísticas suelen esconder.', 'Assignació, pricing, scheduling o capacitat requereixen trade-offs explícits que les heurístiques solen amagar.'),
    problemRows: {
      en: [{ title: 'Competing objectives', body: 'Cost, service and utilization pull the decision in different directions.' }, { title: 'Real constraints', body: 'Capacity, skills, stock or policy limits make naive rules infeasible.' }, { title: 'No scenario view', body: 'Teams cannot quantify what changes before implementing it.' }],
      es: [{ title: 'Objetivos en conflicto', body: 'Coste, servicio y utilización empujan la decisión en direcciones distintas.' }, { title: 'Restricciones reales', body: 'Capacidad, skills, stock o políticas hacen inviables reglas ingenuas.' }, { title: 'Sin escenarios', body: 'El equipo no puede cuantificar el cambio antes de implantarlo.' }],
      ca: [{ title: 'Objectius en conflicte', body: 'Cost, servei i utilització empenyen la decisió en direccions diferents.' }, { title: 'Restriccions reals', body: 'Capacitat, skills, estoc o polítiques fan inviables regles ingènues.' }, { title: 'Sense escenaris', body: 'L’equip no pot quantificar el canvi abans d’implantar-lo.' }],
    },
    logicTitle: L('Make the trade-off explicit before choosing the action.', 'Hacer explícito el trade-off antes de elegir la acción.', 'Fer explícit el trade-off abans d’escollir l’acció.'),
    logicBody: L('The system compares feasible alternatives under the constraints that actually govern operations.', 'El sistema compara alternativas factibles bajo las restricciones que realmente gobiernan la operación.', 'El sistema compara alternatives factibles sota les restriccions que realment governen l’operació.'),
    stages: {
      en: [{ horizon: '01', label: 'Model', note: 'Represent objectives and constraints.' }, { horizon: '02', label: 'Generate', note: 'Create feasible alternatives.' }, { horizon: '03', label: 'Compare', note: 'Quantify cost, service and risk.' }, { horizon: '04', label: 'Choose', note: 'Return a defensible operating plan.' }],
      es: [{ horizon: '01', label: 'Modelar', note: 'Representar objetivos y restricciones.' }, { horizon: '02', label: 'Generar', note: 'Crear alternativas factibles.' }, { horizon: '03', label: 'Comparar', note: 'Cuantificar coste, servicio y riesgo.' }, { horizon: '04', label: 'Elegir', note: 'Devolver un plan operativo defendible.' }],
      ca: [{ horizon: '01', label: 'Modelar', note: 'Representar objectius i restriccions.' }, { horizon: '02', label: 'Generar', note: 'Crear alternatives factibles.' }, { horizon: '03', label: 'Comparar', note: 'Quantificar cost, servei i risc.' }, { horizon: '04', label: 'Escollir', note: 'Retornar un pla operatiu defensable.' }],
    },
    logicTakeaway: L('Optimization is useful when the constraints are as real as the objective.', 'La optimización es útil cuando las restricciones son tan reales como el objetivo.', 'L’optimització és útil quan les restriccions són tan reals com l’objectiu.'),
    systemTitle: L('From operating constraints to a feasible decision.', 'De restricciones operativas a una decisión factible.', 'De restriccions operatives a una decisió factible.'),
    systemBody: L('The model keeps objectives, constraints, scenarios and outputs inspectable.', 'El modelo mantiene objetivos, restricciones, escenarios y outputs inspeccionables.', 'El model manté objectius, restriccions, escenaris i outputs inspeccionables.'),
    systemRows: {
      en: ['Define the decision variables and constraints.', 'Keep a simple heuristic as a baseline.', 'Compare feasible scenarios under uncertainty.', 'Return the plan with the trade-offs visible.'],
      es: ['Definir variables de decisión y restricciones.', 'Mantener una heurística simple como baseline.', 'Comparar escenarios factibles bajo incertidumbre.', 'Devolver el plan con los trade-offs visibles.'],
      ca: ['Definir variables de decisió i restriccions.', 'Mantenir una heurística simple com a baseline.', 'Comparar escenaris factibles sota incertesa.', 'Retornar el pla amb els trade-offs visibles.'],
    },
    takeawayTitle: L('Optimization creates value when it changes the allocation, not when it only produces a better objective function.', 'La optimización crea valor cuando cambia la asignación, no cuando solo mejora una función objetivo.', 'L’optimització crea valor quan canvia l’assignació, no quan només millora una funció objectiu.'),
    takeawayBody: L('The useful result is a feasible action plan with transparent constraints and economics.', 'El resultado útil es un plan de acción factible con restricciones y economía transparentes.', 'El resultat útil és un pla d’acció factible amb restriccions i economia transparents.'),
  },
  finance: {
    problemTitle: L('A financial model is useful when assumptions remain visible all the way to cash.', 'Un modelo financiero es útil cuando los supuestos siguen visibles hasta llegar a caja.', 'Un model financer és útil quan els supòsits continuen visibles fins arribar a caixa.'),
    problemBody: L('Models lose decision value when drivers, financing and cash-flow consequences are buried in static spreadsheets.', 'Los modelos pierden valor de decisión cuando drivers, financiación y consecuencias de caja quedan enterrados en hojas estáticas.', 'Els models perden valor de decisió quan drivers, finançament i conseqüències de caixa queden enterrats en fulls estàtics.'),
    problemRows: {
      en: [{ title: 'Opaque assumptions', body: 'Users cannot trace which driver changes the result.' }, { title: 'Disconnected cash', body: 'Operating and financing effects are analysed separately.' }, { title: 'Weak downside view', body: 'A base case hides covenant, runway or capital risk.' }],
      es: [{ title: 'Supuestos opacos', body: 'El usuario no puede rastrear qué driver cambia el resultado.' }, { title: 'Caja desconectada', body: 'Operación y financiación se analizan por separado.' }, { title: 'Downside débil', body: 'El caso base esconde riesgo de covenant, runway o capital.' }],
      ca: [{ title: 'Supòsits opacs', body: 'L’usuari no pot rastrejar quin driver canvia el resultat.' }, { title: 'Caixa desconnectada', body: 'Operació i finançament s’analitzen per separat.' }, { title: 'Downside feble', body: 'El cas base amaga risc de covenant, runway o capital.' }],
    },
    logicTitle: L('From assumption to cash-flow consequence.', 'Del supuesto a la consecuencia en cash flow.', 'Del supòsit a la conseqüència en cash flow.'),
    logicBody: L('Every scenario keeps the driver, financial statement and capital implication connected.', 'Cada escenario mantiene conectado el driver, el estado financiero y la implicación de capital.', 'Cada escenari manté connectat el driver, l’estat financer i la implicació de capital.'),
    stages: {
      en: [{ horizon: '01', label: 'Drivers', note: 'Make operating assumptions explicit.' }, { horizon: '02', label: 'Model', note: 'Translate drivers into P&L and cash flow.' }, { horizon: '03', label: 'Stress', note: 'Run downside and constraint scenarios.' }, { horizon: '04', label: 'Decide', note: 'Read runway, returns, covenants or allocation.' }],
      es: [{ horizon: '01', label: 'Drivers', note: 'Hacer explícitos los supuestos operativos.' }, { horizon: '02', label: 'Modelo', note: 'Traducir drivers a P&L y cash flow.' }, { horizon: '03', label: 'Stress', note: 'Ejecutar escenarios downside y restricciones.' }, { horizon: '04', label: 'Decidir', note: 'Leer runway, retornos, covenants o asignación.' }],
      ca: [{ horizon: '01', label: 'Drivers', note: 'Fer explícits els supòsits operatius.' }, { horizon: '02', label: 'Model', note: 'Traduir drivers a P&L i cash flow.' }, { horizon: '03', label: 'Stress', note: 'Executar escenaris downside i restriccions.' }, { horizon: '04', label: 'Decidir', note: 'Llegir runway, retorns, covenants o assignació.' }],
    },
    logicTakeaway: L('The model should explain the result before it optimizes it.', 'El modelo debe explicar el resultado antes de optimizarlo.', 'El model ha d’explicar el resultat abans d’optimitzar-lo.'),
    systemTitle: L('A traceable path from operating drivers to financial decisions.', 'Un camino trazable desde drivers operativos hasta decisiones financieras.', 'Un camí traçable des de drivers operatius fins a decisions financeres.'),
    systemBody: L('Scenario logic, statements, financing and outputs share one source of assumptions.', 'Escenarios, estados, financiación y outputs comparten una única fuente de supuestos.', 'Escenaris, estats, finançament i outputs comparteixen una única font de supòsits.'),
    systemRows: {
      en: ['Centralize assumptions and scenario drivers.', 'Connect P&L, balance-sheet and cash-flow effects.', 'Stress financing and capital constraints.', 'Expose the decision outputs in one comparable view.'],
      es: ['Centralizar supuestos y drivers de escenario.', 'Conectar efectos en P&L, balance y cash flow.', 'Estresar restricciones de financiación y capital.', 'Exponer outputs de decisión en una vista comparable.'],
      ca: ['Centralitzar supòsits i drivers d’escenari.', 'Connectar efectes en P&L, balanç i cash flow.', 'Estressar restriccions de finançament i capital.', 'Exposar outputs de decisió en una vista comparable.'],
    },
    takeawayTitle: L('Financial modelling creates value when management can see which assumption moves cash, risk or return.', 'La modelización financiera crea valor cuando dirección ve qué supuesto mueve caja, riesgo o retorno.', 'La modelització financera crea valor quan direcció veu quin supòsit mou caixa, risc o retorn.'),
    takeawayBody: L('The useful model is not the biggest spreadsheet; it is the one that keeps assumptions, scenarios and decisions traceable.', 'El modelo útil no es la hoja más grande, sino la que mantiene supuestos, escenarios y decisiones trazables.', 'El model útil no és el full més gran, sinó el que manté supòsits, escenaris i decisions traçables.'),
  },
  quant: {
    problemTitle: L('A trading signal is meaningless without market context, costs and reproducible replay.', 'Una señal de trading no significa nada sin contexto de mercado, costes y replay reproducible.', 'Un senyal de trading no significa res sense context de mercat, costos i replay reproduïble.'),
    problemBody: L('Research becomes misleading when order-book events, execution assumptions and strategy metrics are mixed together.', 'El research se vuelve engañoso cuando eventos de order book, supuestos de ejecución y métricas de estrategia se mezclan.', 'El research es torna enganyós quan esdeveniments d’order book, supòsits d’execució i mètriques d’estratègia es barregen.'),
    problemRows: {
      en: [{ title: 'No replay', body: 'Signals cannot be inspected under the same historical event sequence.' }, { title: 'Ignored costs', body: 'Backtests overstate performance when spread and execution are omitted.' }, { title: 'Mixed layers', body: 'Data, signal and strategy logic become difficult to isolate.' }],
      es: [{ title: 'Sin replay', body: 'Las señales no pueden inspeccionarse bajo la misma secuencia histórica.' }, { title: 'Costes ignorados', body: 'El backtest sobreestima rendimiento si omite spread y ejecución.' }, { title: 'Capas mezcladas', body: 'Datos, señal y estrategia se vuelven difíciles de aislar.' }],
      ca: [{ title: 'Sense replay', body: 'Els senyals no es poden inspeccionar sota la mateixa seqüència històrica.' }, { title: 'Costos ignorats', body: 'El backtest sobreestima rendiment si omet spread i execució.' }, { title: 'Capes barrejades', body: 'Dades, senyal i estratègia es tornen difícils d’aïllar.' }],
    },
    logicTitle: L('From market event to cost-aware strategy decision.', 'Del evento de mercado a una decisión de estrategia con costes.', 'De l’esdeveniment de mercat a una decisió d’estratègia amb costos.'),
    logicBody: L('Raw events, derived signals, execution assumptions and evaluation remain separate.', 'Eventos brutos, señales derivadas, supuestos de ejecución y evaluación permanecen separados.', 'Esdeveniments bruts, senyals derivats, supòsits d’execució i avaluació romanen separats.'),
    stages: {
      en: [{ horizon: '01', label: 'Capture', note: 'Store order-book and trade events.' }, { horizon: '02', label: 'Signal', note: 'Derive imbalance and microstructure features.' }, { horizon: '03', label: 'Replay', note: 'Evaluate with consistent execution assumptions.' }, { horizon: '04', label: 'Compare', note: 'Inspect performance after costs.' }],
      es: [{ horizon: '01', label: 'Capturar', note: 'Guardar eventos de order book y trades.' }, { horizon: '02', label: 'Señal', note: 'Derivar imbalance y features de microestructura.' }, { horizon: '03', label: 'Replay', note: 'Evaluar con supuestos de ejecución consistentes.' }, { horizon: '04', label: 'Comparar', note: 'Inspeccionar rendimiento después de costes.' }],
      ca: [{ horizon: '01', label: 'Capturar', note: 'Guardar esdeveniments d’order book i trades.' }, { horizon: '02', label: 'Senyal', note: 'Derivar imbalance i features de microestructura.' }, { horizon: '03', label: 'Replay', note: 'Avaluar amb supòsits d’execució consistents.' }, { horizon: '04', label: 'Comparar', note: 'Inspeccionar rendiment després de costos.' }],
    },
    logicTakeaway: L('Research is credible when the same event path can be replayed with the same assumptions.', 'El research es creíble cuando el mismo camino de eventos puede repetirse con los mismos supuestos.', 'El research és creïble quan el mateix camí d’esdeveniments es pot repetir amb els mateixos supòsits.'),
    systemTitle: L('A separated stack for data, signal, execution and evaluation.', 'Un stack separado para datos, señal, ejecución y evaluación.', 'Un stack separat per dades, senyal, execució i avaluació.'),
    systemBody: L('Market data and strategy research share infrastructure without collapsing into one opaque backtest.', 'Datos de mercado y research comparten infraestructura sin colapsar en un backtest opaco.', 'Dades de mercat i research comparteixen infraestructura sense col·lapsar en un backtest opac.'),
    systemRows: {
      en: ['Persist raw events before deriving signals.', 'Keep feature logic independent from execution logic.', 'Replay history deterministically.', 'Report performance net of explicit cost assumptions.'],
      es: ['Persistir eventos brutos antes de derivar señales.', 'Separar lógica de features y lógica de ejecución.', 'Reproducir histórico de forma determinista.', 'Reportar rendimiento neto de costes explícitos.'],
      ca: ['Persistir esdeveniments bruts abans de derivar senyals.', 'Separar lògica de features i lògica d’execució.', 'Reproduir històric de manera determinista.', 'Reportar rendiment net de costos explícits.'],
    },
    takeawayTitle: L('A quantitative system is useful when it makes assumptions inspectable before it makes performance impressive.', 'Un sistema cuantitativo es útil cuando hace inspeccionables los supuestos antes de hacer impresionante el rendimiento.', 'Un sistema quantitatiu és útil quan fa inspeccionables els supòsits abans de fer impressionant el rendiment.'),
    takeawayBody: L('The point is reproducible research, cost-aware evaluation and a clear boundary between market observation and trading action.', 'El objetivo es research reproducible, evaluación con costes y una frontera clara entre observar mercado y ejecutar.', 'L’objectiu és research reproduïble, avaluació amb costos i una frontera clara entre observar mercat i executar.'),
  },
  specialized: {
    problemTitle: L('Complex business decisions fail when evidence, assumptions and workflow live in separate places.', 'Las decisiones complejas fallan cuando evidencia, supuestos y workflow viven en lugares distintos.', 'Les decisions complexes fallen quan evidència, supòsits i workflow viuen en llocs diferents.'),
    problemBody: L('Specialized decisions need a system that connects research, modelling, documents and review gates.', 'Las decisiones especializadas necesitan un sistema que conecte research, modelización, documentos y gates de revisión.', 'Les decisions especialitzades necessiten un sistema que connecti research, modelització, documents i gates de revisió.'),
    problemRows: {
      en: [{ title: 'Fragmented evidence', body: 'Facts and assumptions are spread across files and sources.' }, { title: 'Manual synthesis', body: 'Important conclusions depend on repeated analyst work.' }, { title: 'Weak review trail', body: 'It is difficult to see who approved which assumption.' }],
      es: [{ title: 'Evidencia fragmentada', body: 'Hechos y supuestos viven repartidos entre archivos y fuentes.' }, { title: 'Síntesis manual', body: 'Conclusiones importantes dependen de trabajo repetitivo de analista.' }, { title: 'Revisión débil', body: 'Cuesta ver quién aprobó cada supuesto.' }],
      ca: [{ title: 'Evidència fragmentada', body: 'Fets i supòsits viuen repartits entre arxius i fonts.' }, { title: 'Síntesi manual', body: 'Conclusions importants depenen de treball repetitiu d’analista.' }, { title: 'Revisió feble', body: 'Costa veure qui va aprovar cada supòsit.' }],
    },
    logicTitle: L('From evidence to a reviewable decision package.', 'De la evidencia a un paquete de decisión revisable.', 'De l’evidència a un paquet de decisió revisable.'),
    logicBody: L('The system makes source evidence, assumptions, scenarios and approvals explicit.', 'El sistema hace explícitas fuentes, supuestos, escenarios y aprobaciones.', 'El sistema fa explícites fonts, supòsits, escenaris i aprovacions.'),
    stages: {
      en: [{ horizon: '01', label: 'Collect', note: 'Structure source evidence and assumptions.' }, { horizon: '02', label: 'Model', note: 'Quantify the business question.' }, { horizon: '03', label: 'Review', note: 'Challenge weak assumptions and gaps.' }, { horizon: '04', label: 'Decide', note: 'Package the evidence for action.' }],
      es: [{ horizon: '01', label: 'Recoger', note: 'Estructurar fuentes y supuestos.' }, { horizon: '02', label: 'Modelar', note: 'Cuantificar la pregunta de negocio.' }, { horizon: '03', label: 'Revisar', note: 'Cuestionar supuestos débiles y gaps.' }, { horizon: '04', label: 'Decidir', note: 'Empaquetar la evidencia para actuar.' }],
      ca: [{ horizon: '01', label: 'Recollir', note: 'Estructurar fonts i supòsits.' }, { horizon: '02', label: 'Modelar', note: 'Quantificar la pregunta de negoci.' }, { horizon: '03', label: 'Revisar', note: 'Qüestionar supòsits febles i gaps.' }, { horizon: '04', label: 'Decidir', note: 'Empaquetar l’evidència per actuar.' }],
    },
    logicTakeaway: L('The decision improves when every claim can be traced back to evidence or an explicit assumption.', 'La decisión mejora cuando cada afirmación puede rastrearse hasta evidencia o un supuesto explícito.', 'La decisió millora quan cada afirmació es pot rastrejar fins a evidència o un supòsit explícit.'),
    systemTitle: L('Research, modelling and workflow in one controlled path.', 'Research, modelización y workflow en un único camino controlado.', 'Research, modelització i workflow en un únic camí controlat.'),
    systemBody: L('The implementation combines structured inputs, analytical logic and reviewable outputs.', 'La implementación combina inputs estructurados, lógica analítica y outputs revisables.', 'La implementació combina inputs estructurats, lògica analítica i outputs revisables.'),
    systemRows: {
      en: ['Structure evidence before interpretation.', 'Keep assumptions editable and traceable.', 'Use scenario analysis for uncertainty.', 'Require review before material conclusions or actions.'],
      es: ['Estructurar evidencia antes de interpretarla.', 'Mantener supuestos editables y trazables.', 'Usar escenarios para tratar la incertidumbre.', 'Exigir revisión antes de conclusiones o acciones materiales.'],
      ca: ['Estructurar evidència abans d’interpretar-la.', 'Mantenir supòsits editables i traçables.', 'Usar escenaris per tractar la incertesa.', 'Exigir revisió abans de conclusions o accions materials.'],
    },
    takeawayTitle: L('Specialized analytics creates value by turning fragmented evidence into a defensible decision.', 'La analítica especializada crea valor al convertir evidencia fragmentada en una decisión defendible.', 'L’analítica especialitzada crea valor en convertir evidència fragmentada en una decisió defensable.'),
    takeawayBody: L('The system is useful when the reasoning path remains visible from source to recommendation.', 'El sistema es útil cuando el razonamiento sigue visible desde la fuente hasta la recomendación.', 'El sistema és útil quan el raonament continua visible des de la font fins a la recomanació.'),
  },
  vision: {
    problemTitle: L('Visual automation fails when confidence is treated as certainty.', 'La automatización visual falla cuando la confianza del modelo se trata como certeza.', 'L’automatització visual falla quan la confiança del model es tracta com certesa.'),
    problemBody: L('Detection, classification and routing need an explicit path for ambiguous objects and changing conditions.', 'Detección, clasificación y routing necesitan una ruta explícita para objetos ambiguos y condiciones cambiantes.', 'Detecció, classificació i routing necessiten una ruta explícita per objectes ambigus i condicions canviants.'),
    problemRows: {
      en: [{ title: 'Ambiguous classes', body: 'Visually similar materials create costly misclassification.' }, { title: 'Changing scenes', body: 'Lighting, occlusion and camera position alter model confidence.' }, { title: 'No review path', body: 'Low-confidence detections need a controlled fallback.' }],
      es: [{ title: 'Clases ambiguas', body: 'Materiales visualmente parecidos generan errores de clasificación.' }, { title: 'Escena cambiante', body: 'Luz, oclusión y cámara modifican la confianza del modelo.' }, { title: 'Sin revisión', body: 'Detecciones de baja confianza necesitan un fallback controlado.' }],
      ca: [{ title: 'Classes ambigües', body: 'Materials visualment semblants generen errors de classificació.' }, { title: 'Escena canviant', body: 'Llum, oclusió i càmera modifiquen la confiança del model.' }, { title: 'Sense revisió', body: 'Deteccions de baixa confiança necessiten un fallback controlat.' }],
    },
    logicTitle: L('Detect, classify, route and review.', 'Detectar, clasificar, enrutar y revisar.', 'Detectar, classificar, enrutar i revisar.'),
    logicBody: L('The model output is treated as one stage in an operating process, not as an unquestioned answer.', 'El output del modelo se trata como una etapa del proceso operativo, no como una respuesta incuestionable.', 'L’output del model es tracta com una etapa del procés operatiu, no com una resposta inqüestionable.'),
    stages: {
      en: [{ horizon: '01', label: 'Capture', note: 'Standardize frames and camera input.' }, { horizon: '02', label: 'Detect', note: 'Locate and classify visible objects.' }, { horizon: '03', label: 'Route', note: 'Map confident classes to an action.' }, { horizon: '04', label: 'Review', note: 'Escalate ambiguous detections.' }],
      es: [{ horizon: '01', label: 'Capturar', note: 'Estandarizar frames y entrada de cámara.' }, { horizon: '02', label: 'Detectar', note: 'Localizar y clasificar objetos visibles.' }, { horizon: '03', label: 'Enrutar', note: 'Mapear clases confiables a una acción.' }, { horizon: '04', label: 'Revisar', note: 'Escalar detecciones ambiguas.' }],
      ca: [{ horizon: '01', label: 'Capturar', note: 'Estandarditzar frames i entrada de càmera.' }, { horizon: '02', label: 'Detectar', note: 'Localitzar i classificar objectes visibles.' }, { horizon: '03', label: 'Enrutar', note: 'Mapar classes fiables a una acció.' }, { horizon: '04', label: 'Revisar', note: 'Escalar deteccions ambigües.' }],
    },
    logicTakeaway: L('Confidence should control the action path, not disappear inside the model.', 'La confianza debe controlar la ruta de acción, no desaparecer dentro del modelo.', 'La confiança ha de controlar la ruta d’acció, no desaparèixer dins del model.'),
    systemTitle: L('A vision model connected to an operational review loop.', 'Un modelo de visión conectado a un loop operativo de revisión.', 'Un model de visió connectat a un loop operatiu de revisió.'),
    systemBody: L('Detection, confidence thresholds, routing and traceability remain explicit.', 'Detección, umbrales de confianza, routing y trazabilidad permanecen explícitos.', 'Detecció, llindars de confiança, routing i traçabilitat romanen explícits.'),
    systemRows: {
      en: ['Standardize the image input.', 'Detect and classify multiple objects per frame.', 'Route high-confidence classes automatically.', 'Retain low-confidence cases for review and learning.'],
      es: ['Estandarizar la entrada de imagen.', 'Detectar y clasificar varios objetos por frame.', 'Enrutar automáticamente clases de alta confianza.', 'Retener casos de baja confianza para revisión y aprendizaje.'],
      ca: ['Estandarditzar l’entrada d’imatge.', 'Detectar i classificar diversos objectes per frame.', 'Enrutar automàticament classes d’alta confiança.', 'Retenir casos de baixa confiança per revisió i aprenentatge.'],
    },
    takeawayTitle: L('Computer vision creates value when model confidence changes the operating action.', 'Computer vision crea valor cuando la confianza del modelo cambia la acción operativa.', 'Computer vision crea valor quan la confiança del model canvia l’acció operativa.'),
    takeawayBody: L('The useful system combines detection quality with routing, review and continuous evidence collection.', 'El sistema útil combina calidad de detección con routing, revisión y recogida continua de evidencia.', 'El sistema útil combina qualitat de detecció amb routing, revisió i recollida contínua d’evidència.'),
  },
}

function archetypeLabels(archetype: PortfolioCaseArchetype, lang: SiteLanguage) {
  const groups = {
    agent: [L('Execution quality', 'Calidad de ejecución', 'Qualitat d’execució'), L('Control coverage', 'Cobertura de control', 'Cobertura de control')],
    data: [L('Platform quality', 'Calidad de plataforma', 'Qualitat de plataforma'), L('Operational coverage', 'Cobertura operativa', 'Cobertura operativa')],
    forecast: [L('Model evaluation', 'Evaluación del modelo', 'Avaluació del model'), L('Planning coverage', 'Cobertura de planificación', 'Cobertura de planificació')],
    bi: [L('Decision interface', 'Interfaz de decisión', 'Interfície de decisió'), L('Information coverage', 'Cobertura de información', 'Cobertura d’informació')],
    customer: [L('Model quality', 'Calidad del modelo', 'Qualitat del model'), L('Decision coverage', 'Cobertura de decisión', 'Cobertura de decisió')],
    risk: [L('Risk evaluation', 'Evaluación de riesgo', 'Avaluació de risc'), L('Decision coverage', 'Cobertura de decisión', 'Cobertura de decisió')],
    optimization: [L('Solution quality', 'Calidad de solución', 'Qualitat de solució'), L('Constraint coverage', 'Cobertura de restricciones', 'Cobertura de restriccions')],
    finance: [L('Model outputs', 'Outputs del modelo', 'Outputs del model'), L('Scenario coverage', 'Cobertura de escenarios', 'Cobertura d’escenaris')],
    quant: [L('Research quality', 'Calidad de research', 'Qualitat de research'), L('Backtest coverage', 'Cobertura de backtest', 'Cobertura de backtest')],
    specialized: [L('Evidence quality', 'Calidad de evidencia', 'Qualitat d’evidència'), L('Review coverage', 'Cobertura de revisión', 'Cobertura de revisió')],
    vision: [L('Detection quality', 'Calidad de detección', 'Qualitat de detecció'), L('Review coverage', 'Cobertura de revisión', 'Cobertura de revisió')],
  }[archetype]
  return [groups[0][lang], groups[1][lang]] as [string, string]
}

function evidenceFor(profile: PortfolioCaseProfile, lang: SiteLanguage): Metric[] {
  const n = Number(profile.id.slice(3))
  const note = {
    en: 'Representative public example.',
    es: 'Ejemplo público representativo.',
    ca: 'Exemple públic representatiu.',
  }[lang]

  if (profile.metricPack === 'credit') {
    return [
      { label: 'AUC ROC', value: '0.87', note },
      { label: 'PR AUC', value: '0.63', note },
      { label: lang === 'es' ? 'Tasa de revisión' : lang === 'ca' ? 'Taxa de revisió' : 'Review rate', value: '6.5%', note },
      { label: lang === 'es' ? 'Umbrales evaluados' : lang === 'ca' ? 'Llindars avaluats' : 'Thresholds tested', value: '12', note },
      { label: lang === 'es' ? 'Slices de validación' : lang === 'ca' ? 'Slices de validació' : 'Validation slices', value: '8', note },
    ]
  }
  if (profile.metricPack === 'fraud') {
    return [
      { label: 'PR AUC', value: '0.58', note },
      { label: lang === 'es' ? 'Recall fraude' : lang === 'ca' ? 'Recall frau' : 'Fraud recall', value: '82%', note },
      { label: lang === 'es' ? 'Falsos positivos' : lang === 'ca' ? 'Falsos positius' : 'False positives', value: '3.4%', note },
      { label: lang === 'es' ? 'Umbrales evaluados' : lang === 'ca' ? 'Llindars avaluats' : 'Thresholds tested', value: '15', note },
      { label: lang === 'es' ? 'Casos de validación' : lang === 'ca' ? 'Casos de validació' : 'Validation cases', value: '50k', note },
    ]
  }
  if (profile.metricPack === 'forecast') {
    return [
      { label: 'WAPE', value: profile.id === 'SC-12' ? '6.45%' : '7.2%', note },
      { label: lang === 'es' ? 'Sesgo' : lang === 'ca' ? 'Biaix' : 'Bias', value: profile.id === 'SC-12' ? '-6.45%' : '-2.8%', note },
      { label: lang === 'es' ? 'Horizontes' : lang === 'ca' ? 'Horitzons' : 'Horizons', value: '4', note },
      { label: lang === 'es' ? 'Escenarios' : lang === 'ca' ? 'Escenaris' : 'Scenarios', value: '3', note },
      { label: lang === 'es' ? 'Checks de validación' : lang === 'ca' ? 'Checks de validació' : 'Validation checks', value: '12', note },
    ]
  }
  if (profile.metricPack === 'service') {
    return [
      { label: lang === 'es' ? 'Nivel de servicio' : lang === 'ca' ? 'Nivell de servei' : 'Service level', value: '94.7%', note },
      { label: lang === 'es' ? 'Pedidos a tiempo' : lang === 'ca' ? 'Comandes a temps' : 'On-time orders', value: '92%', note },
      { label: lang === 'es' ? 'Lead time medio' : lang === 'ca' ? 'Lead time mitjà' : 'Average lead time', value: '11.6d', note },
      { label: lang === 'es' ? 'Excepciones abiertas' : lang === 'ca' ? 'Excepcions obertes' : 'Open exceptions', value: '37', note },
      { label: lang === 'es' ? 'Drill-downs' : lang === 'ca' ? 'Drill-downs' : 'Drill-downs', value: '5', note },
    ]
  }

  switch (profile.archetype) {
    case 'agent':
      return [
        { label: lang === 'es' ? 'Etapas controladas' : lang === 'ca' ? 'Etapes controlades' : 'Controlled stages', value: String(6 + (n % 4)), note },
        { label: lang === 'es' ? 'Gates de aprobación' : lang === 'ca' ? 'Gates d’aprovació' : 'Approval gates', value: String(1 + (n % 3)), note },
        { label: lang === 'es' ? 'Casos de test' : lang === 'ca' ? 'Casos de test' : 'Test cases', value: String(20 + n), note },
        { label: lang === 'es' ? 'Integraciones' : lang === 'ca' ? 'Integracions' : 'Integrations', value: String(3 + (n % 5)), note },
        { label: lang === 'es' ? 'Trazabilidad' : lang === 'ca' ? 'Traçabilitat' : 'Audit coverage', value: '100%', note },
      ]
    case 'data':
      return [
        { label: lang === 'es' ? 'Fuentes' : lang === 'ca' ? 'Fonts' : 'Sources', value: String(4 + (n % 4)), note },
        { label: lang === 'es' ? 'Tests de calidad' : lang === 'ca' ? 'Tests de qualitat' : 'Quality tests', value: String(18 + n), note },
        { label: lang === 'es' ? 'Filas válidas' : lang === 'ca' ? 'Files vàlides' : 'Valid rows', value: '99.6%', note },
        { label: lang === 'es' ? 'Latencia objetivo' : lang === 'ca' ? 'Latència objectiu' : 'Target latency', value: n === 10 ? '<5s' : '<15m', note },
        { label: lang === 'es' ? 'Capas de datos' : lang === 'ca' ? 'Capes de dades' : 'Data layers', value: '3', note },
      ]
    case 'forecast':
      return [
        { label: 'WAPE', value: '8.1%', note },
        { label: lang === 'es' ? 'Escenarios' : lang === 'ca' ? 'Escenaris' : 'Scenarios', value: '3', note },
        { label: lang === 'es' ? 'Periodos' : lang === 'ca' ? 'Períodes' : 'Periods', value: '24', note },
        { label: lang === 'es' ? 'Modelos comparados' : lang === 'ca' ? 'Models comparats' : 'Models compared', value: '5', note },
        { label: lang === 'es' ? 'Drivers' : lang === 'ca' ? 'Drivers' : 'Drivers', value: '6', note },
      ]
    case 'bi':
      return [
        { label: 'KPIs', value: String(10 + (n % 5)), note },
        { label: lang === 'es' ? 'Drill-downs' : lang === 'ca' ? 'Drill-downs' : 'Drill-downs', value: String(4 + (n % 3)), note },
        { label: lang === 'es' ? 'Fuentes' : lang === 'ca' ? 'Fonts' : 'Sources', value: String(3 + (n % 4)), note },
        { label: lang === 'es' ? 'Vistas de decisión' : lang === 'ca' ? 'Vistes de decisió' : 'Decision views', value: '3', note },
        { label: lang === 'es' ? 'Refresh objetivo' : lang === 'ca' ? 'Refresh objectiu' : 'Target refresh', value: '15m', note },
      ]
    case 'customer':
      return [
        { label: lang === 'es' ? 'Features' : lang === 'ca' ? 'Features' : 'Features', value: String(24 + n), note },
        { label: lang === 'es' ? 'Segmentos' : lang === 'ca' ? 'Segments' : 'Segments', value: '4', note },
        { label: lang === 'es' ? 'Acciones priorizadas' : lang === 'ca' ? 'Accions prioritzades' : 'Prioritized actions', value: '3', note },
        { label: lang === 'es' ? 'Folds de validación' : lang === 'ca' ? 'Folds de validació' : 'Validation folds', value: '5', note },
        { label: lang === 'es' ? 'Cobertura explicable' : lang === 'ca' ? 'Cobertura explicable' : 'Explainable coverage', value: '100%', note },
      ]
    case 'risk':
      return [
        { label: 'AUC ROC', value: '0.84', note },
        { label: lang === 'es' ? 'Umbrales' : lang === 'ca' ? 'Llindars' : 'Thresholds', value: '10', note },
        { label: lang === 'es' ? 'Variables explicadas' : lang === 'ca' ? 'Variables explicades' : 'Explained features', value: '20', note },
        { label: lang === 'es' ? 'Slices' : lang === 'ca' ? 'Slices' : 'Slices', value: '6', note },
        { label: lang === 'es' ? 'Colas de decisión' : lang === 'ca' ? 'Cues de decisió' : 'Decision queues', value: '3', note },
      ]
    case 'optimization':
      return [
        { label: lang === 'es' ? 'Restricciones' : lang === 'ca' ? 'Restriccions' : 'Constraints', value: String(6 + (n % 5)), note },
        { label: lang === 'es' ? 'Escenarios' : lang === 'ca' ? 'Escenaris' : 'Scenarios', value: '4', note },
        { label: lang === 'es' ? 'Soluciones factibles' : lang === 'ca' ? 'Solucions factibles' : 'Feasible solutions', value: '100%', note },
        { label: lang === 'es' ? 'Baselines' : lang === 'ca' ? 'Baselines' : 'Baselines', value: '2', note },
        { label: lang === 'es' ? 'Objetivos' : lang === 'ca' ? 'Objectius' : 'Objectives', value: '3', note },
      ]
    case 'finance':
      return [
        { label: lang === 'es' ? 'Escenarios' : lang === 'ca' ? 'Escenaris' : 'Scenarios', value: '3', note },
        { label: lang === 'es' ? 'Drivers' : lang === 'ca' ? 'Drivers' : 'Drivers', value: String(8 + (n % 4)), note },
        { label: lang === 'es' ? 'Meses modelados' : lang === 'ca' ? 'Mesos modelats' : 'Months modelled', value: '36', note },
        { label: lang === 'es' ? 'Outputs financieros' : lang === 'ca' ? 'Outputs financers' : 'Financial outputs', value: '5', note },
        { label: lang === 'es' ? 'Checks de consistencia' : lang === 'ca' ? 'Checks de consistència' : 'Consistency checks', value: '14', note },
      ]
    case 'quant':
      return [
        { label: lang === 'es' ? 'Eventos replay' : lang === 'ca' ? 'Esdeveniments replay' : 'Replay events', value: '10k', note },
        { label: lang === 'es' ? 'Familias de señales' : lang === 'ca' ? 'Famílies de senyals' : 'Signal families', value: '4', note },
        { label: lang === 'es' ? 'Ventanas de backtest' : lang === 'ca' ? 'Finestres de backtest' : 'Backtest windows', value: '6', note },
        { label: lang === 'es' ? 'Componentes de coste' : lang === 'ca' ? 'Components de cost' : 'Cost components', value: '3', note },
        { label: lang === 'es' ? 'Regímenes' : lang === 'ca' ? 'Règims' : 'Regimes', value: '2', note },
      ]
    case 'specialized':
      return [
        { label: lang === 'es' ? 'Fuentes' : lang === 'ca' ? 'Fonts' : 'Sources', value: profile.metricPack === 'diligence' ? '25' : '12', note },
        { label: lang === 'es' ? 'Escenarios' : lang === 'ca' ? 'Escenaris' : 'Scenarios', value: '3', note },
        { label: lang === 'es' ? 'Gates de revisión' : lang === 'ca' ? 'Gates de revisió' : 'Review gates', value: '4', note },
        { label: lang === 'es' ? 'Supuestos trazables' : lang === 'ca' ? 'Supòsits traçables' : 'Traceable assumptions', value: '100%', note },
        { label: lang === 'es' ? 'Outputs de decisión' : lang === 'ca' ? 'Outputs de decisió' : 'Decision outputs', value: '5', note },
      ]
    case 'vision':
      return [
        { label: lang === 'es' ? 'Clases' : lang === 'ca' ? 'Classes' : 'Classes', value: '5', note },
        { label: 'mAP50', value: '0.86', note },
        { label: lang === 'es' ? 'Frames de validación' : lang === 'ca' ? 'Frames de validació' : 'Validation frames', value: '1k', note },
        { label: lang === 'es' ? 'Bandas de confianza' : lang === 'ca' ? 'Bandes de confiança' : 'Confidence bands', value: '3', note },
        { label: lang === 'es' ? 'Rutas de salida' : lang === 'ca' ? 'Rutes de sortida' : 'Output routes', value: '4', note },
      ]
  }

  return []
}

function businessMetricsFor(profile: PortfolioCaseProfile, lang: SiteLanguage): { headline: string; summary: string; metrics: Metric[] } {
  const n = Number(profile.id.slice(3))
  const labels = {
    en: { ref: 'Reference scenario', change: 'Illustrative improvement', value: 'Decision value' },
    es: { ref: 'Escenario de referencia', change: 'Mejora ilustrativa', value: 'Valor de decisión' },
    ca: { ref: 'Escenari de referència', change: 'Millora il·lustrativa', value: 'Valor de decisió' },
  }[lang]

  const note = {
    en: 'Reference arithmetic, not a measured client result.',
    es: 'Aritmética de referencia, no un resultado medido de cliente.',
    ca: 'Aritmètica de referència, no un resultat mesurat de client.',
  }[lang]

  if (profile.metricPack === 'forecast') {
    const base = profile.id === 'SC-12' ? '€2.0M' : '€1.5M'
    const released = profile.id === 'SC-12' ? '€100k' : '€75k'
    return {
      headline: lang === 'es' ? `${base.replace('.', ',')} de inventario → 5% menos exceso → ${released} liberados.` : lang === 'ca' ? `${base.replace('.', ',')} d’inventari → 5% menys excés → ${released} alliberats.` : `${base} inventory → 5% less excess → ${released} released.`,
      summary: note,
      metrics: [
        { value: base, label: lang === 'es' ? 'Base de inventario' : lang === 'ca' ? 'Base d’inventari' : 'Inventory base', note },
        { value: '5%', label: lang === 'es' ? 'Reducción de exceso' : lang === 'ca' ? 'Reducció d’excés' : 'Excess reduction', note },
        { value: released, label: lang === 'es' ? 'Capital liberado' : lang === 'ca' ? 'Capital alliberat' : 'Capital released', note },
      ],
    }
  }

  if (profile.metricPack === 'service') {
    return {
      headline: lang === 'es' ? '1.000 pedidos → 2 pp más de servicio → 20 incidencias evitadas.' : lang === 'ca' ? '1.000 comandes → 2 pp més de servei → 20 incidències evitades.' : '1,000 orders → +2pp service → 20 fewer exceptions.',
      summary: note,
      metrics: [
        { value: '1,000', label: lang === 'es' ? 'Pedidos de referencia' : lang === 'ca' ? 'Comandes de referència' : 'Reference orders', note },
        { value: '+2 pp', label: lang === 'es' ? 'Mejora de servicio' : lang === 'ca' ? 'Millora de servei' : 'Service improvement', note },
        { value: '20', label: lang === 'es' ? 'Incidencias afectadas' : lang === 'ca' ? 'Incidències afectades' : 'Exceptions affected', note },
      ],
    }
  }

  if (profile.metricPack === 'credit' || profile.metricPack === 'fraud') {
    return {
      headline: lang === 'es' ? '10.000 decisiones → 1 pp de mejora operativa → 100 decisiones afectadas.' : lang === 'ca' ? '10.000 decisions → 1 pp de millora operativa → 100 decisions afectades.' : '10,000 decisions → 1pp operating improvement → 100 decisions affected.',
      summary: note,
      metrics: [
        { value: '10k', label: labels.ref, note },
        { value: '1 pp', label: labels.change, note },
        { value: '100', label: labels.value, note },
      ],
    }
  }

  if (profile.metricPack === 'property') {
    return {
      headline: lang === 'es' ? '€10M de proyecto → 1% de desviación → €100k de impacto.' : lang === 'ca' ? '€10M de projecte → 1% de desviació → €100k d’impacte.' : '€10M project → 1% variance → €100k impact.',
      summary: note,
      metrics: [
        { value: '€10M', label: labels.ref, note },
        { value: '1%', label: labels.change, note },
        { value: '€100k', label: labels.value, note },
      ],
    }
  }

  if (profile.metricPack === 'diligence') {
    return {
      headline: lang === 'es' ? '120 h de research → 30% menos trabajo manual → 36 h liberadas.' : lang === 'ca' ? '120 h de research → 30% menys treball manual → 36 h alliberades.' : '120 research hours → 30% less manual work → 36 hours released.',
      summary: note,
      metrics: [
        { value: '120 h', label: labels.ref, note },
        { value: '30%', label: labels.change, note },
        { value: '36 h', label: labels.value, note },
      ],
    }
  }

  switch (profile.archetype) {
    case 'agent': {
      const base = 120 + (n % 5) * 20
      const pct = 20 + (n % 4) * 5
      const saved = Math.round((base * pct) / 100)
      return {
        headline: lang === 'es' ? `${base} h/mes de trabajo → ${pct}% automatizable → ${saved} h/mes liberadas.` : lang === 'ca' ? `${base} h/mes de treball → ${pct}% automatitzable → ${saved} h/mes alliberades.` : `${base} h/month workload → ${pct}% automatable → ${saved} h/month released.`,
        summary: note,
        metrics: [{ value: `${base} h`, label: labels.ref, note }, { value: `${pct}%`, label: labels.change, note }, { value: `${saved} h`, label: labels.value, note }],
      }
    }
    case 'data':
      return {
        headline: lang === 'es' ? '40 h/mes de conciliación → 50% menos reproceso → 20 h/mes liberadas.' : lang === 'ca' ? '40 h/mes de conciliació → 50% menys reprocés → 20 h/mes alliberades.' : '40 h/month reconciliation → 50% less rework → 20 h/month released.',
        summary: note,
        metrics: [{ value: '40 h', label: labels.ref, note }, { value: '50%', label: labels.change, note }, { value: '20 h', label: labels.value, note }],
      }
    case 'forecast':
      return {
        headline: lang === 'es' ? '€1,5M de planificación → 4% de mejora → €60k de exposición afectada.' : lang === 'ca' ? '€1,5M de planificació → 4% de millora → €60k d’exposició afectada.' : '€1.5M planning base → 4% improvement → €60k exposure affected.',
        summary: note,
        metrics: [{ value: '€1.5M', label: labels.ref, note }, { value: '4%', label: labels.change, note }, { value: '€60k', label: labels.value, note }],
      }
    case 'bi':
      return {
        headline: lang === 'es' ? '50 h/mes de reporting → 40% menos preparación → 20 h/mes liberadas.' : lang === 'ca' ? '50 h/mes de reporting → 40% menys preparació → 20 h/mes alliberades.' : '50 h/month reporting → 40% less preparation → 20 h/month released.',
        summary: note,
        metrics: [{ value: '50 h', label: labels.ref, note }, { value: '40%', label: labels.change, note }, { value: '20 h', label: labels.value, note }],
      }
    case 'customer':
      return {
        headline: lang === 'es' ? '10.000 clientes → 3% de prioridad diferente → 300 decisiones afectadas.' : lang === 'ca' ? '10.000 clients → 3% de prioritat diferent → 300 decisions afectades.' : '10,000 customers → 3% reprioritized → 300 decisions affected.',
        summary: note,
        metrics: [{ value: '10k', label: labels.ref, note }, { value: '3%', label: labels.change, note }, { value: '300', label: labels.value, note }],
      }
    case 'risk':
      return {
        headline: lang === 'es' ? '10.000 decisiones → 1 pp de umbral → 100 decisiones afectadas.' : lang === 'ca' ? '10.000 decisions → 1 pp de llindar → 100 decisions afectades.' : '10,000 decisions → 1pp threshold shift → 100 decisions affected.',
        summary: note,
        metrics: [{ value: '10k', label: labels.ref, note }, { value: '1 pp', label: labels.change, note }, { value: '100', label: labels.value, note }],
      }
    case 'optimization':
      return {
        headline: lang === 'es' ? '€500k de coste operativo → 5% de mejora → €25k de oportunidad.' : lang === 'ca' ? '€500k de cost operatiu → 5% de millora → €25k d’oportunitat.' : '€500k operating cost → 5% improvement → €25k opportunity.',
        summary: note,
        metrics: [{ value: '€500k', label: labels.ref, note }, { value: '5%', label: labels.change, note }, { value: '€25k', label: labels.value, note }],
      }
    case 'finance':
      return {
        headline: lang === 'es' ? '€5M de base financiera → 1% de sensibilidad → €50k de impacto.' : lang === 'ca' ? '€5M de base financera → 1% de sensibilitat → €50k d’impacte.' : '€5M financial base → 1% sensitivity → €50k impact.',
        summary: note,
        metrics: [{ value: '€5M', label: labels.ref, note }, { value: '1%', label: labels.change, note }, { value: '€50k', label: labels.value, note }],
      }
    case 'quant':
      return {
        headline: lang === 'es' ? '€1M de notional → 10 bps de coste → €1k por ejecución equivalente.' : lang === 'ca' ? '€1M de notional → 10 bps de cost → €1k per execució equivalent.' : '€1M notional → 10 bps cost → €1k equivalent execution impact.',
        summary: note,
        metrics: [{ value: '€1M', label: labels.ref, note }, { value: '10 bps', label: labels.change, note }, { value: '€1k', label: labels.value, note }],
      }
    case 'specialized':
      return {
        headline: lang === 'es' ? '100 h de análisis → 25% menos trabajo manual → 25 h liberadas.' : lang === 'ca' ? '100 h d’anàlisi → 25% menys treball manual → 25 h alliberades.' : '100 analysis hours → 25% less manual work → 25 hours released.',
        summary: note,
        metrics: [{ value: '100 h', label: labels.ref, note }, { value: '25%', label: labels.change, note }, { value: '25 h', label: labels.value, note }],
      }
    case 'vision':
      return {
        headline: lang === 'es' ? '8 h/día de revisión → 20% automatizable → 1,6 h/día liberadas.' : lang === 'ca' ? '8 h/dia de revisió → 20% automatitzable → 1,6 h/dia alliberades.' : '8 h/day review → 20% automatable → 1.6 h/day released.',
        summary: note,
        metrics: [{ value: '8 h/d', label: labels.ref, note }, { value: '20%', label: labels.change, note }, { value: '1.6 h/d', label: labels.value, note }],
      }
  }

  return {
    headline: note,
    summary: note,
    metrics: [],
  }
}

function architectureFor(profile: PortfolioCaseProfile, lang: SiteLanguage) {
  const names = profile.technologies.slice(0, 8)
  const generic = {
    en: {
      eyebrow: `${profile.id} · SYSTEM ARCHITECTURE`,
      title: 'A modular path from input to decision.',
      body: 'Inputs → preparation → core logic → validation → decision output',
      steps: ['Source signals', 'Preparation layer', 'Core engine', 'Decision logic', 'Validation', 'Controls', 'Decision output', 'Monitoring'],
      details: ['Capture the operating inputs required by the system.', 'Normalize context and create a stable analytical contract.', 'Run the main analytical or automation logic.', 'Apply the rule, model or orchestration logic that changes the decision.', 'Test outputs against explicit quality criteria.', 'Keep approvals, thresholds or constraints visible.', 'Expose the result in a form the user can act on.', 'Record outcomes, exceptions and evidence for iteration.'],
    },
    es: {
      eyebrow: `${profile.id} · ARQUITECTURA DEL SISTEMA`,
      title: 'Un camino modular desde el input hasta la decisión.',
      body: 'Entradas → preparación → lógica central → validación → salida de decisión',
      steps: ['Señales de entrada', 'Capa de preparación', 'Motor principal', 'Lógica de decisión', 'Validación', 'Controles', 'Salida de decisión', 'Monitorización'],
      details: ['Captura los inputs operativos necesarios.', 'Normaliza contexto y crea un contrato analítico estable.', 'Ejecuta la lógica analítica o de automatización principal.', 'Aplica la regla, modelo u orquestación que cambia la decisión.', 'Valida outputs contra criterios explícitos.', 'Mantiene visibles aprobaciones, umbrales o restricciones.', 'Expone el resultado en un formato accionable.', 'Registra resultados, excepciones y evidencia para iterar.'],
    },
    ca: {
      eyebrow: `${profile.id} · ARQUITECTURA DEL SISTEMA`,
      title: 'Un camí modular des de l’input fins a la decisió.',
      body: 'Entrades → preparació → lògica central → validació → sortida de decisió',
      steps: ['Senyals d’entrada', 'Capa de preparació', 'Motor principal', 'Lògica de decisió', 'Validació', 'Controls', 'Sortida de decisió', 'Monitorització'],
      details: ['Captura els inputs operatius necessaris.', 'Normalitza context i crea un contracte analític estable.', 'Executa la lògica analítica o d’automatització principal.', 'Aplica la regla, model o orquestració que canvia la decisió.', 'Valida outputs contra criteris explícits.', 'Manté visibles aprovacions, llindars o restriccions.', 'Exposa el resultat en un format accionable.', 'Registra resultats, excepcions i evidència per iterar.'],
    },
  }[lang]

  return {
    eyebrow: generic.eyebrow,
    title: generic.title,
    body: generic.body,
    steps: generic.steps.map((title, index) => ({
      title,
      detail: `${generic.details[index]} ${names[index] ? `[${names[index]}]` : ''}`.trim(),
    })),
    integrations: profile.technologies.slice(0, 3).map((technology) => ({
      title: technology,
      detail: lang === 'es'
        ? 'Responsabilidad definida dentro del sistema; sustituible si otra herramienta cumple mejor el requisito.'
        : lang === 'ca'
          ? 'Responsabilitat definida dins del sistema; substituïble si una altra eina compleix millor el requisit.'
          : 'Defined responsibility inside the system; replaceable if another tool fits the requirement better.',
    })),
  }
}

export function getPortfolioCasePresentation(projectId: string, lang: SiteLanguage): PortfolioCasePresentation | undefined {
  const profile = getPortfolioCaseProfileById(projectId)
  if (!profile) return undefined

  const meta = localizePortfolioCase(profile, lang)
  const archetype = archetypeCopy[profile.archetype]
  const business = businessMetricsFor(profile, lang)
  const evidence = evidenceFor(profile, lang)
  const groups = archetypeLabels(profile.archetype, lang)
  const architecture = architectureFor(profile, lang)

  const labels = {
    en: {
      back: 'Project overview',
      thesis: 'Starting point',
      problem: '01 · BUSINESS PROBLEM',
      logic: '02 · DECISION LOGIC',
      system: '03 · WHAT CHANGED',
      architecture: '04 · ARCHITECTURE',
      evidence: '05 · EVIDENCE & ECONOMICS',
      technical: '06 · TECHNICAL PROOF',
      takeaway: 'BUSINESS CONCLUSION',
      repository: 'Open technical repository',
      contact: 'Tell us about a similar problem',
      reference: 'Reference economics',
      proof: 'Public implementation, inspectable technical proof and decision-focused validation.',
    },
    es: {
      back: 'Resumen del proyecto',
      thesis: 'Punto de partida',
      problem: '01 · PROBLEMA DE NEGOCIO',
      logic: '02 · LÓGICA DE DECISIÓN',
      system: '03 · QUÉ CAMBIÓ',
      architecture: '04 · ARQUITECTURA',
      evidence: '05 · EVIDENCIA Y ECONOMÍA',
      technical: '06 · PRUEBA TÉCNICA',
      takeaway: 'CONCLUSIÓN DE NEGOCIO',
      repository: 'Abrir repositorio técnico',
      contact: 'Háblanos de un problema similar',
      reference: 'Economía de referencia',
      proof: 'Implementación pública, prueba técnica inspeccionable y validación orientada a la decisión.',
    },
    ca: {
      back: 'Resum del projecte',
      thesis: 'Punt de partida',
      problem: '01 · PROBLEMA DE NEGOCI',
      logic: '02 · LÒGICA DE DECISIÓ',
      system: '03 · QUÈ VA CANVIAR',
      architecture: '04 · ARQUITECTURA',
      evidence: '05 · EVIDÈNCIA I ECONOMIA',
      technical: '06 · PROVA TÈCNICA',
      takeaway: 'CONCLUSIÓ DE NEGOCI',
      repository: 'Obrir repositori tècnic',
      contact: 'Parla’ns d’un problema similar',
      reference: 'Economia de referència',
      proof: 'Implementació pública, prova tècnica inspeccionable i validació orientada a la decisió.',
    },
  }[lang]

  const overviewProblem = archetype.problemBody[lang]
  const overviewChanged = archetype.systemRows[lang][0]
  const overviewUtility = archetype.takeawayBody[lang]

  const heroFacts = [
    { label: lang === 'es' ? 'Decisión' : lang === 'ca' ? 'Decisió' : 'Decision', value: meta.challenge },
    { label: lang === 'es' ? 'Sistema' : lang === 'ca' ? 'Sistema' : 'System', value: meta.title },
    { label: lang === 'es' ? 'Validación' : lang === 'ca' ? 'Validació' : 'Validation', value: evidence.slice(0, 2).map((metric) => metric.label).join(' · ') },
    { label: lang === 'es' ? 'Stack principal' : lang === 'ca' ? 'Stack principal' : 'Core stack', value: profile.technologies.slice(0, 3).join(' · ') },
  ]

  return {
    title: meta.title,
    summary: meta.summary,
    industry: meta.industry,
    challenge: meta.challenge,
    hook: meta.summary,
    overviewProblem,
    overviewChanged,
    overviewUtility,
    proofStatement: labels.proof,
    heroFacts,
    scenarioHeadline: business.headline,
    scenarioSummary: business.summary,
    businessMetrics: business.metrics,
    case: {
      back: labels.back,
      eyebrow: `${meta.challenge.toUpperCase()} · ${profile.id}`,
      title: meta.title,
      intro: meta.summary,
      thesisLabel: labels.thesis,
      thesis: archetype.problemBody[lang],
      problemLabel: labels.problem,
      problemTitle: archetype.problemTitle[lang],
      problemBody: archetype.problemBody[lang],
      problemRows: archetype.problemRows[lang],
      logicLabel: labels.logic,
      logicTitle: archetype.logicTitle[lang],
      logicBody: archetype.logicBody[lang],
      logicVisual: {
        eyebrow: labels.logic,
        title: archetype.logicTitle[lang],
        body: archetype.logicBody[lang],
        horizons: archetype.stages[lang],
        takeaway: archetype.logicTakeaway[lang],
      },
      systemLabel: labels.system,
      systemTitle: archetype.systemTitle[lang],
      systemBody: archetype.systemBody[lang],
      systemRows: archetype.systemRows[lang],
      architectureLabel: labels.architecture,
      architectureTitle: architecture.title,
      architectureBody: architecture.body,
      architecture,
      evidenceLabel: labels.evidence,
      evidenceTitle: lang === 'es' ? 'Medir lo que cambia la decisión.' : lang === 'ca' ? 'Mesurar allò que canvia la decisió.' : 'Measure what changes the decision.',
      evidenceBody: labels.proof,
      evidenceGroupLabels: groups,
      evidence,
      technicalLabel: labels.technical,
      technicalTitle: lang === 'es' ? 'Revisa los códigos detrás del proyecto.' : lang === 'ca' ? 'Revisa el codi darrere del projecte.' : 'Review the code behind the project.',
      technicalProof: profile.technologies.slice(0, 6).join(' · '),
      takeawayLabel: labels.takeaway,
      takeawayTitle: archetype.takeawayTitle[lang],
      takeawayBody: archetype.takeawayBody[lang],
      repository: labels.repository,
      contact: labels.contact,
      referenceEconomics: labels.reference,
    },
  }
}
