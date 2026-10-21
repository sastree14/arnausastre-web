import test from 'node:test'
import assert from 'node:assert/strict'
import {calendlySyncHealth} from '../../lib/seo-calendly-health.ts'
const now=new Date('2026-10-22T00:00:00Z')
test('an integration synced inside the expected daily window is fresh',()=>{
 assert.equal(calendlySyncHealth('2026-10-21T09:00:00Z',now).status,'fresh')
})
test('weeks-old Calendly sync is stale and must not be reported as zero bookings',()=>{
 const health=calendlySyncHealth('2026-09-21T12:17:37.905Z',now)
 assert.equal(health.status,'stale')
 assert.ok(health.ageHours>48)
})
test('missing or malformed timestamps are not valid sync confirmations',()=>{
 assert.equal(calendlySyncHealth(null,now).status,'never')
 assert.equal(calendlySyncHealth('nonsense',now).status,'never')
 assert.equal(calendlySyncHealth('2026-10-23T00:00:00Z',now).status,'never')
 assert.equal(calendlySyncHealth('2026-10-21T09:00:00Z',now,false).status,'unavailable')
})
