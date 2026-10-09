-- Additive commercial memory. Existing legacy rows and statuses are preserved.
alter table public.companies
 add column if not exists canonical_domain text,
 add column if not exists relationship_type text not null default 'unknown',
 add column if not exists commercial_status text not null default 'discovered',
 add column if not exists commercial_status_source text not null default 'research',
 add column if not exists commercial_status_at timestamptz,
 add column if not exists contact_status text not null default 'uncontacted',
 add column if not exists brief text not null default '',
 add column if not exists proposed_value text not null default '',
 add column if not exists next_step text not null default '',
 add column if not exists next_step_at timestamptz,
 add column if not exists exclude_from_discovery boolean not null default true,
 add column if not exists email_status text not null default 'unknown',
 add column if not exists email_status_at timestamptz,
 add column if not exists updated_at timestamptz not null default now();
alter table public.people
 add column if not exists canonical_linkedin_url text,
 add column if not exists linkedin_status text not null default 'unknown',
 add column if not exists linkedin_status_source text not null default 'unknown',
 add column if not exists linkedin_status_at timestamptz,
 add column if not exists updated_at timestamptz not null default now();
alter table public.interactions
 add column if not exists idempotency_key text,
 add column if not exists source text not null default 'legacy',
 add column if not exists evidence jsonb not null default '{}'::jsonb,
 add column if not exists external_message_id text,
 add column if not exists external_thread_id text,
 add column if not exists mutation_payload jsonb;
create unique index if not exists commercial_event_idempotency on public.interactions(tenant_id,idempotency_key) where idempotency_key is not null;
create index if not exists commercial_company_domain on public.companies(tenant_id,canonical_domain);
create index if not exists commercial_person_linkedin on public.people(tenant_id,canonical_linkedin_url);
create index if not exists commercial_interaction_company_time on public.interactions(company_id,occurred_at desc);
create index if not exists commercial_interaction_person_time on public.interactions(person_id,occurred_at desc);
create or replace function public.commercial_canonical_domain(v text) returns text language sql immutable strict set search_path=pg_catalog as $$
 select nullif(split_part(split_part(regexp_replace(regexp_replace(split_part(split_part(lower(trim(v)), '?',1),'#',1), '^https?://', ''), '^www\.', ''), '/', 1), ':', 1),'')
$$;
create or replace function public.commercial_canonical_linkedin(v text) returns text language sql immutable strict set search_path=pg_catalog as $$
 select case when lower(trim(v)) ~ '^https?://([a-z]{2,3}\.|www\.)?linkedin\.com/in/[^/?#]+' then 'https://www.linkedin.com/in/' || substring(lower(trim(v)) from '/in/([^/?#]+)') else null end
$$;
-- No uniqueness backfill that could invalidate existing legacy duplicates.
update public.companies set canonical_domain=public.commercial_canonical_domain(website) where canonical_domain is null and website<>'';
update public.people set canonical_linkedin_url=public.commercial_canonical_linkedin(linkedin_url) where canonical_linkedin_url is null and linkedin_url<>'';
create or replace function public.commercial_memory_mutate(p_payload jsonb) returns jsonb
language plpgsql security invoker set search_path=public,pg_catalog as $$
declare
 a text := p_payload->>'action'; d jsonb; cid text; pid text; eid text; dom text; li text; n integer; prev jsonb; t timestamptz; st text; src text;
 c public.companies%rowtype; r public.people%rowtype; e public.interactions%rowtype;
