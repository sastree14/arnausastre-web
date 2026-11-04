-- SC-Analytics: immutable knowledge-article snapshots and reversible editorial queue.
-- Content pages/Next.js layout remain unchanged. No access granted to anonymous web clients.
CREATE TABLE IF NOT EXISTS public.seo_knowledge_revisions (
 revision_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 tenant_id text NOT NULL,
 content_id text NOT NULL,
 brief_id text,
 language text NOT NULL,
 revision_kind text NOT NULL CHECK(revision_kind IN ('baseline','before_update')),
 content_snapshot jsonb NOT NULL,
 recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS seo_knowledge_revisions_history ON public.seo_knowledge_revisions(tenant_id,content_id,revision_id DESC);
ALTER TABLE public.seo_knowledge_revisions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.seo_knowledge_revisions FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON public.seo_knowledge_revisions TO service_role;
GRANT USAGE,SELECT ON SEQUENCE public.seo_knowledge_revisions_revision_id_seq TO service_role;

CREATE TABLE IF NOT EXISTS public.seo_knowledge_editorial_drafts (
 draft_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id text NOT NULL DEFAULT 'sc-analytics' CHECK(tenant_id='sc-analytics'),
 content_id text NOT NULL,
 baseline_hash text NOT NULL CHECK(length(baseline_hash)=32),
 patch jsonb NOT NULL CHECK(jsonb_typeof(patch)='object' AND patch<>'{}'::jsonb),
 rationale text NOT NULL CHECK(length(btrim(rationale))>=20),
 evidence jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(evidence)='object'),
 status text NOT NULL DEFAULT 'ready' CHECK(status IN ('ready','processing','verifying','published','failed','rolled_back','review')),
 qa_reference text, baseline_revision_id bigint, published_hash text, last_error text,
 created_at timestamptz NOT NULL DEFAULT now(), claimed_at timestamptz,
 published_at timestamptz, verified_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(content_id) REFERENCES public.content_items(content_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS seo_knowledge_one_active ON public.seo_knowledge_editorial_drafts(tenant_id,content_id)
 WHERE status IN ('ready','processing','verifying');
CREATE INDEX IF NOT EXISTS seo_knowledge_queue ON public.seo_knowledge_editorial_drafts(status,created_at);
ALTER TABLE public.seo_knowledge_editorial_drafts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.seo_knowledge_editorial_drafts FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.seo_knowledge_editorial_drafts TO service_role;

CREATE OR REPLACE FUNCTION public.capture_seo_knowledge_revision()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
 IF OLD.tenant_id='sc-analytics' AND OLD.channel='website' AND OLD.content_type='article'
 AND OLD.status='published' AND
 (to_jsonb(OLD) IS DISTINCT FROM to_jsonb(NEW)) THEN
 INSERT INTO public.seo_knowledge_revisions
 (tenant_id,content_id,brief_id,language,revision_kind,content_snapshot)
 VALUES (OLD.tenant_id,OLD.content_id,OLD.brief_id,OLD.language,'before_update',to_jsonb(OLD));
 END IF;
 RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.claim_seo_knowledge_draft()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE d public.seo_knowledge_editorial_drafts%ROWTYPE;
BEGIN
 SELECT * INTO d FROM public.seo_knowledge_editorial_drafts
 WHERE status='ready' AND tenant_id='sc-analytics'
 ORDER BY created_at,draft_id LIMIT 1 FOR UPDATE SKIP LOCKED;
 IF NOT FOUND THEN RETURN NULL;END IF;
 UPDATE public.seo_knowledge_editorial_drafts SET status='processing',claimed_at=now(),updated_at=now() WHERE draft_id=d.draft_id;
 RETURN jsonb_build_object('draft_id',d.draft_id,'content_id',d.content_id,
 'baseline_hash',d.baseline_hash,'patch',d.patch,'rationale',d.rationale,'evidence',d.evidence);
END $function$;

CREATE OR REPLACE FUNCTION public.complete_seo_knowledge_draft(p_draft_id uuid, p_qa_reference text)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
 UPDATE public.seo_knowledge_editorial_drafts SET status='published',verified_at=now(),updated_at=now()
 WHERE draft_id=p_draft_id AND status='verifying' AND qa_reference=p_qa_reference;
 RETURN FOUND;
END $function$;

CREATE OR REPLACE FUNCTION public.fail_seo_knowledge_draft(p_draft_id uuid, p_reason text)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
 UPDATE public.seo_knowledge_editorial_drafts SET status='failed',last_error=left(p_reason,1500),updated_at=now()
 WHERE draft_id=p_draft_id AND status='processing';RETURN FOUND;
END $function$;

CREATE OR REPLACE FUNCTION public.publish_seo_knowledge_draft(p_draft_id uuid, p_qa_reference text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE d public.seo_knowledge_editorial_drafts%ROWTYPE;
 c public.content_items%ROWTYPE;rev bigint; h text; newmeta jsonb; newcritique jsonb;
BEGIN
 SELECT * INTO STRICT d FROM public.seo_knowledge_editorial_drafts WHERE draft_id=p_draft_id FOR UPDATE;
 IF d.status<>'processing' OR length(coalesce(p_qa_reference,''))<20 THEN RAISE EXCEPTION 'Not claimed or QA missing';END IF;
 IF NOT public.validate_seo_knowledge_patch(d.patch) THEN RAISE EXCEPTION 'Invalid editorial patch';END IF;
 SELECT * INTO STRICT c FROM public.content_items WHERE content_id=d.content_id AND tenant_id=d.tenant_id FOR UPDATE;
 IF c.status<>'published' OR c.content_type<>'article' OR c.channel<>'website'
 OR c.published_at IS NULL OR c.language NOT IN('es','en','ca')
 OR c.brief_id IS NULL OR c.brief_id !~ '^[a-zA-Z0-9_-]{1,180}$'
 THEN RAISE EXCEPTION 'Not an eligible published article'; END IF;
 SELECT public.seo_knowledge_hash(d.content_id) INTO h;
 IF h IS DISTINCT FROM d.baseline_hash THEN RAISE EXCEPTION 'Article changed since draft';END IF;
 newmeta=COALESCE(c.critique->'article_meta','{}'::jsonb);
 IF d.patch ? 'article_meta' THEN newmeta=newmeta || d.patch->'article_meta'; END IF;
 newcritique=COALESCE(c.critique,'{}'::jsonb) || jsonb_build_object('article_meta',newmeta);
 UPDATE public.content_items SET
 title=COALESCE(d.patch->>'title',c.title),
 body=COALESCE(d.patch->>'body',c.body),
 critique=newcritique,
 last_rewritten_at=now()
 WHERE content_id=d.content_id;
 SELECT revision_id INTO rev FROM public.seo_knowledge_revisions
 WHERE content_id=d.content_id AND revision_kind='before_update'
 ORDER BY revision_id DESC LIMIT 1;
 IF rev IS NULL THEN RAISE EXCEPTION 'Rollback snapshot missing'; END IF;
 SELECT public.seo_knowledge_hash(d.content_id) INTO h;
 UPDATE public.seo_knowledge_editorial_drafts SET status='verifying',qa_reference=p_qa_reference,
 baseline_revision_id=rev,published_hash=h,published_at=now(),updated_at=now()
 WHERE draft_id=p_draft_id;
 RETURN jsonb_build_object('draft_id',p_draft_id,'content_id',d.content_id,'new_hash',h,'revision_id',rev,'brief_id',c.brief_id,'language',c.language);
END $function$;

CREATE OR REPLACE FUNCTION public.recover_stale_seo_knowledge_drafts()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE d public.seo_knowledge_editorial_drafts%ROWTYPE; h text; n_restored integer:=0;n_failed integer:=0;
BEGIN
 FOR d IN SELECT * FROM public.seo_knowledge_editorial_drafts
 WHERE status='verifying' AND published_at<now()-interval '22 minutes'
 ORDER BY published_at FOR UPDATE SKIP LOCKED LOOP
 BEGIN
  SELECT public.restore_seo_knowledge_revision(d.baseline_revision_id,d.published_hash) INTO h;
  UPDATE public.seo_knowledge_editorial_drafts SET status='rolled_back',
  last_error='Worker interrupted after publication; restored previous article',
  updated_at=now() WHERE draft_id=d.draft_id;
  n_restored:=n_restored+1;
 EXCEPTION WHEN OTHERS THEN
  UPDATE public.seo_knowledge_editorial_drafts SET status='failed',
  last_error='CRITICAL: stopped after failed recovery; manual intervention needed',
  updated_at=now() WHERE draft_id=d.draft_id;
  n_failed:=n_failed+1;
 END;
 END LOOP;
 UPDATE public.seo_knowledge_editorial_drafts SET status='failed',
 last_error='Interrupted before publishing',updated_at=now()
 WHERE status='processing' AND claimed_at<now()-interval '25 minutes';
 RETURN jsonb_build_object('restored',n_restored,'needs_manual_review',n_failed);
END $function$;

CREATE OR REPLACE FUNCTION public.restore_seo_knowledge_revision(p_revision_id bigint, p_expected_hash text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE rev public.seo_knowledge_revisions%ROWTYPE;c public.content_items%ROWTYPE;h text;
BEGIN
 SELECT * INTO STRICT rev FROM public.seo_knowledge_revisions WHERE revision_id=p_revision_id;
 IF rev.tenant_id<>'sc-analytics' THEN RAISE EXCEPTION 'Unexpected tenant'; END IF;
 SELECT * INTO STRICT c FROM public.content_items
 WHERE content_id=rev.content_id AND tenant_id=rev.tenant_id FOR UPDATE;
 SELECT public.seo_knowledge_hash(c.content_id) INTO h;
 IF h IS DISTINCT FROM p_expected_hash THEN RAISE EXCEPTION 'Rollback version conflict';END IF;
 IF (rev.content_snapshot->>'content_id')<>c.content_id
 OR (rev.content_snapshot->>'language')<>c.language
 OR (rev.content_snapshot->>'brief_id') IS DISTINCT FROM c.brief_id
 THEN RAISE EXCEPTION 'Revision identity conflict';END IF;
 UPDATE public.content_items SET
 title=rev.content_snapshot->>'title',body=rev.content_snapshot->>'body',
 critique=rev.content_snapshot->'critique',last_rewritten_at=now()
 WHERE content_id=c.content_id;
 SELECT public.seo_knowledge_hash(c.content_id) INTO h;
 RETURN h;
END $function$;

CREATE OR REPLACE FUNCTION public.rollback_seo_knowledge_draft(p_draft_id uuid, p_reason text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE d public.seo_knowledge_editorial_drafts%ROWTYPE;h text;
BEGIN
 SELECT * INTO STRICT d FROM public.seo_knowledge_editorial_drafts WHERE draft_id=p_draft_id FOR UPDATE;
 IF d.status<>'verifying' OR d.baseline_revision_id IS NULL OR d.published_hash IS NULL
 THEN RAISE EXCEPTION 'Nothing to restore'; END IF;
 SELECT public.restore_seo_knowledge_revision(d.baseline_revision_id,d.published_hash) INTO h;
 UPDATE public.seo_knowledge_editorial_drafts SET status='rolled_back',
 last_error=left(p_reason,1500),updated_at=now() WHERE draft_id=p_draft_id;
 RETURN h;
END $function$;

CREATE OR REPLACE FUNCTION public.seo_knowledge_hash(p_content_id text)
 RETURNS text
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
SELECT md5(jsonb_build_object('title',c.title,'body',c.body,'critique',c.critique)::text)
FROM public.content_items c WHERE c.content_id=p_content_id AND c.tenant_id='sc-analytics'
AND c.channel='website' AND c.content_type='article' AND c.status='published'
$function$;

CREATE OR REPLACE FUNCTION public.validate_seo_knowledge_patch(p jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE k text; meta jsonb; val jsonb; entry jsonb;
BEGIN
 IF jsonb_typeof(p)<>'object' OR p='{}'::jsonb THEN RETURN false; END IF;
 FOR k IN SELECT jsonb_object_keys(p) LOOP
  IF k NOT IN ('title','body','article_meta') THEN RETURN false; END IF;
  IF k='title' AND (jsonb_typeof(p->k)<>'string' OR length(btrim(p->>k)) NOT BETWEEN 15 AND 200) THEN RETURN false;END IF;
  IF k='body' AND (jsonb_typeof(p->k)<>'string' OR length(btrim(p->>k)) NOT BETWEEN 600 AND 35000) THEN RETURN false;END IF;
  IF k='article_meta' THEN
   meta=p->k;
   IF jsonb_typeof(meta)<>'object' OR meta='{}'::jsonb THEN RETURN false;END IF;
   FOR k IN SELECT jsonb_object_keys(meta) LOOP
    IF k NOT IN ('seo_title','seo_description','excerpt','business_title','quick','business_steps','section_titles','seo_keywords') THEN RETURN false;END IF;
    val=meta->k;
    IF k IN ('seo_title','seo_description','excerpt','business_title') THEN
     IF jsonb_typeof(val)<>'string' OR length(btrim(val#>>'{}')) NOT BETWEEN 15 AND 800 THEN RETURN false;END IF;
    ELSE
     IF jsonb_typeof(val)<>'array' OR jsonb_array_length(val)>12 OR jsonb_array_length(val)<1 THEN RETURN false;END IF;
     IF k IN ('quick','business_steps') AND jsonb_array_length(val)>3 THEN RETURN false;END IF;
     FOR entry IN SELECT value FROM jsonb_array_elements(val) LOOP
      IF jsonb_typeof(entry)<>'string' OR length(btrim(entry#>>'{}')) NOT BETWEEN 3 AND 200 THEN RETURN false;END IF;
     END LOOP;
    END IF;
   END LOOP;
  END IF;
 END LOOP;
 RETURN true;
END $function$;

DROP TRIGGER IF EXISTS seo_knowledge_revision_capture ON public.content_items;
CREATE TRIGGER seo_knowledge_revision_capture
BEFORE UPDATE ON public.content_items FOR EACH ROW
EXECUTE FUNCTION public.capture_seo_knowledge_revision();

INSERT INTO public.seo_knowledge_revisions(tenant_id,content_id,brief_id,language,revision_kind,content_snapshot)
SELECT c.tenant_id,c.content_id,c.brief_id,c.language,'baseline',to_jsonb(c)
FROM public.content_items c
WHERE c.tenant_id='sc-analytics' AND c.channel='website' AND c.content_type='article'
AND c.status='published'
AND NOT EXISTS (SELECT 1 FROM public.seo_knowledge_revisions r
WHERE r.content_id=c.content_id AND r.tenant_id=c.tenant_id AND r.revision_kind='baseline');

REVOKE ALL ON FUNCTION public.capture_seo_knowledge_revision() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.capture_seo_knowledge_revision() TO service_role;
REVOKE ALL ON FUNCTION public.claim_seo_knowledge_draft() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_seo_knowledge_draft() TO service_role;
REVOKE ALL ON FUNCTION public.complete_seo_knowledge_draft(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.complete_seo_knowledge_draft(uuid,text) TO service_role;
REVOKE ALL ON FUNCTION public.fail_seo_knowledge_draft(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fail_seo_knowledge_draft(uuid,text) TO service_role;
REVOKE ALL ON FUNCTION public.publish_seo_knowledge_draft(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.publish_seo_knowledge_draft(uuid,text) TO service_role;
REVOKE ALL ON FUNCTION public.recover_stale_seo_knowledge_drafts() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.recover_stale_seo_knowledge_drafts() TO service_role;
REVOKE ALL ON FUNCTION public.restore_seo_knowledge_revision(bigint,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.restore_seo_knowledge_revision(bigint,text) TO service_role;
REVOKE ALL ON FUNCTION public.rollback_seo_knowledge_draft(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.rollback_seo_knowledge_draft(uuid,text) TO service_role;
REVOKE ALL ON FUNCTION public.seo_knowledge_hash(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.seo_knowledge_hash(text) TO service_role;
REVOKE ALL ON FUNCTION public.validate_seo_knowledge_patch(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.validate_seo_knowledge_patch(jsonb) TO service_role;
