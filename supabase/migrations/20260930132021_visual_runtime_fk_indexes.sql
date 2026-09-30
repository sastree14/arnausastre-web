create index if not exists idx_visual_system_versions_tenant
  on public.visual_system_versions(tenant_id);

create index if not exists idx_presentation_packages_tenant
  on public.presentation_packages(tenant_id);

create index if not exists idx_visual_candidates_tenant
  on public.visual_candidates(tenant_id);

create index if not exists idx_visual_render_runs_tenant
  on public.visual_render_runs(tenant_id);

create index if not exists idx_visual_designs_tenant
  on public.visual_designs(tenant_id);

create index if not exists idx_content_items_visual_design
  on public.content_items(visual_design_id);
