drop index if exists public.web_analytics_daily_sync_key_uq;
create unique index if not exists web_analytics_daily_sync_key_uq on public.web_analytics_daily(tenant_id,sync_key);
