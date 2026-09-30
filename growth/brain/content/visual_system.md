# SC-Analytics Visual System v1

Status: ACTIVE — Phase 4 source of truth  
Date: 30 September 2026

## 1. Purpose

SC-Analytics uses a constrained visual system, not free-form AI design. The system must make every public asset immediately recognisable as SC-Analytics while retaining enough composition freedom to explain different analytical ideas well.

Core principle:

> AI decides meaning. Deterministic rules enforce design. Geometry algorithms place elements.

The AI may choose between valid visual solutions. It may never invent a new visual language, violate brand geometry, mix styles within one asset, or use unsupported evidence.

## 2. Audited design source

The v1 rules were derived from the approved 1080×1350 Figma exports supplied as SVG, PDF and JPG for:

- Carousel — languages A, B, C and D, including cover, process, comparison, evidence/model review, framework/measurement and conclusion roles.
- Dataviz — languages A, B, C and D.
- Architecture / Diagram — languages A, B and C.
- Before / After — languages A, B and C.

SVG is the geometric source for fills, strokes, radii and canvas geometry. PDF is the text/bounding-box source. JPG is the visual cross-check. Production typography is normalised to the existing SC-Analytics brand stack already used by the website: Playfair Display for editorial serif roles and Inter for UI/sans roles.

## 3. Global immutable rules

Canvas:
- 1080 × 1350 px.
- 4:5 aspect ratio.
- No stretching or alternate aspect ratio inside this renderer.

Brand integrity:
- One visual language per asset.
- One visual language per complete carousel.
- A carousel may not mix A/B/C/D between slides.
- Logo aspect ratio is immutable.
- Outer safe margin may never be violated.
- Footer and metadata safe zones remain reserved.
- Text clipping, shape overlap, off-canvas elements and unreadable font reductions are hard failures.
- No off-brand colour may be introduced by the planner.

Typography:
- Editorial serif role: Playfair Display.
- UI/sans role: Inter.
- Titles may reflow and reduce within the language-specific range, but never below the minimum.
- Metadata may use smaller sizes than explanatory body text.
- Feed readability takes precedence over fitting more copy.

## 4. Visual languages

### A — Dark Editorial

Purpose: thesis-led, editorial, memorable, high contrast.

Observed/canonical palette:
- Background `#0D1B2A`
- Surface `#13283C`
- Alt surface `#102338`
- Main text `#F5F7FA`
- Soft text `#EAF0F6`
- Muted `#B0BAC8`
- Structural blue `#496C8A`
- Secondary blue `#3E81B1`
- Accent `#818CF8`

Geometry:
- Safe margin: 80 px.
- Primary stroke: 3 px.
- Secondary stroke: 2 px.
- Compact/standard card radius: approximately 9–10.5 px where cards are used.

Typography:
- Title default 64 px; allowed 50–68 px; maximum 4 lines.
- Subtitle default 24 px; allowed 20–28 px.
- Body default 22 px; minimum 18 px.
- Labels default 18 px.

Use when the content is driven by a strong thesis, principle, point of view or memorable explanatory insight.

### B — Executive Off-White

Purpose: executive memo, consulting note, business comparison, decision support.

Palette:
- Background `#F4F1EA`
- Surface `#FAF8F3`
- Alt surface `#EEEAF4`
- Main text `#0D1B2A`
- Muted `#586574`
- Divider `#C8C3B8`
- Accent `#6265D8`
- Positive `#4F8A67`
- Negative `#B45C5C`

Geometry:
- Safe margin: 80 px.
- Primary structural stroke: 3 px.
- Hairline available: 1.5 px.
- Card radius family: approximately 10–12 px where used.

Typography:
- Title default 52 px; allowed 44–56 px; maximum 3 lines.
- Subtitle 24 px default.
- Body 20 px default; 17 px minimum.
- Labels 18 px default.

Use when the reader should feel they are reading an executive decision note rather than a social graphic.

### C — Technical Blueprint

Purpose: operating logic, architecture, diagnostics, technical systems, explicit structure.

Palette:
- Background `#0D1B2A`
- Surface `#13283C`
- Alt surface `#1A3248`
- Main text `#EAF0F6`
- Muted `#A8BACB`
- Structural blue `#5E86A8`
- Secondary structure `#496C8A`
- Accent `#7A7DFF`
- Accent alt `#818CF8`

