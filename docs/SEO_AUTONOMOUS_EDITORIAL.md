# SC-Analytics — circuito SEO autónomo con protección visual

## Qué existe
- Tarea ChatGPT: **Estrategia SEO semanal SC-Analytics**, jueves 10:00 Europe/Madrid; investiga métricas/competencia, selecciona cambios y prepara borradores.
- Supervisión SEO diaria, Search Console, GA4, y auditorías existentes (no se sustituyen).
- Supabase `seo_page_revisions`: copias históricas e instrumento `restore_seo_page_revision` restringido.
- Supabase `seo_editorial_drafts`: cola privada para artículos de **servicios existentes** (`/services/<slug>`). Solo funciones servidor autorizadas pueden pasar un borrador de `ready` a `processing`, `verifying` y `published`.
- `scripts/seo_visual_qa.py`: simula el nuevo contenido usando el DOM y las clases existentes, sin tocar la base de datos. Navegador real a 375, 768, 1440 px.
- `scripts/seo_editorial_autopublish.py`: toma un borrador listo, valida versión y visual, publica con una operación transaccional; comprueba DOM y capturas después de publicar. En caso de fallo, llama a rollback. Ante una interrupción, recupera publicaciones en estado `verifying` antiguo.
- `.github/workflows/seo-editorial-autopublish.yml`: ejecución diaria en la rama principal. GitHub Actions lee los mismos secretos `SUPABASE_URL` y `SUPABASE_SECRET_KEY` utilizados por el proceso SEO semanal existente, nunca los muestra en los logs. Para repositorios públicos se pueden usar runners estándar gratuitos, sujetos a las políticas de GitHub.

## Flujo de extremo a extremo

1. Obtener datos recientes GSC/GA4 y seleccionar una página con oportunidad real. Leer los contenidos y mantener voz e idiomas.
2. Crear un registro en `seo_editorial_drafts` con `slug`, `baseline_version`, `patch`, `rationale` y `evidence`. `patch` debe contener solo propiedades editoriales entre `title,meta_description,h1,intro,sections,cta_title,cta_body`. `sections` es la lista **completa** de objetos `{heading,body}`, no solo las filas nuevas.
3. La ejecución programada reclama un borrador `ready` y comprueba que la versión pública sigue siendo la misma.
4. Playwright abre la página real, simula el texto, compara estructura/estilos/overflow y captura el antes y el después en tres viewports. Falla = no publicar.
5. RPC transaccional escribe los campos permitidos en `seo_pages`, incrementa versión y registra la revisión previa.
6. Playwright abre de nuevo la página publicada, comprueba cada bloque y compara capturas contra el resultado previsto. Falla = restaurar; éxito = `published`.
7. Actualizar CMI/informe de la tarea y reevaluar las métricas SEO con ventanas de 28–56 días, sin atribución causal no justificada.

## Ejemplo de cola

```sql
INSERT INTO public.seo_editorial_drafts
(slug,baseline_version,patch,rationale,evidence)
SELECT p.slug,p.version,
 '{"h1":"New, carefully checked headline for the existing service"}'::jsonb,
 'Propuesta validada con consultas relevantes y posicionamiento, sin cambiar diseño ni servicios.',
 '{"source":"GSC","window_days":28,"assessed_by":"seo_agent"}'::jsonb
FROM public.seo_pages p
WHERE p.tenant_id='sc-analytics' AND p.slug='inventory-optimization';
```

Es solo un **ejemplo**: no ejecutar sobre producción sin una mejora editorial real y evidencia.

## Controles no negociables

- Solo trabaja con URLs de servicios ya existentes. **NO** toca CSS, Tailwind, JSX visual, fuentes, paleta, tarjetas, estructura global, slugs, redirecciones, servicios, precios ni condiciones.
- No utiliza modelos pagados ni genera backlinks de forma artificial.
- Antes de publicar comprueba que el DOM existente está intacto y el borrador no desborda o solapa elementos. La altura de las secciones puede crecer, conservando estilos.
- Una PR/Preview de Vercel que consulte Supabase de producción **no** aísla borradores editoriales. Por eso se simula el texto en navegador antes de guardarlo.
- La comprobación posterior devuelve el texto anterior si algo falla. Si falla incluso el rollback, se bloquea la ejecución posterior y se señala como incidencia crítica.
- El job toma un borrador por ejecución para no mezclar experimentos. No hay cambios automáticos si no hay borradores justificados.

## Límites expresos

No se ha habilitado publicación autónoma para artículos generados de Conocimiento, que residen en otra tabla y usan otra plantilla, ni para modificaciones de código de presentación o enlaces internos complejos. Estos requieren validadores específicos. No afirmar cobertura total de cualquier URL o variable SEO. El objetivo es una expansión segura de la autonomía, nunca saltar las pruebas.

Los cambios de diseño requerirían una decisión independiente del propietario; no forman parte de esta autorización.
