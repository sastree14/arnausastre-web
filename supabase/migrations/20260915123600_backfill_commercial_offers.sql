update public.people set recommended_offer = case
  when lower(recommended_service) like '%forecast%' or lower(recommended_service) like '%planning%' then 'Demand Forecasting & Inventory Sprint'
  when lower(recommended_service) like '%optimization%' or lower(recommended_service) like '%operations research%' then 'Operations Optimization Sprint'
  when lower(recommended_service) like '%financial%' or lower(recommended_service) like '%risk%' then 'FP&A / Cash Flow Forecasting System'
  when lower(recommended_service) like '%automation%' or lower(recommended_service) like '%agent%' then 'AI Automation Assessment'
  when lower(recommended_service) like '%dashboard%' or lower(recommended_service) like '%data engineering%' or lower(recommended_service) like '%analytical foundations%' then 'Data & BI Audit'
  when lower(recommended_service) like '%machine learning%' or lower(recommended_service) like '%ai systems%' then 'AI Automation Assessment'
  else recommended_offer end
where tenant_id='sc-analytics' and coalesce(recommended_offer,'')='' and coalesce(recommended_service,'')<>'';

update public.companies set recommended_offer = case
  when lower(recommended_service) like '%forecast%' or lower(recommended_service) like '%planning%' then 'Demand Forecasting & Inventory Sprint'
  when lower(recommended_service) like '%optimization%' or lower(recommended_service) like '%operations research%' then 'Operations Optimization Sprint'
  when lower(recommended_service) like '%financial%' or lower(recommended_service) like '%risk%' then 'FP&A / Cash Flow Forecasting System'
  when lower(recommended_service) like '%automation%' or lower(recommended_service) like '%agent%' then 'AI Automation Assessment'
  when lower(recommended_service) like '%dashboard%' or lower(recommended_service) like '%data engineering%' or lower(recommended_service) like '%analytical foundations%' then 'Data & BI Audit'
  when lower(recommended_service) like '%machine learning%' or lower(recommended_service) like '%ai systems%' then 'AI Automation Assessment'
  else recommended_offer end
where tenant_id='sc-analytics' and coalesce(recommended_offer,'')='' and coalesce(recommended_service,'')<>'';
