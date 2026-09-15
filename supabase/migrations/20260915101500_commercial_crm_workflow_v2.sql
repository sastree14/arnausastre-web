alter table public.people add column if not exists evidence text not null default '';
alter table public.people add column if not exists notes text not null default '';
alter table public.people add column if not exists recommended_message text not null default '';
alter table public.people add column if not exists outreach_angle text not null default '';
alter table public.people add column if not exists completed_at timestamptz;

alter table public.companies add column if not exists notes text not null default '';
alter table public.companies add column if not exists completed_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'people_tenant_company_name_unique'
  ) then
    alter table public.people
      add constraint people_tenant_company_name_unique unique (tenant_id, company_id, name);
  end if;
end $$;

create index if not exists people_tenant_status_idx on public.people (tenant_id, status);
create index if not exists companies_tenant_status_idx on public.companies (tenant_id, status);
create index if not exists interactions_person_occurred_idx on public.interactions (person_id, occurred_at desc);
create index if not exists interactions_company_occurred_idx on public.interactions (company_id, occurred_at desc);

create or replace function public.growth_crm_bundle()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
select jsonb_build_object(
  'companies', coalesce((
    select jsonb_agg(to_jsonb(x)) from (
      select company_id,name,website,country,industry,employee_range,linkedin_url,source_url,fit_type,score,score_reason,capabilities,capability_gaps,status,notes,completed_at,created_at
      from public.companies
      where tenant_id='sc-analytics'
      order by score desc nulls last
      limit 250
    ) x
  ),'[]'::jsonb),
  'people', coalesce((
    select jsonb_agg(to_jsonb(x)) from (
      select person_id,company_id,name,role,linkedin_url,public_source_url,relevance_score,status,evidence,notes,recommended_message,outreach_angle,completed_at,created_at
      from public.people
      where tenant_id='sc-analytics'
      order by relevance_score desc nulls last
      limit 350
    ) x
  ),'[]'::jsonb),
  'actions', coalesce((
    select jsonb_agg(to_jsonb(x)) from (
      select approval_id,tenant_id,action_type,target_id,summary,payload,status,created_at,decided_at,executed_at
      from public.approvals
      where tenant_id='sc-analytics'
        and status in ('pending','approved')
        and payload->>'execution_mode'='manual_linkedin_action'
      order by created_at desc
      limit 200
    ) x
  ),'[]'::jsonb),
  'interactions', coalesce((
    select jsonb_agg(to_jsonb(x)) from (
      select interaction_id,company_id,person_id,channel,direction,kind,content,occurred_at,next_action_at
      from public.interactions
      where tenant_id='sc-analytics'
      order by occurred_at desc
      limit 350
    ) x
  ),'[]'::jsonb),
  'opportunities', coalesce((
    select jsonb_agg(to_jsonb(x)) from (
      select opportunity_id,company_id,primary_person_id,source_content_id,name,stage,value,currency,probability,source,next_action_at,metadata,created_at,updated_at
      from public.crm_opportunities
      where tenant_id='sc-analytics'
      order by updated_at desc
      limit 250
    ) x
  ),'[]'::jsonb),
  'meetings', coalesce((
    select jsonb_agg(to_jsonb(x)) from (
      select meeting_id,company_id,person_id,opportunity_id,provider,external_id,starts_at,status,booking_url,metadata,created_at
      from public.crm_meetings
      where tenant_id='sc-analytics'
      order by starts_at desc nulls last
      limit 250
    ) x
  ),'[]'::jsonb),
  'prospect_tasks', coalesce((
    select jsonb_agg(to_jsonb(x)) from (
      select task_id,type,scheduled_for,status,requires_approval,inputs,outputs,created_at
      from public.tasks
      where tenant_id='sc-analytics' and type='OPERATOR_PROSPECT'
      order by created_at desc
      limit 10
    ) x
  ),'[]'::jsonb)
);
$$;

revoke all on function public.growth_crm_bundle() from public, anon, authenticated;
grant execute on function public.growth_crm_bundle() to service_role;
