-- SC-Analytics: schema for reversible editorial SEO drafts. Reproducible DDL.
CREATE TABLE IF NOT EXISTS public.seo_editorial_drafts (
 draft_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id text NOT NULL DEFAULT 'sc-analytics' CHECK(tenant_id='sc-analytics'),
 slug text NOT NULL CHECK(slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
 baseline_version integer NOT NULL CHECK(baseline_version>0),
 patch jsonb NOT NULL CHECK(jsonb_typeof(patch)='object' AND patch<>'{}'::jsonb),
 rationale text NOT NULL CHECK(length(btrim(rationale))>=20),
 evidence jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(evidence)='object'),
 status text NOT NULL DEFAULT 'ready' CHECK(status IN ('ready','processing','verifying','published','failed','rolled_back','review')),
 qa_reference text,baseline_revision_id bigint,published_version integer,last_error text,
 created_at timestamptz NOT NULL DEFAULT now(),claimed_at timestamptz,published_at timestamptz,
 verified_at timestamptz,updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,slug) REFERENCES public.seo_pages(tenant_id,slug)
);
CREATE UNIQUE INDEX IF NOT EXISTS seo_editorial_drafts_one_active_url ON public.seo_editorial_drafts(tenant_id,slug) WHERE status IN ('ready','processing','verifying');
CREATE INDEX IF NOT EXISTS seo_editorial_drafts_queue ON public.seo_editorial_drafts(status,created_at);
ALTER TABLE public.seo_editorial_drafts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.seo_editorial_drafts FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.seo_editorial_drafts TO service_role;

CREATE OR REPLACE FUNCTION public.claim_seo_editorial_draft()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE d public.seo_editorial_drafts%ROWTYPE;
BEGIN
 SELECT * INTO d FROM public.seo_editorial_drafts WHERE status='ready' AND tenant_id='sc-analytics'
 ORDER BY created_at,draft_id LIMIT 1 FOR UPDATE SKIP LOCKED;
 IF NOT FOUND THEN RETURN NULL; END IF;
 UPDATE public.seo_editorial_drafts SET status='processing',claimed_at=now(),updated_at=now()
 WHERE draft_id=d.draft_id;
 RETURN jsonb_build_object('draft_id',d.draft_id,'slug',d.slug,'baseline_version',d.baseline_version,
 'patch',d.patch,'rationale',d.rationale,'evidence',d.evidence);
END $function$;

CREATE OR REPLACE FUNCTION public.complete_seo_editorial_draft(p_draft_id uuid, p_qa_reference text)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
 UPDATE public.seo_editorial_drafts SET status='published',verified_at=now(),updated_at=now()
 WHERE draft_id=p_draft_id AND status='verifying' AND qa_reference=p_qa_reference; RETURN FOUND;
END $function$;

CREATE OR REPLACE FUNCTION public.fail_seo_editorial_draft(p_draft_id uuid, p_reason text)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
 UPDATE public.seo_editorial_drafts SET status='failed',last_error=left(p_reason,1500),updated_at=now()
 WHERE draft_id=p_draft_id AND status='processing';RETURN FOUND;
END $function$;

