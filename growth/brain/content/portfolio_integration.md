# SC-Analytics — Portfolio → Editorial Integration

## Purpose

`sastree14/Portfolio_SC_Analytics` is the factual and technical source of truth for SC-Analytics project proof.

The editorial system does not copy the portfolio into a second knowledge base. It resolves a project through the Project Manifest v2, reads only the evidence required for the selected editorial angle, and builds a Canonical Content Object that keeps provenance.

## Communication model

```text
LinkedIn / executive discovery
        ↓
SC-Analytics website case study
        ↓
Portfolio_SC_Analytics technical proof
```

The executive layer explains the buyer problem, business consequence, judgement, solution and proof.

The technical layer exists for readers who want to inspect architecture, methods, code, validation and limitations.

## Project discovery

1. Read `catalog/projects.yml`.
2. Resolve the project's `manifest` path.
3. Read the Project Manifest v2.
4. Select only the evidence required for the editorial family/angle.
5. Build a canonical content object.
6. Preserve project source references on every factual project claim.

Do not crawl project files at random.

## Project Manifest v2

Every project manifest contains:

- identity and family;
- factual summary;
- documented `designed_for` contexts;
- documented `why_it_matters` points;
- technologies;
- provenance and client-claim policy;
- paths to business impact, results, architecture, technical decisions, data, environments and limitations;
- primary visual;
- primary technical execution path.

The manifest is an interface to evidence, not a duplicate of the evidence.

## Claim policy

A public portfolio implementation proves capability and implementation depth.

It does not automatically prove a named client engagement.

When `client_claim_allowed: false`:

- do not say that the project was built for a named client;
- do not turn representative/public metrics into client outcomes;
- do not imply production adoption unless explicitly documented in separately approved evidence;
- do not remove limitations from the source material.

## Canonical content object

Project-led content uses:

- `origin = portfolio_project`
- `editorial_pillar = projects_proof`
- at least one project topic entity;
- `evidence.project_sources` pointing to `Portfolio_SC_Analytics`;
- portfolio-backed claims using exact source paths;
- `commercial_spine.proof.type = portfolio_project`.

One project may generate many canonical content objects with different families and angles.

Examples:

- Case / Project Proof → business transformation.
- System / Architecture → how the system fits together.
- Evidence / Measurement → what should be measured and why.
- Decision Guide → when the approach is appropriate.
- Failure Modes & Mistakes → what the project design protects against.
- Compare → methods or technologies used inside the project.

The project remains the truth source in every case.

## Runtime adapter

Implementation:

- `growth/src/portfolio.py`

Key functions:

- `load_project_index()`
- `resolve_project(project_id)`
- `load_project_manifest(project_id)`
- `load_project_evidence(project_id, ...)`
- `build_project_source_bundle(project_id, ...)`
- `project_content_seed(project_id, ...)`
- `create_project_content_object(project_id, ...)`

Environment overrides:

- `SC_PORTFOLIO_REPOSITORY`
- `SC_PORTFOLIO_REF`

Defaults point to `sastree14/Portfolio_SC_Analytics@main`.
