alter table content_items add column if not exists topic text default '';
alter table content_items add column if not exists industry text default '';
alter table content_items add column if not exists challenge text default '';
alter table content_items add column if not exists audience text default '';
alter table content_items add column if not exists funnel_stage text default 'awareness';
alter table content_items add column if not exists hook_type text default '';
alter table content_items add column if not exists cta_type text default 'none';
alter table content_items add column if not exists cta_url text default '';
alter table content_items add column if not exists hashtags jsonb not null default '[]'::jsonb;
alter table content_items add column if not exists visual_strategy jsonb not null default '{}'::jsonb;
alter table content_items add column if not exists last_rewritten_at timestamptz;

create table if not exists linkedin_analytics_imports (
  import_id text primary key,
  tenant_id text not null,
  account_type text not null check (account_type in ('arnau','sc_analytics')),
  report_type text not null,
  period_start date,
  period_end date,
  source_filename text default '',
  rows_imported integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now()
);

create table if not exists linkedin_post_metrics (
  metric_id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  import_id text references linkedin_analytics_imports(import_id) on delete set null,
  account_type text not null check (account_type in ('arnau','sc_analytics')),
  content_id text references content_items(content_id) on delete set null,
  external_post_id text default '',
  external_post_url text default '',
  snapshot_date date not null,
  impressions numeric not null default 0,
  reach numeric not null default 0,
  reactions numeric not null default 0,
  comments numeric not null default 0,
  reposts numeric not null default 0,
  saves numeric not null default 0,
  sends numeric not null default 0,
  clicks numeric not null default 0,
  profile_views numeric not null default 0,
  followers_gained numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_linkedin_post_metrics_content_date
  on linkedin_post_metrics(content_id, snapshot_date desc);
create index if not exists idx_linkedin_post_metrics_account_date
  on linkedin_post_metrics(account_type, snapshot_date desc);

create table if not exists web_analytics_daily (
  metric_id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  metric_date date not null,
  source text not null default '',
  medium text not null default '',
  campaign text not null default '',
  content_id text references content_items(content_id) on delete set null,
  page_path text not null default '',
  users numeric not null default 0,
  sessions numeric not null default 0,
  engaged_sessions numeric not null default 0,
  page_views numeric not null default 0,
  key_events numeric not null default 0,
  discovery_clicks numeric not null default 0,
  bookings numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_web_analytics_daily_date on web_analytics_daily(metric_date desc);
create index if not exists idx_web_analytics_daily_content on web_analytics_daily(content_id, metric_date desc);

create table if not exists crm_opportunities (
  opportunity_id text primary key,
  tenant_id text not null,
  company_id text references companies(company_id) on delete set null,
  primary_person_id text references people(person_id) on delete set null,
  source_content_id text references content_items(content_id) on delete set null,
  name text not null,
  stage text not null default 'lead',
  value numeric not null default 0,
  currency text not null default 'EUR',
  probability numeric not null default 0,
  source text default '',
  next_action_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists crm_meetings (
  meeting_id text primary key,
  tenant_id text not null,
  company_id text references companies(company_id) on delete set null,
  person_id text references people(person_id) on delete set null,
  opportunity_id text references crm_opportunities(opportunity_id) on delete set null,
  provider text not null default 'calendly',
  external_id text default '',
  starts_at timestamptz,
  status text not null default 'scheduled',
  booking_url text default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table linkedin_analytics_imports enable row level security;
alter table linkedin_post_metrics enable row level security;
alter table web_analytics_daily enable row level security;
alter table crm_opportunities enable row level security;
alter table crm_meetings enable row level security;

revoke all on table linkedin_analytics_imports, linkedin_post_metrics, web_analytics_daily,
  crm_opportunities, crm_meetings from anon, authenticated;

grant select, insert, update, delete on table linkedin_analytics_imports, linkedin_post_metrics,
  web_analytics_daily, crm_opportunities, crm_meetings to service_role;
