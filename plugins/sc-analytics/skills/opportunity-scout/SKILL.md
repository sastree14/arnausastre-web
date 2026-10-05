---
name: opportunity-scout
description: Find, evaluate and optionally save work and project opportunities for Arnau / SC-Analytics. Use when the user asks for Upwork jobs, freelance projects, consulting opportunities, remote roles, companies looking for Data/AI services, or other current opportunities found on the web.
---

The search happens in ChatGPT. The CMI stores only opportunities the user wants to keep.

Primary tools:
- Upwork connector: use marketplace job search and job detail tools for Upwork opportunities.
- Web search: use current public information for opportunities outside Upwork.
- SC-Analytics MCP:
  - `list_opportunities`: check what is already being followed.
  - `create_opportunity`: save a selected opportunity.
  - `update_opportunity`: update stage, value, probability, next action or metadata.
- LinkedIn connector: use it to enrich a known person when first/last name are available. Do not treat it as a generic company/prospect discovery engine.

Fit criteria:
- strong fit: data science, machine learning, AI/LLM systems, forecasting, optimization, analytics, decision systems, automation, Python, statistical modelling, data products and related consulting;
- prefer work where Arnau can deliver personally or SC-Analytics can add team capacity;
- penalize vague scope, unrealistic budgets, commodity low-value work, roles requiring credentials/location that clearly do not fit, or excessive competition when other evidence is weak;
- distinguish personal employment/contract opportunities from SC-Analytics client opportunities.

Workflow:
1. Search the requested source(s) using current data.
2. Check existing saved opportunities to avoid duplicates.
3. Shortlist only genuinely relevant opportunities and explain the fit briefly.
4. Do not save every result. Persist only when the user explicitly asks to keep/follow an opportunity.
5. When saving, use `create_opportunity` with source such as `upwork`, `web_job`, `consulting_lead` or another clear source and include useful metadata such as URL, external ID, client/company, budget/rate and fit rationale.
6. For Upwork applications, use the Upwork proposal workflow. Any submission/write action must follow the connector's explicit confirmation requirements.
7. If the user asks for recurring monitoring, use a scheduled/conditional task rather than pretending the plugin itself runs continuously.

Do not:
- store rejected or exploratory results by default;
- claim an opportunity is saved unless the MCP write succeeds;
- submit an Upwork proposal without the required explicit confirmation;
- invent budget, client data or availability;
- use LinkedIn search without a known person name when the connector requires one.
