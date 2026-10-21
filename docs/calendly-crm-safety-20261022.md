# SC-Analytics: Calendly → CRM safety gate, before first daily reconciliation

**Fecha:** 2026-10-22.  
**Rama:** `fix/calendly-crm-preserve-funnel-20261022`

## Riesgo detectado en la versión anterior

El reconciliador buscaba la última oportunidad de la persona por `updated_at` y actualizaba siempre su etapa a `discovery_booked` y la probabilidad a un mínimo de 40 %. Al ejecutarse automáticamente cada día, esto podía reabrir un proyecto **cerrado** o sobrescribir el estado de una oportunidad de Upwork, outreach o colaboración no relacionada con esa reunión.

También permitía asociar personas solo por coincidencia de nombre y borraba `completed_at` al convertir una persona existente en un nuevo invitado de Calendly. Son riesgos de integridad del CMI, no problemas de posicionamiento web.

## Corrección implementada

- `lib/calendly-crm-safety.ts`: funciones puras que exigen coincidencia exacta de URI de evento **y** fuente `calendly` para reutilizar una oportunidad. No se reutiliza la última oportunidad por persona indiscriminadamente.
- `lib/calendly-crm.ts`: un evento distinto crea una oportunidad separada de Calendly, sin alterar oportunidades previas. Una reconciliación repetida del **mismo evento** conserva `stage`, `value`, `probability` y el historial; solo enriquece metadatos UTM si faltaban.
- Las personas se resuelven por **email de invitado**, no por coincidencia de nombre; si no hay email no se crea ni vincula una persona.
- Si el prospecto fue marcado como **`archived`**, la reserva no cambia ese estado ni borra su fecha de completado.
- Una invitación `canceled` o un evento `canceled` no generan oportunidades de ventas; se puede preservar el propio estado del evento en `crm_meetings`.
- Se reutilizan las restricciones de unicidad existentes sobre `(tenant_id, provider, external_id)` en `crm_meetings`.

## Comprobaciones

- `npm run seo:test`: **23/23** pruebas, incluidas 4 nuevas contra confusión de oportunidades, archivados y cancelaciones.
- `npm run lint`: **0 errores**, 18 advertencias anteriores.
- `npm run build`: **correcto**; `/` y `/contact` siguen siendo rutas estáticas.
- No se modifican CSS, contenidos, SEO, cookies ni URLs públicas.
- No se han hecho backfills, insertado citas ficticias ni cambiado registros comerciales históricos durante esta validación.

## Siguiente control necesario

- Confirmar PR integrado y despliegue Vercel READY **antes de la primera ejecución diaria**, prevista para el 22/10/2026 alrededor de las 06:10 UTC (en Hobby, dentro de la hora).
- Comprobar los logs `/api/cron/calendly-crm-daily` y el campo `integration_connections.metadata.last_synced_at`.
- Verificar que los nuevos registros `crm_meetings` enlazan con el evento, sin duplicar personas ni reiniciar etapas de oportunidades antiguas. **No declarar que el cron ha corrido hasta comprobarlo**.
- Revisar si el índice email de `people` debe llegar a ser único por tenant y correo normalizado tras auditar duplicados, en un cambio aparte. Nunca imponer un índice único sin comprobar datos y consecuencias.
