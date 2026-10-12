export type Json = Record<string, unknown>
export type MailMessage = {id:string;threadId:string;snippet?:string;internalDate?:string;labelIds?:string[];payload?:{headers?:{name:string;value:string}[];body?:{data?:string};mimeType?:string;parts?:MailMessage['payload'][]}}
export function mailHeader(message:MailMessage,name:string) {return message.payload?.headers?.find(h=>h.name.toLowerCase()===name.toLowerCase())?.value || ''}
export function mailAddresses(value:string) {return [...new Set((value.match(/[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)||[]).map(s=>s.toLowerCase()))]}
export function mailDomain(value:string) {try{return new URL(/^https?:\/\//i.test(value)?value:`https://${value}`).hostname.toLowerCase().replace(/^www\./,'')}catch{return ''}}
const publicEmailDomains=new Set(['gmail.com','googlemail.com','outlook.com','hotmail.com','live.com','yahoo.com','icloud.com','proton.me','protonmail.com'])
export function matchCommercialCompany(addresses:string[],companies:Json[],people:Json[]) {
 const exact=new Set(people.filter(p=>addresses.includes(String(p.email||'').toLowerCase())).map(p=>String(p.company_id||'')));exact.delete('')
 if(exact.size===1)return [...exact][0];if(exact.size>1)return null
 const domains=new Set(addresses.map(a=>a.split('@')[1]).filter(d=>d&&!publicEmailDomains.has(d)))
 const matches=companies.filter(c=>domains.has(String(c.canonical_domain||mailDomain(String(c.website||''))))).map(c=>String(c.company_id||c.id))
 return matches.length===1?matches[0]:null
}
export function commercialMailKind(message:MailMessage,account:string) {
 const subject=mailHeader(message,'Subject').toLowerCase(),text=(message.snippet||'').toLowerCase(),from=mailHeader(message,'From').toLowerCase()
 if(message.labelIds?.includes('SENT')||mailAddresses(from).includes(account.toLowerCase()))return 'email_sent'
 if(/mailer-daemon|postmaster/.test(from)||/delivery status notification|undeliverable|address not found|delivery failure|mail delivery failed/.test(subject))return 'bounce'
 if(/out of office|out-of-office|fuera de la oficina|vacaciones|absent|automatic reply|respuesta automática/.test(subject)&&/out of office|vacation|holiday|fuera|return|volver|regreso|absent/.test(subject+' '+text))return 'out_of_office'
 if(/unsubscribe|newsletter|weekly digest/.test(text)||/list/.test(mailHeader(message,'Precedence').toLowerCase())||mailHeader(message,'List-Unsubscribe'))return 'newsletter'
 if((mailHeader(message,'Auto-Submitted')&&mailHeader(message,'Auto-Submitted').toLowerCase()!=='no')||/auto|bulk/.test(mailHeader(message,'Precedence').toLowerCase())||/no-?reply|donotreply/.test(from)||/thanks for contacting|thank you for contacting|we have received|hemos recibido|gracias por contactar|acuse de recibo|automatic reply|respuesta automática/.test(subject+' '+text))return 'auto_ack'
 return 'human_reply'
}
