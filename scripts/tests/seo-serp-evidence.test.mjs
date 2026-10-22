import test from 'node:test'
import assert from 'node:assert/strict'
import {validateSerpSubmission} from '../../lib/seo-serp-evidence.ts'

const sample={
 keyword:'predicción de demanda',country:'ES',device:'desktop',
 observedAt:'2026-10-22',sourceUrl:'https://www.google.com/search?q=prediccion+demanda',
 competitorUrls:'https://example.com/forecasting\nhttps://example.org/planning',
 notes:'Sample submitted by a person, not independently verified',
}
const date=new Date('2026-10-22T11:00:00Z')

test('preserves geographic search context, marks data unverified and cannot publish',()=>{
 const result=validateSerpSubmission(sample,date)
 assert.equal(result.ok,true)
 if(!result.ok)return
 assert.equal(result.value.status,'submitted_unverified')
 assert.equal(result.value.country,'ES')
 assert.equal(result.value.competitor_urls.length,2)
 assert.equal(result.value.verified_serp_rank,null)
 assert.equal(result.value.verified_search_volume,null)
 assert.equal(result.value.publication_authorized,false)
 assert.equal(result.value.backlink_verified,false)
})
test('rejects future/fabricated dates and unsafe evidence URLs',()=>{
 for(const x of [
  {...sample,observedAt:'2026-11-25'},
  {...sample,observedAt:'2026-02-01'},
  {...sample,observedAt:'2026-02-30'},
  {...sample,sourceUrl:'http://example.com'},
  {...sample,sourceUrl:'https://localhost/secret'},
  {...sample,sourceUrl:'javascript:alert(1)'},
  {...sample,device:'tablet'},
 ])assert.equal(validateSerpSubmission(x,date).ok,false)
})
test('rejects self-referential backlinks or excessive competitor evidence',()=>{
 assert.equal(validateSerpSubmission({...sample,competitorUrls:'https://sc-analytics.io/'},date).ok,false)
 assert.equal(validateSerpSubmission({...sample,competitorUrls:Array(6).fill('https://example.org/').join('\n')},date).ok,false)
})
