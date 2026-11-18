-- Private verified calendar snapshots for Día a día; usable while CMI Google OAuth calendar scope is missing.
CREATE TABLE IF NOT EXISTS public.day_meetings (
  id text PRIMARY KEY,
  tenant_id text NOT NULL DEFAULT 'sc-analytics',
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed','tentative','needs_reschedule','cancelled')),
  calendar_url text NOT NULL DEFAULT '',
  meet_url text,
  organizer_email text NOT NULL DEFAULT '',
  attendees jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  source_checked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT day_meetings_nonempty_title CHECK (char_length(btrim(title))>0),
  CONSTRAINT day_meetings_valid_range CHECK(ends_at>starts_at)
);
CREATE INDEX IF NOT EXISTS day_meetings_day ON public.day_meetings(tenant_id,starts_at,status);
ALTER TABLE public.day_meetings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.day_meetings FROM anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE public.day_meetings TO service_role;
COMMENT ON TABLE public.day_meetings IS 'Private calendar snapshots from verified Google Calendar; source_checked_at indicates age of observations.';
