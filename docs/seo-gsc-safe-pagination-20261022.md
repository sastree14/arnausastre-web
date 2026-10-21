# SC-Analytics — Search Console paginado y ventana de reporting

**Fecha:** 2026-10-22.  
**Rama:** `feat/seo-search-console-safe-pagination-20261022`.

## Problema resuelto

El CMI leía Search Console con una sola solicitud REST `limit=5000`. PostgREST puede limitar el máximo de filas de una respuesta (por ejemplo, 1000), sin que ese hecho sea evidente en la interfaz. La tabla de `search_console_daily` ya contiene **898 filas**, por lo que la lectura estaba próxima a truncarse. Una auditoría SEO no debe interpretar datos parcialmente cargados como completos.

## Solución

- `lib/seo-postgrest-pagination.ts`: paginador general, acotado por número de lotes, que avisa `truncated=true` si se agota el máximo configurado.
- `lib/seo-search-console.ts`: solo obtiene las columnas necesarias de Search Console de los últimos **90 días**, usando `limit=500`, `offset` y ordenación por fecha e impresiones. Tope excepcional 12 lotes / 6000 registros; la UI avisa si se alcanza, **no oculta el recorte**.
- `app/growth-admin/seo/page.tsx`: utiliza resultados recientes y muestra **—** ante un fallo de lectura en lugar de 0; señala cuándo los totales de consultas no incluyen todas las observaciones.
- Los datos continúan siendo privados del CMI, sin modificar web pública ni cookies. La comparación de 28 vs 28 días se calcula con el último día de GSC realmente importado.

## Pruebas

- `npm run seo:test`: **29/29** (3 nuevas pruebas de lectura de 1250 filas, límite de 1000 y parámetros inválidos).
- `npm run lint`: **0 errores**, 18 advertencias preexistentes.
- `npm run build`: **OK**, portada y contacto continúan estáticos.

## Limitaciones y siguiente paso

- No se puede determinar solo con GSC si Google ha indexado todas las nuevas URLs: consultar cobertura de indexación en Search Console y esperar un plazo razonable tras la publicación.
- El número de consultas sin marca observables puede excluir búsquedas anonimizadas de Google.
- La integración de Calendly requiere confirmar el cron diario real y que los datos de reserva estén actualizados. El panel evita informar cero reservas sin una sincronización reciente.
- La redirección apex → www aún presenta 307 desde la configuración del dominio en Vercel. Requiere actualización puntual de `redirectStatusCode=308` mediante la configuración de dominio; no eliminar/recrear dominio ni tocar DNS de forma destructiva.
