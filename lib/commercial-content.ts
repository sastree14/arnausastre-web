import type { SiteLanguage } from "@/lib/public-copy";
export const tr = (
  es: string,
  ca: string,
  en: string,
): Record<SiteLanguage, string> => ({ es, ca, en });
export const serviceCatalog = [
  {
    slug: "demand-forecasting",
    group: 0,
    title: tr(
      "Previsión de demanda",
      "Previsió de demanda",
      "Demand forecasting",
    ),
    problem: tr(
      "Las compras y la producción dependen de previsiones que no reflejan cambios de demanda.",
      "Les compres i la producció depenen de previsions que no reflecteixen els canvis de demanda.",
      "Purchasing and production depend on forecasts that miss demand changes.",
    ),
    deliverable: tr(
      "Previsiones por producto y horizonte, comparadas con modelos base mediante validación temporal.",
      "Previsions per producte i horitzó, comparades amb models base mitjançant validació temporal.",
      "Product and horizon forecasts compared against baselines through temporal validation.",
    ),
  },
  {
    slug: "inventory-optimization",
    group: 0,
    title: tr(
      "Planificación de inventario",
      "Planificació d’inventari",
      "Inventory planning",
    ),
    problem: tr(
      "El exceso de stock convive con roturas y prioridades de reposición poco claras.",
      "L’excés d’estoc conviu amb ruptures i prioritats de reposició poc clares.",
      "Excess stock coexists with stockouts and unclear replenishment priorities.",
    ),
    deliverable: tr(
      "Políticas de reposición y escenarios de servicio, coste y capital, con sus restricciones explícitas.",
      "Polítiques de reposició i escenaris de servei, cost i capital, amb restriccions explícites.",
      "Replenishment policies and service, cost and capital scenarios with explicit constraints.",
    ),
  },
  {
    slug: "business-optimization",
    group: 1,
    title: tr(
      "Optimización de operaciones",
      "Optimització d’operacions",
      "Operations optimization",
    ),
    problem: tr(
      "Asignar recursos, turnos o capacidad exige equilibrar costes y restricciones.",
      "Assignar recursos, torns o capacitat exigeix equilibrar costos i restriccions.",
      "Allocating resources, shifts or capacity requires balancing costs and constraints.",
    ),
    deliverable: tr(
      "Un modelo de decisión que compara alternativas factibles y explica sus compromisos.",
      "Un model de decisió que compara alternatives factibles i explica els compromisos.",
      "A decision model that compares feasible alternatives and explains trade-offs.",
    ),
  },
  {
    slug: "operations-research",
    group: 1,
    title: tr(
      "Investigación operativa",
      "Investigació operativa",
      "Operations research",
    ),
    problem: tr(
      "Las reglas manuales dejan de funcionar cuando crecen las combinaciones y las dependencias.",
      "Les regles manuals deixen de funcionar quan creixen les combinacions i les dependències.",
      "Manual rules stop working as combinations and dependencies grow.",
    ),
    deliverable: tr(
      "Formulación matemática, restricciones verificadas y un método de resolución documentado.",
      "Formulació matemàtica, restriccions verificades i un mètode de resolució documentat.",
      "A mathematical formulation, verified constraints and a documented solution method.",
    ),
  },
  {
    slug: "simulation",
    group: 1,
    title: tr(
      "Simulación de escenarios",
      "Simulació d’escenaris",
      "Scenario simulation",
    ),
    problem: tr(
      "Cambiar una operación sin anticipar sus efectos puede trasladar el problema a otra parte.",
      "Canviar una operació sense anticipar els efectes pot traslladar el problema a un altre lloc.",
      "Changing an operation without anticipating its effects can move the problem elsewhere.",
    ),
    deliverable: tr(
      "Escenarios comparables, análisis de sensibilidad y supuestos que se pueden revisar.",
      "Escenaris comparables, anàlisi de sensibilitat i supòsits revisables.",
      "Comparable scenarios, sensitivity analysis and assumptions open to review.",
    ),
  },
  {
    slug: "ai-automation",
    group: 2,
    title: tr(
      "Automatización inteligente",
      "Automatització intel·ligent",
      "Intelligent automation",
    ),
    problem: tr(
      "Las tareas repetitivas consumen tiempo y fragmentan la información entre herramientas.",
      "Les tasques repetitives consumeixen temps i fragmenten la informació entre eines.",
      "Repetitive tasks consume time and fragment information across tools.",
    ),
    deliverable: tr(
      "Flujos integrados con trazabilidad, gestión de excepciones y supervisión humana.",
      "Fluxos integrats amb traçabilitat, gestió d’excepcions i supervisió humana.",
      "Integrated workflows with traceability, exception handling and human oversight.",
    ),
  },
  {
    slug: "ai-agents",
    group: 2,
    title: tr("Agentes de IA", "Agents d’IA", "AI agents"),
    problem: tr(
      "El equipo busca información y ejecuta tareas de varios pasos en sistemas separados.",
      "L’equip busca informació i executa tasques de diversos passos en sistemes separats.",
      "Teams search for information and execute multi-step tasks across separate systems.",
    ),
    deliverable: tr(
      "Un agente con herramientas acotadas, permisos, evaluaciones y puntos de aprobación.",
      "Un agent amb eines delimitades, permisos, avaluacions i punts d’aprovació.",
      "An agent with scoped tools, permissions, evaluations and approval checkpoints.",
    ),
  },
  {
    slug: "machine-learning",
    group: 3,
    title: tr(
      "Machine learning aplicado",
      "Machine learning aplicat",
      "Applied machine learning",
    ),
    problem: tr(
      "La decisión necesita una predicción fiable, y todavía no sabemos si un modelo complejo aporta valor.",
      "La decisió necessita una predicció fiable i encara no sabem si un model complex aporta valor.",
      "The decision needs a reliable prediction, and it is unclear whether complexity adds value.",
    ),
    deliverable: tr(
      "Un modelo contrastado con alternativas simples y evaluado en condiciones de uso.",
      "Un model contrastat amb alternatives simples i avaluat en condicions d’ús.",
      "A model tested against simple alternatives and evaluated under intended usage conditions.",
    ),
  },
  {
    slug: "business-analytics",
    group: 3,
    title: tr(
      "Analítica de negocio",
      "Analítica de negoci",
      "Business analytics",
    ),
    problem: tr(
      "Las cifras existen, pero faltan definiciones comunes y una lectura útil para actuar.",
      "Les xifres existeixen, però falten definicions comunes i una lectura útil per actuar.",
      "The numbers exist, but shared definitions and actionable interpretation are missing.",
    ),
    deliverable: tr(
      "Métricas acordadas, análisis trazables y una vista de las decisiones que deben apoyar.",
      "Mètriques acordades, anàlisis traçables i una vista de les decisions que han de donar suport.",
      "Agreed metrics, traceable analysis and a view of the decisions they support.",
    ),
  },
  {
    slug: "decision-support-systems",
    group: 3,
    title: tr(
      "Sistemas de decisión",
      "Sistemes de decisió",
      "Decision support systems",
    ),
    problem: tr(
      "Los análisis se quedan en informes y no llegan al proceso que decide cada día.",
      "Les anàlisis es queden en informes i no arriben al procés que decideix cada dia.",
      "Analysis remains in reports instead of reaching everyday decision processes.",
    ),
    deliverable: tr(
      "Un sistema que reúne datos, reglas y escenarios en el flujo real de trabajo.",
      "Un sistema que reuneix dades, regles i escenaris en el flux real de treball.",
      "A system that brings data, rules and scenarios into the actual workflow.",
    ),
  },
  {
    slug: "data-science-consulting",
    group: 3,
    title: tr(
      "Consultoría de data science",
      "Consultoria de data science",
      "Data science consulting",
    ),
    problem: tr(
      "Hay oportunidades en los datos, pero falta priorizar cuáles merece la pena desarrollar.",
      "Hi ha oportunitats en les dades, però cal prioritzar quines val la pena desenvolupar.",
      "Data offers opportunities, but the team needs to prioritize what is worth building.",
    ),
    deliverable: tr(
      "Diagnóstico de viabilidad, prioridades y una propuesta de desarrollo ligada al negocio.",
      "Diagnòstic de viabilitat, prioritats i una proposta de desenvolupament lligada al negoci.",
      "A feasibility assessment, priorities and a development proposal tied to business needs.",
    ),
  },
  {
    slug: "ai-consulting",
    group: 2,
    title: tr(
      "Consultoría de inteligencia artificial",
      "Consultoria d’intel·ligència artificial",
      "AI consulting",
    ),
    problem: tr(
      "Hay presión por adoptar IA sin un caso de uso ni criterios de éxito claros.",
      "Hi ha pressió per adoptar IA sense un cas d’ús ni criteris d’èxit clars.",
      "There is pressure to adopt AI without a clear use case or success criteria.",
    ),
    deliverable: tr(
      "Selección de casos, evaluación de riesgos y una prueba acotada con criterios de continuidad.",
      "Selecció de casos, avaluació de riscos i una prova delimitada amb criteris de continuïtat.",
      "Use-case selection, risk assessment and a scoped pilot with continuation criteria.",
    ),
  },
  {
    slug: "external-data-ai-partner",
    group: 3,
    title: tr(
      "Partner externo de datos e IA",
      "Partner extern de dades i IA",
      "External data and AI partner",
    ),
    problem: tr(
      "Las necesidades se repiten, pero no justifican incorporar todas las especialidades al equipo.",
      "Les necessitats es repeteixen, però no justifiquen incorporar totes les especialitats a l’equip.",
      "Recurring needs do not justify hiring every specialist into the team.",
    ),
    deliverable: tr(
      "Una cartera priorizada, responsables claros y entregas revisadas junto a vuestro equipo.",
      "Una cartera prioritzada, responsables clars i lliuraments revisats amb el vostre equip.",
      "A prioritized backlog, clear ownership and deliverables reviewed with your team.",
    ),
  },
  {
    slug: "demand-planning",
    group: 0,
    title: tr(
      "Planificación de demanda",
      "Planificació de demanda",
      "Demand planning",
    ),
    problem: tr(
      "La previsión no se traduce en un plan compartido de compras, ventas y operaciones.",
      "La previsió no es tradueix en un pla compartit de compres, vendes i operacions.",
      "The forecast does not translate into a shared purchasing, sales and operations plan.",
    ),
    deliverable: tr(
      "Escenarios de demanda, revisión de supuestos y un proceso de planificación con responsables.",
      "Escenaris de demanda, revisió de supòsits i un procés de planificació amb responsables.",
      "Demand scenarios, reviewed assumptions and a planning process with clear owners.",
    ),
  },
  {
    slug: "logistics-optimization",
    group: 1,
    title: tr(
      "Optimización logística",
      "Optimització logística",
      "Logistics optimization",
    ),
    problem: tr(
      "Las decisiones logísticas equilibran servicio, capacidad y coste con reglas difíciles de mantener.",
      "Les decisions logístiques equilibren servei, capacitat i cost amb regles difícils de mantenir.",
      "Logistics decisions balance service, capacity and cost through difficult-to-maintain rules.",
    ),
    deliverable: tr(
      "Alternativas factibles con costes y restricciones visibles para el equipo operativo.",
      "Alternatives factibles amb costos i restriccions visibles per a l’equip operatiu.",
      "Feasible alternatives with costs and constraints visible to the operations team.",
    ),
  },
  {
    slug: "supply-chain-analytics",
    group: 0,
    title: tr(
      "Analítica de supply chain",
      "Analítica de supply chain",
      "Supply chain analytics",
    ),
    problem: tr(
      "Los datos de proveedores, demanda y operación están separados y dificultan anticipar problemas.",
      "Les dades de proveïdors, demanda i operació estan separades i dificulten anticipar problemes.",
      "Supplier, demand and operations data are separated, making problems harder to anticipate.",
    ),
    deliverable: tr(
      "Indicadores compartidos de servicio, inventario y riesgo, con datos trazables y criterios de revisión.",
      "Indicadors compartits de servei, inventari i risc, amb dades traçables i criteris de revisió.",
      "Shared service, inventory and risk indicators with traceable data and review criteria.",
    ),
  },
  {
    slug: "data-engineering",
    group: 3,
    title: tr("Ingeniería de datos", "Enginyeria de dades", "Data engineering"),
    problem: tr(
      "La información llega tarde, duplicada o sin controles de calidad claros.",
      "La informació arriba tard, duplicada o sense controls de qualitat clars.",
      "Information arrives late, duplicated or without clear quality controls.",
    ),
    deliverable: tr(
      "Pipelines de integración con contratos de datos, controles de calidad y seguimiento de incidencias.",
      "Pipelines d’integració amb contractes de dades, controls de qualitat i seguiment d’incidències.",
      "Integration pipelines with data contracts, quality checks and issue monitoring.",
    ),
  },
  {
    slug: "machine-learning-consulting",
    group: 3,
    title: tr(
      "Consultoría de machine learning",
      "Consultoria de machine learning",
      "Machine learning consulting",
    ),
    problem: tr(
      "Hace falta evaluar si una predicción puede apoyar una decisión real.",
      "Cal avaluar si una predicció pot donar suport a una decisió real.",
      "The team needs to evaluate whether predictions can support a real decision.",
    ),
    deliverable: tr(
      "Comparación de modelos, evaluación sobre datos separados y criterios de uso y seguimiento.",
      "Comparació de models, avaluació amb dades separades i criteris d’ús i seguiment.",
      "Model comparison, held-out evaluation and usage and monitoring criteria.",
    ),
  },
  {
    slug: "pricing-optimization",
    group: 1,
    title: tr(
      "Optimización de precios",
      "Optimització de preus",
      "Pricing optimization",
    ),
    problem: tr(
      "Cambiar precios afecta al margen, la demanda, el inventario y la confianza del cliente.",
      "Canviar preus afecta el marge, la demanda, l’inventari i la confiança del client.",
      "Price changes affect margin, demand, inventory and customer trust.",
    ),
    deliverable: tr(
      "Escenarios de precio con restricciones comerciales, pruebas y criterios de supervisión.",
      "Escenaris de preu amb restriccions comercials, proves i criteris de supervisió.",
      "Pricing scenarios with commercial constraints, testing and oversight criteria.",
    ),
  },
  {
    slug: "route-optimization",
    group: 1,
    title: tr(
      "Optimización de rutas",
      "Optimització de rutes",
      "Route optimization",
    ),
    problem: tr(
      "La planificación de rutas debe respetar ventanas horarias, capacidad y prioridades de servicio.",
      "La planificació de rutes ha de respectar finestres horàries, capacitat i prioritats de servei.",
      "Routing must respect time windows, capacity and service priorities.",
    ),
    deliverable: tr(
      "Rutas factibles contrastadas con el plan actual y sus restricciones operativas.",
      "Rutes factibles contrastades amb el pla actual i les restriccions operatives.",
      "Feasible routes compared against the current plan and its operating constraints.",
    ),
  },
  {
    slug: "business-intelligence",
    group: 3,
    title: tr(
      "Business intelligence",
      "Business intelligence",
      "Business intelligence",
    ),
    problem: tr(
      "Los cuadros de mando muestran cifras sin una definición ni una decisión asociada.",
      "Els quadres de comandament mostren xifres sense definició ni decisió associada.",
      "Dashboards show numbers without agreed definitions or associated decisions.",
    ),
    deliverable: tr(
      "Un modelo de métricas y vistas de seguimiento acordadas con quienes toman las decisiones.",
      "Un model de mètriques i vistes de seguiment acordades amb qui pren les decisions.",
      "A metrics model and monitoring views agreed with the decision owners.",
    ),
  },
];
export const doors = [
  {
    title: tr(
      "Prever y planificar",
      "Preveure i planificar",
      "Forecast and plan",
    ),
    body: tr(
      "Demanda, inventario y capacidad. Saber qué esperar y cómo prepararse.",
      "Demanda, inventari i capacitat. Saber què esperar i com preparar-se.",
      "Demand, inventory and capacity. Know what to expect and how to prepare.",
    ),
    slug: "demand-forecasting",
  },
  {
    title: tr(
      "Mejorar las operaciones",
      "Millorar les operacions",
      "Improve operations",
    ),
    body: tr(
      "Recursos, restricciones y escenarios. Elegir entre alternativas que realmente se pueden ejecutar.",
      "Recursos, restriccions i escenaris. Triar alternatives que realment es poden executar.",
      "Resources, constraints and scenarios. Choose alternatives that can actually be executed.",
    ),
    slug: "business-optimization",
  },
  {
    title: tr(
      "Automatizar con control",
      "Automatitzar amb control",
      "Automate with control",
    ),
    body: tr(
      "Procesos y agentes de IA. Reducir trabajo manual con trazabilidad y supervisión.",
      "Processos i agents d’IA. Reduir feina manual amb traçabilitat i supervisió.",
      "Processes and AI agents. Reduce manual work with traceability and oversight.",
    ),
    slug: "ai-automation",
  },
  {
    title: tr(
      "Decidir con mejores datos",
      "Decidir amb millors dades",
      "Decide with better data",
    ),
    body: tr(
      "Analítica y sistemas de decisión. Convertir información dispersa en criterios útiles.",
      "Analítica i sistemes de decisió. Convertir informació dispersa en criteris útils.",
      "Analytics and decision systems. Turn fragmented information into useful criteria.",
    ),
    slug: "decision-support-systems",
  },
];
export const method = [
  {
    title: tr("Comprender", "Comprendre", "Understand"),
    body: tr(
      "Acordamos qué decisión debe mejorar, quién la toma y cómo se medirá el resultado.",
      "Acordem quina decisió ha de millorar, qui la pren i com es mesurarà el resultat.",
      "Agree which decision needs to improve, who makes it and how the outcome will be measured.",
    ),
    output: tr(
      "Diagnóstico y criterios de éxito",
      "Diagnòstic i criteris d’èxit",
      "Assessment and success criteria",
    ),
  },
  {
    title: tr("Contrastar", "Contrastar", "Test"),
    body: tr(
      "Revisamos los datos y comparamos una solución simple con las alternativas relevantes.",
      "Revisem les dades i comparem una solució simple amb les alternatives rellevants.",
      "Review the data and compare a simple solution with relevant alternatives.",
    ),
    output: tr(
      "Prueba de viabilidad y validación",
      "Prova de viabilitat i validació",
      "Feasibility evidence and validation",
    ),
  },
  {
    title: tr("Construir", "Construir", "Build"),
    body: tr(
      "Integramos la solución en el trabajo del equipo, con documentación y límites explícitos.",
      "Integrem la solució a la feina de l’equip, amb documentació i límits explícits.",
      "Integrate the solution into the team’s work with documentation and explicit limits.",
    ),
    output: tr(
      "Sistema, documentación y transferencia",
      "Sistema, documentació i transferència",
      "System, documentation and handover",
    ),
  },
  {
    title: tr("Revisar", "Revisar", "Review"),
    body: tr(
      "Comprobamos su uso y acordamos cómo detectar cambios, errores o pérdida de utilidad.",
      "Comprovem l’ús i acordem com detectar canvis, errors o pèrdua d’utilitat.",
      "Review usage and agree how to detect change, errors or declining usefulness.",
    ),
    output: tr(
      "Seguimiento y responsabilidades",
      "Seguiment i responsabilitats",
      "Monitoring and responsibilities",
    ),
  },
];
export const common = {
  claim: tr(
    "Mejores decisiones. Mejores resultados empresariales.",
    "Millors decisions. Millors resultats empresarials.",
    "Better decisions. Better business outcomes.",
  ),
  intro: tr(
    "Ayudamos a empresas a mejorar previsiones, operaciones y decisiones con datos, matemáticas e IA. Empezamos por el problema y construimos lo que tenga sentido para resolverlo.",
    "Ajudem empreses a millorar previsions, operacions i decisions amb dades, matemàtiques i IA. Comencem pel problema i construïm allò que tingui sentit per resoldre’l.",
    "We help businesses improve forecasts, operations and decisions with data, mathematics and AI. We start with the problem and build what makes sense to solve it.",
  ),
  talk: tr(
    "Cuéntanos qué quieres mejorar",
    "Explica’ns què vols millorar",
    "Tell us what needs to improve",
  ),
  book: tr(
    "Reservar llamada de 30 min",
    "Reservar trucada de 30 min",
    "Book a 30-minute call",
  ),
  noCommitment: tr(
    "Primera conversación gratuita, sin compromiso. No necesitas una solución definida.",
    "Primera conversa gratuïta, sense compromís. No cal tenir una solució definida.",
    "A free first conversation with no commitment. You do not need a defined solution.",
  ),
  explore: tr(
    "Explorar el enfoque",
    "Explorar l’enfocament",
    "Explore the approach",
  ),
  evidence: tr(
    "Implementaciones públicas con datos sintéticos. Muestran el método y sus límites; no son resultados medidos de clientes.",
    "Implementacions públiques amb dades sintètiques. Mostren el mètode i els límits; no són resultats mesurats de clients.",
    "Public implementations with synthetic data. They demonstrate the method and its limits; they are not measured client outcomes.",
  ),
};
