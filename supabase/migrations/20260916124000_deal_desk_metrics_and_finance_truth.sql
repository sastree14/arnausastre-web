create table if not exists public.crm_deal_workspaces (
  opportunity_id text primary key references public.crm_opportunities(opportunity_id) on delete cascade,
  tenant_id text not null default 'sc-analytics',
  qualification jsonb not null default '{}'::jsonb,
  discovery jsonb not null default '{}'::jsonb,
  proposal jsonb not null default '{}'::jsonb,
  budget jsonb not null default '{}'::jsonb,
  status text not null default 'qualification',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists crm_deal_workspaces_tenant_updated_idx on public.crm_deal_workspaces(tenant_id,updated_at desc);

alter table public.web_analytics_daily add column if not exists sync_key text;
create unique index if not exists web_analytics_daily_sync_key_uq on public.web_analytics_daily(tenant_id,sync_key) where sync_key is not null;

create table if not exists public.search_console_daily (
  metric_id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'sc-analytics',
  metric_date date not null,
  query text not null default '',
  page text not null default '',
  country text not null default '',
  device text not null default '',
  clicks numeric not null default 0,
  impressions numeric not null default 0,
  ctr numeric not null default 0,
  position numeric not null default 0,
  sync_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id,sync_key)
);
create index if not exists search_console_daily_date_idx on public.search_console_daily(tenant_id,metric_date desc);

