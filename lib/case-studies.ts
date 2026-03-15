export interface CaseStudy {
  slug: string
  industry: string
  industryEs: string
  company: string
  titleEn: string
  titleEs: string
  excerptEn: string
  excerptEs: string
  problemEn: string
  problemEs: string
  approachEn: string
  approachEs: string
  solutionEn: string
  solutionEs: string
  results: { metric: string; metricEs: string; value: string }[]
  tagsEn: string[]
  tagsEs: string[]
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'retail-demand-forecasting',
    industry: 'Retail',
    industryEs: 'Retail',
    company: 'NordMart',
    titleEn: 'Demand forecasting system that reduced inventory costs by 28%',
    titleEs: 'Sistema de forecasting de demanda que redujo los costes de inventario un 28%',
    excerptEn: 'A mid-size European retailer with 47 locations and 12,000 SKUs moved from manual demand planning to a hierarchical ensemble forecasting system — cutting stockouts, eliminating excess inventory and improving planning accuracy across the full catalog.',
    excerptEs: 'Un retailer europeo de tamaño medio con 47 ubicaciones y 12.000 SKUs pasó de la planificación manual de la demanda a un sistema de forecasting ensemble jerárquico, reduciendo las roturas de stock y mejorando la precisión de planificación en todo el catálogo.',
    problemEn: `NordMart operated 47 retail locations across three countries, with an SKU catalog of approximately 12,000 active products. Their demand planning process relied on simple moving averages supplemented by manual planner adjustments, producing forecast errors that averaged 38% MAPE across the product catalog.

The consequences were significant: persistent stockouts on fast-moving SKUs during promotional periods (estimated at €2.3M in lost sales annually) and systematic overstock on slow-moving categories (carrying costs of €1.8M annually). Total inventory-related cost exposure was estimated at €4.1M per year.

The planning team spent approximately 60% of their time on manual data reconciliation and exception handling, leaving little capacity for strategic decisions.`,
    problemEs: `NordMart operaba 47 ubicaciones de retail en tres países, con un catálogo de SKU de aproximadamente 12.000 productos activos. Su proceso de planificación de la demanda se basaba en medias móviles simples complementadas con ajustes manuales de los planificadores, produciendo errores de predicción que promediaban un 38% de MAPE en todo el catálogo de productos.

Las consecuencias eran significativas: roturas de stock persistentes en SKUs de alta rotación durante los períodos promocionales (estimadas en 2,3M€ de ventas perdidas anuales) y sobrestock sistemático en categorías de baja rotación (costes de almacenamiento de 1,8M€ anuales). La exposición total a costes relacionados con el inventario se estimó en 4,1M€ anuales.`,
    approachEn: `The project began with a comprehensive audit of the existing data infrastructure. Key issues identified included: inconsistent promotional tagging, gaps in point-of-sale data for certain store formats, and the absence of external signals that had measurable impact on demand patterns.

The forecasting system was rebuilt around a hierarchical ensemble model combining:

- SARIMA components to capture seasonal and trend structure at the category level
- Gradient boosting models trained on engineered features including promotional flags, price elasticity proxies, competitive signals and weather variables
- A hierarchical reconciliation layer to ensure consistency between store, regional and national level forecasts

Particular attention was paid to uncertainty quantification: the system produces prediction intervals at the 80th and 95th confidence levels, enabling planners to set safety stock levels analytically rather than by rule of thumb.

The system was deployed into NordMart's existing ERP through an API layer, with a planning interface designed specifically for the demand planning team.`,
    approachEs: `El proyecto comenzó con una auditoría exhaustiva de la infraestructura de datos existente. Los problemas clave identificados incluyeron: etiquetado promocional inconsistente, lagunas en los datos de punto de venta para ciertos formatos de tienda y la ausencia de señales externas con impacto medible en los patrones de demanda.

El sistema de forecasting se reconstruyó en torno a un modelo ensemble jerárquico que combinaba:

- Componentes SARIMA para capturar la estructura estacional y de tendencia a nivel de categoría
- Modelos de gradient boosting entrenados en características de ingeniería que incluyen indicadores promocionales, proxies de elasticidad del precio, señales competitivas y variables meteorológicas
- Una capa de reconciliación jerárquica para garantizar la consistencia entre los forecasts a nivel de tienda, regional y nacional

Se prestó especial atención a la cuantificación de la incertidumbre: el sistema produce intervalos de predicción al nivel de confianza del 80% y 95%, permitiendo a los planificadores establecer niveles de stock de seguridad analíticamente.`,
    solutionEn: `The delivered system included a full automated forecasting pipeline running daily refreshes, a web-based planning interface showing forecasts with uncertainty ranges for each store-SKU combination, automatic exception flagging for unusual patterns or data quality issues, and a model performance dashboard tracking accuracy metrics over time.

Training sessions were conducted with the planning team to build confidence in the system's outputs and establish protocols for when and how to apply manual overrides.`,
    solutionEs: `El sistema entregado incluía un pipeline de forecasting totalmente automatizado con actualizaciones diarias, una interfaz de planificación basada en web que muestra forecasts con rangos de incertidumbre para cada combinación tienda-SKU, marcado automático de excepciones para patrones inusuales o problemas de calidad de datos, y un dashboard de rendimiento del modelo que rastrea las métricas de precisión a lo largo del tiempo.`,
    results: [
      { metric: 'Forecast error reduction', metricEs: 'Reducción del error de predicción', value: '38% → 21% MAPE (44% improvement)' },
      { metric: 'Stockout reduction', metricEs: 'Reducción de roturas de stock', value: '−67% during promotional periods' },
      { metric: 'Excess inventory reduction', metricEs: 'Reducción del exceso de inventario', value: '−29% carrying costs' },
      { metric: 'Annual cost improvement', metricEs: 'Mejora del coste anual', value: '€2.8M estimated benefit' },
      { metric: 'System adoption', metricEs: 'Adopción del sistema', value: '100% of planners within 3 months' },
    ],
    tagsEn: ['Forecasting', 'Retail', 'Inventory Optimization', 'Machine Learning'],
    tagsEs: ['Forecasting', 'Retail', 'Optimización de Inventario', 'Machine Learning'],
  },

  {
    slug: 'logistics-route-optimization',
    industry: 'Logistics',
    industryEs: 'Logística',
    company: 'Translink Mediterranean',
    titleEn: 'Route optimization system delivering 17% efficiency improvement across 82-vehicle fleet',
    titleEs: 'Sistema de optimización de rutas con mejora del 17% de eficiencia en flota de 82 vehículos',
    excerptEn: 'A regional logistics operator replaced manual routing with a mathematical optimization engine, dramatically improving on-time delivery performance, cutting fuel costs and freeing dispatcher capacity for higher-value work.',
    excerptEs: 'Un operador logístico regional sustituyó el enrutamiento manual por un motor de optimización matemática, mejorando drásticamente el rendimiento de entrega puntual, reduciendo los costes de combustible y liberando capacidad de los despachadores.',
    problemEn: `Translink Mediterranean operated a fleet of 82 vehicles serving approximately 340 daily delivery points across the western Mediterranean region. Route planning was performed manually by a team of 6 dispatchers using basic mapping tools, a process that typically required 2-3 hours each morning and produced routes that experienced drivers frequently modified in the field.

Fuel costs represented 34% of total operational costs. On-time delivery performance was at 78%, below the 85% contractual threshold with key clients — triggering penalty clauses that cost approximately €180,000 annually.

The dispatchers were highly experienced and had deep local knowledge, but the manual process couldn't scale to handle the full complexity of the routing problem: time window constraints, vehicle type compatibility, driver working hours regulations and real-time traffic conditions.`,
    problemEs: `Translink Mediterranean operaba una flota de 82 vehículos que atendía aproximadamente 340 puntos de entrega diarios en la región mediterránea occidental. La planificación de rutas se realizaba manualmente por un equipo de 6 despachadores usando herramientas básicas de mapas, un proceso que típicamente requería 2-3 horas cada mañana.

Los costes de combustible representaban el 34% de los costes operativos totales. El rendimiento de entrega puntual era del 78%, por debajo del umbral contractual del 85% con clientes clave, lo que activaba cláusulas de penalización que costaban aproximadamente 180.000€ anuales.`,
    approachEn: `The optimization system was built in three phases.

Phase 1 focused on data infrastructure: establishing clean, real-time feeds of order data, vehicle availability, and driver schedules, and geocoding all 340+ delivery points with high precision. Data quality issues identified in this phase — inconsistent address formats, missing time windows for several client accounts — were resolved before any optimization work began.

Phase 2 implemented a Vehicle Routing Problem (VRP) solver using a combination of constraint programming and metaheuristic optimization (Adaptive Large Neighborhood Search — ALNS), capable of handling:
- Hard and soft time window constraints per delivery point
- Vehicle capacity and type restrictions (refrigerated vs. standard)
- Driver working hours regulations
- Real-time traffic integration for dynamic re-routing during the day

Phase 3 focused on organizational integration: training dispatchers to work with the system as decision support rather than replacement, establishing override protocols with automatic logging, and building management dashboards for real-time fleet monitoring.`,
    approachEs: `El sistema de optimización se construyó en tres fases.

La Fase 1 se centró en la infraestructura de datos: establecer feeds en tiempo real de datos de pedidos, disponibilidad de vehículos y horarios de conductores, y geocodificar todos los puntos de entrega con alta precisión. Los problemas de calidad de datos identificados en esta fase se resolvieron antes de comenzar cualquier trabajo de optimización.

La Fase 2 implementó un solver de Problema de Enrutamiento de Vehículos (VRP) usando una combinación de programación de restricciones y optimización metaheurística (Búsqueda de Gran Vecindad Adaptativa — ALNS), capaz de manejar restricciones de ventanas de tiempo, restricciones de capacidad y tipo de vehículo, regulaciones de horas de trabajo de conductores e integración de tráfico en tiempo real.

La Fase 3 se centró en la integración organizativa: formar a los despachadores para trabajar con el sistema como soporte de decisiones en lugar de sustitución, establecer protocolos de anulación con registro automático y construir dashboards de gestión para monitorización de flota en tiempo real.`,
    solutionEn: `The final system generates optimized route plans in under 4 minutes for the full daily route set. Dispatchers interact with a web interface showing proposed routes with key metrics (estimated time, distance, load factor), and can apply override rules that are automatically logged for performance analysis.

Dynamic re-routing capabilities allow for real-time route adjustments during the day when unexpected events occur — traffic incidents, failed delivery attempts, late order additions.`,
    solutionEs: `El sistema final genera planes de rutas optimizadas en menos de 4 minutos para el conjunto completo de rutas diarias. Los despachadores interactúan con una interfaz web que muestra las rutas propuestas con métricas clave, y pueden aplicar reglas de anulación que se registran automáticamente para el análisis de rendimiento.`,
    results: [
      { metric: 'Route efficiency improvement', metricEs: 'Mejora de la eficiencia de rutas', value: '+17% (km per delivery)' },
      { metric: 'Fuel cost reduction', metricEs: 'Reducción de costes de combustible', value: '−14% in first 6 months' },
      { metric: 'On-time delivery performance', metricEs: 'Rendimiento de entrega puntual', value: '78% → 91%' },
      { metric: 'Dispatcher planning time', metricEs: 'Tiempo de planificación por despachador', value: '2.5 hours → 35 minutes/day' },
      { metric: 'Estimated 3-year ROI', metricEs: 'ROI estimado a 3 años', value: '8.2x' },
    ],
    tagsEn: ['Optimization', 'Logistics', 'Route Planning', 'Operations Research'],
    tagsEs: ['Optimización', 'Logística', 'Planificación de Rutas', 'Investigación Operativa'],
  },

  {
    slug: 'financial-risk-scoring',
    industry: 'Financial Services',
    industryEs: 'Servicios Financieros',
    company: 'Medivest Capital',
    titleEn: 'ML-based risk scoring model reducing default rates by 44%',
    titleEs: 'Modelo de scoring de riesgo basado en ML que reduce las tasas de impago un 44%',
    excerptEn: 'A specialty lending institution replaced rules-based credit assessment with a two-stage ML scoring system, dramatically improving default prediction accuracy and reducing decision time from 4.2 days to 6 hours.',
    excerptEs: 'Una entidad especializada en préstamos sustituyó la evaluación crediticia basada en reglas por un sistema de scoring ML de dos etapas, mejorando drásticamente la precisión de predicción de impagos y reduciendo el tiempo de decisión de 4,2 días a 6 horas.',
    problemEn: `Medivest Capital specialized in SME lending in the healthcare sector. Their existing credit scoring methodology relied primarily on traditional financial ratios and manual underwriter assessments — a process that was slow (average decision time of 4.2 days), inconsistent (significant variation in approval rates across underwriters), and producing a default rate of 8.7% within 12 months of origination, significantly above the company's internal target of 5%.

The inconsistency issue was particularly damaging: analysis showed that the same application, reviewed by different underwriters, received approval decisions in 34% of cases with a difference of two or more rating grades. This created significant regulatory exposure and undermined the company's risk management framework.

A deteriorating macroeconomic environment was placing additional pressure on portfolio quality, making the need for more rigorous, data-driven credit assessment more urgent.`,
    problemEs: `Medivest Capital se especializaba en préstamos a pymes del sector sanitario. Su metodología de scoring crediticio existente se basaba principalmente en ratios financieros tradicionales y evaluaciones manuales de los analistas — un proceso lento (tiempo medio de decisión de 4,2 días), inconsistente (variación significativa en las tasas de aprobación entre analistas) y que producía una tasa de impago del 8,7% en los 12 meses posteriores a la originación, significativamente por encima del objetivo interno del 5%.

La inconsistencia era particularmente dañina: el análisis mostró que la misma solicitud, revisada por diferentes analistas, recibía decisiones de aprobación con una diferencia de dos o más grados de rating en el 34% de los casos.`,
    approachEn: `The project involved building a two-stage ML-based risk scoring system.

Stage 1 — Application Scoring: A gradient boosting model trained on 3 years of application data (6,800 historical loans), incorporating:
- Traditional financial features (revenue, EBITDA margin, leverage ratios, liquidity metrics)
- Behavioral features derived from banking transaction data (payment regularity, cash flow volatility, seasonal patterns)
- Sector-specific features related to healthcare industry dynamics (NHS reimbursement patterns, practice type, regulatory registration status)
- Bureau data features from multiple credit reference agencies

Particular care was taken to address class imbalance in the training data and to implement robust validation procedures including time-series cross-validation to prevent look-ahead bias.

Stage 2 — Behavioral Monitoring: A separate set of models for early warning of financial distress among existing borrowers, using monthly updated behavioral features to identify accounts requiring proactive management 3-6 months before formal default.

Both models were built with full explainability using SHAP values, allowing underwriters to understand the primary factors driving any individual score — critical for regulatory compliance and for building underwriter trust.`,
    approachEs: `El proyecto consistió en construir un sistema de scoring de riesgo basado en ML de dos etapas.

Etapa 1 — Scoring de Solicitud: Un modelo de gradient boosting entrenado en 3 años de datos de solicitudes (6.800 préstamos históricos), incorporando características financieras tradicionales, características conductuales derivadas de datos de transacciones bancarias, características sectoriales relacionadas con la dinámica del sector sanitario y datos de bureaux de crédito.

Se prestó especial atención a abordar el desequilibrio de clases en los datos de entrenamiento y a implementar procedimientos de validación robustos, incluyendo validación cruzada de series temporales para evitar el sesgo de anticipación.

Etapa 2 — Monitorización del Comportamiento: Un conjunto separado de modelos para la alerta temprana de dificultades financieras entre los prestatarios existentes, utilizando características conductuales actualizadas mensualmente para identificar cuentas que requieren gestión proactiva 3-6 meses antes del impago formal.

Ambos modelos se construyeron con plena explicabilidad mediante valores SHAP, permitiendo a los analistas entender los factores principales que impulsan cualquier puntuación individual.`,
    solutionEn: `The scoring system was integrated into Medivest's loan origination platform through an API, providing real-time credit scores with SHAP-based explanations for each application. The underwriter interface presents the model score alongside the key positive and negative factors, enabling informed credit decisions in a fraction of the previous time.

The behavioral monitoring system generates monthly risk alerts for the existing loan portfolio, flagging accounts showing early signs of distress and recommending specific management actions.`,
    solutionEs: `El sistema de scoring se integró en la plataforma de originación de préstamos de Medivest a través de una API, proporcionando puntuaciones crediticias en tiempo real con explicaciones basadas en SHAP para cada solicitud. La interfaz del analista presenta la puntuación del modelo junto con los factores positivos y negativos clave, permitiendo decisiones crediticias informadas en una fracción del tiempo anterior.`,
    results: [
      { metric: '12-month default rate', metricEs: 'Tasa de impago a 12 meses', value: '8.7% → 4.9% (−44%)' },
      { metric: 'Application decision time', metricEs: 'Tiempo de decisión de solicitud', value: '4.2 days → 6 hours' },
      { metric: 'Underwriter consistency', metricEs: 'Consistencia de los analistas', value: 'Gini 0.61 → 0.89' },
      { metric: 'Early warning accuracy', metricEs: 'Precisión de alerta temprana', value: '73% of defaults flagged 90+ days early' },
      { metric: 'Estimated year-1 net benefit', metricEs: 'Beneficio neto estimado año 1', value: '€3.2M (provisions + efficiency)' },
    ],
    tagsEn: ['Machine Learning', 'Financial Services', 'Risk Modeling', 'Credit Scoring'],
    tagsEs: ['Machine Learning', 'Servicios Financieros', 'Modelado de Riesgo', 'Scoring Crediticio'],
  },
]

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug)
}
