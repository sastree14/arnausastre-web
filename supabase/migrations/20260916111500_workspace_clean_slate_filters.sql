create or replace function public.growth_workspace_reset_at(p_key text)
returns timestamptz
language sql
stable
security definer
set search_path=public
as $$
select coalesce(
  (select nullif(value->>'reset_at','')::timestamptz from public.growth_workspace_settings where tenant_id='sc-analytics' and setting_key=p_key limit 1),
  (select nullif(value->>'reset_at','')::timestamptz from public.growth_workspace_settings where tenant_id='sc-analytics' and setting_key='uat_reset' limit 1),
  '-infinity'::timestamptz
);
$$;
revoke all on function public.growth_workspace_reset_at(text) from public, anon, authenticated;
grant execute on function public.growth_workspace_reset_at(text) to service_role;

create or replace function public.growth_commercial_summary()
returns jsonb
language sql
stable
security definer
set search_path=public
as $$
with r as (select public.growth_workspace_reset_at('commercial_reset') as reset_at)
select jsonb_build_object(
  'companies', (select count(*) from public.companies,r where tenant_id='sc-analytics' and created_at>=r.reset_at),
  'people', (select count(*) from public.people,r where tenant_id='sc-analytics' and created_at>=r.reset_at),
  'lead_companies', (select count(*) from public.companies,r where tenant_id='sc-analytics' and created_at>=r.reset_at and coalesce(fit_type,'lead')='lead'),
  'partner_companies', (select count(*) from public.companies,r where tenant_id='sc-analytics' and created_at>=r.reset_at and fit_type='partner'),
  'lead_people', (select count(*) from public.people p join public.companies c on c.company_id=p.company_id,r where p.tenant_id='sc-analytics' and p.created_at>=r.reset_at and c.created_at>=r.reset_at and coalesce(c.fit_type,'lead')='lead'),
  'partner_people', (select count(*) from public.people p join public.companies c on c.company_id=p.company_id,r where p.tenant_id='sc-analytics' and p.created_at>=r.reset_at and c.created_at>=r.reset_at and c.fit_type='partner'),
  'opportunities', (select count(*) from public.crm_opportunities,r where tenant_id='sc-analytics' and created_at>=r.reset_at),
  'meetings', (select count(*) from public.crm_meetings,r where tenant_id='sc-analytics' and created_at>=r.reset_at),
  'manual_actions', (select count(*) from public.approvals,r where tenant_id='sc-analytics' and created_at>=r.reset_at and status='approved' and payload->>'execution_mode'='manual_linkedin_action'),
  'active_content', (select count(*) from public.content_items where tenant_id='sc-analytics' and created_at>=public.growth_workspace_reset_at('editorial_reset') and status not in ('published','rejected','failed','superseded_test'))
);
$$;
revoke all on function public.growth_commercial_summary() from public, anon, authenticated;
grant execute on function public.growth_commercial_summary() to service_role;

create or replace function public.growth_crm_bundle()
returns jsonb
language sql
stable
security definer
set search_path=public
as $$
with r as (select public.growth_workspace_reset_at('commercial_reset') as reset_at)
select jsonb_build_object(
  'companies', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select company_id,name,website,phone,phone_source_url,linkedin_url,source_url,score,score_reason,fit_type,country,industry,employee_range,capabilities,capability_gaps,status,notes,completed_at,created_at,recommended_service,recommended_offer,partnership_model,partnership_value
    from public.companies,r where tenant_id='sc-analytics' and created_at>=r.reset_at order by score desc nulls last limit 500
  ) x),'[]'::jsonb),
  'people', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select person_id,company_id,name,role,email,phone,phone_source_url,phone_kind,linkedin_url,public_source_url,relevance_score,status,evidence,notes,recommended_message,outreach_angle,connection_note,follow_up_message,recommended_action,sc_analytics_action,contact_reason,research_context,source,completed_at,created_at,personal_hook,open_question,recommended_service,recommended_offer
    from public.people,r where tenant_id='sc-analytics' and created_at>=r.reset_at order by relevance_score desc nulls last limit 600
  ) x),'[]'::jsonb),
  'actions', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select approval_id,tenant_id,action_type,target_id,summary,payload,status,created_at,decided_at,executed_at
    from public.approvals,r where tenant_id='sc-analytics' and created_at>=r.reset_at and status='approved' and payload->>'execution_mode'='manual_linkedin_action'
    order by decided_at desc nulls last limit 300
  ) x),'[]'::jsonb),
  'interactions', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select interaction_id,company_id,person_id,channel,direction,kind,content,actor,occurred_at,next_action_at
    from public.interactions,r where tenant_id='sc-analytics' and occurred_at>=r.reset_at order by occurred_at desc nulls last limit 600
  ) x),'[]'::jsonb),
  'opportunities', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select opportunity_id,company_id,primary_person_id,source_content_id,source_signal_id,name,stage,value,currency,probability,source,next_action_at,metadata,created_at,updated_at
    from public.crm_opportunities,r where tenant_id='sc-analytics' and created_at>=r.reset_at order by updated_at desc nulls last limit 400
  ) x),'[]'::jsonb),
  'meetings', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select meeting_id,company_id,person_id,opportunity_id,provider,external_id,starts_at,status,booking_url,metadata,created_at
    from public.crm_meetings,r where tenant_id='sc-analytics' and created_at>=r.reset_at order by starts_at desc nulls last limit 400
  ) x),'[]'::jsonb),
  'prospect_tasks', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select task_id,type,scheduled_for,status,requires_approval,inputs,outputs,created_at
    from public.tasks,r where tenant_id='sc-analytics' and created_at>=r.reset_at and type in ('OPERATOR_PROSPECT','OPERATOR_COMMERCIAL_SIGNALS') order by created_at desc limit 30
  ) x),'[]'::jsonb),
  'calendly_connection', coalesce((select to_jsonb(x) from (
    select provider,account_type,provider_subject,display_name,metadata,connected_at,updated_at
    from public.integration_connections where tenant_id='sc-analytics' and provider='calendly'
    order by updated_at desc limit 1
  ) x),'{}'::jsonb)
);
$$;
revoke all on function public.growth_crm_bundle() from public, anon, authenticated;
grant execute on function public.growth_crm_bundle() to service_role;

