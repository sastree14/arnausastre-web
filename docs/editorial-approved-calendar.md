# Approved Figma editorial calendar

Source: Figma `6XovZhIgrio70mXlqX3LjZ`, pages 10–15, P001–P150. Arnau approved the final visual designs and copy in chat on 10 October 2026. The approved copy is imported directly from each `COPY · P00X` text node. Paragraphs, bullets and hashtags remain unchanged; hashtags are not appended a second time.

There are 150 publications and 325 original 1080 × 1350 PNG files. Their byte sizes were checked against every object in private Supabase Storage. Each six-image collection retains slide order 1–6 and uses LinkedIn's `content.multiImage.images` API, not a PDF/document upload. CMI preview supports navigation through every image.

## Calendar

- First publication: Wednesday 14 October 2026 at 16:00 Europe/Madrid.
- Cadence: Monday 16:00, Wednesday 16:00, Friday 15:00. December 25 and January 1 are skipped.
- The timezone is calculated for every date, including both daylight-saving changes.
- 149 publications have distinct dates, ending 29 September 2027.
- P148 is reserved without an automatic date; its six images exercise the complete collection.
- The opening sequence establishes the decision-first approach, introduces practical examples and technical options, and then introduces collaboration. Later publications rotate editorial pillars. Regulatory topics are placed early. Original P00X identifiers remain unchanged.
- The manually scheduled portfolio introduction (13 October, 11:00 Madrid) is stored as an external event in `growth_workspace_settings`. The web introduction is also excluded from this queue. Neither is recreated as an automatic post.

Timing is an initial hypothesis for this audience, not a promised reach result. Research: Buffer's September 2026 analysis of 4.8 million posts favors weekday afternoons, including Wednesday 16:00 and Friday 15:00. LinkedIn recommends testing against the actual audience. Adjust future dates from CMI after collecting performance data.

## Execution and safety

Supabase Cron invokes the deployed `editorial-publisher` Edge Function every five minutes. It is independent of the preview branch and default-branch GitHub schedules. A separate scoped capability stored in Vault authenticates the request. Publishing credentials stay server-side. The authenticated CMI server and the CI configuration job can initialize the encryption key from their existing secret configuration; the assistant never retrieves that key.

The worker claims due publications atomically with `FOR UPDATE SKIP LOCKED`. It checks approval, schedule, destination, image completeness and connection permissions before creating a post. Content cannot be edited while it is being sent. Up to three retries are available for known pre-publication failures; a request whose result is uncertain is held for manual reconciliation rather than resent. A successful response and its external post ID are saved with the publication. The reserved test is excluded from automatic claims.

The CMI displays scheduled dates, timezone, complete image collections, reserved test, execution status and failure details. Editing through the MCP resets review and pauses the queue; approving and rescheduling synchronize through database triggers. These publications use the `publish_editorial` approval action, separating them from the older single-image publisher.

## LinkedIn connection prerequisite

The current saved connection is Arnau's member account, with `w_member_social` only and expiry 12 November 2026. It does not authorize the SC-Analytics company page. Automatic company publishing remains visibly blocked until the numeric organization ID and `w_organization_social` permission are configured, with an authorized role on the company page. LinkedIn application approval and a matching registered OAuth callback may be necessary. Tokens must be renewed when they expire. This task does not claim that company-page publication has been tested live.

## Validation

- 150 publications, 325 matching storage objects and exact exported byte sizes.
- 149 unique future slots, correct Madrid weekday/time and DST offsets, one reserved six-image test.
- Approved copy preserved without added hashtags or truncation.
- Live database test, rolled back: no duplicate claims, distinct claims for two jobs, reserved test excluded, in-flight edits blocked, uncertain response excluded from retry.
- Anonymous/browser roles cannot access worker credentials or configuration; only the service role executes the worker RPCs.
- Next.js production build and relevant publishing/calendar tests pass.

The full editorial source and deterministic calendar live in `growth/data/editorial-approved-manifest.json` and `growth/data/editorial-calendar.json`; regenerate dates using `scripts/editorial/build_calendar.py`. Storage paths are recorded per slide in `content_items.visual_strategy.slides`.
