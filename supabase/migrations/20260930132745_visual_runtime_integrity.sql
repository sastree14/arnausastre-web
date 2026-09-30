alter table public.publication_plans
  add constraint publication_plans_content_object_id_fkey
  foreign key (content_object_id)
  references public.canonical_content_objects(content_object_id)
  on delete cascade;

alter table public.presentation_packages
  add constraint presentation_packages_content_object_id_fkey
  foreign key (content_object_id)
  references public.canonical_content_objects(content_object_id)
  on delete cascade;

alter table public.visual_render_runs
  add constraint visual_render_runs_design_id_fkey
  foreign key (design_id)
  references public.visual_designs(design_id)
  on delete set null;

drop index if exists public.idx_visual_candidates_selected;
create unique index uq_visual_candidates_selected
  on public.visual_candidates(package_id)
  where selected = true;
