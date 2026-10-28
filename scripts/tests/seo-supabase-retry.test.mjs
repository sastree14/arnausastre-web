import test from 'node:test'
import assert from 'node:assert/strict'
import { isTransientJwtClockSkew } from '../../lib/supabase-read-retry-policy.ts'

test('retry is limited to the explicit transient Supabase JWT future-iat error', () => {
  const transient=JSON.stringify({code:'PGRST303',message:'JWT issued at future'})
  assert.equal(isTransientJwtClockSkew(401,transient),true)
  assert.equal(isTransientJwtClockSkew(403,transient),false)
  assert.equal(isTransientJwtClockSkew(500,transient),false)
  assert.equal(isTransientJwtClockSkew(401,JSON.stringify({code:'PGRST301',message:'JWT expired'})),false)
  assert.equal(isTransientJwtClockSkew(401,JSON.stringify({code:'PGRST303',message:'Wrong audience'})),false)
  assert.equal(isTransientJwtClockSkew(401,'not json'),false)
  assert.equal(isTransientJwtClockSkew(401,''),false)
})
