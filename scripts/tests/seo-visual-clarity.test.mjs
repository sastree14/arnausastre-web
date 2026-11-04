import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const load = path => readFileSync(new URL('../../'+path,import.meta.url),'utf8')

test('clean headings and relevant copy in ES/CA/EN',()=>{
  const hub=load('components/ServiceHubPage.tsx')
  assert.doesNotMatch(hub,/border-y border-slate-300 py-5 text-center/)
  assert.doesNotMatch(hub,/mt-10 border-t border-slate-300 pt-7/)
  assert.doesNotMatch(hub,/without duplicate translated versions/)
  assert.doesNotMatch(hub,/sin enlaces repetidos a sus traducciones/)
  assert.doesNotMatch(hub,/sense enllaços repetits a les traduccions/)
  assert.match(hub,/font-semibold leading-\[1\.16\]/)
})
test('no duplicate arrow on clickable specialist category tiles',()=>{
  const hub=load('components/ServiceHubPage.tsx')
  const begin=hub.indexOf('service-related-grid mt-8')
  const card=hub.slice(begin,hub.indexOf('</Link>',begin))
  assert.ok(begin>0)
  assert.match(card,/\{t\.openService\}/)
  assert.equal((card.match(/→/g)||[]).length,1)
})
test('primary Services and SEO next steps use one arrow per card',()=>{
  const services=load('app/services/page.tsx')
  let begin=services.indexOf('CAPABILITY_ORDER.map')
  assert.equal((services.slice(begin,services.indexOf('</Link>',begin)).match(/→/g)||[]).length,1)
  const seo=load('app/services/[slug]/page.tsx')
  begin=seo.indexOf('actionCards.map')
  assert.equal((seo.slice(begin,seo.indexOf('</Link>',begin)).match(/→/g)||[]).length,1)
})