Geometry:
- Safe margin: 80 px.
- Primary stroke: 3 px.
- Secondary stroke: 2 px.
- Compact panel radius: 2.5 px.
- Emphasis stroke may reach 5 px only for explicit focus.

Typography:
- Title default 50 px; allowed 42–54 px; maximum 3 lines.
- Body 20 px default; 16 px minimum.
- Technical labels 14–18 px.

Use when the diagram or system structure is part of the proof.

### D — Analytical Report

Purpose: analytical report, evidence, restrained research tone, high information discipline.

Palette:
- Background `#FAFAF7`
- Surface `#F2F5F7`
- Alt surface `#F0F0FC`
- Takeaway surface `#EDEAF8`
- Main text `#102033`
- Alt text `#1D2B44`
- Muted `#7D8793`
- Divider `#D8DDE3`
- Accent `#6B6EF9`
- Blue `#4A78A8`
- Chart blue `#496C8A`

Geometry:
- Safe margin: 80 px.
- Hairline/divider: 1.5 px.
- Secondary: 2 px.
- Chart primary line/axis: 3 px.
- Standard radius: 2 px; emphasis radius: 6 px.

Typography:
- Title default 48 px; allowed 40–52 px; maximum 3 lines.
- Subtitle 24 px default.
- Body 18 px default; 15 px minimum.
- Metadata 11–15 px.

Use when evidence and analytical restraint should dominate.

## 5. Carousel contract

A carousel is a sequence, not a collection of unrelated cards. All slides use the same language and recurring header/footer identity.

Preferred slide count: 6. Valid range: 4–8.

Canonical slide roles:
1. Cover.
2. Process / logic.
3. Comparison.
4. Evidence / model review.
5. Framework / measurement.
6. Conclusion.

The exact sequence may vary when content semantics require it, but every slide must map to a defined role.

Capacity rules:
- Cover: title max 4 lines, subtitle max 2 lines, one optional micro-visual.
- Process: up to 5 steps.
- Comparison: normally 2 options and at most 5 comparison metrics.
- Evidence: up to 4 primary metrics or 3 comparison entities.
- Framework: maximum 2 conceptual layers, up to 6 items per layer.
- Conclusion: up to 3 takeaways plus closing statement.

LinkedIn rule: when the carousel is the primary narrative, external post copy is intentionally minimal and must not repeat the six slides.

## 6. Dataviz contract

Dataviz is defined by the analytical question, not by a fixed line-chart template.

Every dataviz has:
- framing/title;
- analytical visual;
- optional annotations;
- interpretation/takeaway;
- footer/identity.

Allowed analytical relationships and preferred chart candidates:
- Trend → line, area, small multiples.
- Multi-series trend → multi-line (max 4 visible series), small multiples, heatmap.
- Comparison → bar, grouped bar, dot plot.
- Ranking → sorted bar, lollipop, dot plot.
- Distribution → histogram, boxplot, violin.
- Correlation → scatter, scatter + trend.
- Composition → stacked bar, stacked area, donut only for ≤5 simple categories summing to 100%.
- Change → slope, dumbbell, delta bar.
- Target vs actual → bullet, paired bar, dot plot.
- Uncertainty → line + band, interval plot, scenario fan.
- Anomaly → annotated line/scatter/bar.
- Conceptual curve → illustrative line or multi-line.

Chart sizing is deterministic after the chart type is chosen. The language owns the chart region and the renderer allocates legend, labels and annotations inside it.

## 7. Illustrative visual policy

Illustrative analytical graphics are explicitly allowed and are valuable for concepts such as:
- overfitting;
- bias–variance;
- diminishing returns;
- maturity curves;
- conceptual trade-offs;
- process failure;
- decision readiness.

The absence of empirical data does not prohibit a conceptual graph.

However:
- set `evidence_mode=illustrative`;
- do not invent measured-looking client metrics;
- prefer normalised axes, qualitative labels, generic units or explicit `Illustrative` wording;
- if a reasonable reader could confuse the drawing with measured evidence, disclose that it is illustrative on the visual or in the caption.

## 8. Architecture / Diagram contract

