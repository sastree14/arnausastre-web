# SEO comercial multilingüe — fase de ejecución

**Fecha:** 21/10/2026 · **Rama:** `feature/seo-growth-foundation-20261021` · **PR:** #80

## Resultado de esta sesión

- Creadas **10 landing pages comerciales en estado `draft`** dentro de `public.seo_pages`, tenant `sc-analytics`. **No son públicas; no se han incluido en el sitemap.**
- Seis páginas ES: `consultoria-datos`, `prediccion-demanda`, `automatizacion-ia-empresas`, `optimizacion-operaciones`, `optimizacion-inventario`, `analitica-datos-empresas`.
- Cuatro páginas CA: `consultoria-dades`, `previsio-demanda`, `consultoria-intelligencia-artificial`, `optimitzacio-empresarial`.
- Las 10 páginas tienen cuatro apartados con contenido específico, introducción propia, metatítulo, metadescripción, CTA y tres enlaces internos. SQL de validación: **10/10** estructuras completas, introducción mínima 243 caracteres, metadescripción mínima 135 caracteres, todas enlazadas al contacto.
- No se han cambiado las URLs de las 29 keywords activas. Las 16 referencias pendientes **siguen apuntando a los destinos antiguos hasta que publique una versión comercial válida**.
- `lib/seo-service-locales.ts`: asignación explícita de equivalencias EN/ES/CA. `app/services/[slug]/page.tsx`: metadatos, JSON-LD `inLanguage`, locale OpenGraph y `hreflang` **solo si el destino existe publicado**. Mismo componente y mismas clases de la web anterior; los textos de 'Services' y CTA se adaptan al idioma del artículo publicado.
- `scripts/tests/seo-service-locales.test.mjs`: prueba correspondencias, reciprocidad y exclusión de borradores. `npm run seo:test` **12/12**, `npm run build` **OK**, verificados en sandbox.
- Enlace del CTA de servicios a `/contact?ref=service:<slug>` y persistencia de la fuente de consulta en `website_inquiries.source_path`. No se añade ninguna cookie, campo visual ni identificador persistente de navegación.

## Correspondencias comerciales

| Grupo | EN publicado | ES borrador | CA borrador |
| --- | --- | --- | --- |
| Data Science | /services/data-science-consulting | /services/consultoria-datos | /services/consultoria-dades |
| Forecasting | /services/demand-forecasting | /services/prediccion-demanda | /services/previsio-demanda |
| Automatización IA | /services/ai-automation | /services/automatizacion-ia-empresas | /services/consultoria-intelligencia-artificial |
| Optimización general | /services/operations-research | /services/optimizacion-operaciones | /services/optimitzacio-empresarial |
| Inventario | /services/inventory-optimization | /services/optimizacion-inventario | — |
| Business intelligence | /services/business-intelligence | /services/analitica-datos-empresas | — |

**Por qué no hay 16 páginas nuevas:** los demás targets en castellano son variantes semánticas del mismo servicio (por ejemplo, `agentes de IA para empresas`, `consultoría inteligencia artificial`, `inteligencia artificial para pymes`). Los cinco grupos comerciales deberán cubrir esas consultas mediante contenidos diferenciados y un único destino natural. No crear doorway pages.

## Publicación: pasos y condiciones

1. Comprobar el despliegue preview de la rama en Vercel. Un preview protegido por SSO no es accesible con curl anónimo; no tomar la página de login de Vercel como prueba de funcionamiento.
2. Verificar SSR con datos reales o mocks equivalentes: cada versión tiene canónica propia, etiquetas hreflang recíprocas solo si publicada, JSON-LD correcto y mismo layout.
3. Confirmar visualmente que las rutas existentes conservan su diseño. **Cero CSS/Tailwind modificado**.
4. Completar tests y E2E de consentimiento/contacto sin insertar leads ficticios.
5. Hacer merge del PR #80 solo cuando esté validado y se compruebe un despliegue `READY`.
6. Publicar entonces las 10 páginas aprobadas mediante cambios controlados de `draft` a `published` (actualizando `published_at` y `updated_at`), no antes. No tocar las 13 páginas EN existentes.
7. Actualizar las 16 `seo_keyword_targets.target_path` para que apunten a destinos publicados según su intención; comprobar 29/29 cobertura y que el sitemap/hreflang incluyan solo páginas accesibles.
8. Ejecutar auditor de sitemap y enlaces y volver a sincronizar GSC tras un periodo de rastreo. No garantizar indexación ni ranking.

## Auditoría y métricas

- Primaria: Search Console (clics/impresiones de marca y sin marca, página/query/país).
- Atribución de navegación hasta formulario: parámetro opcional `ref=service:<slug>` validado localmente y almacenado en el campo existente. Un lead no equivale automáticamente a una reunión de Calendly; el CRM deberá separar ambos.
- Semrush gratuito para rastreo posterior, sin contratar prueba de pago.

**Consulta del estado actual:**
```sql
select slug,status,title,length(intro) intro_length,jsonb_array_length(sections) sections
from public.seo_pages
where tenant_id='sc-analytics' and source='seo_localized_curated_draft'
order by slug;
```

**Siguiente punto:** E2E de las rutas comerciales en preview protegido o con servidor de Supabase simulado, y auditoría de frontend. Después, preparar actualización controlada de targets y publicación.
