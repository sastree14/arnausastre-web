import test from 'node:test'
import assert from 'node:assert/strict'
import { SERVICE_HUBS, SERVICE_HUB_ORDER, getServiceHubBySlug, isServiceHubSlug } from '../../lib/service-hubs.ts'
import { explicitLanguageForPath } from '../../lib/seo-service-locales.ts'

const expected = new Set([
  'ai-automation', 'analitica-datos-empresas', 'automatizacion-ia-empresas',
  'business-intelligence', 'consultoria-dades', 'consultoria-datos',
  'consultoria-intelligencia-artificial', 'data-engineering',
  'data-science-consulting', 'demand-forecasting', 'demand-planning',
  'inventory-optimization', 'logistics-optimization',
  'machine-learning-consulting', 'operations-research',
  'optimitzacio-empresarial', 'optimizacion-inventario',
  'optimizacion-operaciones', 'prediccion-demanda', 'previsio-demanda',
  'pricing-optimization', 'route-optimization', 'supply-chain-analytics'
])

test('six distinct navigation hubs are recognized without colliding with specialist URLs', () => {
  assert.equal(SERVICE_HUB_ORDER.length, 6)
  const slugs = SERVICE_HUB_ORDER.map(key => SERVICE_HUBS[key].slug)
  assert.equal(new Set(slugs).size, slugs.length)
  for (const slug of slugs) {
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    assert.equal(isServiceHubSlug(slug), true)
    assert.ok(getServiceHubBySlug(slug))
    assert.equal(expected.has(slug), false)
    assert.equal(explicitLanguageForPath('/services/' + slug), null)
  }
  assert.equal(isServiceHubSlug('demand-planning'), false)
  assert.equal(explicitLanguageForPath('/services/prediccion-demanda'), 'es')
})

test('all 23 published specialist landings have at least one hub link', () => {
  const linked = new Set()
  for (const key of SERVICE_HUB_ORDER) {
    const hub = SERVICE_HUBS[key]
    assert.ok(hub.related.length > 0)
    for (const [slug, label, locale] of hub.related) {
      assert.ok(expected.has(slug), 'Unknown specialist page: ' + slug)
      assert.ok(label)
      assert.ok(['en','es','ca'].includes(locale))
      linked.add(slug)
    }
  }
  assert.deepEqual([...linked].sort(), [...expected].sort())
})
