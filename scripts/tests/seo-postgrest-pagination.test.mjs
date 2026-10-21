import test from 'node:test'
import assert from 'node:assert/strict'
import {readSeoPages} from '../../lib/seo-postgrest-pagination.ts'

test('collects all 1,250 GSC rows even when REST per-request cap is 500',async()=>{
 const data=Array.from({length:1250},(_,i)=>({n:i}))
 const calls=[]
 const result=await readSeoPages((offset,limit)=>{
  calls.push([offset,limit])
  return Promise.resolve(data.slice(offset,offset+limit))
 },500,10)
 assert.deepEqual(calls,[[0,500],[500,500],[1000,500]])
 assert.equal(result.rows.length,1250)
 assert.equal(result.truncated,false)
 assert.equal(result.rows.at(-1).n,1249)
})
test('marks data truncated rather than silently presenting partial numbers',async()=>{
 const r=await readSeoPages((offset,limit)=>Promise.resolve(
   Array.from({length:limit},(_,i)=>({n:offset+i}))
 ),500,2)
 assert.equal(r.rows.length,1000)
 assert.equal(r.truncated,true)
})
test('rejects invalid page settings and corrupted responses',async()=>{
 await assert.rejects(readSeoPages(()=>Promise.resolve([]),1500,2))
 await assert.rejects(readSeoPages(()=>Promise.resolve([]),500,25))
 await assert.rejects(readSeoPages(()=>Promise.resolve(null),500,2))
})
