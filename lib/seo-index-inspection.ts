/** Read Google Search Console URL Inspection reports without treating them
 * as a live indexing command. No inspection call requests indexing.
 */
export type SeoIndexStatus={
  verdict:string
  coverageState:string
  googleCanonical:string|null
  userCanonical:string|null
  lastCrawlTime:string|null
  robotsTxtState:string|null
  pageFetchState:string|null
  inspectionResultLink:string|null
}

export function sanitizeIndexInspection(response:unknown):SeoIndexStatus{
  const report=(response&&typeof response==='object'?response:{}) as Record<string,unknown>
  const obj=(report.inspectionResult&&typeof report.inspectionResult==='object'
    ?report.inspectionResult:{}) as Record<string,unknown>
  const status=(obj.indexStatusResult&&typeof obj.indexStatusResult==='object'
    ?obj.indexStatusResult:{}) as Record<string,unknown>
  const text=(value:unknown,max=300)=>typeof value==='string'?value.slice(0,max):null
  return {
    verdict:text(status.verdict)||'UNKNOWN',
    coverageState:text(status.coverageState)||'unknown',
    googleCanonical:text(status.googleCanonical,400),
    userCanonical:text(status.userCanonical,400),
    lastCrawlTime:text(status.lastCrawlTime,50),
    robotsTxtState:text(status.robotsTxtState),
    pageFetchState:text(status.pageFetchState),
    inspectionResultLink:text(obj.inspectionResultLink,650),
  }
}

export function inspectPathsForDay(paths:string[],dateUtc:Date,batchSize=5):string[]{
  if(!Number.isInteger(batchSize)||batchSize<1||batchSize>10)throw new Error('Invalid inspection batch size')
  const deduped=[...new Set(paths.filter(path=>/^\/services\/[a-z0-9-]+$/.test(path)))].sort()
  if(!deduped.length)return []
  const daysSinceEpoch=Math.floor(Date.UTC(dateUtc.getUTCFullYear(),dateUtc.getUTCMonth(),dateUtc.getUTCDate())/86400000)
  const groups=Math.ceil(deduped.length/batchSize)
  const group=((daysSinceEpoch%groups)+groups)%groups
  return deduped.slice(group*batchSize,(group+1)*batchSize)
}
