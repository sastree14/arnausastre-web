create or replace function public.editorial_protect_inflight_content()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if exists(select 1 from public.editorial_publication_jobs j where j.content_id=old.content_id and j.state='publishing')
  and new.status<>'published' and (new.body is distinct from old.body or new.title is distinct from old.title or new.status is distinct from old.status or new.scheduled_at is distinct from old.scheduled_at or new.visual_strategy is distinct from old.visual_strategy)
  then raise exception 'Publication is being sent; wait for its result before editing' using errcode='55000'; end if;
  return new;
end $$;
create trigger editorial_protect_inflight before update on public.content_items for each row execute function public.editorial_protect_inflight_content();
revoke all on function public.editorial_protect_inflight_content() from public,anon,authenticated;

create or replace function public.editorial_set_organization(p_organization_id text)
returns void language plpgsql security definer set search_path='' as $$
begin
  if p_organization_id !~ '^[0-9]{1,20}$' then raise exception 'Enter the numeric LinkedIn organization ID'; end if;
  insert into editorial_private.configuration(name,value) values('linkedin',jsonb_build_object('organization_id',p_organization_id,'api_version','202608'))
  on conflict(name) do update set value=editorial_private.configuration.value||jsonb_build_object('organization_id',p_organization_id);
end $$;
revoke all on function public.editorial_set_organization(text) from public,anon,authenticated;
grant execute on function public.editorial_set_organization(text) to service_role;


