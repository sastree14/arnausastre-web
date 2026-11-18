-- Explicit association between private day-to-day notes (including audio) and a curated relationship.
-- Backwards compatible: existing notes remain unchanged, and all existing RLS policies stay in force.
alter table public.day_notes add column if not exists relation_id text null;
create index if not exists day_notes_tenant_relation_created_idx
  on public.day_notes (tenant_id, relation_id, created_at desc)
  where relation_id is not null;
comment on column public.day_notes.relation_id is
  'Optional explicit curated day_relationships.id; validated server-side with tenant before notes are created.';
