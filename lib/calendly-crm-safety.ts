/**
 * Guardrails for the recurring Calendly → CRM reconciler.
 * A scheduled meeting may only update an opportunity that was previously
 * created for EXACTLY that Calendly event; never overwrite an unrelated sale.
 */
export type ExistingOpportunity={
  opportunity_id:string
  source?:string|null
  stage?:string|null
  metadata?:Record<string,unknown>|null
}
export function findCalendlyEventOpportunity<T extends ExistingOpportunity>(
  rows:T[],eventUri:string,
):T|null {
  if(!/^https:\/\/api\.calendly\.com\/scheduled_events\/[a-z0-9-]+$/i.test(eventUri))return null
  return rows.find(row=>
    row.source==='calendly' &&
    row.metadata?.calendly_event_uri===eventUri
  )||null
}

/** Never reopen a prospect explicitly archived by the user. */
export function bookingPersonStatus(current:string|null|undefined):string{
  return current==='archived'?'archived':'discovery_booked'
}

/** A canceled event must not create a fresh sales opportunity. */
export function shouldCreateOpportunityForBooking(eventStatus:string|null|undefined,inviteeStatus:string|null|undefined):boolean{
  return String(eventStatus||'').toLowerCase()==='active' &&
    String(inviteeStatus||'').toLowerCase()!=='canceled'
}
