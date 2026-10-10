-- Ordered approved Figma publications, private worker configuration and an atomic queue.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create schema if not exists editorial_private;
revoke all on schema editorial_private from public, anon, authenticated;
create table if not exists editorial_private.worker_capabilities (
  name text primary key, token_hash text not null, expires_at timestamptz not null
);
alter table editorial_private.worker_capabilities enable row level security;
create table if not exists editorial_private.configuration (name text primary key, value jsonb not null);
alter table editorial_private.configuration enable row level security;
create table if not exists public.editorial_publication_jobs (
  content_id text primary key references public.content_items(content_id),
  state text not null default 'scheduled' check (state in ('scheduled','reserved','publishing','published','failed','uncertain','paused')),
  attempts integer not null default 0,
  claim_id uuid, claimed_at timestamptz, request_sent_at timestamptz,
  last_error text, next_attempt_at timestamptz, completed_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.editorial_publication_jobs enable row level security;
revoke all on public.editorial_publication_jobs from anon, authenticated;
grant all on public.editorial_publication_jobs to service_role;
create table if not exists public.editorial_worker_runs (
  run_id uuid primary key default extensions.gen_random_uuid(),
  started_at timestamptz not null default now(), status text not null, detail jsonb not null default '{}'
);
alter table public.editorial_worker_runs enable row level security;
revoke all on public.editorial_worker_runs from anon, authenticated;
grant all on public.editorial_worker_runs to service_role;

create or replace function public.editorial_worker_authorized(p_name text,p_token text)
returns boolean language sql security definer set search_path='' as $$
select exists(select 1 from editorial_private.worker_capabilities
where name=p_name and expires_at>now() and token_hash=encode(extensions.digest(p_token,'sha256'),'hex'))
$$;
revoke all on function public.editorial_worker_authorized(text,text) from public,anon,authenticated;
grant execute on function public.editorial_worker_authorized(text,text) to service_role;

-- Called only by the CI setup job with server-held secrets, never by a browser.
create or replace function public.editorial_configure_worker(p_encryption_key text,p_organization_id text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare existing uuid;
begin
  if octet_length(decode(p_encryption_key,'base64'))<>32 then raise exception 'Invalid encryption key'; end if;
  select id into existing from vault.secrets where name='editorial_encryption_key';
  if existing is null then perform vault.create_secret(p_encryption_key,'editorial_encryption_key');
  else perform vault.update_secret(existing,p_encryption_key); end if;
  insert into editorial_private.configuration(name,value)
  values ('linkedin',jsonb_build_object('organization_id',p_organization_id,'api_version','202608'))
  on conflict(name) do update set value=excluded.value;
  return jsonb_build_object('key_configured',true,'organization_configured',p_organization_id<>'');
end $$;
revoke all on function public.editorial_configure_worker(text,text) from public,anon,authenticated;
grant execute on function public.editorial_configure_worker(text,text) to service_role;

create or replace function public.editorial_worker_credentials()
returns jsonb language sql security definer set search_path='' as $$
select jsonb_build_object('encryption_key',(select decrypted_secret from vault.decrypted_secrets where name='editorial_encryption_key'),
'config',(select value from editorial_private.configuration where name='linkedin'),
'connection',(select to_jsonb(c) from public.integration_connections c where tenant_id='sc-analytics' and provider='linkedin' and account_type='member' order by updated_at desc limit 1))
$$;
revoke all on function public.editorial_worker_credentials() from public,anon,authenticated;
grant execute on function public.editorial_worker_credentials() to service_role;

create or replace function public.editorial_claim_due()
returns jsonb language plpgsql security definer set search_path='' as $$
declare chosen text; claim uuid; result jsonb;
begin
  -- An interrupted request may have reached LinkedIn: never retry it blindly.
  update public.editorial_publication_jobs set state=case when request_sent_at is null then 'failed' else 'uncertain' end,
  last_error='Worker interrupted; inspect LinkedIn before retrying',updated_at=now()
  where state='publishing' and claimed_at<now()-interval '10 minutes';
  select j.content_id into chosen from public.editorial_publication_jobs j join public.content_items c using(content_id)
  where j.state in ('scheduled','failed') and j.attempts<3 and c.status in ('scheduled','approved')
  and c.scheduled_at is not null and c.scheduled_at<=now() and c.external_post_id is null
  and (j.next_attempt_at is null or j.next_attempt_at<=now())
  and exists(select 1 from public.approvals a where a.target_id=c.content_id and a.action_type='publish_editorial' and a.status='approved')
  order by c.scheduled_at for update of j skip locked limit 1;
  if chosen is null then return null; end if;
  claim=extensions.gen_random_uuid();
  update public.editorial_publication_jobs set state='publishing',claim_id=claim,claimed_at=now(),request_sent_at=null,attempts=attempts+1,updated_at=now() where content_id=chosen;
  select jsonb_build_object('claim_id',claim,'item',to_jsonb(c)) into result from public.content_items c where content_id=chosen;
  return result;
end $$;
revoke all on function public.editorial_claim_due() from public,anon,authenticated;
grant execute on function public.editorial_claim_due() to service_role;

create or replace function public.editorial_finish_job(p_content_id text,p_claim uuid,p_state text,p_post_id text default null,p_error text default null)
returns void language plpgsql security definer set search_path='' as $$
begin
  if p_state not in ('published','failed','uncertain') then raise exception 'Invalid result'; end if;
  update public.editorial_publication_jobs set state=p_state,last_error=p_error,completed_at=case when p_state='published' then now() else null end,
  next_attempt_at=case when p_state='failed' then now()+interval '15 minutes' else null end,updated_at=now()
  where content_id=p_content_id and claim_id=p_claim and state='publishing';
  if not found then raise exception 'Claim no longer owns publication'; end if;
  if p_state='published' then
    if p_post_id is null or p_post_id='' then raise exception 'Missing LinkedIn post ID'; end if;
    update public.content_items set status='published',external_post_id=p_post_id,
    external_post_url='https://www.linkedin.com/feed/update/'||p_post_id||'/',published_at=now() where content_id=p_content_id;
    update public.approvals set status='executed',executed_at=now() where target_id=p_content_id and action_type='publish_editorial' and status='approved';
  end if;
end $$;
revoke all on function public.editorial_finish_job(text,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.editorial_finish_job(text,uuid,text,text,text) to service_role;

-- The recurring scheduler has a separate, scoped capability stored in Vault.
do $$
declare token text;
begin
  if not exists(select 1 from vault.secrets where name='editorial_tick_capability') then
    token=encode(extensions.gen_random_bytes(48),'hex');
    perform vault.create_secret(token,'editorial_tick_capability');
    insert into editorial_private.worker_capabilities(name,token_hash,expires_at)
    values('publisher',encode(extensions.digest(token,'sha256'),'hex'),now()+interval '5 years')
    on conflict(name) do update set token_hash=excluded.token_hash,expires_at=excluded.expires_at;
  end if;
end $$;
select cron.schedule('sc-editorial-publisher','*/5 * * * *',
  $cron$select net.http_post(url:='https://iviggrsbwrgrtqvbqepq.supabase.co/functions/v1/editorial-publisher',
  headers:=jsonb_build_object('Content-Type','application/json','x-editorial-capability',(select decrypted_secret from vault.decrypted_secrets where name='editorial_tick_capability')),
  body:='{}'::jsonb,timeout_milliseconds:=120000);$cron$);


