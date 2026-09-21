import 'server-only'

import { createHash, randomUUID } from 'node:crypto'
import { getCorporateGoogleConnection, getGmailAccessToken } from '@/lib/google-oauth-finance'
import { growthSupabaseHeaders, growthSupabaseUrl, insertGrowthRow, updateGrowthRow } from '@/lib/supabase-growth'

type Json=Record<string,any>
const TENANT_ID='sc-analytics'
const MEASUREMENT_ID='G-3E1DK7935G'
const ANALYTICS_SCOPE='https://www.googleapis.com/auth/analytics.readonly'
const SEARCH_SCOPE='https://www.googleapis.com/auth/webmasters.readonly'

function hash(...parts:string[]){return createHash('sha256').update(parts.join('|')).digest('hex')}
function metric(row:Json,index:number){return Number(row.metricValues?.[index]?.value||0)}
function dimension(row:Json,index:number){return String(row.dimensionValues?.[index]?.value||'')}
function dateDaysAgo(days:number){const d=new Date();d.setUTCDate(d.getUTCDate()-days);return d.toISOString().slice(0,10)}

async function googleJson(url:string,accessToken:string,init:RequestInit={}){
  const response=await fetch(url,{...init,headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json',...(init.headers||{})},cache:'no-store'})
  const body=await response.json().catch(()=>({})) as Json
  if(!response.ok) throw new Error(`Google API ${response.status}: ${body.error?.message||body.error_description||JSON.stringify(body).slice(0,500)}`)
  return body
}

async function bulkUpsert(table:string,rows:Json[],onConflict:string){
  if(!rows.length) return 0
  let written=0
  for(let i=0;i<rows.length;i+=400){
    const chunk=rows.slice(i,i+400)
    const url=new URL(`${growthSupabaseUrl()}/rest/v1/${table}`);url.searchParams.set('on_conflict',onConflict)
    const response=await fetch(url,{method:'POST',headers:growthSupabaseHeaders({Prefer:'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify(chunk),cache:'no-store'})
    if(!response.ok) throw new Error(`Supabase ${table} bulk upsert failed: ${response.status} ${await response.text()}`)
    written+=chunk.length
  }
  return written
}

async function connectionAndToken(requiredScope:string){
  const connection=await getCorporateGoogleConnection()
  if(!connection) throw new Error('Google Workspace no está conectado. Autoriza la cuenta corporativa desde Métricas o Finanzas.')
  const scopes=Array.isArray(connection.scopes)?connection.scopes.map(String):[]
  if(!scopes.includes(requiredScope)) throw new Error('La cuenta corporativa debe reautorizarse una vez para añadir permisos de Analytics/Search Console.')
  return {connection,accessToken:await getGmailAccessToken(connection)}
}

async function resolveGa4Property(connection:Json,accessToken:string){
  const cached=String(connection.metadata?.ga4_property_id||'')
  if(cached) return cached.replace(/^properties\//,'')
  const summaries=await googleJson('https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200',accessToken)
  const properties=(summaries.accountSummaries||[]).flatMap((account:Json)=>account.propertySummaries||[]) as Json[]
  for(const property of properties){
    const name=String(property.property||'')
    if(!name) continue
    const streams=await googleJson(`https://analyticsadmin.googleapis.com/v1beta/${name}/dataStreams?pageSize=200`,accessToken)
    const match=(streams.dataStreams||[]).find((stream:Json)=>String(stream.webStreamData?.measurementId||'')===MEASUREMENT_ID)
    if(match){
      const propertyId=name.replace(/^properties\//,'')
      await updateGrowthRow('integration_connections','connection_id',String(connection.connection_id),{metadata:{...(connection.metadata||{}),ga4_property_id:propertyId,ga4_measurement_id:MEASUREMENT_ID,ga4_property_name:property.displayName||''},updated_at:new Date().toISOString()})
      return propertyId
    }
  }
  throw new Error(`No se encontró ninguna propiedad GA4 con Measurement ID ${MEASUREMENT_ID} en la cuenta autorizada.`)
}

async function resolveSearchConsoleSite(connection:Json,accessToken:string){
  const cached=String(connection.metadata?.search_console_site||'')
  if(cached) return cached
  const body=await googleJson('https://www.googleapis.com/webmasters/v3/sites',accessToken)
  const sites=(body.siteEntry||[]) as Json[]
  const preferred=sites.find((site)=>String(site.siteUrl||'')==='sc-domain:sc-analytics.io')||sites.find((site)=>/sc-analytics\.io\/?$/i.test(String(site.siteUrl||'')))
  if(!preferred) throw new Error('No se encontró sc-analytics.io entre las propiedades autorizadas de Search Console.')
  const siteUrl=String(preferred.siteUrl)
  await updateGrowthRow('integration_connections','connection_id',String(connection.connection_id),{metadata:{...(connection.metadata||{}),search_console_site:siteUrl},updated_at:new Date().toISOString()})
  return siteUrl
}

async function startRun(provider:string){
  const id=`analytics_${provider}_${randomUUID().replaceAll('-','').slice(0,16)}`
  await insertGrowthRow('analytics_sync_runs',{sync_run_id:id,tenant_id:TENANT_ID,provider,status:'running',started_at:new Date().toISOString(),rows_written:0,metadata:{}})
  return id
}
async function completeRun(id:string,rows:number,metadata:Json={}){await updateGrowthRow('analytics_sync_runs','sync_run_id',id,{status:'completed',completed_at:new Date().toISOString(),rows_written:rows,metadata})}
async function failRun(id:string,error:unknown){await updateGrowthRow('analytics_sync_runs','sync_run_id',id,{status:'failed',completed_at:new Date().toISOString(),error:error instanceof Error?error.message:String(error)})}

export async function syncGa4(days=365){
  const runId=await startRun('ga4')
  try{
    const {connection,accessToken}=await connectionAndToken(ANALYTICS_SCOPE)
    const propertyId=await resolveGa4Property(connection,accessToken)
    const windowDays=Math.max(1,days)
    const dateRange={startDate:`${windowDays}daysAgo`,endDate:'today'}
    const [totals,acquisition,events,dailyTotals,dailyEvents]=await Promise.all([
      googleJson(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,accessToken,{method:'POST',body:JSON.stringify({dateRanges:[dateRange],metrics:[{name:'activeUsers'},{name:'sessions'},{name:'engagedSessions'},{name:'screenPageViews'},{name:'keyEvents'}]})}),
      googleJson(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,accessToken,{method:'POST',body:JSON.stringify({dateRanges:[dateRange],dimensions:[{name:'sessionSource'},{name:'sessionMedium'},{name:'sessionCampaignName'},{name:'sessionManualAdContent'}],metrics:[{name:'sessions'},{name:'engagedSessions'},{name:'screenPageViews'},{name:'keyEvents'}],limit:'100000'})}),
      googleJson(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,accessToken,{method:'POST',body:JSON.stringify({dateRanges:[dateRange],dimensions:[{name:'eventName'}],metrics:[{name:'eventCount'}],dimensionFilter:{filter:{fieldName:'eventName',inListFilter:{values:['contact_click','discovery_call_click','calendly_open','calendly_booked']}}},limit:'100'})}),
      googleJson(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,accessToken,{method:'POST',body:JSON.stringify({dateRanges:[dateRange],dimensions:[{name:'date'}],metrics:[{name:'activeUsers'},{name:'sessions'},{name:'engagedSessions'},{name:'screenPageViews'},{name:'keyEvents'}],limit:'100000'})}),
      googleJson(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,accessToken,{method:'POST',body:JSON.stringify({dateRanges:[dateRange],dimensions:[{name:'date'},{name:'eventName'}],metrics:[{name:'eventCount'}],dimensionFilter:{filter:{fieldName:'eventName',inListFilter:{values:['contact_click','discovery_call_click','calendly_open','calendly_booked']}}},limit:'100000'})}),
    ])
    const now=new Date().toISOString(),today=now.slice(0,10)
    const total=Array.isArray(totals.rows)&&totals.rows.length?totals.rows[0]:{}
    const totalRow:Json={
      tenant_id:TENANT_ID,metric_date:today,source:'(total)',medium:'period',campaign:`${windowDays}d`,content_id:null,page_path:'(all)',
      users:metric(total,0),sessions:metric(total,1),engaged_sessions:metric(total,2),page_views:metric(total,3),key_events:metric(total,4),discovery_clicks:0,bookings:0,
      sync_key:hash('ga4_period_total',String(windowDays)),metadata:{provider:'ga4',property_id:propertyId,scope:'period_total',window_days:windowDays},created_at:now,
    }
    const acquisitionRows:Json[]=(acquisition.rows||[]).map((row:Json)=>{
      const source=dimension(row,0)||'(direct)',medium=dimension(row,1)||'(none)',campaign=dimension(row,2),contentId=dimension(row,3)
      return {tenant_id:TENANT_ID,metric_date:today,source,medium,campaign,content_id:null,page_path:'(all)',users:0,sessions:metric(row,0),engaged_sessions:metric(row,1),page_views:metric(row,2),key_events:metric(row,3),discovery_clicks:0,bookings:0,sync_key:hash('ga4_acquisition_period',String(windowDays),source,medium,campaign,contentId),metadata:{provider:'ga4',property_id:propertyId,scope:'acquisition',window_days:windowDays,session_manual_ad_content:contentId&&contentId!=='(not set)'?contentId:null},created_at:now}
    })
    const eventRows:Json[]=(events.rows||[]).map((row:Json)=>{
      const eventName=dimension(row,0),count=metric(row,0)
      return {tenant_id:TENANT_ID,metric_date:today,source:'(events_total)',medium:'period',campaign:`${windowDays}d`,content_id:null,page_path:'(all)',users:0,sessions:0,engaged_sessions:0,page_views:0,key_events:0,discovery_clicks:['discovery_call_click','calendly_open'].includes(eventName)?count:0,bookings:eventName==='calendly_booked'?count:0,sync_key:hash('ga4_period_event',String(windowDays),eventName),metadata:{provider:'ga4',property_id:propertyId,scope:'period_event',window_days:windowDays,event_name:eventName,event_count:count},created_at:now}
    })
    const eventByDate=new Map<string,{discovery:number;bookings:number}>()
    for(const row of (dailyEvents.rows||[]) as Json[]){
      const rawDate=dimension(row,0),eventName=dimension(row,1),count=metric(row,0)
      if(!/^\d{8}$/.test(rawDate))continue
      const date=`${rawDate.slice(0,4)}-${rawDate.slice(4,6)}-${rawDate.slice(6,8)}`
      const current=eventByDate.get(date)||{discovery:0,bookings:0}
      if(['discovery_call_click','calendly_open'].includes(eventName))current.discovery+=count
      if(eventName==='calendly_booked')current.bookings+=count
      eventByDate.set(date,current)
    }
    const dailyRows:Json[]=(dailyTotals.rows||[]).map((row:Json)=>{
      const rawDate=dimension(row,0)
      if(!/^\d{8}$/.test(rawDate))return null
      const date=`${rawDate.slice(0,4)}-${rawDate.slice(4,6)}-${rawDate.slice(6,8)}`
      const attributed=eventByDate.get(date)||{discovery:0,bookings:0}
      return {tenant_id:TENANT_ID,metric_date:date,source:'(daily_total)',medium:'day',campaign:'',content_id:null,page_path:'(all)',users:metric(row,0),sessions:metric(row,1),engaged_sessions:metric(row,2),page_views:metric(row,3),key_events:metric(row,4),discovery_clicks:attributed.discovery,bookings:attributed.bookings,sync_key:hash('ga4_daily_total',date),metadata:{provider:'ga4',property_id:propertyId,scope:'daily_total'},created_at:now}
    }).filter(Boolean) as Json[]
    const written=await bulkUpsert('web_analytics_daily',[totalRow,...acquisitionRows,...eventRows,...dailyRows],'tenant_id,sync_key')
    await completeRun(runId,written,{property_id:propertyId,measurement_id:MEASUREMENT_ID,window_days:windowDays,total_rows:1,acquisition_rows:acquisitionRows.length,event_rows:eventRows.length,daily_rows:dailyRows.length})
    return {ok:true,rows:written,propertyId}
  }catch(error){await failRun(runId,error);throw error}
}

export async function syncSearchConsole(days=365){
  const runId=await startRun('search_console')
  try{
    const {connection,accessToken}=await connectionAndToken(SEARCH_SCOPE)
    const siteUrl=await resolveSearchConsoleSite(connection,accessToken)
    const startDate=dateDaysAgo(Math.max(1,days)),endDate=dateDaysAgo(2)
    const body=await googleJson(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,accessToken,{method:'POST',body:JSON.stringify({startDate,endDate,dimensions:['date','query','page','country','device'],rowLimit:25000,dataState:'final'})})
    const now=new Date().toISOString()
    const rows:Json[]=(body.rows||[]).map((row:Json)=>{const keys=(row.keys||[]).map(String),date=keys[0]||startDate,query=keys[1]||'',page=keys[2]||'',country=keys[3]||'',device=keys[4]||'';return {tenant_id:TENANT_ID,metric_date:date,query,page,country,device,clicks:Number(row.clicks||0),impressions:Number(row.impressions||0),ctr:Number(row.ctr||0),position:Number(row.position||0),sync_key:hash('gsc',date,query,page,country,device),metadata:{provider:'search_console',site_url:siteUrl},created_at:now,updated_at:now}})
    const written=await bulkUpsert('search_console_daily',rows,'tenant_id,sync_key')
    await completeRun(runId,written,{site_url:siteUrl,start_date:startDate,end_date:endDate})
    return {ok:true,rows:written,siteUrl}
  }catch(error){await failRun(runId,error);throw error}
}

export async function syncMarketingMetrics(days=365){
  const [ga4,searchConsole]=await Promise.allSettled([syncGa4(days),syncSearchConsole(days)])
  return {
    ga4:ga4.status==='fulfilled'?ga4.value:{ok:false,error:ga4.reason instanceof Error?ga4.reason.message:String(ga4.reason)},
    search_console:searchConsole.status==='fulfilled'?searchConsole.value:{ok:false,error:searchConsole.reason instanceof Error?searchConsole.reason.message:String(searchConsole.reason)},
  }
}