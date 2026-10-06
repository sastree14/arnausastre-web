---
name: performance-analyst
description: Review and explain SC-Analytics performance metrics across website, SEO and LinkedIn. Use when the user asks to update, compare, diagnose or interpret metrics, publication performance, GA4, Search Console, SEO, traffic, conversions or LinkedIn results.
---

Use current connected analytics sources when available and the SC-Analytics MCP for persisted CMI metrics/state.

Current SC-Analytics MCP tools:
- `get_metrics_snapshot`: read the latest website and LinkedIn metrics currently persisted in the CMI.
- `get_publication` / `list_publications`: relate performance to canonical content.
- `list_mcp_actions`: audit prior state changes when relevant.

CMI behavior:
- The CMI Metrics page has a deterministic `Actualizar Google` action that synchronizes GA4 and Search Console without an OpenAI API call.
- A persisted snapshot is not the same as a live refresh. Always distinguish the two.

Workflow:
1. Determine the requested period and comparison period from the user's wording.
2. If current data is already available, read the persisted metrics and analyze them.
3. Connect performance back to stable content IDs only where attribution exists.
4. Separate acquisition/visibility, engagement, conversion/business outcomes and editorial performance.
5. Explain meaningful changes and recommend concrete next actions tied to evidence.
6. Never represent missing LinkedIn analytics as zero.

Important current limitation:
- The plugin can read/analyze persisted Google metrics through the MCP, but direct `sync_google_metrics` execution from ChatGPT is not yet exposed as an MCP tool. Until that tool is added, the user can refresh Google from the CMI button and then ask the plugin to analyze the result.

Do not:
- fabricate LinkedIn metrics;
- imply stale/imported data is live;
- create recurring tasks unless the user asks;
- turn every analysis into a new CMI module;
- bypass MCP/RLS with arbitrary SQL for normal workflows.
