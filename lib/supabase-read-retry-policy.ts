/**
 * A narrow retry exception for transient PostgREST edge clock-skew responses.
 * All ordinary 401/403 authorization failures remain non-retryable.
 * No token or secret is inspected or logged.
 */
export function isTransientJwtClockSkew(status:number,body:string):boolean {
  if(status!==401)return false
  try{
    const error=JSON.parse(body) as {code?:unknown;message?:unknown}
    return error.code==='PGRST303' &&
      typeof error.message==='string' &&
      /JWT issued at future/i.test(error.message)
  }catch{
    return false
  }
}
