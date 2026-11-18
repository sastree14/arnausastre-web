ALTER TABLE public.day_tasks ADD COLUMN IF NOT EXISTS scheduled_on date;
CREATE INDEX IF NOT EXISTS day_tasks_scheduled_idx ON public.day_tasks(tenant_id,status,scheduled_on);
COMMENT ON COLUMN public.day_tasks.scheduled_on IS 'Planned execution day, separate from hard deadline due_on; unfinished days carry forward.';
