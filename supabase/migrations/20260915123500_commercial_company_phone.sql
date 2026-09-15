alter table public.companies add column if not exists phone text not null default '';
alter table public.companies add column if not exists phone_source_url text not null default '';

create or replace function public.growth_crm_bundle()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
select jsonb_build_object(
  'companies', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select company_id,name,website,phone,phone_source_url,linkedin_url,source_url,score,score_reason,fit_type,country,industry,employee_range,capabilities,capability_gaps,status,notes,completed_at,created_at,recommended_service,recommended_offer,partnership_model,partnership_value
    from public.companies order by score desc nulls last limit 500
  ) x),'[]'::jsonb),
  'people', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select person_id,company_id,name,role,email,phone,phone_source_url,phone_kind,linkedin_url,public_source_url,relevance_score,status,evidence,notes,recommended_message,outreach_angle,connection_note,follow_up_message,recommended_action,sc_analytics_action,contact_reason,research_context,source,completed_at,created_at,personal_hook,open_question,recommended_service,recommended_offer
    from public.people order by relevance_score desc nulls last limit 600
  ) x),'[]'::jsonb),
  'actions', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select approval_id,tenant_id,action_type,target_id,summary,payload,status,created_at,decided_at,executed_at
    from public.approvals where status='approved' and payload->>'execution_mode'='manual_linkedin_action'
    order by decided_at desc nulls last limit 300
  ) x),'[]'::jsonb),
  'interactions', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select interaction_id,company_id,person_id,channel,direction,kind,content,actor,occurred_at,next_action_at
    from public.interactions order by occurred_at desc nulls last limit 600
  ) x),'[]'::jsonb),
  'opportunities', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select opportunity_id,company_id,primary_person_id,source_content_id,source_signal_id,name,stage,value,currency,probability,source,next_action_at,metadata,created_at,updated_at
    from public.crm_opportunities order by updated_at desc nulls last limit 400
  ) x),'[]'::jsonb),
  'meetings', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select meeting_id,company_id,person_id,opportunity_id,provider,external_id,starts_at,status,booking_url,metadata,created_at
    from public.crm_meetings order by starts_at desc nulls last limit 400
  ) x),'[]'::jsonb),
  'prospect_tasks', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select task_id,type,scheduled_for,status,requires_approval,inputs,outputs,created_at
    from public.tasks where type in ('OPERATOR_PROSPECT','OPERATOR_COMMERCIAL_SIGNALS') order by created_at desc limit 30
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
