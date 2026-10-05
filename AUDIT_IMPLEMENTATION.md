# Implementación de la auditoría comercial y de UI

Rama: `audit/commercial-ui-2026-10-05`. Base: `main`, commit `5d26fce3ec420ae24a2ea61f5ae011f624823045`.

## Qué cambia

- Inicio orientado a cuatro problemas: planificación, operaciones, automatización y decisiones con datos. Evidencia, método, colaboración y contacto en una secuencia más corta.
- Paleta de marca, tipografía Inter/Playfair, contenedores de 1280 px, medidas de lectura y espaciado compartidos. Cabecera con marca legible, estados de idioma y menú accesibles. Movimiento reducido y enlace de salto al contenido.
- Servicios con problema, entregable y criterios de validación. Se conservan los 13 slugs existentes y se añaden entradas especializadas. Las páginas nuevas publicadas en el CMS siguen disponibles en inglés; las otras versiones redirigen si no existe traducción.
- About con fundador, formación y responsabilidades. Partner con priorización, entregas, coordinación y límites de alcance.
- Portfolio identificado como demostración técnica con datos sintéticos. Las métricas numéricas sin respaldo se sustituyen por criterios verificables. SC-12 incluye fuente versionada, seis observaciones evaluadas, modelo base y gráfico del backtest reproducible. El diagrama distingue arquitectura documentada de la parte demostrada por el ejemplo.
- Escenarios económicos explícitamente ilustrativos. El 5 % se aplica al inventario total; capital circulante liberado no equivale a beneficio.
- Artículos con Markdown completo, párrafos definidos en el contenido, autoría editorial, fecha y tiempo de lectura. Se retiran generalizaciones de retornos y plazos sin fuente. Los ejemplos no atribuidos se presentan como ilustrativos. El índice muestra extractos y oculta áreas vacías.
- Rutas nativas `/es`, `/ca`, `/en`; las rutas históricas de artículos mantienen el idioma como sufijo. HTML, metadatos y contenido coinciden. Canonical `www`, hreflang, sitemap con fichas completas y Open Graph por idioma. Las URLs anteriores redirigen.
- Analítica optativa: Google Analytics no se carga antes de aceptar. Aceptar/rechazar son igualmente visibles y el pie permite cambiar la decisión. Eventos sin campos del formulario ni query strings personales.
- Contacto con enlace directo a la llamada de 30 min, empresa opcional, información de privacidad, estados accesibles, validación de tipo/tamaño/origen, honeypot y protección de frecuencia por instancia. Identificador estable por envío para evitar duplicados de CRM en reintentos normales. El éxito significa consulta guardada; si falla SMTP se indica una vía directa alternativa.
- Instalación reproducible: lockfile sincronizado y dependencias del renderizador Markdown añadidas.

## Validación

```bash
npm ci
npm run lint
npm run test
npm run build
npm run test:smoke
```

TypeScript y build de producción correctos. Tres pruebas de contratos de rutas y validación de formulario. Smoke de producción: 39 comprobaciones de páginas localizadas, 297 URLs del sitemap, redirecciones, 404, Markdown, tres imágenes OG y solicitudes de contacto inválidas. No se ha enviado ningún mensaje real ni modificado una consulta de producción.

El lint conserva avisos existentes en componentes administrativos y antiguos. Las anclas de navegación administrativa y OAuth se mantienen como cargas completas, con una excepción específica de la regla de navegación; las páginas públicas siguen usando enlaces de Next.

## Revisión local

Node 22.18+ o 24 (las pruebas usan soporte nativo de TypeScript de Node). Dependencias instaladas y probadas con Node 24.

```bash
git fetch origin
git switch audit/commercial-ui-2026-10-05
npm ci
npm run dev
```

Abrir `http://localhost:3000/es`. También `/ca` y `/en`. Los servicios del catálogo y los artículos del repositorio funcionan sin credenciales de producción.

## Aspectos que necesitan el entorno o información del titular

- Para probar la recepción real de consultas: Supabase/CRM y SMTP configurados. Las notificaciones SMTP fallidas permanecen pendientes de revisión operativa en el CRM; no se ha añadido una cola de reintentos. El límite de solicitudes es por instancia: una protección distribuida se configura en el firewall del despliegue.
- Los textos de privacidad describen el flujo implementado. El aviso legal debe completarse con domicilio y datos fiscales/registrales que correspondan al titular y revisar los acuerdos de proveedores antes de publicar. No se inventan estos datos.
- Los ejemplos del portfolio no sustituyen casos de cliente autorizados, testimonios ni fotografías/profiles de otras personas del equipo. Podrán incorporarse cuando existan datos verificables y permiso.
- No se han medido tráfico, conversiones, Core Web Vitals de campo ni posiciones en Search Console. Las mejoras de funnel necesitan medición tras publicarse.
- El navegador remoto bloquea localhost en esta sesión. Las comprobaciones HTTP se realizan contra el servidor local de producción; la revisión gráfica se hace en la vista previa de la rama cuando esté disponible.

No se ha fusionado la rama con `main` ni se ha promovido ningún despliegue a producción.
