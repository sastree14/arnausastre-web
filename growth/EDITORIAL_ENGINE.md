# SC-Analytics Editorial Engine v1

The Editorial Engine turns current signals and approved internal knowledge into selective, evidence-aware content opportunities for SC-Analytics.

It is deliberately not a content factory. The valid result of a cycle can be zero posts.

## Pipeline

1. Signal discovery
   - Brave Search discovers current developments across AI/automation, forecasting, optimization, operations, risk/ML, analytics and data strategy.
   - A small set of dynamic search queries is generated from the current SC-Analytics Brain and weekly themes.
   - URLs are deduplicated and persisted in `editorial_signals`.

2. Editorial gate
   - A low-cost OpenAI model scores every signal on ICP relevance, business consequence, originality of the SC-Analytics angle, evidence quality, principles fit and reader usefulness.
   - The gate assigns one of: `IGNORE`, `RESEARCH_MORE`, `LINKEDIN`, `ARTICLE`, `LINKEDIN_AND_ARTICLE`, `CASE`.
   - Trendiness never compensates for weak business relevance or evidence.

3. Research
   - Only shortlisted signals are fetched in depth.
   - The original source and a small number of related public sources are collected.
   - LinkedIn pages are never scraped.

4. Canonical content brief
   - A higher-reasoning OpenAI model creates one canonical brief with thesis, business problem, audience, reasoning, practical takeaway, evidence, risks/limits, output decision and visual recommendation.
   - Evidence claims may only cite URLs collected during research.
   - Briefs are persisted in `editorial_briefs`.

5. Native language variants
   - Supported languages: Spanish (`es`), English (`en`) and Catalan (`ca`).
   - Variants are written from the canonical brief. They are not sentence-by-sentence translations.
   - LinkedIn currently creates all three language variants and makes only the recommended language approval-ready; sibling languages remain alternatives.
   - Website article decisions create article drafts in all three languages.

6. Writer + critic
   - The writer receives the SC-Analytics Brain, editorial playbook, language policy and the appropriate voice.
   - Arnau-profile content uses the calibrated founder voice: direct, concrete, business-first and nuanced without copying spoken filler.
   - A separate high-reasoning critic scores voice, evidence, usefulness and generic-AI risk.
   - Weak drafts receive one controlled rewrite and a second critique.

7. Presentation + visual decision
   - The Canonical Content Object is adapted through the channel contract before final visual copy is written.
   - AUTO format selection ranks only valid SC-Analytics formats: Carousel, Dataviz, Architecture or Before/After.
   - A Presentation Content Package gives the visual engine structured slots rather than unconstrained prose.
   - Up to three compositions are generated inside one selected visual language.
   - The LLM decides semantic intent and ranks valid candidates; it never supplies authoritative pixel positions.
   - The deterministic renderer owns canvas, typography bounds, colours, margins, geometry, chart placement, diagram routing and SVG/PNG export.
   - Illustrative analytical graphics are allowed when explicitly marked illustrative; empirical-looking evidence may not be fabricated.
   - Hard QA is authoritative. A vision-based Visual Critic may rank valid renders but cannot override hard failures.

8. Human approval
   - Approval is always separate from generation and external execution.
   - Primary LinkedIn variants create `publish_post` approvals.
   - Website article drafts create `publish_article` approvals.
   - Source links, quality score, language and content family are visible in `/growth-admin`.

## Data model

- `editorial_signals`: discovered topics and first-pass evaluation.
- `editorial_briefs`: evidence-aware editorial decisions and compatibility bridge to the canonical object.
- `canonical_content_objects`: mutable operational instances of the approved Canonical Content Object.
- `publication_plans`: channel/format decisions before rendering.
- `presentation_packages`: channel- and format-ready copy/semantic slots.
- `visual_candidates`: 1–3 bounded visual alternatives.
- `visual_render_runs`: rendered assets, layout manifests, adaptation attempts and QA.
- `visual_designs`: selected visual output, now linked to the visual-system version and candidate.
- `content_items`: actual language/channel variants, with `brief_id`, `language`, `content_family`, `quality_score`, `critique` and `source_url`.
- `evidence`: public-source or real-case claims used by content.
- `approvals`: human permission state.

All editorial tables are server-only. `anon` and `authenticated` have no table privileges.

## CLI

Run a full cycle:

```bash
STATE_PROVIDER=supabase ASSET_PROVIDER=supabase python -m growth.src.cli editorial-run --signals 50 --briefs 3
```

Run a single known URL through the same gate:

```bash
STATE_PROVIDER=supabase ASSET_PROVIDER=supabase python -m growth.src.cli editorial-url "https://example.com/source" --title "Optional title"
```

The scheduled weekly strategy creates an `EDITORIAL_RUN` task. The weekday GitHub Action executes the task only when `GROWTH_AUTOMATION_ENABLED=true`.

## OpenAI model roles

- `gpt-5.6-luna`: high-volume discovery support and first-pass editorial scoring.
- `gpt-5.6-terra`: available as a balanced profile for future medium-cost tasks.
- `gpt-5.6-sol`: canonical briefs, article writing when appropriate, editorial criticism and controlled rewrites.

Models are called through the OpenAI Responses API using the server-side `OPENAI_API_KEY`.

## Human calibration

The system is technically usable before calibration, but final editorial quality is intentionally learned through Arnau's decisions.

During the first 20-30 opportunities, record what is approved, rejected or rewritten. Recurrent feedback should be converted into Brain rules and golden examples rather than relying on hidden prompt intuition.

The target operating model is roughly 10-15 minutes of weekly human review, not manual content production.


## Visual system v1

Canonical human rules:
- `growth/brain/content/visual_system.md`
- `growth/brain/content/visual_engine.md`

Canonical machine rules:
- `growth/schemas/visual_system.yml`
- `growth/schemas/visual_spec.schema.json`
- `growth/schemas/presentation_package.schema.json`
- `growth/schemas/visual_publication_plan.schema.json`

Primary runtime:
- `growth/src/visual_pipeline.py`

The visual engine is intentionally callable without CRM coupling. CRM integration is a later orchestration/UI phase.
