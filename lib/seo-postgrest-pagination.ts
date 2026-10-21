/**
 * Small bounded PostgREST paginator for long-lived SEO measurements.
 * A single "limit:5000" query can silently be reduced by database REST
 * max-rows settings and undercount the organic trend.
 */
export async function readSeoPages<T>(
  fetchPage:(offset:number,limit:number)=>Promise<T[]>,
  pageSize=500,
  maxPages=12,
):Promise<{rows:T[];truncated:boolean}>{
  if(!Number.isInteger(pageSize)||pageSize<1||pageSize>1000)
    throw new Error('Invalid PostgREST page size')
  if(!Number.isInteger(maxPages)||maxPages<1||maxPages>24)
    throw new Error('Invalid maximum page count')
  const rows:T[]=[]
  for(let i=0;i<maxPages;i++){
    const page=await fetchPage(i*pageSize,pageSize)
    if(!Array.isArray(page))throw new Error('Invalid SEO search page response')
    rows.push(...page)
    if(page.length<pageSize)return {rows,truncated:false}
    if(page.length>pageSize)throw new Error('SEO search API returned an oversized page')
  }
  return {rows,truncated:true}
}
