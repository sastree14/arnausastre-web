create table if not exists operations_projects (
  project_id text primary key,
  tenant_id text not null,
  company_id text references companies(company_id) on delete set null,
  opportunity_id text references crm_opportunities(opportunity_id) on delete set null,
  name text not null,
  status text not null default 'planned',
  owner text default '',
  start_date date,
  end_date date,
  budget numeric not null default 0,
  currency text not null default 'EUR',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists finance_invoices (
  invoice_id text primary key,
  tenant_id text not null,
  company_id text references companies(company_id) on delete set null,
  project_id text references operations_projects(project_id) on delete set null,
  invoice_number text default '',
  issue_date date,
  due_date date,
  currency text not null default 'EUR',
  subtotal numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  status text not null default 'draft',
  external_file_url text default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists finance_expenses (
  expense_id text primary key,
  tenant_id text not null,
  project_id text references operations_projects(project_id) on delete set null,
  vendor text default '',
  category text default '',
  expense_date date,
  currency text not null default 'EUR',
  subtotal numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  status text not null default 'recorded',
  receipt_url text default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists finance_payments (
  payment_id text primary key,
  tenant_id text not null,
  invoice_id text references finance_invoices(invoice_id) on delete set null,
  company_id text references companies(company_id) on delete set null,
  payment_date date,
  currency text not null default 'EUR',
  amount numeric not null default 0,
  method text default '',
  reference text default '',
  status text not null default 'received',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_operations_projects_company on operations_projects(company_id, status);
create index if not exists idx_finance_invoices_due on finance_invoices(status, due_date);
create index if not exists idx_finance_expenses_date on finance_expenses(expense_date desc);
create index if not exists idx_finance_payments_date on finance_payments(payment_date desc);

alter table operations_projects enable row level security;
alter table finance_invoices enable row level security;
alter table finance_expenses enable row level security;
alter table finance_payments enable row level security;

revoke all on table operations_projects, finance_invoices, finance_expenses, finance_payments from anon, authenticated;
grant select, insert, update, delete on table operations_projects, finance_invoices, finance_expenses, finance_payments to service_role;
