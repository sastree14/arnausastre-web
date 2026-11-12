import test from 'node:test'
import assert from 'node:assert/strict'
import { SERVICE_LANGUAGE_GROUPS,serviceLocaleForSlug,serviceGroupForSlug,languageAlternatesForPublishedSlugs,explicitLanguageForPath } from '../../lib/seo-service-locales.ts'

test('all commercial locale group slugs are unique and language assignment is stable',()=>{
 const slugs=new Set()
 for(const variants of Object.values(SERVICE_LANGUAGE_GROUPS)){
   for(const [lang,slug] of Object.entries(variants)){
     assert.ok(!slugs.has(slug),'Duplicate slug '+slug)
     slugs.add(slug)
     assert.equal(serviceLocaleForSlug(slug),lang)
     assert.deepEqual(serviceGroupForSlug(slug),variants)
   }
 }
 assert.equal(serviceLocaleForSlug('route-optimization'),'en')
})
test('unpublished translated pages do not appear in hreflang',()=>{
 const published=new Set(['data-science-consulting','consultoria-datos'])
 const variants=languageAlternatesForPublishedSlugs('data-science-consulting',published)
 assert.deepEqual(variants,{
   en:'https://www.sc-analytics.io/services/data-science-consulting',
   es:'https://www.sc-analytics.io/services/consultoria-datos'
 })
 assert.ok(!('ca' in variants))
})
test('published ES/CA/EN service pages have reciprocal hreflang maps',()=>{
 const published=new Set(['demand-forecasting','prediccion-demanda','previsio-demanda'])
 const expected=languageAlternatesForPublishedSlugs('demand-forecasting',published)
 for(const slug of published) assert.deepEqual(languageAlternatesForPublishedSlugs(slug,published),expected)
})

test('multilingual partner page keeps the visitor’s selected language',()=>{
 assert.equal(explicitLanguageForPath('/partner-analitico'),null)
 assert.equal(explicitLanguageForPath('/partner-analitico/'),null)
 assert.equal(explicitLanguageForPath('/services'),null)
 assert.equal(explicitLanguageForPath('/knowledge'),null)
})
test('explicitly localized SEO URLs continue to select their own language',()=>{
 assert.equal(explicitLanguageForPath('/knowledge/example/en'),'en')
 assert.equal(explicitLanguageForPath('/knowledge/example/es'),'es')
 assert.equal(explicitLanguageForPath('/knowledge/example/ca'),'ca')
 assert.equal(explicitLanguageForPath('/services/demand-forecasting'),'en')
 assert.equal(explicitLanguageForPath('/services/consultoria-datos'),'es')
 assert.equal(explicitLanguageForPath('/services/previsio-demanda'),'ca')
})
