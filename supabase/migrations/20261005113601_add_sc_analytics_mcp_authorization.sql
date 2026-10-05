create schema if not exists private;

create table if not exists public.mcp_authorized_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  label text not null default 'SC-Analytics operator',
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.mcp_authorized_users enable row level security;

create table if not exists public.mcp_action_log (
  action_id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tool_name text not null,
  action text not null,
  target_type text,
  target_id text,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.mcp_action_log enable row level security;

create or replace function private.mcp_is_authorized()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.mcp_authorized_users u
    where u.user_id = (select auth.uid()) and u.enabled = true
  );
$$;
revoke all on function private.mcp_is_authorized() from public;
grant usage on schema private to authenticated;
grant execute on function private.mcp_is_authorized() to authenticated;

create policy "MCP authorized users can read action log" on public.mcp_action_log
for select to authenticated
using ((select private.mcp_is_authorized()) and user_id=(select auth.uid()));
create policy "MCP authorized users can insert action log" on public.mcp_action_log
for insert to authenticated
with check ((select private.mcp_is_authorized()) and user_id=(select auth.uid()));
grant select, insert on public.mcp_action_log to authenticated;

create policy "MCP authorized users can read content" on public.content_items
for select to authenticated using ((select private.mcp_is_authorized()));
create policy "MCP authorized users can update content" on public.content_items
for update to authenticated using ((select private.mcp_is_authorized()))
with check ((select private.mcp_is_authorized()));
grant select, update on public.content_items to authenticated;

create policy "MCP authorized users can read linkedin metrics" on public.linkedin_post_metrics
for select to authenticated using ((select private.mcp_is_authorized()));
create policy "MCP authorized users can read web metrics" on public.web_analytics_daily
for select to authenticated using ((select private.mcp_is_authorized()));
grant select on public.linkedin_post_metrics, public.web_analytics_daily to authenticated;

create policy "MCP authorized users can read companies" on public.companies
for select to authenticated using ((select private.mcp_is_authorized()));
create policy "MCP authorized users can insert companies" on public.companies
for insert to authenticated with check ((select private.mcp_is_authorized()));
create policy "MCP authorized users can update companies" on public.companies
for update to authenticated using ((select private.mcp_is_authorized()))
with check ((select private.mcp_is_authorized()));
grant select, insert, update on public.companies to authenticated;

create policy "MCP authorized users can read people" on public.people
for select to authenticated using ((select private.mcp_is_authorized()));
create policy "MCP authorized users can insert people" on public.people
for insert to authenticated with check ((select private.mcp_is_authorized()));
create policy "MCP authorized users can update people" on public.people
for update to authenticated using ((select private.mcp_is_authorized()))
with check ((select private.mcp_is_authorized()));
grant select, insert, update on public.people to authenticated;

create policy "MCP authorized users can read opportunities" on public.crm_opportunities
for select to authenticated using ((select private.mcp_is_authorized()));
create policy "MCP authorized users can insert opportunities" on public.crm_opportunities
for insert to authenticated with check ((select private.mcp_is_authorized()));
create policy "MCP authorized users can update opportunities" on public.crm_opportunities
for update to authenticated using ((select private.mcp_is_authorized()))
with check ((select private.mcp_is_authorized()));
grant select, insert, update on public.crm_opportunities to authenticated;
