-- SC-Analytics day-to-day planning. Server-only private operational data.
CREATE TABLE IF NOT EXISTS public.day_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'sc-analytics',
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 240),
  details text NOT NULL DEFAULT '',
  lane text NOT NULL DEFAULT 'today' CHECK (lane IN ('today','week','waiting')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','waiting','done','archived')),
  source text NOT NULL DEFAULT 'manual',
  source_key text,
  due_on date,
  waiting_until date,
  priority integer NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  followup_count smallint NOT NULL DEFAULT 0 CHECK (followup_count BETWEEN 0 AND 2),
  contact_email text,
  related_url text,
  related_document_url text,
  related_entity text,
  last_inbound_at timestamptz,
  last_outbound_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS day_tasks_source_unique ON public.day_tasks (tenant_id, source, source_key) WHERE source_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS day_tasks_due_idx ON public.day_tasks (tenant_id, status, due_on);
CREATE INDEX IF NOT EXISTS day_tasks_wait_idx ON public.day_tasks (tenant_id, status, waiting_until);
CREATE INDEX IF NOT EXISTS day_tasks_contact_idx ON public.day_tasks (tenant_id, contact_email, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.day_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'sc-analytics',
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 240),
  body text NOT NULL DEFAULT '',
  meeting_date date,
  contact_email text,
  audio_path text,
  transcription_state text NOT NULL DEFAULT 'none' CHECK (transcription_state IN ('none','saved','transcribed','needs_text')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS day_notes_recent_idx ON public.day_notes (tenant_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.day_settings (
  tenant_id text PRIMARY KEY DEFAULT 'sc-analytics',
  timezone text NOT NULL DEFAULT 'Europe/Madrid',
  max_meetings_per_day integer NOT NULL DEFAULT 3 CHECK (max_meetings_per_day BETWEEN 1 AND 10),
  default_meeting_minutes integer NOT NULL DEFAULT 30 CHECK (default_meeting_minutes IN (15,20,30,45,60)),
  max_tasks_per_day integer NOT NULL DEFAULT 6 CHECK (max_tasks_per_day BETWEEN 1 AND 20),
  booking_start_local time NOT NULL DEFAULT '09:00',
  booking_end_local time NOT NULL DEFAULT '18:00',
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.day_settings(tenant_id) VALUES('sc-analytics') ON CONFLICT (tenant_id) DO NOTHING;
ALTER TABLE public.day_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.day_tasks,public.day_notes,public.day_settings FROM anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE public.day_tasks,public.day_notes,public.day_settings TO service_role;
COMMENT ON TABLE public.day_tasks IS 'Private SC-Analytics day planning, server-only.';
COMMENT ON TABLE public.day_notes IS 'Private meeting and voice notes, audio files stored in private Supabase Storage.';
