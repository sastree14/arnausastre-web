import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const sql=readFileSync(new URL('../seo-service-proof-links-20261022.sql',import.meta.url),'utf8')
const registry=readFileSync(new URL('../../lib/portfolio-case-registry.ts',import.meta.url),'utf8')
const mapping=[...sql.matchAll(/^\s*\('([a-z0-9-]+)','([a-z0-9-]+)',/gm)]
const availableCases=new Set([...registry.matchAll(/\bslug:\s*'([a-z0-9-]+)'/g)].map(m=>m[1]))

test('each of the 23 live service slugs has precisely one proof link mapping',()=>{
 assert.equal(mapping.length,23)
 const slugs=mapping.map(m=>m[1])
 assert.equal(new Set(slugs).size,23)
})
test('each recommended case already exists in the established portfolio registry',()=>{
 for(const [,service,project] of mapping){
  assert.ok(availableCases.has(project),`${service} links to nonexistent case ${project}`)
 }
})
test('SQL is idempotent and does not change legal identity or project content',()=>{
 assert.match(sql,/NOT EXISTS\(/)
 assert.match(sql,/jsonb_array_elements/)
 assert.doesNotMatch(sql,/\b(INSERT\s+INTO\s+public\.projects|UPDATE\s+public\.projects|DROP\s+TABLE\s+public\.)/i)
})
