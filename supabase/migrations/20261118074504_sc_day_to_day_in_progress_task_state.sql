ALTER TABLE public.day_tasks DROP CONSTRAINT IF EXISTS day_tasks_status_check;
ALTER TABLE public.day_tasks ADD CONSTRAINT day_tasks_status_check CHECK(status IN ('open','in_progress','waiting','done','archived'));
