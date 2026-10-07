create or replace function public.sc_schedule_knowledge_plan(
  p_tenant_id text,
  p_rows jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expected integer := coalesce(jsonb_array_length(p_rows), 0);
  v_updated integer := 0;
begin
  if p_tenant_id <> 'sc-analytics' then
    raise exception 'Unsupported tenant';
  end if;

  if jsonb_typeof(p_rows) <> 'array' or v_expected = 0 then
    raise exception 'Schedule payload must be a non-empty JSON array';
  end if;

  with schedule_rows as (
    select
      nullif(row->>'content_id', '') as content_id,
      nullif(row->>'scheduled_at', '')::timestamptz as scheduled_at
    from jsonb_array_elements(p_rows) as row
  )
  update public.content_items as item
     set status = 'scheduled',
         scheduled_at = schedule_rows.scheduled_at
    from schedule_rows
   where item.content_id = schedule_rows.content_id
     and item.tenant_id = p_tenant_id
     and item.content_type = 'article'
     and item.channel = 'website'
     and item.status = 'approved'
     and schedule_rows.scheduled_at is not null;

  get diagnostics v_updated = row_count;

  if v_updated <> v_expected then
    raise exception 'Knowledge schedule expected % approved rows but updated %', v_expected, v_updated;
  end if;

  return v_updated;
end;
$$;

revoke all on function public.sc_schedule_knowledge_plan(text, jsonb) from public, anon, authenticated;
grant execute on function public.sc_schedule_knowledge_plan(text, jsonb) to service_role;
