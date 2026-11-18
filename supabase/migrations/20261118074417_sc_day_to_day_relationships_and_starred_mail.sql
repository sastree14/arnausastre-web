-- Private SC-Analytics daily relationships and curated Gmail favorites.
CREATE TABLE IF NOT EXISTS public.day_relationships (
 id text PRIMARY KEY,
 tenant_id text NOT NULL DEFAULT 'sc-analytics',
 display_name text NOT NULL CHECK(length(btrim(display_name)) BETWEEN 1 AND 160),
 role text NOT NULL CHECK(role IN ('client','collaborator','worker')),
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','waiting','dormant','closed')),
 user_curated boolean NOT NULL DEFAULT false,
 contact_email text,
 last_interaction_on date,
 last_interaction_kind text CHECK(last_interaction_kind IN ('email','meeting','slack','platform','manual')),
 last_interaction_summary text NOT NULL DEFAULT '',
 last_interaction_url text,
 next_meeting_on date,
 next_review_on date,
 followup_count smallint NOT NULL DEFAULT 0 CHECK(followup_count BETWEEN 0 AND 2),
 followup_policy text NOT NULL DEFAULT 'context' CHECK(followup_policy IN ('context','seven_days','meeting_followup','specific_date','manual_only')),
 notes text NOT NULL DEFAULT '',
 last_verified_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS day_relationships_name_unique ON public.day_relationships(tenant_id,lower(display_name));
CREATE INDEX IF NOT EXISTS day_relationships_active_idx ON public.day_relationships(tenant_id,role,status,last_interaction_on DESC);
CREATE TABLE IF NOT EXISTS public.day_favorite_threads (
 id text PRIMARY KEY,
 tenant_id text NOT NULL DEFAULT 'sc-analytics',
 account_email text NOT NULL,
 thread_id text NOT NULL,
 contact_email text NOT NULL,
 contact_name text NOT NULL DEFAULT '',
 subject text NOT NULL DEFAULT '',
 last_message_on date,
 last_message_at timestamptz,
 last_direction text NOT NULL DEFAULT 'unknown' CHECK(last_direction IN ('inbound','outbound','unknown')),
 message_count integer NOT NULL DEFAULT 0,
 has_star boolean NOT NULL DEFAULT false,
 has_user_reply boolean NOT NULL DEFAULT false,
 is_business boolean NOT NULL DEFAULT false,
 eligible boolean NOT NULL DEFAULT false,
 exclusion_reason text,
 thread_url text,
 reviewed_at timestamptz NOT NULL DEFAULT now(),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,account_email,thread_id)
);
CREATE INDEX IF NOT EXISTS day_favorite_threads_latest ON public.day_favorite_threads(tenant_id,eligible,contact_email,last_message_at DESC);
ALTER TABLE public.day_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_favorite_threads ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.day_relationships,public.day_favorite_threads FROM anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.day_relationships,public.day_favorite_threads TO service_role;
COMMENT ON TABLE public.day_relationships IS 'User curated active client/partner/worker relationships, with last interactions.';
COMMENT ON TABLE public.day_favorite_threads IS 'Verified starred two-way business Gmail threads, server only.';
