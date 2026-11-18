ALTER TABLE public.day_favorite_threads ADD COLUMN IF NOT EXISTS relationship_id text REFERENCES public.day_relationships(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS day_favorite_threads_rel_date ON public.day_favorite_threads(tenant_id,relationship_id,last_message_on DESC);
