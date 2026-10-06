create or replace function public.mcp_update_company(
  p_company_id text,p_status text default null,p_notes text default null,p_recommended_service text default null,
  p_recommended_offer text default null,p_score numeric default null,p_score_reason text default null
) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare v_before public.companies%rowtype; v_after public.companies%rowtype;
begin
  if not private.mcp_is_authorized() then raise exception 'MCP access denied' using errcode='42501'; end if;
  select * into v_before from public.companies where company_id=p_company_id and tenant_id='sc-analytics' for update;
  if not found then raise exception 'Company % not found',p_company_id using errcode='P0002'; end if;
  if p_status is null and p_notes is null and p_recommended_service is null and p_recommended_offer is null and p_score is null and p_score_reason is null then
    raise exception 'At least one editable field is required';
  end if;
  if p_score is not null and (p_score<0 or p_score>100) then raise exception 'score must be between 0 and 100'; end if;
  update public.companies set
    status=coalesce(nullif(trim(p_status),''),status),
    notes=coalesce(p_notes,notes),
    recommended_service=coalesce(p_recommended_service,recommended_service),
    recommended_offer=coalesce(p_recommended_offer,recommended_offer),
    score=coalesce(p_score,score),
    score_reason=coalesce(p_score_reason,score_reason)
  where company_id=p_company_id returning * into v_after;
  insert into public.mcp_action_log(tool_name,action,target_type,target_id,before_state,after_state)
  values('update_company','update','company',p_company_id,to_jsonb(v_before),to_jsonb(v_after));
  return jsonb_build_object('before',to_jsonb(v_before),'after',to_jsonb(v_after));
end; $$;

create or replace function public.mcp_update_opportunity(
  p_opportunity_id text,p_stage text default null,p_value numeric default null,p_probability numeric default null,
  p_next_action_at timestamptz default null,p_name text default null,p_metadata jsonb default null
) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare v_before public.crm_opportunities%rowtype; v_after public.crm_opportunities%rowtype;
begin
  if not private.mcp_is_authorized() then raise exception 'MCP access denied' using errcode='42501'; end if;
  select * into v_before from public.crm_opportunities where opportunity_id=p_opportunity_id and tenant_id='sc-analytics' for update;
  if not found then raise exception 'Opportunity % not found',p_opportunity_id using errcode='P0002'; end if;
  if p_stage is null and p_value is null and p_probability is null and p_next_action_at is null and p_name is null and p_metadata is null then
    raise exception 'At least one editable field is required';
  end if;
  if p_probability is not null and (p_probability<0 or p_probability>100) then raise exception 'probability must be between 0 and 100'; end if;
  if p_value is not null and p_value<0 then raise exception 'value must be non-negative'; end if;
  update public.crm_opportunities set
    stage=coalesce(nullif(trim(p_stage),''),stage),
    value=coalesce(p_value,value),
    probability=coalesce(p_probability,probability),
    next_action_at=coalesce(p_next_action_at,next_action_at),
    name=coalesce(nullif(trim(p_name),''),name),
    metadata=case when p_metadata is null then metadata else coalesce(metadata,'{}'::jsonb)||p_metadata end,
    updated_at=now()
  where opportunity_id=p_opportunity_id returning * into v_after;
  insert into public.mcp_action_log(tool_name,action,target_type,target_id,before_state,after_state)
  values('update_opportunity','update','crm_opportunity',p_opportunity_id,to_jsonb(v_before),to_jsonb(v_after));
  return jsonb_build_object('before',to_jsonb(v_before),'after',to_jsonb(v_after));
end; $$;

revoke all on function public.mcp_update_company(text,text,text,text,text,numeric,text) from public,anon;
revoke all on function public.mcp_update_opportunity(text,text,numeric,numeric,timestamptz,text,jsonb) from public,anon;
grant execute on function public.mcp_update_company(text,text,text,text,text,numeric,text) to authenticated;
grant execute on function public.mcp_update_opportunity(text,text,numeric,numeric,timestamptz,text,jsonb) to authenticated;
