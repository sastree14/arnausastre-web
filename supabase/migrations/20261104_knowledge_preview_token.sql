-- Authorize article draft previews with a short-lived random token hash.
CREATE OR REPLACE FUNCTION public.set_seo_knowledge_preview_token(p_draft_id uuid, p_sha256 text)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
 IF p_sha256 IS NULL OR p_sha256 !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'Invalid preview token hash';END IF;
 UPDATE public.seo_knowledge_editorial_drafts SET qa_reference=p_sha256,updated_at=now()
 WHERE draft_id=p_draft_id AND tenant_id='sc-analytics' AND status='processing'
 AND claimed_at > now()-interval '10 minutes';
 RETURN FOUND;
END $function$
;
REVOKE ALL ON FUNCTION public.set_seo_knowledge_preview_token(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.set_seo_knowledge_preview_token(uuid,text) TO service_role;
