create table if not exists public.website_inquiries (
  inquiry_id text primary key,
  tenant_id text not null default 'sc-analytics',
  name text not null,
  company text,
  email text not null,
  message text not null,
  language text not null default 'es' check (language in ('es','ca','en')),
  source_path text,
  status text not null default 'new' check (status in ('new','contacted','qualified','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists website_inquiries_status_idx
  on public.website_inquiries (tenant_id, status, created_at desc);

alter table public.website_inquiries enable row level security;
revoke all on table public.website_inquiries from anon, authenticated;
grant select, insert, update, delete on table public.website_inquiries to service_role;

do $$
begin
  if to_regclass('public.crm_ui_events') is not null then
    drop trigger if exists growth_ui_event_website_inquiries on public.website_inquiries;
    create trigger growth_ui_event_website_inquiries
      after insert or update or delete on public.website_inquiries
      for each row execute function public.growth_emit_ui_event();
  end if;
end $$;
