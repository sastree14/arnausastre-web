export type SiteLanguage = 'en' | 'es' | 'ca'

type ServiceCard = { title: string; body: string; examples: string[] }
type Step = { number: string; title: string; body: string }
type Principle = { title: string; body: string }

export const publicCopy: Record<SiteLanguage, {
  nav: { home: string; services: string; projects: string; knowledge: string; about: string; contact: string }
  footer: { statement: string; navigation: string; capabilities: string; rights: string; note: string }
  home: {
    eyebrow: string; title: string; intro: string; primaryCta: string; secondaryCta: string
    promiseTitle: string; promiseBody: string
    problemsLabel: string; problemsTitle: string; problems: { title: string; body: string }[]
    capabilitiesLabel: string; capabilitiesTitle: string; capabilitiesIntro: string; capabilities: ServiceCard[]
    approachLabel: string; approachTitle: string; steps: Step[]
    principlesLabel: string; principlesTitle: string; principles: Principle[]
    audienceLabel: string; audienceTitle: string; audienceBody: string
    ctaTitle: string; ctaBody: string; ctaButton: string
  }
  services: {
    eyebrow: string; title: string; intro: string
    capabilityLabel: string; capabilityTitle: string; capabilityIntro: string; cards: ServiceCard[]
    processLabel: string; processTitle: string; steps: Step[]
    notFitLabel: string; notFitTitle: string; notFitBody: string
    ctaTitle: string; ctaBody: string; ctaButton: string
  }
  about: {
    eyebrow: string; title: string; intro: string
    purposeLabel: string; purposeTitle: string; purposeBody: string
    valuesLabel: string; valuesTitle: string; values: Principle[]
    modelLabel: string; modelTitle: string; modelBody: string; modelPoints: string[]
    ctaTitle: string; ctaBody: string; ctaButton: string
  }
  contact: {
    eyebrow: string; title: string; intro: string
    formLabel: string; formTitle: string; noCommitment: string
    name: string; company: string; email: string; message: string; placeholder: string
    send: string; sending: string; success: string; error: string; or: string; calendly: string
    nextLabel: string; nextTitle: string; nextSteps: string[]; trust: string
  }
  knowledge: { generatedLabel: string; generatedTitle: string; generatedIntro: string; read: string; published: string }
}> = {
  en: {
    nav: { home: 'Home', services: 'How we work', projects: 'Projects', knowledge: 'Knowledge', about: 'About us', contact: 'Contact' },
    footer: {
      statement: 'Data & AI consulting for better decisions, stronger operations and measurable business value.',
      navigation: 'Navigation', capabilities: 'Capabilities', rights: '© 2026 SC-Analytics. All rights reserved.',
      note: 'Understand before building. Value before technology.'
    },
    home: {
      eyebrow: 'DATA · MATHEMATICS · AI',
      title: 'Better decisions. Better business outcomes.',
      intro: 'We help companies improve planning, operations and decision-making with data, mathematical models, automation and AI. We start with the business problem and build only what creates enough value to justify the cost and complexity.',
      primaryCta: 'How we work', secondaryCta: 'Start a conversation',
      promiseTitle: 'Understand before building.',
      promiseBody: 'The question is not which technology can be used. The question is which decision, process or constraint should improve, what evidence is available and what solution is proportionate to the problem.',
      problemsLabel: 'BUSINESS PROBLEMS', problemsTitle: 'Where analytical work creates value.',
      problems: [
        { title: 'Planning under uncertainty', body: 'Forecast demand, volume, cash flow or workload and convert forecasts into better operational decisions.' },
        { title: 'Resource allocation', body: 'Decide how to allocate inventory, capacity, routes, schedules, budget or capital under real constraints.' },
        { title: 'Risk and prediction', body: 'Build predictive models when they improve a concrete decision and can be validated against the cost of error.' },
        { title: 'Manual or fragmented processes', body: 'Automate repetitive analytical work and connect data, rules and AI where automation is genuinely useful.' },
      ],
      capabilitiesLabel: 'CAPABILITIES', capabilitiesTitle: 'Different problems need different tools.',
      capabilitiesIntro: 'Forecasting, optimisation, machine learning, AI and BI are capabilities, not products. We combine them according to the decision that needs to improve.',
      capabilities: [
        { title: 'Forecasting & planning', body: 'Demand, sales, inventory, finance and multi-horizon planning systems.', examples: ['Time series', 'Scenario planning', 'Forecast-to-decision'] },
        { title: 'Optimisation & simulation', body: 'Mathematical models for allocation, routing, scheduling, blending and operational trade-offs.', examples: ['Operations research', 'Simulation', 'Resource allocation'] },
        { title: 'Machine learning', body: 'Predictive and classification systems designed around the business cost of error.', examples: ['Risk', 'Scoring', 'Predictive analytics'] },
        { title: 'AI & intelligent automation', body: 'Agents and automated workflows when process variability and business value justify the additional complexity.', examples: ['AI agents', 'Workflow automation', 'Human-in-the-loop'] },
        { title: 'Analytics & BI', body: 'Metrics, reporting and decision-support systems that make the current state of the business easier to understand and act on.', examples: ['KPIs', 'Dashboards', 'Decision support'] },
      ],
      approachLabel: 'HOW WE WORK', approachTitle: 'A simple sequence, applied with rigor.',
      steps: [
        { number: '01', title: 'Understand', body: 'Define the decision, objective, constraints, users and economics before discussing tools.' },
        { number: '02', title: 'Design', body: 'Compare alternatives and choose the simplest approach that can solve the problem reliably.' },
        { number: '03', title: 'Build', body: 'Develop and integrate a system that can be used in real operations, not only demonstrated.' },
        { number: '04', title: 'Measure and improve', body: 'Evaluate business impact, monitor limitations and improve only where the evidence supports it.' },
      ],
      principlesLabel: 'OUR PRINCIPLES', principlesTitle: 'Technology with judgment.',
      principles: [
        { title: 'Value before technology', body: 'We do not recommend AI, ML or automation because they are fashionable.' },
        { title: 'Proportionate solutions', body: 'Sophistication is justified only when it creates a clear advantage over a simpler alternative.' },
        { title: 'Clear communication', body: 'We explain assumptions, risks, limitations and expected results without hiding behind jargon.' },
        { title: 'Long-term trust', body: 'If an initiative does not have a reasonable case, saying no is part of the work.' },
      ],
      audienceLabel: 'WHO WE WORK WITH', audienceTitle: 'Companies that have built something valuable and want to operate better.',
      audienceBody: 'Our work is especially relevant for SMEs, mid-market companies, established traditional businesses and consolidated startups that need stronger analytical capability without adding unnecessary organisational or technological layers.',
      ctaTitle: 'Bring us the problem, not the technology.', ctaBody: 'The first conversation is about understanding what is happening, what should improve and whether there is a sensible case for doing anything at all.', ctaButton: 'Start the conversation'
    },
    services: {
      eyebrow: 'HOW WE WORK', title: 'Capabilities selected around the problem.',
      intro: 'We do not sell a fixed technology stack. We work from the decision or process that needs to improve and combine the analytical capabilities that make sense for the context.',
      capabilityLabel: 'CAPABILITIES', capabilityTitle: 'What we can build and improve.', capabilityIntro: 'Each capability can stand alone, but the strongest systems often combine several of them.',
      cards: [
        { title: 'Forecasting & planning', body: 'Forecasting systems that connect expected demand, volume or financial outcomes to planning decisions.', examples: ['Demand forecasting', 'Inventory planning', 'Financial forecasting', 'Multi-horizon forecasting'] },
        { title: 'Optimisation & operations research', body: 'Decision models that search for better allocations under constraints rather than relying only on intuition or static rules.', examples: ['Routing', 'Scheduling', 'Facility location', 'Blending', 'Capacity allocation'] },
        { title: 'Machine learning & predictive models', body: 'Models for risk, classification, propensity and prediction when the decision can be defined, measured and validated.', examples: ['Credit risk', 'Scoring', 'Anomaly detection', 'Predictive analytics'] },
        { title: 'AI agents & intelligent automation', body: 'AI-enabled workflows and agents for processes that benefit from contextual reasoning, while preserving controls where decisions matter.', examples: ['AI agents', 'Document workflows', 'Operational copilots', 'Human approval'] },
        { title: 'Analytics, BI & decision support', body: 'Structured metrics and reporting designed around actions, not dashboards for their own sake.', examples: ['KPI systems', 'Management reporting', 'Decision dashboards', 'What-if analysis'] },
        { title: 'Modelling & simulation', body: 'Mathematical representations of business systems to test scenarios, quantify trade-offs and understand behaviour before acting.', examples: ['Simulation', 'Queueing', 'Markov models', 'Scenario modelling'] },
      ],
      processLabel: 'DELIVERY', processTitle: 'From business question to working system.',
      steps: [
        { number: '01', title: 'Discovery', body: 'Current process, desired outcome, systems, data, constraints, economics and decision ownership.' },
        { number: '02', title: 'Solution design', body: 'Alternatives, expected value, technical approach, scope and the criteria that will define success.' },
        { number: '03', title: 'Implementation', body: 'Build, validation, integration, documentation and direct communication with the people who will use the system.' },
        { number: '04', title: 'Operation', body: 'Monitoring, handover, iteration and support according to the real operational need.' },
      ],
      notFitLabel: 'A USEFUL NO', notFitTitle: 'Sometimes the right recommendation is not to build.',
      notFitBody: 'If the data is insufficient, the expected return does not justify the effort or a simpler operational change solves the problem, we should say so. A smaller project or no project can be the correct outcome.',
      ctaTitle: 'Have a process, decision or problem worth improving?', ctaBody: 'We can start by understanding it. The technology comes later.', ctaButton: 'Discuss the problem'
    },
    about: {
      eyebrow: 'ABOUT SC-ANALYTICS', title: 'A Data & AI consultancy built around judgment and trust.',
      intro: 'SC-Analytics combines quantitative capability with a deliberately direct way of working. We want clients to speak with people who understand the problem, can explain the trade-offs and are accountable for the result.',
      purposeLabel: 'PURPOSE', purposeTitle: 'Use data, mathematics and AI with criterion.',
      purposeBody: 'We exist to help companies understand problems, make difficult decisions, improve processes and evaluate technological opportunities without defaulting to oversized solutions. Knowing what not to build is part of the job.',
      valuesLabel: 'VALUES', valuesTitle: 'How we want the work to feel and perform.',
      values: [
        { title: 'Trust', body: 'Consistency, responsibility and advice that remains correct even when it reduces short-term billing.' },
        { title: 'Honesty and transparency', body: 'Clear explanations of what we know, what we do not know, what can work and what risks remain.' },
        { title: 'Proximity', body: 'Direct communication with the people responsible for understanding and delivering the work.' },
        { title: 'Rigor', body: 'Recommendations supported by data, mathematics, evidence and defensible reasoning.' },
        { title: 'Commitment to value', body: 'Success is measured by usefulness and business impact, not by the complexity of the solution.' },
      ],
      modelLabel: 'OPERATING MODEL', modelTitle: 'As simple as possible. As structured as necessary.',
      modelBody: 'SC-Analytics is designed to remain lean, flexible and close to the client. Roles, processes and tools are added when they solve a real operational need, not to imitate the structure of a larger consultancy.',
      modelPoints: ['Clear accountability', 'Few decision layers', 'Specialisation when required', 'Reusable knowledge without compromising client confidentiality'],
      ctaTitle: 'Looking for a long-term analytical partner?', ctaBody: 'Start with one real problem. We can determine together what deserves to be built.', ctaButton: 'Talk to SC-Analytics'
    },
    contact: {
      eyebrow: 'CONTACT', title: 'Start with the problem.', intro: 'Tell us what is happening, what decision or process you want to improve and why it matters. We will begin there rather than assuming a solution in advance.',
      formLabel: 'YOUR CONTEXT', formTitle: 'What should improve?', noCommitment: 'The first conversation is exploratory. No solution is assumed in advance.',
      name: 'Name', company: 'Company', email: 'Email', message: 'Context', placeholder: 'What is happening today, what should improve and what constraints matter?',
      send: 'Send context', sending: 'Sending…', success: 'Thank you. We have received the context and will reply directly.', error: 'The message could not be sent. Please try again or contact us directly.', or: 'or', calendly: 'Schedule a 30-minute call',
      nextLabel: 'WHAT HAPPENS NEXT', nextTitle: 'A useful first conversation.',
      nextSteps: ['We understand the current process and the business objective.', 'We assess whether data, modelling, automation or AI can create enough value.', 'If there is a fit, we define a proportionate next step. If there is not, we say so.'],
      trust: 'No generic demo, no pre-selected technology and no obligation to continue.'
    },
    knowledge: { generatedLabel: 'SC-ANALYTICS VIEW', generatedTitle: 'Recent analysis', generatedIntro: 'Selected ideas and analyses that passed our editorial filter and were approved for publication.', read: 'Read analysis', published: 'Published' }
  },
  es: {
    nav: { home: 'Inicio', services: 'Cómo trabajamos', projects: 'Proyectos', knowledge: 'Conocimiento', about: 'Sobre nosotros', contact: 'Contacto' },
    footer: {
      statement: 'Consultoría de Data & AI para tomar mejores decisiones, operar mejor y generar valor empresarial medible.',
      navigation: 'Navegación', capabilities: 'Capacidades', rights: '© 2026 SC-Analytics. Todos los derechos reservados.',
      note: 'Comprender antes de construir. Valor antes que tecnología.'
    },
    home: {
      eyebrow: 'DATOS · MATEMÁTICAS · IA',
      title: 'Mejores decisiones. Mejores resultados empresariales.',
      intro: 'Ayudamos a empresas a mejorar planificación, operaciones y toma de decisiones mediante datos, modelos matemáticos, automatización e inteligencia artificial. Empezamos por el problema de negocio y construimos solo cuando el valor esperado justifica el coste y la complejidad.',
      primaryCta: 'Cómo trabajamos', secondaryCta: 'Hablar con nosotros',
      promiseTitle: 'Comprender antes de construir.',
      promiseBody: 'La pregunta no es qué tecnología podemos utilizar. La pregunta es qué decisión, proceso o restricción debe mejorar, qué evidencia existe y qué solución es proporcional al problema.',
      problemsLabel: 'PROBLEMAS DE NEGOCIO', problemsTitle: 'Dónde el trabajo analítico puede crear valor.',
      problems: [
        { title: 'Planificación con incertidumbre', body: 'Prever demanda, volumen, caja o carga de trabajo y convertir la previsión en mejores decisiones operativas.' },
        { title: 'Asignación de recursos', body: 'Decidir cómo asignar inventario, capacidad, rutas, horarios, presupuesto o capital bajo restricciones reales.' },
        { title: 'Riesgo y predicción', body: 'Construir modelos predictivos cuando mejoran una decisión concreta y pueden validarse frente al coste del error.' },
        { title: 'Procesos manuales o fragmentados', body: 'Automatizar trabajo analítico repetitivo y conectar datos, reglas e IA cuando la automatización aporta valor real.' },
      ],
      capabilitiesLabel: 'CAPACIDADES', capabilitiesTitle: 'Problemas distintos requieren herramientas distintas.',
      capabilitiesIntro: 'Forecasting, optimización, machine learning, IA y BI son capacidades, no productos. Las combinamos según la decisión que haya que mejorar.',
      capabilities: [
        { title: 'Forecasting y planificación', body: 'Sistemas de previsión y planificación para demanda, ventas, inventario, finanzas y múltiples horizontes.', examples: ['Series temporales', 'Escenarios', 'Forecast-to-decision'] },
        { title: 'Optimización y simulación', body: 'Modelos matemáticos para asignación, rutas, scheduling y decisiones operativas con restricciones.', examples: ['Investigación operativa', 'Simulación', 'Asignación de recursos'] },
        { title: 'Machine learning', body: 'Sistemas predictivos y de clasificación diseñados alrededor del coste empresarial del error.', examples: ['Riesgo', 'Scoring', 'Analítica predictiva'] },
        { title: 'IA y automatización inteligente', body: 'Agentes y workflows automatizados cuando la variabilidad del proceso y el valor esperado justifican la complejidad adicional.', examples: ['Agentes IA', 'Automatización', 'Human-in-the-loop'] },
        { title: 'Analytics y BI', body: 'Métricas, reporting y sistemas de apoyo a la decisión para comprender mejor el negocio y actuar con más criterio.', examples: ['KPIs', 'Dashboards', 'Sistemas de decisión'] },
      ],
      approachLabel: 'CÓMO TRABAJAMOS', approachTitle: 'Una secuencia sencilla, aplicada con rigor.',
      steps: [
        { number: '01', title: 'Comprender', body: 'Definimos la decisión, el objetivo, las restricciones, los usuarios y la lógica económica antes de hablar de herramientas.' },
        { number: '02', title: 'Diseñar', body: 'Comparamos alternativas y elegimos el enfoque más sencillo que pueda resolver el problema de forma fiable.' },
        { number: '03', title: 'Construir', body: 'Desarrollamos e integramos un sistema utilizable en operaciones reales, no solo demostrable.' },
        { number: '04', title: 'Medir y mejorar', body: 'Evaluamos impacto, vigilamos limitaciones y mejoramos únicamente donde la evidencia lo justifica.' },
      ],
      principlesLabel: 'PRINCIPIOS', principlesTitle: 'Tecnología con criterio.',
      principles: [
        { title: 'Valor antes que tecnología', body: 'No recomendamos IA, ML o automatización porque estén de moda.' },
        { title: 'Soluciones proporcionales', body: 'La sofisticación solo se justifica cuando aporta una ventaja clara frente a una alternativa más sencilla.' },
        { title: 'Comunicación clara', body: 'Explicamos supuestos, riesgos, limitaciones y resultados esperables sin escondernos detrás de jerga.' },
        { title: 'Confianza a largo plazo', body: 'Si una iniciativa no tiene un caso razonable, decir que no también forma parte del trabajo.' },
      ],
      audienceLabel: 'CON QUIÉN TRABAJAMOS', audienceTitle: 'Empresas que ya han construido algo valioso y quieren operar mejor.',
      audienceBody: 'Nuestro trabajo encaja especialmente con PYMEs, empresas medianas, negocios tradicionales consolidados y startups maduras que necesitan más capacidad analítica sin añadir capas organizativas o tecnológicas innecesarias.',
      ctaTitle: 'Tráenos el problema, no la tecnología.', ctaBody: 'La primera conversación sirve para entender qué ocurre, qué debería mejorar y si existe un caso razonable para hacer algo.', ctaButton: 'Empezar la conversación'
    },
    services: {
      eyebrow: 'CÓMO TRABAJAMOS', title: 'Capacidades seleccionadas alrededor del problema.',
      intro: 'No vendemos un stack tecnológico fijo. Partimos de la decisión o proceso que debe mejorar y combinamos las capacidades analíticas que tienen sentido para el contexto.',
      capabilityLabel: 'CAPACIDADES', capabilityTitle: 'Qué podemos construir y mejorar.', capabilityIntro: 'Cada capacidad puede utilizarse por separado, aunque los mejores sistemas suelen combinar varias.',
      cards: [
        { title: 'Forecasting y planificación', body: 'Sistemas de previsión que conectan demanda, volumen o resultados financieros esperados con decisiones de planificación.', examples: ['Demanda', 'Inventario', 'Finanzas', 'Multi-horizonte'] },
        { title: 'Optimización e investigación operativa', body: 'Modelos de decisión que buscan mejores asignaciones bajo restricciones reales.', examples: ['Rutas', 'Scheduling', 'Facility location', 'Blending', 'Capacidad'] },
        { title: 'Machine learning y modelos predictivos', body: 'Modelos de riesgo, clasificación, propensión y predicción cuando la decisión puede definirse, medirse y validarse.', examples: ['Riesgo de crédito', 'Scoring', 'Anomalías', 'Predicción'] },
        { title: 'Agentes IA y automatización inteligente', body: 'Workflows y agentes para procesos que se benefician de razonamiento contextual, manteniendo controles donde la decisión importa.', examples: ['Agentes IA', 'Documentos', 'Copilots', 'Aprobación humana'] },
        { title: 'Analytics, BI y apoyo a la decisión', body: 'Métricas y reporting diseñados alrededor de acciones concretas, no dashboards por el simple hecho de tenerlos.', examples: ['KPIs', 'Reporting', 'Dashboards', 'What-if'] },
        { title: 'Modelización y simulación', body: 'Representaciones matemáticas del negocio para probar escenarios, cuantificar trade-offs y comprender el sistema antes de actuar.', examples: ['Simulación', 'Colas', 'Markov', 'Escenarios'] },
      ],
      processLabel: 'ENTREGA', processTitle: 'De la pregunta de negocio al sistema funcionando.',
      steps: [
        { number: '01', title: 'Discovery', body: 'Proceso actual, resultado deseado, sistemas, datos, restricciones, economía y responsables de la decisión.' },
        { number: '02', title: 'Diseño de solución', body: 'Alternativas, valor esperado, enfoque técnico, alcance y criterios que definirán el éxito.' },
        { number: '03', title: 'Implementación', body: 'Construcción, validación, integración, documentación y comunicación directa con las personas que utilizarán el sistema.' },
        { number: '04', title: 'Operación', body: 'Monitorización, handover, iteración y soporte en función de la necesidad operativa real.' },
      ],
      notFitLabel: 'UN NO ÚTIL', notFitTitle: 'A veces la recomendación correcta es no construir.',
      notFitBody: 'Si los datos son insuficientes, el retorno esperado no justifica el esfuerzo o un cambio operativo más sencillo resuelve el problema, debemos decirlo. Un proyecto menor o ningún proyecto pueden ser la respuesta correcta.',
      ctaTitle: '¿Hay un proceso, decisión o problema que merece mejorar?', ctaBody: 'Podemos empezar por entenderlo. La tecnología viene después.', ctaButton: 'Hablar del problema'
    },
    about: {
      eyebrow: 'SOBRE SC-ANALYTICS', title: 'Una consultora de Data & AI construida alrededor del criterio y la confianza.',
      intro: 'SC-Analytics combina capacidad cuantitativa con una forma de trabajar deliberadamente directa. Queremos que el cliente hable con personas que entienden el problema, pueden explicar los trade-offs y asumen responsabilidad sobre el resultado.',
      purposeLabel: 'PROPÓSITO', purposeTitle: 'Utilizar datos, matemáticas e IA con criterio.',
      purposeBody: 'Existimos para ayudar a empresas a comprender problemas, tomar decisiones difíciles, mejorar procesos y evaluar oportunidades tecnológicas sin caer por defecto en soluciones sobredimensionadas. Saber qué no hace falta construir también forma parte del trabajo.',
      valuesLabel: 'VALORES', valuesTitle: 'Cómo queremos que se sienta y funcione nuestro trabajo.',
      values: [
        { title: 'Confianza', body: 'Consistencia, responsabilidad y recomendaciones correctas incluso cuando reducen la facturación a corto plazo.' },
        { title: 'Honestidad y transparencia', body: 'Explicar con claridad qué sabemos, qué no sabemos, qué puede funcionar y qué riesgos siguen existiendo.' },
        { title: 'Cercanía', body: 'Comunicación directa con las personas responsables de comprender y ejecutar el trabajo.' },
        { title: 'Rigor', body: 'Recomendaciones respaldadas por datos, matemáticas, evidencia y razonamiento defendible.' },
        { title: 'Compromiso con el valor', body: 'El éxito se mide por utilidad e impacto empresarial, no por complejidad técnica.' },
      ],
      modelLabel: 'MODELO DE TRABAJO', modelTitle: 'Tan simple como sea posible. Tan estructurado como sea necesario.',
      modelBody: 'SC-Analytics está diseñada para mantenerse ligera, flexible y cercana al cliente. Añadimos roles, procesos y herramientas cuando resuelven una necesidad operativa real, no para imitar la estructura de una consultora grande.',
      modelPoints: ['Responsabilidad clara', 'Pocas capas de decisión', 'Especialización cuando hace falta', 'Conocimiento reutilizable sin comprometer la confidencialidad del cliente'],
      ctaTitle: '¿Buscas un partner analítico a largo plazo?', ctaBody: 'Empieza por un problema real. Podemos decidir juntos qué merece construirse.', ctaButton: 'Hablar con SC-Analytics'
    },
    contact: {
      eyebrow: 'CONTACTO', title: 'Empecemos por el problema.', intro: 'Cuéntanos qué está ocurriendo, qué decisión o proceso quieres mejorar y por qué importa. Empezaremos por ahí en lugar de asumir una solución de antemano.',
      formLabel: 'TU CONTEXTO', formTitle: '¿Qué debería mejorar?', noCommitment: 'La primera conversación es exploratoria. No asumimos ninguna solución de antemano.',
      name: 'Nombre', company: 'Empresa', email: 'Email', message: 'Contexto', placeholder: '¿Qué ocurre hoy, qué debería mejorar y qué restricciones son importantes?',
      send: 'Enviar contexto', sending: 'Enviando…', success: 'Gracias. Hemos recibido el contexto y te responderemos directamente.', error: 'No se ha podido enviar el mensaje. Inténtalo de nuevo o contáctanos directamente.', or: 'o', calendly: 'Reservar una llamada de 30 minutos',
      nextLabel: 'QUÉ PASA DESPUÉS', nextTitle: 'Una primera conversación útil.',
      nextSteps: ['Entendemos el proceso actual y el objetivo empresarial.', 'Evaluamos si datos, modelización, automatización o IA pueden crear suficiente valor.', 'Si hay encaje, definimos un siguiente paso proporcional. Si no lo hay, lo decimos.'],
      trust: 'Sin demo genérica, sin tecnología preseleccionada y sin obligación de continuar.'
    },
    knowledge: { generatedLabel: 'VISIÓN SC-ANALYTICS', generatedTitle: 'Análisis recientes', generatedIntro: 'Ideas y análisis seleccionados que han superado nuestro filtro editorial y han sido aprobados para publicación.', read: 'Leer análisis', published: 'Publicado' }
  },
  ca: {
    nav: { home: 'Inici', services: 'Com treballem', projects: 'Projectes', knowledge: 'Coneixement', about: 'Sobre nosaltres', contact: 'Contacte' },
    footer: {
      statement: 'Consultoria de Data & AI per prendre millors decisions, operar millor i generar valor empresarial mesurable.',
      navigation: 'Navegació', capabilities: 'Capacitats', rights: '© 2026 SC-Analytics. Tots els drets reservats.',
      note: 'Comprendre abans de construir. Valor abans que tecnologia.'
    },
    home: {
      eyebrow: 'DADES · MATEMÀTIQUES · IA', title: 'Millors decisions. Millors resultats empresarials.',
      intro: 'Ajudem empreses a millorar la planificació, les operacions i la presa de decisions mitjançant dades, models matemàtics, automatització i intel·ligència artificial. Comencem pel problema de negoci i construïm només quan el valor esperat justifica el cost i la complexitat.',
      primaryCta: 'Com treballem', secondaryCta: 'Parlar amb nosaltres',
      promiseTitle: 'Comprendre abans de construir.', promiseBody: 'La pregunta no és quina tecnologia podem utilitzar. La pregunta és quina decisió, procés o restricció ha de millorar, quina evidència existeix i quina solució és proporcional al problema.',
      problemsLabel: 'PROBLEMES DE NEGOCI', problemsTitle: 'On el treball analític pot crear valor.',
      problems: [
        { title: 'Planificació amb incertesa', body: 'Preveure demanda, volum, caixa o càrrega de treball i convertir la previsió en millors decisions operatives.' },
        { title: 'Assignació de recursos', body: 'Decidir com assignar inventari, capacitat, rutes, horaris, pressupost o capital sota restriccions reals.' },
        { title: 'Risc i predicció', body: 'Construir models predictius quan milloren una decisió concreta i es poden validar davant del cost de l’error.' },
        { title: 'Processos manuals o fragmentats', body: 'Automatitzar treball analític repetitiu i connectar dades, regles i IA quan l’automatització aporta valor real.' },
      ],
      capabilitiesLabel: 'CAPACITATS', capabilitiesTitle: 'Problemes diferents requereixen eines diferents.', capabilitiesIntro: 'Forecasting, optimització, machine learning, IA i BI són capacitats, no productes. Les combinem segons la decisió que calgui millorar.',
      capabilities: [
        { title: 'Forecasting i planificació', body: 'Sistemes de previsió i planificació per demanda, vendes, inventari, finances i múltiples horitzons.', examples: ['Sèries temporals', 'Escenaris', 'Forecast-to-decision'] },
        { title: 'Optimització i simulació', body: 'Models matemàtics per assignació, rutes, scheduling i decisions operatives amb restriccions.', examples: ['Investigació operativa', 'Simulació', 'Assignació de recursos'] },
        { title: 'Machine learning', body: 'Sistemes predictius i de classificació dissenyats al voltant del cost empresarial de l’error.', examples: ['Risc', 'Scoring', 'Analítica predictiva'] },
        { title: 'IA i automatització intel·ligent', body: 'Agents i workflows automatitzats quan la variabilitat del procés i el valor esperat justifiquen la complexitat addicional.', examples: ['Agents IA', 'Automatització', 'Human-in-the-loop'] },
        { title: 'Analytics i BI', body: 'Mètriques, reporting i sistemes de suport a la decisió per comprendre millor el negoci i actuar amb més criteri.', examples: ['KPIs', 'Dashboards', 'Sistemes de decisió'] },
      ],
      approachLabel: 'COM TREBALLEM', approachTitle: 'Una seqüència senzilla, aplicada amb rigor.',
      steps: [
        { number: '01', title: 'Comprendre', body: 'Definim la decisió, l’objectiu, les restriccions, els usuaris i la lògica econòmica abans de parlar d’eines.' },
        { number: '02', title: 'Dissenyar', body: 'Comparem alternatives i escollim l’enfocament més senzill que pugui resoldre el problema de manera fiable.' },
        { number: '03', title: 'Construir', body: 'Desenvolupem i integrem un sistema utilitzable en operacions reals, no només demostrable.' },
        { number: '04', title: 'Mesurar i millorar', body: 'Avaluem l’impacte, vigilem les limitacions i millorem només on l’evidència ho justifica.' },
      ],
      principlesLabel: 'PRINCIPIS', principlesTitle: 'Tecnologia amb criteri.',
      principles: [
        { title: 'Valor abans que tecnologia', body: 'No recomanem IA, ML o automatització perquè estiguin de moda.' },
        { title: 'Solucions proporcionals', body: 'La sofisticació només es justifica quan aporta un avantatge clar davant d’una alternativa més senzilla.' },
        { title: 'Comunicació clara', body: 'Expliquem supòsits, riscos, limitacions i resultats esperables sense amagar-nos darrere de la jerga.' },
        { title: 'Confiança a llarg termini', body: 'Si una iniciativa no té un cas raonable, dir que no també forma part de la feina.' },
      ],
      audienceLabel: 'AMB QUI TREBALLEM', audienceTitle: 'Empreses que ja han construït alguna cosa valuosa i volen operar millor.',
      audienceBody: 'El nostre treball encaixa especialment amb PIMEs, empreses mitjanes, negocis tradicionals consolidats i startups madures que necessiten més capacitat analítica sense afegir capes organitzatives o tecnològiques innecessàries.',
      ctaTitle: 'Porta’ns el problema, no la tecnologia.', ctaBody: 'La primera conversa serveix per entendre què passa, què hauria de millorar i si existeix un cas raonable per fer alguna cosa.', ctaButton: 'Començar la conversa'
    },
    services: {
      eyebrow: 'COM TREBALLEM', title: 'Capacitats seleccionades al voltant del problema.', intro: 'No venem un stack tecnològic fix. Partim de la decisió o procés que ha de millorar i combinem les capacitats analítiques que tenen sentit per al context.',
      capabilityLabel: 'CAPACITATS', capabilityTitle: 'Què podem construir i millorar.', capabilityIntro: 'Cada capacitat es pot utilitzar per separat, tot i que els millors sistemes solen combinar-ne diverses.',
      cards: [
        { title: 'Forecasting i planificació', body: 'Sistemes de previsió que connecten demanda, volum o resultats financers esperats amb decisions de planificació.', examples: ['Demanda', 'Inventari', 'Finances', 'Multi-horitzó'] },
        { title: 'Optimització i investigació operativa', body: 'Models de decisió que busquen millors assignacions sota restriccions reals.', examples: ['Rutes', 'Scheduling', 'Facility location', 'Blending', 'Capacitat'] },
        { title: 'Machine learning i models predictius', body: 'Models de risc, classificació, propensió i predicció quan la decisió es pot definir, mesurar i validar.', examples: ['Risc de crèdit', 'Scoring', 'Anomalies', 'Predicció'] },
        { title: 'Agents IA i automatització intel·ligent', body: 'Workflows i agents per processos que es beneficien de raonament contextual, mantenint controls on la decisió importa.', examples: ['Agents IA', 'Documents', 'Copilots', 'Aprovació humana'] },
        { title: 'Analytics, BI i suport a la decisió', body: 'Mètriques i reporting dissenyats al voltant d’accions concretes, no dashboards pel simple fet de tenir-los.', examples: ['KPIs', 'Reporting', 'Dashboards', 'What-if'] },
        { title: 'Modelització i simulació', body: 'Representacions matemàtiques del negoci per provar escenaris, quantificar trade-offs i comprendre el sistema abans d’actuar.', examples: ['Simulació', 'Cues', 'Markov', 'Escenaris'] },
      ],
      processLabel: 'ENTREGA', processTitle: 'De la pregunta de negoci al sistema funcionant.',
      steps: [
        { number: '01', title: 'Discovery', body: 'Procés actual, resultat desitjat, sistemes, dades, restriccions, economia i responsables de la decisió.' },
        { number: '02', title: 'Disseny de solució', body: 'Alternatives, valor esperat, enfocament tècnic, abast i criteris que definiran l’èxit.' },
        { number: '03', title: 'Implementació', body: 'Construcció, validació, integració, documentació i comunicació directa amb les persones que utilitzaran el sistema.' },
        { number: '04', title: 'Operació', body: 'Monitorització, handover, iteració i suport en funció de la necessitat operativa real.' },
      ],
      notFitLabel: 'UN NO ÚTIL', notFitTitle: 'A vegades la recomanació correcta és no construir.', notFitBody: 'Si les dades són insuficients, el retorn esperat no justifica l’esforç o un canvi operatiu més senzill resol el problema, ho hem de dir. Un projecte menor o cap projecte poden ser la resposta correcta.',
      ctaTitle: 'Hi ha un procés, decisió o problema que mereix millorar?', ctaBody: 'Podem començar per entendre’l. La tecnologia ve després.', ctaButton: 'Parlar del problema'
    },
    about: {
      eyebrow: 'SOBRE SC-ANALYTICS', title: 'Una consultora de Data & AI construïda al voltant del criteri i la confiança.', intro: 'SC-Analytics combina capacitat quantitativa amb una manera de treballar deliberadament directa. Volem que el client parli amb persones que entenen el problema, poden explicar els trade-offs i assumeixen responsabilitat sobre el resultat.',
      purposeLabel: 'PROPÒSIT', purposeTitle: 'Utilitzar dades, matemàtiques i IA amb criteri.', purposeBody: 'Existim per ajudar empreses a comprendre problemes, prendre decisions difícils, millorar processos i avaluar oportunitats tecnològiques sense caure per defecte en solucions sobredimensionades. Saber què no cal construir també forma part de la feina.',
      valuesLabel: 'VALORS', valuesTitle: 'Com volem que se senti i funcioni la nostra feina.',
      values: [
        { title: 'Confiança', body: 'Consistència, responsabilitat i recomanacions correctes fins i tot quan redueixen la facturació a curt termini.' },
        { title: 'Honestedat i transparència', body: 'Explicar amb claredat què sabem, què no sabem, què pot funcionar i quins riscos continuen existint.' },
        { title: 'Proximitat', body: 'Comunicació directa amb les persones responsables de comprendre i executar la feina.' },
        { title: 'Rigor', body: 'Recomanacions recolzades per dades, matemàtiques, evidència i raonament defensable.' },
        { title: 'Compromís amb el valor', body: 'L’èxit es mesura per utilitat i impacte empresarial, no per complexitat tècnica.' },
      ],
      modelLabel: 'MODEL DE TREBALL', modelTitle: 'Tan simple com sigui possible. Tan estructurat com sigui necessari.', modelBody: 'SC-Analytics està dissenyada per mantenir-se lleugera, flexible i propera al client. Afegim rols, processos i eines quan resolen una necessitat operativa real, no per imitar l’estructura d’una consultora gran.',
      modelPoints: ['Responsabilitat clara', 'Poques capes de decisió', 'Especialització quan cal', 'Coneixement reutilitzable sense comprometre la confidencialitat del client'],
      ctaTitle: 'Busques un partner analític a llarg termini?', ctaBody: 'Comença per un problema real. Podem decidir junts què mereix construir-se.', ctaButton: 'Parlar amb SC-Analytics'
    },
    contact: {
      eyebrow: 'CONTACTE', title: 'Comencem pel problema.', intro: 'Explica’ns què està passant, quina decisió o procés vols millorar i per què importa. Començarem per aquí en lloc d’assumir una solució per endavant.',
      formLabel: 'EL TEU CONTEXT', formTitle: 'Què hauria de millorar?', noCommitment: 'La primera conversa és exploratòria. No assumim cap solució per endavant.',
      name: 'Nom', company: 'Empresa', email: 'Email', message: 'Context', placeholder: 'Què passa avui, què hauria de millorar i quines restriccions són importants?',
      send: 'Enviar context', sending: 'Enviant…', success: 'Gràcies. Hem rebut el context i et respondrem directament.', error: 'No s’ha pogut enviar el missatge. Torna-ho a provar o contacta’ns directament.', or: 'o', calendly: 'Reservar una trucada de 30 minuts',
      nextLabel: 'QUÈ PASSA DESPRÉS', nextTitle: 'Una primera conversa útil.', nextSteps: ['Entenem el procés actual i l’objectiu empresarial.', 'Avaluem si dades, modelització, automatització o IA poden crear prou valor.', 'Si hi ha encaix, definim un següent pas proporcional. Si no n’hi ha, ho diem.'], trust: 'Sense demo genèrica, sense tecnologia preseleccionada i sense obligació de continuar.'
    },
    knowledge: { generatedLabel: 'VISIÓ SC-ANALYTICS', generatedTitle: 'Anàlisis recents', generatedIntro: 'Idees i anàlisis seleccionades que han superat el nostre filtre editorial i han estat aprovades per a publicació.', read: 'Llegir anàlisi', published: 'Publicat' }
  }
}
