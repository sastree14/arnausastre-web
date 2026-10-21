import test from 'node:test'
import assert from 'node:assert/strict'
import { compareNonBrandWindows } from '../../lib/seo-organic-trends.ts'

test('uses last observed GSC date, not the current wall clock',()=>{
 const x=compareNonBrandWindows([
  {metric_date:'2026-10-18',query:'forecasting for pymes',clicks:1,impressions:5},
  {metric_date:'2026-10-18',query:'SC-Analytics',clicks:10,impressions:500},
  {metric_date:'2026-09-20',query:'demand forecasting',clicks:2,impressions:30},
  {metric_date:'2026-08-14',query:'obsolete',clicks:50,impressions:1000},
 ])
 assert.equal(x.latestDate,'2026-10-18')
 assert.deepEqual([x.current.from,x.current.to],['2026-09-21','2026-10-18'])
 assert.deepEqual([x.previous.from,x.previous.to],['2026-08-24','2026-09-20'])
 assert.equal(x.current.impressions,5)
 assert.equal(x.previous.impressions,30)
 assert.equal(x.current.clicks,1)
 assert.equal(x.previous.clicks,2)
 assert.equal(x.impressionsChangePct,-83.3)
})
test('does not confuse missing imported metrics or branded impressions with nonbrand demand',()=>{
 assert.equal(compareNonBrandWindows([]),null)
 const x=compareNonBrandWindows([
  {metric_date:'2026-10-18',query:'',impressions:50,clicks:4},
  {metric_date:'2026-10-18',query:'sc analytics',impressions:60,clicks:5},
  {metric_date:'2026-10-18',query:'operational optimization',impressions:2,clicks:0},
 ])
 assert.equal(x.current.impressions,2)
 assert.equal(x.current.reportedDays,1)
 assert.equal(x.previous.reportedDays,0)
 assert.equal(x.impressionsChangePct,null)
})
test('rejects impossible window lengths',()=>{
 assert.throws(()=>compareNonBrandWindows([],0))
 assert.throws(()=>compareNonBrandWindows([],1000))
})
