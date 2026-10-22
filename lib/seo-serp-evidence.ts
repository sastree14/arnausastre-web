/** Validate optional, manually submitted SERP research.
 * This is NOT an independent verification of ranking or keyword volume.
 * No requests to Google, competitor sites or paid APIs are made here.
 */
export type SerpSubmission={
  keyword:string
  country:string
  device:string
  observedAt:string
  sourceUrl:string
  competitorUrls:string
  notes:string
}
export type SeoSerpEvidence={
  evidence_type:'manual_serp_observation'
  status:'submitted_unverified'
  query:string
  country:string
  device:'desktop'|'mobile'
  observed_at:string
  recorded_at:string
  source_url:string
  competitor_urls:string[]
  notes:string
  verified_search_volume:null
  verified_serp_rank:null
  backlink_verified:false
  publication_authorized:false
}

function safeEvidenceUrl(raw:string):string|null{
  const trimmed=raw.trim()
  if(!trimmed||trimmed.length>450)return null
  try{
    const url=new URL(trimmed)
    if(url.protocol!=='https:'||!url.hostname||url.username||url.password)return null
    if(url.hostname==='localhost'||url.hostname.endsWith('.localhost')||
      url.hostname==='127.0.0.1'||url.hostname==='::1'||url.hostname.endsWith('.local'))return null
    return url.toString()
  }catch{return null}
}
export function validateSerpSubmission(
  form:SerpSubmission,
  now:Date=new Date(),
):{ok:true;value:SeoSerpEvidence}|{ok:false;error:string}{
  if(!form.keyword.trim()||form.keyword.length>160)
    return {ok:false,error:'Keyword missing or too long'}
  const country=form.country.trim().toUpperCase()
  if(!/^[A-Z]{2}$/.test(country))return {ok:false,error:'Select an ISO country'}
  if(!['desktop','mobile'].includes(form.device))return {ok:false,error:'Invalid device'}
  if(!/^\d{4}-\d{2}-\d{2}$/.test(form.observedAt))
    return {ok:false,error:'Invalid observation date'}
  const day=new Date(form.observedAt+'T00:00:00Z')
  const age=(now.getTime()-day.getTime())/86400000
  if(!Number.isFinite(age)||day.toISOString().slice(0,10)!==form.observedAt||age < -1||age > 180)
    return {ok:false,error:'SERP evidence date must be recent and not in the future'}
  const source=safeEvidenceUrl(form.sourceUrl)
  if(!source)return {ok:false,error:'A valid HTTPS evidence source is required'}
  const parts=form.competitorUrls.split(/\r?\n|,/).map(v=>v.trim()).filter(Boolean)
  if(parts.length>5)return {ok:false,error:'At most five competitor URLs per observation'}
  const competitors:string[]=[]
  for(const part of parts){
    const url=safeEvidenceUrl(part)
    if(!url)return {ok:false,error:'Competitor URLs must be valid HTTPS links'}
    const host=new URL(url).hostname
    if(host==='sc-analytics.io'||host==='www.sc-analytics.io')
      return {ok:false,error:'Competitor URL cannot be SC-Analytics'}
    if(!competitors.includes(url))competitors.push(url)
  }
  if(form.notes.length>650)return {ok:false,error:'Notes too long'}
  return {ok:true,value:{
    evidence_type:'manual_serp_observation',
    status:'submitted_unverified',
    query:form.keyword.trim(),country,device:form.device as 'desktop'|'mobile',
    observed_at:form.observedAt,recorded_at:now.toISOString(),
    source_url:source,competitor_urls:competitors,
    notes:form.notes.trim(),verified_search_volume:null,verified_serp_rank:null,
    backlink_verified:false,publication_authorized:false,
  }}
}
