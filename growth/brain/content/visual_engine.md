# SC-Analytics Visual Intelligence & Rendering Engine

## Objective

Turn an approved Canonical Content Object into channel-ready presentation content and 1–3 brand-safe visual candidates, then render the selected candidate deterministically.

## Pipeline

```text
Canonical Content Object
→ Channel Contract
→ Visual Format Planner (AUTO or explicit)
→ Presentation Content Package
→ Visual Planner
→ Candidate Generator
→ Candidate Ranking
→ Visual Spec
→ Deterministic Renderer
→ Deterministic adaptation (max 2 passes)
→ Hard QA
→ Visual Critic (vision, non-authoritative)
→ Persist candidate/render state
```

## Presentation Content Package

The editorial writer must know the target channel and format before it writes final slots. It must not write an article and later try to squeeze it into a carousel.

A package contains channel, format, visual role, external copy mode, hashtags and structured content slots.

Examples:
- LinkedIn carousel → 4–8 slide objects with explicit roles; external caption minimal.
- LinkedIn dataviz → title/context/series or conceptual curve/takeaway; external caption medium.
- Website article → long-form article plus visual support instructions.
- Website project → structured case study plus proof visuals.

## Three-candidate workflow

When `candidate_count=3`, the engine returns three compositions inside the same selected language. It does not return three unrelated brands.

Example evidence slide:
- comparison cards;
- compact table;
- mini bar/dot chart.

The planner ranks them, the top candidate is marked recommended, and the other two remain selectable in the future CRM.

## AUTO behaviour

AUTO is a policy, not randomness.

Visual format AUTO uses content family, semantic relationship, evidence shape and channel.

Visual language AUTO defaults:
- Point of View / strong thesis → A.
- Compare / Decision Guide / executive memo → B.
- System / Architecture / Diagnose → C.
- Evidence / Measurement / analytical development → D.

Format-specific availability still applies: architecture and before/after currently use A/B/C because no D Gold Standard exists.

## Illustrative evidence mode

The planner may deliberately choose an illustrative dataviz for a conceptual relationship even when no empirical data exists.

Examples:
- overfitting training vs validation error;
- bias/variance trade-off;
- diminishing returns;
- decision-readiness curve;
- maturity curve.

The visual spec must carry `evidence_mode=illustrative`. Numeric-looking outcome claims remain prohibited.

## Geometry

The renderer owns geometry. LLM output never supplies arbitrary pixel coordinates as authoritative layout.

AI output supplies semantic intent such as:
- `two_card_comparison`;
- `line`;
- `layered_system`;
- `fragmented_network_to_pipeline`.

The renderer uses canvas, safe margins, regions, node counts, label length and style tokens to calculate positions.

## QA

A candidate cannot be recommended when any hard rule fails. Hard QA runs before final selection and persistence.

Typical failures:
- title overflow after adaptation budget exhausted;
- content outside safe area;
- label below minimum size;
- invalid chart for evidence shape;
- too many visible line series;
- crossed connectors in clean architecture;
- style mixing;
- missing illustrative disclosure when required.

## Persistence

Supabase stores mutable instances and runtime state:
- canonical content object;
- active visual-system version;
- publication/presentation plan;
- presentation package;
- visual candidates;
- render attempts;
- selected design and QA result.

Git remains the source of truth for the definition of the system.

## Format intelligence

When format is AUTO, deterministic family/channel eligibility first limits the options. The AI then ranks only those formats. It cannot invent a new format. This is how the engine decides between carousel, dataviz, architecture and before/after without surrendering brand control.

## Rendering and adaptation

The renderer outputs self-contained SVG and 1080×1350 PNG assets. It uses the audited layout anchors, real SC-Analytics logo assets, Inter/Playfair Display roles, fixed palette/stroke/radius tokens and deterministic geometry algorithms.

When hard QA fails, the pipeline allows a bounded adaptation budget:
1. deterministic geometry adaptation;
2. one copy-compaction pass that may shorten visual copy but may not change facts or add evidence.

If the visual still fails, it is persisted as `needs_review` and cannot become the automatic recommendation.

## Candidate selection

Every candidate receives a planner score and, when configured, a vision-critic score. Hard QA is authoritative: a failed hard constraint cannot be overridden by a high aesthetic score. Among valid candidates, the final recommendation combines planner and visual-critic scores.

## Authority boundaries

The system uses four distinct layers:

1. **Semantic intelligence**
   - chooses relationship, visual format and emphasis;
   - ranks only valid candidates.

2. **Deterministic candidate grammar**
   - enumerates permitted chart types, layouts and compositions;
   - prevents an LLM from inventing unsupported structures.

3. **Deterministic rendering**
   - owns x/y/w/h, typography bounds, line widths, radii, logo placement, routing and export.

4. **Deterministic QA + optional visual critique**
   - hard QA rejects broken assets;
   - visual critique only helps rank valid assets and can never override hard rules.

This separation is the architectural safeguard against free-form AI design.

## Runtime entry point

Primary runtime:

`growth.src.visual_pipeline.run_visual_pipeline(...)`

It accepts a Canonical Content Object plus channel and optional format/language overrides. It can run fully independently of the CRM. The future CRM will call this runtime rather than duplicating its logic.

Core parameters:
- `channel`
- `format_key` or AUTO
- `visual_language` or AUTO
- `candidate_count` 1–3
- publication language
- persistence flag
- automatic selection flag

Primary return:
- publication plan;
- format recommendations;
- presentation package;
- all visual candidates;
- hard QA and visual critic reports;
- selected candidate;
- selected visual design.

## Persistence model

### canonical_content_objects

Mutable operational representation of approved Canonical Content Objects. Git keeps the schema definition; Supabase stores instances.

### visual_system_versions

Versioned runtime snapshot of the active visual system, including:
- system spec;
- Git paths;
- Drive source-of-truth link;
- repository revision.

### publication_plans

One channel/format decision for one canonical content object.

### presentation_packages

Format-ready copy and semantic slots after the channel contract has been applied.

### visual_candidates

The 1–3 valid compositions produced for a package.

### visual_render_runs

Rendered asset references, layout manifest, hard QA, critique and adaptation attempts.

### visual_designs

The final selected design remains the compatibility/output object used by the existing visual workflow. It is extended with candidate, visual-system version, semantic pattern, evidence mode, visual spec and QA.

## Evidence modes

`empirical`
- quantitative/observed evidence exists;
- renderer may show measured values.

`illustrative`
- the visual explains a concept;
- renderer may create normalized conceptual shapes;
- it must not imply measured outcomes.

`mixed`
- a real evidence layer and an illustrative explanatory layer coexist;
- each must remain distinguishable.

## Failure behaviour

A visual becomes `needs_review` when the adaptation budget is exhausted or hard QA cannot be satisfied.

The system does not:
- shrink text indefinitely;
- hide source limitations;
- silently convert empirical evidence into illustration;
- invent quantitative data to rescue a chart;
- switch to an off-brand style;
- publish a failed asset automatically.

## CRM boundary

Phase 5 intentionally stops before CRM restructuring.

The CRM should later act as an orchestration/review surface:
- choose or accept AUTO topic/format/angle/language;
- inspect up to three visual candidates;
- override the recommendation if desired;
- approve publication.

The CRM must not become a second implementation of the visual planner or renderer.
