create table if not exists public.finance_counterparties (
  counterparty_id text primary key,
  tenant_id text not null,
  kind text not null default 'client',
  company_id text,
  legal_name text not null,
  trade_name text,
  tax_id text,
  vat_id text,
  country_code text,
  billing_address text,
  email text,
  currency text not null default 'EUR',
  tax_profile text not null default 'spain_b2b',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists finance_counterparties_tenant_idx on public.finance_counterparties(tenant_id, kind, status);
create unique index if not exists finance_counterparties_tenant_tax_unique on public.finance_counterparties(tenant_id, tax_id) where coalesce(tax_id,'') <> '';

alter table public.finance_invoices add column if not exists counterparty_id text;
alter table public.finance_invoices add column if not exists recipient_legal_name text;
alter table public.finance_invoices add column if not exists recipient_tax_id text;
alter table public.finance_invoices add column if not exists recipient_country_code text;
alter table public.finance_invoices add column if not exists tax_profile text not null default 'spain_b2b';
alter table public.finance_invoices add column if not exists vat_rate numeric not null default 0;
alter table public.finance_invoices add column if not exists withholding_rate numeric not null default 0;
alter table public.finance_invoices add column if not exists withholding_amount numeric not null default 0;
alter table public.finance_invoices add column if not exists amount_eur numeric;
alter table public.finance_invoices add column if not exists fx_rate numeric;
alter table public.finance_invoices add column if not exists fx_date date;
alter table public.finance_invoices add column if not exists review_status text not null default 'pending_review';
alter table public.finance_invoices add column if not exists drive_folder_id text;
alter table public.finance_invoices add column if not exists pdf_drive_file_id text;
alter table public.finance_invoices add column if not exists sheet_drive_file_id text;
alter table public.finance_invoices add column if not exists source_system text not null default 'crm';

alter table public.finance_expenses add column if not exists counterparty_id text;
alter table public.finance_expenses add column if not exists vendor_tax_id text;
alter table public.finance_expenses add column if not exists vat_rate numeric not null default 0;
alter table public.finance_expenses add column if not exists withholding_rate numeric not null default 0;
alter table public.finance_expenses add column if not exists withholding_amount numeric not null default 0;
alter table public.finance_expenses add column if not exists amount_eur numeric;
alter table public.finance_expenses add column if not exists fx_rate numeric;
alter table public.finance_expenses add column if not exists fx_date date;
alter table public.finance_expenses add column if not exists review_status text not null default 'pending_review';
alter table public.finance_expenses add column if not exists drive_file_id text;
alter table public.finance_expenses add column if not exists source_system text not null default 'crm';

alter table public.finance_payments add column if not exists direction text not null default 'inflow';
alter table public.finance_payments add column if not exists expense_id text;
alter table public.finance_payments add column if not exists amount_eur numeric;
alter table public.finance_payments add column if not exists fx_rate numeric;
alter table public.finance_payments add column if not exists fx_date date;
alter table public.finance_payments add column if not exists review_status text not null default 'pending_review';
alter table public.finance_payments add column if not exists source_system text not null default 'crm';

create table if not exists public.finance_invoice_lines (
  line_id text primary key,
  tenant_id text not null,
  invoice_id text not null,
  position integer not null default 1,
  description text not null,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  vat_rate numeric not null default 0,
  line_subtotal numeric not null default 0,
  line_tax numeric not null default 0,
  line_total numeric not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists finance_invoice_lines_invoice_idx on public.finance_invoice_lines(tenant_id, invoice_id, position);

create table if not exists public.finance_documents (
  document_id text primary key,
  tenant_id text not null,
  entity_type text not null,
  entity_id text not null,
  document_type text not null,
  drive_file_id text,
  drive_url text,
  file_name text,
  mime_type text,
  editable boolean not null default true,
  version_no integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists finance_documents_entity_idx on public.finance_documents(tenant_id, entity_type, entity_id);

create table if not exists public.finance_exchange_rates (
  rate_id text primary key,
  tenant_id text not null,
  rate_date date not null,
  base_currency text not null,
  quote_currency text not null,
  rate numeric not null,
  source text,
  created_at timestamptz not null default now(),
  unique(tenant_id, rate_date, base_currency, quote_currency)
);

create table if not exists public.finance_tax_periods (
  tax_period_id text primary key,
  tenant_id text not null,
  period_type text not null,
  period_start date not null,
  period_end date not null,
  status text not null default 'open',
  vat_output numeric not null default 0,
  vat_input numeric not null default 0,
  withholding_total numeric not null default 0,
  estimated_vat_payable numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, period_type, period_start, period_end)
);

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
  'invoiced', coalesce((select sum(coalesce(amount_eur,total,0)) from finance_invoices where tenant_id='sc-analytics' and status not in ('void','cancelled')),0),
  'received', coalesce((select sum(coalesce(amount_eur,amount,0)) from finance_payments where tenant_id='sc-analytics' and direction='inflow' and status in ('received','confirmed','matched')),0),
  'spent', coalesce((select sum(coalesce(amount_eur,total,0)) from finance_expenses where tenant_id='sc-analytics' and status not in ('void','cancelled')),0),
  'vat_output', coalesce((select sum(coalesce(tax,0)) from finance_invoices where tenant_id='sc-analytics' and status not in ('void','cancelled')),0),
  'vat_input', coalesce((select sum(coalesce(tax,0)) from finance_expenses where tenant_id='sc-analytics' and status not in ('void','cancelled')),0),
  'withholding_total', coalesce((select sum(coalesce(withholding_amount,0)) from finance_invoices where tenant_id='sc-analytics' and status not in ('void','cancelled')),0)
);
$$;
revoke all on function public.growth_finance_bundle() from public, anon, authenticated;
grant execute on function public.growth_finance_bundle() to service_role;

grant all on table public.finance_counterparties to service_role;
grant all on table public.finance_invoice_lines to service_role;
grant all on table public.finance_documents to service_role;
grant all on table public.finance_exchange_rates to service_role;
grant all on table public.finance_tax_periods to service_role;