Architecture diagrams are governed by semantic pattern.

Supported patterns:
- linear flow;
- pipeline;
- layered system;
- hierarchy;
- hub-and-spoke;
- network;
- cycle;
- feedback loop.

Orientation rules:
- horizontal by default for ≤5 short sequential nodes;
- wrapped horizontal or vertical for 6–8 nodes or longer labels;
- layered vertical for multi-layer architecture;
- radial only when there is a genuine central hub;
- grouped layers for larger systems.

Connector semantics:
- sequential → straight or orthogonal;
- dependency → orthogonal;
- feedback → curved return;
- reciprocal → bidirectional;
- hierarchy → orthogonal branching;
- fragmented/manual → curved and crossings may be intentional.

Clean architecture targets zero connector crossings. Crossing lines are a hard negative unless the semantic pattern is explicitly fragmented/manual.

## 9. Before / After contract

Before/After is a semantic transformation visual. Both sides use the same visual language.

The Before side may intentionally communicate fragmentation using:
- vertical stacking;
- loops;
- bidirectional arrows;
- curved returns;
- controlled crossings;
- higher apparent density.

The After side communicates order using:
- straight/orthogonal flow;
- fewer crossings;
- stronger alignment;
- consistent spacing;
- simpler sequence;
- explicit feedback only where real.

The contrast is meaningful; chaos is not decorative.

## 10. Composition intelligence

The visual planner is allowed to choose among valid compositions, but not to design outside the system.

Examples:
- Evidence slide with two models may choose a table, comparison cards or a small dataviz.
- A process may choose horizontal, vertical or grouped layout depending on node count and label length.
- A comparison may choose grouped bars or a dot plot depending on what the thesis emphasises.

The planner may produce three candidates. All three must share the selected visual language.

Candidate scoring:
- semantic fit 35%;
- clarity 25%;
- visual balance 15%;
- brand fit 10%;
- information density 10%;
- novelty 5%.

Hard rejection:
- overflow;
- clipping;
- overlap;
- font below minimum;
- margin violation;
- unsupported evidence;
- mixed visual language;
- excessive crossings in clean diagrams.

## 11. Adaptation engine

Title overflow order:
1. Reflow within maximum lines.
2. Reduce font within approved range.
3. Shorten semantically.
4. Switch to an allowed alternate composition.
5. `needs_review`.

General content overflow:
1. Reduce secondary copy.
2. Abbreviate labels.
3. Remove optional annotations.
4. Switch to a lower-density component.
5. Split/group content.
6. `needs_review`.

Diagram overflow:
1. Reduce gap within minimum.
2. Wrap horizontal layout.
3. Switch to vertical.
4. Group into semantic layers.
5. `needs_review`.

Chart overflow:
1. Abbreviate labels.
2. Reposition legend.
3. Reduce annotations.
4. Switch to small multiples.
5. `needs_review`.

The renderer must never solve overflow by shrinking text beneath its minimum.

## 12. Channel × visual behaviour

LinkedIn + Carousel:
- carousel is primary narrative;
- external copy minimal;
- normally 3–5 hashtags.

LinkedIn + Dataviz:
- visual is primary evidence;
- post copy explains business meaning;
- medium external copy.

LinkedIn + Architecture / Before-After:
- visual explains the mechanism or transformation;
- medium external copy.

Website Article:
- visual is supporting evidence/explanation;
- article remains a complete standalone argument;
- 1–4 visuals generally.

Website Project:
- visuals support proof and implementation depth;
- 2–6 visuals generally;
- technical depth can link to Portfolio_SC_Analytics.

Marketplace Project:
- visual is concise capability proof;
- 1–3 visuals;
- compact commercial copy.

## 13. Separation of responsibilities

Visual Planner (AI):
- interprets the story;
- identifies relationship/pattern;
- decides whether a chart/diagram is useful;
- selects one visual language when AUTO;
- ranks valid compositions.

Candidate Engine (deterministic):
- enumerates only allowed chart/layout candidates;
- rejects semantically invalid options.

Renderer (deterministic):
- calculates exact x/y/w/h;
- applies colours, fonts, strokes, radii and margins;
- routes connectors;
- renders SVG/PNG.

