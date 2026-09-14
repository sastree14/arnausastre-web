create index if not exists idx_approvals_status_created on public.approvals (status, created_at desc);
create index if not exists idx_approvals_status_decided on public.approvals (status, decided_at desc);
create index if not exists idx_approvals_execution_mode on public.approvals (status, ((payload->>'execution_mode')));
create index if not exists idx_content_items_status_created on public.content_items (status, created_at desc);
create index if not exists idx_content_items_created on public.content_items (created_at desc);
create index if not exists idx_content_items_scheduled on public.content_items (scheduled_at desc) where scheduled_at is not null;
create index if not exists idx_companies_score on public.companies (score desc);
create index if not exists idx_people_relevance on public.people (relevance_score desc);
create index if not exists idx_tasks_created on public.tasks (created_at desc);
create index if not exists idx_tasks_status_created on public.tasks (status, created_at desc);
create index if not exists idx_crm_opportunities_updated on public.crm_opportunities (updated_at desc);
create index if not exists idx_crm_meetings_starts on public.crm_meetings (starts_at desc);
create index if not exists idx_operations_projects_created on public.operations_projects (created_at desc);
create index if not exists idx_finance_invoices_created on public.finance_invoices (created_at desc);
create index if not exists idx_finance_expenses_created on public.finance_expenses (created_at desc);
create index if not exists idx_finance_payments_created on public.finance_payments (created_at desc);
create index if not exists idx_editorial_briefs_created on public.editorial_briefs (created_at desc);
create index if not exists idx_interactions_occurred on public.interactions (occurred_at desc);

create or replace function public.growth_dashboard_summary()
returns jsonb language sql stable security definer set search_path = public as $$
with latest_li as (
  select distinct on (coalesce(content_id, external_post_id, external_post_url, metric_id::text)) coalesce(impressions,0) as impressions
  from public.linkedin_post_metrics
  order by coalesce(content_id, external_post_id, external_post_url, metric_id::text), snapshot_date desc, created_at desc
)
select jsonb_build_object(
  'companies', (select count(*) from public.companies),
  'active_projects', (select count(*) from public.operations_projects where status in ('active','planned')),
  'opportunities', (select count(*) from public.crm_opportunities),
  'meetings', (select count(*) from public.crm_meetings),
  'manual_actions', (select count(*) from public.approvals where status='approved' and payload->>'execution_mode'='manual_linkedin_action'),
  'published_content', (select count(*) from public.content_items where status='published'),
  'pending_approvals', (select count(*) from public.approvals where status='pending'),
  'open_tasks', (select count(*) from public.tasks where status not in ('completed','done','executed')),
  'failed_tasks', (select count(*) from public.tasks where status='failed'),
  'invoiced', coalesce((select sum(total) from public.finance_invoices),0),
  'collected', coalesce((select sum(amount) from public.finance_payments),0),
  'spent', coalesce((select sum(total) from public.finance_expenses),0),
  'overdue_invoices', (select count(*) from public.finance_invoices where due_date < current_date and status not in ('paid','cancelled','void')),
  'web_sessions', coalesce((select sum(sessions) from public.web_analytics_daily),0),
  'linkedin_impressions', coalesce((select sum(impressions) from latest_li),0),
  'linkedin_posts_measured', (select count(*) from latest_li),
  'linkedin_connected', exists(select 1 from public.integration_connections where provider='linkedin' and (token_expires_at is null or token_expires_at > now()))
);
$$;

create or replace function public.growth_commercial_summary()
returns jsonb language sql stable security definer set search_path = public as $$
select jsonb_build_object(
  'companies', (select count(*) from public.companies),
  'people', (select count(*) from public.people),
  'opportunities', (select count(*) from public.crm_opportunities),
  'meetings', (select count(*) from public.crm_meetings),
  'manual_actions', (select count(*) from public.approvals where status='approved' and payload->>'execution_mode'='manual_linkedin_action'),
  'active_content', (select count(*) from public.content_items where status not in ('published','rejected','failed','superseded_test'))
);
$$;

