import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildHubServiceDirectory, selectHubServiceLinks } from '../../lib/service-hub-directory.ts'

const page = (slug,locale,extra={}) => ({
  slug,content_locale:locale,status:'published',primary_keyword:slug.replaceAll('-',' '),...extra
})
const target = (slug,service_area) => ({
  target_path:'/services/'+slug,service_area,status:'active',priority:8
})

test('one original topic link per selected language, never mixed language variants', () => {
  const pages=[
    page('ai-automation','en'),
    page('automatizacion-ia-empresas','es'),
    page('consultoria-intelligencia-artificial','ca')
  ]
  const links=buildHubServiceDirectory(pages,[])
  for(const [locale,expected] of [
    ['en','ai-automation'],['es','automatizacion-ia-empresas'],['ca','consultoria-intelligencia-artificial']
  ]) {
    const result=selectHubServiceLinks(links,'ai',locale)
    assert.deepEqual(result.map(x=>x.slug),[expected])
    assert.ok(result.every(x=>x.locale===locale))
  }
})

test('new published SEO pages appear without editing code if language and service area are classified',()=>{
  const pages=[
    page('demand-planning','en'),
    page('forecasting-for-hotels','es'),
    page('forecasting-catalonia','ca'),
    page('hidden-draft','en',{status:'draft'}),
    page('unreviewed-language',null),
    page('unknown-sector','en')
  ]
  const targets=[
    target('forecasting-for-hotels','Forecasting & Planning'),
    target('forecasting-catalonia','Forecasting & Planning'),
    target('hidden-draft','Forecasting & Planning'),
    target('unreviewed-language','Forecasting & Planning'),
    target('unknown-sector','Unknown Service Area')
  ]
  const links=buildHubServiceDirectory(pages,targets)
  assert.deepEqual(selectHubServiceLinks(links,'forecasting','en').map(x=>x.slug),['demand-planning'])
  assert.deepEqual(selectHubServiceLinks(links,'forecasting','es').map(x=>x.slug),['forecasting-for-hotels'])
  assert.deepEqual(selectHubServiceLinks(links,'forecasting','ca').map(x=>x.slug),['forecasting-catalonia'])
  assert.equal(links.some(x=>x.slug==='hidden-draft'),false)
  assert.equal(links.some(x=>x.slug==='unreviewed-language'),false)
  assert.equal(links.some(x=>x.slug==='unknown-sector'),false)
})

test('explicit CMI category assignment works for new service without keyword target',()=>{
  const links=buildHubServiceDirectory([
    page('simulation-monte-carlo','es',{hub_key:'simulation'})
  ],[])
  assert.deepEqual(selectHubServiceLinks(links,'simulation','es').map(x=>x.slug),['simulation-monte-carlo'])
  assert.equal(selectHubServiceLinks(links,'forecasting','es').length,0)
})

test('directory supports any future number of cards, and CSS centers incomplete rows',()=>{
  for(let count=1;count<=12;count++){
    const pages=Array.from({length:count},(_,i)=>page('modelling-service-'+(i+1),'en',{hub_key:'simulation'}))
    const links=selectHubServiceLinks(buildHubServiceDirectory(pages,[]),'simulation','en')
    assert.equal(links.length,count)
  }
  const css=readFileSync(new URL('../../app/public-polish.css',import.meta.url),'utf8')
  assert.match(css,/\.service-related-grid\s*\{[^}]*justify-content:\s*center/s)
  assert.match(css,/\.service-related-grid\[data-count="4"\]/)
  assert.match(css,/flex-wrap:\s*wrap/)
})

test('existing curated links are kept within their intended hub',()=>{
  const links=buildHubServiceDirectory([page('demand-planning','en')],[target('demand-planning','Forecasting & Planning')])
  assert.deepEqual(selectHubServiceLinks(links,'forecasting','en').map(x=>x.slug),['demand-planning'])
})
