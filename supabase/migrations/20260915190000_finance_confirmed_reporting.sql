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
  'invoiced',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_invoices where tenant_id='sc-analytics' and issue_date between p_start and p_end and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'expenses',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_expenses where tenant_id='sc-analytics' and expense_date between p_start and p_end and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'cash_in',coalesce((select sum(coalesce(amount_eur,amount,0)) from finance_payments where tenant_id='sc-analytics' and payment_date between p_start and p_end and direction='inflow' and status in ('received','confirmed','matched') and review_status in ('reviewed','confirmed')),0),
  'cash_out',coalesce((select sum(coalesce(amount_eur,amount,0)) from finance_payments where tenant_id='sc-analytics' and payment_date between p_start and p_end and direction='outflow' and status in ('received','confirmed','matched') and review_status in ('reviewed','confirmed')),0),
  'vat_output',coalesce((select sum(coalesce(tax,0)) from finance_invoices where tenant_id='sc-analytics' and issue_date between p_start and p_end and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'vat_input',coalesce((select sum(coalesce(tax,0)) from finance_expenses where tenant_id='sc-analytics' and expense_date between p_start and p_end and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'withholding',coalesce((select sum(coalesce(withholding_amount,0)) from finance_invoices where tenant_id='sc-analytics' and issue_date between p_start and p_end and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'pending_invoice_value',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_invoices where tenant_id='sc-analytics' and issue_date between p_start and p_end and review_status not in ('reviewed','confirmed','rejected')),0),
  'pending_expense_value',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_expenses where tenant_id='sc-analytics' and expense_date between p_start and p_end and review_status not in ('reviewed','confirmed','rejected')),0)
);
$$;
revoke all on function public.finance_period_report(date,date) from public, anon, authenticated;
grant execute on function public.finance_period_report(date,date) to service_role;

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
  'documents', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_documents where tenant_id='sc-analytics' order by created_at desc limit 300) x),'[]'::jsonb),
  'tax_periods', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_tax_periods where tenant_id='sc-analytics' order by period_start desc limit 50) x),'[]'::jsonb),
  'import_candidates', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_import_candidates where tenant_id='sc-analytics' and status='pending_review' order by created_at desc limit 100) x),'[]'::jsonb),
  'bank_accounts', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_bank_accounts where tenant_id='sc-analytics' order by display_name limit 50) x),'[]'::jsonb),
  'bank_transactions', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_bank_transactions where tenant_id='sc-analytics' order by booked_at desc nulls last limit 300) x),'[]'::jsonb),
  'reconciliations', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_reconciliations where tenant_id='sc-analytics' order by created_at desc limit 200) x),'[]'::jsonb),
  'accounts', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_accounts where tenant_id='sc-analytics' and active=true order by account_code) x),'[]'::jsonb),
  'journal_entries', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_journal_entries where tenant_id='sc-analytics' order by entry_date desc, created_at desc limit 300) x),'[]'::jsonb),
  'audit_events', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_audit_events where tenant_id='sc-analytics' order by occurred_at desc limit 100) x),'[]'::jsonb),
  'invoiced', coalesce((select sum(coalesce(amount_eur,total,0)) from finance_invoices where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'received', coalesce((select sum(coalesce(amount_eur,amount,0)) from finance_payments where tenant_id='sc-analytics' and direction='inflow' and status in ('received','confirmed','matched') and review_status in ('reviewed','confirmed')),0),
  'spent', coalesce((select sum(coalesce(amount_eur,total,0)) from finance_expenses where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'vat_output', coalesce((select sum(coalesce(tax,0)) from finance_invoices where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'vat_input', coalesce((select sum(coalesce(tax,0)) from finance_expenses where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'withholding_total', coalesce((select sum(coalesce(withholding_amount,0)) from finance_invoices where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'pending_invoice_value',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_invoices where tenant_id='sc-analytics' and review_status not in ('reviewed','confirmed','rejected')),0),
  'pending_expense_value',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_expenses where tenant_id='sc-analytics' and review_status not in ('reviewed','confirmed','rejected')),0),
  'gmail_connections', coalesce((select jsonb_agg(jsonb_build_object('connection_id',connection_id,'account_type',account_type,'display_name',display_name,'provider_subject',provider_subject,'connected_at',connected_at,'updated_at',updated_at,'metadata',metadata)) from integration_connections where tenant_id='sc-analytics' and provider='gmail'),'[]'::jsonb),
  'revolut_connections', coalesce((select jsonb_agg(jsonb_build_object('connection_id',connection_id,'account_type',account_type,'display_name',display_name,'provider_subject',provider_subject,'connected_at',connected_at,'updated_at',updated_at,'metadata',metadata)) from integration_connections where tenant_id='sc-analytics' and provider='revolut'),'[]'::jsonb)
);
$$;
revoke all on function public.growth_finance_bundle() from public, anon, authenticated;
grant execute on function public.growth_finance_bundle() to service_role;
