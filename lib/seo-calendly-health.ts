/**
 * Interpret whether booking figures from our CRM are up to date.
 * A read of an empty crm_meetings table is not evidence of zero bookings
 * if the underlying Calendly connector has not synchronized recently.
 */
export type CalendlySyncHealth={
  status:'fresh'|'stale'|'never'|'unavailable'
  lastSyncedAt:string|null
  ageHours:number|null
}
export function calendlySyncHealth(
  lastSyncedAt:unknown,
  now:Date,
  sourceAvailable=true,
):CalendlySyncHealth{
  if(!sourceAvailable)return {status:'unavailable',lastSyncedAt:null,ageHours:null}
  if(typeof lastSyncedAt!=='string'||!lastSyncedAt.trim())
    return {status:'never',lastSyncedAt:null,ageHours:null}
  const timestamp=Date.parse(lastSyncedAt)
  if(!Number.isFinite(timestamp)||timestamp>now.getTime()+5*60*1000)
    return {status:'never',lastSyncedAt:null,ageHours:null}
  const ageHours=Math.max(0,Math.round(((now.getTime()-timestamp)/3600000)*10)/10)
  return {status:ageHours<=48?'fresh':'stale',lastSyncedAt,ageHours}
}
