# SC-Analytics — Manual técnico del propietario: repositorio, SEO y diagnóstico

Preparación inicial: 22/10/2026. Manual pendiente de anotar el SHA final y las evidencias del piloto en producción.

IMPORTANTE: que el código esté aprobado por CI no acredita que esté desplegado ni que Google indexe la totalidad de URLs. El release y las pruebas reales son hitos separados.

## 1. Arquitectura en cuatro piezas

- **GitHub:** código Next.js, Python, pruebas y workflows. https://github.com/sastree14/arnausastre-web
- **Vercel:** web pública, CMI privado, API y cron. PREVIEW READY no significa PRODUCTION READY. Comparar siempre el commit SHA de producción con GitHub main.
- **Supabase:** tablas y evidencia. Publicar una fila en seo_pages no equivale a indexación Google.
- **Google Search Console/GA4:** GSC mide búsquedas y URL realmente mostradas; GA4 mide actividad web. Ninguna fuente acredita por sí misma ventas o contratos.

## 2. Mapa general del repositorio

| Ruta | Función |
| --- | --- |
| app/ | Rutas públicas Next.js, páginas y endpoints |
| app/page.tsx | Página de inicio |
| app/services/ | Plantillas y rutas de servicios |
| app/knowledge/ | Artículos orientados a problemas y conocimiento |
| app/projects/ | Casos y pruebas reales |
| app/growth-admin/ | Interfaz CMI privada |
| app/api/ | Endpoints de cron, sincronización, formularios y operaciones |
| components/ | Diseño y componentes visibles y privados |
| lib/ | Lógica TypeScript de SEO, Google, CRM, seguridad e integraciones |
| growth/src/ | Motores Python de investigación y propuestas |
| growth/tests/ | Tests automáticos Python |
| growth/brain/ | Reglas de marca, evidencia, voz y oferta |
| content/ | Contenido editorial y modelos |
| database/ y supabase/ | Persistencia, esquemas, SQL y migraciones |
| scripts/ | Auditorías y utilidades, incluyendo SQL versionado |
| scripts/tests/ | Tests Node del SEO |
| .github/workflows/ | Actions: pruebas, análisis SEO y demás tareas de empresa |
| vercel.json | Crons de Vercel |
| package.json | Comandos Node |
| docs/ | Contexto técnico, investigación y procedimientos |

## 3. Dónde está cada parte del SEO

### Indexabilidad y estructura
- app/sitemap.ts y app/robots.ts: rutas descubiertas y reglas para rastreadores.
- lib/seo-service-structured-data.ts: JSON-LD de Service, WebPage y BreadcrumbList. No garantiza posición.
- scripts/seo-health.mjs: audita enlaces, titles, sitemap y canónicas.
- scripts/seo-internal-links.py: verificación de integridad de enlaces.
- .github/workflows/seo-weekly-health.yml: diagnóstico técnico semanal de producción sin escritura editorial.

### Search Console / Analytics
- lib/google-marketing-analytics.ts: integración corporativa con GSC/GA4, sincronizaciones e inspección de URLs.
- lib/seo-search-query-classification.ts: marca, consultas ambiguas y búsquedas sin marca.
- lib/seo-organic-trends.ts: comparación 28 días actuales contra 28 anteriores.
- lib/seo-attribution-report.ts y lib/seo-calendly-health.ts: atribución prudente del embudo.
- Tablas: search_console_daily, web_analytics_daily, website_inquiries, crm_meetings y analytics_sync_runs.

### Inspección de indexación Google
- lib/seo-index-inspection.ts: selección de máximo cinco rutas /services/ al día y saneamiento de la respuesta.
- app/api/cron/seo-index-daily/route.ts: cron autenticado por CRON_SECRET que llama a URL Inspection API read-only.
- Se almacena en seo_keyword_targets.metrics.google_index_inspection.
- Diferenciar PASS observado, FAIL, UNKNOWN y fallo de llamada. Ni sitemap ni preview acreditan indexación.

### Investigación comercial y mejoras
- growth/src/seo_intelligence.py: procesa consulta, posición observada, impresiones y clics de su URL real.
- growth/src/seo_review_briefs.py: recomienda qué revisar sin escribir contenido publicable.
- growth/src/seo_commercial_readiness.py: verifica calidad editorial, llamadas a la acción, casos y oportunidades de autoridad (sin fingir resultados).
- growth/src/seo_keyword_expansion.py: 32 variantes ES/CA/EN curadas, ligadas a servicios existentes; son HIPÓTESIS, no volúmenes ni búsquedas verificadas. Dos por semana, en rotación.
- growth/src/seo_competitor_research.py: inspecciona títulos/H1/estructura de hasta seis sitios públicos, respeta robots.txt; no informa de rankings de Google.
- lib/seo-serp-evidence.ts: captura manual validada de país, dispositivo, fecha y URL de fuente; evidencia pendiente de revisión.
- app/growth-admin/seo/page.tsx: SEO Control del CMI, mapa de keywords, recomendaciones y formulario SERP privado.
- app/api/growth-admin/seo-page/route.ts: valida autenticación y rechaza la publicación directa de propuestas analíticas.
- .github/workflows/seo-weekly-intelligence.yml: miércoles 06:45 UTC, revisa condiciones y escribe propuestas en seo_recommendations. No publica ni contacta a terceros.

