create table if not exists weekly_reviews (
  review_id text primary key,
  tenant_id text not null,
  week_start date not null,
  review jsonb not null default '{}'::jsonb,
  evidence_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (tenant_id, week_start)
);
