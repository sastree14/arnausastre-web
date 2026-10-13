-- Prevent repeated imports or chat actions from registering the same proposal twice.
create unique index if not exists crm_upwork_proposal_identity
on public.crm_opportunities(tenant_id,(metadata->>'upwork_org_uid'),(metadata->>'upwork_proposal_id'))
where source='upwork' and metadata->>'upwork_proposal_id' is not null;
