create or replace function public.editorial_scheduler_status()
returns jsonb language sql security definer set search_path='' as $$
select jsonb_build_object(
'cron_enabled',exists(select 1 from cron.job where jobname='sc-editorial-publisher' and active),
'key_configured',exists(select 1 from vault.secrets where name='editorial_encryption_key'),
'organization_configured',coalesce((select value->>'organization_id'<>'' from editorial_private.configuration where name='linkedin'),false),
'organization_permission',coalesce((select scopes @> array['w_organization_social']::text[] from public.integration_connections where provider='linkedin' and account_type='member' order by updated_at desc limit 1),false),
'token_expires_at',(select token_expires_at from public.integration_connections where provider='linkedin' and account_type='member' order by updated_at desc limit 1),
'assets_expected',(select sum(jsonb_array_length(c.visual_strategy->'slides')) from public.content_items c where c.visual_strategy->>'publisher'='editorial_edge'),
'assets_stored',(select count(*) from storage.objects where bucket_id='growth-assets' and name like 'editorial/approved-2026-10/%'),
'scheduled',(select count(*) from public.editorial_publication_jobs where state='scheduled'),
'reserved',(select count(*) from public.editorial_publication_jobs where state='reserved'),
'last_run',(select jsonb_build_object('at',started_at,'status',status,'detail',detail) from public.editorial_worker_runs order by started_at desc limit 1))
$$;
revoke all on function public.editorial_scheduler_status() from public,anon,authenticated;
grant execute on function public.editorial_scheduler_status() to service_role;


