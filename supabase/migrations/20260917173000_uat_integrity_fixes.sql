create or replace function public.growth_metrics_bundle()
returns jsonb
language sql
stable security definer
set search_path to 'public'
as $function$
with latest_li as (
  select distinct on (account_type,coalesce(content_id,external_post_id,external_post_url,metric_id::text)) *
  from public.linkedin_post_metrics
  where tenant_id='sc-analytics'
  order by account_type,coalesce(content_id,external_post_id,external_post_url,metric_id::text),snapshot_date desc,created_at desc
),
c as (
  select public.growth_workspace_reset_at('commercial_reset') reset_at
),
latest_web_total as (
  select *
  from public.web_analytics_daily
  where tenant_id='sc-analytics' and metadata->>'scope'='period_total'
  order by created_at desc
  limit 1
),
latest_web_events as (
  select distinct on (coalesce(metadata->>'event_name','')) *
  from public.web_analytics_daily
  where tenant_id='sc-analytics' and metadata->>'scope'='period_event'
  order by coalesce(metadata->>'event_name',''), created_at desc
)
select jsonb_build_object(
  'linkedin',jsonb_build_object(
    'impressions',coalesce((select sum(impressions) from latest_li),0),
    'reach',coalesce((select sum(reach) from latest_li),0),
    'reactions',coalesce((select sum(reactions) from latest_li),0),
    'comments',coalesce((select sum(comments) from latest_li),0),
    'reposts',coalesce((select sum(reposts) from latest_li),0),
    'saves',coalesce((select sum(saves) from latest_li),0),
    'clicks',coalesce((select sum(clicks) from latest_li),0),
    'followers_gained',coalesce((select sum(followers_gained) from latest_li),0),
    'posts_measured',(select count(*) from latest_li),
    'latest_date',(select max(snapshot_date) from latest_li)
  ),
  'website',jsonb_build_object(
    'users',coalesce((select users from latest_web_total),0),
    'sessions',coalesce((select sessions from latest_web_total),0),
    'engaged_sessions',coalesce((select engaged_sessions from latest_web_total),0),
    'page_views',coalesce((select page_views from latest_web_total),0),
    'key_events',coalesce((select key_events from latest_web_total),0),
    'discovery_clicks',coalesce((select sum(discovery_clicks) from latest_web_events),0),
    'bookings',coalesce((select sum(bookings) from latest_web_events),0),
    'latest_date',(select metric_date from latest_web_total limit 1)
  ),
  'seo',jsonb_build_object(
    'clicks',coalesce((select sum(clicks) from public.search_console_daily where tenant_id='sc-analytics'),0),
    'impressions',coalesce((select sum(impressions) from public.search_console_daily where tenant_id='sc-analytics'),0),
    'ctr',coalesce((select case when sum(impressions)>0 then sum(clicks)/sum(impressions) else 0 end from public.search_console_daily where tenant_id='sc-analytics'),0),
    'position',coalesce((select case when sum(impressions)>0 then sum(position*impressions)/sum(impressions) else 0 end from public.search_console_daily where tenant_id='sc-analytics'),0),
    'latest_date',(select max(metric_date) from public.search_console_daily where tenant_id='sc-analytics')
  ),
  'commercial',jsonb_build_object(
    'opportunities',(select count(*) from public.crm_opportunities,c where tenant_id='sc-analytics' and created_at>=c.reset_at),
    'meetings',(select count(*) from public.crm_meetings,c where tenant_id='sc-analytics' and created_at>=c.reset_at),
    'open_pipeline',coalesce((select sum(coalesce(value,0)) from public.crm_opportunities,c where tenant_id='sc-analytics' and created_at>=c.reset_at and stage not in ('won','lost','closed')),0),
    'won_value',coalesce((select sum(coalesce(value,0)) from public.crm_opportunities,c where tenant_id='sc-analytics' and created_at>=c.reset_at and stage='won'),0)
  ),
  'finance',jsonb_build_object(
    'invoiced',coalesce((select sum(coalesce(amount_eur,total,0)) from public.finance_invoices where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
    'collected',coalesce((select sum(coalesce(amount_eur,amount,0)) from public.finance_payments where tenant_id='sc-analytics' and direction='inflow' and status in ('received','confirmed','matched') and review_status in ('reviewed','confirmed')),0),
    'spent',coalesce((select sum(coalesce(amount_eur,total,0)) from public.finance_expenses where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0),
    'outstanding',greatest(0,coalesce((select sum(coalesce(amount_eur,total,0)) from public.finance_invoices where tenant_id='sc-analytics' and status not in ('void','cancelled') and review_status in ('reviewed','confirmed')),0)-coalesce((select sum(coalesce(amount_eur,amount,0)) from public.finance_payments where tenant_id='sc-analytics' and direction='inflow' and status in ('received','confirmed','matched') and review_status in ('reviewed','confirmed')),0))
  ),
  'sources',jsonb_build_object(
    'linkedin_connected',exists(select 1 from public.integration_connections where tenant_id='sc-analytics' and provider='linkedin' and (token_expires_at is null or token_expires_at>now())),
    'google_connected',exists(select 1 from public.integration_connections where tenant_id='sc-analytics' and provider='gmail' and account_type='corporate'),
    'last_ga4_sync',(select max(completed_at) from public.analytics_sync_runs where tenant_id='sc-analytics' and provider='ga4' and status='completed'),
    'last_search_console_sync',(select max(completed_at) from public.analytics_sync_runs where tenant_id='sc-analytics' and provider='search_console' and status='completed')
  )
);
$function$;

create or replace function public.growth_operations_bundle()
returns jsonb
language sql
stable security definer
set search_path to 'public'
as $function$
select jsonb_build_object(
  'tasks', coalesce((select jsonb_agg(to_jsonb(x)) from (select task_id,type,scheduled_for,status,requires_approval,inputs,outputs,created_at from public.tasks where tenant_id='sc-analytics' order by created_at desc limit 250) x),'[]'::jsonb),
  'projects', coalesce((select jsonb_agg(to_jsonb(x)) from (select project_id,company_id,opportunity_id,name,status,owner,start_date,end_date,budget,currency,created_at from public.operations_projects where tenant_id='sc-analytics' order by created_at desc limit 250) x),'[]'::jsonb),
  'companies', coalesce((select jsonb_agg(to_jsonb(x)) from (select company_id,name from public.companies where tenant_id='sc-analytics' order by score desc nulls last limit 200) x),'[]'::jsonb),
  'opportunities', coalesce((select jsonb_agg(to_jsonb(x)) from (select opportunity_id,name from public.crm_opportunities where tenant_id='sc-analytics' order by updated_at desc limit 250) x),'[]'::jsonb)
);
$function$;