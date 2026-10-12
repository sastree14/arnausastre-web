# Commercial memory contract

All payloads use `commercial_memory_mutate(p_payload jsonb)` for trusted server/service role and `mcp_commercial_memory_mutate(p_payload jsonb)` for OAuth users in the enabled `mcp_authorized_users` allowlist. Snapshot uses corresponding `commercial_memory_snapshot` / `mcp_commercial_memory_snapshot`, parameters `p_company_id` nullable and `p_limit` bounded 1–1000.

- Company: `{action:"company",company:{company_id?,name?,website?,canonical_domain?,relationship_type?,brief?,proposed_value?,next_step?,next_step_at?,country?,industry?,employee_range?,source_url?}}`. Name required only for new rows; existing stage/contact state never reset by research updates.
- Person: `{action:"person",person:{person_id?,company_id?,name?,role?,linkedin_url?,email?,contact_reason?,linkedin_status?,linkedin_status_source?,linkedin_status_at?}}`. `linkedin_url` must be a verified direct `/in/` URL. `user_report` or `verified_api` is required for invitation_sent/connected/declined. Research cannot reset actual relationship status.
- Event: `{action:"event",event:{idempotency_key,company_id?,person_id?,channel,direction,event_type,summary?,source?,occurred_at?,external_message_id?,external_thread_id?,evidence?,commercial_status?}}`. Use durable message ID keys such as `gmail:account:message`, never a random key on retries. Exact duplicate returns original event; key reused with different content rejects atomically.
- Company stage/manual patch: `{action:"patch",patch:{company_id,relationship_type?,commercial_status?,contact_status?,email_status?,brief?,proposed_value?,next_step?,next_step_at?,exclude_from_discovery?}}`.
- Policy: `{action:"preferences",preferences:{...}}` merges root keys into `growth_workspace_settings/commercial_policy`. Nested maps must be supplied whole to preserve sibling values.

Relationship values: unknown/direct_client/referral_partner/technical_partner/delivery_partner/hiring_alternative.
LinkedIn values: unknown/not_sent/invitation_sent/connected/declined.
Stages: discovered/researched/qualified/contacted/awaiting_reply/replied/conversation/meeting_pending/meeting_scheduled/meeting_booked/proposal/won/lost/not_now/excluded.
Contact: uncontacted/not_contacted/contacted/replied/do_not_contact.
Email: unknown/pending_reply/waiting_reply/auto_reply/no_reply_needed/bounced.
`exclude_from_discovery` is a boolean; defaults true for newly discovered companies, keeping them out of subsequent discovery batches. Set false explicitly only when the user asks to rediscover or reopen that company.
Manual patch writes an auditable company_updated interaction and marks stage edits as user_report. Manual email edits advance email_status_at; next_step_at accepts ISO timestamps or null to clear. Relationship, email and contact statuses are validated against the values above.
Event source: user_report/gmail/research/system/verified_api.
Channels: email/linkedin/upwork/form/phone/chat/other. Direction inbound/outbound/internal.

Email `email_sent` becomes waiting_reply, human_reply becomes pending_reply, bounce becomes bounced. Automatic acknowledgements/OOO never become commercial interest and preserve existing pending_reply/waiting_reply. Inference cannot override manual commercial stage; event time guards prevent older correspondence from regressing current state. Unknown company/person IDs, domain/profile collisions and person/company mismatches reject the whole RPC.

Snapshot objects keep all database fields with aliases `id` company_id/person_id/interaction_id, `domain` canonical_domain, `event_type` kind, `summary` content, and `evidence_url` evidence.url. Totals allow callers to identify truncation; default 250, max 1000. Existing IDs remain intact. Discovery exclusions are global durable company flags, independent of workspace reset filters.

Snapshot also returns `limit`, per-entity `has_more`, `totals`, and Gmail sync settings (`sync_runs`). Discovery uses the complete company exclusion set rather than a truncated snapshot list. No autonomous sending follows from a read or state update.
