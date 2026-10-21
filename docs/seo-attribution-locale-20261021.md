# SC-Analytics — SEO idioma y atribución comercial

**Fecha:** 2026-10-21  
**Rama de implementación:** `feature/seo-attribution-document-language-20261021`  
**Estado actual:** **PR #83 fusionado en main** (commit `848637f0f76f6b84fd5ec007bf15eeb399b7d4de`), Vercel producción READY. **Primera ejecución diaria de cron aún por verificar**.

## Objetivo

No confundir clics, formularios, reservas reales y oportunidades cualificadas, y mejorar la identificación de idiomas comerciales sin penalizar el rendimiento del sitio.

## 1. Idioma sin hacer dinámica toda la web

- Páginas localizadas conocidas: `/services/<slug>`, `/knowledge/<slug>/<es|ca|en>` y `/partner-analitico`.
- `lib/seo-service-locales.ts` proporciona la resolución de idioma según URL, evitando depender de `Accept-Language` cuando la ruta tiene un idioma específico.
- `proxy.ts` añade `Content-Language: es|ca|en` a las respuestas localizadas y no modifica URL ni cookies.
- `components/SiteLanguageProvider.tsx` mantiene `document.documentElement.lang` y la navegación cliente según el idioma explícito de la ruta. Una ruta ES/CA tiene prioridad sobre la preferencia EN guardada en el navegador.
- **Decisión de rendimiento consciente:** no usar `headers()` en `app/layout.tsx`, porque las pruebas revelaron que convertía `/`, `/about` y `/contact` de prerender `○` a dinámicas `ƒ`. Se revirtió ese cambio para conservar velocidad y el frontend.
- **Limitación documentada:** el atributo `<html lang>` del HTML antes de hidratar continúa con el `en` predeterminado. El servidor sí envía `Content-Language` y las páginas mantienen `hreflang`, canónicas y contenidos de cada idioma; para cambiar el atributo SSR inicial correctamente haría falta evaluar una futura reorganización de root layouts, no justificada por ahora.

## 2. Atribución sin cookies nuevas

- `lib/seo-booking-attribution.ts`: normaliza `service:<slug>`, valida rutas y genera enlaces `https://calendly.com/arnau-sastre-sc-analytics` con `utm_source=sc_analytics_website`, `utm_medium=website`, `utm_campaign=discovery`, y un `utm_content=service:<slug>` opcional.
- `app/contact/page.tsx` conserva el formulario y diseño, pero el CTA de Calendly recibe esos parámetros. No envía nombre, correo, identificador persistente ni datos de sesión por UTM.
- `lib/calendly-crm.ts` lee `invitee.tracking` de Calendly, lo valida y conserva `booking_attribution` en metadatos de `crm_meetings` y `crm_opportunities`. **Solo atribuye reuniones que Calendly registró de verdad**, nunca un clic o una simple apertura de ventana.

## 3. Calendly → CRM diario

- `CALENDLY_ACCESS_TOKEN` y `CRON_SECRET` **existen** en el entorno de producción de Vercel; se comprobó únicamente la existencia de los nombres, sin consultar ni divulgar valores.
- `CALENDLY_WEBHOOK_SIGNING_KEY` **no está configurada** actualmente, de modo que no puede presumirse sincronización por webhook. La tarea diaria suple la reconciliación básica; no se debe confundir webhook en tiempo real con polling diario.
- Nueva ruta `GET /api/cron/calendly-crm-daily` protegida por `Authorization: Bearer <CRON_SECRET>`; devuelve 401 sin token y 503 sin token de Calendly configurado.
- `vercel.json` registra una programación diaria a **06:10 UTC**; en Hobby Vercel puede ejecutarla dentro de la hora correspondiente, sin precisión garantizada al minuto. Reutiliza la implementación existente `syncCalendlyCrm`, con `provider+external_id` para actualizar registros existentes.
- Al 21/10/2026 había **cero reuniones `provider='calendly'` en el CMI**, pero en la cuenta Calendly conectada se observaron **dos eventos en la franja agosto–octubre**. La sincronización existente solo importa eventos desde siete días antes de la ejecución; **no se importará retrospectivamente el evento de agosto**, por decisión explícita del sincronizador de evitar historial antiguo de pruebas. Una reunión de octubre podría entrar en el siguiente ciclo si sigue dentro de la ventana. **No afirmar que el cron se ha ejecutado con éxito antes de revisar el log del día siguiente.**

## 4. Panel SEO del CMI (administradores)

- `lib/seo-attribution-report.ts` agrega exclusivamente totales de eventos verificados, sin correlacionar personas.
- `app/growth-admin/seo/page.tsx` añade indicadores de los últimos 90 días:
  1. Formularios recibidos.
  2. Formularios cuyo origen era una página de servicio.
  3. Reservas confirmadas y registradas en Calendly/CRM.
  4. Reservas con UTM de origen `sc_analytics_website`.
- Si falla la consulta de formularios o reservas, muestra **—**, nunca 0 inventado. Tope 500 registros por fuente, advertido en la vista.
- No se inferirá que una reunión fue causada por un formulario: son etapas medidas por separado.

## 5. Comprobaciones realizadas

- `npm run seo:test`: **16/16 pruebas correctas** con nuevos tests de idioma, URL segura y UTM.
- `npm run lint`: **0 errores**, 18 warnings no bloqueantes.
- `npm run build`: **OK**, `/api/cron/calendly-crm-daily` reconocida.
- Comprobación comparativa de build de `main`: `/`, `/about`, `/contact` prerender estático `○`; tras revertir cambio de root layout se mantienen como `○` en la rama.
- Chromium, con Supabase de prueba y contacto interceptado: **16/16** (200 ES/CA/EN, `Content-Language`, idioma hidratado, sin overflow móvil, UTM correctas, consentimiento, origen en JSON del contacto, no GA4 sin aceptación y 401 de cron).
- **No se enviaron contactos falsos a Supabase ni reservas a Calendly.**

## 6. Validaciones de producción y siguientes pasos

1. **Completado:** GitHub CI general y SEO checks en verde, PR #83 fusionado y Vercel producción READY.
2. **Completado:** producción devuelve `Content-Language` ES/CA/EN en las rutas correspondientes, conserva 93 URLs en sitemap y genera el CTA de Calendly con UTM. **8/8** comprobaciones reales de Chromium móvil correctas; no se cambió ningún CSS.
3. Comprobar la primera ejecución de Vercel Cron el **22/10/2026 a las 06:10 UTC**, que sincronice eventos recientes o, si no, revisar logs y token.
4. Diferenciar reserva `active` de `canceled`; revisar calidad de las oportunidades creadas por la sincronización existente sin duplicados ni asignaciones erróneas.
5. Revisión de Search Console y rastreo gratuito Semrush tras la publicación SEO reciente: los resultados reales llegarán con retraso.
6. Dominio apex `sc-analytics.io` → `www.sc-analytics.io` todavía usa 307 y conviene revisar su permanencia 308 a nivel Vercel/DNS.
