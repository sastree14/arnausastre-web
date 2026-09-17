export type MetricMode='automatic'|'scheduled'|'manual_import'|'manual_entry'
export type MetricDefinition={
  group:string
  metric:string
  source:string
  storage:string
  formula:string
  mode:MetricMode
  refresh:string
  zeroMeaning:string
  action?:string
}

export const METRIC_CATALOG:MetricDefinition[]=[
  {group:'Comercial',metric:'Oportunidades',source:'CRM',storage:'crm_opportunities',formula:'COUNT de oportunidades del tenant',mode:'automatic',refresh:'Al guardar/eliminar una oportunidad',zeroMeaning:'0 real si el CRM está en uso; si aún no has creado deals, significa sin datos operativos'},
  {group:'Comercial',metric:'Pipeline abierto',source:'CRM',storage:'crm_opportunities',formula:'SUM(value) de stages distintos de won/lost',mode:'automatic',refresh:'Inmediato al modificar Deal Desk',zeroMeaning:'0 € real si no hay oportunidades abiertas con valor'},
  {group:'Comercial',metric:'Reuniones',source:'Calendly/CRM',storage:'meetings',formula:'COUNT de reuniones sincronizadas',mode:'automatic',refresh:'Webhook/Sync Calendly',zeroMeaning:'Sin reuniones registradas o Calendly aún no sincronizado'},
  {group:'Finanzas',metric:'Facturado',source:'Finance OS',storage:'finance_invoices',formula:'SUM(amount_eur o total) excluyendo void/cancelled y solo review_status reviewed/confirmed',mode:'automatic',refresh:'Al revisar/confirmar una factura',zeroMeaning:'0 confirmado; documentos pendientes de revisión no cuentan'},
  {group:'Finanzas',metric:'Cobrado',source:'Finance OS',storage:'finance_payments',formula:'SUM(amount_eur o amount) de inflow confirmado/conciliado',mode:'automatic',refresh:'Al confirmar cobro o conciliación',zeroMeaning:'0 cobrado confirmado; un extracto importado pero no conciliado no cuenta'},
  {group:'Finanzas',metric:'Gasto',source:'Finance OS',storage:'finance_expenses',formula:'SUM(amount_eur o total) excluyendo void/cancelled y solo reviewed/confirmed',mode:'automatic',refresh:'Al revisar/confirmar gasto',zeroMeaning:'0 gasto confirmado; candidatos Gmail no cuentan todavía'},
  {group:'Finanzas',metric:'IVA repercutido',source:'Facturas confirmadas',storage:'finance_invoices.tax',formula:'SUM(tax) del periodo',mode:'automatic',refresh:'Al confirmar factura',zeroMeaning:'0 si no hay IVA confirmado en el periodo'},
  {group:'Finanzas',metric:'IVA soportado',source:'Gastos confirmados',storage:'finance_expenses.tax',formula:'SUM(tax) del periodo',mode:'automatic',refresh:'Al confirmar gasto',zeroMeaning:'0 si no hay IVA confirmado en el periodo'},
  {group:'Website',metric:'Usuarios',source:'Google Analytics 4',storage:'web_analytics_daily · scope=period_total',formula:'activeUsers exactos del informe GA4 sin dimensiones para la ventana sincronizada',mode:'scheduled',refresh:'Cron diario + botón Sincronizar Google',zeroMeaning:'0 real solo si existe un period_total sincronizado; sin snapshot significa sin datos'},
  {group:'Website',metric:'Sesiones',source:'Google Analytics 4',storage:'web_analytics_daily · scope=period_total',formula:'sessions exactas del informe GA4 sin dimensiones; no se suman filas por canal/página',mode:'scheduled',refresh:'Cron diario + manual',zeroMeaning:'0 real solo con period_total sincronizado'},
  {group:'Website',metric:'Engagement web',source:'Google Analytics 4',storage:'web_analytics_daily · scope=period_total',formula:'engaged_sessions exactas / sessions exactas del mismo period_total',mode:'scheduled',refresh:'Cron diario + manual',zeroMeaning:'0% si hay sesiones sin engaged sessions; — si no existe snapshot'},
  {group:'Website',metric:'Discovery intent',source:'GA4 events',storage:'web_analytics_daily · scope=period_event',formula:'Suma de los últimos totales de discovery_call_click y calendly_open de la misma ventana',mode:'scheduled',refresh:'Cron diario + manual',zeroMeaning:'0 eventos en un snapshot sincronizado'},
  {group:'Website',metric:'Bookings',source:'GA4/Calendly attribution',storage:'web_analytics_daily · scope=period_event',formula:'Último total de calendly_booked de la ventana sincronizada',mode:'scheduled',refresh:'Cron diario + manual',zeroMeaning:'0 bookings atribuidos en un snapshot sincronizado'},
  {group:'SEO',metric:'Clicks orgánicos',source:'Google Search Console',storage:'search_console_daily',formula:'SUM(clicks)',mode:'scheduled',refresh:'Cron diario + botón Sincronizar Google',zeroMeaning:'0 real solo después de una sync; sin sync = sin datos'},
  {group:'SEO',metric:'Impresiones SEO',source:'Google Search Console',storage:'search_console_daily',formula:'SUM(impressions)',mode:'scheduled',refresh:'Cron diario + manual',zeroMeaning:'0 impresiones sincronizadas'},
  {group:'SEO',metric:'CTR',source:'Google Search Console',storage:'search_console_daily',formula:'SUM(clicks) / SUM(impressions)',mode:'scheduled',refresh:'Cron diario + manual',zeroMeaning:'— si no hay impresiones'},
  {group:'SEO',metric:'Posición media',source:'Google Search Console',storage:'search_console_daily',formula:'Media ponderada por impresiones de position',mode:'scheduled',refresh:'Cron diario + manual',zeroMeaning:'— si no existen impresiones'},
  {group:'LinkedIn',metric:'Impressions',source:'Export oficial LinkedIn',storage:'linkedin_post_metrics',formula:'SUM de último snapshot por post',mode:'manual_import',refresh:'Al importar XLSX oficial de Content / post performance',zeroMeaning:'0 solo si un import contiene 0; sin import = sin datos'},
  {group:'LinkedIn',metric:'Reach',source:'Export oficial LinkedIn',storage:'linkedin_post_metrics',formula:'SUM de último snapshot por post',mode:'manual_import',refresh:'Import XLSX Content / post performance',zeroMeaning:'Sin import no se interpreta como 0 real'},
  {group:'LinkedIn',metric:'Engagement',source:'Export oficial LinkedIn',storage:'linkedin_post_metrics',formula:'(reactions + comments + reposts + saves + clicks) / (reach o impressions)',mode:'manual_import',refresh:'Import XLSX Content / post performance',zeroMeaning:'— si no hay denominador'},
  {group:'LinkedIn',metric:'Followers gained',source:'Export oficial LinkedIn',storage:'linkedin_post_metrics',formula:'SUM(followers_gained) cuando la columna está presente en el export de contenido',mode:'manual_import',refresh:'Import XLSX Content / post performance',zeroMeaning:'Sin import = sin datos, no 0 confirmado'},
  {group:'Banco',metric:'Movimientos',source:'Revolut Personal',storage:'finance_bank_transactions',formula:'Filas únicas por fingerprint del extracto',mode:'manual_import',refresh:'Subida CSV/XLSX',zeroMeaning:'Sin importación bancaria = sin datos bancarios'},
  {group:'Gmail financiero',metric:'Candidatos de gasto',source:'Gmail personal + corporativo',storage:'finance_import_candidates',formula:'Correos/adjuntos detectados y deduplicados pendientes de revisión',mode:'scheduled',refresh:'Worker periódico + botón Actualizar Gmail',zeroMeaning:'0 candidatos después de un scan es un 0 real para la ventana buscada'},
]

export const MODE_LABEL:Record<MetricMode,string>={automatic:'Automático en CRM',scheduled:'Sincronización automática',manual_import:'Importación manual',manual_entry:'Entrada manual'}