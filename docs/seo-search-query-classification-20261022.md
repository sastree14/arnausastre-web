# SC-Analytics — Clasificación honesta de búsquedas en Google

**Revisión metodológica:** 2026-10-22.  
**Fuente:** `public.search_console_daily`. Última fecha importada en el momento del análisis: 2026-10-18.

## Por qué fue necesaria

Las consultas que inicialmente se clasificaron como no branded incluían variantes del nombre y abreviaturas ambiguas como `sc data`, `sc insights`, `sc analysis`, `sc analytix`, `erp sc` y el nombre del fundador. Contarlas como demanda independiente por servicios inflaba las impresiones no branded. Se evitó asignarlas categóricamente a marca cuando no había certeza: ahora existe una categoría **ambigua** excluida de las cifras limpias de no branded.

## Modelo aplicado

- **Branded:** `sc analytics`, `SC-Analytics`, `scanalytics`, `sc analytix`, `arnau sastre` y variantes reconocibles.
- **Ambigua:** siglas `sc`, `scdata`, `scca`, `scio` y búsquedas sin significado comercial claro.
- **No branded identificable:** ninguna coincidencia anterior, siempre que Google proporcione texto de consulta. No implica necesariamente relevancia comercial.
- **No disponible:** consulta anónima/vacía.

`lib/seo-search-query-classification.ts` centraliza las reglas; `lib/seo-organic-trends.ts` y el CMI usan exactamente la misma clasificación.

## Línea base revisada, 28 días contra los 28 anteriores

| Métrica | 24/08–20/09 | 21/09–18/10 |
| --- | ---: | ---: |
| Impresiones branded | 79 | 130 |
| Clics branded | 3 | 17 |
| Impresiones ambiguas | 4 | 18 |
| Clics ambiguos | 0 | 0 |
| Impresiones estrictamente no branded | **90** | **8** |
| Clics estrictamente no branded | **0** | **0** |

La caída de impresiones no branded en esta muestra es del **91,1 %**, pero los volúmenes son muy pequeños y algunas búsquedas no están relacionadas con servicios objetivo. Los datos terminan antes de la publicación de las diez landings ES/CA del 21/10: **no se puede atribuir esta variación al nuevo SEO**.

La clasificación conservadora es orientativa, no identifica con certeza la intención del usuario. No confundir impresiones genéricas con leads.

## QA

- `npm run seo:test` **33/33** pruebas, incluidas variantes reales, siglas ambiguas y comparación de 28 días.
- `npm run lint` 0 errores (18 warnings anteriores).
- `npm run build` OK.
- Añadido `allowImportingTsExtensions` a tsconfig con `noEmit=true` para que los tests TypeScript que comparten el clasificador ejecuten correctamente en Node; sin modificar CSS ni la UI pública.

## Siguiente medida

Tras varias semanas de rastreo en Google Search Console, distinguir las búsquedas no branded realmente comerciales de términos incidentales y analizar métricas por página de servicio. No generar contenido masivo automáticamente solo por impresiones aisladas.
