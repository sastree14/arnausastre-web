export interface Article {
  slug: string
  titleEn: string
  titleEs: string
  date: string
  readingTime: number
  tagsEn: string[]
  tagsEs: string[]
  excerptEn: string
  excerptEs: string
  bodyEn: string
  bodyEs: string
}

export const articles: Article[] = [
  {
    slug: 'why-forecasting-systems-fail',
    titleEn: 'Why most forecasting systems fail in practice',
    titleEs: 'Por qué la mayoría de sistemas de forecasting fracasan en la práctica',
    date: '2026-02-10',
    readingTime: 6,
    tagsEn: ['Forecasting', 'Data Science', 'Business'],
    tagsEs: ['Forecasting', 'Ciencia de Datos', 'Negocio'],
    excerptEn: 'Companies invest heavily in forecasting infrastructure only to end up with systems that underperform, get ignored, or are quietly abandoned. The technology is rarely the problem.',
    excerptEs: 'Las empresas invierten considerablemente en infraestructura de forecasting para acabar con sistemas que rinden por debajo de las expectativas, se ignoran o se abandonan silenciosamente. La tecnología raramente es el problema.',
    bodyEn: `Many companies invest significantly in forecasting infrastructure — modern tools, large datasets, sometimes entire data science teams — only to end up with systems that underperform, get ignored, or are quietly abandoned. The technology is rarely the problem. The failure points are almost always structural, organizational and methodological.

**Starting with the model, not the decision**

The first mistake is treating forecasting as a purely technical exercise. Teams spend months selecting algorithms, tuning hyperparameters and optimizing accuracy metrics, without first asking: what decision does this forecast need to support? A demand forecast for inventory planning has fundamentally different requirements than one used for pricing or workforce allocation. When the forecasting system isn't designed around a specific decision, the outputs are rarely actionable.

**Ignoring the data generation process**

A forecast is only as good as the data that feeds it. Most real-world business data contains structural problems: irregular promotions that distort baseline demand, supply constraints that mask true customer willingness-to-buy, historical anomalies that introduce noise. Many forecasting projects fail not because of poor models, but because practitioners didn't invest enough time understanding how the data was generated and what it actually represents.

**Optimizing the wrong metric**

MAPE, RMSE, MAE — accuracy metrics are useful, but they rarely map directly to business cost. A forecasting system optimized for symmetric error metrics might consistently underforecast peak demand, where the cost of a stockout far exceeds the cost of excess inventory. Forecasting for business requires connecting model performance to financial outcomes, and sometimes this means accepting worse statistical accuracy in exchange for better operational performance.

**No uncertainty quantification**

Point forecasts — single numbers representing expected demand — are often insufficient for decision-making. A planning system that says "demand will be 1,200 units" gives no guidance on how confident to be in that estimate, or how much safety stock to hold. Proper forecasting systems communicate uncertainty through prediction intervals, scenario ranges or probabilistic outputs, enabling decision-makers to manage risk rather than just react to it.

**Static models in dynamic environments**

Businesses change. Customer behavior shifts, competitive dynamics evolve, product lines expand, and macroeconomic conditions move. A forecasting model trained on historical data will gradually drift from reality if it isn't regularly recalibrated. Many organizations deploy a forecasting system and then largely leave it untouched, treating it as a finished product rather than a living system that requires ongoing maintenance.

**The adoption gap**

Perhaps the most insidious failure mode is a technically sound forecasting system that no one uses. This happens when the outputs aren't accessible to the people who need them, when the system is too opaque to trust, or when it contradicts the intuitions of experienced planners without offering adequate explanation. A forecasting system that isn't used is, for practical purposes, a system that doesn't exist.

**What actually works**

Effective forecasting systems share a few common characteristics. They are designed around specific decisions, not generic accuracy. They have clear data pipelines with documented transformations. They communicate uncertainty honestly. They are maintained and recalibrated on a regular schedule. And critically, they are designed with the end user in mind — accessible, explainable and aligned with how decisions are actually made in the organization.

The best forecasting systems are also humble. They know the limits of what historical patterns can predict, and they are built to combine model outputs with human judgment where appropriate. This isn't a sign of weakness — it's a sign that the system is designed for real business use, not for a benchmarking competition.

Investing in forecasting capability is valuable. But the value comes from systems that are rigorously designed, honestly validated, and genuinely used. The failure to achieve this is rarely a technology problem. It is almost always a problem of method, process and organizational alignment.`,

    bodyEs: `Muchas empresas invierten considerablemente en infraestructura de forecasting — herramientas modernas, grandes volúmenes de datos, a veces equipos enteros de data science — para acabar con sistemas que rinden por debajo de las expectativas, se ignoran o se abandonan silenciosamente. La tecnología raramente es el problema. Los puntos de fallo son casi siempre estructurales, organizativos y metodológicos.

**Empezar por el modelo, no por la decisión**

El primer error es tratar el forecasting como un ejercicio puramente técnico. Los equipos pasan meses seleccionando algoritmos, ajustando hiperparámetros y optimizando métricas de precisión, sin preguntarse primero: ¿qué decisión necesita soportar esta predicción? Un forecast de demanda para planificación de inventario tiene requisitos fundamentalmente diferentes a uno utilizado para pricing o planificación de plantilla. Cuando el sistema de forecasting no está diseñado en torno a una decisión específica, los resultados raramente son accionables.

**Ignorar el proceso de generación de datos**

Una predicción es tan buena como los datos que la alimentan. La mayoría de los datos empresariales del mundo real contienen problemas estructurales: promociones irregulares que distorsionan la demanda base, restricciones de suministro que enmascaran la verdadera disposición a comprar del cliente, anomalías históricas que introducen ruido. Muchos proyectos de forecasting fracasan no por malos modelos, sino porque los profesionales no invirtieron suficiente tiempo en entender cómo se generaron los datos y qué representan realmente.

**Optimizar la métrica equivocada**

MAPE, RMSE, MAE — las métricas de precisión son útiles, pero raramente se corresponden directamente con el coste empresarial. Un sistema de forecasting optimizado para métricas de error simétricas puede infrapredicir consistentemente la demanda en picos, donde el coste de una rotura de stock supera con creces el coste del exceso de inventario. El forecasting para el negocio requiere conectar el rendimiento del modelo con los resultados financieros, y a veces esto significa aceptar peor precisión estadística a cambio de mejor rendimiento operativo.

**Sin cuantificación de incertidumbre**

Las predicciones puntuales — números únicos que representan la demanda esperada — son a menudo insuficientes para la toma de decisiones. Un sistema de planificación que dice "la demanda será de 1.200 unidades" no ofrece ninguna orientación sobre cuánta confianza depositar en esa estimación. Los sistemas de forecasting adecuados comunican la incertidumbre mediante intervalos de predicción o salidas probabilísticas, permitiendo a los decisores gestionar el riesgo en lugar de simplemente reaccionar ante él.

**Modelos estáticos en entornos dinámicos**

Los negocios cambian. El comportamiento de los clientes evoluciona, las líneas de producto se amplían y las condiciones macroeconómicas se mueven. Un modelo de forecasting entrenado con datos históricos se irá alejando gradualmente de la realidad si no se recalibra regularmente. Muchas organizaciones despliegan un sistema de forecasting y luego lo dejan prácticamente intacto, tratándolo como un producto terminado en lugar de como un sistema vivo que requiere mantenimiento continuo.

**La brecha de adopción**

Quizás el modo de fallo más insidioso es un sistema de forecasting técnicamente sólido que nadie utiliza. Esto ocurre cuando los resultados no son accesibles para las personas que los necesitan, cuando el sistema es demasiado opaco para generar confianza, o cuando contradice las intuiciones de los planificadores experimentados sin ofrecer una explicación adecuada. Un sistema de forecasting que no se usa es, en la práctica, un sistema que no existe.

**Qué funciona realmente**

Los sistemas de forecasting eficaces comparten algunas características comunes. Están diseñados en torno a decisiones específicas, no a la precisión genérica. Tienen pipelines de datos claros con transformaciones documentadas. Comunican la incertidumbre de forma honesta. Se mantienen y recalibran con regularidad. Y, fundamentalmente, están diseñados pensando en el usuario final — accesibles, explicables y alineados con cómo se toman realmente las decisiones en la organización.

Invertir en capacidad de forecasting es valioso. Pero el valor proviene de sistemas rigurosamente diseñados, honestamente validados y genuinamente utilizados. El fracaso en conseguirlo raramente es un problema de tecnología. Es casi siempre un problema de método, proceso y alineación organizativa.`,
  },

  {
    slug: 'hidden-cost-bad-optimization-logistics',
    titleEn: 'The hidden cost of bad optimization in logistics',
    titleEs: 'El coste oculto de la mala optimización en logística',
    date: '2026-01-28',
    readingTime: 7,
    tagsEn: ['Optimization', 'Logistics', 'Operations'],
    tagsEs: ['Optimización', 'Logística', 'Operaciones'],
    excerptEn: 'Logistics operations are optimization problems in disguise. When routing and resource decisions are made suboptimally, the costs accumulate quietly — day after day — in ways that rarely appear clearly on any single report.',
    excerptEs: 'Las operaciones logísticas son problemas de optimización disfrazados. Cuando las decisiones de rutas y recursos se toman de forma subóptima, los costes se acumulan silenciosamente, día tras día, de maneras que raramente aparecen claramente en ningún informe.',
    bodyEn: `Logistics operations are optimization problems in disguise. Every routing decision, every load plan, every scheduling choice involves allocating scarce resources — vehicles, drivers, time, fuel — across competing demands. When these decisions are made suboptimally, the costs accumulate quietly, day after day, in ways that rarely appear clearly on any single report.

The challenge is that bad optimization is invisible precisely because it represents a counterfactual: the difference between what is and what could be. Unlike a stockout, a delivery failure, or a damaged shipment, inefficient routing doesn't trigger an alert. The trucks still deliver, the orders still arrive — just at a higher cost than necessary.

**Where the losses accumulate**

The most obvious loss is in route planning. Manual routing, even done by experienced dispatchers, systematically underperforms mathematical optimization across large route sets. The difference is rarely dramatic on any single route, but across thousands of daily decisions, even a 5-10% improvement in route efficiency translates to material fuel savings, reduced driver hours, and improved vehicle utilization. For mid-size logistics operators running 50-100 vehicles, this can represent hundreds of thousands of euros annually.

A truck that runs at 60% capacity is not just 40% inefficient — it's using fuel, driver time and road infrastructure for capacity that isn't generating revenue. Load factor optimization — deciding how to pack and sequence deliveries to maximize utilization while respecting constraints like time windows, vehicle capacity and fragility — is a complex combinatorial problem that humans solve heuristically and optimization models solve systematically.

**Reactive vs. predictive scheduling**

Most logistics operations react to today's orders rather than anticipating tomorrow's demand. Predictive scheduling — using historical patterns, client order behavior and seasonal trends to pre-position resources — can significantly reduce last-minute costs: overtime, emergency vehicle dispatch, and premium carrier charges. The planning horizon matters enormously in logistics, and organizations that plan further ahead consistently outperform those that react.

**Ignoring network-level effects**

Individual route optimization is valuable, but real efficiency gains come from network-level thinking. The decision of which warehouse to fulfill an order from, how to balance inventory across locations, and how to coordinate inbound and outbound flows — these are network optimization problems that can't be solved by optimizing individual routes in isolation. Many logistics operations leave significant value on the table precisely because their optimization scope is too narrow.

**The cost of manual overrides**

Most logistics software allows dispatchers to manually override system recommendations. Sometimes this is appropriate — local knowledge, special client relationships, operational constraints the system doesn't know about. But systematic data from logistics operations consistently shows that manual overrides, on average, increase costs compared to algorithmic recommendations. The aggregate effect of thousands of small manual decisions diverging from optimal routes is a hidden and rarely measured source of inefficiency.

**Quantifying what you're leaving on the table**

The first step to addressing optimization losses is measuring them. This requires benchmarking current operational performance against what a well-designed optimization model would produce on the same inputs. Most organizations haven't done this calculation, which means they don't know what improvement is possible.

Practical experience suggests that organizations moving from manual routing to systematic optimization typically see 10-20% reductions in operational costs, with higher improvements in cases where current operations are particularly manual or fragmented.

**The organizational dimension**

Optimization is not just a technical problem. Implementing systematic route and resource optimization requires changing how decisions are made, which means changing how people work. Dispatchers, planners, and managers need to trust the recommendations of optimization models — and that trust is built through transparency, explainability, and a track record of good decisions.

The organizations that get the most from logistics optimization are those that treat it as a capability to be developed over time, not a software package to be installed and forgotten. They invest in data quality, in training their teams to work with optimization tools effectively, and in the continuous refinement of their operational models as their networks evolve.

The hidden cost of bad optimization is real, measurable, and addressable. The question is whether your organization is prepared to measure it.`,

    bodyEs: `Las operaciones logísticas son problemas de optimización disfrazados. Cada decisión de ruta, cada plan de carga, cada elección de programación implica asignar recursos escasos — vehículos, conductores, tiempo, combustible — entre demandas en competencia. Cuando estas decisiones se toman de forma subóptima, los costes se acumulan silenciosamente, día tras día.

El reto es que la mala optimización es invisible precisamente porque representa un contrafactual: la diferencia entre lo que es y lo que podría ser. A diferencia de una rotura de stock o una entrega fallida, el enrutamiento ineficiente no genera alertas. Los camiones siguen entregando, los pedidos siguen llegando — simplemente a un coste mayor del necesario.

**Dónde se acumulan las pérdidas**

La pérdida más obvia está en la planificación de rutas. El enrutamiento manual, incluso realizado por despachadores experimentados, rinde sistemáticamente por debajo de la optimización matemática para conjuntos de rutas grandes. La diferencia raramente es dramática en una ruta individual, pero a lo largo de miles de decisiones diarias, incluso una mejora del 5-10% en la eficiencia de las rutas se traduce en ahorros materiales de combustible, reducción de horas de conductor y mejora de la utilización de vehículos.

Un camión que funciona al 60% de capacidad no es solo un 40% ineficiente — está usando combustible, tiempo de conductor e infraestructura vial para capacidad que no genera ingresos. La optimización del factor de carga es un problema combinatorio complejo que los humanos resuelven heurísticamente y los modelos de optimización resuelven sistemáticamente.

**Programación reactiva frente a predictiva**

La mayoría de las operaciones logísticas reaccionan a los pedidos de hoy en lugar de anticipar la demanda de mañana. La programación predictiva — usando patrones históricos y tendencias estacionales para preposicionar recursos — puede reducir significativamente los costes de última hora: horas extra, despacho de vehículos de emergencia y cargos de transportistas de emergencia.

**Ignorar los efectos a nivel de red**

La optimización individual de rutas es valiosa, pero las ganancias reales de eficiencia provienen del pensamiento a nivel de red. La decisión de desde qué almacén servir un pedido, cómo equilibrar el inventario entre ubicaciones y cómo coordinar los flujos de entrada y salida — son problemas de optimización de red que no pueden resolverse optimizando rutas individuales de forma aislada.

**La dimensión organizativa**

La optimización no es solo un problema técnico. Implementar la optimización sistemática de rutas y recursos requiere cambiar cómo se toman las decisiones, lo que significa cambiar cómo trabajan las personas. Los despachadores, planificadores y gestores necesitan confiar en las recomendaciones de los modelos de optimización — y esa confianza se construye mediante la transparencia, la explicabilidad y un historial de buenas decisiones.

Las organizaciones que más aprovechan la optimización logística son las que la tratan como una capacidad a desarrollar con el tiempo, no como un paquete de software a instalar y olvidar.

El coste oculto de la mala optimización es real, medible y abordable. La pregunta es si tu organización está preparada para medirlo.`,
  },

  {
    slug: 'machine-learning-business-what-works',
    titleEn: 'Machine learning in business: what actually works',
    titleEs: 'Machine learning en el negocio: qué funciona realmente',
    date: '2026-01-15',
    readingTime: 6,
    tagsEn: ['Machine Learning', 'Business', 'Analytics'],
    tagsEs: ['Machine Learning', 'Negocio', 'Analítica'],
    excerptEn: 'The gap between machine learning as presented in technical literature and machine learning as it functions in real business environments is wider than most practitioners admit.',
    excerptEs: 'La brecha entre el machine learning tal como se presenta en la literatura técnica y el machine learning tal como funciona en entornos empresariales reales es más amplia de lo que la mayoría de profesionales admite.',
    bodyEn: `The gap between machine learning as presented in technical literature and machine learning as it functions in real business environments is wider than most practitioners admit. Models that achieve impressive benchmark performance in controlled settings routinely underperform, get quietly shelved, or cause unintended problems when deployed in production. Understanding why — and what actually works — is essential for any business considering serious investment in ML capabilities.

**What the hype gets wrong**

There is a persistent tendency to reach for complex models — deep neural networks, elaborate ensemble architectures — when simpler approaches would perform comparably and offer significant advantages in interpretability, maintenance, and stability. In most business forecasting applications, well-specified gradient boosting models or even carefully designed regression models perform within statistical noise of far more complex architectures, and they are dramatically easier to maintain, explain, and debug.

The business value of a model is not proportional to its complexity. A logistic regression that your operations team understands and trusts will consistently outperform a neural network that no one can explain, even if the neural network scores 2% higher on a validation set.

**Feature engineering matters more than model selection**

In practice, the most impactful improvements to model performance come not from algorithmic innovations but from better feature engineering — the process of transforming raw data into meaningful representations that capture business-relevant patterns. A domain expert who understands that promotional activity distorts baseline demand, or that weather affects retail foot traffic, can create features that make any model significantly more effective. This knowledge is hard to learn from data and can't be automated away.

**The deployment gap**

A model that isn't deployed is worthless. Yet a surprising fraction of ML projects in business settings produce models that are technically complete but never make it into production. The reasons are varied: integration complexity, lack of MLOps infrastructure, organizational resistance, or simply that the model's outputs don't connect clearly to actionable decisions. Building for deployment from the start — not as an afterthought — is one of the clearest differences between ML projects that deliver business value and those that don't.

**Distribution shift is the real challenge**

ML models are trained on historical data and deployed into a world that keeps changing. Customer behavior evolves. Market conditions shift. Regulatory environments change. A model trained six months ago may be systematically biased in ways that are invisible until significant business damage is done. The real challenge in production ML is not achieving high initial accuracy — it's detecting and responding to performance degradation as the world moves away from the training distribution.

**What actually works**

The ML applications that consistently deliver business value share several characteristics. They are targeted at well-defined decisions with clear business impact. They are built with interpretability requirements that match the decision context. They are maintained with regular retraining and performance monitoring. And they are integrated into existing workflows in ways that make them easy to use without requiring deep technical knowledge from end users.

Successful business ML applications tend to be narrow and deep rather than broad and shallow. A focused credit scoring model built with domain expertise and rigorous validation will outperform a general-purpose ML system applied without deep understanding of the underlying process.

**The organizational requirements**

Sustainable ML capability in a business organization requires more than technical skill. It requires data infrastructure that produces clean, well-documented data. It requires processes for validating model outputs against business expectations. And it requires a culture of honest performance measurement — the discipline to acknowledge when a model isn't working and make changes, rather than defending previous investments.

Machine learning, applied thoughtfully and maintained rigorously, is a genuine source of competitive advantage. But the path to that advantage runs through discipline, not complexity.`,

    bodyEs: `La brecha entre el machine learning tal como se presenta en la literatura técnica y el machine learning tal como funciona en entornos empresariales reales es más amplia de lo que la mayoría de profesionales admite. Los modelos que logran un rendimiento impresionante en entornos controlados rinden sistemáticamente por debajo de las expectativas, se archivan silenciosamente o causan problemas no deseados cuando se despliegan en producción.

**Lo que la tendencia pasa por alto**

Existe una tendencia persistente a recurrir a modelos complejos — redes neuronales profundas, arquitecturas de ensemble elaboradas — cuando enfoques más simples rendirían de forma comparable y ofrecerían ventajas significativas en interpretabilidad, mantenimiento y estabilidad. En la mayoría de las aplicaciones de forecasting empresarial, los modelos de gradient boosting bien especificados o incluso los modelos de regresión cuidadosamente diseñados rinden dentro del ruido estadístico de arquitecturas mucho más complejas, y son dramáticamente más fáciles de mantener, explicar y depurar.

El valor empresarial de un modelo no es proporcional a su complejidad. Una regresión logística que tu equipo de operaciones entiende y en la que confía superará consistentemente a una red neuronal que nadie puede explicar, aunque la red neuronal puntúe un 2% más alto en un conjunto de validación.

**La ingeniería de características importa más que la selección del modelo**

En la práctica, las mejoras más impactantes en el rendimiento del modelo provienen no de las innovaciones algorítmicas sino de una mejor ingeniería de características. Un experto en el dominio que entiende que la actividad promocional distorsiona la demanda base puede crear características que hacen que cualquier modelo sea significativamente más efectivo. Este conocimiento es difícil de aprender de los datos y no puede automatizarse.

**La brecha de despliegue**

Un modelo que no se despliega no vale nada. Sin embargo, una fracción sorprendente de proyectos de ML en entornos empresariales produce modelos técnicamente completos que nunca llegan a producción. Las razones son variadas: complejidad de integración, falta de infraestructura MLOps, resistencia organizativa, o simplemente que los resultados del modelo no se conectan claramente con decisiones accionables.

**El cambio de distribución es el desafío real**

Los modelos de ML se entrenan con datos históricos y se despliegan en un mundo que sigue cambiando. El comportamiento de los clientes evoluciona. Las condiciones del mercado cambian. Un modelo entrenado hace seis meses puede tener un sesgo sistemático de maneras que son invisibles hasta que se produce un daño empresarial significativo. El desafío real en ML de producción no es lograr una alta precisión inicial — es detectar y responder a la degradación del rendimiento a medida que el mundo se aleja de la distribución de entrenamiento.

**Las aplicaciones de ML que funcionan**

Las aplicaciones de ML que consistentemente entregan valor empresarial comparten varias características. Están dirigidas a decisiones bien definidas con impacto empresarial claro. Están construidas con requisitos de interpretabilidad que coinciden con el contexto de la decisión. Se mantienen con reentrenamiento regular y monitorización del rendimiento.

El machine learning, aplicado con reflexión y mantenido con rigor, es una fuente genuina de ventaja competitiva. Pero el camino hacia esa ventaja pasa por la disciplina, no por la complejidad.`,
  },

  {
    slug: 'building-decision-systems-that-work',
    titleEn: 'Building decision systems that companies actually use',
    titleEs: 'Construir sistemas de decisión que las empresas realmente utilizan',
    date: '2026-01-05',
    readingTime: 6,
    tagsEn: ['Decision Systems', 'Analytics', 'Business'],
    tagsEs: ['Sistemas de Decisión', 'Analítica', 'Negocio'],
    excerptEn: 'The graveyard of analytical work is full of systems that worked technically but failed practically. Understanding why analytical systems fail to achieve adoption — and how to design against it — is one of the most undervalued skills in the field.',
    excerptEs: 'El cementerio del trabajo analítico está lleno de sistemas que funcionaban técnicamente pero fracasaban en la práctica. Entender por qué los sistemas analíticos no logran adopción — y cómo diseñar contra ello — es una de las habilidades más infravaloradas del sector.',
    bodyEn: `The graveyard of analytical work is full of systems that worked technically but failed practically. Forecasting models with impressive accuracy scores that planners ignored. Optimization engines that recommended solutions no one implemented. Risk scoring systems that ran in parallel with intuition-based decisions for years before being quietly turned off. The pattern is so common it has a name: the analytics adoption gap.

Understanding why analytical systems fail to achieve adoption — and how to design against it — is one of the most undervalued skills in data science and operations research.

**Why systems don't get used**

Decision-makers who are asked to rely on a system they don't understand will eventually stop using it when the system's recommendation conflicts with their own judgment. This isn't irrational — it's a reasonable response to opacity. If you can't examine the reasoning behind a recommendation, you can't evaluate whether to trust it. Systems that can't explain themselves will lose to human judgment in every case of disagreement, regardless of which is actually better.

Many analytically excellent systems are inaccessible in practice. Outputs are buried in spreadsheets. Interfaces are designed by engineers rather than the people who will use them. The decision workflow around the system is unclear — who acts on the recommendation, by when, based on what information? Analytical systems need to fit into human workflows, not the other way around.

**The calibration problem**

No model is right 100% of the time, and users of analytical systems learn this quickly. The question is whether they trust the system's errors to be within acceptable bounds, and whether the system is honest about its own uncertainty. Systems that present point estimates with false precision lose credibility faster than systems that communicate uncertainty honestly. A forecasting system that says "we expect 1,200 units, but the realistic range is 900-1,500" is more trustworthy than one that says "exactly 1,200" and is sometimes very wrong.

**The organizational misalignment problem**

Analytical systems are often built by people who aren't deeply embedded in the organization's decision processes. The system optimizes for something — cost, efficiency, accuracy — that doesn't map cleanly to how the organization actually makes decisions, measures performance, or allocates accountability. When the system's logic conflicts with existing organizational incentives, the system loses.

**What makes systems get used**

The analytical systems that achieve sustained adoption share certain design principles. They are built with end users involved from the beginning — not as stakeholders to be consulted, but as co-designers who shape what the system does and how it works. They present recommendations in terms that map directly to the decision at hand, not in abstract model metrics. They offer explanations that match the sophistication of their users.

They are also honest about limitations. A system that clearly communicates when it's operating in conditions it hasn't been trained for — flagging unusual inputs or situations where model confidence is low — builds more trust than a system that projects confidence it doesn't have.

**The role of simplicity**

One of the strongest predictors of adoption is simplicity. Not the simplicity of the underlying model, but the simplicity of the user experience. A well-designed analytical system reduces the cognitive load on the decision-maker rather than adding to it. It gives a recommendation with reasoning, flags edge cases, and makes the right action obvious.

This often requires resisting the temptation to build everything the model is capable of into the interface. The analytical back-end can be sophisticated; the front-end should be simple.

**The long view**

Decision systems that last are built on a foundation of trust — earned incrementally through a track record of good recommendations, honest uncertainty communication, and responsiveness to feedback. This trust is fragile and takes time to build. It can be destroyed quickly by a system that behaves unexpectedly or that is changed without adequate communication to users.

Building systems that companies actually use is not primarily a technical challenge. It is a design challenge, an organizational challenge, and ultimately a challenge of building and maintaining trust. The analytical work is necessary but not sufficient. The rest requires judgment, patience, and genuine attention to how people actually work.`,

    bodyEs: `El cementerio del trabajo analítico está lleno de sistemas que funcionaban técnicamente pero fracasaban en la práctica. Modelos de forecasting con puntuaciones de precisión impresionantes que los planificadores ignoraban. Motores de optimización que recomendaban soluciones que nadie implementaba. Sistemas de scoring de riesgo que funcionaban en paralelo con las decisiones basadas en la intuición durante años antes de ser silenciosamente desconectados.

Entender por qué los sistemas analíticos no logran adopción — y cómo diseñar contra ello — es una de las habilidades más infravaloradas en la ciencia de datos y la investigación operativa.

**Por qué los sistemas no se usan**

Los decisores a los que se pide que confíen en un sistema que no entienden eventualmente dejarán de usarlo cuando la recomendación del sistema entre en conflicto con su propio juicio. Esto no es irracional — es una respuesta razonable a la opacidad. Si no puedes examinar el razonamiento detrás de una recomendación, no puedes evaluar si confiar en ella.

Muchos sistemas analíticamente excelentes son inaccesibles en la práctica. Los resultados están enterrados en hojas de cálculo. Las interfaces están diseñadas por ingenieros en lugar de por las personas que las utilizarán. Los sistemas analíticos necesitan encajar en los flujos de trabajo humanos, no al revés.

**El problema de calibración**

Ningún modelo acierta el 100% de las veces, y los usuarios de los sistemas analíticos aprenden esto rápidamente. Los sistemas que presentan estimaciones puntuales con falsa precisión pierden credibilidad más rápido que los sistemas que comunican la incertidumbre honestamente. Un sistema de forecasting que dice "esperamos 1.200 unidades, pero el rango realista es 900-1.500" es más fiable que uno que dice "exactamente 1.200" y a veces se equivoca mucho.

**El problema de desalineación organizativa**

Los sistemas analíticos a menudo los construyen personas que no están profundamente integradas en los procesos de decisión de la organización. El sistema optimiza algo — coste, eficiencia, precisión — que no se corresponde limpiamente con cómo la organización toma realmente las decisiones, mide el rendimiento o asigna la responsabilidad. Cuando la lógica del sistema entra en conflicto con los incentivos organizativos existentes, el sistema pierde.

**Qué hace que los sistemas se utilicen**

Los sistemas analíticos que logran una adopción sostenida comparten ciertos principios de diseño. Se construyen con los usuarios finales involucrados desde el principio — no como partes interesadas a consultar, sino como co-diseñadores. Presentan recomendaciones en términos que se corresponden directamente con la decisión en cuestión, no en métricas abstractas del modelo. Son honestos sobre sus limitaciones.

**El papel de la simplicidad**

Uno de los predictores más fuertes de la adopción es la simplicidad. No la simplicidad del modelo subyacente, sino la simplicidad de la experiencia del usuario. Un sistema analítico bien diseñado reduce la carga cognitiva del decisor en lugar de aumentarla. Da una recomendación con razonamiento, señala casos extremos y hace obvia la acción correcta.

Los sistemas de decisión que perduran se construyen sobre una base de confianza — ganada de forma incremental a través de un historial de buenas recomendaciones, comunicación honesta de la incertidumbre y capacidad de respuesta al feedback. Construir sistemas que las empresas realmente usan no es principalmente un desafío técnico. Es un desafío de diseño, organizativo y, en última instancia, de construir y mantener la confianza.`,
  },
]

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}