begin
 if jsonb_typeof(p_payload) is distinct from 'object' then raise exception 'Payload must be an object'; end if;
 if a='preferences' then
  d:=p_payload->'preferences'; if jsonb_typeof(d) is distinct from 'object' then raise exception 'preferences must be object'; end if;
  insert into public.growth_workspace_settings(tenant_id,setting_key,value) values('sc-analytics','commercial_policy',d)
  on conflict(tenant_id,setting_key) do update set value=public.growth_workspace_settings.value || excluded.value,updated_at=now();
  return jsonb_build_object('preferences',(select value from public.growth_workspace_settings where tenant_id='sc-analytics' and setting_key='commercial_policy'));
 elsif a='company' then
  d:=p_payload->'company'; dom:=public.commercial_canonical_domain(coalesce(d->>'canonical_domain',d->>'website'));
  if dom is not null and (dom !~ '^[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z]{2,63}$' or dom like '%..%') then raise exception 'Invalid company domain'; end if;
  if dom is not null then
   perform pg_advisory_xact_lock(hashtextextended('commercial-company:'||dom,0));
   select count(*) into n from public.companies where tenant_id='sc-analytics' and canonical_domain=dom;
   if n>1 then raise exception 'Ambiguous existing company domain: %',dom; end if;
   select * into c from public.companies where tenant_id='sc-analytics' and canonical_domain=dom;
  end if;
  cid:=coalesce(c.company_id,nullif(d->>'company_id',''),nullif(d->>'id',''));
  if c.company_id is not null and nullif(d->>'company_id','') is not null and d->>'company_id'<>c.company_id then raise exception 'Company ID/domain conflict'; end if;
  if cid is not null and c.company_id is null then select * into c from public.companies where company_id=cid and tenant_id='sc-analytics'; end if;
  if c.company_id is not null and dom is not null and c.canonical_domain is not null and dom<>c.canonical_domain then raise exception 'Company domain conflict'; end if;
  if coalesce(d->>'relationship_type','unknown') not in ('unknown','direct_client','referral_partner','technical_partner','delivery_partner','hiring_alternative') then raise exception 'Invalid relationship_type'; end if;
  if c.company_id is null then
   if nullif(trim(d->>'name'),'') is null then raise exception 'Company name required'; end if;
   cid:=coalesce(cid,'company_'||gen_random_uuid()::text);
   insert into public.companies(company_id,tenant_id,name,website,canonical_domain,relationship_type,brief,proposed_value,next_step,next_step_at,country,industry,employee_range,source_url)
   values(cid,'sc-analytics',d->>'name',coalesce(d->>'website',dom,'urn:company:'||cid),dom,coalesce(d->>'relationship_type','unknown'),coalesce(d->>'brief',''),coalesce(d->>'proposed_value',''),coalesce(d->>'next_step',''),(d->>'next_step_at')::timestamptz,coalesce(d->>'country',''),coalesce(d->>'industry',''),coalesce(d->>'employee_range',''),coalesce(d->>'source_url','')) returning * into c;
  else
   update public.companies set name=coalesce(nullif(d->>'name',''),name),canonical_domain=coalesce(canonical_domain,dom),relationship_type=case when d ? 'relationship_type' then d->>'relationship_type' else relationship_type end,brief=coalesce(d->>'brief',brief),proposed_value=coalesce(d->>'proposed_value',proposed_value),next_step=coalesce(d->>'next_step',next_step),next_step_at=case when d ? 'next_step_at' then (d->>'next_step_at')::timestamptz else next_step_at end,updated_at=now() where company_id=cid returning * into c;
  end if;
  return jsonb_build_object('company',to_jsonb(c));
 elsif a='person' then
  d:=p_payload->'person'; li:=public.commercial_canonical_linkedin(coalesce(d->>'canonical_linkedin_url',d->>'linkedin_url'));
  if coalesce(d->>'linkedin_url','')<>'' and li is null then raise exception 'A direct LinkedIn /in/ URL is required'; end if;
  if li is not null then
   perform pg_advisory_xact_lock(hashtextextended('commercial-person:'||li,0));
   select count(*) into n from public.people where tenant_id='sc-analytics' and canonical_linkedin_url=li;
   if n>1 then raise exception 'Ambiguous existing LinkedIn profile'; end if;
   select * into r from public.people where tenant_id='sc-analytics' and canonical_linkedin_url=li;
  end if;
  pid:=coalesce(r.person_id,nullif(d->>'person_id',''),nullif(d->>'id',''));
  if r.person_id is not null and nullif(d->>'person_id','') is not null and r.person_id<>d->>'person_id' then raise exception 'Person ID/profile conflict'; end if;
  if pid is not null and r.person_id is null then select * into r from public.people where person_id=pid and tenant_id='sc-analytics'; end if;
  if r.person_id is null and li is null and nullif(d->>'email','') is not null then
   perform pg_advisory_xact_lock(hashtextextended('commercial-person-email:'||lower(d->>'email')||coalesce(d->>'company_id',''),0));
   select count(*) into n from public.people where tenant_id='sc-analytics' and lower(email)=lower(d->>'email') and company_id is not distinct from nullif(d->>'company_id','');
   if n>1 then raise exception 'Ambiguous existing person email'; end if;
   select * into r from public.people where tenant_id='sc-analytics' and lower(email)=lower(d->>'email') and company_id is not distinct from nullif(d->>'company_id',''); pid:=coalesce(r.person_id,pid);
  end if;
  if r.person_id is null and li is null and nullif(d->>'email','') is null and nullif(trim(d->>'name'),'') is not null and nullif(d->>'company_id','') is not null then
   perform pg_advisory_xact_lock(hashtextextended('commercial-person-name:'||lower(trim(d->>'name'))||(d->>'company_id'),0));
   select count(*) into n from public.people where tenant_id='sc-analytics' and lower(trim(name))=lower(trim(d->>'name')) and company_id=d->>'company_id';
   if n>1 then raise exception 'Ambiguous existing person name/company'; end if;
   select * into r from public.people where tenant_id='sc-analytics' and lower(trim(name))=lower(trim(d->>'name')) and company_id=d->>'company_id'; pid:=coalesce(r.person_id,pid);
  end if;
  if r.person_id is null and li is null and nullif(d->>'email','') is null and nullif(d->>'person_id','') is null and nullif(d->>'company_id','') is null then raise exception 'Person requires stable identity (LinkedIn, email, ID or company+name)'; end if;
  if r.person_id is not null and li is not null and r.canonical_linkedin_url is not null and li<>r.canonical_linkedin_url then raise exception 'Person LinkedIn conflict'; end if;
  cid:=coalesce(nullif(d->>'company_id',''),r.company_id);
  if cid is not null and not exists(select 1 from public.companies where company_id=cid and tenant_id='sc-analytics') then raise exception 'Unknown company'; end if;
  if r.company_id is not null and cid is distinct from r.company_id then raise exception 'Person company conflict'; end if;
  st:=coalesce(d->>'linkedin_status','unknown'); src:=coalesce(d->>'linkedin_status_source','research'); t:=coalesce((d->>'linkedin_status_at')::timestamptz,now());
  if st not in ('unknown','not_sent','invitation_sent','connected','declined') then raise exception 'Invalid linkedin_status'; end if;
  if st in ('invitation_sent','connected','declined') and src not in ('user_report','verified_api') then raise exception 'LinkedIn relationship requires user report or verified API'; end if;
  if r.person_id is null then
   if nullif(trim(d->>'name'),'') is null then raise exception 'Person name required'; end if;
   pid:=coalesce(pid,'person_'||gen_random_uuid()::text);
   insert into public.people(person_id,tenant_id,company_id,name,role,linkedin_url,canonical_linkedin_url,email,contact_reason,linkedin_status,linkedin_status_source,linkedin_status_at)
   values(pid,'sc-analytics',cid,d->>'name',coalesce(d->>'role',''),coalesce(d->>'linkedin_url',li,''),li,coalesce(d->>'email',''),coalesce(d->>'contact_reason',''),st,src,t) returning * into r;
  else
   update public.people set company_id=coalesce(company_id,cid),name=coalesce(d->>'name',name),role=coalesce(d->>'role',role),canonical_linkedin_url=coalesce(canonical_linkedin_url,li),linkedin_url=coalesce(nullif(linkedin_url,''),li,''),email=coalesce(d->>'email',email),contact_reason=coalesce(d->>'contact_reason',contact_reason),updated_at=now() where person_id=pid;
   if d ? 'linkedin_status' and (r.linkedin_status_at is null or t>=r.linkedin_status_at) and (src in ('user_report','verified_api') or r.linkedin_status in ('unknown','not_sent')) then
    update public.people set linkedin_status=st,linkedin_status_source=src,linkedin_status_at=t where person_id=pid;
   end if;
   select * into r from public.people where person_id=pid;
  end if;
  if d ? 'linkedin_status' and src='user_report' then
   insert into public.interactions(interaction_id,tenant_id,company_id,person_id,channel,direction,kind,content,occurred_at,source,evidence) values('interaction_'||gen_random_uuid()::text,'sc-analytics',cid,pid,'linkedin','internal','linkedin_status_report','LinkedIn status reported: '||st,t,'user_report',jsonb_build_object('linkedin_status',st,'reported_payload',d));
  end if;
  return jsonb_build_object('person',to_jsonb(r));
 elsif a='event' then
  d:=p_payload->'event'; if nullif(d->>'idempotency_key','') is null then raise exception 'idempotency_key required'; end if;
  perform pg_advisory_xact_lock(hashtextextended('commercial-event:'||(d->>'idempotency_key'),0));
  select * into e from public.interactions where tenant_id='sc-analytics' and idempotency_key=d->>'idempotency_key';
  if e.interaction_id is not null then
   if e.mutation_payload is distinct from d then raise exception 'Idempotency key reused with different event'; end if;
   return jsonb_build_object('event',to_jsonb(e),'duplicate',true);
  end if;
  cid:=nullif(d->>'company_id',''); pid:=nullif(d->>'person_id',''); src:=coalesce(d->>'source','user_report'); t:=coalesce((d->>'occurred_at')::timestamptz,now());
  if src not in ('user_report','gmail','research','system','verified_api') then raise exception 'Invalid event source'; end if;
  if cid is not null and not exists(select 1 from public.companies where company_id=cid and tenant_id='sc-analytics') then raise exception 'Unknown company'; end if;
  if pid is not null then
   select * into r from public.people where person_id=pid and tenant_id='sc-analytics';
   if r.person_id is null then raise exception 'Unknown person'; end if;
   if cid is not null and r.company_id is distinct from cid then raise exception 'Person/company mismatch'; end if;
   cid:=coalesce(cid,r.company_id);
  end if;
  if coalesce(d->>'channel','') not in ('email','linkedin','upwork','form','phone','chat','other') or coalesce(d->>'direction','') not in ('inbound','outbound','internal') or nullif(d->>'event_type','') is null then raise exception 'Invalid event channel/direction/type'; end if;
  if d ? 'commercial_status' and d->>'commercial_status' not in ('discovered','researched','qualified','contacted','awaiting_reply','replied','conversation','meeting_pending','meeting_scheduled','meeting_booked','proposal','won','lost','not_now','excluded') then raise exception 'Invalid commercial_status'; end if;
  if d->>'event_type' in ('linkedin_connected','linkedin_invitation_sent','linkedin_declined') and src not in ('user_report','verified_api') then raise exception 'Unverified LinkedIn relationship'; end if;
  if d->>'event_type'='human_reply' and (lower(coalesce(d->'evidence'->>'auto_submitted','no')) not in ('no','') or coalesce((d->'evidence'->>'auto_ack')::boolean,false)) then raise exception 'Automatic acknowledgement is not human reply'; end if;
  eid:='interaction_'||gen_random_uuid()::text;
  insert into public.interactions(interaction_id,tenant_id,company_id,person_id,channel,direction,kind,content,occurred_at,idempotency_key,source,evidence,external_message_id,external_thread_id,mutation_payload)
  values(eid,'sc-analytics',cid,pid,d->>'channel',d->>'direction',d->>'event_type',coalesce(d->>'summary',''),t,d->>'idempotency_key',src,coalesce(d->'evidence','{}'::jsonb),d->>'external_message_id',d->>'external_thread_id',d) returning * into e;
  if cid is not null then
   select * into c from public.companies where company_id=cid for update;
   if d->>'direction'='outbound' then update public.companies set contact_status='contacted',exclude_from_discovery=true,updated_at=now() where company_id=cid; end if;
   if d->>'channel'='email' and (c.email_status_at is null or t>=c.email_status_at) then
    update public.companies set email_status=case d->>'event_type' when 'auto_ack' then case when email_status in ('pending_reply','waiting_reply') then email_status else 'auto_reply' end when 'out_of_office' then case when email_status in ('pending_reply','waiting_reply') then email_status else 'auto_reply' end when 'bounce' then 'bounced' when 'human_reply' then 'pending_reply' when 'email_sent' then 'waiting_reply' else email_status end,email_status_at=t,updated_at=now() where company_id=cid;
   end if;
   st:=d->>'commercial_status';
   if st is not null and d->>'event_type' not in ('auto_ack','out_of_office','bounce') and (c.commercial_status_at is null or t>=c.commercial_status_at) and (src='user_report' or c.commercial_status_source<>'user_report') then
    if st not in ('discovered','researched','qualified','contacted','awaiting_reply','replied','conversation','meeting_pending','meeting_scheduled','meeting_booked','proposal','won','lost','not_now','excluded') then raise exception 'Invalid commercial_status'; end if;
    update public.companies set commercial_status=st,commercial_status_source=src,commercial_status_at=t,updated_at=now() where company_id=cid;
   end if;
  end if;
  if pid is not null and d->>'event_type' in ('linkedin_connected','linkedin_invitation_sent','linkedin_declined') then
   update public.people set linkedin_status=case d->>'event_type' when 'linkedin_connected' then 'connected' when 'linkedin_invitation_sent' then 'invitation_sent' else 'declined' end,linkedin_status_source=src,linkedin_status_at=t,updated_at=now() where person_id=pid and (linkedin_status_at is null or t>=linkedin_status_at);
  end if;
  return jsonb_build_object('event',to_jsonb(e),'duplicate',false);
 elsif a='patch' then
  d:=p_payload->'patch'; cid:=d->>'company_id';
  select * into c from public.companies where company_id=cid and tenant_id='sc-analytics' for update;
  if c.company_id is null then raise exception 'Unknown company'; end if;
  st:=coalesce(d->>'commercial_status',c.commercial_status);
  if st not in ('discovered','researched','qualified','contacted','awaiting_reply','replied','conversation','meeting_pending','meeting_scheduled','meeting_booked','proposal','won','lost','not_now','excluded') then raise exception 'Invalid commercial_status'; end if;
  if d ? 'relationship_type' and d->>'relationship_type' not in ('unknown','direct_client','referral_partner','technical_partner','delivery_partner','hiring_alternative') then raise exception 'Invalid relationship_type'; end if;
  if d ? 'email_status' and d->>'email_status' not in ('unknown','pending_reply','waiting_reply','auto_reply','no_reply_needed','bounced') then raise exception 'Invalid email_status'; end if;
  if d ? 'contact_status' and d->>'contact_status' not in ('uncontacted','not_contacted','contacted','replied','do_not_contact') then raise exception 'Invalid contact_status'; end if;
  update public.companies set relationship_type=coalesce(d->>'relationship_type',relationship_type),email_status=coalesce(d->>'email_status',email_status),email_status_at=case when d ? 'email_status' then now() else email_status_at end,commercial_status=st,commercial_status_source=case when d ? 'commercial_status' then 'user_report' else commercial_status_source end,commercial_status_at=case when d ? 'commercial_status' then now() else commercial_status_at end,contact_status=coalesce(d->>'contact_status',contact_status),brief=coalesce(d->>'brief',brief),proposed_value=coalesce(d->>'proposed_value',proposed_value),next_step=coalesce(d->>'next_step',next_step),next_step_at=case when d ? 'next_step_at' then (d->>'next_step_at')::timestamptz else next_step_at end,exclude_from_discovery=coalesce((d->>'exclude_from_discovery')::boolean,exclude_from_discovery),updated_at=now() where company_id=cid returning * into c;
  insert into public.interactions(interaction_id,tenant_id,company_id,channel,direction,kind,content,occurred_at,source,evidence) values('interaction_'||gen_random_uuid()::text,'sc-analytics',cid,'chat','internal','company_updated','Commercial record updated',now(),'user_report',jsonb_build_object('changes',d));
  return jsonb_build_object('company',to_jsonb(c));
 else raise exception 'Unsupported action'; end if;
