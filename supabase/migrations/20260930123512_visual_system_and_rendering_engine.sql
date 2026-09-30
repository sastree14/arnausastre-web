create table if not exists public.visual_system_versions (
  version_id text primary key,
  tenant_id text not null references public.growth_tenants(tenant_id) on delete cascade,
  status text not null default 'draft' check (status in ('draft','active','archived')),
  spec jsonb not null default '{}'::jsonb,
  spec_yaml text not null default '',
  documentation_markdown text not null default '',
  repo_paths jsonb not null default '[]'::jsonb,
  docs_url text,
  created_at timestamptz not null default now(),
  activated_at timestamptz
);

create unique index if not exists uq_visual_system_versions_active_tenant
  on public.visual_system_versions(tenant_id)
  where status = 'active';

create table if not exists public.publication_plans (
  plan_id text primary key,
  tenant_id text not null references public.growth_tenants(tenant_id) on delete cascade,
  content_object_id text not null default '',
  channel text not null check (channel in ('linkedin','website_article','website_project','marketplace_project')),
  format_key text not null check (format_key in ('carousel','dataviz','architecture','before_after')),
  requested_visual_language text not null default 'AUTO'
    check (requested_visual_language in ('AUTO','A','B','C','D')),
  candidate_count integer not null default 3 check (candidate_count between 1 and 3),
  plan_json jsonb not null default '{}'::jsonb,
  status text not null default 'planning'
    check (status in ('planning','ready','needs_review','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_publication_plans_tenant_status
  on public.publication_plans(tenant_id, status, created_at desc);
create index if not exists idx_publication_plans_content_object
  on public.publication_plans(content_object_id);

create table if not exists public.presentation_packages (
  package_id text primary key,
  tenant_id text not null references public.growth_tenants(tenant_id) on delete cascade,
  plan_id text not null references public.publication_plans(plan_id) on delete cascade,
  content_object_id text not null default '',
  channel text not null,
  format_key text not null,
  visual_role text not null default '',
  external_copy_mode text not null default 'medium'
    check (external_copy_mode in ('minimal','medium','long','none')),
  package_json jsonb not null default '{}'::jsonb,
  status text not null default 'ready'
    check (status in ('draft','ready','needs_review','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_presentation_packages_plan
  on public.presentation_packages(plan_id);
create index if not exists idx_presentation_packages_content
  on public.presentation_packages(content_object_id);

create table if not exists public.visual_candidates (
  candidate_id text primary key,
  tenant_id text not null references public.growth_tenants(tenant_id) on delete cascade,
  package_id text not null references public.presentation_packages(package_id) on delete cascade,
  rank integer not null check (rank between 1 and 3),
  visual_language text not null check (visual_language in ('A','B','C','D')),
  format_key text not null check (format_key in ('carousel','dataviz','architecture','before_after')),
  semantic_pattern text not null default '',
  evidence_mode text not null default 'empirical'
    check (evidence_mode in ('empirical','illustrative','mixed')),
  spec jsonb not null default '{}'::jsonb,
  planner_score numeric(6,5) not null default 0,
  render_score numeric(6,5),
  planner_reason text not null default '',
  recommended boolean not null default false,
  selected boolean not null default false,
  status text not null default 'planned'
    check (status in ('planned','rendering','rendered','needs_review','rejected','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(package_id, rank)
);

create index if not exists idx_visual_candidates_package
  on public.visual_candidates(package_id, rank);
create index if not exists idx_visual_candidates_selected
  on public.visual_candidates(package_id, selected)
  where selected = true;

create table if not exists public.visual_render_runs (
  render_id text primary key,
  tenant_id text not null references public.growth_tenants(tenant_id) on delete cascade,
  candidate_id text not null references public.visual_candidates(candidate_id) on delete cascade,
  design_id text,
  asset_refs jsonb not null default '[]'::jsonb,
  layout_json jsonb not null default '[]'::jsonb,
  qa_report jsonb not null default '{}'::jsonb,
  status text not null default 'rendered'
    check (status in ('rendering','rendered','needs_review','failed','archived')),
  created_at timestamptz not null default now()
);

create index if not exists idx_visual_render_runs_candidate
  on public.visual_render_runs(candidate_id, created_at desc);

alter table public.visual_designs
  add column if not exists candidate_id text references public.visual_candidates(candidate_id) on delete set null,
  add column if not exists system_version_id text references public.visual_system_versions(version_id) on delete set null,
  add column if not exists visual_language text,
  add column if not exists semantic_pattern text,
  add column if not exists evidence_mode text,
  add column if not exists visual_spec jsonb not null default '{}'::jsonb,
  add column if not exists qa_report jsonb not null default '{}'::jsonb;

create index if not exists idx_visual_designs_candidate
  on public.visual_designs(candidate_id);
create index if not exists idx_visual_designs_system_version
  on public.visual_designs(system_version_id);

alter table public.visual_system_versions enable row level security;
alter table public.publication_plans enable row level security;
alter table public.presentation_packages enable row level security;
alter table public.visual_candidates enable row level security;
alter table public.visual_render_runs enable row level security;

revoke all on table public.visual_system_versions from anon, authenticated;
revoke all on table public.publication_plans from anon, authenticated;
revoke all on table public.presentation_packages from anon, authenticated;
revoke all on table public.visual_candidates from anon, authenticated;
revoke all on table public.visual_render_runs from anon, authenticated;

grant select, insert, update, delete on table public.visual_system_versions to service_role;
grant select, insert, update, delete on table public.publication_plans to service_role;
grant select, insert, update, delete on table public.presentation_packages to service_role;
grant select, insert, update, delete on table public.visual_candidates to service_role;
grant select, insert, update, delete on table public.visual_render_runs to service_role;

insert into public.visual_system_versions (
  version_id, tenant_id, status, spec, spec_yaml, documentation_markdown, repo_paths, docs_url, activated_at
) values (
  'sc_visual_v1',
  'sc-analytics',
  'active',
  jsonb_build_object(
    'version', 1,
    'name', 'SC-Analytics Visual System',
    'status', 'active',
    'canvas', jsonb_build_object('width',1080,'height',1350,'aspect_ratio','4:5'),
    'languages', jsonb_build_array('A','B','C','D'),
    'formats', jsonb_build_array('carousel','dataviz','architecture','before_after'),
    'principle', 'AI decides meaning; deterministic rules enforce design; geometry algorithms place elements.'
  ),
  '',
  'Human documentation lives in Google Drive and Git. Machine-readable rules live in growth/schemas/visual_system.yml.',
  jsonb_build_array(
    'growth/brain/content/visual_system.md',
    'growth/brain/content/visual_engine.md',
    'growth/schemas/visual_system.yml'
  ),
  'https://docs.google.com/document/d/1b0v3QRf_h_fr875uT1FJHMhH2sTw1qlxlK9hZKY-Uqk/edit?usp=drivesdk',
  now()
)
on conflict (version_id) do update set
  tenant_id = excluded.tenant_id,
  status = excluded.status,
  spec = excluded.spec,
  repo_paths = excluded.repo_paths,
  docs_url = excluded.docs_url,
  activated_at = coalesce(public.visual_system_versions.activated_at, excluded.activated_at);
