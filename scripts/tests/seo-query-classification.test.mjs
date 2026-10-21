import test from 'node:test'
import assert from 'node:assert/strict'
import {classifyOrganicSearchQuery} from '../../lib/seo-search-query-classification.ts'
import {compareNonBrandWindows} from '../../lib/seo-organic-trends.ts'

test('classifies actual SC brand variants and founder as branded',()=>{
 for(const q of ['sc analytics','SC-Analytics','scanalytics','sc analytix','arnau sastre']){
  assert.equal(classifyOrganicSearchQuery(q),'branded',q)
 }
})
test('holds short SC-like queries aside as ambiguous rather than counting as independent demand',()=>{
 for(const q of ['sc data','erp sc','sc analysis','sc insights','scdata ai','ai sc','scca data analysis','scio analytics']){
  assert.equal(classifyOrganicSearchQuery(q),'ambiguous',q)
 }
})
test('preserves truly independent terms and does not invent a business lead',()=>{
 for(const q of ['operations control layer','predicción de demanda','analytical consultancy']){
  assert.equal(classifyOrganicSearchQuery(q),'nonbrand')
 }
 assert.equal(classifyOrganicSearchQuery(null),'unavailable')
})
test('nonbrand trend excludes branded, founder, and ambiguous observations',()=>{
 const result=compareNonBrandWindows([
  {metric_date:'2026-10-18',query:'sc analytics',impressions:120,clicks:4},
  {metric_date:'2026-10-18',query:'sc data',impressions:5,clicks:0},
  {metric_date:'2026-10-18',query:'arnau sastre',impressions:4,clicks:0},
  {metric_date:'2026-10-18',query:'operations control layer',impressions:4,clicks:0},
 ])
 assert.equal(result.current.impressions,4)
 assert.equal(result.current.clicks,0)
})
