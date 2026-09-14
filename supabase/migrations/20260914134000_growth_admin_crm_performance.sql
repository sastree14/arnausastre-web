create or replace function public.growth_crm_bundle()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
select jsonb_build_object(
  'companies', coalesce((select jsonb_agg(to_jsonb(x)) from (select company_id,name,website,linkedin_url,score,score_reason,fit_type,country,industry,status,created_at from public.companies order by score desc nulls last limit 200) x),'[]'::jsonb),
  'people', coalesce((select jsonb_agg(to_jsonb(x)) from (select person_id,company_id,name,role,linkedin_url,public_source_url,relevance_score,status,created_at from public.people order by relevance_score desc nulls last limit 250) x),'[]'::jsonb),
  'actions', coalesce((select jsonb_agg(to_jsonb(x)) from (select approval_id,tenant_id,action_type,target_id,summary,payload,status,created_at,decided_at,executed_at from public.approvals where status='approved' and payload->>'execution_mode'='manual_linkedin_action' order by decided_at desc nulls last limit 150) x),'[]'::jsonb),
  'interactions', coalesce((select jsonb_agg(to_jsonb(x)) from (select interaction_id,company_id,person_id,channel,direction,kind,content,occurred_at,next_action_at from public.interactions order by occurred_at desc nulls last limit 250) x),'[]'::jsonb),
  'opportunities', coalesce((select jsonb_agg(to_jsonb(x)) from (select opportunity_id,company_id,primary_person_id,source_content_id,name,stage,value,currency,probability,source,next_action_at,metadata,created_at,updated_at from public.crm_opportunities order by updated_at desc nulls last limit 250) x),'[]'::jsonb),
  'meetings', coalesce((select jsonb_agg(to_jsonb(x)) from (select meeting_id,company_id,person_id,opportunity_id,provider,external_id,starts_at,status,booking_url,metadata,created_at from public.crm_meetings order by starts_at desc nulls last limit 250) x),'[]'::jsonb),
  'prospect_tasks', coalesce((select jsonb_agg(to_jsonb(x)) from (select task_id,type,scheduled_for,status,requires_approval,inputs,outputs,created_at from public.tasks where type='OPERATOR_PROSPECT' order by created_at desc limit 6) x),'[]'::jsonb)
);
$$;

revoke all on function public.growth_crm_bundle() from public, anon, authenticated;
grant execute on function public.growth_crm_bundle() to service_role;
