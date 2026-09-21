import 'server-only'

import { queryGrowthRpc } from '@/lib/supabase-growth'
import type { GrowthApproval, GrowthCompany, GrowthInteraction, GrowthMeeting, GrowthOpportunity, GrowthPerson, GrowthTask } from '@/lib/growth-admin'

export type DashboardSummary = { companies:number;active_projects:number;opportunities:number;meetings:number;manual_actions:number;published_content:number;pending_approvals:number;open_tasks:number;failed_tasks:number;invoiced:number;collected:number;spent:number;overdue_invoices:number;web_sessions:number;linkedin_impressions:number;linkedin_posts_measured:number;linkedin_connected:boolean;degraded?:boolean }
export type CommercialSummary = { companies:number;people:number;lead_companies:number;partner_companies:number;lead_people:number;partner_people:number;opportunities:number;meetings:number;manual_actions:number;active_content:number;degraded?:boolean }
export type CommercialSignal = { signal_id:string;company_id?:string|null;company_name:string;website?:string;signal_type:string;title:string;summary?:string;source_url:string;source_domain?:string;observed_at?:string|null;strength:number|string;evidence?:string;recommended_service?:string;recommended_offer?:string;suggested_roles?:string[];phone?:string;phone_source_url?:string;status?:string;metadata?:Record<string,unknown>|null;created_at?:string }
export type CommercialOffer = { offer_key:string;name:string;promise?:string;ideal_for?:string;capabilities?:string[];trigger_types?:string[];duration?:string;entry_scope?:string;price_min?:number|string|null;price_max?:number|string|null;currency?:string;cta?:string;active?:boolean;updated_at?:string }
export type CommercialChannel = { channel_key:string;label:string;category?:string;priority:number|string;objective?:string;motion?:string;cadence?:string;status?:string;notes?:string;updated_at?:string }
export type CommercialIntelligenceBundle = { signals:CommercialSignal[];offers:CommercialOffer[];channels:CommercialChannel[];tasks:GrowthTask[];degraded?:boolean }
export type MetricsSummary = { sessions:number;key_events:number;linkedin_impressions:number;linkedin_posts_measured:number;degraded?:boolean }

export type MetricsBundle={
  linkedin:{impressions:number|string;reach:number|string;reactions:number|string;comments:number|string;reposts:number|string;saves:number|string;clicks:number|string;followers_gained:number|string;posts_measured:number|string;latest_date?:string|null}
  website:{users:number|string;sessions:number|string;engaged_sessions:number|string;page_views:number|string;key_events:number|string;discovery_clicks:number|string;bookings:number|string;latest_date?:string|null}
  seo:{clicks:number|string;impressions:number|string;ctr:number|string;position:number|string;latest_date?:string|null}
  commercial:{opportunities:number|string;meetings:number|string;open_pipeline:number|string;won_value:number|string}
  finance:{invoiced:number|string;collected:number|string;spent:number|string;outstanding:number|string}
  sources:{linkedin_connected:boolean;google_connected:boolean;last_ga4_sync?:string|null;last_search_console_sync?:string|null}
  degraded?:boolean
}

export type DealDeskOpportunity=Record<string,any>&{opportunity_id:string;name:string;stage:string;company_id?:string|null;primary_person_id?:string|null;company_name?:string;person_name?:string;recommended_offer?:string;recommended_service?:string;next_action_at?:string|null;value?:number|string;currency?:string;probability?:number|string}
export type DealDeskBundle={opportunities:DealDeskOpportunity[];companies:Array<Record<string,any>>;people:Array<Record<string,any>>;workspaces:Array<Record<string,any>>;meetings:Array<Record<string,any>>;degraded?:boolean}

export type FinanceCounterparty={counterparty_id:string;kind:string;company_id?:string|null;legal_name:string;trade_name?:string|null;tax_id?:string|null;vat_id?:string|null;country_code?:string|null;billing_address?:string|null;email?:string|null;billing_email?:string|null;phone?:string|null;payment_terms_days?:number|string;currency:string;tax_profile:string;status:string}
export type FinanceBundle={settings:Record<string,unknown>;companies:Array<{company_id:string;name:string}>;counterparties:FinanceCounterparty[];projects:Array<{project_id:string;name:string;status:string}>;invoices:Array<Record<string,any>>;expenses:Array<Record<string,any>>;payments:Array<Record<string,any>>;documents:Array<Record<string,any>>;tax_periods:Array<Record<string,any>>;import_candidates:Array<Record<string,any>>;bank_accounts:Array<Record<string,any>>;bank_transactions:Array<Record<string,any>>;reconciliations:Array<Record<string,any>>;accounts:Array<Record<string,any>>;journal_entries:Array<Record<string,any>>;audit_events:Array<Record<string,any>>;gmail_connections:Array<Record<string,any>>;revolut_connections:Array<Record<string,any>>;invoiced:number;received:number;spent:number;vat_output:number;vat_input:number;withholding_total:number;degraded?:boolean}
export type FinancePeriodReport={period_start:string;period_end:string;invoiced:number|string;expenses:number|string;cash_in:number|string;cash_out:number|string;vat_output:number|string;vat_input:number|string;withholding:number|string;degraded?:boolean}
export type OperationsBundle={tasks:Array<Record<string,unknown>>;projects:Array<Record<string,unknown>>;companies:Array<{company_id:string;name:string}>;opportunities:Array<{opportunity_id:string;name:string}>;degraded?:boolean}
export type CrmBundle={companies:GrowthCompany[];people:GrowthPerson[];actions:GrowthApproval[];interactions:GrowthInteraction[];opportunities:GrowthOpportunity[];meetings:GrowthMeeting[];prospect_tasks:GrowthTask[];calendly_connection?:Record<string,unknown>;degraded?:boolean}

