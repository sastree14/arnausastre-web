-- Fix article_meta merge precedence; preserve every field outside a draft patch.
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
 IF d.patch ? 'article_meta' THEN newmeta=newmeta || (d.patch->'article_meta'); END IF;
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
END $function$
;
REVOKE ALL ON FUNCTION public.publish_seo_knowledge_draft(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.publish_seo_knowledge_draft(uuid,text) TO service_role;
