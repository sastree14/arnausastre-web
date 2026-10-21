import test from 'node:test'
import assert from 'node:assert/strict'
import { auditEditorialRows } from '../seo-editorial-audit.mjs'

const make = (locale, extra={}) => ({
  content_id: 'demo_'+locale, brief_id: 'demand-forecasting-demo',
  language: locale, status:'scheduled', scheduled_at:'2026-10-25T08:00:00Z',
  title:'Example '+locale, body:'Evidence-backed editorial article '.repeat(50),
  critique:{article_meta:{
    seo_title:'Forecasting methods '+locale,
    seo_description:'Comparing alternatives in a business forecasting workflow with documented assumptions and trade-offs for decision makers.',
    primary_keyword:'demand forecasting', knowledge_area:'planning', search_intent:'informational',
    related_case:'/projects/ecommerce-demand-forecasting'
  }},
  ...extra,
})
test('valid multilingual scheduled group is accepted',()=>{
 const result=auditEditorialRows(['es','ca','en'].map(x=>make(x)))
 assert.equal(result.records,3)
 assert.equal(result.articles,1)
 assert.equal(result.errors.length,0)
 assert.equal(result.warnings.length,0)
})
test('missing schedule, short body and invalid slug are errors',()=>{
 const bad=make('es',{brief_id:'../unsafe',body:'tiny',scheduled_at:null})
 const result=auditEditorialRows([bad])
 assert.ok(result.byCode.INVALID_SLUG)
 assert.ok(result.byCode.BODY_TOO_SHORT)
 assert.ok(result.byCode.MISSING_SCHEDULE)
})
test('cross locale duplicated meta titles are only warnings',()=>{
 const a=make('es'), b=make('ca'), c=make('en')
 b.critique.article_meta.seo_title=a.critique.article_meta.seo_title
 const result=auditEditorialRows([a,b,c])
 assert.equal(result.errors.length,0)
 assert.equal(result.byCode.CROSS_LOCALE_DUPLICATE_META_TITLE,2)
})
test('reports suspicious external or javascript links',()=>{
 const a=make('es')
 a.critique.article_meta.related_case='javascript:alert(1)'
 assert.equal(auditEditorialRows([a]).byCode.RELATED_CASE_SUSPICIOUS_LINK,1)
})
test('published articles require published_at',()=>{
 const a=make('en',{status:'published',published_at:null})
 assert.equal(auditEditorialRows([a]).byCode.MISSING_PUBLICATION_TIME,1)
})
