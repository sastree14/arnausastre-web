import test from 'node:test'
import assert from 'node:assert/strict'
import nextConfig from '../../next.config.ts'

const legacyToCurrent=[
  ['/services/demand-forecasting-0','/services/demand-forecasting'],
  ['/services/route-optimization-1','/services/route-optimization'],
  ['/services/supply-chain-analytics-1','/services/supply-chain-analytics'],
  ['/services/inventory-optimization-0','/services/inventory-optimization'],
  ['/services/operations-research-1','/services/operations-research'],
]

test('all five Google Search Console legacy 404s have exact permanent redirects',async()=>{
  assert.equal(typeof nextConfig.redirects,'function')
  const redirects=await nextConfig.redirects()
  for(const [source,destination] of legacyToCurrent){
    const matches=redirects.filter(rule=>rule.source===source)
    assert.equal(matches.length,1,'Exactly one redirect required for '+source)
    assert.equal(matches[0].destination,destination)
    assert.equal(matches[0].permanent,true,'Expected 308 for '+source)
  }
})

test('legacy service redirects never target another legacy URL or the homepage',async()=>{
  const redirects=await nextConfig.redirects()
  const legacy=redirects.filter(rule=>legacyToCurrent.some(([source])=>source===rule.source))
  assert.equal(legacy.length,5)
  for(const rule of legacy){
    assert.match(rule.destination,/^\/services\/[a-z-]+$/)
    assert.ok(!/-[01]$/.test(rule.destination))
  }
})
