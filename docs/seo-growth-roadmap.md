# SC-Analytics · Organic Growth implementation log

**Branch:** `feature/seo-growth-foundation-20261021`  
**Owner:** SC-Analytics  
**Updated:** 2026-10-21  
**Scope:** SEO growth **without rebuilding the existing website**.

## Non-negotiable guardrails

- No paid SEO products, trials or API subscriptions.
- Preserve existing frontend structure, design system, typography, CSS and layout. Small editorial links/copy may change within the same components; no visual redesign.
- Preserve contact conversion flows, cookie consent, newsletter, CMI and existing article publication schedule.
- Do not manufacture testimonials, results, authors or commercial claims.
- Do not create one near-identical landing page per keyword, and do not publish mass-generated content for search manipulation.
- Work on this branch and a review PR first. No automatic production merge.
- The user can request a next implementation slice in a future turn. Nothing runs in the background between turns.

## Grounded current position

- Search Console and GA4 are already integrated with the CMI.
- Supabase includes **29 active target keywords**, pointing to **13 published SEO service pages**; some targets point to URLs not yet published.
- Technical SEO fixes and publication reliability fixes were merged previously (PR #78 and #79).
- The website already has article cards linking to cases / knowledge / contact, and service landing pages already have related-service links.
- We should improve these existing flows rather than create a second content publishing system.

## Execution checklist

### 0. Establish durable QA and a stable branch

- [x] Create SEO-only working branch from current `main`.
- [x] Add `npm run seo:health` to check the production sitemap, HTTP status, canonicals, `hreflang`, JSON-LD, and duplicates using built-in Node APIs.
- [x] Verify health script against live production (read-only): 82 pages fetched; found 2 sitemap/hreflang errors and 3 warnings; corrections staged in this branch.
- [x] Validate Next.js production build in an isolated Vercel sandbox (passes).\n- [x] Verify all seven mapped service destinations return HTTP 200.\n- [ ] Validate a Vercel preview with production-like content and repeat consent/contact regressions before any merge.
- [ ] Keep first PR unmerged until the reviewed implementation is ready.

### 1. Commercial SEO and internal linking

- [x] Map seven existing editorial knowledge areas to verified, published service pages.
- [x] Reuse the existing three-card footer of articles to point the *second* card at a relevant service, rather than only returning to the article index. Keep all classes/CSS/layout untouched.
- [x] Group the 29 target expressions by language and buyer intent, without creating duplicates. See `docs/seo-keyword-intents-20261021.md`.\n- [ ] Confirm search demand and page-level performance before drafting new landings.
- [ ] Verify existing 13 service page metadata and map each to one genuinely relevant published article or public case; avoid invented examples.
- [ ] Add a small number of qualified editorial links **within existing link slots** rather than adding new page sections.
- [ ] Review essential conversion-related CTA wording with the user if commercial claims change.

### 2. Editorial publication quality

- [ ] Inspect the actual existing scheduling/approval flow before changing its rules.
- [ ] Define review gates: distinct purpose and audience, search intent, evidence, title/description, canonical URL, internal link destination, publication date and language variants.
- [ ] Prefer warnings and drafts over silently suppressing scheduled content.
- [ ] Avoid changing production article cadence without separate approval.

### 3. Measurement

- [ ] Define GA4 event names and distinguish meaningful contact intent, form submission, Calendly booking and CRM-qualified opportunity.
- [ ] Prevent duplicate event counting and respect consent handling (no analytics before opt-in).
- [ ] Reuse existing Search Console imports for brand vs non-brand visibility.
- [ ] Provide a simple weekly comparison view/report using existing CMI and Supabase data (no purchased tools).

### 4. Locale SEO

- [ ] Audit commercial page language/indexability.
- [ ] Scope a language-specific solution for the **few priority service pages**, preserving the existing visual design.
- [ ] Defer a wholesale migration of all URLs until scope/risk are reviewed.

### 5. Authority and original content

- [ ] Identify permitted/credible portfolio evidence and partnership content opportunities.
- [ ] Prepare qualified external citations and collaborators without buying or exchanging spam links.
- [ ] Optional: design the first ROI/calculator resource *only after* intent and development value are confirmed.

## Acceptance criteria

1. `npm run build` passes and no new TypeScript errors exist.
2. Existing article templates and service pages keep their layout and CSS unchanged.
3. Every introduced link resolves to a published, public HTTP 200 page, or is explicitly deferred.
4. The SEO health checker runs without accessing secret credentials or requiring a paid service.
5. No production changes unless reviewed, tested and the user requests merging.
6. Progress is marked in this file so subsequent chat turns can resume precisely.

**Next recommended slice:** verify live crawl and branch build, then inventory keyword intent and improve relevance of existing service-page links; no blanket page generation.
