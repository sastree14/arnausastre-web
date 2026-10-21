import { classifyOrganicSearchQuery } from './seo-search-query-classification.ts'

export type SearchObservation={
  metric_date:string
  query?:string|null
  clicks?:number|string|null
  impressions?:number|string|null
}
type Period={from:string;to:string;clicks:number;impressions:number;reportedDays:number}
export type NonBrandTrend={
  latestDate:string
  current:Period
  previous:Period
  impressionsChangePct:number|null
  clicksChangePct:number|null
}
const DAY_MS=24*60*60*1000
const dateOnly=(timestamp:number)=>new Date(timestamp).toISOString().slice(0,10)
const isISODate=(date:string)=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&
  !Number.isNaN(Date.parse(date+'T00:00:00Z'))
const number=(v:number|string|null|undefined)=>{
  const n=Number(v||0);return Number.isFinite(n)&&n>=0?n:0
}

/**
 * Compare exactly two adjacent 28-day (or custom) periods ending on the
 * latest IMPORTED Search Console date, not today. This avoids counting
 * Search Console's usual reporting delay as lost organic visibility.
 *
 * Query-level results are not total organic traffic: GSC can anonymize queries.
 * Multiple query/page/device/country rows are treated as distinct observations.
 */
export function compareNonBrandWindows(rows:SearchObservation[],days=28):NonBrandTrend|null{
  if(!Number.isInteger(days)||days<1||days>90)throw new Error('Invalid trend window')
  const dates=rows.map(row=>String(row.metric_date||'').slice(0,10)).filter(isISODate)
  if(!dates.length)return null
  const latestDate=dates.sort().at(-1)!
  const last=Date.parse(latestDate+'T00:00:00Z')
  const currentFrom=dateOnly(last-(days-1)*DAY_MS)
  const previousTo=dateOnly(last-days*DAY_MS)
  const previousFrom=dateOnly(last-(2*days-1)*DAY_MS)
  const current:Period={from:currentFrom,to:latestDate,clicks:0,impressions:0,reportedDays:0}
  const previous:Period={from:previousFrom,to:previousTo,clicks:0,impressions:0,reportedDays:0}
  const daySets=[new Set<string>(),new Set<string>()]
  for(const row of rows){
    const day=String(row.metric_date||'').slice(0,10)
    if(!isISODate(day))continue
    const i=day>=currentFrom&&day<=latestDate?0:day>=previousFrom&&day<=previousTo?1:-1
    if(i<0)continue
    daySets[i].add(day)
    const query=String(row.query||'').trim()
    if(classifyOrganicSearchQuery(query)!=='nonbrand')continue
    const period=i===0?current:previous
    period.clicks+=number(row.clicks)
    period.impressions+=number(row.impressions)
  }
  current.reportedDays=daySets[0].size
  previous.reportedDays=daySets[1].size
  const change=(now:number,then:number)=>then>0
    ?Math.round(((now-then)/then)*1000)/10:null
  return {
    latestDate,current,previous,
    impressionsChangePct:change(current.impressions,previous.impressions),
    clicksChangePct:change(current.clicks,previous.clicks),
  }
}
