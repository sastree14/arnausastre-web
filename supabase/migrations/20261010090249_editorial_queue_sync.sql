create or replace function public.editorial_sync_content()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.visual_strategy->>'publisher'<>'editorial_edge' or new.visual_strategy->>'publisher' is null then return new; end if;
  if new.status in ('approved','scheduled') then
    insert into public.approvals(approval_id,tenant_id,action_type,target_id,summary,status,payload,decided_at)
    values('editorial_'||new.content_id,'sc-analytics','publish_editorial',new.content_id,'Figma-approved editorial publication','approved',jsonb_build_object('source','figma_manual','content_id',new.content_id),now())
    on conflict(approval_id) do update set status='approved',decided_at=now();
  elsif new.status not in ('published') then
    update public.approvals set status='rejected' where target_id=new.content_id and action_type='publish_editorial' and status='approved';
  end if;
  insert into public.editorial_publication_jobs(content_id,state)
  values(new.content_id,case when coalesce((new.visual_strategy->>'test_reserved')::boolean,false) then 'reserved' when new.status='scheduled' and new.scheduled_at is not null then 'scheduled' when new.status='published' then 'published' else 'paused' end)
  on conflict(content_id) do update set state=case
    when editorial_publication_jobs.state in ('publishing','uncertain','published') then editorial_publication_jobs.state
    else excluded.state end,updated_at=now();
  return new;
end $$;
create trigger editorial_content_queue_sync after insert or update of status,scheduled_at,visual_strategy on public.content_items for each row execute function public.editorial_sync_content();

create or replace function public.editorial_route_approval()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.action_type='publish_post' and exists(select 1 from public.content_items c where c.content_id=new.target_id and c.visual_strategy->>'publisher'='editorial_edge') then
    new.action_type='publish_editorial';
  end if;
  return new;
end $$;
create trigger editorial_approval_router before insert or update of action_type on public.approvals for each row execute function public.editorial_route_approval();

create or replace function public.editorial_request_tick(p_dry_run boolean default true,p_content_id text default null)
returns bigint language plpgsql security definer set search_path='' as $$
begin
  if p_content_id is not null and p_content_id !~ '^P[0-9]{3}$' then raise exception 'Invalid publication'; end if;
  return net.http_post(url:='https://iviggrsbwrgrtqvbqepq.supabase.co/functions/v1/editorial-publisher',
  headers:=jsonb_build_object('Content-Type','application/json','x-editorial-capability',(select decrypted_secret from vault.decrypted_secrets where name='editorial_tick_capability')),
  body:=jsonb_build_object('dry_run',p_dry_run,'content_id',p_content_id),timeout_milliseconds:=120000);
end $$;
revoke all on function public.editorial_request_tick(boolean,text) from public,anon,authenticated;
grant execute on function public.editorial_request_tick(boolean,text) to service_role;


