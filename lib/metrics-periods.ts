import 'server-only'

import { queryGrowthTable } from '@/lib/supabase-growth'

export type MetricsPeriodKind='month'|'quarter'|'year'
export type MetricsTrendKey='sessions'|'page_views'|'seo_clicks'|'seo_impressions'|'opportunities'|'meetings'|'invoiced'|'collected'|'spent'

export type PeriodOption={key:string;label:string;start:string;end:string}
export type PeriodMetrics={
  sessions:number
  engaged_sessions:number
  page_views:number
  key_events:number
  discovery_clicks:number
  bookings:number
  seo_clicks:number
  seo_impressions:number
  seo_ctr:number|null
  seo_position:number|null
  opportunities:number
  meetings:number
  invoiced:number
  collected:number
  spent:number
}
export type MetricsComparisonBundle={
  kind:MetricsPeriodKind
  periodA:PeriodOption
  periodB:PeriodOption
  a:PeriodMetrics
  b:PeriodMetrics
  trendMetric:MetricsTrendKey
  series:Array<{key:string;label:string;value:number}>
  webHistoryAvailable:boolean
  degraded?:boolean
}

type WebRow={metric_date:string;sessions?:number|string;engaged_sessions?:number|string;page_views?:number|string;key_events?:number|string;discovery_clicks?:number|string;bookings?:number|string;metadata?:Record<string,unknown>|null}
type SeoRow={metric_date:string;clicks?:number|string;impressions?:number|string;position?:number|string}
type OpportunityRow={created_at?:string|null}
type MeetingRow={starts_at?:string|null;status?:string|null}
type InvoiceRow={issue_date?:string|null;amount_eur?:number|string|null;total?:number|string|null;status?:string|null;review_status?:string|null}
type PaymentRow={payment_date?:string|null;amount_eur?:number|string|null;amount?:number|string|null;direction?:string|null;status?:string|null;review_status?:string|null}
type ExpenseRow={expense_date?:string|null;amount_eur?:number|string|null;total?:number|string|null;status?:string|null;review_status?:string|null}

const TENANT='sc-analytics'
const n=(value:unknown)=>Number(value||0)
const pad=(value:number)=>String(value).padStart(2,'0')
const isoDate=(year:number,month:number,day:number)=>`${year}-${pad(month)}-${pad(day)}`
const daysInMonth=(year:number,month:number)=>new Date(Date.UTC(year,month,0)).getUTCDate()
const nextDay=(date:string)=>{const d=new Date(`${date}T00:00:00Z`);d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10)}
const dateOnly=(value?:string|null)=>String(value||'').slice(0,10)
const inRange=(value:string,start:string,end:string)=>value>=start&&value<=end
const money=(row:{amount_eur?:number|string|null;total?:number|string|null;amount?:number|string|null})=>n(row.amount_eur??row.total??row.amount)

export function normalizePeriodKind(value?:string):MetricsPeriodKind{
  return value==='quarter'||value==='year'?value:'month'
}

function optionFor(kind:MetricsPeriodKind,year:number,index:number):PeriodOption{
  if(kind==='month'){
    const month=index
    return {key:`${year}-${pad(month)}`,label:new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month-1,1))),start:isoDate(year,month,1),end:isoDate(year,month,daysInMonth(year,month))}
  }
  if(kind==='quarter'){
    const quarter=index
    const startMonth=(quarter-1)*3+1
    const endMonth=startMonth+2
    return {key:`${year}-Q${quarter}`,label:`T${quarter} ${year}`,start:isoDate(year,startMonth,1),end:isoDate(year,endMonth,daysInMonth(year,endMonth))}
  }
  return {key:String(year),label:String(year),start:`${year}-01-01`,end:`${year}-12-31`}
}

export function periodOptions(kind:MetricsPeriodKind,count?:number,now=new Date()):PeriodOption[]{
  const wanted=count??(kind==='month'?24:kind==='quarter'?12:6)
  const options:PeriodOption[]=[]
  let year=now.getUTCFullYear()
  let index=kind==='month'?now.getUTCMonth()+1:kind==='quarter'?Math.floor(now.getUTCMonth()/3)+1:1
  for(let i=0;i<wanted;i+=1){
    options.push(optionFor(kind,year,index))
    if(kind==='month'){index-=1;if(index<1){index=12;year-=1}}
    else if(kind==='quarter'){index-=1;if(index<1){index=4;year-=1}}
    else year-=1
  }
  return options
}

export function resolvePeriod(kind:MetricsPeriodKind,key:string|undefined,options=periodOptions(kind)):PeriodOption{
  return options.find(item=>item.key===key)||options[0]
}

async function safeRows<T>(table:string,params:Record<string,string>):Promise<T[]>{
  try{return await queryGrowthTable<T>(table,params,{cacheSeconds:0,timeoutMs:5000,retries:1})}
  catch(error){console.error(`Metrics period query failed for ${table}`,error);return []}
}

function emptyMetrics():PeriodMetrics{
  return {sessions:0,engaged_sessions:0,page_views:0,key_events:0,discovery_clicks:0,bookings:0,seo_clicks:0,seo_impressions:0,seo_ctr:null,seo_position:null,opportunities:0,meetings:0,invoiced:0,collected:0,spent:0}
}

