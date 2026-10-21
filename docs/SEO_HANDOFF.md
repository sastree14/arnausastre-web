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

## 7. Último resultado verificado y siguiente paso

**Último resultado verificado:** build correcto en sandbox y siete destinos comerciales HTTP 200; auditor público detectó 2 problemas de sitemap/hreflang ya arreglados en la rama. PR #80 se creó inicialmente en borrador. La auditoría posterior al deploy sigue pendiente.

**Siguiente paso recomendado:** instrumentar GitHub Action semanal de SEO QA + comprobar informe; después revisar flujo editorial real y preparar validadores que adviertan, no reprogramen silenciosamente. Actualizar aquí la lista de completado y el commit/PR al cerrar cada sesión.

## 8. Fuentes de verdad para el próximo chat

1. Este archivo (decisiones / estado) y `docs/seo-growth-roadmap.md`.
2. El estado actual de PR #80 y los commits reales en GitHub, **no sólo esta descripción**.
3. Los despliegues en Vercel (`main` vs preview).
4. Registros actuales de Supabase y CMI (pueden haber cambiado desde este snapshot).
5. Search Console para datos de posicionamiento; GA4 sólo para visitas que aceptaron analítica.

**Al retomar:** informar primero de los últimos commits y del estado de la rama, luego ejecutar siguiente checklist sin pedir al usuario que repita todo el contexto.
