# Upwork in the CMI

The read-only dashboard is `/growth-admin/upwork`. It reads `crm_opportunities` with `source: upwork`, without copying proposals into a second application table. The chat remains the operating interface.

After a successful proposal submission, record the application as part of completing that action. Reuse the existing opportunity when `upwork_org_uid` and `upwork_proposal_id` match; do not ask Arnau to separately request a CMI update. The existing SC-Analytics create/update opportunity tools support the metadata below. Connector write success and the proposal receipt are required before marking an application as sent. Preparing a draft is not applying.

Canonical metadata: `upwork_proposal_id`, `upwork_job_id`, `job_url`, `upwork_org_uid`, `upwork_account` (arnau or agency), `upwork_status`, `upwork_status_label`, `applied_at`, `proposal_modified_at`, `proposal_amount`, `viewed_by_client`, `boosted`, `sync_source`, `synced_at`. Only save fields actually returned by Upwork. Preserve portfolio, cover letter and screening answers when they have been prepared or retrieved. Do not manufacture missing proposal text.

Upwork Accepted means Submitted, not hired. Hired alone justifies a hired state. A closed job does not establish that Arnau won it. Mail replies do not establish Upwork responses. A proposal amount is not the contract's revenue; opportunity value remains zero until a real project value is known.

The 2026-10-13 import verified all 63 proposals in the submitted status and imported 8 additional declined/closed records. Other historical statuses remain a partial import. Proposal identity is unique per tenant, account and proposal ID. Re-imports update provider metadata and preserve manually tracked commercial stages.

The UI refresh button reloads persisted data; it does not call Upwork or spend Connects. API reconciliation is performed from the chat with the authenticated Upwork connector. In this connector optional status/cursor parameters must be sent inside `params`; stop pagination if a cursor repeats.
