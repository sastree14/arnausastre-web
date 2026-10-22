import test from 'node:test'
import assert from 'node:assert/strict'
import {sanitizeIndexInspection,inspectPathsForDay} from '../../lib/seo-index-inspection.ts'

test('parse only explicitly reported Google index version properties',()=>{
 const report=sanitizeIndexInspection({
  inspectionResult:{
   inspectionResultLink:'https://search.google.com/search-console/inspect?id=test',
   indexStatusResult:{
    verdict:'PASS', coverageState:'Indexed, submitted in sitemap',
    googleCanonical:'https://www.sc-analytics.io/services/consultoria-datos',
    userCanonical:'https://www.sc-analytics.io/services/consultoria-datos',
    lastCrawlTime:'2026-10-21T07:00:59Z',
    robotsTxtState:'ALLOWED',
   }
  }
 })
 assert.equal(report.verdict,'PASS')
 assert.equal(report.googleCanonical,'https://www.sc-analytics.io/services/consultoria-datos')
 assert.equal(report.lastCrawlTime,'2026-10-21T07:00:59Z')
})
test('missing response never becomes an invented indexed PASS',()=>{
 const unknown=sanitizeIndexInspection({})
 assert.equal(unknown.verdict,'UNKNOWN')
 assert.equal(unknown.coverageState,'unknown')
 assert.equal(unknown.googleCanonical,null)
})
test('daily bounded five-URL rota eventually covers every service without duplicates',()=>{
 const slugs=Array.from({length:23},(_,n)=>'/services/service-'+n)
 const covered=new Set()
 for(let day=0;day<7;day++){
  const batch=inspectPathsForDay(slugs,new Date(Date.UTC(2026,9,22+day)),5)
  assert.ok(batch.length<=5)
  for(const item of batch)covered.add(item)
 }
 assert.equal(covered.size,23)
})
test('rotating inspection does not permit arbitrary external URLs',()=>{
 const result=inspectPathsForDay(['/admin','https://foreign.example/a','/services/consultoria-datos'],new Date('2026-10-22'))
 assert.deepEqual(result,['/services/consultoria-datos'])
})
