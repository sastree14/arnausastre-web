import test from 'node:test'
import assert from 'node:assert/strict'
import {bookingPersonStatus,findCalendlyEventOpportunity,shouldCreateOpportunityForBooking} from '../../lib/calendly-crm-safety.ts'

const uri='https://api.calendly.com/scheduled_events/cc3843df-2f0d-4816-9be5-27b9fc3d1406'
const unrelated='https://api.calendly.com/scheduled_events/7b4c0291-c67f-40c6-b53a-c9716ca3d2d8'
test('never reuse an unrelated closed deal simply because the email/person matches',()=>{
 const rows=[
  {opportunity_id:'closed',source:'outreach',stage:'closed',metadata:{calendly_event_uri:uri}},
  {opportunity_id:'unrelated',source:'calendly',stage:'discovery_booked',metadata:{calendly_event_uri:unrelated}},
  {opportunity_id:'another_client',source:'upwork',stage:'closed',metadata:{}},
 ]
 assert.equal(findCalendlyEventOpportunity(rows,uri),null)
})
test('only exact Calendly event-scoped opportunity can be reused',()=>{
 const match={opportunity_id:'exact',source:'calendly',stage:'closed',metadata:{calendly_event_uri:uri}}
 assert.equal(findCalendlyEventOpportunity([match],uri)?.opportunity_id,'exact')
 assert.equal(findCalendlyEventOpportunity([match],unrelated),null)
 assert.equal(findCalendlyEventOpportunity([match],'javascript:evil'),null)
})
test('archived people remain archived after a new booking sync',()=>{
 assert.equal(bookingPersonStatus('archived'),'archived')
 assert.equal(bookingPersonStatus('candidate'),'discovery_booked')
})
test('canceled invitees and canceled meetings never create sales opportunities',()=>{
 assert.equal(shouldCreateOpportunityForBooking('active','active'),true)
 assert.equal(shouldCreateOpportunityForBooking('active','canceled'),false)
 assert.equal(shouldCreateOpportunityForBooking('canceled','active'),false)
})