const readOptions={cacheSeconds:8,timeoutMs:3000,retries:1}
const liveReadOptions={cacheSeconds:0,timeoutMs:3000,retries:1}
async function safeRpc<T extends object>(name:string,fallback:T,params:Record<string,string>={}):Promise<T&{degraded?:boolean}>{try{return await queryGrowthRpc<T>(name,params,readOptions)}catch(error){console.error(`Growth performance RPC ${name} failed`,error);return {...fallback,degraded:true}}}
async function safeLiveRpc<T extends object>(name:string,fallback:T,params:Record<string,string>={}):Promise<T&{degraded?:boolean}>{try{return await queryGrowthRpc<T>(name,params,liveReadOptions)}catch(error){console.error(`Growth live RPC ${name} failed`,error);return {...fallback,degraded:true}}}

export function getDashboardSummary(){return safeRpc<DashboardSummary>('growth_dashboard_summary',{companies:0,active_projects:0,opportunities:0,meetings:0,manual_actions:0,published_content:0,pending_approvals:0,open_tasks:0,failed_tasks:0,invoiced:0,collected:0,spent:0,overdue_invoices:0,web_sessions:0,linkedin_impressions:0,linkedin_posts_measured:0,linkedin_connected:false})}
export function getCommercialSummary(){return safeRpc<CommercialSummary>('growth_commercial_summary',{companies:0,people:0,lead_companies:0,partner_companies:0,lead_people:0,partner_people:0,opportunities:0,meetings:0,manual_actions:0,active_content:0})}
export function getCommercialIntelligenceBundle(){return safeRpc<CommercialIntelligenceBundle>('growth_commercial_intelligence_bundle',{signals:[],offers:[],channels:[],tasks:[]})}
export function getMetricsSummary(){return safeRpc<MetricsSummary>('growth_metrics_summary',{sessions:0,key_events:0,linkedin_impressions:0,linkedin_posts_measured:0})}
export function getMetricsBundle(){return safeRpc<MetricsBundle>('growth_metrics_bundle',{linkedin:{impressions:0,reach:0,reactions:0,comments:0,reposts:0,saves:0,clicks:0,followers_gained:0,posts_measured:0,latest_date:null},website:{users:0,sessions:0,engaged_sessions:0,page_views:0,key_events:0,discovery_clicks:0,bookings:0,latest_date:null},seo:{clicks:0,impressions:0,ctr:0,position:0,latest_date:null},commercial:{opportunities:0,meetings:0,open_pipeline:0,won_value:0},finance:{invoiced:0,collected:0,spent:0,outstanding:0},sources:{linkedin_connected:false,google_connected:false,last_ga4_sync:null,last_search_console_sync:null}})}
export function getDealDeskBundle(){return safeRpc<DealDeskBundle>('growth_deal_desk_bundle',{opportunities:[],companies:[],people:[],workspaces:[],meetings:[]})}
export function getFinanceBundle(){return safeRpc<FinanceBundle>('growth_finance_bundle',{settings:{},companies:[],counterparties:[],projects:[],invoices:[],expenses:[],payments:[],documents:[],tax_periods:[],import_candidates:[],bank_accounts:[],bank_transactions:[],reconciliations:[],accounts:[],journal_entries:[],audit_events:[],gmail_connections:[],revolut_connections:[],invoiced:0,received:0,spent:0,vat_output:0,vat_input:0,withholding_total:0})}
export function getFinancePeriodReport(start:string,end:string){return safeRpc<FinancePeriodReport>('finance_period_report',{period_start:start,period_end:end,invoiced:0,expenses:0,cash_in:0,cash_out:0,vat_output:0,vat_input:0,withholding:0},{p_start:start,p_end:end})}
export function getOperationsBundle(){return safeRpc<OperationsBundle>('growth_operations_bundle',{tasks:[],projects:[],companies:[],opportunities:[]})}
export function getCrmBundle(){return safeLiveRpc<CrmBundle>('growth_crm_bundle',{companies:[],people:[],actions:[],interactions:[],opportunities:[],meetings:[],prospect_tasks:[],calendly_connection:{}})}
