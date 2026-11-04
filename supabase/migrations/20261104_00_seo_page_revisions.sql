-- Existing reversible snapshots for every published service page.
CREATE TABLE IF NOT EXISTS public.seo_page_revisions (
 revision_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 tenant_id text NOT NULL,
 seo_page_id text NOT NULL,
 slug text NOT NULL,
 recorded_version integer NOT NULL,
 revision_kind text NOT NULL CHECK(revision_kind IN ('baseline','created','before_update','before_delete')),
 page_snapshot jsonb NOT NULL,
 recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS seo_page_revisions_history_idx ON public.seo_page_revisions(tenant_id,seo_page_id,revision_id DESC);
ALTER TABLE public.seo_page_revisions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.seo_page_revisions FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON public.seo_page_revisions TO service_role;
GRANT USAGE,SELECT ON SEQUENCE public.seo_page_revisions_revision_id_seq TO service_role;

CREATE OR REPLACE FUNCTION public.record_seo_page_revision()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.seo_page_revisions
    (tenant_id,seo_page_id,slug,recorded_version,revision_kind,page_snapshot)
    VALUES (NEW.tenant_id,NEW.seo_page_id,NEW.slug,NEW.version,'created',to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF to_jsonb(OLD) IS DISTINCT FROM to_jsonb(NEW) THEN
      INSERT INTO public.seo_page_revisions
      (tenant_id,seo_page_id,slug,recorded_version,revision_kind,page_snapshot)
      VALUES (OLD.tenant_id,OLD.seo_page_id,OLD.slug,OLD.version,'before_update',to_jsonb(OLD));
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.seo_page_revisions
    (tenant_id,seo_page_id,slug,recorded_version,revision_kind,page_snapshot)
    VALUES (OLD.tenant_id,OLD.seo_page_id,OLD.slug,OLD.version,'before_delete',to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'Unexpected SEO page trigger operation %',TG_OP;
END $function$;

CREATE OR REPLACE FUNCTION public.restore_seo_page_revision(p_revision_id bigint, p_expected_current_version integer)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  saved public.seo_page_revisions%ROWTYPE;
  previous public.seo_pages%ROWTYPE;
  current_version integer;
  new_version integer;
BEGIN
  SELECT * INTO STRICT saved
  FROM public.seo_page_revisions WHERE revision_id=p_revision_id;
  IF saved.tenant_id <> 'sc-analytics' THEN
    RAISE EXCEPTION 'Unrecognized SEO tenant';
  END IF;
  SELECT p.version INTO STRICT current_version FROM public.seo_pages p
  WHERE p.seo_page_id=saved.seo_page_id AND p.tenant_id=saved.tenant_id
    AND p.slug=saved.slug FOR UPDATE;
  IF current_version <> p_expected_current_version THEN
    RAISE EXCEPTION 'Version conflict: expected %, actual %',p_expected_current_version,current_version;
  END IF;
  SELECT * INTO previous FROM jsonb_populate_record(NULL::public.seo_pages,saved.page_snapshot);
  IF previous.seo_page_id IS DISTINCT FROM saved.seo_page_id OR previous.slug IS DISTINCT FROM saved.slug
     OR previous.tenant_id IS DISTINCT FROM saved.tenant_id THEN
    RAISE EXCEPTION 'Snapshot identity conflict';
  END IF;
  UPDATE public.seo_pages p SET
    primary_keyword=previous.primary_keyword,
    secondary_keywords=previous.secondary_keywords,
    search_intent=previous.search_intent,
    title=previous.title,
    meta_description=previous.meta_description,
    h1=previous.h1,
    intro=previous.intro,
    sections=previous.sections,
    cta_title=previous.cta_title,
    cta_body=previous.cta_body,
    internal_links=previous.internal_links,
    status=previous.status,
    source=previous.source,
    published_at=previous.published_at,
    content_locale=previous.content_locale,
    hub_key=previous.hub_key,
    version=current_version+1,
    updated_at=now()
  WHERE p.seo_page_id=saved.seo_page_id AND p.tenant_id=saved.tenant_id
  RETURNING p.version INTO new_version;
  RETURN new_version;
EXCEPTION WHEN NO_DATA_FOUND THEN
  RAISE EXCEPTION 'SEO revision or current page not found';
END $function$;

REVOKE ALL ON FUNCTION public.record_seo_page_revision() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.restore_seo_page_revision(bigint,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_seo_page_revision() TO service_role;
GRANT EXECUTE ON FUNCTION public.restore_seo_page_revision(bigint,integer) TO service_role;
DROP TRIGGER IF EXISTS seo_pages_revision_capture ON public.seo_pages;
CREATE TRIGGER seo_pages_revision_capture AFTER INSERT OR UPDATE OR DELETE ON public.seo_pages FOR EACH ROW EXECUTE FUNCTION public.record_seo_page_revision();
INSERT INTO public.seo_page_revisions (tenant_id,seo_page_id,slug,recorded_version,revision_kind,page_snapshot)
SELECT p.tenant_id,p.seo_page_id,p.slug,p.version,'baseline',to_jsonb(p)
FROM public.seo_pages p WHERE p.tenant_id='sc-analytics'
AND NOT EXISTS (SELECT 1 FROM public.seo_page_revisions r
WHERE r.seo_page_id=p.seo_page_id AND r.tenant_id=p.tenant_id AND r.revision_kind IN ('baseline','created'));
