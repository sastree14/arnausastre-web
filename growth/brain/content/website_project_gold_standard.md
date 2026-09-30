# Website Project Gold Standard v1

Status: draft implementation for review  
Reference implementation: SC-12  
Route: `/projects/ecommerce-demand-forecasting`

## Purpose

The Website Project Gold Standard is the commercial case-study layer between the executive website and the technical Portfolio_SC_Analytics repository.

It must let a business buyer understand, within the first 10–20 seconds:

- what problem the system addresses;
- why the problem matters;
- what was built;
- what evidence exists;
- what the system does not claim.

A technical reader can then inspect implementation detail in Portfolio_SC_Analytics.

## Source hierarchy

For project facts:

1. `Portfolio_SC_Analytics` manifest + evidence files are authoritative.
2. The website may reframe and order facts commercially.
3. The website may not invent client status, performance uplift, measured impact or unsupported technical detail.
4. Public portfolio implementations must be labelled as such.
5. Named client language is prohibited unless separate approved evidence explicitly permits it.

## Page architecture

Required blocks:

1. Hero
2. Evidence/provenance notice
3. Business problem
4. Decision context / why the problem matters
5. What was built
6. Architecture / system logic
7. Technical decisions / approach
8. Evidence / what is measured
9. Technical overview
10. Limitations
11. Business takeaway
12. Technical proof CTA
13. Commercial CTA

Optional blocks:

- Before/After
- Dataviz
- Timeline
- Comparison
- Process
- Additional evidence
- Related project
- Service adjacency

## Web design language

The website has one stable SC-Analytics identity. A/B/C/D are embedded editorial asset languages, not page-level website themes.

Core website palette:

- Deep navy: `#071522`
- Dark surface: `#0D1B2A`
- Paper: `#F8FAFC`
- Analytical paper: `#FAFAF7`
- Main ink: `#0F172A`
- Muted text: `#475569`
- Indigo accent: `#4F46E5`
- Structural blue: `#496C8A`

Typography:

- Display: Playfair Display
- Body/UI: Inter

## Layout

Desktop:
- Outer page width: `max-w-7xl`
- Standard horizontal padding: 24 px mobile / 32 px desktop equivalent
- Reading width: ~720–820 px
- Full visual width: up to ~1180 px
- Section vertical rhythm: 80–112 px
- Large section radius: 24–32 px
- Primary body line height: 1.75–2.0

Mobile:
- Single-column flow.
- No visual may require horizontal page scrolling.
- Complex system maps may internally reflow or stack.
- Buttons wrap rather than shrink below readable size.
- Large display title reduces through responsive typography rather than clipping.

## Hero contract

Required:
- project evidence type;
- project ID;
- title;
- concise description;
- thesis;
- industry;
- capabilities;
- 3–4 decision facts;
- technical proof CTA;
- route CTA;
- explicit provenance note when not a client case.

The hero must not lead with technology names.

## Evidence contract

Separate:
- model/evaluation metrics;
- decision metrics;
- implementation facts;
- measured outcomes.

If measured client outcomes do not exist, the page must never substitute invented uplift percentages.

Conceptual visuals are allowed when clearly framed as conceptual.

## Architecture contract

Architecture diagrams on website pages should explain system responsibility and boundaries rather than reproduce low-level infrastructure.

Preferred order:
- input/source;
- feature/validation layer;
- baseline/model layer;
- horizon/evaluation layer;
- selection/decision layer;
- planning/integration output.

Integration boundaries should be visually separate from the primary analytical flow.

## Technical proof

Every public-portfolio project page should expose a clear path to its Portfolio_SC_Analytics implementation.

The website remains:
- business-first;
- evidence-aware;
- concise.

Portfolio_SC_Analytics remains:
- technical;
- reproducible;
- implementation-oriented.

## Responsive and QA

Hard failures:
- unsupported claim;
- missing provenance notice for public portfolio implementation;
- clipped title;
- horizontal page overflow;
- unreadable body copy;
- broken external technical-proof link;
- architecture labels smaller than readable mobile text;
- CTA collision;
- inaccessible contrast.

## SC-12 reference

SC-12 demonstrates the Gold Standard using only documented facts:

- H1 / H3 / H6 / H9 horizon evaluation;
- WAPE / MAE / forecast bias;
- service level / inventory coverage;
- statistical baselines;
- XGBoost / LightGBM candidates;
- out-of-sample model selection;
- FastAPI / PostgreSQL integration boundary;
- public portfolio provenance;
- documented limitations.

The prior website copy contained claims of client-specific performance uplift that are not supported by the public portfolio manifest. The Gold Standard branch intentionally replaces those claims with verified public-implementation evidence.

## Implementation files

- `lib/website-project-gold-standard.ts`
- `components/projects/WebsiteProjectGoldStandard.tsx`
- `components/projects/WebProjectVisuals.tsx`
- `app/projects/[slug]/page.tsx`

Machine contract:
- `growth/schemas/website_project.schema.json`

Reference branch:
- `feat/web-project-gold-standard-sc12`

This implementation is intentionally isolated from `main` until visual review and approval.


## Two-level case experience

The website now separates fast evaluation from deep technical explanation.

### Level 1 — Case overview

Route:

`/projects/[slug]`

Purpose:

A buyer should understand the project in roughly 20–30 seconds.

Required content:
- problem;
- what was built;
- operational utility or verified impact;
- 3–4 evidence facts when verified;
- direct CTA to the full case;
- direct technical repository link when public proof exists;
- direct contact CTA.

This page must remain concise. It is not the place for architecture detail, methodology, long limitations or implementation notes.

### Level 2 — Full case study

Route:

`/projects/[slug]/case-study`

Purpose:

Expose the complete reasoning for readers who actively want more depth.

It contains:
- business problem;
- decision context;
- system design;
- architecture;
- analytical decisions;
- evidence;
- technical overview;
- limitations;
- technical proof;
- commercial next step.

A persistent left-hand section rail on desktop, plus repository and contact actions, makes the detailed case navigable without scanning the entire page. Mobile keeps a compact horizontal section strip rather than a dropdown.

## Cases naming policy

Public navigation uses `Cases / Casos`, not `Success stories / Casos de éxito` by default.

Reason:
- some entries are public portfolio implementations, internal systems or capability proofs;
- `success story` implies a verified real-world outcome;
- that label should only be used where client provenance and measured impact are explicitly approved.

Verified client engagements may later receive a distinct `Success story / Caso de éxito` evidence type.


## Commercial first-impression rule

Every case must answer the following in the first 20–30 seconds:

1. What business problem exists?
2. What changed because of the system?
3. What operating or financial consequence matters?
4. What evidence mode supports the claim?
5. Where can the buyer go next?

Technology names should not be required to understand the case.

### Quantification hierarchy

Prefer quantification in this order:

1. Verified measured client outcome.
2. Verified project KPI or operating metric.
3. Clearly labelled illustrative business scenario with explicit assumptions.
4. Qualitative business consequence when no defensible number is available.

Illustrative scenarios are allowed to make business economics understandable, but they must be labelled as illustrative and must never be presented as measured client impact.

For example:

`€2.0M inventory × 5% illustrative reduction in excess stock = €100k working capital released`

is acceptable only when the page states that the 5% is an illustrative assumption rather than a measured result.

## Case index rule

The public case index is a buyer navigation surface, not a portfolio gallery.

Desktop rows should prioritise:
- one problem-led title;
- one clear open-case action;
- minimal auxiliary metadata.

Titles should remain readable on one line at normal desktop widths where possible. The index should help a buyer recognise their own problem before asking them to understand SC-Analytics technology.