create or replace function public.growth_metrics_summary()
returns jsonb language sql stable security definer set search_path = public as $$
with latest_li as (
  select distinct on (coalesce(content_id, external_post_id, external_post_url, metric_id::text)) coalesce(impressions,0) as impressions
  from public.linkedin_post_metrics
  order by coalesce(content_id, external_post_id, external_post_url, metric_id::text), snapshot_date desc, created_at desc
)
select jsonb_build_object(
  'sessions', coalesce((select sum(sessions) from public.web_analytics_daily),0),
  'key_events', coalesce((select sum(key_events) from public.web_analytics_daily),0),
  'linkedin_impressions', coalesce((select sum(impressions) from latest_li),0),
  'linkedin_posts_measured', (select count(*) from latest_li)
);
$$;

create or replace function public.growth_finance_bundle()
returns jsonb language sql stable security definer set search_path = public as $$
select jsonb_build_object(
  'companies', coalesce((select jsonb_agg(to_jsonb(x)) from (select company_id,name from public.companies order by score desc nulls last limit 200) x),'[]'::jsonb),
  'projects', coalesce((select jsonb_agg(to_jsonb(x)) from (select project_id,name,status from public.operations_projects order by created_at desc limit 200) x),'[]'::jsonb),
  'invoices', coalesce((select jsonb_agg(to_jsonb(x)) from (select invoice_id,company_id,project_id,invoice_number,issue_date,due_date,currency,subtotal,tax,total,status,external_file_url,created_at from public.finance_invoices order by created_at desc limit 300) x),'[]'::jsonb),
  'expenses', coalesce((select jsonb_agg(to_jsonb(x)) from (select expense_id,project_id,vendor,category,expense_date,currency,total,status,created_at from public.finance_expenses order by created_at desc limit 300) x),'[]'::jsonb),
  'payments', coalesce((select jsonb_agg(to_jsonb(x)) from (select payment_id,invoice_id,company_id,payment_date,currency,amount,method,reference,status,created_at from public.finance_payments order by created_at desc limit 300) x),'[]'::jsonb),
  'invoiced', coalesce((select sum(total) from public.finance_invoices),0),
  'received', coalesce((select sum(amount) from public.finance_payments),0),
  'spent', coalesce((select sum(total) from public.finance_expenses),0)
);
$$;

create or replace function public.growth_operations_bundle()
returns jsonb language sql stable security definer set search_path = public as $$
select jsonb_build_object(
  'tasks', coalesce((select jsonb_agg(to_jsonb(x)) from (select task_id,type,scheduled_for,status,requires_approval,inputs,outputs,created_at from public.tasks order by created_at desc limit 250) x),'[]'::jsonb),
  'projects', coalesce((select jsonb_agg(to_jsonb(x)) from (select project_id,company_id,opportunity_id,name,status,owner,start_date,end_date,budget,currency,created_at from public.operations_projects order by created_at desc limit 250) x),'[]'::jsonb),
  'companies', coalesce((select jsonb_agg(to_jsonb(x)) from (select company_id,name from public.companies order by score desc nulls last limit 200) x),'[]'::jsonb),
  'opportunities', coalesce((select jsonb_agg(to_jsonb(x)) from (select opportunity_id,name from public.crm_opportunities order by updated_at desc limit 250) x),'[]'::jsonb)
);
$$;

revoke all on function public.growth_dashboard_summary() from public, anon, authenticated;
revoke all on function public.growth_commercial_summary() from public, anon, authenticated;
revoke all on function public.growth_metrics_summary() from public, anon, authenticated;
revoke all on function public.growth_finance_bundle() from public, anon, authenticated;
revoke all on function public.growth_operations_bundle() from public, anon, authenticated;
grant execute on function public.growth_dashboard_summary() to service_role;
grant execute on function public.growth_commercial_summary() to service_role;
grant execute on function public.growth_metrics_summary() to service_role;
grant execute on function public.growth_finance_bundle() to service_role;
grant execute on function public.growth_operations_bundle() to service_role;
