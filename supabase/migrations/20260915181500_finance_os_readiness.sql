alter table public.integration_connections add column if not exists refresh_token_ciphertext text;

alter table public.finance_counterparties add column if not exists phone text;
alter table public.finance_counterparties add column if not exists payment_terms_days integer not null default 30;
alter table public.finance_counterparties add column if not exists billing_email text;
alter table public.finance_counterparties add column if not exists notes text;

alter table public.finance_invoices add column if not exists series text not null default 'SC';
alter table public.finance_invoices add column if not exists notes text;
alter table public.finance_invoices add column if not exists tax_rule_key text;
alter table public.finance_invoices add column if not exists tax_notes text;
alter table public.finance_invoices add column if not exists reviewed_at timestamptz;
alter table public.finance_invoices add column if not exists issued_at timestamptz;
alter table public.finance_invoices add column if not exists sent_at timestamptz;
alter table public.finance_invoices add column if not exists paid_at timestamptz;
alter table public.finance_invoices add column if not exists immutable_hash text;
alter table public.finance_invoices add column if not exists rectifies_invoice_id text;
alter table public.finance_invoices add column if not exists xlsx_drive_file_id text;
alter table public.finance_invoices add column if not exists verifactu_status text not null default 'not_submitted';
alter table public.finance_invoices add column if not exists qr_payload text;

alter table public.finance_expenses add column if not exists invoice_number text;
alter table public.finance_expenses add column if not exists gmail_message_id text;
alter table public.finance_expenses add column if not exists gmail_thread_id text;
alter table public.finance_expenses add column if not exists source_account text;
alter table public.finance_expenses add column if not exists extraction_confidence numeric;
alter table public.finance_expenses add column if not exists duplicate_key text;
alter table public.finance_expenses add column if not exists reviewed_at timestamptz;
alter table public.finance_expenses add column if not exists paid_at timestamptz;
create unique index if not exists finance_expenses_duplicate_key_unique on public.finance_expenses(tenant_id, duplicate_key) where coalesce(duplicate_key,'') <> '';

alter table public.finance_payments add column if not exists bank_transaction_id text;
alter table public.finance_payments add column if not exists reconciliation_status text not null default 'unmatched';
alter table public.finance_payments add column if not exists reviewed_at timestamptz;

create table if not exists public.finance_import_candidates (
  candidate_id text primary key,
  tenant_id text not null,
  source_provider text not null,
  source_account text,
  source_message_id text,
  source_thread_id text,
  source_url text,
  candidate_type text not null default 'expense',
  extracted_data jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0,
  duplicate_key text,
  status text not null default 'pending_review',
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists finance_import_candidates_queue_idx on public.finance_import_candidates(tenant_id,status,created_at desc);
create unique index if not exists finance_import_candidates_source_unique on public.finance_import_candidates(tenant_id,source_provider,source_account,source_message_id) where coalesce(source_message_id,'') <> '';

create table if not exists public.finance_bank_accounts (
  bank_account_id text primary key,
  tenant_id text not null,
  provider text not null,
  provider_account_id text,
  display_name text not null,
  iban_last4 text,
  currency text not null default 'EUR',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id,provider,provider_account_id)
);

create table if not exists public.finance_bank_transactions (
  bank_transaction_id text primary key,
  tenant_id text not null,
  bank_account_id text,
  provider text not null,
  provider_transaction_id text not null,
  booked_at timestamptz,
  completed_at timestamptz,
  direction text not null,
  currency text not null,
  amount numeric not null,
  amount_eur numeric,
  fx_rate numeric,
  counterparty_name text,
  reference text,
  status text not null default 'completed',
  raw_payload jsonb not null default '{}'::jsonb,
  reconciliation_status text not null default 'unmatched',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id,provider,provider_transaction_id)
);
create index if not exists finance_bank_transactions_date_idx on public.finance_bank_transactions(tenant_id,booked_at desc);
create index if not exists finance_bank_transactions_recon_idx on public.finance_bank_transactions(tenant_id,reconciliation_status,booked_at desc);

create table if not exists public.finance_reconciliations (
  reconciliation_id text primary key,
  tenant_id text not null,
  bank_transaction_id text not null,
  entity_type text not null,
  entity_id text not null,
  matched_amount numeric not null,
  currency text not null,
  confidence numeric not null default 1,
  status text not null default 'proposed',
  matched_by text not null default 'system',
  notes text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);
create index if not exists finance_reconciliations_tx_idx on public.finance_reconciliations(tenant_id,bank_transaction_id,status);
create index if not exists finance_reconciliations_entity_idx on public.finance_reconciliations(tenant_id,entity_type,entity_id,status);

