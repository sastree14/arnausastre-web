-- Website publishing changes persisted state; it makes no external network request.
-- Invoker rights: only the existing privileged cron owner can execute this job.
create or replace function editorial_private.publish_due_knowledge(p_dry_run boolean default false)
returns jsonb language plpgsql set search_path='' as $$
declare
 v_item public.content_items%rowtype;
 v_count integer;
 v_ready integer;
 v_before jsonb;
 v_after jsonb;
 v_results jsonb := '[]'::jsonb;
 v_time timestamptz := now();
begin
 for v_item in
  select * from public.content_items
  where tenant_id='sc-analytics' and content_type='article' and channel='website'
   and content_id ~ '^knowledge_kb_[0-9]{3}_es$'
   and status='scheduled' and scheduled_at is not null and scheduled_at<=v_time
  order by scheduled_at,content_id limit 10 for update skip locked
 loop
  perform 1 from public.content_items where tenant_id='sc-analytics'
   and brief_id=v_item.brief_id and content_type='article' and channel='website' for update;
  select count(*),count(*) filter(where
   c.language in ('es','ca','en') and c.status='scheduled'
   and c.scheduled_at is not null and c.scheduled_at<=v_time
   and length(trim(coalesce(c.body,'')))>0
   and c.critique->>'contract_valid'='true'
   and coalesce(jsonb_array_length(c.critique->'contract_issues'),0)=0
   and (coalesce(c.critique->'article_meta'->>'freshness','evergreen')='evergreen'
     or coalesce(c.last_rewritten_at,c.created_at)>v_time-interval '150 days')
   and exists(select 1 from public.approvals a where a.tenant_id='sc-analytics'
    and a.target_id=c.content_id and a.action_type='publish_article' and a.status='approved'))
  into v_count,v_ready
  from public.content_items c where c.tenant_id='sc-analytics'
   and c.brief_id=v_item.brief_id and c.content_type='article' and c.channel='website';
  if v_count<>3 or v_ready<>3 or
   (select count(distinct language) from public.content_items where tenant_id='sc-analytics'
    and brief_id=v_item.brief_id and content_type='article' and channel='website')<>3 then
   v_results:=v_results||jsonb_build_array(jsonb_build_object('content_id',v_item.content_id,'status','blocked','reason','Incomplete, unapproved, not due or stale family'));
   continue;
  end if;
  if p_dry_run then
   v_results:=v_results||jsonb_build_array(jsonb_build_object('content_id',v_item.content_id,'status','ready','family_size',3));
   continue;
  end if;
  select jsonb_agg(to_jsonb(c)) into v_before from public.content_items c
   where c.tenant_id='sc-analytics' and c.brief_id=v_item.brief_id and c.channel='website' and c.content_type='article';
  update public.content_items set status='published',published_at=v_time,scheduled_at=null,
   external_post_url='/knowledge/'||brief_id||'/'||language
  where tenant_id='sc-analytics' and brief_id=v_item.brief_id and content_type='article' and channel='website';
  update public.approvals set status='executed',executed_at=v_time
  where tenant_id='sc-analytics' and action_type='publish_article' and status='approved'
   and target_id in(select content_id from public.content_items where tenant_id='sc-analytics'
    and brief_id=v_item.brief_id and content_type='article' and channel='website');
  select jsonb_agg(to_jsonb(c)) into v_after from public.content_items c
   where c.tenant_id='sc-analytics' and c.brief_id=v_item.brief_id and c.channel='website' and c.content_type='article';
  insert into public.mcp_action_log(user_id,tool_name,action,target_type,target_id,before_state,after_state,metadata)
   select user_id,'publish_due_knowledge','publish','article_family',v_item.brief_id,v_before,v_after,jsonb_build_object('source','supabase_cron','scheduled_at',v_item.scheduled_at)
   from public.mcp_action_log where target_id=v_item.content_id and tool_name='approve_publication' order by created_at desc limit 1;
  v_results:=v_results||jsonb_build_array(jsonb_build_object('content_id',v_item.content_id,'status','published','family_size',3));
 end loop;
 return v_results;
end;
$$;
revoke all on function editorial_private.publish_due_knowledge(boolean) from public,anon,authenticated;


select cron.schedule('sc-knowledge-publisher','* * * * *','select editorial_private.publish_due_knowledge(false);');
