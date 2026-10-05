create or replace function public.mcp_update_publication(
  p_content_id text, p_title text default null, p_body text default null, p_hashtags jsonb default null
) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare
  v_before public.content_items%rowtype;
  v_after public.content_items%rowtype;
  v_now timestamptz:=now();
begin
  if not private.mcp_is_authorized() then raise exception 'MCP access denied' using errcode='42501'; end if;
  select * into v_before from public.content_items where content_id=p_content_id and tenant_id='sc-analytics' for update;
  if not found then raise exception 'Publication % not found',p_content_id using errcode='P0002'; end if;
  if v_before.status='published' then raise exception 'Published content must be unpublished before editing'; end if;
  if p_title is null and p_body is null and p_hashtags is null then raise exception 'At least one editable field is required'; end if;
  update public.content_items set
    title=coalesce(nullif(trim(p_title),''),title),
    body=coalesce(nullif(trim(p_body),''),body),
    hashtags=coalesce(p_hashtags,hashtags),
    status='needs_review',
    scheduled_at=null,
    last_rewritten_at=v_now,
    critique=coalesce(critique,'{}'::jsonb)||jsonb_build_object('mcp_edited_at',v_now,'automatic_review_stale',true)
  where content_id=p_content_id returning * into v_after;
  insert into public.mcp_action_log(tool_name,action,target_type,target_id,before_state,after_state)
  values('update_publication','update','content_item',p_content_id,to_jsonb(v_before),to_jsonb(v_after));
  return jsonb_build_object('before',to_jsonb(v_before),'after',to_jsonb(v_after));
end; $$;

create or replace function public.mcp_approve_publication(p_content_id text)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare v_before public.content_items%rowtype; v_after public.content_items%rowtype;
begin
  if not private.mcp_is_authorized() then raise exception 'MCP access denied' using errcode='42501'; end if;
  select * into v_before from public.content_items where content_id=p_content_id and tenant_id='sc-analytics' for update;
  if not found then raise exception 'Publication % not found',p_content_id using errcode='P0002'; end if;
  if v_before.status='published' then raise exception 'Publication is already published'; end if;
  update public.content_items set status='approved',scheduled_at=null where content_id=p_content_id returning * into v_after;
  insert into public.mcp_action_log(tool_name,action,target_type,target_id,before_state,after_state)
  values('approve_publication','approve','content_item',p_content_id,to_jsonb(v_before),to_jsonb(v_after));
  return jsonb_build_object('before',to_jsonb(v_before),'after',to_jsonb(v_after));
end; $$;

create or replace function public.mcp_schedule_publication(p_content_id text,p_scheduled_at timestamptz)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare v_before public.content_items%rowtype; v_after public.content_items%rowtype;
begin
  if not private.mcp_is_authorized() then raise exception 'MCP access denied' using errcode='42501'; end if;
  select * into v_before from public.content_items where content_id=p_content_id and tenant_id='sc-analytics' for update;
  if not found then raise exception 'Publication % not found',p_content_id using errcode='P0002'; end if;
  if v_before.status not in ('approved','scheduled') then raise exception 'Publication must be approved before scheduling. Current status: %',v_before.status; end if;
  if p_scheduled_at is null then raise exception 'scheduled_at is required'; end if;
  update public.content_items set status='scheduled',scheduled_at=p_scheduled_at where content_id=p_content_id returning * into v_after;
  insert into public.mcp_action_log(tool_name,action,target_type,target_id,before_state,after_state)
  values('schedule_publication','schedule','content_item',p_content_id,to_jsonb(v_before),to_jsonb(v_after));
  return jsonb_build_object('before',to_jsonb(v_before),'after',to_jsonb(v_after));
end; $$;

create or replace function public.mcp_archive_publications(p_content_ids text[],p_reason text default 'CRM cleanup')
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare
  v_id text;
  v_before public.content_items%rowtype;
  v_after public.content_items%rowtype;
  v_results jsonb:='[]'::jsonb;
  v_now timestamptz:=now();
begin
  if not private.mcp_is_authorized() then raise exception 'MCP access denied' using errcode='42501'; end if;
  if coalesce(array_length(p_content_ids,1),0)=0 then raise exception 'At least one content_id is required'; end if;
  if array_length(p_content_ids,1)>100 then raise exception 'A maximum of 100 publications can be archived per call'; end if;
  foreach v_id in array p_content_ids loop
    select * into v_before from public.content_items where content_id=v_id and tenant_id='sc-analytics' for update;
    if not found then raise exception 'Publication % not found',v_id using errcode='P0002'; end if;
    if v_before.status='published' then raise exception 'Published publication % cannot be archived',v_id; end if;
    update public.content_items set
      status='archived',
      scheduled_at=null,
      critique=coalesce(critique,'{}'::jsonb)||jsonb_build_object(
        'mcp_archived_at',v_now,
        'mcp_archive_reason',coalesce(nullif(trim(p_reason),''),'CRM cleanup'),
        'mcp_previous_status',v_before.status
      )
    where content_id=v_id returning * into v_after;
    insert into public.mcp_action_log(tool_name,action,target_type,target_id,before_state,after_state,metadata)
    values('archive_publications','archive','content_item',v_id,to_jsonb(v_before),to_jsonb(v_after),
      jsonb_build_object('reason',coalesce(nullif(trim(p_reason),''),'CRM cleanup')));
    v_results:=v_results||jsonb_build_array(jsonb_build_object('content_id',v_id,'status',v_after.status));
  end loop;
  return jsonb_build_object('archived',v_results);
end; $$;

create or replace function public.mcp_restore_publication(p_content_id text)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare v_before public.content_items%rowtype; v_after public.content_items%rowtype; v_status text;
begin
  if not private.mcp_is_authorized() then raise exception 'MCP access denied' using errcode='42501'; end if;
  select * into v_before from public.content_items where content_id=p_content_id and tenant_id='sc-analytics' for update;
  if not found then raise exception 'Publication % not found',p_content_id using errcode='P0002'; end if;
  if v_before.status<>'archived' then raise exception 'Only archived publications can be restored'; end if;
  v_status:=coalesce(nullif(v_before.critique->>'mcp_previous_status',''),'needs_review');
  if v_status in ('published','scheduled') then v_status:='needs_review'; end if;
  update public.content_items set
    status=v_status,
    critique=coalesce(critique,'{}'::jsonb)-'mcp_archived_at'-'mcp_archive_reason'-'mcp_previous_status'
  where content_id=p_content_id returning * into v_after;
  insert into public.mcp_action_log(tool_name,action,target_type,target_id,before_state,after_state)
  values('restore_publication','restore','content_item',p_content_id,to_jsonb(v_before),to_jsonb(v_after));
  return jsonb_build_object('before',to_jsonb(v_before),'after',to_jsonb(v_after));
end; $$;

revoke all on function public.mcp_update_publication(text,text,text,jsonb) from public,anon;
revoke all on function public.mcp_approve_publication(text) from public,anon;
revoke all on function public.mcp_schedule_publication(text,timestamptz) from public,anon;
revoke all on function public.mcp_archive_publications(text[],text) from public,anon;
revoke all on function public.mcp_restore_publication(text) from public,anon;
grant execute on function public.mcp_update_publication(text,text,text,jsonb) to authenticated;
grant execute on function public.mcp_approve_publication(text) to authenticated;
grant execute on function public.mcp_schedule_publication(text,timestamptz) to authenticated;
grant execute on function public.mcp_archive_publications(text[],text) to authenticated;
grant execute on function public.mcp_restore_publication(text) to authenticated;
