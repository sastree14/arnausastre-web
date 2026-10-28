import test from 'node:test'
import assert from 'node:assert/strict'
import { knowledgeCanonicalPath, knowledgeCanonicalUrl } from '../../lib/knowledge-canonical.ts'

test('legacy unlocalized article references the English indexed representative',()=>{
  const slug='why-operational-supplier-risk-outstrips-financial-risk-and-what-it-costs'
  assert.equal(knowledgeCanonicalPath(slug),'/knowledge/'+slug+'/en')
  assert.equal(knowledgeCanonicalUrl(slug),'https://www.sc-analytics.io/knowledge/'+slug+'/en')
})

test('generated article points to actual preferred available locale',()=>{
  assert.equal(knowledgeCanonicalPath('test-article','es'),'/knowledge/test-article/es')
  assert.equal(knowledgeCanonicalPath('test-article','ca'),'/knowledge/test-article/ca')
  assert.equal(knowledgeCanonicalPath('test-article','en'),'/knowledge/test-article/en')
  assert.equal(knowledgeCanonicalPath('test-article','unknown'),'/knowledge/test-article/en')
})
