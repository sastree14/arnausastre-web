# SC-Analytics — SEO Growth: REANUDAR AQUÍ

> **Documento maestro de continuidad entre chats.** Actualizar al terminar **cada bloque**. Para retomar: leer este archivo, `docs/seo-growth-roadmap.md`, `docs/seo-keyword-intents-20261021.md`, verificar la rama y el estado del PR, y continuar la primera tarea pendiente con pruebas. **No depender del historial del chat.**

**Fecha de inicio:** 21/10/2026  
**Proyecto Vercel:** `arnausastre-web`, sitio oficial `https://www.sc-analytics.io`  
**Repositorio GitHub:** `sastree14/arnausastre-web`  
**Rama de implementación:** `feature/seo-growth-foundation-20261021`  
**Pull request:** [#80, borrador](https://github.com/sastree14/arnausastre-web/pull/80)  
**Producción:** `main` (última base comprobada antes de esta iteración: commit `12d0d04...`, PR #79). **No asumir que la rama está en producción.**

## 1. Objetivo de negocio

Posicionar a SC-Analytics no solamente por el nombre de marca, sino por servicios concretos: forecasting, demand planning, optimización, data science, IA y automatización. Generar consultas y reuniones comerciales cualificadas. No perseguir cifras vanidosas de tráfico o puntuaciones automáticas.

### Guardarraíles obligatorios confirmados por el usuario

1. **No modificar lo que ve el visitante en términos de diseño:** mantener CSS, paleta, tipografía, distribución, componentes y comportamiento visual del frontend. **Sí** está autorizado modificar SEO técnico, metadatos, relaciones de enlaces, destinos y pequeños textos dentro de bloques existentes. Para nuevas páginas mantener la plantilla actual: someter a revisión editorial antes de publicarlas.
2. **Cero suscripciones SEO de pago:** no contratar Semrush, BabyLoveGrowth, Ahrefs pago ni pruebas gratuitas convertibles en facturación. Reutilizar Search Console, GA4, Bing gratis, GitHub, Supabase, CMI y Vercel disponibles.
3. El usuario **autoriza trabajar sobre código, GitHub, Supabase, automatizaciones**, hacer bloques largos y validar. Conservar las funcionalidades existentes: formularios, RGPD/cookies y consentimiento de GA4, newsletter, publicaciones de artículos, CMI y Calendly.
4. No crear contenido masivo repetitivo, links artificiales, testimonios ni resultados inventados, ni afirmar que SEO garantiza posiciones en Google.
5. **Construir → comprobar → corregir → volver a comprobar.** No fusionar commits no probados. Usar rama y PR como espacio de trabajo. Merge a main cuando se cumplan criterios de QA y se pueda distinguir claramente el alcance.
6. **Importante:** el asistente no realiza trabajo asíncrono por estar el chat cerrado. Cuando el usuario vuelva y pida continuar, comenzar por este documento y ejecutar el siguiente bloque en esa interacción.

## 2. Infraestructura que YA existe (no duplicarla)

- Web `Next.js` 16 + React 19 + Vercel, con rutas principales `/services`, `/services/[slug]`, `/knowledge`, `/knowledge/[slug]/[locale]`, `/projects`, `/contact`.
- Base de datos Supabase tenant `sc-analytics`; tablas `seo_keyword_targets`, `seo_pages`, `content_items`, `search_console_daily`, `web_analytics_daily`, `website_inquiries`. El proyecto se accede mediante el conector, **nunca introducir secrets en documentación**.
- CMI con importación automática GA4/Search Console; hay un editor y calendario ya en marcha.
- Artículos se publican vía cron `sc-knowledge-publisher` (Supabase); workflow GitHub `.github/workflows/growth-publish-website.yml` es **fallback manual**; NO introducir otro publicador paralelo.
- `robots.txt`, `sitemap.xml`, canónicas, `hreflang` de artículos; 82 URLs verificadas después del PR técnico #78 y #79.
- Cookies: consentimiento para analítica (por defecto no cargar GA4), configuración/rechazo; contacto: checkbox informativo obligatorio y guardado en CRM.
- Auditoría Semrush antigua: Site Health 73%, 121 errores y 163 advertencias en 100 URLs; ya se aplicaron correcciones estructurales PR #78 + confiabilidad artículos #79. **No asumir cero incidencias hasta un nuevo rastreo completo.**
- Métricas de referencia octubre 2026 (históricas, no resultados actuales): ~1001 impresiones / 34 clics Search Console, ~33 clics por marca. 29 keywords objetivo, 13 landings de servicios publicadas (en inglés). Atención: algunas palabras apuntan a rutas futuras todavía sin página.

## 3. Cambios YA implementados en esta rama (no están necesariamente desplegados)

- `lib/seo-clusters.ts`: áreas editoriales → servicios publicados, enlaces verificados.
- `components/GeneratedKnowledgeArticleGoldStandard.tsx` y `components/KnowledgeArticleGoldStandard.tsx`: reutilizan **sin tocar CSS ni layout** la tarjeta de enlace #2 de artículos para enlazar a servicio relacionado, con texto de CTA ES/CA/EN. Revisar siempre enlace semántico.
- `scripts/seo-health.mjs` y comando `npm run seo:health`: auditoría de sitemap/HTTP/canonical/`hreflang`/JSON-LD/títulos; red y acceso a producción **solo lectura**.
- `app/sitemap.ts`: reutiliza el inventario público de artículos con localizaciones revisadas para añadir versión `ca` omitida.
- `app/knowledge/[slug]/[locale]/page.tsx`: desambiguación de metatítulos duplicados entre localizaciones (manteniendo el título original visible).
- `app/briefing/layout.tsx`: metatítulo más conciso.
- `docs/seo-keyword-intents-20261021.md`: consolidación de las 29 keywords en grupos de intención, NO generación automática de 29 landings.
- `docs/seo-growth-roadmap.md`: checklist de ejecución original y criterios de aceptación.
- `npm run build` pasado en sandbox; siete enlaces de servicio añadidos HTTP 200 comprobados.
- Auditor `seo:health` aplicado a producción **antes de desplegar los arreglos nuevos**: 82/82 URLs recuperadas; 2 errores de hreflang destino `/knowledge/brief_093a3a68227e/ca` no presente en sitemap y 3 warnings (título de briefing largo y metatítulo igual en es/ca). Correcciones anteriores están **en la rama** y pendientes de contrastar en un entorno con variables de Supabase productivas.

## 4. Orden de implementación (no perder piezas)

| Bloque | Entregable verificable | Estado |
| --- | --- | --- |
| A. Continuidad y base | Este documento, rama, PR, auditor y pruebas | EN CURSO |
| B. Rastreo continuo | GitHub Action semanal **solo lectura** que ejecute auditoría, anote fallos y guarde informe; no autopublicar | PENDIENTE |
| C. SEO comercial | 29 keywords agrupadas, 13 servicios evaluados, metas/canónicas/enlaces relevantes hacia artículos y casos verificables, sin duplicar páginas | PARCIAL |
| D. Editorial existente | Comprobar generador, cron y aprobaciones; validaciones de contenido y enlace prepublicación, sin romper calendario | PENDIENTE |
| E. Search Console / GA4 / CRM | Informe semanal de búsquedas sin marca + keywords + páginas y embudo de contactos reales; respetar consentimiento GA4 | PENDIENTE |
| F. ES/CAT/EN | Analizar intención y ruta de versiones por idioma y corregir solamente landings prioritarias, preservando HTML visual; no migración masiva improvisada | PENDIENTE |
| G. Autoridad y recursos | Criterios de casos verificables, colaboraciones y contenido propio; recursos interactivos solo si justifican la inversión, sin enlaces spam | PENDIENTE |
| H. Pre-release QA | build, tests, crawler, endpoints, formularios, GA4/cookies, web mobile/desktop, sitemap URLs, cron existente | PENDIENTE |
| I. Release + post QA | merge a main del PR validado, despliegue READY, auditor en producción, corrección de nuevos incidentes, informe y actualización de estos docs | PENDIENTE |

## 5. Criterios de calidad / No prometer más de lo demostrado

- No alterar clases Tailwind, CSS, dimensiones, layout visual, navegación principal ni diseño. Comparar diff antes de merge.
- No cambiar cadence/publicador de artículos sin revisar dependencias en Supabase cron.
- No duplicar leads ni enviar formularios de prueba reales al CRM; pruebas de frontend con mock cuando proceda.
- No medir conversiones sin consentimiento de analítica; GSC y CRM por separado.
- URLs añadidas al sitemap deben ser públicas, 200, canónicas, sin redirecciones ni noindex.
- Las páginas multilingües deben existir y tener `hreflang` recíproco, distinto idioma, título y descripción fiables.
- No asumir que subir Google rankings está garantizado ni afirmar «SEO perfecto». Confirmar sólo resultados medidos.
- Cero cambios de DNS, dominio, facturación o secretos sin necesidad específica; redirect apex → www todavía 307 en Vercel y requiere ajuste de plataforma si se desea 308 (registrado por separado).

## 6. Comandos de recuperación y diagnóstico

```bash
git checkout feature/seo-growth-foundation-20261021
npm ci
npm run build
npm run seo:health
git diff main...HEAD --stat
```

El crawler de producción no depende de secretos. Evitar usarlo como único gate de CI de PR porque `main` público no contiene aún los cambios de la rama. Para previews usar URL de Vercel y entorno de contenido equivalente al real.

## 6 bis. Ejecución prolongada del 21/10/2026: estado verificable actualizado

### Implementado en la rama (además de lo indicado arriba)
- `.github/workflows/seo-weekly-health.yml`: comprobación técnica semanal de producción (lunes 06:15 UTC) con auditor de sitemap/metadatos + enlaces internos, resumen de GitHub Actions e informe de 30 días. **No estará activa hasta que esta rama se fusione con main.** No escribe sobre producción.
- `.github/workflows/seo-pr-checks.yml`: compila Next.js y ejecuta pruebas unitarias SEO sobre los PR; no necesita secretos.
- `scripts/seo-internal-links.py`: rastreo de páginas del sitemap y enlaces internos utilizando solamente Python estándar. En producción se comprobaron **82 URLs y 96 destinos internos, 0 enlaces rotos** el 21/10.
- `scripts/seo-editorial-audit.mjs`: audita, en modo lectura, artículos programados y publicados, metatítulos/descripciones, vínculos, traducciones y fechas. Usa `SUPABASE_URL` y secreto **solo en un entorno confiable**; jamás publicar informes detallados de artículos programados en logs públicos.
- `scripts/tests/seo-editorial-audit.test.mjs`: 5 pruebas aprobadas; `scripts/tests/seo-page-quality.test.mjs`: nuevas pruebas que deben comprobarse en la última compilación.
- `app/growth-admin/seo/page.tsx`: añade al CMI **privado** contadores de keywords con landing publicada y clics/impresiones orgánicas sin marca, sin alterar la web pública.
- `lib/public-knowledge-sitemap.ts`: carga únicamente identificadores publicados de contenido (sin cuerpos de artículo), con paginación estable de 250 filas y límite de seguridad; evita truncamiento al superar las 200 localizaciones.
- `lib/generated-article-localizations.ts`: añade al índice ligero la localización catalana revisada del artículo histórico.
- `app/sitemap.ts`: usa la consulta ligera paginada y `dynamic='force-dynamic'`; es importante porque el cron de Supabase publica artículos sin desplegar código. **Build anterior verificó `ƒ /sitemap.xml` (ruta dinámica).**
- `app/services/[slug]/page.tsx`: marcado JSON-LD `Service` y `BreadcrumbList` invisible, sin tocar el diseño.
- `lib/seo-page-quality.ts` y `app/api/growth-admin/seo-page/route.ts`: publicación manual/por recomendación en el CMI exige metadatos, contenido y enlaces seguros antes de crear o modificar una landing `published`. NO altera el editor visual público.

### Evidencia de pruebas realizadas
- `npm run seo:test` original: **5/5** antes de añadir tests del validador de landings.
- `npm run build`: **OK** después de añadir sitemap paginado, JSON-LD y CMI de métricas; `ƒ /sitemap.xml` y `ƒ /services/[slug]`.
- Ambos archivos YAML de Actions se analizaron correctamente con el parser `yaml` de Node; el workflow semanal ampliado también validó su sintaxis con el parser.
- Auditor enlaces (última ejecución): 82 páginas, 96 destinos, 0 rotos.
- La auditoría editorial por SQL detectó **585 localizaciones `scheduled`** (195 artículos × 3 idiomas), 17 `published` y **9 artículos con metatítulos iguales entre idiomas**; además, 4 descripciones programadas superan 160 caracteres. El renderer corregido en la rama desambigua títulos por idioma. No se modificaron las fechas ni los estados de publicación.
- Publicador activo: `cron.job` n.º 2 `sc-knowledge-publisher`, cada minuto. También existe `sc-editorial-publisher` cada 5 minutos. NO añadir otro publicador.
- Diff contra main del primer bloque: 20 archivos, **0 CSS**.

### Pendiente de la siguiente ejecución (NO declarar terminado)
1. El sandbox `sbx_4wJ2eYdgRse12Pw9sXDKuixy18n9` caducó durante la última fase. Crear un sandbox nuevo si se necesita validar los commits recientes; **repetir `npm run seo:test`, `npm run build`, YAML y QA de endpoints** sobre HEAD actual (no solo sobre SHA 9bd74e8).
2. Comprobar que el validador de landings no bloquea ediciones legítimas de las 13 páginas actuales (medidas existentes: títulos 49–68, descripciones 130–158, introducciones 200+, 3 secciones); pruebas unitarias nuevas.
3. Inspeccionar el diff completo y comprobar **cero cambios de CSS/layout**; sí cambian enlaces y copys de tarjeta de artículo existente.
4. Verificar sitemap dinámico, `Service` JSON-LD y rutas publicadas en un **preview con acceso a datos** sin filtrar secretos. El preview no equivale a producción si carece de credenciales.
5. Evaluar SEO multilingüe de servicios nuevos (content/translation de calidad) y medición de leads reales vs clics; aún no implementado. No inventar datos ni 29 páginas.
6. Completar PR #80 / release: merge solo después de validación de último commit; verificar Vercel production READY y reejecutar auditores sobre main público.
7. Recordar el redirect temporal 307 del dominio sin www, que requiere configurar Vercel project domain a 308 si el acceso permite; no ocultar como resuelto.
8. Semrush solo puede corroborar con próximo rastreo gratuito; **no afirmar puntuación 100 ni ranking garantizado**.

**Última actualización de este bloque:** 21/10/2026, ejecución de implementación prolongada en PR #80. Todo este trabajo se mantiene en la rama (no main).

### Segundo checkpoint de implementación (mismo 21/10/2026)

- `lib/seo-page-quality.ts`, `app/api/growth-admin/seo-page/route.ts` y nuevas pruebas: comprobado con datos actuales de las 13 landings. La sección más corta tiene 134 caracteres, todas las landings existentes superan las restricciones. Publicaciones incompletas o con URLs peligrosas devuelven 422 al administrador, sin guardarse.
- Nuevo control `scripts/seo-internal-links.py` integrado en auditoría semanal. Ejecución real pública: **82 URLs de sitemap**, **96 destinos internos**, **0 fallos** (antes del merge de esta rama).
- Control de calidad del banco: **585 localizaciones programadas**, de ellas **480 sin `related_case`** pero con `related_article` que a menudo remite a un artículo todavía no publicado. Se corrigió el enlace de la tarjeta de caso en `components/GeneratedKnowledgeArticleGoldStandard.tsx`: usa `/projects` si no hay un caso público específico, sin cambiar la estructura visual.
- QA repetida tras el ajuste de la tarjeta y del CMI: **`npm run seo:test` 9/9, `npm run build` OK, `ƒ /sitemap.xml` y `ƒ /services/[slug]`**. Comparación con `main`: 23 archivos modificados, **0 CSS/Tailwind** (antes de las últimas actualizaciones documentales).
- **No se han aplicado migraciones Supabase, ni cambiado cron, cookies, newsletter, ni publicado páginas SEO nuevas.** CMI sólo cambia en rama GitHub.
- Sigue pendiente **un E2E de preview con las variables reales del backend** y un rastreo de producción tras release; no marcarlo como superado antes de probarlo.
- El listado público `/knowledge` sigue utilizando hasta 200 localizaciones con cuerpo completo. El sitemap ahora paginará todas las publicadas, pero **la UI del listado puede dejar de listar artículos antiguos cuando haya muchos**. No cambiar la UX de búsqueda de conocimiento sin un plan de paginación que conserve su funcionamiento.
- El cron semanal de GitHub Actions sólo empezará después de fusionar la rama; todavía no se ha ejecutado automáticamente.
- Para la siguiente sesión revisar estado HEAD/PR, correr pruebas actualizadas y abrir el plan multilingüe priorizado sin crear páginas duplicadas.

## Checkpoint — Sprint SEO comercial ES/CAT y medición (21/10/2026, continuación)

**Trabajos realizados en esta iteración:**
- `lib/seo-service-locales.ts`: familias curadas de 6 servicios EN con correspondencias ES/CA. `app/services/[slug]/page.tsx`: metadatos localizados, Open Graph locale, JSON-LD `inLanguage` y etiquetas `hreflang` **solo entre rutas publicadas**, conservando exactamente clases CSS, layout y plantilla visual.
- En Supabase se crearon **10 landings nuevas como `draft`** (6 ES, 4 CA), fuente `seo_localized_curated_draft`. No son públicas ni aparecen en sitemap hasta publicación. Cada página tiene introducción propia, 4 apartados, metadatos y 3 enlaces internos. Consulta: `select slug,status from public.seo_pages where tenant_id='sc-analytics' and source='seo_localized_curated_draft';`.
- `scripts/seo-localized-release-20261021.sql`: transacción protegida de liberación de las diez páginas y consolidación de los 16 targets pendientes, con verificación final **29/29**. **No ejecutar antes de merge y READY**.
- `docs/seo-localized-commercial-20261021.md`: mapa editorial, arquitectura y secuencia de publicación.
- `app/services/[slug]/page.tsx` y `app/contact/page.tsx`: atribución de servicio mediante URL `/contact?ref=service:<slug>`, persistida en el campo existente `website_inquiries.source_path`; sin nuevas cookies ni nuevos campos visuales.
- Dos correcciones mínimas de lint CI fuera del SEO: `components/CookieConsent.tsx` (inicialización de estado diferida un tick, respetando rechazo y consentimiento) y `components/growth-admin/MeetingCalendarView.tsx` (utilizar `current.getTime()` en vez de Date.now en render). Clases/CSS intactas.

**Pruebas realizadas:**
- `npm run lint`: **0 errores**, 20 warnings ya presentes; antes 2 errores generales bloqueaban CI.
- `npm run seo:test`: **12 pruebas/12 correctas** (incluyendo `hreflang` recíproco y borradores excluidos).
- `npm run build`: **OK**, sitemap y rutas de servicios dinámicas.
- E2E en Chromium móvil, con Supabase simulado y POST de contacto interceptado: **10/10** (HTTP ES, canónica, `hreflang`, sin scroll horizontal, CTA a contacto, origen persistido, checkbox RGPD, GA4 bloqueado al rechazar y página en borrador 404). **No se insertaron leads ficticios**.
- Preview Vercel protegido con SSO; curl anónimo devuelve login, por eso se usó E2E local y datos de Supabase auditados, no se afirmó QA del preview autenticado.
- SQL de Supabase: **10/10** borradores válidos con 4 secciones, descripciones de 135+ caracteres, enlaces a contacto y referencias a rutas actuales.

**Próximos pasos estrictos:**
1. Comprobar checks del último commit del PR #80; CI verde y Vercel READY.
2. Fusionar PR #80 si cumple criterios, sin tocar frontend.
3. Verificar producción: páginas EN, enlaces nuevos, formulario y cookies, nuevo sitemap.
4. Ejecutar transacción guardada en `scripts/seo-localized-release-20261021.sql`; comprobar 10 nuevas páginas HTTP 200, `hreflang`, sitemap y 29/29 targets. Si el sitemap refleja caché antigua, revisar revalidación/cron antes de publicar.
5. Revisar Search Console y solicitar indexación donde proceda, monitorizar palabras no branded; no asegurar rankings.
6. Trabajo posterior independiente: mejoras reales de captación, autoridad externa genuina, calendario de contenido con evidencia y semántica de páginas comerciales, no herramientas SEO de pago.

## 7. Último resultado verificado y siguiente paso

**Último resultado verificado:** nueve tests SEO correctos, Next.js build OK con sitemap dinámico y 82 URLs/96 destinos internos en producción sin fallos de enlace. Los cambios permanecen en PR #80 en borrador; falta E2E de la rama más reciente y, después del merge, auditoría de producción.

**Siguiente paso recomendado:** comprobar el preview del último HEAD con acceso a las variables backend de Vercel (sin exponer secretos), probar CMI y cookies/formulario, validar sitemap dinámico con artículos publicados y cerrar el bloque de lanzamiento cuando las pruebas sean satisfactorias. Después preparar las landings comerciales multilingües ES/CAT (contenido sustantivo revisado) y medición de reuniones/CRM. Los workflows de GitHub ya están preparados, pero aún inactivos hasta merge. Actualizar este archivo en cada sesión.

## 8. Fuentes de verdad para el próximo chat

1. Este archivo (decisiones / estado) y `docs/seo-growth-roadmap.md`.
2. El estado actual de PR #80 y los commits reales en GitHub, **no sólo esta descripción**.
3. Los despliegues en Vercel (`main` vs preview).
4. Registros actuales de Supabase y CMI (pueden haber cambiado desde este snapshot).
5. Search Console para datos de posicionamiento; GA4 sólo para visitas que aceptaron analítica.

**Al retomar:** informar primero de los últimos commits y del estado de la rama, luego ejecutar siguiente checklist sin pedir al usuario que repita todo el contexto.
