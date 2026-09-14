# SC-Analytics Operating System — UAT findings

This document is the working register from the September 2026 end-to-end UAT. It is intentionally product-oriented: each finding describes the user-visible problem, the desired behaviour and the implementation priority.

## Priority legend

- **P0** — blocks or can mis-execute publishing / external actions.
- **P1** — core workflow / CRM usability.
- **P2** — important product quality and analytics.
- **P3** — polish / future extension.

## Findings

1. **No clear “Create content” entry point** — P1. The Control Center must expose manual generation from: fresh research, URL, internal case and free idea. The user must be able to choose LinkedIn / article / auto.
2. **“Without visual” is semantically misleading** — P1. The counter currently includes items that are not truly ready for visual design. Count only actionable content and label the state precisely.
3. **No destination-faithful preview before approval** — P0. Approval must be preceded by an actual LinkedIn-style preview or the real website article renderer.
4. **Content can reach approval while the critic still requires a rewrite** — P0. `rewrite_required=true` must block approval.
5. **The Control Center is one very long page** — P1. Split the operating system into real routes/modules rather than anchor navigation.
6. **Research/briefs are read-only** — P1. A brief must be openable and actionable: generate, regenerate, force channel, reject/archive and inspect evidence.
7. **Visual Library is not usable as a review library** — P1. Add larger preview, metadata, attachment state, template/draft distinction and explicit actions.
8. **Visual Studio does not explain what part of the final publication it edits** — P1. Separate “visual editor” from “final publication preview”.
9. **Editorial calendar is a passive 14-day viewer** — P1. It needs month/quarter/6-month views, reschedule, unschedule, publish now and direct navigation.
10. **Approved/rejected items lose traceability in the UI** — P1. Add status/history views and clear post-decision destinations.
11. **Commercial actions are not operational from the UI** — P1. People/company cards need profile, message, connect/follow/invite, copy message, mark executed, follow-up and history actions.
12. **No manual editorial generation from the Control Center** — P1. Equivalent to finding 1 from an execution perspective; expose the existing editorial backend as an operator action.
13. **System & Integrations is informational rather than operational** — P2. Show connection health, last sync/run, next run, errors and useful actions.
14. **“Approve” has inconsistent semantics by channel** — P0. Approval must not implicitly mean “publish immediately” for articles while LinkedIn uses a separate publisher. Separate approve, schedule and publish.
15. **Quality gate is incomplete** — P0. Approval eligibility requires contract valid, score threshold and `rewrite_required=false` after the final critic pass.
16. **Visual requirement is not enforced** — P0. If a brief/content strategy requires a visual, the item cannot become publication-ready without the required asset.
17. **Visual strategy is too simplistic** — P1. A content item can require a visual pack: hero/cover, support/embedded visual and standalone/social visual; later carousel/document assets.
18. **No “rewrite in my voice” operator action** — P1. Add per-language rewrite action that uses the current draft + critic + brief + voice contract, then re-runs the critic.
19. **Publication mode has no clear visible effect** — P1. `text_only`, `text_with_visual`, `visual_first`, `image_only` must explain and preview the actual outgoing payload.
20. **Save draft / save template / attach are opaque** — P1. Make persistence destinations and state explicit.
21. **Visual Library thumbnails are too small and click-through jumps directly into the editor** — P2. Add preview modal/detail mode and distinguish review from editing.
22. **Visual Studio editing capabilities are limited** — P2. Improve boxes, arrows, text, typography, alignment and layer manipulation.
23. **No explicit “Publish now” operation** — P0/P1. Approved/scheduled content needs explicit publish-now, reschedule and unschedule actions.
24. **Generated Knowledge route fails in production because a static route becomes dynamic at runtime** — P0. Generated content routes must be intentionally dynamic and production-safe.
25. **Published content lacks clear public traceability** — P1. Every published item needs `View published`, public URL, published timestamp and history.
26. **Editorial selection has no diversity memory** — P1. Rank candidates with recent-history diversity across family, capability/topic, industry, business problem, format, language and channel.
27. **Generated Knowledge content and the public website do not share one content/rendering model** — P0/P1. Generated articles must render inside the current Knowledge design and automatically inherit future site-structure changes.
28. **Prospecting needs a complete operational queue** — P1. Person/company/fit/reason/link/message/status/history must be first-class CRM objects.
29. **Current information architecture will not scale to the future Operating System** — P1. The navigation must support Content, CRM, Analytics, Finance, Operations, Knowledge, Integrations and Agents as modules.
30. **Integrations must become operational data sources, not badges** — P1/P2. Calendly, LinkedIn, Apollo, GA4 and future accounting sources must create/update CRM objects and show sync health.
31. **A transversal CRM layer is missing** — P1. Link company → person → interaction → opportunity → meeting → project → invoice → payment/expense.
32. **`text_with_visual` can currently publish with no visual** — P0. Strict publication contracts must match the selected mode.
33. **LinkedIn analytics is not integrated** — P2. Because Community Management API access is unavailable, support official XLS/XLSX imports for personal Creator Analytics and company-page analytics, then normalize to Supabase.
34. **There is no Analytics module in the Operating System** — P1/P2. Create Analytics tabs for LinkedIn personal, LinkedIn company, Website/GA4 and later SEO/Search Console.
35. **Content does not explicitly model funnel/conversion intent** — P1. Add objective, funnel stage, CTA type/destination and discovery-call offer metadata.
36. **Content quality does not explicitly score hook/retention** — P1. Writer/critic should optimize for stopping power, retention and readability while preserving evidence and voice.
37. **Critic does not score commercial/editorial performance fit** — P1. Add hook strength, retention, CTA fit and conversion intent to critic output and rewrite instructions.
38. **No end-to-end attribution from content to revenue** — P1/P2. Connect LinkedIn/UTM → GA4 session → CTA → Calendly/contact → CRM lead/opportunity → revenue.
39. **GA4 base tracking exists but funnel events are not instrumented** — P1. Measurement ID `G-3E1DK7935G` is live; add explicit conversion events and CRM reporting ingestion.
40. **Discovery call offer must be a reusable conversion asset** — P1. Website and selected LinkedIn/content pieces should be able to offer a free discovery/opportunity-identification call covering bottlenecks, inefficiencies, scaling, risk and Data/AI/Automation opportunities without turning every post into a sales post.
41. **Future Finance/Accounting module must be part of the same information architecture** — P1 architecture / P3 implementation. Support invoices, expenses, payments, profitability and client/project linkage rather than bolting Finance onto Growth later.

