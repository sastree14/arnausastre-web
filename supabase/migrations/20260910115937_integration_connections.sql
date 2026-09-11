create table if not exists integration_connections (
  connection_id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  provider text not null,
  account_type text not null,
  provider_subject text not null,
  display_name text not null default '',
  access_token_ciphertext text not null,
  token_expires_at timestamptz,
  scopes text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, provider, account_type, provider_subject)
);

create index if not exists integration_connections_lookup_idx
  on integration_connections (tenant_id, provider, account_type);

alter table integration_connections enable row level security;
revoke all on table integration_connections from anon, authenticated;
grant select, insert, update, delete on table integration_connections to service_role;