create or replace function public.growth_commercial_intelligence_bundle()
returns jsonb
language sql
stable
security definer
set search_path=public
as $$
with r as (select public.growth_workspace_reset_at('commercial_reset') as reset_at)
select jsonb_build_object(
  'signals', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select signal_id,company_id,company_name,website,signal_type,title,summary,source_url,source_domain,observed_at,strength,evidence,recommended_service,recommended_offer,suggested_roles,phone,phone_source_url,status,metadata,created_at
    from public.commercial_signals,r where tenant_id='sc-analytics' and created_at>=r.reset_at order by strength desc nulls last, created_at desc limit 300
  ) x),'[]'::jsonb),
  'offers', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select offer_key,name,promise,ideal_for,capabilities,trigger_types,duration,entry_scope,price_min,price_max,currency,cta,active,updated_at
    from public.commercial_offers where tenant_id='sc-analytics' and active=true order by name
  ) x),'[]'::jsonb),
  'channels', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select channel_key,label,category,priority,objective,motion,cadence,status,notes,updated_at
    from public.commercial_channels where tenant_id='sc-analytics' order by priority desc, label
  ) x),'[]'::jsonb),
  'tasks', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select task_id,type,scheduled_for,status,requires_approval,inputs,outputs,created_at
    from public.tasks,r where tenant_id='sc-analytics' and created_at>=r.reset_at and type='OPERATOR_COMMERCIAL_SIGNALS' order by created_at desc limit 10
  ) x),'[]'::jsonb)
);
$$;
revoke all on function public.growth_commercial_intelligence_bundle() from public, anon, authenticated;
grant execute on function public.growth_commercial_intelligence_bundle() to service_role;

create or replace function public.growth_finance_bundle()
returns jsonb
language sql
stable
security definer
set search_path=public
as $$
with r as (select public.growth_workspace_reset_at('finance_reset') as reset_at),
     cr as (select public.growth_workspace_reset_at('commercial_reset') as reset_at)