CREATE OR REPLACE FUNCTION public.publish_seo_editorial_draft(p_draft_id uuid, p_qa_reference text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE d public.seo_editorial_drafts%ROWTYPE; p public.seo_pages%ROWTYPE;
 n public.seo_pages%ROWTYPE; rev bigint; newv integer;
BEGIN
 SELECT * INTO STRICT d FROM public.seo_editorial_drafts WHERE draft_id=p_draft_id FOR UPDATE;
 IF d.status<>'processing' OR length(coalesce(p_qa_reference,''))<12 THEN
 RAISE EXCEPTION 'Not claimed or QA missing'; END IF;
 IF NOT public.validate_seo_editorial_patch(d.patch) THEN RAISE EXCEPTION 'Invalid patch'; END IF;
 SELECT * INTO STRICT p FROM public.seo_pages WHERE tenant_id='sc-analytics' AND slug=d.slug FOR UPDATE;
 IF p.status<>'published' OR p.version<>d.baseline_version THEN RAISE EXCEPTION 'Version or status conflict';END IF;
 SELECT * INTO n FROM jsonb_populate_record(p,d.patch);
 UPDATE public.seo_pages SET title=n.title,meta_description=n.meta_description,h1=n.h1,
 intro=n.intro,sections=n.sections,cta_title=n.cta_title,cta_body=n.cta_body,
 version=p.version+1,updated_at=now() WHERE seo_page_id=p.seo_page_id RETURNING version INTO newv;
 SELECT revision_id INTO rev FROM public.seo_page_revisions
 WHERE seo_page_id=p.seo_page_id AND recorded_version=p.version AND revision_kind='before_update'
 ORDER BY revision_id DESC LIMIT 1;
 IF rev IS NULL THEN RAISE EXCEPTION 'Rollback snapshot absent';END IF;
 UPDATE public.seo_editorial_drafts SET status='verifying',qa_reference=p_qa_reference,
 baseline_revision_id=rev,published_version=newv,published_at=now(),updated_at=now()
 WHERE draft_id=p_draft_id;
 RETURN jsonb_build_object('draft_id',p_draft_id,'slug',p.slug,'new_version',newv,'baseline_revision_id',rev);
END $function$;

CREATE OR REPLACE FUNCTION public.rollback_seo_editorial_draft(p_draft_id uuid, p_reason text)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE d public.seo_editorial_drafts%ROWTYPE; v integer;
BEGIN
 SELECT * INTO STRICT d FROM public.seo_editorial_drafts WHERE draft_id=p_draft_id FOR UPDATE;
 IF d.status<>'verifying' OR d.baseline_revision_id IS NULL OR d.published_version IS NULL
 THEN RAISE EXCEPTION 'Nothing to roll back'; END IF;
 SELECT public.restore_seo_page_revision(d.baseline_revision_id,d.published_version) INTO v;
 UPDATE public.seo_editorial_drafts SET status='rolled_back',
 last_error=left(p_reason,1500),updated_at=now() WHERE draft_id=p_draft_id;
 RETURN v;
END $function$;

CREATE OR REPLACE FUNCTION public.validate_seo_editorial_patch(p jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE k text; v jsonb;
BEGIN
 IF jsonb_typeof(p)<>'object' OR p='{}'::jsonb THEN RETURN false; END IF;
 FOR k IN SELECT jsonb_object_keys(p) LOOP
  IF k NOT IN ('title','meta_description','h1','intro','sections','cta_title','cta_body') THEN RETURN false;END IF;
  IF k='sections' THEN
   IF jsonb_typeof(p->k)<>'array' OR jsonb_array_length(p->k) NOT BETWEEN 1 AND 24 THEN RETURN false;END IF;
   FOR v IN SELECT value FROM jsonb_array_elements(p->k) LOOP
    IF jsonb_typeof(v)<>'object' OR NOT (v ? 'heading' AND v ? 'body')
      OR (SELECT count(*) FROM jsonb_object_keys(v))<>2
      OR jsonb_typeof(v->'heading')<>'string' OR jsonb_typeof(v->'body')<>'string'
      OR length(btrim(v->>'heading')) NOT BETWEEN 5 AND 180
      OR length(btrim(v->>'body')) NOT BETWEEN 30 AND 3000 THEN RETURN false;END IF;
   END LOOP;
  ELSE
   IF jsonb_typeof(p->k)<>'string' OR length(p->>k)>8000
     OR (k<>'cta_body' AND length(btrim(p->>k))<5) THEN RETURN false;END IF;
  END IF;
 END LOOP;
 RETURN true;
END $function$;
REVOKE ALL ON FUNCTION public.claim_seo_editorial_draft() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_seo_editorial_draft() TO service_role;
REVOKE ALL ON FUNCTION public.complete_seo_editorial_draft(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.complete_seo_editorial_draft(uuid,text) TO service_role;
REVOKE ALL ON FUNCTION public.fail_seo_editorial_draft(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fail_seo_editorial_draft(uuid,text) TO service_role;
REVOKE ALL ON FUNCTION public.publish_seo_editorial_draft(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.publish_seo_editorial_draft(uuid,text) TO service_role;
REVOKE ALL ON FUNCTION public.rollback_seo_editorial_draft(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.rollback_seo_editorial_draft(uuid,text) TO service_role;
REVOKE ALL ON FUNCTION public.validate_seo_editorial_patch(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.validate_seo_editorial_patch(jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.recover_stale_seo_editorial_drafts()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE d public.seo_editorial_drafts%ROWTYPE; restored integer;
        n_reverted integer:=0;n_failed integer:=0;
BEGIN
 FOR d IN SELECT * FROM public.seo_editorial_drafts WHERE tenant_id='sc-analytics'
 AND status='verifying' AND published_at<now()-interval '22 minutes'
 ORDER BY published_at FOR UPDATE SKIP LOCKED LOOP
  BEGIN
   SELECT public.restore_seo_page_revision(d.baseline_revision_id,d.published_version)
    INTO restored;
   UPDATE public.seo_editorial_drafts SET status='rolled_back',
    last_error='Runner interrupted before verification; restored automatically',
    updated_at=now() WHERE draft_id=d.draft_id;
   n_reverted:=n_reverted+1;
  EXCEPTION WHEN OTHERS THEN
   UPDATE public.seo_editorial_drafts SET status='failed',
    last_error='CRITICAL: automatic restore of stale version failed; manual check required',
    updated_at=now() WHERE draft_id=d.draft_id;
   n_failed:=n_failed+1;
  END;
 END LOOP;
 UPDATE public.seo_editorial_drafts SET status='failed',
 last_error='Preflight runner interrupted before publishing',updated_at=now()
 WHERE tenant_id='sc-analytics' AND status='processing'
 AND claimed_at<now()-interval '25 minutes';
 RETURN jsonb_build_object('restored',n_reverted,'needs_manual_review',n_failed);
END $function$
;
REVOKE ALL ON FUNCTION public.recover_stale_seo_editorial_drafts() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.recover_stale_seo_editorial_drafts() TO service_role;
