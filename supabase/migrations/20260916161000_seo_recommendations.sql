create table if not exists seo_recommendations (
  recommendation_id text primary key,
  tenant_id text not null,
  keyword_id text references seo_keyword_targets(keyword_id) on delete set null,
  target_path text not null default '',
  title text not null,
  rationale text not null default '',
  priority numeric not null default 5,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'proposed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  applied_at timestamptz
);
create index if not exists seo_recommendations_status_idx on seo_recommendations (tenant_id, status, priority desc, created_at desc);
alter table seo_recommendations enable row level security;
revoke all on table seo_recommendations from anon, authenticated;
grant select, insert, update, delete on table seo_recommendations to service_role;
