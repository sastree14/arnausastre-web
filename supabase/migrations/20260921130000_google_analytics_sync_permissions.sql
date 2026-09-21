-- Google marketing analytics sync writes through the service-role REST client.
-- These two tables were created without the DML grants used by the rest of the
-- operating-system tables, causing GA4/GSC sync to fail before Google API reads.
grant select, insert, update, delete on table public.analytics_sync_runs to service_role;
grant select, insert, update, delete on table public.search_console_daily to service_role;
