alter table public.people add column if not exists phone text not null default '';
alter table public.people add column if not exists phone_source_url text not null default '';
alter table public.people add column if not exists phone_kind text not null default '';
alter table public.people add column if not exists recommended_offer text not null default '';
alter table public.companies add column if not exists recommended_offer text not null default '';
alter table public.crm_opportunities add column if not exists source_signal_id text;

create table if not exists public.commercial_signals (
  signal_id text primary key,
  tenant_id text not null,
  company_id text,
  company_name text not null default '',
  website text not null default '',
  signal_type text not null,
  title text not null,
  summary text not null default '',
  source_url text not null,
  source_domain text not null default '',
  observed_at timestamptz,
  strength numeric not null default 0,
  evidence text not null default '',
  recommended_service text not null default '',
  recommended_offer text not null default '',
  suggested_roles jsonb not null default '[]'::jsonb,
  phone text not null default '',
  phone_source_url text not null default '',
  status text not null default 'new',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists commercial_signals_tenant_source_unique on public.commercial_signals(tenant_id, source_url);
create index if not exists commercial_signals_strength_idx on public.commercial_signals(tenant_id, strength desc, created_at desc);
create index if not exists commercial_signals_company_idx on public.commercial_signals(tenant_id, company_id);

create table if not exists public.commercial_offers (
  tenant_id text not null,
  offer_key text not null,
  name text not null,
  promise text not null default '',
  ideal_for text not null default '',
  capabilities jsonb not null default '[]'::jsonb,
  trigger_types jsonb not null default '[]'::jsonb,
  duration text not null default '',
  entry_scope text not null default '',
  price_min numeric,
  price_max numeric,
  currency text not null default 'EUR',
  cta text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, offer_key)
);

create table if not exists public.commercial_channels (
  tenant_id text not null,
  channel_key text not null,
  label text not null,
  category text not null default '',
  priority numeric not null default 0,
  objective text not null default '',
  motion text not null default '',
  cadence text not null default '',
  status text not null default 'planned',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, channel_key)
);

insert into public.commercial_offers (tenant_id,offer_key,name,promise,ideal_for,capabilities,trigger_types,duration,entry_scope,price_min,price_max,currency,cta,active)
values
('sc-analytics','demand_forecasting_inventory_sprint','Demand Forecasting & Inventory Sprint','Convert demand uncertainty into better inventory and purchasing decisions.','Retail, ecommerce, wholesale, food and multi-SKU operations','["forecasting","inventory","simulation"]'::jsonb,'["hiring_supply_chain","warehouse_expansion","international_expansion","inventory_pressure","growth"]'::jsonb,'2–3 weeks','Diagnosis + forecast baseline + inventory/service impact + roadmap',3000,10000,'EUR','Free discovery call to identify stock, service-level and planning opportunities',true),
('sc-analytics','ai_automation_assessment','AI Automation Assessment','Identify automatable workflows and quantify where AI can remove manual work or increase capacity.','Service businesses, operations teams, back office and repetitive knowledge workflows','["ai_automation","agents","workflow_automation"]'::jsonb,'["hiring_ops","software_migration","process_scaling","headcount_growth"]'::jsonb,'1 week','Process map + automation shortlist + ROI estimate + implementation roadmap',1500,5000,'EUR','Free discovery call to map bottlenecks and automation opportunities',true),
('sc-analytics','fpa_cashflow_system','FP&A / Cash Flow Forecasting System','Improve financial visibility with forward-looking cash, scenario and planning models.','Growing SMEs, multi-entity businesses and finance teams','["financial_modeling","forecasting","scenario_analysis"]'::jsonb,'["hiring_fpa","funding","international_expansion","margin_pressure"]'::jsonb,'2–4 weeks','Forecast model + scenarios + management reporting + automation',3500,12000,'EUR','Free discovery call to identify planning, reporting and cash-flow gaps',true),
('sc-analytics','operations_optimization_sprint','Operations Optimization Sprint','Improve routing, scheduling, capacity, allocation or inventory decisions with mathematical optimization.','Logistics, manufacturing, distribution, field operations and capacity-constrained businesses','["optimization","operations_research","simulation"]'::jsonb,'["warehouse_expansion","network_expansion","capacity_growth","hiring_operations","fleet_growth"]'::jsonb,'2–4 weeks','Decision model + baseline + optimized scenarios + estimated operational impact',4000,15000,'EUR','Free discovery call to identify bottlenecks and high-value decision points',true),
('sc-analytics','data_bi_audit','Data & BI Audit','Turn fragmented reporting and data into a prioritized decision and analytics roadmap.','Companies with growing reporting complexity, Power BI/ERP/CRM stacks or inconsistent KPIs','["data_strategy","bi","data_engineering","kpi_design"]'::jsonb,'["erp_migration","bi_hiring","reporting_growth","new_management"]'::jsonb,'1–2 weeks','Data/reporting audit + KPI map + architecture gaps + prioritized roadmap',2000,7000,'EUR','Free discovery call to identify reporting, data and decision bottlenecks',true)
on conflict (tenant_id,offer_key) do update set name=excluded.name,promise=excluded.promise,ideal_for=excluded.ideal_for,capabilities=excluded.capabilities,trigger_types=excluded.trigger_types,duration=excluded.duration,entry_scope=excluded.entry_scope,price_min=excluded.price_min,price_max=excluded.price_max,currency=excluded.currency,cta=excluded.cta,active=excluded.active,updated_at=now();

