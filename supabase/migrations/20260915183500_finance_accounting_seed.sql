insert into public.finance_accounts(tenant_id,account_code,name,account_type,normal_balance,parent_code)
values('sc-analytics','2130','Retenciones a pagar','liability','credit',null)
on conflict (tenant_id,account_code) do nothing;
