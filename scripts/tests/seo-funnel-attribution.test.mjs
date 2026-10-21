import test from 'node:test'
import assert from 'node:assert/strict'
import {
  serviceSlugFromRef, serviceSlugFromInquiryPath,calendlyDiscoveryLink,bookingAttributionFromInvitee,
} from '../../lib/seo-booking-attribution.ts'
import { explicitLanguageForPath } from '../../lib/seo-service-locales.ts'

test('SSR language is determined by explicit route, not browser preference',()=>{
 assert.equal(explicitLanguageForPath('/services/consultoria-datos'),'es')
 assert.equal(explicitLanguageForPath('/services/consultoria-dades'),'ca')
 assert.equal(explicitLanguageForPath('/services/data-science-consulting'),'en')
 assert.equal(explicitLanguageForPath('/knowledge/a-public-article/ca'),'ca')
 assert.equal(explicitLanguageForPath('/knowledge/a-public-article/es'),'es')
 assert.equal(explicitLanguageForPath('/partner-analitico'),'es')
 assert.equal(explicitLanguageForPath('/contact'),null)
 assert.equal(explicitLanguageForPath('/services'),null)
})
test('only whitelisted service refs survive inquiry attribution',()=>{
 assert.equal(serviceSlugFromRef('service:prediccion-demanda'),'prediccion-demanda')
 assert.equal(serviceSlugFromRef('service:../admin'),null)
 assert.equal(serviceSlugFromRef('service:abc?utm_source=spam'),null)
 assert.equal(serviceSlugFromInquiryPath('/contact?intent=problem&ref=service%3Aconsultoria-datos'),'consultoria-datos')
 assert.equal(serviceSlugFromInquiryPath('https://attack.example/contact?ref=service:consultoria-datos'),null)
})
test('Calendly link only exposes anonymous, whitelisted source',()=>{
 const url=new URL(calendlyDiscoveryLink('service:consultoria-datos'))
 assert.equal(url.origin,'https://calendly.com')
 assert.equal(url.searchParams.get('utm_source'),'sc_analytics_website')
 assert.equal(url.searchParams.get('utm_content'),'service:consultoria-datos')
 assert.ok(!url.searchParams.has('email'))
 assert.equal(new URL(calendlyDiscoveryLink('service:bad/name')).searchParams.has('utm_content'),false)
})
test('a real booking requires Calendly source tags to count as website-attributed',()=>{
 const valid={utm_source:'sc_analytics_website',utm_medium:'website',utm_campaign:'discovery',utm_content:'service:consultoria-dades'}
 assert.deepEqual(bookingAttributionFromInvitee(valid),{
  source:'sc_analytics_website',medium:'website',campaign:'discovery',service_slug:'consultoria-dades'
 })
 assert.equal(bookingAttributionFromInvitee({utm_source:'facebook'}),null)
 assert.equal(bookingAttributionFromInvitee(null),null)
})
