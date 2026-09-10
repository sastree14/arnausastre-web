create extension if not exists pgcrypto;

create table if not exists growth_tenants (
  tenant_id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists weekly_plans (
  plan_id text primary key,
  tenant_id text not null,
  week_start date not null,
  primary_goal text not null,
  commercial_focus jsonb not null default '{}'::jsonb,
  content_focus jsonb not null default '{}'::jsonb,
  targets jsonb not null default '{}'::jsonb,
  tasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (tenant_id, week_start)
);

create table if not exists tasks (
  task_id text primary key,
  tenant_id text,
  type text not null,
  scheduled_for date not null,
  status text not null default 'pending',
  requires_approval boolean not null default false,
  inputs jsonb not null default '{}'::jsonb,
  outputs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists companies (
  company_id text primary key,
  tenant_id text not null,
  name text not null,
  website text not null,
  country text default '',
  industry text default '',
  employee_range text default '',
  linkedin_url text default '',
  source_url text default '',
  fit_type text not null default 'partner',
  score numeric(4,2) not null default 0,
  score_reason text default '',
  capabilities jsonb not null default '[]'::jsonb,
  capability_gaps jsonb not null default '[]'::jsonb,
  status text not null default 'candidate',
  created_at timestamptz not null default now(),
  unique (tenant_id, website)
);

create table if not exists people (
  person_id text primary key,
  tenant_id text not null,
  company_id text references companies(company_id) on delete cascade,
  name text default '',
  role text not null,
  linkedin_url text default '',
  public_source_url text default '',
  relevance_score numeric(4,2) not null default 0,
  status text not null default 'candidate',
  created_at timestamptz not null default now()
);

create table if not exists content_items (
  content_id text primary key,
  tenant_id text not null,
  channel text not null,
  content_type text not null,
  title text not null,
  body text not null,
  objective text default '',
  target_audience jsonb not null default '[]'::jsonb,
  evidence_ids jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  visual_type text not null default 'none',
  visual_path text default '',
  source_case text default '',
  scheduled_at timestamptz,
  external_post_id text,
  external_post_url text,
  created_at timestamptz not null default now()
);

create table if not exists evidence (
  evidence_id text primary key,
  tenant_id text not null,
  type text not null check (type in ('REAL_CASE','INTERNAL_EXPERIENCE','PUBLIC_SOURCE','ILLUSTRATIVE_EXAMPLE','OPINION')),
  claim text not null,
  source text not null,
  approved_for_public_use boolean not null default false,
  confidential boolean not null default false,
  anonymized boolean not null default false,
  url text,
  notes text default '',
  created_at timestamptz not null default now()
);

create table if not exists approvals (
  approval_id text primary key,
  tenant_id text not null,
  action_type text not null,
  target_id text not null,
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','approved','rejected','executed','failed')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  executed_at timestamptz
);

create table if not exists interactions (
  interaction_id text primary key,
  tenant_id text not null,
  company_id text,
  person_id text,
  channel text not null,
  direction text not null,
  kind text not null,
  content text default '',
  occurred_at timestamptz not null default now(),
  next_action_at timestamptz
);

create table if not exists metrics (
  metric_id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  channel text not null,
  metric_name text not null,
  metric_value numeric,
  metric_date date not null,
  metadata jsonb not null default '{}'::jsonb,
  unique (tenant_id, channel, metric_name, metric_date)
);

insert into growth_tenants (tenant_id, name)
values ('sc-analytics', 'SC-Analytics')
on conflict (tenant_id) do nothing;
