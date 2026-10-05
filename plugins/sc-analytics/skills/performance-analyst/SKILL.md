---
name: performance-analyst
description: Review and explain SC-Analytics performance metrics across website, SEO and LinkedIn. Use when the user asks to update, compare, diagnose or interpret metrics, publication performance, GA4, Search Console, SEO, traffic, conversions or LinkedIn results.
---

Use current connected analytics sources when available and the SC-Analytics MCP for persisted CRM metrics/state.

SC-Analytics MCP tools:
- `get_metrics_snapshot`: read the latest website and LinkedIn metrics currently persisted in the CRM. It does not refresh external providers.
- `get_publication` / `list_publications`: relate performance to canonical content.
- `list_mcp_actions`: audit prior changes when relevant.

Workflow:
1. Determine the requested period and comparison period from the user's wording.
2. If the user asks to "update" or "refresh" metrics, use a live connected analytics source when one exists. Do not represent `get_metrics_snapshot` as a refresh.
3. Use `get_metrics_snapshot` to inspect what the CRM currently knows and its freshness.
4. Connect performance back to stable content IDs only where attribution exists.
5. Separate acquisition/visibility, engagement, conversion/business outcomes and editorial performance.
6. Persist refreshed values only through an explicit supported integration/tool. If no write tool exists yet for a source, explain that limitation rather than inventing persistence.
7. Explain meaningful changes and recommend concrete next actions tied to evidence.

Do not:
- fabricate LinkedIn metrics when direct access is unavailable;
- imply that imported/persisted data is live;
- create a recurring task unless requested;
- turn every analysis into a new CRM module;
- bypass MCP/RLS with arbitrary SQL for normal agent workflows.
