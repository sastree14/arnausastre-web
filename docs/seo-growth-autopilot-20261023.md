# SC-Analytics: SEO Growth Engine — 23 October 2026

Implementation branch: feature/seo-growth-autopilot-20261023.

## Starting baseline (verified 23 Oct)

- 23 published service URLs, 30 active target keywords, 12 previously staged proposals (all publishable=false).
- 3 Google URL Inspection reports: 2 PASS and one NEUTRAL, not an indexation failure.
- Search Console query+URL rows as of 20 October show no recorded /services/ impressions since 21 September. GSC can omit filtered/rare queries; it does not prove zero total impressions.
- GA4 annual window recorded 52 Google organic sessions but does not establish non-branded leads or confirmed bookings.
- Semrush research could not run because this account lacks enough API units.

## Operating model

1. Keep the existing Search Console + GA4 daily sync and daily Vercel URL Inspection (07:25 UTC; up to 5 distinct services). Inspection never requests indexation.
2. Keep the Wednesday 06:45 UTC GitHub Action for weekly analysis and persistence of 12 review-only proposals.
3. Classify branded/ambiguous/non-branded, use actual page URL attributed by GSC, and compare recent 28 days to previous 28 days. Never credit homepage impressions to a service landing.
4. Prioritize with a transparent internal heuristic: commercial priority 35%, observed demand 25%, observed rank gap 20%, verified project proof 10%, focus fit 10%. Not Google ranking probability.
5. Monitor all published services for technical problems; concentrate new editorial keyword research on four commercial pillars: demand forecasting, logistics/inventory, mathematical optimization, data/AI.
6. Expand curated multilingual keyword research to non-focus services only after the verifiable growth gate below passes. This produces research proposals only; no active keyword or new page is created without human approval.
7. Store the growth stage, evidence date and score components in each diagnostic recommendation. Show the last persisted stage in the private SEO CMI.
8. Never automatically publish pages, change public metadata, buy backlinks, send outreach, force Google indexation or claim guaranteed ranks.

## Expansion gate (all conditions)

- GSC evidence is no older than seven days.
- At least 100 real non-branded impressions and 5 real clicks across focused service URLs in the last 28 days.
- At least 30 additional impressions over prior 28 days and 20% relative growth if previous baseline is nonzero.
- At least two distinct focus pillars each have 30 impressions, one click and positive growth.
- At least two distinct focus pillars have recent Google Inspection PASS on service URLs (report 45 days old or newer).

These thresholds are configurable policy choices, not third-party keyword-volume estimates. A spike in one pillar, stale observations or an ambiguous query cannot trigger expansion. Reevaluate weekly, reverting to focus mode when the evidence weakens.

## Weekly queue

- Critical site-wide sitemap, canonical and indexing issues always remain eligible, including inconclusive mature pages as reviews (NEUTRAL is not FAIL).
- A stale GSC import is one synchronization problem, not 23 separate copywriting jobs.
- Rotate diagnostic pages week by week; reserve at most four slots for truly observed queries and two for hypotheses.
- Stable recommendation IDs: do not reopen rejected or applied entries.
- Every proposed payload is review-only and publishable=false.

## QA and handoff

The pull-request SEO workflow runs Python 3.12 SEO tests and the existing Node SEO checks/build before any merge.
Python: python -m unittest discover -s growth/tests -p test_seo_*.py -q
Node: npm run seo:test && npm run build

The weekly real-data job requires existing protected secrets and must never dump credentials. Use its run summary and the private CMI to verify actual writes and the growth-phase snapshot.

Thirty-day review should report inspected/indexed URLs with true Google verdicts, coverage states and canonicals, GSC impressions/clicks/position per real URL, conversion reconciliation, and which hypotheses were validated. Never claim all pages indexed without reports, and never guarantee top positions.

Official Google guidance:
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect
- https://developers.google.com/search/docs/essentials/spam-policies