end $$;
revoke all on function public.commercial_memory_mutate(jsonb) from public,anon,authenticated;
grant execute on function public.commercial_memory_mutate(jsonb) to service_role;
revoke all on function public.commercial_canonical_domain(text),public.commercial_canonical_linkedin(text) from public,anon,authenticated;
grant execute on function public.commercial_canonical_domain(text),public.commercial_canonical_linkedin(text) to service_role;
create or replace function public.mcp_commercial_memory_mutate(p_payload jsonb) returns jsonb
language plpgsql security definer set search_path=public,pg_catalog as $$
begin
 if auth.uid() is null or not exists(select 1 from public.mcp_authorized_users where user_id=auth.uid() and enabled) then raise exception 'Not authorized' using errcode='42501'; end if;
 return public.commercial_memory_mutate(p_payload);
end $$;
revoke all on function public.mcp_commercial_memory_mutate(jsonb) from public,anon;
grant execute on function public.mcp_commercial_memory_mutate(jsonb) to authenticated,service_role;
create or replace function public.commercial_memory_snapshot(p_company_id text default null,p_limit integer default 250) returns jsonb
language plpgsql security invoker set search_path=public,pg_catalog as $$
declare lim integer:=least(greatest(coalesce(p_limit,250),1),1000);
begin
 return jsonb_build_object(
 'companies',coalesce((select jsonb_agg(to_jsonb(x)||jsonb_build_object('id',x.company_id,'domain',x.canonical_domain)) from (select * from public.companies where tenant_id='sc-analytics' and (p_company_id is null or company_id=p_company_id) order by updated_at desc limit lim)x),'[]'::jsonb),
 'people',coalesce((select jsonb_agg(to_jsonb(x)||jsonb_build_object('id',x.person_id)) from (select * from public.people where tenant_id='sc-analytics' and (p_company_id is null or company_id=p_company_id) order by updated_at desc limit lim)x),'[]'::jsonb),
 'events',coalesce((select jsonb_agg(to_jsonb(x)||jsonb_build_object('id',x.interaction_id,'event_type',x.kind,'summary',x.content,'evidence_url',x.evidence->>'url')) from (select * from public.interactions where tenant_id='sc-analytics' and (p_company_id is null or company_id=p_company_id) order by occurred_at desc limit lim)x),'[]'::jsonb),
 'totals',jsonb_build_object('companies',(select count(*) from public.companies where tenant_id='sc-analytics' and (p_company_id is null or company_id=p_company_id)),'people',(select count(*) from public.people where tenant_id='sc-analytics' and (p_company_id is null or company_id=p_company_id)),'events',(select count(*) from public.interactions where tenant_id='sc-analytics' and (p_company_id is null or company_id=p_company_id))),'limit',lim,'has_more',jsonb_build_object('companies',(select count(*)>lim from public.companies where tenant_id='sc-analytics' and (p_company_id is null or company_id=p_company_id)),'people',(select count(*)>lim from public.people where tenant_id='sc-analytics' and (p_company_id is null or company_id=p_company_id)),'events',(select count(*)>lim from public.interactions where tenant_id='sc-analytics' and (p_company_id is null or company_id=p_company_id))),
 'sync_runs',coalesce((select jsonb_agg(jsonb_build_object('key',setting_key,'value',value,'updated_at',updated_at)) from public.growth_workspace_settings where tenant_id='sc-analytics' and setting_key like 'gmail%'),'[]'::jsonb),
 'preferences',coalesce((select value from public.growth_workspace_settings where tenant_id='sc-analytics' and setting_key='commercial_policy'),'{}'::jsonb)
 );
end $$;
revoke all on function public.commercial_memory_snapshot(text,integer) from public,anon,authenticated;
grant execute on function public.commercial_memory_snapshot(text,integer) to service_role;
create or replace function public.mcp_commercial_memory_snapshot(p_company_id text default null,p_limit integer default 250) returns jsonb
language plpgsql security definer set search_path=public,pg_catalog as $$
begin
 if auth.uid() is null or not exists(select 1 from public.mcp_authorized_users where user_id=auth.uid() and enabled) then raise exception 'Not authorized' using errcode='42501'; end if;
 return public.commercial_memory_snapshot(p_company_id,p_limit);
end $$;
revoke all on function public.mcp_commercial_memory_snapshot(text,integer) from public,anon;
grant execute on function public.mcp_commercial_memory_snapshot(text,integer) to authenticated,service_role;
