-- SC-Analytics localized SEO service launch, 2026-10-21.
-- Run ONLY after PR #80 is merged and verified READY on Vercel.
-- This changes existing SEO target paths and makes ten reviewed service pages public.
-- Not an automated workflow. Execute transaction once via Supabase connector.
BEGIN;

DO $validation$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM public.seo_pages
  WHERE tenant_id='sc-analytics' AND source='seo_localized_curated_draft'
    AND status='draft'
    AND slug IN ('consultoria-datos','prediccion-demanda','automatizacion-ia-empresas',
                 'optimizacion-operaciones','optimizacion-inventario','analitica-datos-empresas',
                 'consultoria-dades','previsio-demanda','consultoria-intelligencia-artificial',
                 'optimitzacio-empresarial')
    AND length(title) BETWEEN 15 AND 80
    AND length(meta_description) BETWEEN 70 AND 175
    AND length(intro)>=100
    AND jsonb_array_length(sections)>=4;
  IF n<>10 THEN
    RAISE EXCEPTION 'Launch halted: expected ten validated SEO drafts, found %',n;
  END IF;
END $validation$;

UPDATE public.seo_pages
SET status='published',
    source='seo_localized_curated_reviewed',
    published_at=now(),
    updated_at=now(),
    version=version+1
WHERE tenant_id='sc-analytics' AND source='seo_localized_curated_draft'
  AND status='draft'
  AND slug IN ('consultoria-datos','prediccion-demanda','automatizacion-ia-empresas',
               'optimizacion-operaciones','optimizacion-inventario','analitica-datos-empresas',
               'consultoria-dades','previsio-demanda','consultoria-intelligencia-artificial',
               'optimitzacio-empresarial');

-- Consolidate synonyms of the SAME buyer intent instead of generating near-
-- identical doorway pages. Retain all 29 target keywords, just repair paths.
UPDATE public.seo_keyword_targets SET
 target_path = CASE keyword
   WHEN 'consultoría de datos' THEN '/services/consultoria-datos'
   WHEN 'consultoría data science' THEN '/services/consultoria-datos'
   WHEN 'data science para pymes' THEN '/services/consultoria-datos'
   WHEN 'empresa data science' THEN '/services/consultoria-datos'
   WHEN 'consultoria de dades' THEN '/services/consultoria-dades'
   WHEN 'analítica de datos para empresas' THEN '/services/analitica-datos-empresas'
   WHEN 'predicción de demanda' THEN '/services/prediccion-demanda'
   WHEN 'forecasting de ventas' THEN '/services/prediccion-demanda'
   WHEN 'automatización con IA para empresas' THEN '/services/automatizacion-ia-empresas'
   WHEN 'consultoría inteligencia artificial' THEN '/services/automatizacion-ia-empresas'
   WHEN 'agentes de IA para empresas' THEN '/services/automatizacion-ia-empresas'
   WHEN 'inteligencia artificial para pymes' THEN '/services/automatizacion-ia-empresas'
   WHEN 'consultoria intel·ligència artificial' THEN '/services/consultoria-intelligencia-artificial'
   WHEN 'optimización de inventario' THEN '/services/optimizacion-inventario'
   WHEN 'optimización de operaciones' THEN '/services/optimizacion-operaciones'
   WHEN 'optimització empresarial' THEN '/services/optimitzacio-empresarial'
   ELSE target_path
 END,
 updated_at=now()
WHERE tenant_id='sc-analytics' AND status='active'
  AND keyword IN (
   'consultoría de datos','consultoría data science','data science para pymes',
   'empresa data science','consultoria de dades','analítica de datos para empresas',
   'predicción de demanda','forecasting de ventas',
   'automatización con IA para empresas','consultoría inteligencia artificial',
   'agentes de IA para empresas','inteligencia artificial para pymes',
   'consultoria intel·ligència artificial',
   'optimización de inventario','optimización de operaciones','optimització empresarial'
  );

DO $coverage$
DECLARE n integer; missing integer;
BEGIN
  SELECT count(*) INTO n FROM public.seo_keyword_targets
    WHERE tenant_id='sc-analytics' AND status='active';
  SELECT count(*) INTO missing
    FROM public.seo_keyword_targets k
    WHERE k.tenant_id='sc-analytics' AND k.status='active'
    AND NOT EXISTS (
      SELECT 1 FROM public.seo_pages p
      WHERE p.tenant_id=k.tenant_id AND p.status='published'
        AND '/services/'||p.slug=k.target_path
    );
  IF n<>29 OR missing<>0 THEN
    RAISE EXCEPTION 'Launch rollback: active target count %, missing destination count %',n,missing;
  END IF;
END $coverage$;

COMMIT;
