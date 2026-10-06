create table if not exists public.sc_operational_activities (
  activity_id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'sc-analytics',
  user_id uuid not null default auth.uid(),
  occurred_at timestamptz not null default now(),
  activity_type text not null,
  channel text,
  entity_type text,
  entity_id text,
  title text not null,
  summary text,
  status text,
  source_url text,
  next_action_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.sc_followups (
  followup_id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'sc-analytics',
  user_id uuid not null default auth.uid(),
  entity_type text,
  entity_id text,
  title text not null,
  due_at timestamptz,
  status text not null default 'open',
  priority text not null default 'normal',
  notes text,
  source_activity_id uuid references public.sc_operational_activities(activity_id) on delete set null,
  completed_at timestamptz,
  resolution text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sc_followups_status_check check (status in ('open','completed','cancelled')),
  constraint sc_followups_priority_check check (priority in ('low','normal','high','urgent'))
);

alter table public.sc_operational_activities enable row level security;
alter table public.sc_followups enable row level security;

grant select, insert, update on public.sc_operational_activities to authenticated;
grant select, insert, update on public.sc_followups to authenticated;
grant select, insert, update on public.crm_meetings to authenticated;
grant select on public.search_console_daily to authenticated;

drop policy if exists "MCP authorized users can read operational activities" on public.sc_operational_activities;
create policy "MCP authorized users can read operational activities"
on public.sc_operational_activities for select to authenticated
using ((select private.mcp_is_authorized()) and user_id=(select auth.uid()));

drop policy if exists "MCP authorized users can insert operational activities" on public.sc_operational_activities;
create policy "MCP authorized users can insert operational activities"
on public.sc_operational_activities for insert to authenticated
with check ((select private.mcp_is_authorized()) and user_id=(select auth.uid()) and tenant_id='sc-analytics');

drop policy if exists "MCP authorized users can update operational activities" on public.sc_operational_activities;
create policy "MCP authorized users can update operational activities"
on public.sc_operational_activities for update to authenticated
using ((select private.mcp_is_authorized()) and user_id=(select auth.uid()))
with check ((select private.mcp_is_authorized()) and user_id=(select auth.uid()) and tenant_id='sc-analytics');

drop policy if exists "MCP authorized users can read followups" on public.sc_followups;
create policy "MCP authorized users can read followups"
on public.sc_followups for select to authenticated
using ((select private.mcp_is_authorized()) and user_id=(select auth.uid()));

drop policy if exists "MCP authorized users can insert followups" on public.sc_followups;
create policy "MCP authorized users can insert followups"
on public.sc_followups for insert to authenticated
with check ((select private.mcp_is_authorized()) and user_id=(select auth.uid()) and tenant_id='sc-analytics');

drop policy if exists "MCP authorized users can update followups" on public.sc_followups;
create policy "MCP authorized users can update followups"
on public.sc_followups for update to authenticated
using ((select private.mcp_is_authorized()) and user_id=(select auth.uid()))
with check ((select private.mcp_is_authorized()) and user_id=(select auth.uid()) and tenant_id='sc-analytics');

drop policy if exists "MCP authorized users can read meetings" on public.crm_meetings;
create policy "MCP authorized users can read meetings"
on public.crm_meetings for select to authenticated
using ((select private.mcp_is_authorized()));

drop policy if exists "MCP authorized users can insert meetings" on public.crm_meetings;
create policy "MCP authorized users can insert meetings"
on public.crm_meetings for insert to authenticated
with check ((select private.mcp_is_authorized()) and tenant_id='sc-analytics');

drop policy if exists "MCP authorized users can update meetings" on public.crm_meetings;
create policy "MCP authorized users can update meetings"
on public.crm_meetings for update to authenticated
using ((select private.mcp_is_authorized()))
with check ((select private.mcp_is_authorized()) and tenant_id='sc-analytics');

drop policy if exists "MCP authorized users can read search console metrics" on public.search_console_daily;
create policy "MCP authorized users can read search console metrics"
on public.search_console_daily for select to authenticated
using ((select private.mcp_is_authorized()) and tenant_id='sc-analytics');

create index if not exists sc_operational_activities_user_occurred_idx
on public.sc_operational_activities(user_id, occurred_at desc);
create index if not exists sc_operational_activities_entity_idx
on public.sc_operational_activities(tenant_id, entity_type, entity_id, occurred_at desc);
create index if not exists sc_followups_user_status_due_idx
on public.sc_followups(user_id, status, due_at);
create index if not exists sc_followups_source_activity_idx
on public.sc_followups(source_activity_id);

create or replace function public.mcp_record_activity(
  p_activity_type text, p_title text, p_summary text default null, p_channel text default null,
  p_entity_type text default null, p_entity_id text default null, p_status text default null,
  p_source_url text default null, p_next_action_at timestamptz default null,
  p_metadata jsonb default '{}'::jsonb
) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare v_row public.sc_operational_activities%rowtype;
begin
  if not private.mcp_is_authorized() then raise exception 'MCP access denied' using errcode='42501'; end if;
  if nullif(trim(p_activity_type),'') is null then raise exception 'activity_type is required'; end if;
  if nullif(trim(p_title),'') is null then raise exception 'title is required'; end if;
  insert into public.sc_operational_activities(
    tenant_id,user_id,occurred_at,activity_type,channel,entity_type,entity_id,title,summary,status,
    source_url,next_action_at,metadata
  ) values(
    'sc-analytics',auth.uid(),now(),trim(p_activity_type),nullif(trim(coalesce(p_channel,'')),''),
    nullif(trim(coalesce(p_entity_type,'')),''),nullif(trim(coalesce(p_entity_id,'')),''),
    trim(p_title),nullif(trim(coalesce(p_summary,'')),''),nullif(trim(coalesce(p_status,'')),''),
    nullif(trim(coalesce(p_source_url,'')),''),p_next_action_at,coalesce(p_metadata,'{}'::jsonb)
  ) returning * into v_row;
  insert into public.mcp_action_log(tool_name,action,target_type,target_id,before_state,after_state,metadata)
  values('record_activity','create','operational_activity',v_row.activity_id::text,null,to_jsonb(v_row),
    jsonb_build_object('activity_type',v_row.activity_type,'entity_type',v_row.entity_type,'entity_id',v_row.entity_id));
  return to_jsonb(v_row);
end $$;

create or replace function public.mcp_create_followup(
  p_title text, p_due_at timestamptz default null, p_entity_type text default null,
  p_entity_id text default null, p_priority text default 'normal', p_notes text default null,
  p_source_activity_id uuid default null, p_metadata jsonb default '{}'::jsonb
) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare v_row public.sc_followups%rowtype;
begin
  if not private.mcp_is_authorized() then raise exception 'MCP access denied' using errcode='42501'; end if;
  if nullif(trim(p_title),'') is null then raise exception 'title is required'; end if;
  if coalesce(p_priority,'normal') not in ('low','normal','high','urgent') then raise exception 'invalid priority'; end if;
  insert into public.sc_followups(
    tenant_id,user_id,entity_type,entity_id,title,due_at,status,priority,notes,source_activity_id,metadata
  ) values(
    'sc-analytics',auth.uid(),nullif(trim(coalesce(p_entity_type,'')),''),
    nullif(trim(coalesce(p_entity_id,'')),''),trim(p_title),p_due_at,'open',
    coalesce(p_priority,'normal'),nullif(trim(coalesce(p_notes,'')),''),
    p_source_activity_id,coalesce(p_metadata,'{}'::jsonb)
  ) returning * into v_row;
  insert into public.mcp_action_log(tool_name,action,target_type,target_id,before_state,after_state)
  values('create_followup','create','followup',v_row.followup_id::text,null,to_jsonb(v_row));
  return to_jsonb(v_row);
end $$;

create or replace function public.mcp_complete_followup(
  p_followup_id uuid, p_resolution text default null
) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare v_before public.sc_followups%rowtype; v_after public.sc_followups%rowtype;
begin
  if not private.mcp_is_authorized() then raise exception 'MCP access denied' using errcode='42501'; end if;
  select * into v_before from public.sc_followups
    where followup_id=p_followup_id and tenant_id='sc-analytics' and user_id=auth.uid();
  if not found then raise exception 'followup not found'; end if;
  update public.sc_followups set status='completed',completed_at=now(),
    resolution=nullif(trim(coalesce(p_resolution,'')),''),updated_at=now()
    where followup_id=p_followup_id returning * into v_after;
  insert into public.mcp_action_log(tool_name,action,target_type,target_id,before_state,after_state)
  values('complete_followup','complete','followup',p_followup_id::text,to_jsonb(v_before),to_jsonb(v_after));
  return to_jsonb(v_after);
end $$;

revoke all on function public.mcp_record_activity(text,text,text,text,text,text,text,text,timestamptz,jsonb) from public,anon;
revoke all on function public.mcp_create_followup(text,timestamptz,text,text,text,text,uuid,jsonb) from public,anon;
revoke all on function public.mcp_complete_followup(uuid,text) from public,anon;
grant execute on function public.mcp_record_activity(text,text,text,text,text,text,text,text,timestamptz,jsonb) to authenticated;
grant execute on function public.mcp_create_followup(text,timestamptz,text,text,text,text,uuid,jsonb) to authenticated;
grant execute on function public.mcp_complete_followup(uuid,text) to authenticated;