select jsonb_build_object(
  'settings', coalesce((select to_jsonb(x) from (select * from finance_settings where tenant_id='sc-analytics' limit 1) x),'{}'::jsonb),
  'companies', coalesce((select jsonb_agg(to_jsonb(x)) from (select company_id,name from companies,cr where tenant_id='sc-analytics' and created_at>=cr.reset_at order by name limit 500) x),'[]'::jsonb),
  'counterparties', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_counterparties,r where tenant_id='sc-analytics' and created_at>=r.reset_at order by legal_name limit 500) x),'[]'::jsonb),
  'projects', coalesce((select jsonb_agg(to_jsonb(x)) from (select project_id,name,status from operations_projects,r where tenant_id='sc-analytics' and created_at>=r.reset_at order by created_at desc limit 300) x),'[]'::jsonb),
  'invoices', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_invoices,r where tenant_id='sc-analytics' and created_at>=r.reset_at order by issue_date desc nulls last, created_at desc limit 500) x),'[]'::jsonb),
  'expenses', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_expenses,r where tenant_id='sc-analytics' and created_at>=r.reset_at order by expense_date desc nulls last, created_at desc limit 500) x),'[]'::jsonb),
  'payments', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_payments,r where tenant_id='sc-analytics' and created_at>=r.reset_at order by payment_date desc nulls last, created_at desc limit 500) x),'[]'::jsonb),
  'documents', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_documents,r where tenant_id='sc-analytics' and created_at>=r.reset_at order by created_at desc limit 300) x),'[]'::jsonb),
  'tax_periods', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_tax_periods,r where tenant_id='sc-analytics' and created_at>=r.reset_at order by period_start desc limit 50) x),'[]'::jsonb),
  'import_candidates', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_import_candidates,r where tenant_id='sc-analytics' and created_at>=r.reset_at and status='pending_review' order by created_at desc limit 100) x),'[]'::jsonb),
  'bank_accounts', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_bank_accounts,r where tenant_id='sc-analytics' and created_at>=r.reset_at order by display_name limit 50) x),'[]'::jsonb),
  'bank_transactions', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_bank_transactions,r where tenant_id='sc-analytics' and created_at>=r.reset_at order by booked_at desc nulls last limit 300) x),'[]'::jsonb),
  'reconciliations', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_reconciliations,r where tenant_id='sc-analytics' and created_at>=r.reset_at order by created_at desc limit 200) x),'[]'::jsonb),
  'accounts', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_accounts where tenant_id='sc-analytics' and active=true order by account_code) x),'[]'::jsonb),
  'journal_entries', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_journal_entries,r where tenant_id='sc-analytics' and created_at>=r.reset_at order by entry_date desc, created_at desc limit 300) x),'[]'::jsonb),
  'audit_events', coalesce((select jsonb_agg(to_jsonb(x)) from (select * from finance_audit_events,r where tenant_id='sc-analytics' and occurred_at>=r.reset_at order by occurred_at desc limit 100) x),'[]'::jsonb),
  'invoiced', coalesce((select sum(coalesce(amount_eur,total,0)) from finance_invoices,r where tenant_id='sc-analytics' and created_at>=r.reset_at and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'received', coalesce((select sum(coalesce(amount_eur,amount,0)) from finance_payments,r where tenant_id='sc-analytics' and created_at>=r.reset_at and direction='inflow' and status in ('received','confirmed','matched') and review_status in ('reviewed','confirmed')),0),
  'spent', coalesce((select sum(coalesce(amount_eur,total,0)) from finance_expenses,r where tenant_id='sc-analytics' and created_at>=r.reset_at and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'vat_output', coalesce((select sum(coalesce(tax,0)) from finance_invoices,r where tenant_id='sc-analytics' and created_at>=r.reset_at and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'vat_input', coalesce((select sum(coalesce(tax,0)) from finance_expenses,r where tenant_id='sc-analytics' and created_at>=r.reset_at and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'withholding_total', coalesce((select sum(coalesce(withholding_amount,0)) from finance_invoices,r where tenant_id='sc-analytics' and created_at>=r.reset_at and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'pending_invoice_value',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_invoices,r where tenant_id='sc-analytics' and created_at>=r.reset_at and review_status not in ('reviewed','confirmed','rejected')),0),
  'pending_expense_value',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_expenses,r where tenant_id='sc-analytics' and created_at>=r.reset_at and review_status not in ('reviewed','confirmed','rejected')),0),
  'gmail_connections', coalesce((select jsonb_agg(jsonb_build_object('connection_id',connection_id,'account_type',account_type,'display_name',display_name,'provider_subject',provider_subject,'connected_at',connected_at,'updated_at',updated_at,'metadata',metadata)) from integration_connections where tenant_id='sc-analytics' and provider='gmail'),'[]'::jsonb),
  'revolut_connections', coalesce((select jsonb_agg(jsonb_build_object('connection_id',connection_id,'account_type',account_type,'display_name',display_name,'provider_subject',provider_subject,'connected_at',connected_at,'updated_at',updated_at,'metadata',metadata)) from integration_connections where tenant_id='sc-analytics' and provider='revolut'),'[]'::jsonb)
);
$$;
revoke all on function public.growth_finance_bundle() from public, anon, authenticated;
grant execute on function public.growth_finance_bundle() to service_role;

create or replace function public.finance_period_report(p_start date,p_end date)
returns jsonb
language sql
stable
security definer
set search_path=public
as $$
with r as (select public.growth_workspace_reset_at('finance_reset') as reset_at)
select jsonb_build_object(
  'period_start',p_start,
  'period_end',p_end,
  'invoiced',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_invoices,r where tenant_id='sc-analytics' and created_at>=r.reset_at and issue_date between p_start and p_end and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'expenses',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_expenses,r where tenant_id='sc-analytics' and created_at>=r.reset_at and expense_date between p_start and p_end and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'cash_in',coalesce((select sum(coalesce(amount_eur,amount,0)) from finance_payments,r where tenant_id='sc-analytics' and created_at>=r.reset_at and payment_date between p_start and p_end and direction='inflow' and status in ('received','confirmed','matched') and review_status in ('reviewed','confirmed')),0),
  'cash_out',coalesce((select sum(coalesce(amount_eur,amount,0)) from finance_payments,r where tenant_id='sc-analytics' and created_at>=r.reset_at and payment_date between p_start and p_end and direction='outflow' and status in ('received','confirmed','matched') and review_status in ('reviewed','confirmed')),0),
  'vat_output',coalesce((select sum(coalesce(tax,0)) from finance_invoices,r where tenant_id='sc-analytics' and created_at>=r.reset_at and issue_date between p_start and p_end and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'vat_input',coalesce((select sum(coalesce(tax,0)) from finance_expenses,r where tenant_id='sc-analytics' and created_at>=r.reset_at and expense_date between p_start and p_end and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'withholding',coalesce((select sum(coalesce(withholding_amount,0)) from finance_invoices,r where tenant_id='sc-analytics' and created_at>=r.reset_at and issue_date between p_start and p_end and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
  'pending_invoice_value',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_invoices,r where tenant_id='sc-analytics' and created_at>=r.reset_at and issue_date between p_start and p_end and review_status not in ('reviewed','confirmed','rejected')),0),
  'pending_expense_value',coalesce((select sum(coalesce(amount_eur,total,0)) from finance_expenses,r where tenant_id='sc-analytics' and created_at>=r.reset_at and expense_date between p_start and p_end and review_status not in ('reviewed','confirmed','rejected')),0)
);
$$;
revoke all on function public.finance_period_report(date,date) from public, anon, authenticated;
grant execute on function public.finance_period_report(date,date) to service_role;

create or replace function public.growth_dashboard_summary()
returns jsonb
language sql
stable
security definer
set search_path=public
as $$
with latest_li as (
  select distinct on (coalesce(content_id,external_post_id,external_post_url,metric_id::text)) coalesce(impressions,0) as impressions
  from public.linkedin_post_metrics
  order by coalesce(content_id,external_post_id,external_post_url,metric_id::text),snapshot_date desc,created_at desc
),
u as (select public.growth_workspace_reset_at('uat_reset') reset_at),
c as (select public.growth_workspace_reset_at('commercial_reset') reset_at),
f as (select public.growth_workspace_reset_at('finance_reset') reset_at),
e as (select public.growth_workspace_reset_at('editorial_reset') reset_at)
select jsonb_build_object(
  'companies',(select count(*) from public.companies,c where tenant_id='sc-analytics' and created_at>=c.reset_at),
  'active_projects',(select count(*) from public.operations_projects,u where tenant_id='sc-analytics' and created_at>=u.reset_at and status in ('active','planned')),
  'opportunities',(select count(*) from public.crm_opportunities,c where tenant_id='sc-analytics' and created_at>=c.reset_at),
  'meetings',(select count(*) from public.crm_meetings,c where tenant_id='sc-analytics' and created_at>=c.reset_at),
  'manual_actions',(select count(*) from public.approvals,c where tenant_id='sc-analytics' and created_at>=c.reset_at and status='approved' and payload->>'execution_mode'='manual_linkedin_action'),
  'published_content',(select count(*) from public.content_items,e where tenant_id='sc-analytics' and created_at>=e.reset_at and status='published'),
  'pending_approvals',(select count(*) from public.approvals,u where tenant_id='sc-analytics' and created_at>=u.reset_at and status='pending'),
  'open_tasks',(select count(*) from public.tasks,u where tenant_id='sc-analytics' and created_at>=u.reset_at and status not in ('completed','done','executed')),
  'failed_tasks',(select count(*) from public.tasks,u where tenant_id='sc-analytics' and created_at>=u.reset_at and status='failed'),
  'invoiced',coalesce((select sum(total) from public.finance_invoices,f where tenant_id='sc-analytics' and created_at>=f.reset_at),0),
  'collected',coalesce((select sum(amount) from public.finance_payments,f where tenant_id='sc-analytics' and created_at>=f.reset_at),0),
  'spent',coalesce((select sum(total) from public.finance_expenses,f where tenant_id='sc-analytics' and created_at>=f.reset_at),0),
  'overdue_invoices',(select count(*) from public.finance_invoices,f where tenant_id='sc-analytics' and created_at>=f.reset_at and due_date<current_date and status not in ('paid','cancelled','void')),
  'web_sessions',coalesce((select sum(sessions) from public.web_analytics_daily),0),
  'linkedin_impressions',coalesce((select sum(impressions) from latest_li),0),
  'linkedin_posts_measured',(select count(*) from latest_li),
  'linkedin_connected',exists(select 1 from public.integration_connections where tenant_id='sc-analytics' and provider='linkedin' and (token_expires_at is null or token_expires_at>now()))
);
$$;
revoke all on function public.growth_dashboard_summary() from public, anon, authenticated;
grant execute on function public.growth_dashboard_summary() to service_role;
