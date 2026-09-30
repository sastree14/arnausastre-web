alter table public.publication_plans
  alter column content_object_id drop default;

alter table public.presentation_packages
  alter column content_object_id drop default;
