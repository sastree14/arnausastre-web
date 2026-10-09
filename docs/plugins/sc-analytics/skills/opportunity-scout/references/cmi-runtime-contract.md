# CMI commercial memory runtime contract

Discover currently exposed tools and inspect their schemas before calling them. This bundle does not grant account scopes, install the database or expose newly developed tools in an already-open chat. Use the original SC-Analytics app connection; do not add another app ID or credentials to this ZIP.

## Read and reconcile
Use `get_commercial_memory({company_id?, limit?})` for the current company/person/event/preferences snapshot and deduplication/exclusion state. For an all-company scout, retrieve enough records to cover exclusions; never assume a truncated snapshot contains the complete history. Follow pagination or multiple documented reads when available. If the runtime cannot provide a complete exclusion set, report that limitation and check proposed identities individually before presenting them as new.
The implementation uses authenticated SQL RPC `mcp_commercial_memory_snapshot`. Prefer the exposed MCP tool to direct database access. Existing company/opportunity list/search/update tools remain valid for their supported fields.

## Scoped mutations
Use `update_commercial_memory({payload:{action, company?, person?, event?, patch?, preferences?}})` only with the fields accepted by its exposed schema. Supported action discriminators are `company`, `person`, `event`, `patch`, `preferences`. The implementation invokes authenticated SQL RPC `mcp_commercial_memory_mutate` with the existing CMI whitelist. Do not guess nested field names from this high-level description; inspect the runtime schema/API contract before mutation.
- company: match canonical domain/aliases before creation; retain existing ID and history.
- person: match canonical LinkedIn identity or verified email before creation; preserve any existing connection state when updating a candidate.
- event: require a stable `idempotency_key`, evidence `source` and `occurred_at`; use `external_message_id` and thread identifier for Gmail evidence when schema permits. Repeat the same key for retrying the same action.
- patch: change only evidenced fields on identified records, preserving history and unrelated metadata.
- preferences: persist explicit commercial preferences in the CMI rather than relying only on this bundle's defaults.
Read after a successful mutation to verify the intended state. A tool result is the authority on success, not a proposed action or chat acknowledgment. If the CMI write fails after an external connector send, retry the event write using the original connector ID; do not repeat the send.

## Sources and channels
Keep mail send/delivery/reply states separate from commercial stage and LinkedIn invitation/connection state. Manual LinkedIn state is user-reported; do not infer acceptance from an invitation or API publishing identity. Gmail review through ChatGPT's connected Gmail tools and the CMI's own OAuth integration are separate connections. Verify both independently; possession of one does not imply the other is connected.
The CMI Gmail reconciliation is read-only on Gmail; reviewed thread evidence can update CMI state, but the sync endpoint does not send email. Sending requires an actual available send connector and concrete user authorization. Automatic acknowledgments and newsletters do not become positive responses. A request for slots is not a confirmed meeting.
The review interface is `/growth-admin/commercial-memory` on the CMI deployment. This plugin update alone does not deploy that route or migrations. Report preview availability and installation/connection gaps truthfully.

## Nested fields and enum mapping
Confirm these against the final live schema; the v1.3 backend contract supports:

| Action | Nested object fields |
|---|---|
| company | `company_id` (or `id`), `name`, `website`, `canonical_domain`, `relationship_type`, `brief`, `proposed_value`, `next_step`, `next_step_at`, `country`, `industry`, `employee_range`, `source_url` |
| person | `person_id` (or `id`), `company_id`, `name`, `role`, `linkedin_url`, `canonical_linkedin_url`, `email`, `contact_reason`, `linkedin_status`, `linkedin_status_source`, `linkedin_status_at` |
| event | `company_id`, `person_id`, `channel`, `direction`, `event_type`, `summary`, `source`, `occurred_at`, `idempotency_key`, `evidence`, `external_message_id`, `external_thread_id`, optional `commercial_status` |
| patch | `company_id`, `commercial_status`, `contact_status`, `relationship_type`, `email_status`, `brief`, `proposed_value`, `next_step`, `next_step_at`, `exclude_from_discovery` |
| preferences | JSON object merged at root keys into the existing commercial policy; read first and supply entire nested maps to preserve sibling preferences. |

Map the capability-complementation route `capability_partner` to database `relationship_type: "technical_partner"`. Allowed relationship values: `unknown`, `direct_client`, `referral_partner`, `technical_partner`, `delivery_partner`, `hiring_alternative`.
Allowed person LinkedIn states: `unknown`, `not_sent`, `invitation_sent`, `connected`, `declined`. A newly identified candidate remains `unknown`; candidate presentation belongs in an attributed research event. An unclear user report or withdrawn invitation remains a descriptive event without asserting an unsupported state.
Allowed LinkedIn evidence sources for a relationship state are `user_report` or `verified_api`. An API source means an actual supported API verified that specific relationship, not that lookup returned the profile.
Allowed event sources: `user_report`, `gmail`, `research`, `system`, `verified_api`. Channels: `email`, `linkedin`, `upwork`, `form`, `phone`, `chat`, `other`. Directions: `inbound`, `outbound`, `internal`.
Commercial states: `discovered`, `researched`, `qualified`, `contacted`, `awaiting_reply`, `replied`, `conversation`, `meeting_pending`, `meeting_scheduled`, `meeting_booked`, `proposal`, `won`, `lost`, `not_now`, `excluded`. Use meeting scheduling/booked only with actual confirmed time evidence. Separate email status is reconciled from evidence, not edited through the commercial-stage field. When a justified manual correction is required, patch `email_status` using `unknown`, `pending_reply`, `waiting_reply`, `auto_reply`, `no_reply_needed`, or `bounced`. A patch also records a user_report history entry; verify state before retry to avoid redundant patch events.
Contact states: `uncontacted`, `not_contacted`, `contacted`, `replied`, `do_not_contact`. A surfaced company defaults to exclusion from discovery; do not reset this merely because it has not been contacted.

The person mutation deduplicates by canonical LinkedIn profile, then by case-insensitive verified email within the same company for email-only contacts, or exact normalized name within the same company when stronger identifiers are absent. Read and reuse the existing `person_id` when known, especially when enriching an existing email-only contact with a newly verified LinkedIn URL. Ambiguous domain/profile conflicts are explicit errors to resolve, never automatic destructive merges.
The snapshot returns `companies`, `people`, `events`, `totals`, `limit`, `preferences`. Compare collection counts with `totals`. Backend limit is bounded to 1000; if exclusions exceed available coverage, use verified individual lookup or obtain a supported comprehensive read before claiming a completely new batch.

## Idempotent event example
After Arnau unambiguously reports sending a LinkedIn invitation to the identified existing person, use an event like:

```json
{"payload":{"action":"event","event":{"company_id":"<actual ID>","person_id":"<actual ID>","channel":"linkedin","direction":"outbound","event_type":"linkedin_invitation_sent","summary":"Arnau reports sending the invitation","source":"user_report","occurred_at":"<actual event timestamp>","idempotency_key":"<stable key for this exact user-reported action>","evidence":{"reported_at":"<timestamp>","linkedin_url":"<verified direct profile URL>"}}}}
```

Use `linkedin_connected` only for reported/verified acceptance and `linkedin_declined` for an evidenced decline. Gmail reconciliation uses `email_sent`, `human_reply`, `auto_ack`, `out_of_office`, `bounce` as appropriate. Keep the exact event payload unchanged on retry: the database rejects reuse of an idempotency key with different contents. Connector IDs are stable identifiers; never invent them. Preserve a manual operation's key in a pending-sync record before retrying.
