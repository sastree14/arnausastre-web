-- Commercial proof links: reuse *existing* public portfolio implementations.
-- Does not rewrite case studies or claim unverified outcomes.
-- Does not change any page/CSS template or add a new web route.
-- Idempotent: the same case link is not inserted twice.
--
-- Reviewed 2026-10-22. Execute only if all 23 service slugs and
-- portfolio paths have been verified. No NIF/address/PII.
BEGIN;

CREATE TEMP TABLE seo_proof_link_batch (
  service_slug text PRIMARY KEY,
  project_slug text NOT NULL,
  label text NOT NULL
) ON COMMIT DROP;

INSERT INTO seo_proof_link_batch (service_slug,project_slug,label) VALUES
    ('ai-automation','ai-workflow-automation-hub','See an AI automation case'),
    ('analitica-datos-empresas','power-bi-executive-decision-system','Ver caso de analítica'),
    ('automatizacion-ia-empresas','ai-sales-crm-automation','Ver caso de automatización'),
    ('business-intelligence','power-bi-executive-decision-system','See a BI case'),
    ('consultoria-dades','r-shiny-decision-app','Veure cas de decisions'),
    ('consultoria-datos','banking-risk-decision-system','Ver caso de ciencia de datos'),
    ('consultoria-intelligencia-artificial','long-running-agent-platform','Veure cas d''agents d''IA'),
    ('data-engineering','etl-elt-data-quality-pipeline','See a data engineering case'),
    ('data-science-consulting','banking-risk-decision-system','See a data science case'),
    ('demand-forecasting','ecommerce-demand-forecasting','See the forecasting case'),
    ('demand-planning','ecommerce-demand-forecasting','See the demand planning case'),
    ('inventory-optimization','supply-chain-optimization','See an optimization case'),
    ('logistics-optimization','supply-chain-optimization','See a supply-chain case'),
    ('machine-learning-consulting','banking-risk-decision-system','See an ML decision case'),
    ('operations-research','operations-simulation-what-if','See the simulation case'),
    ('optimitzacio-empresarial','operations-simulation-what-if','Veure cas de simulació'),
    ('optimizacion-inventario','supply-chain-optimization','Ver caso de optimización'),
    ('optimizacion-operaciones','operations-simulation-what-if','Ver caso de simulación'),
    ('prediccion-demanda','ecommerce-demand-forecasting','Ver caso de forecasting'),
    ('previsio-demanda','ecommerce-demand-forecasting','Veure cas de previsió'),
    ('pricing-optimization','pricing-revenue-optimization','See the pricing case'),
    ('route-optimization','supply-chain-optimization','See an optimization case'),
    ('supply-chain-analytics','supply-chain-optimization','See a supply-chain case');

DO $verify$
DECLARE n int; missing int;
BEGIN
  SELECT count(*) INTO n FROM seo_proof_link_batch;
  IF n<>23 THEN RAISE EXCEPTION 'Expected 23 vetted service links, got %',n; END IF;
  SELECT count(*) INTO missing FROM seo_proof_link_batch b
  LEFT JOIN public.seo_pages p
    ON p.tenant_id='sc-analytics' AND p.slug=b.service_slug AND p.status='published'
  WHERE p.slug IS NULL;
  IF missing<>0 THEN RAISE EXCEPTION 'Missing published services: %',missing; END IF;
END $verify$;

UPDATE public.seo_pages p
SET internal_links=jsonb_insert(
  coalesce(p.internal_links,'[]'::jsonb),
  '{0}',
  jsonb_build_object('href','/projects/'||b.project_slug,'label',b.label),
  true
),updated_at=now()
FROM seo_proof_link_batch b
WHERE p.tenant_id='sc-analytics'
  AND p.status='published'
  AND p.slug=b.service_slug
  AND NOT EXISTS(
    SELECT 1 FROM jsonb_array_elements(coalesce(p.internal_links,'[]'::jsonb)) existing
    WHERE existing->>'href'='/projects/'||b.project_slug
  );

DO $check$
DECLARE missing int;
BEGIN
  SELECT count(*) INTO missing
  FROM seo_proof_link_batch b
  JOIN public.seo_pages p
    ON p.tenant_id='sc-analytics' AND p.status='published' AND p.slug=b.service_slug
  WHERE NOT EXISTS(
    SELECT 1 FROM jsonb_array_elements(coalesce(p.internal_links,'[]'::jsonb)) element
    WHERE element->>'href'='/projects/'||b.project_slug
  );
  IF missing>0 THEN RAISE EXCEPTION 'Missing proof links after update: %',missing; END IF;
END $check$;

COMMIT;
