> **Revisión del 22/10/2026:** la definición inicial de «sin marca» era demasiado amplia e incluía abreviaturas ambiguas como `sc data`. Los números de esta página reflejan la metodología histórica original. La clasificación conservadora actual y sus cifras revisadas están en [seo-search-query-classification-20261022.md](./seo-search-query-classification-20261022.md): **90 → 8 impresiones estrictamente no branded**, cero clics en ambas ventanas, 4 → 18 impresiones ambiguas. No usar 94 → 27 como indicador actual sin explicar la revisión.

# SC-Analytics SEO: punto de partida de búsquedas no branded

**Estado:** publicado mediante PR #84 (`4eb5a0a95c2c825beeeb5b17157f5f3f8220d745`), Vercel READY. Auditor SEO de producción posterior: **93 páginas, 0 errores y 0 advertencias**; 98 destinos internos, 0 enlaces rotos.

**Fecha de análisis:** 2026-10-21.  
**Último día importado desde Search Console:** 2026-10-18.  
**Origen:** `public.search_console_daily`, tenant `sc-analytics`.

## Qué se ha implementado

- `lib/seo-organic-trends.ts`: compara dos ventanas consecutivas de 28 días **ancladas en la última fecha de Search Console importada**, no en el día actual (Google informa con retraso).
- Excluye consultas de marca como `SC-Analytics`, `SC Analytics` y `scanalytics`, además de filas sin consulta identificable.
- Cuenta impresiones y clics disponibles; `reportedDays` muestra la cobertura de días con registros para no confundir ausencia de importación con ausencia de impresiones.
- `app/growth-admin/seo/page.tsx` muestra comparación y variación porcentual en el CMI privado, respetando el diseño público.
- El resultado **no es el total absoluto de tráfico orgánico**: Search Console puede ocultar consultas anonimizadas o agruparlas.

## Línea base antes de que Google evalúe las nuevas páginas

| Periodo | Fechas | Clics no branded | Impresiones no branded | Días con registros |
|---|---|---:|---:|---:|
| Anterior | 2026-08-24 a 2026-09-20 | 0 | 94 | 21 |
| Más reciente | 2026-09-21 a 2026-10-18 | 0 | 27 | 26 |

Variación de impresiones observables: **−71,3 %**. No interpretar automáticamente como pérdida de negocio: son volúmenes muy reducidos y dependen de las consultas que Search Console proporciona. **Las diez nuevas páginas comerciales ES/CA se publicaron el 21/10/2026, después de esta ventana**; por tanto esta comparación **no mide su impacto**.

## Aceptación y próximos pasos

- [x] Cálculo independiente de la fecha local, tolerante a días sin registros y a ausencia de histórico.
- [x] Pruebas de exclusión de marca y periodos exactos, incluidas ventanas sin datos.
- [x] `npm run seo:test`: **19/19**.
- [x] `npm run lint`: **0 errores**, 18 advertencias preexistentes.
- [x] `npm run build`: correcto y home/contact siguen estáticas.
- [ ] Confirmar en Google Search Console que las diez nuevas URLs se hayan descubierto/indexado.
- [ ] Volver a medir tras varias semanas; registrar resultados de *query+page*, no solo impresiones globales.
- [ ] Usar consultas sin marca que tengan impresiones reales para seleccionar la próxima mejora de contenido; evitar producir landings automáticas sin intención diferente.
- [ ] Relacionar ese tráfico con formularios y reservas confirmadas, no con clics de enlace de calendario.

**No se contrató ninguna herramienta ni se cambió el diseño visual de la web.**
