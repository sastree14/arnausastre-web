# SC-Analytics — Lote SEO: canónicas, Schema.org, casos y cuota Vercel

**Fecha:** 22/10/2026
**Rama de cambios de código:** `feature/seo-canonical-schema-proof-20261022`
**Política de despliegue:** NO fusionar/desplegar por cada commit. Un único merge y despliegue cuando la cuota Hobby se libere y toda la QA esté aprobada.

## Evidencia de Search Console

La inspección del usuario de `https://sc-analytics.io/` (rastreo 21/10/2026) muestra:
- Página **indexada**; rastreo, captura de contenido e indexación permitidos.
- Google escogía como canónica **la propia URL inspeccionada**; el rastreo histórico decía que no se había declarado ninguna.
- **Error temporal de procesamiento de sitemap**, distinto del estado de indexación de la portada.

**Comprobación actual del sitio:** los 93 destinos del sitemap publicado tienen exactamente **una URL canónica autodeclarada, en el host www**, 93 H1 correctos, cero metatítulos duplicados y todos los JSON-LD parseables; la portada `https://www.sc-analytics.io/` y `/contact` ya declaran canónicas correctas. El informe antiguo no justifica una segunda etiqueta `canonical` en esas páginas.

### Pendiente en Vercel

El dominio apex `sc-analytics.io` redirige a `www.sc-analytics.io`, pero la configuración de dominio devuelve `redirectStatusCode:null` y actualmente responde con una redirección **temporal 307**. Convertirla en **308 permanente** en **Project → Settings → Domains**, sin eliminar/recrear dominios ni tocar DNS. Los conectores accesibles permiten consultar el dominio pero **no editar ese código**. El auditor actualizado indicará la advertencia hasta corregirla. Google decidirá cuándo consolidar sus canónicas; el código por sí solo no garantiza esa elección.

## Corrección semántica Schema.org

- Problema concreto: se usaba `inLanguage` directamente sobre `Service`. Según Schema.org, es una propiedad apropiada para `CreativeWork`/`WebPage`, no para `Service`.
- `lib/seo-service-structured-data.ts` centraliza un grafo JSON-LD con `Service`, `WebPage` y `BreadcrumbList`; `WebPage.inLanguage` enlaza al `Service` como `mainEntity`.
- `app/services/[slug]/page.tsx` usa ese grafo sin cambiar **ningún CSS o HTML visual**.
- `scripts/seo-health.mjs` ahora comprueba la semántica del grafo y avisa si un fallo intermitente del backend deja menos de 85 URLs en el sitemap (línea base 93). También identifica redirects apex no permanentes.
- Esto **no equivale** a solucionar todos los errores del informe de Semrush del 21/10 (74 incidencias de schema); confirmar con un rastreo externo actualizado cuando sea posible, examinando el detalle del tipo de error.

## Portfolio existente enlazado

- Se revisaron 23 servicios publicados y 11 destinos de casos distintos. Todos los 11 casos devolvieron HTTP 200 y figuran en `portfolio-case-registry.ts`.
- Se aplicó en Supabase una actualización idempotente y transaccional desde `scripts/seo-service-proof-links-20261022.sql`.
- Primero se ejecutó un **dry run + ROLLBACK**; después se guardó y se verificó **23/23 páginas comerciales con enlace válido a un caso existente**. Cada una conserva los 3 enlaces anteriores y suma 1 enlace contextual.
- **No se han modificado los casos, métricas, textos, frontend ni resultados**. El enlace reutiliza exactamente el componente visual de enlaces que ya tenían los servicios. Las rutas son públicas desde Supabase sin necesidad de un nuevo despliegue.

## Control de cuota gratuita Vercel

- Captura del usuario: 8,94 GB de Deployment Storage (89,4% de 10 GB), Functions Storage muestra 0 B al final del periodo consultado.
- Desde la conexión de Vercel se actualizó el proyecto **`previewDeploymentsDisabled:true`** para dejar de crear previews automáticas por cada push. La rama de este lote no ha producido despliegues.
- La versión de producción confirmada antes de esta rama era PR #87; PR #88 ya estaba en `main` pero todavía no desplegado por límite de 100 builds diarios de Hobby.
- Vercel anunció el 16/09/2026 que Hobby protege las últimas 3 versiones de producción y las últimas 3 en general, además de dominios/aliases activos, y elimina históricas bajo política de retención. El conector disponible **no ofrece borrar un despliegue individual ni cambiar las políticas de retención**; no se ha borrado nada que pueda afectar a producción ni se ha comprado capacidad.
- A futuro: rama única → pruebas sandbox GitHub → PR revisado → **un** merge/deploy tras comprobar cuota. No multiplicar publicaciones por cada cambio. Si es necesario liberar más almacenamiento, revisar en Vercel Settings → Security → Deployment Retention y Deployments sin borrar nunca la versión activa ni la copia de recuperación.

## Validación y release gates

- [x] `npm run seo:test`: 39/39.
- [x] `npm run lint`: sin errores, 18 warnings preexistentes.
- [x] `npm run build`: correcto, sin CSS modificado.
- [x] Catálogo: 23 páginas comerciales y 29 keywords asociadas a rutas publicadas.
- [x] 11 URL de casos verificadas HTTP 200.
- [x] Supabase: 23 de 23 servicios enlazados a su caso tras commit SQL.
- [ ] CI del PR en verde, revalidar último `main` y fusionar **solo como despliegue de lote** (no durante cuota bloqueada).
- [ ] Una vez Vercel READY, volver a rastrear 93 páginas con el auditor **nuevo**: cero errores estructurales, y advertencia conocida de 307 mientras no se cambie en Domains.
- [ ] Ejecutar Semrush gratuito y Google Rich Results / Schema Validator para confirmar específicamente los avisos previos, no deducirlos del JSON parseable.
- [ ] Search Console: inspeccionar `https://www.sc-analytics.io/`, `/contact` y las diez landings ES/CA, verificar canónica Google-selected e indexación; re-enviar `https://www.sc-analytics.io/sitemap.xml` si conserva aviso temporal.
- [ ] Medir impresiones/clics sin marca con el clasificador correcto, después de que Google incorpore las landings.

**Privacidad:** información fiscal y domicilio personal comunicados por el usuario son confidenciales; no se usan en este lote, ni se añaden a repositorio, HTML, JSON-LD o Supabase público.
