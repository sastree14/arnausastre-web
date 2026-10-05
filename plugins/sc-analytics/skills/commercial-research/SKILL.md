---
name: commercial-research
description: Research markets, competitors, companies, partners, courses or other external opportunities for SC-Analytics. Use when the user asks to find, compare, shortlist or investigate external entities, or to refresh competitive or commercial intelligence.
---

Research is conversational by default. Persist only results with future operational value.

SC-Analytics MCP tools:
- `search_companies`: check whether a company already exists in the CRM.
- `update_company`: update selected fields of an existing CRM company.
- `list_opportunities`: inspect current commercial opportunities.
- `update_opportunity`: update selected fields of an existing opportunity.
- `list_mcp_actions`: inspect recent business-state changes.

Workflow:
1. Identify the decision the research should support.
2. Use current public information and check existing CRM state when duplication matters.
3. Rank/shortlist using criteria relevant to the decision and separate evidence from inference.
4. Keep exploratory/discarded results in conversation by default.
5. When the user wants an existing company/opportunity updated, use the corresponding MCP write tool.
6. Do not claim that a newly researched company has been saved unless an explicit create tool exists and succeeds. V1 intentionally exposes update, not generic insert.
7. Return a concise recommendation and why it matters.

Do not:
- create a CRM module for every research category;
- store every search result by default;
- reuse outdated competitive facts without checking current information;
- initiate outreach unless explicitly requested;
- bypass the MCP with arbitrary SQL for normal agent workflows.
