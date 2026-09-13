create table if not exists visual_designs (
  design_id text primary key,
  tenant_id text not null references growth_tenants(tenant_id) on delete cascade,
  content_id text references content_items(content_id) on delete cascade,
  name text not null,
  template_key text not null,
  format_key text not null,
  publication_mode text not null default 'text_with_visual'
    check (publication_mode in ('text_only','text_with_visual','visual_first','image_only')),
  design_json jsonb not null default '{}'::jsonb,
  asset_path text default '',
  status text not null default 'draft'
    check (status in ('draft','attached','template','archived')),
  is_template boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_visual_designs_content_id on visual_designs(content_id);
create index if not exists idx_visual_designs_updated_at on visual_designs(updated_at desc);

alter table content_items
  add column if not exists publication_mode text not null default 'text_with_visual'
    check (publication_mode in ('text_only','text_with_visual','visual_first','image_only'));

alter table content_items
  add column if not exists visual_design_id text references visual_designs(design_id) on delete set null;

alter table visual_designs enable row level security;
revoke all on table visual_designs from anon, authenticated;
grant select, insert, update, delete on table visual_designs to service_role;
