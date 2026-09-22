create table if not exists public.newsletter_subscribers (
  subscriber_id text primary key,
  tenant_id text not null default 'sc-analytics',
  email text not null,
  name text,
  company text,
  language text not null default 'es' check (language in ('es','ca','en')),
  interests text[] not null default '{}',
  source_path text,
  status text not null default 'active' check (status in ('active','unsubscribed','bounced')),
  consent_version text not null default '2026-09',
  consent_at timestamptz not null default now(),
  unsubscribe_token text not null unique,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, email)
);

create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers (tenant_id, status, created_at desc);

alter table public.newsletter_subscribers enable row level security;
revoke all on table public.newsletter_subscribers from anon, authenticated;
grant select, insert, update, delete on table public.newsletter_subscribers to service_role;

create table if not exists public.newsletter_campaigns (
  campaign_id text primary key,
  tenant_id text not null default 'sc-analytics',
  campaign_type text not null default 'digest',
  subject text,
  content_refs text[] not null default '{}',
  recipients_count integer not null default 0,
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  status text not null default 'created',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

alter table public.newsletter_campaigns enable row level security;
revoke all on table public.newsletter_campaigns from anon, authenticated;
grant select, insert, update, delete on table public.newsletter_campaigns to service_role;

do $$
begin
  if to_regclass('public.crm_ui_events') is not null then
    drop trigger if exists growth_ui_event_newsletter_subscribers on public.newsletter_subscribers;
    create trigger growth_ui_event_newsletter_subscribers
      after insert or update or delete on public.newsletter_subscribers
      for each row execute function public.growth_emit_ui_event();
  end if;
end $$;
