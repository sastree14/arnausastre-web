create table if not exists crm_inbox_messages (
  message_key text primary key,
  tenant_id text not null,
  provider text not null default 'gmail',
  account_email text not null,
  external_message_id text not null,
  thread_id text default '',
  sender_name text default '',
  sender_email text default '',
  recipients text[] not null default '{}'::text[],
  subject text not null default '',
  snippet text not null default '',
  received_at timestamptz,
  unread boolean not null default false,
  labels jsonb not null default '[]'::jsonb,
  relevance_score numeric not null default 0,
  category text not null default 'other',
  relevance_reason text default '',
  summary text default '',
  recommended_action text default '',
  status text not null default 'classified',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, provider, account_email, external_message_id)
);

create index if not exists crm_inbox_messages_relevance_idx
  on crm_inbox_messages (tenant_id, relevance_score desc, received_at desc);
create index if not exists crm_inbox_messages_account_idx
  on crm_inbox_messages (tenant_id, account_email, received_at desc);

create table if not exists seo_keyword_targets (
  keyword_id text primary key,
  tenant_id text not null,
  keyword text not null,
  search_intent text not null default 'commercial',
  service_area text not null default '',
  priority numeric not null default 5,
  target_path text default '',
  status text not null default 'active',
  notes text default '',
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, keyword)
);

create table if not exists seo_pages (
  seo_page_id text primary key,
  tenant_id text not null,
  slug text not null,
  primary_keyword text not null,
  secondary_keywords jsonb not null default '[]'::jsonb,
  search_intent text not null default 'commercial',
  title text not null,
  meta_description text not null default '',
  h1 text not null,
  intro text not null default '',
  sections jsonb not null default '[]'::jsonb,
  cta_title text default '',
  cta_body text default '',
  internal_links jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  source text not null default 'seo_agent',
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (tenant_id, slug)
);

create index if not exists seo_pages_status_idx on seo_pages (tenant_id, status, updated_at desc);

insert into seo_keyword_targets (keyword_id, tenant_id, keyword, search_intent, service_area, priority, target_path)
values
  ('seo_kw_demand_forecasting','sc-analytics','demand forecasting','commercial','Forecasting & Planning',10,'/services/demand-forecasting'),
  ('seo_kw_demand_planning','sc-analytics','demand planning','commercial','Forecasting & Planning',9,'/services/demand-planning'),
  ('seo_kw_inventory_optimization','sc-analytics','inventory optimization','commercial','Optimization / OR',9,'/services/inventory-optimization'),
  ('seo_kw_supply_chain_analytics','sc-analytics','supply chain analytics','commercial','Supply Chain / Logistics',9,'/services/supply-chain-analytics'),
  ('seo_kw_logistics_optimization','sc-analytics','logistics optimization','commercial','Optimization / OR',10,'/services/logistics-optimization'),
  ('seo_kw_route_optimization','sc-analytics','route optimization','commercial','Optimization / OR',8,'/services/route-optimization'),
  ('seo_kw_operations_research','sc-analytics','operations research consulting','commercial','Optimization / OR',8,'/services/operations-research'),
  ('seo_kw_pricing_optimization','sc-analytics','pricing optimization','commercial','Pricing & Revenue',8,'/services/pricing-optimization'),
  ('seo_kw_ml_consulting','sc-analytics','machine learning consulting','commercial','Machine Learning',8,'/services/machine-learning-consulting'),
  ('seo_kw_data_science','sc-analytics','data science consulting','commercial','Data & AI Strategy',10,'/services/data-science-consulting'),
  ('seo_kw_ai_automation','sc-analytics','AI automation services','commercial','AI Automation & Agents',10,'/services/ai-automation'),
  ('seo_kw_data_engineering','sc-analytics','data engineering consulting','commercial','Data Engineering',8,'/services/data-engineering'),
  ('seo_kw_business_intelligence','sc-analytics','business intelligence consulting','commercial','BI & Decision Intelligence',7,'/services/business-intelligence')
on conflict (tenant_id, keyword) do nothing;

alter table crm_inbox_messages enable row level security;
alter table seo_keyword_targets enable row level security;
alter table seo_pages enable row level security;
revoke all on table crm_inbox_messages, seo_keyword_targets, seo_pages from anon, authenticated;
grant select, insert, update, delete on table crm_inbox_messages, seo_keyword_targets, seo_pages to service_role;
