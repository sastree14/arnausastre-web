# SC-Analytics — Canonical Content Model

This document defines the canonical content object used by the SC-Analytics editorial system.

The object represents a structured, evidence-aware editorial idea before it is rendered into LinkedIn, a website article, a website project page, a marketplace item, a GitHub/portfolio asset or a visual.

It is not a publication.

## Core principle

The canonical object answers:

1. What are we talking about?
2. What is the business question?
3. What is the SC-Analytics thesis?
4. What evidence supports the idea?
5. Who is it useful for?
6. What should the reader understand or do?
7. Which outputs may be appropriate?

Channel-specific copy, visual format, visual language and final CTA are downstream renderers.

## Relationship to projects

A project object and a content object are different things.

Canonical project truth lives in:

- Repository: `sastree14/Portfolio_SC_Analytics`

A single project may originate multiple canonical content objects.

A canonical content object may reference a project, but it never replaces or mutates the project source.

Project facts, metrics, tools, methods and outcomes must not be invented.

## Canonical structure

### 1. Identity

Fields:

- `content_object_id`
- `status`
- `origin`
- `created_at`
- `updated_at`

Recommended origins:

- `portfolio_project`
- `public_research`
- `internal_knowledge`
- `manual_idea`
- `current_event`
- `hybrid`

The origin describes where the idea came from, not where it will be published.

### 2. Editorial classification

Fields:

- `editorial_pillar`
- `content_family`
- `angle`
- `topic_entities[]`

The canonical pillars and content families are defined in `editorial_architecture.md`.

A topic entity should be structured, not stored only as free text.

Recommended entity types include:

- `project`
- `technology`
- `platform`
- `method`
- `model`
- `industry`
- `business_problem`
- `business_process`
- `company`
- `regulation`
- `concept`
- `metric`

Example:

```yaml
topic_entities:
  - type: model
    name: SARIMA
  - type: model
    name: XGBoost
  - type: business_problem
    name: Demand Forecasting
  - type: industry
    name: Retail
```

### 3. Business core

Fields:

- `business_problem`
- `business_question`
- `thesis`
- `key_points[]`

This is the intellectual core of the object.

A topic without a useful business question and a defensible thesis is not ready for publication.

Example:

```yaml
business_problem: >
  Companies often choose forecasting models by predictive performance
  without considering the operational decision they support.

business_question: >
  When should a company prefer a classical time-series model over ML?

thesis: >
  Model complexity should follow the decision problem,
  not the fashion of the modelling technique.

key_points:
  - Classical models can be easier to maintain and interpret.
  - ML may add value when external features and nonlinear relationships matter.
  - Accuracy alone is not sufficient for model selection.
```

### 4. Evidence and provenance

Fields:

- `claims[]`
- `project_sources[]`
- `public_sources[]`
- `internal_sources[]`
- `limitations[]`

Claims should retain provenance.

Recommended claim structure:

```yaml
claim:
  text: ROC-AUC achieved 0.8724
  source_type: portfolio_project
  source_ref: credit-risk-modelling
  verified: true
```

For public evidence:

```yaml
claim:
  text: Example external factual claim
  source_type: public_source
  source_url: https://...
  verified: true
  accessed_at: 2026-09-30T00:00:00Z
```

Rules:

- Evidence must precede factual copy.
- Public reporting must not be transformed into SC-Analytics experience.
- No project source means no claim of real SC-Analytics project experience.
- Limitations and uncertainty should be preserved, not removed by the renderer.

### 5. Value and objective

Fields:

- `primary_objective`
- `secondary_objectives[]`
- `practical_takeaway`
- `desired_reader_action`

Typical objectives include:

- `authority`
- `education`
- `proof`
- `awareness`
- `demand_generation`
- `trust`
- `engagement`
- `seo`
- `portfolio_visibility`

Typical desired reader actions include:

- `understand_concept`
- `compare_options`
- `reconsider_process`
- `visit_project`
- `read_article`
- `start_conversation`
- `book_discovery_call`

The desired reader action is not the final written CTA. CTA wording belongs to the channel renderer.

### 6. Context and constraints

Fields:

- `target_audience[]`
- `industry_context[]`
- `funnel_stage`
- `timeliness`
- `why_now`
- `valid_until`
- `confidentiality`
- `language_context`
- `risks_or_limits[]`

Recommended timeliness values:

- `evergreen`
- `timely`
- `breaking`
- `seasonal`

Time-sensitive content should preserve why it matters now and, when appropriate, a validity horizon.

### 7. Output hints

Fields:

- `eligible_channels[]`
- `recommended_channels[]`
- `visual_semantics`

These are hints, not final rendered decisions.

Possible channels include:

- `arnau_linkedin`
- `sc_analytics_linkedin`
- `website_article`
- `website_project`
- `marketplace`
- `github_portfolio`

Recommended visual semantics:

- `comparison`
- `architecture_available`
- `quantitative_evidence`
- `before_after`
- `project_assets_available`

Example:

```yaml
eligible_channels:
  - arnau_linkedin
  - website_article

recommended_channels:
  - arnau_linkedin

visual_semantics:
  comparison: true
  architecture_available: false
  quantitative_evidence: true
  before_after: false
  project_assets_available: false
```

The visual engine later maps these semantics to formats such as Carousel, Dataviz, Architecture or Before/After and to visual languages A/B/C/D.

## Output relationship

The operating model is:

```text
Canonical Content Object
        |
        +-- LinkedIn Output
        +-- Website Article Output
        +-- Website Project Output
        +-- Marketplace Output
        +-- GitHub / Portfolio Output
        +-- Visual Asset Output
```

The output objects may contain channel-specific fields such as:

- title;
- body;
- language;
- channel;
- visual format;
- visual language;
- CTA wording;
- publication status;
- publication date;
- metrics.

These fields must not redefine the canonical idea.

## Minimum readiness rule

A canonical content object should not be considered ready until it has, at minimum:

- a valid editorial pillar;
- a valid content family;
- at least one topic entity;
- a business problem or business question;
- a thesis;
- a target audience;
- an evidence/provenance state appropriate to the claim type;
- a practical takeaway.

Additional fields depend on the content origin and intended use.

## Source of truth hierarchy

- Model definition: `arnausastre-web/growth/brain/content/canonical_content_model.md`
- Machine contract: `arnausastre-web/growth/schemas/canonical_content_object.schema.json`
- Editorial taxonomy: `arnausastre-web/growth/brain/content/editorial_architecture.md`
- Real project truth: `sastree14/Portfolio_SC_Analytics`
- Operational instances and mutable workflow state: Supabase
- Human-readable mirror: Google Drive

If an operational implementation conflicts with this model definition, the model definition governs until intentionally versioned.