create table if not exists public.analytics_sync_runs (
  sync_run_id text primary key,
  tenant_id text not null default 'sc-analytics',
  provider text not null,
  status text not null,
  started_at timestamptz not null,
  completed_at timestamptz,
  rows_written integer not null default 0,
  error text,
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists analytics_sync_runs_provider_idx on public.analytics_sync_runs(tenant_id,provider,started_at desc);

create or replace function public.growth_deal_desk_bundle()
returns jsonb
language sql
stable
security definer
set search_path=public
as $$
with r as (select public.growth_workspace_reset_at('commercial_reset') reset_at)
select jsonb_build_object(
  'opportunities',coalesce((select jsonb_agg(to_jsonb(x)) from (
    select o.opportunity_id,o.company_id,o.primary_person_id,o.name,o.stage,o.value,o.currency,o.probability,o.source,o.next_action_at,o.metadata,o.created_at,o.updated_at,
           c.name company_name,c.industry,c.country,c.recommended_service,c.recommended_offer,
           p.name person_name,p.role,p.email,p.phone,p.linkedin_url
    from public.crm_opportunities o
    left join public.companies c on c.company_id=o.company_id
    left join public.people p on p.person_id=o.primary_person_id
    cross join r
    where o.tenant_id='sc-analytics' and o.created_at>=r.reset_at
    order by o.updated_at desc nulls last
    limit 300
  ) x),'[]'::jsonb),
  'companies',coalesce((select jsonb_agg(to_jsonb(x)) from (
    select company_id,name,industry,country,recommended_service,recommended_offer,status,score
    from public.companies,r where tenant_id='sc-analytics' and created_at>=r.reset_at and coalesce(fit_type,'lead')='lead'
    order by score desc nulls last,name limit 500
  ) x),'[]'::jsonb),
  'people',coalesce((select jsonb_agg(to_jsonb(x)) from (
    select person_id,company_id,name,role,email,phone,linkedin_url,recommended_service,recommended_offer,status,relevance_score
    from public.people,r where tenant_id='sc-analytics' and created_at>=r.reset_at
    order by relevance_score desc nulls last,name limit 600
  ) x),'[]'::jsonb),
  'workspaces',coalesce((select jsonb_agg(to_jsonb(x)) from (
    select * from public.crm_deal_workspaces where tenant_id='sc-analytics' order by updated_at desc limit 300
  ) x),'[]'::jsonb),
  'meetings',coalesce((select jsonb_agg(to_jsonb(x)) from (
    select meeting_id,company_id,person_id,opportunity_id,provider,starts_at,status,booking_url,metadata,created_at
    from public.crm_meetings,r where tenant_id='sc-analytics' and created_at>=r.reset_at order by starts_at asc nulls last limit 300
  ) x),'[]'::jsonb)
);
$$;
revoke all on function public.growth_deal_desk_bundle() from public,anon,authenticated;
grant execute on function public.growth_deal_desk_bundle() to service_role;

create or replace function public.growth_metrics_bundle()
returns jsonb
language sql
stable
security definer
set search_path=public
as $$
with latest_li as (
  select distinct on (account_type,coalesce(content_id,external_post_id,external_post_url,metric_id::text)) *
  from public.linkedin_post_metrics
  where tenant_id='sc-analytics'
  order by account_type,coalesce(content_id,external_post_id,external_post_url,metric_id::text),snapshot_date desc,created_at desc
), c as (select public.growth_workspace_reset_at('commercial_reset') reset_at)
select jsonb_build_object(
  'linkedin',jsonb_build_object(
    'impressions',coalesce((select sum(impressions) from latest_li),0),
    'reach',coalesce((select sum(reach) from latest_li),0),
    'reactions',coalesce((select sum(reactions) from latest_li),0),
    'comments',coalesce((select sum(comments) from latest_li),0),
    'reposts',coalesce((select sum(reposts) from latest_li),0),
    'saves',coalesce((select sum(saves) from latest_li),0),
    'clicks',coalesce((select sum(clicks) from latest_li),0),
    'followers_gained',coalesce((select sum(followers_gained) from latest_li),0),
    'posts_measured',(select count(*) from latest_li),
    'latest_date',(select max(snapshot_date) from latest_li)
  ),
  'website',jsonb_build_object(
    'users',coalesce((select sum(users) from public.web_analytics_daily where tenant_id='sc-analytics'),0),
    'sessions',coalesce((select sum(sessions) from public.web_analytics_daily where tenant_id='sc-analytics'),0),
    'engaged_sessions',coalesce((select sum(engaged_sessions) from public.web_analytics_daily where tenant_id='sc-analytics'),0),
    'page_views',coalesce((select sum(page_views) from public.web_analytics_daily where tenant_id='sc-analytics'),0),
    'key_events',coalesce((select sum(key_events) from public.web_analytics_daily where tenant_id='sc-analytics'),0),
    'discovery_clicks',coalesce((select sum(discovery_clicks) from public.web_analytics_daily where tenant_id='sc-analytics'),0),
    'bookings',coalesce((select sum(bookings) from public.web_analytics_daily where tenant_id='sc-analytics'),0),
    'latest_date',(select max(metric_date) from public.web_analytics_daily where tenant_id='sc-analytics')
  ),
  'seo',jsonb_build_object(
    'clicks',coalesce((select sum(clicks) from public.search_console_daily where tenant_id='sc-analytics'),0),
    'impressions',coalesce((select sum(impressions) from public.search_console_daily where tenant_id='sc-analytics'),0),
    'ctr',coalesce((select case when sum(impressions)>0 then sum(clicks)/sum(impressions) else 0 end from public.search_console_daily where tenant_id='sc-analytics'),0),
    'position',coalesce((select case when sum(impressions)>0 then sum(position*impressions)/sum(impressions) else 0 end from public.search_console_daily where tenant_id='sc-analytics'),0),
    'latest_date',(select max(metric_date) from public.search_console_daily where tenant_id='sc-analytics')
  ),
  'commercial',jsonb_build_object(
    'opportunities',(select count(*) from public.crm_opportunities,c where tenant_id='sc-analytics' and created_at>=c.reset_at),
    'meetings',(select count(*) from public.crm_meetings,c where tenant_id='sc-analytics' and created_at>=c.reset_at),
    'open_pipeline',coalesce((select sum(coalesce(value,0)) from public.crm_opportunities,c where tenant_id='sc-analytics' and created_at>=c.reset_at and stage not in ('won','lost','closed')),0),
    'won_value',coalesce((select sum(coalesce(value,0)) from public.crm_opportunities,c where tenant_id='sc-analytics' and created_at>=c.reset_at and stage='won'),0)
  ),
  'finance',jsonb_build_object(
    'invoiced',coalesce((select sum(coalesce(amount_eur,total,0)) from public.finance_invoices where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
    'collected',coalesce((select sum(coalesce(amount_eur,amount,0)) from public.finance_payments where tenant_id='sc-analytics' and direction='inflow' and status in ('received','confirmed','matched') and review_status in ('reviewed','confirmed')),0),
    'spent',coalesce((select sum(coalesce(amount_eur,total,0)) from public.finance_expenses where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
    'outstanding',greatest(0,coalesce((select sum(coalesce(amount_eur,total,0)) from public.finance_invoices where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0)-coalesce((select sum(coalesce(amount_eur,amount,0)) from public.finance_payments where tenant_id='sc-analytics' and direction='inflow' and status in ('received','confirmed','matched') and review_status in ('reviewed','confirmed')),0))
  ),
  'sources',jsonb_build_object(
    'linkedin_connected',exists(select 1 from public.integration_connections where tenant_id='sc-analytics' and provider='linkedin' and (token_expires_at is null or token_expires_at>now())),
    'google_connected',exists(select 1 from public.integration_connections where tenant_id='sc-analytics' and provider='gmail' and account_type='corporate'),
    'last_ga4_sync',(select max(completed_at) from public.analytics_sync_runs where tenant_id='sc-analytics' and provider='ga4' and status='completed'),
    'last_search_console_sync',(select max(completed_at) from public.analytics_sync_runs where tenant_id='sc-analytics' and provider='search_console' and status='completed')
  )
);
$$;
revoke all on function public.growth_metrics_bundle() from public,anon,authenticated;
grant execute on function public.growth_metrics_bundle() to service_role;

create or replace function public.growth_finance_bundle()
returns jsonb
language sql
stable
security definer
set search_path=public
as $$
with cr as (select public.growth_workspace_reset_at('commercial_reset') reset_at)
select jsonb_build_object(
  'settings',coalesce((select to_jsonb(x) from (select * from finance_settings where tenant_id='sc-analytics' limit 1)x),'{}'::jsonb),
  'companies',coalesce((select jsonb_agg(to_jsonb(x)) from (select company_id,name from companies,cr where tenant_id='sc-analytics' and created_at>=cr.reset_at order by name limit 500)x),'[]'::jsonb),
  'counterparties',coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_counterparties where tenant_id='sc-analytics' order by legal_name limit 500)x),'[]'::jsonb),
  'projects',coalesce((select jsonb_agg(to_jsonb(x)) from (select project_id,name,status from operations_projects where tenant_id='sc-analytics' order by created_at desc limit 300)x),'[]'::jsonb),
  'invoices',coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_invoices where tenant_id='sc-analytics' order by issue_date desc nulls last,created_at desc limit 500)x),'[]'::jsonb),
  'expenses',coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_expenses where tenant_id='sc-analytics' order by expense_date desc nulls last,created_at desc limit 500)x),'[]'::jsonb),
  'payments',coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_payments where tenant_id='sc-analytics' order by payment_date desc nulls last,created_at desc limit 500)x),'[]'::jsonb),
  'documents',coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_documents where tenant_id='sc-analytics' order by created_at desc limit 300)x),'[]'::jsonb),
  'tax_periods',coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_tax_periods where tenant_id='sc-analytics' order by period_start desc limit 50)x),'[]'::jsonb),
  'import_candidates',coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_import_candidates where tenant_id='sc-analytics' and status='pending_review' order by created_at desc limit 100)x),'[]'::jsonb),
  'bank_accounts',coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_bank_accounts where tenant_id='sc-analytics' order by display_name limit 50)x),'[]'::jsonb),
  'bank_transactions',coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_bank_transactions where tenant_id='sc-analytics' order by booked_at desc nulls last limit 300)x),'[]'::jsonb),
  'reconciliations',coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_reconciliations where tenant_id='sc-analytics' order by created_at desc limit 200)x),'[]'::jsonb),
  'accounts',coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_accounts where tenant_id='sc-analytics' and active=true order by account_code)x),'[]'::jsonb),
  'journal_entries',coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_journal_entries where tenant_id='sc-analytics' order by entry_date desc,created_at desc limit 300)x),'[]'::jsonb),
  'audit_events',coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_audit_events where tenant_id='sc-analytics' order by occurred_at desc limit 100)x),'[]'::jsonb),
  'invoiced',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_invoices where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'received',coalesce((select sum(coalesce(amount_eur,amount,0)) from finance_payments where tenant_id='sc-analytics' and direction='inflow' and status in ('received','confirmed','matched') and review_status in ('reviewed','confirmed')),0),
  'spent',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_expenses where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'vat_output',coalesce((select sum(coalesce(tax,0)) from finance_invoices where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'vat_input',coalesce((select sum(coalesce(tax,0)) from finance_expenses where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'withholding_total',coalesce((select sum(coalesce(withholding_amount,0)) from finance_invoices where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'pending_invoice_value',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_invoices where tenant_id='sc-analytics' and review_status not in ('reviewed','confirmed','rejected')),0),
  'pending_expense_value',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_expenses where tenant_id='sc-analytics' and review_status not in ('reviewed','confirmed','rejected')),0),
  'gmail_connections',coalesce((select jsonb_agg(jsonb_build_object('connection_id',connection_id,'account_type',account_type,'display_name',display_name,'provider_subject',provider_subject,'connected_at',connected_at,'updated_at',updated_at,'metadata',metadata,'scopes',scopes)) from integration_connections where tenant_id='sc-analytics' and provider='gmail'),'[]'::jsonb),
  'revolut_connections',coalesce((select jsonb_agg(jsonb_build_object('connection_id',connection_id,'account_type',account_type,'display_name',display_name,'provider_subject',provider_subject,'connected_at',connected_at,'updated_at',updated_at,'metadata',metadata)) from integration_connections where tenant_id='sc-analytics' and provider='revolut'),'[]'::jsonb)
);
$$;
revoke all on function public.growth_finance_bundle() from public,anon,authenticated;
grant execute on function public.growth_finance_bundle() to service_role;

create or replace function public.finance_period_report(p_start date,p_end date)
returns jsonb
language sql
stable
security definer
set search_path=public
as $$
select jsonb_build_object(
 'period_start',p_start,'period_end',p_end,
 'invoiced',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_invoices where tenant_id='sc-analytics' and issue_date between p_start and p_end and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
 'expenses',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_expenses where tenant_id='sc-analytics' and expense_date between p_start and p_end and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
 'cash_in',coalesce((select sum(coalesce(amount_eur,amount,0)) from finance_payments where tenant_id='sc-analytics' and payment_date between p_start and p_end and direction='inflow' and status in ('received','confirmed','matched') and review_status in ('reviewed','confirmed')),0),
 'cash_out',coalesce((select sum(coalesce(amount_eur,amount,0)) from finance_payments where tenant_id='sc-analytics' and payment_date between p_start and p_end and direction='outflow' and status in ('received','confirmed','matched') and review_status in ('reviewed','confirmed')),0),
 'vat_output',coalesce((select sum(coalesce(tax,0)) from finance_invoices where tenant_id='sc-analytics' and issue_date between p_start and p_end and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
 'vat_input',coalesce((select sum(coalesce(tax,0)) from finance_expenses where tenant_id='sc-analytics' and expense_date between p_start and p_end and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
 'withholding',coalesce((select sum(coalesce(withholding_amount,0)) from finance_invoices where tenant_id='sc-analytics' and issue_date between p_start and p_end and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
 'pending_invoice_value',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_invoices where tenant_id='sc-analytics' and issue_date between p_start and p_end and review_status not in ('reviewed','confirmed','rejected')),0),
 'pending_expense_value',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_expenses where tenant_id='sc-analytics' and expense_date between p_start and p_end and review_status not in ('reviewed','confirmed','rejected')),0)
);
$$;
revoke all on function public.finance_period_report(date,date) from public,anon,authenticated;
grant execute on function public.finance_period_report(date,date) to service_role;

create or replace function public.growth_dashboard_summary()
returns jsonb
language sql
stable
security definer
set search_path=public
as $$
with latest_li as (
  select distinct on (coalesce(content_id,external_post_id,external_post_url,metric_id::text)) coalesce(impressions,0) impressions
  from public.linkedin_post_metrics where tenant_id='sc-analytics'
  order by coalesce(content_id,external_post_id,external_post_url,metric_id::text),snapshot_date desc,created_at desc
),u as (select public.growth_workspace_reset_at('uat_reset') reset_at),c as (select public.growth_workspace_reset_at('commercial_reset') reset_at),e as (select public.growth_workspace_reset_at('editorial_reset') reset_at)
select jsonb_build_object(
 'companies',(select count(*) from public.companies,c where tenant_id='sc-analytics' and created_at>=c.reset_at),
 'active_projects',(select count(*) from public.operations_projects,u where tenant_id='sc-analytics' and created_at>=u.reset_at and status in ('active','planned')),
 'opportunities',(select count(*) from public.crm_opportunities,c where tenant_id='sc-analytics' and created_at>=c.reset_at),
 'meetings',(select count(*) from public.crm_meetings,c where tenant_id='sc-analytics' and created_at>=c.reset_at),
 'manual_actions',(select count(*) from public.approvals,c where tenant_id='sc-analytics' and created_at>=c.reset_at and status='approved' and payload->>'execution_mode'='manual_linkedin_action'),
 'published_content',(select count(*) from public.content_items,e where tenant_id='sc-analytics' and created_at>=e.reset_at and status='published'),
 'pending_approvals',(select count(*) from public.approvals,u where tenant_id='sc-analytics' and created_at>=u.reset_at and status='pending'),
 'open_tasks',(select count(*) from public.tasks,u where tenant_id='sc-analytics' and created_at>=u.reset_at and status not in ('completed','done','executed')),
 'failed_tasks',(select count(*) from public.tasks,u where tenant_id='sc-analytics' and created_at>=u.reset_at and status='failed'),
 'invoiced',coalesce((select sum(coalesce(amount_eur,total,0)) from public.finance_invoices where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
 'collected',coalesce((select sum(coalesce(amount_eur,amount,0)) from public.finance_payments where tenant_id='sc-analytics' and direction='inflow' and status in ('received','confirmed','matched') and review_status in ('reviewed','confirmed')),0),
 'spent',coalesce((select sum(coalesce(amount_eur,total,0)) from public.finance_expenses where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
 'overdue_invoices',(select count(*) from public.finance_invoices where tenant_id='sc-analytics' and due_date<current_date and status not in ('paid','cancelled','void') and review_status in ('reviewed','confirmed')),
 'web_sessions',coalesce((select sum(sessions) from public.web_analytics_daily where tenant_id='sc-analytics'),0),
 'linkedin_impressions',coalesce((select sum(impressions) from latest_li),0),
 'linkedin_posts_measured',(select count(*) from latest_li),
 'linkedin_connected',exists(select 1 from public.integration_connections where tenant_id='sc-analytics' and provider='linkedin' and (token_expires_at is null or token_expires_at>now()))
);
$$;
revoke all on function public.growth_dashboard_summary() from public,anon,authenticated;
grant execute on function public.growth_dashboard_summary() to service_role;