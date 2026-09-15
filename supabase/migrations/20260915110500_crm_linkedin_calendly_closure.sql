alter table public.people add column if not exists email text not null default '';
alter table public.people add column if not exists source text not null default 'prospecting';
alter table public.people add column if not exists connection_note text not null default '';
alter table public.people add column if not exists follow_up_message text not null default '';
alter table public.people add column if not exists recommended_action text not null default '';
alter table public.people add column if not exists sc_analytics_action text not null default '';
alter table public.people add column if not exists contact_reason text not null default '';
alter table public.people add column if not exists research_context jsonb not null default '{}'::jsonb;
alter table public.interactions add column if not exists actor text not null default 'arnau';

create unique index if not exists crm_meetings_provider_external_unique
  on public.crm_meetings(tenant_id, provider, external_id)
  where external_id is not null and external_id <> '';
create index if not exists people_email_idx on public.people(tenant_id, lower(email)) where email <> '';
create index if not exists people_status_idx on public.people(tenant_id, status);
create index if not exists opportunities_person_idx on public.crm_opportunities(tenant_id, primary_person_id);

create or replace function public.growth_crm_bundle()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
select jsonb_build_object(
  'companies', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select company_id,name,website,linkedin_url,source_url,score,score_reason,fit_type,country,industry,employee_range,capabilities,capability_gaps,status,notes,completed_at,created_at
    from public.companies order by score desc nulls last limit 300
  ) x),'[]'::jsonb),
  'people', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select person_id,company_id,name,role,email,linkedin_url,public_source_url,relevance_score,status,evidence,notes,recommended_message,outreach_angle,connection_note,follow_up_message,recommended_action,sc_analytics_action,contact_reason,research_context,source,completed_at,created_at
    from public.people order by relevance_score desc nulls last limit 400
  ) x),'[]'::jsonb),
  'actions', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select approval_id,tenant_id,action_type,target_id,summary,payload,status,created_at,decided_at,executed_at
    from public.approvals where status='approved' and payload->>'execution_mode'='manual_linkedin_action'
    order by decided_at desc nulls last limit 200
  ) x),'[]'::jsonb),
  'interactions', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select interaction_id,company_id,person_id,channel,direction,kind,content,actor,occurred_at,next_action_at
    from public.interactions order by occurred_at desc nulls last limit 400
  ) x),'[]'::jsonb),
  'opportunities', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select opportunity_id,company_id,primary_person_id,source_content_id,name,stage,value,currency,probability,source,next_action_at,metadata,created_at,updated_at
    from public.crm_opportunities order by updated_at desc nulls last limit 300
  ) x),'[]'::jsonb),
  'meetings', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select meeting_id,company_id,person_id,opportunity_id,provider,external_id,starts_at,status,booking_url,metadata,created_at
    from public.crm_meetings order by starts_at desc nulls last limit 300
  ) x),'[]'::jsonb),
  'prospect_tasks', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select task_id,type,scheduled_for,status,requires_approval,inputs,outputs,created_at
    from public.tasks where type='OPERATOR_PROSPECT' order by created_at desc limit 8
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
