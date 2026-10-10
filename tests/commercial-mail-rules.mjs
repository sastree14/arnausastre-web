import assert from 'node:assert/strict'
import { mailAddresses, mailDomain, matchCommercialCompany, commercialMailKind } from '../lib/commercial-mail-rules.ts'
assert.deepEqual(mailAddresses('Jessica <jessicab@kodah.ai>'), ['jessicab@kodah.ai'])
assert.equal(mailDomain('https://www.kodah.ai/partners'), 'kodah.ai')
assert.equal(matchCommercialCompany(['jessicab@kodah.ai'], [{id:'k',canonical_domain:'kodah.ai'}], []), 'k')
assert.equal(matchCommercialCompany(['x@gmail.com'], [{id:'k',canonical_domain:'gmail.com'}], []), null)
assert.equal(matchCommercialCompany(['x@same.io'], [{id:'a',canonical_domain:'same.io'}, {id:'b',canonical_domain:'same.io'}], []), null)
const message = (headers, snippet='') => ({id:'x',threadId:'t',payload:{headers},snippet})
assert.equal(commercialMailKind(message([{name:'Auto-Submitted',value:'auto-replied'}], 'Thank you for contacting us'), 'a@b.com'), 'auto_ack')
assert.equal(commercialMailKind(message([{name:'From',value:'mailer-daemon@example.com'}]), 'a@b.com'), 'bounce')
assert.equal(commercialMailKind(message([{name:'Subject',value:'Out of office'}], 'I return next week'), 'a@b.com'), 'out_of_office')
assert.equal(commercialMailKind(message([{name:'From',value:'Jessica <jessicab@kodah.ai>'}], 'Could you choose one of these meeting slots?'), 'a@b.com'), 'human_reply')
console.log('9 commercial mail evidence checks passed')
