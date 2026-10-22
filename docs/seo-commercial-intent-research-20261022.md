# SC-Analytics — Estudio de intención SEO comercial (22/10/2026)

## Ampliación basada en lenguaje público observable (22/10/2026)

Nuevas páginas públicas inspeccionadas para contrastar vocabulario, no rankings:
- [ConsultorIA — análisis predictivo y forecasting](https://www.consultoriaconia.com/servicios/analisis-predictivo): explica demanda por SKU, ventas y monitoreo. Hipótesis: «predicción de demanda por SKU», «previsión de ventas por producto».
- [Technova Partners — consultoría IA](https://technovapartners.com/es/services/data-ai/consultoria-ia): casos de workflows integrados en CRM, automatización y modelos predictivos. Hipótesis: «integrar agentes IA con CRM».
- [MERIDIAN — consultoría de datos e IA](https://meridiandata.es/): contenidos pensados para pymes con procesos y datos reales. Hipótesis: «consultoría de datos para pymes».
- [Umbral BI — soluciones de analítica aplicada](https://www.umbralbi.com/servicios): mención pública de optimización y pricing. Hipótesis: «pricing and margin optimization».

**Muy importante:** vocabulario en una web de un competidor ≠ consultas realizadas ≠ volumen mensual ≠ tendencia «de moda» ≠ ranking. Estas expresiones requieren GSC/estudio geográfico antes de usarlas en cambios editoriales.

Se codificaron **32 hipótesis curadas** (18 ES, 5 CA, 9 EN) en growth/src/seo_keyword_expansion.py, relacionadas con páginas comerciales existentes y propuestas rotativas de dos por semana. El objetivo es ampliar cobertura de intención, no el número de landings. El CMI distingue propuestas hipotéticas de consultas GSC verificadas. Más información técnica: [manual del propietario](./SC_ANALYTICS_SYSTEM_OWNER_GUIDE.md).


**Alcance:** investigación preliminar de las rutas ES/CA/EN y evidencia pública. **No** supone un estudio de volúmenes mensuales, posiciones reales en Google ni dificultad de keywords; esos datos requieren herramientas de keyword research y/o observaciones de Search Console. No se ha contratado nada.

## Señales verificables

Se investigaron páginas públicas que contestan búsquedas comerciales relacionadas con SC-Analytics. Son **ejemplos competitivos observados**, no un ranking SERP de Google ni una lista exhaustiva de competidores directos.

| Área / consulta a contrastar | Página pública observada | Qué comunica el competidor | Hipótesis para SC-Analytics |
| --- | --- | --- | --- |
| Predicción de demanda, demand forecasting | [Deloitte: Demand Forecasting](https://www.deloitte.com/es/es/services/consulting/services/demand-forecasting.html) | Casos de uso explícitos sobre predicción de demanda, ventas y costes | Reforzar problemas de e-commerce, operaciones e inventario con el caso real ya publicado, sin inventar cifras |
| Automatización IA para empresas y pymes | [ClicAndAI](https://clicandai.com/) | Workflow detallado que conecta formularios, CRM, email y supervisión humana | Explicar integraciones y limitaciones reales entre automatización determinista y agentes |
| Consultoría de IA en Barcelona | [Sabemos AI](https://sabemos.ai/es/agencia-ia-barcelona) | Muestra el proceso diagnóstico → auditoría → desarrollo y CTA de contacto | Comprobar que nuestra página de servicio describe proceso real y permite identificar un primer paso |
| Automatización con IA para pymes | [Claumy](https://claumy.com/) | Orientación a tareas concretas, sectores y FAQs | Evaluar preguntas frecuentes útiles y orientadas al comprador; no crear FAQs artificiales |
| Consultoría IA aplicada | [Value Up AI](https://valueupai.com/consultoria-ia-barcelona/) | Integra estrategia, implantación, ERP/CRM y analítica | Diferenciar nuestra combinación de forecasting, optimización matemática, datos e IA frente a la oferta AI genérica |
| Consultoría de datos en Barcelona | [Sortlist: consultoría de datos](https://www.sortlist.es/data/barcelona-es) | Directorio que refleja un mercado heterogéneo de agencias | Contrastar terminología y señales de confianza, **sin asumir rankings SEO propios ni adquirir enlaces** |

## Clústeres recomendados (todavía sin volumen validado)

- **Forecasting/demanda:** `predicción de demanda`, `forecasting de ventas`, `demand forecasting`, `demand planning`. Reutilizar las páginas publicadas por idioma e intención.
- **Datos y analítica aplicada:** `consultoría de datos`, `analítica de datos para empresas`, `data science consulting`, `business intelligence consulting`.
- **Automatización empresarial con IA:** `automatización con IA para empresas`, `agentes de IA para empresas`, `consultoría inteligencia artificial`, `AI automation services`.
- **Optimización e investigación operativa:** `optimización de operaciones`, `optimización de inventario`, `operations research consulting`, `supply chain analytics`.

Cada grupo tiene rutas existentes de `seo_keyword_targets` y `seo_pages`. **No abrir una landing por variante:** comprobar primero si coincide la intención. La taxonomía es de hipótesis comerciales, no demanda observada.

## Qué debe comprobar el motor, semanalmente

1. Actualizar Search Console y comparar 28 días contra los anteriores: separar marca, consultas ambiguas y no branded.
2. Separar señales de cada URL de consultas que llegaron a Home/Knowledge: nunca imputarles una posición comercial inexistente.
3. Consultar la última Google URL Inspection disponible de las 23 páginas de servicio (API read-only rotatoria; no prometer indexación).
4. Clasificar oportunidades: corregir sitemap, investigar indexación, revisar títulos, enriquecer contenido con casos reales, o esperar datos.
5. Revisar competidores **solo mediante sitios públicos permitidos y robots.txt**, sin inferir volúmenes ni copiar su contenido.
6. Emitir propuestas en `seo_recommendations` con pruebas, alcance y aprobación; `seo_pages` solo puede cambiar por flujo editorial autorizado.
7. Registrar la relación entre consultas y formulario/reunión confirmada, sin afirmar atribución individual cuando no está instrumentada.

## Fronteras de automatización y frontend

- **Invisible al visitante:** metadatos SEO, sitemap, canónicas, análisis GSC, seguimiento indexación, métricas y recomendaciones en CMI.
- **Visible como texto, diseño inalterado:** títulos mostrados, intro, casos, FAQ o secciones si una persona decide aprobar su mejora. No se reescribe automáticamente el contenido publicado ni los casos de éxito.
- **No automatizable honestamente:** garantizar posiciones de Google, forzar indexación de servicios con Indexing API, fabricar reseñas/enlaces, comprar backlink masivo o crear páginas sin utilidad para usuarios. Google limita Indexing API a `JobPosting`/vídeos `BroadcastEvent`: [documentación](https://developers.google.com/search/apis/indexing-api/v3/quickstart); [políticas anti-spam](https://developers.google.com/search/docs/essentials/spam-policies).
- **Autoridad:** generar ideas de referencias editoriales o colaboración a partir de evidencia real, pero ninguna solicitud externa o backlink se crea/publica sin revisión y permiso.

## Puerta de salida del lote

La investigación queda en código/documentación para servir de contexto al motor. Antes de adoptar nuevas palabras clave debe revisarse (i) Search Console real, (ii) indexación de página por Google, (iii) SERP geográfico verificado, (iv) pertinencia comercial. Los resultados no autorizan un cambio visual automático.
