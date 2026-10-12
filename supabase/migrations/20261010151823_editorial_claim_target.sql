drop function if exists public.editorial_claim_due();
create or replace function public.editorial_claim_due(p_content_id text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare chosen text; claim uuid; result jsonb;
begin
  -- An interrupted request may have reached LinkedIn: never retry it blindly.
  update public.editorial_publication_jobs set state=case when request_sent_at is null then 'failed' else 'uncertain' end,
  last_error='Worker interrupted; inspect LinkedIn before retrying',updated_at=now()
  where state='publishing' and claimed_at<now()-interval '10 minutes';
  select j.content_id into chosen from public.editorial_publication_jobs j join public.content_items c using(content_id)
  where j.state in ('scheduled','failed') and j.attempts<3 and c.status in ('scheduled','approved')
  and c.scheduled_at is not null and c.scheduled_at<=now() and c.external_post_id is null
  and (j.next_attempt_at is null or j.next_attempt_at<=now())
  and (p_content_id is null or j.content_id=p_content_id)
  and exists(select 1 from public.approvals a where a.target_id=c.content_id and a.action_type='publish_editorial' and a.status='approved')
  order by c.scheduled_at for update of j skip locked limit 1;
  if chosen is null then return null; end if;
  claim=extensions.gen_random_uuid();
  update public.editorial_publication_jobs set state='publishing',claim_id=claim,claimed_at=now(),request_sent_at=null,attempts=attempts+1,updated_at=now() where content_id=chosen;
  select jsonb_build_object('claim_id',claim,'item',to_jsonb(c)) into result from public.content_items c where content_id=chosen;
  return result;
end $$;
revoke all on function public.editorial_claim_due(text) from public,anon,authenticated;
grant execute on function public.editorial_claim_due(text) to service_role;




