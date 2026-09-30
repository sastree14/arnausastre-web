alter table public.canonical_content_objects
  add column if not exists commercial_spine jsonb not null default '{}'::jsonb;

create index if not exists idx_canonical_content_objects_commercial
  on public.canonical_content_objects
  using gin (commercial_spine jsonb_path_ops);