insert into public.commercial_channels (tenant_id,channel_key,label,category,priority,objective,motion,cadence,status,notes)
values
('sc-analytics','trigger_outbound','Outbound por señales','direct',10,'Find companies with a reason to talk now','Signal → account → decision maker → LinkedIn/email/phone → discovery','daily','active','Primary direct-client acquisition engine'),
('sc-analytics','partners_referrals','Partners / referral partners','partner',10,'Create recurring distribution through third parties','Complementary partner → referral/revenue-share/white-label → opportunity','weekly','active','Includes consultancies, recruiters, fractional executives and specialists'),
('sc-analytics','white_label','White-label delivery','partner',9.5,'Become the Data/AI delivery layer behind firms that already own the client relationship','Partner need → scoped delivery → partner or joint brand','weekly','active','High leverage because one partner can create multiple projects'),
('sc-analytics','brokers_marketplaces','Brokers & B2B project marketplaces','channel',9,'Enter networks that already aggregate demand','Register/qualify → receive briefs → bid selectively','weekly','planned','Sortlist-like networks, consulting brokers, supplier networks'),
('sc-analytics','talent_marketplaces','Talent marketplaces','channel',8,'Maintain deal flow and convert project relationships into recurring clients','Selective applications → delivery → expansion','weekly','active','Upwork/Malt style flow'),
('sc-analytics','tech_ecosystems','Technology ecosystems','ecosystem',8,'Build long-term distribution and credibility through software/cloud ecosystems','Partner program → capability listing → co-sell/private offers','monthly','planned','AWS, Microsoft, Odoo, HubSpot, Snowflake, Databricks, Shopify, n8n/Make'),
('sc-analytics','events_vertical','Vertical B2B events','channel',8,'Meet decision makers in contexts with concentrated ICP','Select event → target attendees → meetings → follow-up','monthly','planned','Prioritize vertical relevance over generic tech events'),
('sc-analytics','recruitment_staffing','Recruitment / staffing channels','partner',8,'Capture projects that need external specialist teams rather than hires','Recruiter/staffing firm → project need → embedded SC-Analytics team','weekly','active','Commercially similar to partner engine but different source'),
('sc-analytics','pe_search_funds','PE / Search Funds','portfolio',8.5,'One relationship can unlock multiple portfolio companies','Fund/searcher → operating hypothesis → portfolio introductions → repeat projects','monthly','planned','Position SC-Analytics as external Data & AI operating partner'),
('sc-analytics','rfp_procurement','RFP & procurement','channel',7,'Access larger structured contracts','Saved searches → qualify → bid/no-bid → proposal','weekly','planned','Public and corporate procurement; longer cycle, larger potential ticket'),
('sc-analytics','seo_content','SEO / content / webinars','inbound',6,'Create inbound authority and support outbound conversion','Useful content → web/LinkedIn → CTA → discovery','weekly','active','Complementary channel, not the only acquisition engine')
on conflict (tenant_id,channel_key) do update set label=excluded.label,category=excluded.category,priority=excluded.priority,objective=excluded.objective,motion=excluded.motion,cadence=excluded.cadence,status=excluded.status,notes=excluded.notes,updated_at=now();

create or replace function public.growth_crm_bundle()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
select jsonb_build_object(
  'companies', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select company_id,name,website,linkedin_url,source_url,score,score_reason,fit_type,country,industry,employee_range,capabilities,capability_gaps,status,notes,completed_at,created_at,recommended_service,recommended_offer,partnership_model,partnership_value
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

create or replace function public.growth_commercial_intelligence_bundle()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
select jsonb_build_object(
  'signals', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select signal_id,company_id,company_name,website,signal_type,title,summary,source_url,source_domain,observed_at,strength,evidence,recommended_service,recommended_offer,suggested_roles,phone,phone_source_url,status,metadata,created_at
    from public.commercial_signals where tenant_id='sc-analytics' order by strength desc nulls last, created_at desc limit 300
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
    from public.tasks where tenant_id='sc-analytics' and type='OPERATOR_COMMERCIAL_SIGNALS' order by created_at desc limit 10
  ) x),'[]'::jsonb)
);
$$;

revoke all on function public.growth_commercial_intelligence_bundle() from public, anon, authenticated;
grant execute on function public.growth_commercial_intelligence_bundle() to service_role;
revoke all on function public.growth_crm_bundle() from public, anon, authenticated;
grant execute on function public.growth_crm_bundle() to service_role;
