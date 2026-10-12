create or replace function public.mcp_approve_publication(p_content_id text)
returns jsonb language plpgsql set search_path to 'public','pg_temp' as $function$
declare
 v_before public.content_items%rowtype;
 v_after public.content_items%rowtype;
 v_action text;
begin
 if not private.mcp_is_authorized() then raise exception 'MCP access denied' using errcode='42501'; end if;
 select * into v_before from public.content_items where content_id=p_content_id and tenant_id='sc-analytics' for update;
 if not found then raise exception 'Publication % not found',p_content_id using errcode='P0002'; end if;
 if v_before.status='published' then raise exception 'Publication is already published'; end if;
 v_action:=case when v_before.content_type='article' then 'publish_article' when v_before.content_type='linkedin_article' then 'publish_linkedin_article' else 'publish_post' end;
 update public.approvals set status='approved',decided_at=now()
 where tenant_id='sc-analytics' and target_id=p_content_id and action_type=v_action and status in ('pending','rejected','approved');
 if not found then
  insert into public.approvals(approval_id,tenant_id,action_type,target_id,summary,status,payload,created_at,decided_at)
  values('approval_'||replace(gen_random_uuid()::text,'-',''),'sc-analytics',v_action,p_content_id,'Explicit MCP editorial approval: '||v_before.title,'approved',jsonb_build_object('source','explicit_chat_instruction','decided_from','mcp'),now(),now());
 end if;
 update public.content_items set status=case when scheduled_at>now() then 'scheduled' else 'approved' end
 where content_id=p_content_id returning * into v_after;
 insert into public.mcp_action_log(tool_name,action,target_type,target_id,before_state,after_state)
 values('approve_publication','approve','content_item',p_content_id,to_jsonb(v_before),to_jsonb(v_after));
 return jsonb_build_object('before',to_jsonb(v_before),'after',to_jsonb(v_after));
end;
$function$;
grant select on public.approvals to authenticated;
grant update(status,decided_at) on public.approvals to authenticated;
grant insert(approval_id,tenant_id,action_type,target_id,summary,status,payload,created_at,decided_at) on public.approvals to authenticated;
create policy mcp_editorial_approval_read on public.approvals for select to authenticated using (tenant_id='sc-analytics' and private.mcp_is_authorized());
create policy mcp_editorial_approval_decide on public.approvals for update to authenticated using (tenant_id='sc-analytics' and action_type in ('publish_article','publish_post','publish_linkedin_article','publish_editorial') and private.mcp_is_authorized()) with check (tenant_id='sc-analytics' and action_type in ('publish_article','publish_post','publish_linkedin_article','publish_editorial') and private.mcp_is_authorized());
create policy mcp_editorial_approval_create on public.approvals for insert to authenticated with check (tenant_id='sc-analytics' and action_type in ('publish_article','publish_post','publish_linkedin_article','publish_editorial') and status='approved' and private.mcp_is_authorized());