Visual Critic (AI + rules):
- critiques hierarchy, balance, density and semantic clarity;
- cannot override hard constraints.

Hard QA (deterministic):
- validates geometry and brand constraints;
- rejects invalid assets.

## 14. Gold-standard geometry anchors

The following anchors are production constraints derived from the complete 1080×1350 SVG/PDF/JPG exports, not aesthetic guesses. Coordinates are top-left origin. Minor 1–3 px vector/export offsets are normal; the production system normalises them to the canonical values below.

Global:
- Canvas: 1080×1350 px.
- Canonical outer text/grid anchor: 80 px.
- Logo left: 80 px; top approximately 34 px; preferred rendered width 150 px; aspect ratio locked.
- Footer rule: y≈1256 px; footer labels: y≈1297 px; content should finish before the reserved footer zone.
- Styles B/C/D use a thin upper structural rule before the editorial eyebrow.

Carousel title anchors:
- A: eyebrow top≈205; title top≈243.
- B: eyebrow top≈249; title top≈332; optional executive rail starts at x≈814.
- C: eyebrow top≈227; title top≈269.
- D: eyebrow top≈217; title top≈273; optional analytical rail starts at x≈810.

Dataviz anchors:
- A: title top≈288; context≈536; canonical chart region x≈150 y≈620 w≈700 h≈350; takeaway x≈140 y≈1030 w≈800 h≈150.
- B: title top≈352; executive rail x≈814 with structural rule x≈786.5; context≈623; canonical chart region x≈120 y≈735 w≈700 h≈335; takeaway x≈89 y≈1139 w≈869 h≈102.
- C: title top≈269; context≈426; outer chart/readout panel x≈74 y≈474 w≈899 h≈527; plotted axes live inside this panel; takeaway x≈90 y≈1035 w≈900 h≈145.
- D: title top≈275; context≈416; chart panel x≈80 y≈600 w≈920 h≈431; takeaway x≈80 y≈1045 w≈920 h≈140.

Architecture anchors:
- A: title top≈288; context≈536; diagram begins around y≈605.
- B: title top≈352; context≈623; system-map region begins around y≈730.
- C: title top≈264; context≈423; technical diagram begins around y≈486.

Before/After anchors:
- A: title top≈288; context≈536; comparison region begins around y≈590.
- B: title top≈352; context≈623; comparison region begins around y≈702.
- C: title top≈269; context≈501; technical comparison region begins around y≈564.

These anchors define the stable composition skeleton. The layout engine can vary internal node/card/chart placement only inside the designated content region and only within the adaptation rules.

## 15. Production interpretation of flexibility

Immutable: brand palette per language, font roles, canvas, logo geometry, safe grid, footer identity, stroke families, radii families, minimum font sizes and single-language consistency.

Adaptive: text reflow, font reduction within range, label abbreviation, choice among allowed component compositions, diagram orientation, chart type, annotation placement, legend placement and grouping.

Intelligent: semantic relationship, best format, best chart/diagram composition, what deserves emphasis and ranking of up to three valid candidates.

The intelligence never supplies arbitrary authoritative pixel coordinates. Geometry is computed by the deterministic renderer.

## 16. Visual candidate workflow

The engine can expose up to three candidates for a publication. They are alternatives inside the system, not three unrelated visual identities. For a carousel, for example, the candidates may be balanced, structured and more visual while all slides keep the same A/B/C/D language. For a dataviz they may be three chart types permitted by the analytical relationship.

The top candidate is selected automatically when it passes hard QA and scores best after visual critique. Future CRM UI may expose all three for manual override.

## 17. Machine sources

Canonical configuration:
- `growth/schemas/visual_system.yml`

Visual spec schema:
- `growth/schemas/visual_spec.schema.json`

Presentation package schema:
- `growth/schemas/presentation_package.schema.json`

Runtime:
- `growth/src/visual_system.py`
- `growth/src/visual_format_planner.py`
- `growth/src/presentation.py`
- `growth/src/visual_candidates.py`
- `growth/src/visual_planner.py`
- `growth/src/visual_renderer_v2.py`
- `growth/src/visual_qa.py`
- `growth/src/visual_critic.py`
- `growth/src/visual_pipeline.py`

The YAML/specs are authoritative for production rules. This document explains them for humans.
