# SC-Analytics · Control visual previo a la publicación SEO

**Estado:** implementación aislada, NO desplegada. Este módulo no modifica el diseño, el contenido público ni la configuración de Vercel.

## Motivación

La mayoría de las 23 páginas comerciales actuales se renderizan desde \`public.seo_pages\` en Supabase mediante \`app/services/[slug]/page.tsx\`. Guardar un borrador directamente en esa tabla lo haría público antes de comprobar sus márgenes, tarjetas, tipografía y responsive. La Preview habitual de Vercel tampoco aislaría por sí sola esa edición de base de datos: la Preview puede consultar el mismo Supabase.

Por eso, el validador crea una **Preview editorial efímera dentro del navegador**: abre una URL real de servicio, toma una captura y a continuación simula el texto futuro en el DOM de esa misma página, usando las mismas clases y componentes. **No escribe en Supabase ni realiza despliegues.**

## Ejecutar sin GitHub Actions

Entorno Python aislado, sin credenciales de escritura:

\`\`\`bash
python -m pip install -r scripts/requirements-visual-qa.txt
python -m playwright install chromium
python scripts/seo_visual_qa.py \
  --url https://www.sc-analytics.io/services/inventory-optimization \
  --draft /ruta/privada/borrador.json \
  --out /ruta/privada/informe-visual
\`\`\`

El JSON puede incluir los campos \`title\`, \`meta_description\`, \`h1\`, \`intro\`, \`cta_title\`, \`cta_body\` y \`sections\`. El campo \`sections\` debe ser la lista completa de apartados con objetos \`{"heading":"...","body":"..."}\`. Se rechazan otras claves; los cambios de links, rutas, markup o estilos necesitan otros controles.

El informe se guarda fuera del repositorio público: \`report.json\` más seis capturas, «antes» y «después» para móvil (375 px), tablet (768 px) y escritorio (1440 px). La salida es código 0 solo si los tres tamaños pasan. Las capturas se conservan para revisión visual adicional.

El script comprueba ausencia de desbordamientos horizontales, clipping de texto, solapamientos de apartados/tarjetas y cambios en los estilos computados de elementos base. Al añadir secciones clona la plantilla visual existente y mantiene la alternancia de fondos. Se admite que el contenido nuevo crezca verticalmente.

## Protocolo para publicaciones autónomas

1. Recuperar métricas y redactar un borrador basado en la página actual, respetando el estilo editorial ES/CA/EN.
2. Guardar versión anterior y verificar su recuperación en \`seo_page_revisions\` (la existencia del número \`version\` NO basta).
3. Ejecutar preflight visual y auditoría SEO/factual sobre el borrador. Si el navegador no puede abrir la URL o el módulo detecta una regresión, **bloquear** publicación.
4. Si pasa, y el cambio está dentro de la autorización editorial, aplicar el contenido en Supabase con control de versión y registrar la modificación.
5. Reabrir la URL pública y comprobar que está servida la versión nueva, que no hay errores HTTP, y comparar otra vez estructura y capturas.
6. Si aparece un fallo, restaurar la última revisión válida mediante procedimiento servidor restringido; registrar incidencia.
7. Comparar métricas SEO posteriores sobre ventanas suficientemente largas; no confundir correlación con causalidad.

## Alcance y pendientes

- **Implementado en la rama:** validador de páginas de detalle \`/services/<slug>\` y simulación de borradores sin publicar.
- **No implementado:** validadores específicos para artículos \`/knowledge\`, hubs, \`/projects\` y rutas que usan otras plantillas, verificador de \`internal_links\`, comparación de Preview de *código* contra producción y orquestación transaccional completa de la publicación. No declarar autopublicación habilitada para estas rutas.
- Para modificar código de presentación o introducir nuevos componentes, una simulación del DOM NO basta; hay que compilar un entorno aislado y comparar el render real de Preview y producción. El diseño de SC-Analytics permanece protegido.
- **Antes de ponerlo operativo** hay que ejecutarlo sobre una URL accesible en el mismo entorno donde correrá el agente. Las URLs de Preview de Vercel pueden exigir autenticación: no saltarse la protección.
- La prueba geométrica automática no equivale a garantía estética absoluta: para cambios significativos conservar siempre capturas para revisión contextual.

Este módulo se instala sin cambiar componentes de la web ni lanzar despliegues de producción.
