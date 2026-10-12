create or replace function public.editorial_configure_worker(p_encryption_key text,p_organization_id text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare existing uuid;
begin
  if octet_length(decode(p_encryption_key,'base64'))<>32 then raise exception 'Invalid encryption key'; end if;
  select id into existing from vault.secrets where name='editorial_encryption_key';
  if existing is null then perform vault.create_secret(p_encryption_key,'editorial_encryption_key');
  else perform vault.update_secret(existing,p_encryption_key); end if;
  insert into editorial_private.configuration(name,value)
  values ('linkedin',jsonb_build_object('organization_id',coalesce(nullif(p_organization_id,''),(select value->>'organization_id' from editorial_private.configuration where name='linkedin'),''),'api_version','202608'))
  on conflict(name) do update set value=excluded.value;
  return jsonb_build_object('key_configured',true,'organization_configured',p_organization_id<>'');
end $$;
revoke all on function public.editorial_configure_worker(text,text) from public,anon,authenticated;
grant execute on function public.editorial_configure_worker(text,text) to service_role;



