import 'server-only'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

const PREFIX='sc-growth-login'
const MAX_AGE_MS=10*60*1000

function signingKey(){
  const key=(process.env.GROWTH_ADMIN_TOKEN||'').trim()
  if(!key)throw new Error('Admin state signing secret is not configured')
  return key
}
function signature(unsigned:string){
  return createHmac('sha256',signingKey()).update(unsigned).digest('base64url')
}
export function createIdentityOAuthState(){
  const nonce=randomBytes(24).toString('base64url')
  const unsigned=`${PREFIX}.${Date.now()}.${nonce}`
  return {nonce,state:`${unsigned}.${signature(unsigned)}`}
}
export function verifyIdentityOAuthState(value:string,cookieNonce:string):boolean {
  const parts=value.split('.')
  if(parts.length!==4||parts[0]!==PREFIX||
     !/^[0-9]{13}$/.test(parts[1]||'')||
     !/^[A-Za-z0-9_-]{32}$/.test(parts[2]||'')||
     !/^[A-Za-z0-9_-]{43}$/.test(parts[3]||''))return false
  const age=Date.now()-Number(parts[1])
  if(!cookieNonce||cookieNonce!==parts[2]||age<0||age>MAX_AGE_MS)return false
  const unsigned=parts.slice(0,3).join('.')
  const expected=Buffer.from(signature(unsigned))
  const received=Buffer.from(parts[3])
  return expected.length===received.length&&timingSafeEqual(expected,received)
}
