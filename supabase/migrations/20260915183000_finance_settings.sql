create table if not exists public.finance_settings (
  tenant_id text primary key,
  legal_name text,
  tax_id text,
  billing_address text,
  billing_email text,
  phone text,
  website text,
  default_currency text not null default 'EUR',
  invoice_series text not null default 'SC',
  default_payment_terms_days integer not null default 30,
  bank_details text,
  drive_root_folder_id text,
  drive_structure jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

grant all on table public.finance_settings to service_role;

insert into public.finance_settings(tenant_id,drive_root_folder_id,drive_structure)
values(
  'sc-analytics',
  '1la-zseMKNF1Byk1ErH2yAvYuZeqlnl5B',
  jsonb_build_object(
    'issued','1eNAtn3w8fSFAlDD5fhO8BiKrE8Akm_lq',
    'received','1NEOJrnZbA71UJftoKB3uRmogbi-9xUh7',
    'registers','19w0auOIhTKAW58clXt2RNg8Bs2aeL2jv',
    'closures','1cTxe5c8P-vHoH5MFTCipgAsOaSxVUIAr',
    'templates','1f6C-8zld5VR5DUvYCh-OiaaBirhl1dff',
    'exports','1MDP7DRpr0hoQBOv92FzAFKNbjInI73LX'
  )
)
on conflict(tenant_id) do update set
  drive_root_folder_id=excluded.drive_root_folder_id,
  drive_structure=excluded.drive_structure,
  updated_at=now();

create or replace function public.growth_finance_bundle()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
select jsonb_build_object(
  'settings', coalesce((select to_jsonb(x) from (select * from finance_settings where tenant_id='sc-analytics' limit 1) x),'{}'::jsonb),
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
revoke all on function public.growth_finance_bundle() from public, anon, authenticated;
grant execute on function public.growth_finance_bundle() to service_role;