## Target information architecture

- **Home** — attention queue, weekly objectives, alerts, recent business signals.
- **Content** — create, research, drafts, approvals, library, destination preview, Visual Studio.
- **Calendar** — month/quarter planning, drag/reschedule, publish-now, historical publications.
- **CRM** — companies, people, opportunities, interactions, follow-ups, meetings and prospecting/Apollo.
- **Analytics** — LinkedIn personal/company, website/GA4, SEO/Search Console, attribution and editorial intelligence.
- **Knowledge** — website articles and evidence/content library.
- **Finance** — invoices, expenses, payments, profitability and cash view.
- **Operations** — tasks, projects, delivery and future internal workflows.
- **Integrations** — LinkedIn, GA4, Search Console, Calendly, Apollo, Supabase and health/sync controls.
- **Agents** — automation runs, failures, prompts/brain versions and controlled operator triggers.

## Execution order

1. P0 publishing/state correctness and Knowledge production bug.
2. Quality/visual/publication gates and rewrite action.
3. Modular Control Center + previews + calendar actions.
4. Content creation/research operator actions and editorial diversity.
5. CRM/prospecting operating queue and Apollo contract.
6. Analytics schema/UI + GA4 events + LinkedIn import.
7. Discovery funnel/Calendly attribution.
8. Finance/Operations modules and broader Operating System expansion.
