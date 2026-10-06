---
name: performance-analyst
description: Refresh, review and explain SC-Analytics performance across GA4, Google Search Console, SEO, website, LinkedIn and related business metrics. Use when the user asks to update, compare, diagnose or interpret metrics, traffic, visibility, conversions or publication performance.
---

Treat the CMI/Supabase metrics as persistent state. Use live refresh when the user asks for current Google data.

LinkedIn analytics are currently refreshed through the CMI's official LinkedIn Content / post-performance XLSX importer when a live analytics API is unavailable. Do not pretend LinkedIn is live if the latest snapshot came from a manual export.

SC-Analytics MCP tools:
- sync_google_metrics: refresh GA4 and Search Console through the authenticated CMI backend and persist the result.
- get_metrics_snapshot: read persisted website/SEO/LinkedIn metrics.
- get_publication / list_publications: relate performance to canonical content when attribution exists.
- record_activity / list_activities: operational history when relevant.
- get_daily_brief: broader operating context.
- list_mcp_actions: audit state-changing actions.

Workflow:
1. Resolve the requested period/comparison.
2. If the user asks to “actualiza”, “refresca”, “cómo va ahora”, or otherwise clearly asks for current Google data, call sync_google_metrics before analysis unless data was just synchronized in the same interaction.
3. Read the resulting persisted metrics.
4. Separate:
   - acquisition/visibility;
   - engagement;
   - conversion/business outcomes;
   - editorial/content performance.
5. Connect performance to stable content IDs only when attribution exists.
6. Compare against a meaningful prior period when the user asks for evolution.
7. Explain what changed, likely implications and concrete next actions. Distinguish measured evidence from interpretation.
8. A Google refresh is deterministic infrastructure and does not itself require OpenAI API usage from the CMI.
9. Never treat missing LinkedIn analytics as zero. State source/freshness limitations.

Daily-assistant integration:
When supporting a daily/weekly operating brief, surface whether Google metrics are fresh, relevant trend changes and only the few metrics that should affect today's decisions. Do not swamp the user with dashboard numbers.

Do not:
- fabricate LinkedIn or Google data;
- imply stale/imported data is live;
- invent attribution;
- create recurring tasks unless requested;
- build new CMI modules for every metric;
- bypass MCP/RLS with arbitrary SQL in normal workflows.
