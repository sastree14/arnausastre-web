import test from 'node:test'
import assert from 'node:assert/strict'
import {validateSeoLanding} from '../../lib/seo-page-quality.ts'

function page(){
 return {
  slug:'demand-forecasting',
  title:'Demand Forecasting for Business Planning',
  meta_description:'Forecasting services to connect predictive models to inventory and capacity decisions with explicit assumptions and quantifiable results.',
  h1:'Demand forecasting for business planning',
  intro:'We evaluate demand forecasting approaches against operating constraints and quantify the implications for planning, stock, costs and implementation.',
  primary_keyword:'demand forecasting',
  sections:[
   {heading:'Assess the opportunity',body:'We assess data readiness, forecast horizons, decision timing and operating constraints before selecting any modelling method.'},
   {heading:'Evaluate decisions',body:'We compare prediction errors, inventory costs and operational choices to identify a useful and maintainable forecasting approach.'},
  ],
  internal_links:[{href:'/services/demand-planning',label:'Demand planning'},{href:'/contact',label:'Contact us'}],
 }
}
test('allows a substantive existing service landing',()=>{
 assert.deepEqual(validateSeoLanding(page()),[])
})
test('rejects unsafe link destinations and missing metadata',()=>{
 const p=page()
 p.meta_description='short'
 p.internal_links=[{href:'javascript:alert(1)',label:'Read more'}]
 assert.ok(validateSeoLanding(p).some(x=>x.includes('Meta description')))
 assert.ok(validateSeoLanding(p).some(x=>x.includes('Internal links')))
})
test('rejects trivial auto-generated content',()=>{
 const p=page()
 p.sections=[{heading:'Overview',body:'No detail'}]
 p.intro='Too short'
 assert.ok(validateSeoLanding(p).some(x=>x.includes('two substantive sections')))
 assert.ok(validateSeoLanding(p).some(x=>x.includes('Introduction')))
})
test('rejects slugs with path separators and control symbols',()=>{
 const p=page()
 p.slug='../preview'
 assert.ok(validateSeoLanding(p).some(x=>x.includes('Invalid URL slug')))
})
