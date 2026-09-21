-- Generic, non-sensitive invalidation stream for the private SC-Analytics CRM UI.
-- The browser never subscribes directly to business tables. It only receives
-- table/action/timestamp signals, then re-fetches authenticated Next.js pages.
-- One row per source table keeps storage bounded while UPDATE events still
-- propagate through Supabase Realtime.

create table if not exists public.crm_ui_events (
  event_key text primary key,
  tenant_id text not null default 'sc-analytics',
  source_table text not null,
  event_type text not null,
  changed_at timestamptz not null default now()
);

create index if not exists crm_ui_events_changed_at_idx
  on public.crm_ui_events (changed_at desc);

alter table public.crm_ui_events enable row level security;

revoke all on table public.crm_ui_events from anon, authenticated;
grant select on table public.crm_ui_events to anon, authenticated;
grant select, insert, update, delete on table public.crm_ui_events to service_role;

drop policy if exists "crm ui realtime read" on public.crm_ui_events;
create policy "crm ui realtime read"
  on public.crm_ui_events
  for select
  to anon, authenticated
  using (tenant_id = 'sc-analytics');

create or replace function public.growth_emit_ui_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_data jsonb;
  event_tenant text;
begin
  row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  event_tenant := coalesce(nullif(row_data ->> 'tenant_id', ''), 'sc-analytics');

  insert into public.crm_ui_events (event_key, tenant_id, source_table, event_type, changed_at)
  values (event_tenant || ':' || tg_table_name, event_tenant, tg_table_name, tg_op, now())
  on conflict (event_key) do update
    set event_type = excluded.event_type,
        changed_at = excluded.changed_at;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

do $$
declare
  table_name text;
  trigger_name text;
begin
  foreach table_name in array array[
    'tasks',
    'companies',
    'people',
    'approvals',
    'interactions',
    'content_items',
    'editorial_briefs',
    'visual_designs',
    'linkedin_analytics_imports',
    'linkedin_post_metrics',
    'web_analytics_daily',
    'search_console_daily',
    'analytics_sync_runs',
    'crm_opportunities',
    'crm_meetings',
    'operations_projects',
    'finance_invoices',
    'finance_expenses',
    'finance_payments',
    'commercial_signals',
    'crm_deal_workspaces',
    'crm_inbox_messages',
    'seo_pages',
    'seo_recommendations',
    'competitor_events'
  ]
  loop
    if to_regclass('public.' || table_name) is not null then
      trigger_name := 'growth_ui_event_' || table_name;
      execute format('drop trigger if exists %I on public.%I', trigger_name, table_name);
      execute format(
        'create trigger %I after insert or update or delete on public.%I for each row execute function public.growth_emit_ui_event()',
        trigger_name,
        table_name
      );
    end if;
  end loop;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'crm_ui_events'
  ) then
    alter publication supabase_realtime add table public.crm_ui_events;
  end if;
end;
$$;
