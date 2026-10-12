create or replace function public.editorial_pending_assets() returns jsonb language sql security definer set search_path='' as $$ select coalesce(jsonb_agg(to_jsonb(a)), '[]'::jsonb) from (select asset_key,payload from editorial_private.asset_imports where status='pending' order by asset_key limit 100) a $$;

