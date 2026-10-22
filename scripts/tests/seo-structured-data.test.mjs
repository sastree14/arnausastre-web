import test from 'node:test'
import assert from 'node:assert/strict'
import { commercialServiceStructuredData } from '../../lib/seo-service-structured-data.ts'

for(const [slug,locale] of [
 ['consultoria-datos','es'],
 ['consultoria-dades','ca'],
 ['data-science-consulting','en'],
]){
 test(`Schema.org language belongs on WebPage rather than Service: ${locale}`,()=>{
  const doc=commercialServiceStructuredData({
   slug,locale,headline:'Consultoría empresarial',
   description:'Aplicación de modelos cuantitativos a decisiones reales',
   primaryKeyword:'consultoría de datos',
  })
  const [service,page,breadcrumb]=doc['@graph']
  const url='https://www.sc-analytics.io/services/'+slug
  assert.equal(doc['@context'],'https://schema.org')
  assert.equal(service['@type'],'Service')
  assert.equal(service.url,url)
  assert.ok(!Object.hasOwn(service,'inLanguage'))
  assert.equal(page['@type'],'WebPage')
  assert.equal(page.url,url)
  assert.equal(page.inLanguage,locale)
  assert.equal(page.mainEntity['@id'],service['@id'])
  assert.equal(page.breadcrumb['@id'],breadcrumb['@id'])
  assert.equal(breadcrumb.itemListElement[1].item,url)
  assert.equal(breadcrumb.itemListElement[0].position,1)
  assert.equal(JSON.parse(JSON.stringify(doc))['@graph'].length,3)
 })
}
