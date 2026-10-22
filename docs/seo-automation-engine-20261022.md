# SC-Analytics — Motor SEO de mejora continua: estado real (22/10/2026)

**Rama de trabajo:** `feature/seo-canonical-schema-proof-20261022` (PR #89, borrador).
**NO publicado todavía**: el proyecto mantiene el criterio **un único despliegue de Vercel** por lote, después de revisar el PR y la cuota gratuita.

## Diseño / arquitectura

```text
Search Console import diario ─┐
SEO services/keywords Supabase ├─→ análisis semanal (GitHub Actions)
Google URL Inspection (lectura) ┤       ├─→ revisión de indexación y ranking observable
Sitemap / auditor técnico ──────┤       ├─→ nuevas consultas observadas
Competidores públicos/robots ───┘       ├─→ propuestas editoriales justificadas
                                       └─→ seo_recommendations (estado proposed)
                                                   ↓
                                            CMI privado / revisión
                                                   ↓
                                        Aprobación humana / publicación
```

**Ninguna automatización debe editar `seo_pages` por inferencia ni comprar enlaces**. Las mejoras aprobadas en campos visibles cambian texto, pero siguen usando el mismo diseño. Metadatos, analítica, seguimiento e indexación no alteran el frontend público.

## Implementado en esta continuación

1. **Atribución real GSC por URL.** Se ha eliminado la imputación de posiciones e impresiones de Home/Knowledge a páginas `/services` por similitud de palabras. Las consultas de otras páginas pasan a `unmapped_keyword_opportunities`.
2. **Análisis de indexación Google.** `verified_index_state` lee exclusivamente resultados `google_index_inspection` de Google Search Console guardados en `seo_keyword_targets.metrics`, con fecha de máximo 45 días. Distingue `reported_indexed`, `reported_not_indexed`, `inconclusive` y `unverified`. Un sitemap no implica indexación.
3. **Planes editoriales de revisión.** `review_brief` indica campos implicados, tipo de impacto (`metadata_only`, texto público sin cambio de layout o técnico), consultas realmente observadas y enlaces a casos existentes. No genera cifras, testimonios ni un texto nuevo que pueda publicarse sin revisión.
4. **Descubrimiento de consultas.** `keyword_discovery` investiga consultas GSC no branded con términos de negocio e impresiones observadas. No presupone volumen de mercado, dificultad ni intención comercial verificada. Hasta 4 se convierten en propuestas de investigación `seo_recommendations`.
5. **Cola persistente de revisión.** El flujo semanal usa IDs estables y no reabre recomendaciones rechazadas o ya aplicadas. El endpoint del CMI existente rechaza con HTTP 422 la publicación directa de `payload.kind=seo_opportunity`.
6. **CMI privado mejorado.** Muestra resultado disponible de la inspección Google, la fecha, alcance del cambio y casos verificados; sin afectar a CSS/front público.
7. **Monitor público de competidores.** Sigue `robots.txt`, solo consulta dominios permitidos, no hace scraping masivo de SERP, no copia textos ni asegura que sean primeros en Google. Lectura UTF-8 corregida.
8. **Lanzamiento controlado.** Sigue la política Vercel sin previews y PR #89 sin fusionar, para no gastar más Deployment Storage.

## Resultado de la prueba con datos actuales

**Fuentes**: muestra de **126** observaciones recientes de `search_console_daily`, **23** servicios publicados y **29** keywords activas. Fecha más reciente GSC importada de esa muestra: **19/10/2026**. La muestra no es el total histórico de Search Console.

- **13** páginas con propuesta `verify_google_indexing` porque faltan informes de inspección y tampoco hay suficientes señales de búsqueda no branded.
- **9** páginas nuevas con `wait_for_crawl`, evitando tocarlas prematuramente.
- **0** impresiones no branded atribuibles directamente a páginas comerciales en esta muestra. **No equivale a 0 búsquedas de sus palabras clave en todo Google.**
- Consulta `operations control layer` con **4** impresiones en otro destino de la web → candidata a analizar, **sin autorización para crear otra página**.
- Se comprobó también en Supabase que había **0/29** keywords con `metrics.google_index_inspection` en la última consulta, por lo que la inspección del cron debe activarse y verificarse **después del despliegue**.
- En CMI había **14 competidores archivados, ninguno monitorizado y 0 eventos**; no se ha reactivado unilateralmente ninguna ficha archivada.
- Auditor externo de metadatos públicos permitido por robots de la rama: MERIDIAN Data & IA y Todoesdata observados; MB Soluciones observado; Aureliox no disponible. Son muestras de estructura pública, **no posiciones SERP verificadas**.

## Qué ya existía en la rama antes de esta continuación

- `.github/workflows/seo-weekly-intelligence.yml` programa `python -m growth.src.cli seo-intelligence --write-proposals --limit 12` los miércoles a las 06:45 UTC, sin generar despliegues.
- `app/api/cron/seo-index-daily/route.ts` y `vercel.json`: consulta diaria a la **API de inspección de URL de Google**, autenticada con `CRON_SECRET`, a las 07:25 UTC (sujeto a tolerancia de Hobby), hasta cinco URLs diarias y rotación de destinos. **Es lectura**, no solicitud de indexación.
- `growth/src/seo_competitor_research.py` genera evidencia limitada de estructura de páginas públicas respetando robots.
- Ya existían `seo_keyword_targets`, `seo_pages`, `seo_recommendations` y los informes del CMI.
- Seguía pendiente la primera ejecución real; ninguna evidencia de que se hubiera poblado la cola o el registro de inspecciones.

## Qué falta para poder llamarlo «operativo»

1. Finalizar QA de PR #89 (Python, Node, ESLint, Next.js, GitHub CI), decidir una sola publicación cuando Vercel permita desplegar.
2. Confirmar que `SUPABASE_URL` y `SUPABASE_SECRET_KEY` están disponibles en secretos de GitHub Actions sin revelar sus valores, y que la tarea semanal escribe `seo_recommendations`.
3. Confirmar que el cron diario de Google URL Inspection escribe `metrics.google_index_inspection`. Si falla, revisar OAuth y Google Search Console API, nunca sustituir `UNKNOWN` por `FAIL`.
4. Contrastar en Google Search Console qué páginas indexa Google en realidad; preparar nueva inspección tras semanas de rastreo.
5. Revisar propuestas de cambios textuales individualmente y publicarlas desde el flujo autenticado ya existente. **No reescritura masiva automática**.
6. Enlazado externo genuino: buscar colaboraciones editoriales verificadas, partners, estudios originales, publicaciones de terceros que nos citen; no hay fórmula para «crear backlinks de calidad automáticamente» y no se ejecuta outreach sin revisión.
7. En aproximadamente 14 días **después del despliegue**, comparar la nueva indexación y las impresiones sin marca con esta línea base. Google no garantiza indexación ni posiciones.

## Seguridad editorial / Google

La documentación oficial de Google indica que el [Indexing API](https://developers.google.com/search/apis/indexing-api/v3/quickstart) sirve para JobPosting y vídeo BroadcastEvent, no para forzar la indexación de estos servicios. La [política de spam](https://developers.google.com/search/docs/essentials/spam-policies) penaliza contenido masivo sin valor y esquemas de enlaces. Nuestro motor informa, prepara y verifica, pero no finge controlar el ranking.

No se han incluido en código, documentación, scripts ni metadatos los identificadores fiscales o domicilio personal facilitados por el usuario.