function aggregatePeriod(
  period:PeriodOption,
  web:WebRow[],
  seo:SeoRow[],
  opportunities:OpportunityRow[],
  meetings:MeetingRow[],
  invoices:InvoiceRow[],
  payments:PaymentRow[],
  expenses:ExpenseRow[],
):PeriodMetrics{
  const result=emptyMetrics()
  for(const row of web){
    if(!inRange(dateOnly(row.metric_date),period.start,period.end))continue
    result.sessions+=n(row.sessions)
    result.engaged_sessions+=n(row.engaged_sessions)
    result.page_views+=n(row.page_views)
    result.key_events+=n(row.key_events)
    result.discovery_clicks+=n(row.discovery_clicks)
    result.bookings+=n(row.bookings)
  }
  let positionWeight=0
  for(const row of seo){
    if(!inRange(dateOnly(row.metric_date),period.start,period.end))continue
    const impressions=n(row.impressions),clicks=n(row.clicks)
    result.seo_clicks+=clicks
    result.seo_impressions+=impressions
    positionWeight+=n(row.position)*impressions
  }
  result.seo_ctr=result.seo_impressions>0?result.seo_clicks/result.seo_impressions:null
  result.seo_position=result.seo_impressions>0?positionWeight/result.seo_impressions:null
  result.opportunities=opportunities.filter(row=>inRange(dateOnly(row.created_at),period.start,period.end)).length
  result.meetings=meetings.filter(row=>inRange(dateOnly(row.starts_at),period.start,period.end)&&String(row.status||'').toLowerCase()!=='cancelled').length
  result.invoiced=invoices
    .filter(row=>inRange(dateOnly(row.issue_date),period.start,period.end)&&!['void','cancelled'].includes(String(row.status||''))&&['reviewed','confirmed'].includes(String(row.review_status||'')))
    .reduce((sum,row)=>sum+money(row),0)
  result.collected=payments
    .filter(row=>inRange(dateOnly(row.payment_date),period.start,period.end)&&row.direction==='inflow'&&['received','confirmed','matched'].includes(String(row.status||''))&&['reviewed','confirmed'].includes(String(row.review_status||'')))
    .reduce((sum,row)=>sum+money(row),0)
  result.spent=expenses
    .filter(row=>inRange(dateOnly(row.expense_date),period.start,period.end)&&!['void','cancelled'].includes(String(row.status||''))&&['reviewed','confirmed'].includes(String(row.review_status||'')))
    .reduce((sum,row)=>sum+money(row),0)
  return result
}

function metricValue(metrics:PeriodMetrics,key:MetricsTrendKey){
  if(key==='seo_clicks')return metrics.seo_clicks
  if(key==='seo_impressions')return metrics.seo_impressions
  return metrics[key]
}

export async function getMetricsComparison(input:{kind:MetricsPeriodKind;periodA?:string;periodB?:string;trendMetric?:string}):Promise<MetricsComparisonBundle>{
  const kind=input.kind
  const options=periodOptions(kind)
  const periodA=resolvePeriod(kind,input.periodA,options)
  const periodB=resolvePeriod(kind,input.periodB,options.slice(1).length?options.slice(1):options)
  const allowedTrend:MetricsTrendKey[]=['sessions','page_views','seo_clicks','seo_impressions','opportunities','meetings','invoiced','collected','spent']
  const trendMetric=allowedTrend.includes(input.trendMetric as MetricsTrendKey)?input.trendMetric as MetricsTrendKey:'sessions'
  const trendPeriods=options.slice(0,kind==='month'?12:kind==='quarter'?8:5).reverse()
  const starts=[periodA.start,periodB.start,...trendPeriods.map(item=>item.start)].sort()
  const ends=[periodA.end,periodB.end,...trendPeriods.map(item=>item.end)].sort()
  const start=starts[0],end=ends[ends.length-1],endExclusive=nextDay(end)
  const dateAnd=(field:string)=>`(${field}.gte.${start},${field}.lt.${endExclusive})`
  const plainDateAnd=(field:string)=>`(${field}.gte.${start},${field}.lte.${end})`

  const [web,seo,opportunities,meetings,invoices,payments,expenses]=await Promise.all([
    safeRows<WebRow>('web_analytics_daily',{tenant_id:`eq.${TENANT}`,'metadata->>scope':'eq.daily_total',and:plainDateAnd('metric_date'),order:'metric_date.asc',limit:'5000'}),
    safeRows<SeoRow>('search_console_daily',{tenant_id:`eq.${TENANT}`,and:plainDateAnd('metric_date'),order:'metric_date.asc',limit:'10000'}),
    safeRows<OpportunityRow>('crm_opportunities',{tenant_id:`eq.${TENANT}`,and:dateAnd('created_at'),order:'created_at.asc',limit:'5000'}),
    safeRows<MeetingRow>('crm_meetings',{tenant_id:`eq.${TENANT}`,and:dateAnd('starts_at'),order:'starts_at.asc',limit:'5000'}),
    safeRows<InvoiceRow>('finance_invoices',{tenant_id:`eq.${TENANT}`,and:plainDateAnd('issue_date'),order:'issue_date.asc',limit:'5000'}),
    safeRows<PaymentRow>('finance_payments',{tenant_id:`eq.${TENANT}`,and:plainDateAnd('payment_date'),order:'payment_date.asc',limit:'5000'}),
    safeRows<ExpenseRow>('finance_expenses',{tenant_id:`eq.${TENANT}`,and:plainDateAnd('expense_date'),order:'expense_date.asc',limit:'5000'}),
  ])

  const a=aggregatePeriod(periodA,web,seo,opportunities,meetings,invoices,payments,expenses)
  const b=aggregatePeriod(periodB,web,seo,opportunities,meetings,invoices,payments,expenses)
  const series=trendPeriods.map(period=>({key:period.key,label:period.label,value:metricValue(aggregatePeriod(period,web,seo,opportunities,meetings,invoices,payments,expenses),trendMetric)}))
  return {kind,periodA,periodB,a,b,trendMetric,series,webHistoryAvailable:web.length>0}
}