create table if not exists public.finance_accounts (
  account_code text not null,
  tenant_id text not null,
  name text not null,
  account_type text not null,
  normal_balance text not null,
  parent_code text,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  primary key(tenant_id,account_code)
);

insert into public.finance_accounts(tenant_id,account_code,name,account_type,normal_balance,parent_code) values
('sc-analytics','1000','Banco','asset','debit',null),
('sc-analytics','1200','Clientes','asset','debit',null),
('sc-analytics','2000','Proveedores y acreedores','liability','credit',null),
('sc-analytics','2100','IVA repercutido','liability','credit',null),
('sc-analytics','2110','IVA soportado','asset','debit',null),
('sc-analytics','2120','Retenciones IRPF','asset','debit',null),
('sc-analytics','4000','Ingresos por servicios','revenue','credit',null),
('sc-analytics','5000','Gastos operativos','expense','debit',null),
('sc-analytics','5100','Software y suscripciones','expense','debit','5000'),
('sc-analytics','5200','Comisiones y plataformas','expense','debit','5000'),
('sc-analytics','5300','Cuota autónomo y seguridad social','expense','debit','5000')
on conflict (tenant_id,account_code) do nothing;

create table if not exists public.finance_journal_entries (
  journal_entry_id text primary key,
  tenant_id text not null,
  entry_date date not null,
  source_type text not null,
  source_id text,
  description text not null,
  status text not null default 'draft',
  posted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists finance_journal_entries_date_idx on public.finance_journal_entries(tenant_id,entry_date desc,status);

create table if not exists public.finance_journal_lines (
  journal_line_id text primary key,
  tenant_id text not null,
  journal_entry_id text not null,
  account_code text not null,
  description text,
  debit numeric not null default 0,
  credit numeric not null default 0,
  currency text not null default 'EUR',
  amount_native numeric,
  fx_rate numeric,
  created_at timestamptz not null default now(),
  check (debit >= 0 and credit >= 0),
  check (not (debit > 0 and credit > 0))
);
create index if not exists finance_journal_lines_entry_idx on public.finance_journal_lines(tenant_id,journal_entry_id);
create index if not exists finance_journal_lines_account_idx on public.finance_journal_lines(tenant_id,account_code);

create table if not exists public.finance_audit_events (
  audit_event_id text primary key,
  tenant_id text not null,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  actor text not null default 'system',
  before_data jsonb,
  after_data jsonb,
  notes text,
  occurred_at timestamptz not null default now()
);
create index if not exists finance_audit_events_entity_idx on public.finance_audit_events(tenant_id,entity_type,entity_id,occurred_at desc);

create table if not exists public.finance_invoice_sequences (
  tenant_id text not null,
  series text not null,
  fiscal_year integer not null,
  last_number integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key(tenant_id,series,fiscal_year)
);

create or replace function public.finance_next_invoice_number(p_tenant_id text, p_series text, p_fiscal_year integer)
returns text
language plpgsql
security definer
set search_path=public
as $$
declare v_number integer;
begin
  insert into finance_invoice_sequences(tenant_id,series,fiscal_year,last_number)
  values(p_tenant_id,p_series,p_fiscal_year,1)
  on conflict(tenant_id,series,fiscal_year)
  do update set last_number=finance_invoice_sequences.last_number+1, updated_at=now()
  returning last_number into v_number;
  return p_series || '-' || p_fiscal_year::text || '-' || lpad(v_number::text,3,'0');
end;
$$;

create or replace function public.finance_period_report(p_start date, p_end date)
returns jsonb
language sql
stable
security definer
set search_path=public
as $$
select jsonb_build_object(
  'period_start',p_start,
  'period_end',p_end,
  'invoiced',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_invoices where tenant_id='sc-analytics' and issue_date between p_start and p_end and status not in ('void','cancelled')),0),
  'expenses',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_expenses where tenant_id='sc-analytics' and expense_date between p_start and p_end and status not in ('void','cancelled')),0),
  'cash_in',coalesce((select sum(coalesce(amount_eur,amount,0)) from finance_payments where tenant_id='sc-analytics' and payment_date between p_start and p_end and direction='inflow' and status not in ('void','cancelled')),0),
  'cash_out',coalesce((select sum(coalesce(amount_eur,amount,0)) from finance_payments where tenant_id='sc-analytics' and payment_date between p_start and p_end and direction='outflow' and status not in ('void','cancelled')),0),
  'vat_output',coalesce((select sum(coalesce(tax,0)) from finance_invoices where tenant_id='sc-analytics' and issue_date between p_start and p_end and status not in ('void','cancelled')),0),
  'vat_input',coalesce((select sum(coalesce(tax,0)) from finance_expenses where tenant_id='sc-analytics' and expense_date between p_start and p_end and status not in ('void','cancelled')),0),
  'withholding',coalesce((select sum(coalesce(withholding_amount,0)) from finance_invoices where tenant_id='sc-analytics' and issue_date between p_start and p_end and status not in ('void','cancelled')),0)
);
$$;

