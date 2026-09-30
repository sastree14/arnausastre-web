create table if not exists public.canonical_content_objects (
  content_object_id text primary key,
  tenant_id text not null references public.growth_tenants(tenant_id) on delete cascade,
  status text not null default 'draft'
    check (status in ('draft','researching','validated','approved','archived')),
  origin text not null
    check (origin in ('portfolio_project','public_research','internal_knowledge','manual_idea','current_event','hybrid')),
  editorial_pillar text not null,
  content_family text not null,
  angle text not null default '',
  topic_entities jsonb not null default '[]'::jsonb,
  business_problem text not null default '',
  business_question text not null default '',
  thesis text not null default '',
  key_points jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  primary_objective text not null default 'authority',
  secondary_objectives jsonb not null default '[]'::jsonb,
  practical_takeaway text not null default '',
  desired_reader_action text not null default 'understand_concept',
  target_audience jsonb not null default '[]'::jsonb,
  industry_context jsonb not null default '[]'::jsonb,
  funnel_stage text not null default 'awareness',
  timeliness text not null default 'evergreen'
    check (timeliness in ('evergreen','timely','breaking','seasonal')),
  why_now text not null default '',
  valid_until timestamptz,
  confidentiality text not null default 'public'
    check (confidentiality in ('public','anonymized','restricted','internal')),
  language_context jsonb not null default '[]'::jsonb,
  risks_or_limits jsonb not null default '[]'::jsonb,
  output_hints jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_canonical_content_objects_editorial
  on public.canonical_content_objects(tenant_id, status, editorial_pillar, content_family, created_at desc);
create index if not exists idx_canonical_content_objects_origin
  on public.canonical_content_objects(tenant_id, origin, created_at desc);

alter table public.canonical_content_objects enable row level security;
revoke all on table public.canonical_content_objects from anon, authenticated;
grant select, insert, update, delete on table public.canonical_content_objects to service_role;

alter table public.editorial_briefs
  add column if not exists content_object_id text references public.canonical_content_objects(content_object_id) on delete set null;

create index if not exists idx_editorial_briefs_content_object
  on public.editorial_briefs(content_object_id);
