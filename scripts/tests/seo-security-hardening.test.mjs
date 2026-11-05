import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  isCrossOriginMutation,safeAdminReturnPath,
  hasExcessiveContentLength,readLimitedJson,RequestSizeError
} from '../../lib/security/request-guards.ts'

const load = path => readFileSync(new URL('../../'+path,import.meta.url),'utf8')
const req=(origin,headers={})=>({url:'https://www.sc-analytics.io/api/growth-admin/finance',headers:new Headers({origin,...headers})})

test('browser mutations are rejected across origins but same-origin CMI works',()=>{
  assert.equal(isCrossOriginMutation(req('https://www.sc-analytics.io')),false)
  assert.equal(isCrossOriginMutation(req('https://attacker.example')),true)
  assert.equal(isCrossOriginMutation(req('https://www.sc-analytics.io',{'sec-fetch-site':'cross-site'})),true)
  assert.equal(isCrossOriginMutation({url:'https://www.sc-analytics.io/api',headers:new Headers({'sec-fetch-site':'same-site'})}),true)
  assert.equal(isCrossOriginMutation({url:'https://www.sc-analytics.io/api',headers:new Headers({'referer':'https://attacker.example'})}),true)
  assert.equal(isCrossOriginMutation({url:'https://www.sc-analytics.io/api',headers:new Headers()}),false)
})

test('admin redirects never leave the control centre',()=>{
  for(const attack of ['https://evil.example','//evil.example','/\\\\evil.example','javascript:alert(1)','/services','/growth-admin.evil','/growth-admin/../../evil']){
    assert.equal(safeAdminReturnPath(attack,'/growth-admin/finance'),'/growth-admin/finance',attack)
  }
  assert.equal(safeAdminReturnPath('/growth-admin/finance?tab=expenses'),'/growth-admin/finance?tab=expenses')
  assert.equal(safeAdminReturnPath('/growth-admin'),'/growth-admin')
})

test('request size guard rejects over-limit and invalid headers',()=>{
  assert.equal(hasExcessiveContentLength({headers:new Headers({'content-length':'256'})},255),true)
  assert.equal(hasExcessiveContentLength({headers:new Headers({'content-length':'256'})},256),false)
  assert.equal(hasExcessiveContentLength({headers:new Headers({'content-length':'NaN'})},1024),true)
})

test('bounded JSON parser enforces actual streamed size',async()=>{
  const ok=await readLimitedJson(new Request('https://example.test',{method:'POST',body:JSON.stringify({a:1})}),64)
  assert.equal(ok.a,1)
  await assert.rejects(readLimitedJson(new Request('https://example.test',{method:'POST',body:JSON.stringify({message:'x'.repeat(200)})}),80),RequestSizeError)
  await assert.rejects(readLimitedJson(new Request('https://example.test',{method:'POST',body:'[]'}),32),SyntaxError)
})

test('code enforces admin rate limits and unique, shorter signed sessions',()=>{
  const login=load('app/api/growth-admin/login/route.ts')
  const session=load('lib/growth-admin.ts')
  assert.match(login,/MAX_FAILURES=6/)
  assert.match(login,/timingSafeEqual/)
  assert.match(login,/security_login_attempts/)
  assert.match(session,/__Host-sc_growth_admin/)
  assert.match(session,/60 \* 60 \* 12/)
  assert.match(session,/randomBytes\(24\)/)
})

test('public forms are bounded and all admin mutation paths pass through proxy origin check',()=>{
  const proxy=load('proxy.ts')
  assert.match(proxy,/isCrossOriginMutation\(request\)/)
  assert.match(proxy,/\/'\/api\/growth-admin\/:path\*\'/)
  for(const p of ['app/api/contact/route.ts','app/api/newsletter/subscribe/route.ts']){
    const c=load(p)
    assert.match(c,/readLimitedJson/)
    assert.match(c,/enforcePublicRateLimit/)
  }
})
