alter table editorial_briefs add column if not exists topic text default '';
alter table editorial_briefs add column if not exists industry text default '';
alter table editorial_briefs add column if not exists capability text default '';
alter table editorial_briefs add column if not exists objective text default 'authority';
alter table editorial_briefs add column if not exists funnel_stage text default 'awareness';
alter table editorial_briefs add column if not exists cta_type text default 'none';
alter table editorial_briefs add column if not exists hook_angle text default '';
alter table editorial_briefs add column if not exists strategy jsonb not null default '{}'::jsonb;

create index if not exists idx_editorial_briefs_diversity
  on editorial_briefs(created_at desc, family, capability, industry);
