/**
 * Request guards shared by Next.js Proxy and route handlers.
 * The origin check is defence-in-depth, never a replacement for admin auth.
 */
export function isCrossOriginMutation(request: { url: string; headers: Headers }): boolean {
  const origin=request.headers.get('origin')
  const fetchSite=request.headers.get('sec-fetch-site')
  const expected=new URL(request.url).origin
  if(fetchSite==='cross-site')return true
  if(origin){
    try { return new URL(origin).origin!==expected } catch { return true }
  }
  const referer=request.headers.get('referer')
  if(referer){
    try { return new URL(referer).origin!==expected } catch { return true }
  }
  // Same-site subdomains are not necessarily the same origin.
  return fetchSite==='same-site'
}

export function safeAdminReturnPath(input: unknown, fallback='/growth-admin'): string {
  if(typeof input!=='string')return fallback
  const candidate=input.trim()
  if(!candidate.startsWith('/growth-admin')||candidate.startsWith('//')||
     candidate.includes('\\')||/[\u0000-\u001F\u007F]/.test(candidate))return fallback
  try {
    const resolved=new URL(candidate,'https://sc-analytics.invalid')
    if(resolved.origin!=='https://sc-analytics.invalid')return fallback
    if(resolved.pathname!=='/growth-admin'&&!resolved.pathname.startsWith('/growth-admin/'))return fallback
    return resolved.pathname+resolved.search+resolved.hash
  } catch { return fallback }
}

export function safeAdminRedirectUrl(input:unknown,requestUrl:string,fallback='/growth-admin'):URL {
  return new URL(safeAdminReturnPath(input,fallback),requestUrl)
}

export function hasExcessiveContentLength(request: {headers:Headers},maxBytes:number): boolean {
  const raw=request.headers.get('content-length')
  if(!raw)return false
  const value=Number(raw)
  return !Number.isSafeInteger(value)||value<0||value>maxBytes
}

export class RequestSizeError extends Error { constructor(){super('Request body too large')} }

/** Streaming parser caps memory consumption even if Content-Length is absent/spoofed. */
export async function readLimitedJson(request:Request,maxBytes:number):Promise<Record<string,unknown>> {
  if(hasExcessiveContentLength(request,maxBytes))throw new RequestSizeError()
  const stream=request.body
  if(!stream)throw new SyntaxError('Empty request')
  const reader=stream.getReader()
  let length=0
  const parts:Uint8Array[]=[]
  try {
    while(true){
      const {done,value}=await reader.read()
      if(done)break
      length+=value.byteLength
      if(length>maxBytes){
        await reader.cancel('body too large')
        throw new RequestSizeError()
      }
      parts.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const joined=new Uint8Array(length)
  let offset=0
  for(const part of parts){joined.set(part,offset);offset+=part.byteLength}
  const result=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(joined)) as unknown
  if(!result||Array.isArray(result)||typeof result!=='object')throw new SyntaxError('Expected JSON object')
  return result as Record<string,unknown>
}
