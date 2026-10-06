create or replace function public.mcp_create_opportunity(
  p_name text,
  p_source text default 'manual',
  p_value numeric default 0,
  p_currency text default 'EUR',
  p_probability numeric default 0,
  p_next_action_at timestamptz default null,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path=public,pg_temp
as $$
declare
  v_id text := 'opportunity_' || replace(gen_random_uuid()::text,'-','');
  v_row public.crm_opportunities%rowtype;
begin
  if not private.mcp_is_authorized() then raise exception 'MCP access denied' using errcode='42501'; end if;
  if nullif(trim(p_name),'') is null then raise exception 'name is required'; end if;
  if p_value < 0 then raise exception 'value must be non-negative'; end if;
  if p_probability < 0 or p_probability > 100 then raise exception 'probability must be between 0 and 100'; end if;
  v_id := left(v_id,24);
  insert into public.crm_opportunities(
    opportunity_id,tenant_id,company_id,primary_person_id,source_content_id,source_signal_id,
    name,stage,value,currency,probability,source,next_action_at,metadata,created_at,updated_at
  ) values(
    v_id,'sc-analytics',null,null,null,null,trim(p_name),'new',coalesce(p_value,0),
    coalesce(nullif(trim(p_currency),''),'EUR'),coalesce(p_probability,0),
    coalesce(nullif(trim(p_source),''),'manual'),p_next_action_at,coalesce(p_metadata,'{}'::jsonb),now(),now()
  ) returning * into v_row;
  insert into public.mcp_action_log(tool_name,action,target_type,target_id,before_state,after_state)
  values('create_opportunity','create','crm_opportunity',v_id,null,to_jsonb(v_row));
  return to_jsonb(v_row);
end;
$$;

create or replace function public.mcp_create_meeting(
  p_title text,
  p_starts_at timestamptz,
  p_notes text default null,
  p_provider text default 'manual'
)
returns jsonb
language plpgsql
security invoker
set search_path=public,pg_temp
as $$
declare
  v_id text := 'meeting_' || replace(gen_random_uuid()::text,'-','');
  v_row public.crm_meetings%rowtype;
begin
  if not private.mcp_is_authorized() then raise exception 'MCP access denied' using errcode='42501'; end if;
  if nullif(trim(p_title),'') is null then raise exception 'title is required'; end if;
  if p_starts_at is null then raise exception 'starts_at is required'; end if;
  v_id := left(v_id,20);
  insert into public.crm_meetings(
    meeting_id,tenant_id,company_id,person_id,opportunity_id,provider,external_id,
    starts_at,status,booking_url,metadata,created_at
  ) values(
    v_id,'sc-analytics',null,null,null,coalesce(nullif(trim(p_provider),''),'manual'),'',
    p_starts_at,'scheduled','',jsonb_build_object('event_name',trim(p_title),'notes',coalesce(p_notes,'')),now()
  ) returning * into v_row;
  insert into public.mcp_action_log(tool_name,action,target_type,target_id,before_state,after_state)
  values('create_meeting','create','crm_meeting',v_id,null,to_jsonb(v_row));
  return to_jsonb(v_row);
end;
$$;

revoke all on function public.mcp_create_opportunity(text,text,numeric,text,numeric,timestamptz,jsonb) from public,anon;
revoke all on function public.mcp_create_meeting(text,timestamptz,text,text) from public,anon;
grant execute on function public.mcp_create_opportunity(text,text,numeric,text,numeric,timestamptz,jsonb) to authenticated;
grant execute on function public.mcp_create_meeting(text,timestamptz,text,text) to authenticated;
