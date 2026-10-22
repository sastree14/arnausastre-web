# SC-Analytics — cierre de desarrollo SEO (lote PR #89)
Fecha: 22/10/2026. **Código en rama, no desplegado.** No se han activado crons, realizado pilotos, cambiado CSS de la web, pagado herramientas ni publicado backlinks.

## Qué se ha desarrollado en este lote
1. Servicio: corrección JSON-LD semántica, auditoría sitemap/canónicas, casos reales ligados a los 23 servicios publicados, guardas de redirección.
2. Datos: Search Console reciente por consulta **y URL real**, separado por marca/ambiguos/sin marca; nunca atribuye visitas de Home/Knowledge a servicios por similitud de keywords.
3. Indexación: cron autenticado, Google URL Inspection read-only, 5 servicios al día, resultado guardado y caducidad de 45 días. La API no solicita ni fuerza indexación.
4. Inteligencia semanal: diagnóstico por servicio, keywords observadas (sin volúmenes inventados), competidores públicos bajo robots.txt, cola persistente revisable, nunca auto-publicación.
5. Inteligencia comercial adicional (growth/src/seo_commercial_readiness.py): revisión de calidad de título, H1, intro, secciones, CTA y casos reales; separa preparación onsite de éxito SEO, oportunidad de autoridad editorial y embudo de clientes. Ninguna métrica de rankings, enlaces externos o ventas se inventa.
6. Datos protegidos: si GSC lleva >14 días sin actualizar, se propone refrescar la importación en lugar de reescribir. Si Google URL Inspection comunica otra canónica, se propone revisión técnica. Se descartan páginas externas como supuesta demanda propia.
7. Investigación SERP opcional sin servicios de pago: formulario autenticado en el CMI por keyword, registra país, dispositivo, fecha, fuente HTTPS, páginas competidoras y notas. El servidor valida los datos y conserva las métricas existentes de inspección. Siempre submitted_unverified: no puede generar por sí solo un ranking verificado ni autorizar enlaces.
8. CMI enseña plan de revisión, evidencia de cada URL, comprobaciones de calidad, investigación SERP y próximos pasos de autoridad editorial sin tocar frontend público.
9. Pruebas unitarias añadidas para datos no verificados, redirecciones canónicas reportadas, antigüedad, no atribución a otros dominios y seguridad de observaciones SERP.

## Arquitectura simple

- GitHub Actions es el scheduler del informe SEO semanal. YA EXISTE; no crear duplicado como tarea ChatGPT.
- Vercel Cron consulta cada día el estado de indexación en cuanto se despliegue; no envía solicitudes de indexación.
- Search Console + Supabase son la fuente operativa; CMI permite revisar propuestas y guardar evidencia.
- La investigación manual se utiliza únicamente cuando no existen volúmenes/SERP verificables, sin fingir datos del mercado.
- NO scraping de SERP Google, manipulación de backlinks, mensajes comerciales automáticos ni compra de enlaces.
- Los cambios aprobados de copy podrían cambiar el texto visible, no las plantillas ni el CSS. Ningún cambio editorial se publica solo.

## Límites de desarrollo frente a operación

El desarrollo no garantiza automáticamente:
- que Google indexe una página o la posicione primero;
- que existan datos de demanda, dificultad o posiciones de herramientas de pago;
- que terceros enlacen a SC-Analytics o acepten colaboración;
- que un clic se convierta en formulario, reunión o cliente firmado.

Las condiciones anteriores son resultados externos y necesitan medición/actividad comercial posteriores. El sistema para registrar, evaluar y preparar decisiones queda codificado, pero no debe describirse como activo hasta piloto.

## Puerta de activación (NO ejecutar ahora)

1. Asegurar CI verde para el último commit de PR #89 (Node SEO, build, lint y pytest); inspeccionar diff final, main y cuota Vercel.
2. Fusionar el PR en main y generar un solo deployment de producción Vercel una vez liberado el límite Hobby. Confirmar READY y SHA real; no forzar despliegues ni pagar.
3. Inspeccionar homepage/contact y las páginas de servicio, sitemap, hreflang, canónica Google, JSON-LD; aviso 307 del apex hasta cambiar a 308 en Domains.
4. Verificar ejecución real de /api/cron/seo-index-daily autenticado y cambios seo_keyword_targets.metrics.google_index_inspection; 0/29 antes de publicar.
5. Verificar permisos/secretos GitHub Actions sin revelar valores, ejecutar primero lectura y luego el workflow SEO de propuestas, confirmar seo_recommendations en el CMI (0 inicial).
6. Registrar una observación SERP no sensible en el CMI y confirmar que no altera google_index_inspection ni genera publicación.
7. Contrastar Calendly/CRM, formularios, reservas confirmadas, oportunidades y ventas reales sin llamar 'clientes orgánicos' a los clics; verificar clasificación estricta no branded.
8. Volver a medir después de ~14 días, respetando el retraso normal de Google, y después mantener el ciclo semanal de ajustes editoriales supervisados.

## Fuentes y credibilidad
- Google SEO Starter: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Helpful, reliable content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Search Console URL Inspection API: https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect
- Google Spam Policies: https://developers.google.com/search/docs/essentials/spam-policies

No se añaden NIF ni domicilio personal al repositorio o a Schema.org.
