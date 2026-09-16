create table if not exists public.growth_workspace_settings (
  tenant_id text not null references public.growth_tenants(tenant_id) on delete cascade,
  setting_key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (tenant_id, setting_key)
);

create table if not exists public.competitors (
  competitor_id text primary key,
  tenant_id text not null references public.growth_tenants(tenant_id) on delete cascade,
  name text not null,
  website text not null,
  country text not null default '',
  city text not null default '',
  employee_range text not null default '',
  category text not null default 'direct',
  positioning text not null default '',
  services jsonb not null default '[]'::jsonb,
  philosophy_fit numeric not null default 0 check (philosophy_fit >= 0 and philosophy_fit <= 10),
  market_overlap numeric not null default 0 check (market_overlap >= 0 and market_overlap <= 10),
  relevance_score numeric not null default 0 check (relevance_score >= 0 and relevance_score <= 10),
  why_relevant text not null default '',
  differentiation text not null default '',
  primary_source_url text not null default '',
  linkedin_url text not null default '',
  status text not null default 'active',
  is_monitored boolean not null default false,
  monitoring_frequency text not null default 'daily',
  last_discovered_at timestamptz,
  last_checked_at timestamptz,
  last_change_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, website)
);

create table if not exists public.competitor_events (
  event_id text primary key,
  tenant_id text not null references public.growth_tenants(tenant_id) on delete cascade,
  competitor_id text not null references public.competitors(competitor_id) on delete cascade,
  event_type text not null default 'other',
  title text not null,
  summary text not null default '',
  evidence text not null default '',
  source_url text not null,
  observed_at timestamptz,
  significance numeric not null default 0 check (significance >= 0 and significance <= 10),
  impact_for_sc text not null default '',
  recommended_response text not null default '',
  fingerprint text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, competitor_id, fingerprint)
);

create index if not exists competitors_tenant_score_idx
  on public.competitors (tenant_id, relevance_score desc, updated_at desc);
create index if not exists competitors_monitoring_idx
  on public.competitors (tenant_id, is_monitored, status, last_checked_at);
create index if not exists competitor_events_recent_idx
  on public.competitor_events (tenant_id, created_at desc);
create index if not exists competitor_events_competitor_idx
  on public.competitor_events (competitor_id, observed_at desc, created_at desc);

alter table public.growth_workspace_settings enable row level security;
alter table public.competitors enable row level security;
alter table public.competitor_events enable row level security;

grant select, insert, update, delete on public.growth_workspace_settings to service_role;
grant select, insert, update, delete on public.competitors to service_role;
grant select, insert, update, delete on public.competitor_events to service_role;
