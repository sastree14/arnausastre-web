insert into public.seo_keyword_targets
(keyword_id,tenant_id,keyword,search_intent,service_area,priority,target_path,notes)
values
  ('seo_kw_es_consultoria_datos','sc-analytics','consultoría de datos','commercial','Data & AI Strategy',10,'/services/consultoria-datos','ES high-intent category'),
  ('seo_kw_es_consultoria_data_science','sc-analytics','consultoría data science','commercial','Data & AI Strategy',10,'/services/consultoria-data-science','ES high-intent category'),
  ('seo_kw_es_consultoria_ia','sc-analytics','consultoría inteligencia artificial','commercial','AI Automation & Agents',10,'/services/consultoria-inteligencia-artificial','ES high-intent category'),
  ('seo_kw_es_empresa_data_science','sc-analytics','empresa data science','commercial','Data & AI Strategy',9,'/services/empresa-data-science','ES category discovery'),
  ('seo_kw_es_automatizacion_ia','sc-analytics','automatización con IA para empresas','commercial','AI Automation & Agents',10,'/services/automatizacion-ia-empresas','ES commercial'),
  ('seo_kw_es_data_pymes','sc-analytics','data science para pymes','commercial','Data & AI Strategy',9,'/services/data-science-pymes','SME commercial'),
  ('seo_kw_es_ia_pymes','sc-analytics','inteligencia artificial para pymes','commercial','AI Automation & Agents',9,'/services/inteligencia-artificial-pymes','SME commercial'),
  ('seo_kw_es_forecasting_ventas','sc-analytics','forecasting de ventas','commercial','Forecasting & Planning',9,'/services/forecasting-ventas','ES forecasting'),
  ('seo_kw_es_optimizacion_operaciones','sc-analytics','optimización de operaciones','commercial','Optimization / OR',9,'/services/optimizacion-operaciones','ES optimization'),
  ('seo_kw_es_analitica_empresas','sc-analytics','analítica de datos para empresas','commercial','BI & Decision Intelligence',9,'/services/analitica-datos-empresas','ES analytics'),
  ('seo_kw_es_agentes_ia','sc-analytics','agentes de IA para empresas','commercial','AI Automation & Agents',9,'/services/agentes-ia-empresas','ES agent systems'),
  ('seo_kw_es_optimizacion_inventario','sc-analytics','optimización de inventario','commercial','Optimization / OR',9,'/services/optimizacion-inventario','ES inventory'),
  ('seo_kw_es_prediccion_demanda','sc-analytics','predicción de demanda','commercial','Forecasting & Planning',10,'/services/prediccion-demanda','ES demand'),
  ('seo_kw_ca_consultoria_dades','sc-analytics','consultoria de dades','commercial','Data & AI Strategy',7,'/services/consultoria-dades','CA commercial'),
  ('seo_kw_ca_intelligencia_artificial','sc-analytics','consultoria intel·ligència artificial','commercial','AI Automation & Agents',7,'/services/consultoria-intelligencia-artificial','CA commercial'),
  ('seo_kw_ca_optimitzacio','sc-analytics','optimització empresarial','commercial','Optimization / OR',7,'/services/optimitzacio-empresarial','CA commercial')
on conflict (tenant_id,keyword) do update
set priority=greatest(public.seo_keyword_targets.priority,excluded.priority),
    target_path=excluded.target_path,
    service_area=excluded.service_area,
    notes=excluded.notes,
    status='active',
    updated_at=now();
