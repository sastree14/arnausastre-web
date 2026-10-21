# Comprobación de frescura de Calendly en el panel SEO

**Fecha:** 2026-10-22. **Rama:** `feat/seo-calendly-sync-health-20261022`.

## Problema

La tabla `crm_meetings` tenía cero eventos de Calendly, pero la cuenta conectada había registrado citas. Por tanto, el panel no debía indicar "0 reuniones" como si fuera un dato completo. Se comprobó que `integration_connections.metadata.last_synced_at` de Calendly era **2026-09-21T12:17:37.905Z**, más de 30 días antes de la ejecución prevista del cron diario.

## Solución

- `lib/seo-calendly-health.ts` clasifica la fuente en `fresh` (menos o igual a 48 horas), `stale`, `never` o `unavailable`. El límite de 48 horas es tolerante a la ejecución diaria dentro de una hora y fallos de un ciclo.
- `app/growth-admin/seo/page.tsx` consulta el registro de integración, muestra la última sincronización real y oculta las cifras de Calendly mediante **—** mientras la fuente no esté fresca. Los formularios web, medidos en otra tabla, siguen mostrando sus propios resultados.
- La cifra vuelve automáticamente a un número (incluido 0, si fuera real) cuando una sincronización completada actualiza el metadato `last_synced_at`.
- No se ejecutan consultas de escritura desde el panel, no se lanzan webhooks nuevos y no se alteran las páginas públicas ni las cookies.

## Verificación

- `npm run seo:test` **26/26** (3 nuevas pruebas de sincronización ausente, obsoleta y reciente).
- `npm run lint` **0 errores**, 18 advertencias anteriores.
- `npm run build` **OK**, home y contacto permanecen estáticas.

## Próximo control

Comprobar **el 22 de octubre de 2026, tras la ejecución programada de las 06:10 UTC**, que la marca de sincronización se haya actualizado y que las reuniones sean correctas. Si persiste `stale`, consultar logs de Vercel de `/api/cron/calendly-crm-daily` y revisar token/errores. Nunca presentar 0 reservas como dato completo cuando no hay reconciliación reciente.
