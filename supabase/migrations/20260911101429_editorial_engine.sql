create table if not exists editorial_signals (
  signal_id text primary key,
  tenant_id text not null,
  title text not null,
  source_url text not null,
  source_domain text not null default '',
  snippet text not null default '',
  query text not null default '',
  score numeric(4,2) not null default 0,
  status text not null default 'candidate',
  evaluation jsonb not null default '{}'::jsonb,
  discovered_at timestamptz not null default now(),
  unique (tenant_id, source_url)
);

create index if not exists editorial_signals_status_score_idx
  on editorial_signals (tenant_id, status, score desc);

create table if not exists editorial_briefs (
  brief_id text primary key,
  tenant_id text not null,
  signal_id text references editorial_signals(signal_id) on delete set null,
  family text not null,
  canonical_title text not null,
  thesis text not null default '',
  business_problem text not null default '',
  target_audience jsonb not null default '[]'::jsonb,
  why_now text not null default '',
  reasoning jsonb not null default '[]'::jsonb,
  practical_takeaway text not null default '',
  output_decision text not null,
  primary_linkedin_language text not null default 'es',
  article_value text not null default '',
  visual jsonb not null default '{}'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  weighted_score numeric(4,2) not null default 0,
  evidence jsonb not null default '[]'::jsonb,
  evidence_ids jsonb not null default '[]'::jsonb,
  research jsonb not null default '{}'::jsonb,
  risks_or_limits jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create index if not exists editorial_briefs_created_idx
  on editorial_briefs (tenant_id, created_at desc);

alter table content_items add column if not exists brief_id text;
alter table content_items add column if not exists language text not null default 'es';
alter table content_items add column if not exists content_family text not null default '';
alter table content_items add column if not exists quality_score numeric(4,2) not null default 0;
alter table content_items add column if not exists critique jsonb not null default '{}'::jsonb;
alter table content_items add column if not exists source_url text not null default '';

create index if not exists content_items_brief_idx on content_items (brief_id);
create index if not exists content_items_language_channel_idx on content_items (tenant_id, language, channel);

alter table editorial_signals enable row level security;
alter table editorial_briefs enable row level security;
revoke all on table editorial_signals, editorial_briefs from anon, authenticated;
grant select, insert, update, delete on table editorial_signals, editorial_briefs to service_role;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