## 4. Un ciclo real de mejora SEO

1. Search Console registra consulta y URL donde Google mostró la página, si el dato es identificable.
2. El importador incorpora filas a search_console_daily; clasifica marca, ambigua o sin marca.
3. El motor atribuye impresiones y posición a la URL realmente observada. Knowledge/Home no se atribuyen ficticiamente a un servicio.
4. Se comprueba sitemap y última inspección Google si existe. Primero se investigan errores técnicos.
5. Se evalúan el servicio, el caso real relacionado, lenguaje de búsqueda, CTA, competidores y evidencia histórica.
6. El sistema guarda propuestas revisionables en seo_recommendations con publishable=false. Las hipótesis léxicas se distinguen explícitamente de las consultas GSC observadas.
7. El CMI muestra evidencia, intención y sugerencia. Cambiar el contenido requiere revisión y una acción editorial explícita; no altera el diseño por sí solo.
8. Tras una edición aprobada y publicada, comparar GSC por la misma URL con suficiente tiempo de observación y comprobar formularios, reuniones verificadas y clientes reales cuando tengan atribución.

NUNCA crear una landing nueva por cada variante de búsqueda. Si varias frases comparten intención, reforzar una página existente y evitar canibalización SEO. Investigar «keywords de moda» solo con fuentes fechadas y trazables; una palabra usada por competidores NO es evidencia de tendencia.

## 5. Consolas de operación

- GitHub: Pull Requests para versiones, Actions para ejecuciones (CI, SEO safety, SEO weekly health, SEO weekly intelligence). Verificar el SHA del último commit y resultado SUCCESS.
- Vercel: equipo sastree14s-projects, proyecto arnausastre-web, Deployments, target production, estado READY y SHA. Si Hobby bloquea cuota, no forzar reintentos.
- CMI privado: https://www.sc-analytics.io/growth-admin/seo. Solo refleja funciones nuevas una vez publicado el commit correcto.
- Supabase: proyecto sc-analytics-growth; tablas seo_pages, seo_keyword_targets, seo_recommendations, search_console_daily, analytics_sync_runs, website_inquiries, crm_meetings.
- Google Search Console: URL Inspection para cada servicio, dominio verificado; una inspección real no garantiza ranking.

## 6. Diagnóstico rápido

| Síntoma | Comprobar | Criterio |
| --- | --- | --- |
| La preview funciona, la web no cambia | Vercel production READY y SHA frente a main | Preview no es publicación pública |
| Landing pública, sin tráfico | URL Inspection Google, fecha, Search Console por URL | No atribuirlo a demanda nula sin datos suficientes |
| Motor sin propuestas | Actions run real, secretos presentes, permisos y tabla seo_recommendations | CI verde no demuestra cron ejecutado |
| Keyword sin volumen | Fuente GSC o herramienta con datos verificables | Dejar hipótesis sin ranking ni demanda afirmada |
| Múltiples landings similares | URL, idioma e intención de búsqueda | Consolidar, no repetir keywords artificialmente |
| Clics calendario pero cero reservas | Calendly sync y crm_meetings reales | Clic no es reserva; reserva no es cliente |
| Competidor cambia texto | Fuente URL observada, fecha y robots | No asumir que subió en Google |
| Apex devuelve 307 | Domains en Vercel | Pasar a 308 permanente de forma segura, sin borrar dominio |

## 7. Comandos de control (desde la raíz del repo)

Node.js / web:
    npm ci
    npm run seo:test
    npm run lint
    npm run build
    node scripts/seo-health.mjs
    python3 scripts/seo-internal-links.py

Python 3.12 (tras instalar growth/requirements.txt):
    python -m pytest -q growth/tests
    python -m growth.src.cli seo-intelligence

La opción --write-proposals del último comando escribe solo recomendaciones y requiere credenciales backend en entorno seguro. No introducir claves en el código, logs o incidencias. Evitar ejecución manual con claves si se puede utilizar la workflow revisada.

## 8. Publicación, rollback y criterios de cierre

1. Revisar todos los cambios del PR y confirmar los dos checks del último SHA.
2. Confirmar cuota Vercel, main, configuración, credenciales presentes sin mostrar valores.
3. Fusionar una vez; confirmar un único deployment production READY para el nuevo SHA.
4. Auditar HTTP, robots, sitemap, canónicas, enlaces, JSON-LD, idiomas y rutas del CMI.
5. Probar Google URL Inspection de manera acotada; verificar datos exactos guardados.
6. Ejecutar motor semanal de propuestas; confirmar escritura y presentación en CMI sin publicación automática.
7. Confirmar Analytics, formularios y reservas; no inferir clientes del tráfico o clics.
8. Anotar resultados y errores. Para incidentes graves, rollback de Vercel a un SHA READY anterior y revalidar dominio.
9. Marcar OPERATIVO solo cuando exista prueba de despliegue, cron, workflow, datos y CMI. Eficacia comercial necesita semanas y evidencia posterior.

Este manual deberá actualizarse tras el piloto con fecha, SHA de producción real, capturas/resultados y acciones correctivas. No da por completada ninguna prueba que aún no se haya ejecutado.
