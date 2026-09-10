# SC-Analytics Growth Agent v2

## Purpose

A code-first, cloud-executed growth system for SC-Analytics. GitHub Actions provides scheduling and execution. Python contains deterministic business logic. LLMs are used only where judgment or language generation is useful. Persistent state lives outside GitHub (Supabase when configured; local JSON fallback for development). Public actions require approval.

## Principles

1. Understand before building.
2. Value before technology.
3. Prefer deterministic code over agent-to-agent chatter.
4. No fabricated experience, client outcomes, statistics or sources.
5. Every factual claim used in public content must carry provenance.
6. Human approval before publishing, outreach or any account action.
7. Do not scrape or browser-automate LinkedIn. LinkedIn is an interaction channel, not a scraped database.
8. Keep providers replaceable: OpenAI/Gemini, Brave/search, Supabase, LinkedIn/Metricool.
9. Git stores code, prompts and approved public knowledge; mutable commercial state belongs in the database.
10. Multi-tenant-ready from the data model, while SC-Analytics is the only tenant in v2 MVP.

## Runtime

GitHub Actions -> `python -m growth.src.cli <command>` -> services -> state store -> approval queue.

Core commands:

- `plan-week`: create a weekly growth plan.
- `run-day`: execute today's planned low-risk tasks and create approval items for external actions.
- `content`: create one content candidate plus a visual asset.
- `prospect`: research companies/partners and create scored candidates.
- `brief`: print the current action brief.
- `validate`: validate configuration and Brain files.

## Storage model

- Git: Brain, prompts, templates, schemas, code, approved website content.
- Supabase/Postgres: plans, tasks, candidates, content items, approvals, interactions and metrics.
- Object storage: generated PNG/SVG/chart assets when cloud storage is configured.
- Local fallback: `growth/data/*.json` for development only; ignored by git.

## LinkedIn boundary

The agent may generate posts, visuals, company/person shortlists and personalized message drafts. It may prepare approved posts for an official publishing integration. It must not scrape LinkedIn, bulk-follow/connect, or automate browser actions. Connection/follow/message actions remain manual unless an official provider/API grants the required action.

## Migration

The existing content and LinkedIn-pack pipelines remain untouched until v2 replaces each capability. No big-bang rewrite.