create or replace function public.growth_finance_bundle()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
select jsonb_build_object(
  'companies', coalesce((select jsonb_agg(to_jsonb(x)) from (select company_id,name from companies where tenant_id='sc-analytics' order by name limit 500) x),'[]'::jsonb),
  'counterparties', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_counterparties where tenant_id='sc-analytics' order by legal_name limit 500) x),'[]'::jsonb),
  'projects', coalesce((select jsonb_agg(to_jsonb(x)) from (select project_id,name,status from operations_projects where tenant_id='sc-analytics' order by created_at desc limit 300) x),'[]'::jsonb),
  'invoices', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_invoices where tenant_id='sc-analytics' order by issue_date desc nulls last, created_at desc limit 500) x),'[]'::jsonb),
  'expenses', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_expenses where tenant_id='sc-analytics' order by expense_date desc nulls last, created_at desc limit 500) x),'[]'::jsonb),
  'payments', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_payments where tenant_id='sc-analytics' order by payment_date desc nulls last, created_at desc limit 500) x),'[]'::jsonb),
  'tax_periods', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_tax_periods where tenant_id='sc-analytics' order by period_start desc limit 50) x),'[]'::jsonb),
  'import_candidates', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_import_candidates where tenant_id='sc-analytics' and status='pending_review' order by created_at desc limit 100) x),'[]'::jsonb),
  'bank_accounts', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_bank_accounts where tenant_id='sc-analytics' order by display_name limit 50) x),'[]'::jsonb),
  'bank_transactions', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_bank_transactions where tenant_id='sc-analytics' order by booked_at desc nulls last limit 200) x),'[]'::jsonb),
  'invoiced', coalesce((select sum(coalesce(amount_eur,total,0)) from finance_invoices where tenant_id='sc-analytics' and status not in ('void','cancelled')),0),
  'received', coalesce((select sum(coalesce(amount_eur,amount,0)) from finance_payments where tenant_id='sc-analytics' and direction='inflow' and status in ('received','confirmed','matched')),0),
  'spent', coalesce((select sum(coalesce(amount_eur,total,0)) from finance_expenses where tenant_id='sc-analytics' and status not in ('void','cancelled')),0),
  'vat_output', coalesce((select sum(coalesce(tax,0)) from finance_invoices where tenant_id='sc-analytics' and status not in ('void','cancelled')),0),
  'vat_input', coalesce((select sum(coalesce(tax,0)) from finance_expenses where tenant_id='sc-analytics' and status not in ('void','cancelled')),0),
  'withholding_total', coalesce((select sum(coalesce(withholding_amount,0)) from finance_invoices where tenant_id='sc-analytics' and status not in ('void','cancelled')),0),
  'gmail_connections', coalesce((select jsonb_agg(jsonb_build_object('connection_id',connection_id,'account_type',account_type,'display_name',display_name,'provider_subject',provider_subject,'connected_at',connected_at,'updated_at',updated_at,'metadata',metadata)) from integration_connections where tenant_id='sc-analytics' and provider='gmail'),'[]'::jsonb),
  'revolut_connections', coalesce((select jsonb_agg(jsonb_build_object('connection_id',connection_id,'account_type',account_type,'display_name',display_name,'provider_subject',provider_subject,'connected_at',connected_at,'updated_at',updated_at,'metadata',metadata)) from integration_connections where tenant_id='sc-analytics' and provider='revolut'),'[]'::jsonb)
);
$$;

revoke all on function public.finance_next_invoice_number(text,text,integer) from public, anon, authenticated;
grant execute on function public.finance_next_invoice_number(text,text,integer) to service_role;
revoke all on function public.finance_period_report(date,date) from public, anon, authenticated;
grant execute on function public.finance_period_report(date,date) to service_role;
revoke all on function public.growth_finance_bundle() from public, anon, authenticated;
grant execute on function public.growth_finance_bundle() to service_role;

grant all on table public.finance_import_candidates to service_role;
grant all on table public.finance_bank_accounts to service_role;
grant all on table public.finance_bank_transactions to service_role;
grant all on table public.finance_reconciliations to service_role;
grant all on table public.finance_accounts to service_role;
grant all on table public.finance_journal_entries to service_role;
grant all on table public.finance_journal_lines to service_role;
grant all on table public.finance_audit_events to service_role;
grant all on table public.finance_invoice_sequences to service_role;
