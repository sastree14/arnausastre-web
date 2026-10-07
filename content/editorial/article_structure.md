# Article Structure

## Title

Follow one of these patterns. Adapt to the topic — do not copy literally.

- "Why most X fail in practice"
- "The hidden cost of Y"
- "What Z actually requires"
- "How companies approach X — and why it matters"
- "The difference between X and Y in practice"
- "What X tells you that Y cannot"
- "Building Z that companies actually use"
- "When X is the wrong problem to solve"

The title must make a specific, non-obvious claim — not describe a topic.

Bad: "The Importance of Demand Forecasting"
Good: "Why demand forecasting fails before the algorithm is even chosen"

---

## Excerpt

1–2 sentences. Direct and specific.

The excerpt must state the article's central argument, not describe what the article is about.

Bad: "In this article, we explore the challenges of demand forecasting in retail."
Good: "Most retail demand forecasting failures happen before any model is trained — in how the problem is defined and the data assembled. This article explains what to look for, and what it costs when it goes wrong."

---

## Opening section

The first section must make a substantive, non-obvious point immediately.

It must not:
- Restate the title or the excerpt
- Begin with "companies increasingly..." or any general industry observation
- Describe what the article will cover

It must:
- State the central argument directly, in the first or second sentence
- Establish why the conventional framing of the problem is incomplete or wrong

Do not repeat the same claim twice in the opening. State it once, precisely, then move forward.

---

## Rule 1 — No meta-labels

**This is the most important structural rule.**

Never announce a structural element before writing it.

These constructions are forbidden:

- "A concrete scenario:" followed by the scenario
- "A genuine trade-off:" followed by the trade-off
- "Operational implication:" followed by the implication
- "Recommendation:" followed by the recommendation
- "For example:" at the start of a section
- Any label that tells the reader what kind of content is coming next

The structure must exist but be invisible. A consultant does not say "here is a trade-off" before describing a trade-off. They describe it, and the reader recognises it as one.

Write each element as continuous prose. The scenario, the trade-off, the implication — they must flow naturally from the argument, not be announced.

---

## Rule 2 — Consequence chains

Every business scenario must develop the full chain:

**event → operational consequence → economic consequence → organizational consequence**

Do not stop at the anecdote. The anecdote is only useful if it shows where the cost lands and who has to deal with it.

Example of an incomplete scenario:
"A manufacturer found a transcription error two days before an FDA audit."

Example of a complete consequence chain:
"A mid-sized generics manufacturer with five production lines found a transcription error in a batch date two days before an FDA audit. Correcting it required pulling three QA specialists off their current work for 36 hours to re-validate the affected batch documentation. The correction was made in time — but the exercise revealed that the same class of error existed in four other product families, none of which were under audit. The Head of Quality spent the following month implementing an additional manual review layer, adding approximately 0.4 FTE of permanent QA capacity to a process that the company's MES could have automated in a single integration. The cost of the manual fix exceeded the cost of the automation that had been deprioritised two years earlier."

The chain must be specific enough that a reader can calculate the cost or effort implied.

---

## Rule 3 — Solution trade-offs are mandatory

No article may recommend a solution without including its costs, complexity, timeline, risks, and limitations.

A solution without downsides is not a recommendation — it is a sales pitch.

For every solution proposed, the article must address:

- **Cost and complexity**: What does implementation actually require? Skills, time, budget, integration effort?
- **Time to value**: How long before the solution produces measurable results? What happens in the meantime?
- **Risks**: What can go wrong during implementation? What does a failed or partial implementation look like?
- **Limitations**: Under what conditions does the solution not work, or work less well than expected?
- **Organisational requirements**: What has to change in how people work for the solution to function?

Example of a solution without trade-offs (not acceptable):
"Implementing automated data validation against regulatory schemas eliminates transcription errors and reduces audit preparation time."

Example of a solution with honest trade-offs (acceptable):
"Automated compliance reporting under 21 CFR Part 11 eliminates the class of transcription errors described above — but the implementation path is longer than most teams estimate. Computer System Validation for a GxP-critical system typically requires 9–18 months of documented testing before the system can be used for regulated data. During that window, the manual process continues in parallel, which means the QA team is running two systems simultaneously. A poorly validated automated system is worse than a spreadsheet: it produces records that appear compliant but are not, with an audit trail that documents the error precisely. The investment is right; the timeline assumptions almost always are not."

---

## Rule 4 — Organizational causality

When describing a problem that persists despite being well understood, explain the mechanism.

Do not state that the problem exists. State why it continues to exist given that everyone knows about it.

The mechanism is usually one of these:
- The person who owns the problem does not control the budget to fix it
- The cost of the problem does not appear in the KPIs of the person who could fix it
- The incentive structure rewards the behaviour that causes the problem
- Organisational boundaries prevent the right information from reaching the right decision-maker

This does not require naming companies or people. It requires naming roles, budgets, KPIs, and the structure that keeps them misaligned.

---

## Rule 5 — Experience must be real, not simulated

First-hand language is valuable when SC-Analytics genuinely has practical experience in the subject. Use it selectively and only where the editorial spec authorizes a first-hand register.

Allowed first-hand forms include:
- "In practice, the failure point is often..."
- "When we build forecasting systems..."
- "In model monitoring work..."
- "A pattern we repeatedly see when implementing dashboards..."

Do not invent a client, project outcome, metric, deployment, industry or implementation detail merely to sound experienced.

When the article is outside verified first-hand experience, write from professional analysis instead:
- explain the mechanism;
- use a clearly illustrative scenario;
- cite or reference evidence when needed;
- state the decision rule directly.

Authority comes from precision and judgement. It must never depend on fabricated experience.

---

## Commercial concision

The website article must feel like expert analysis written for a busy decision-maker, not a white paper.

- Most articles should land around **650–950 words per language**, but length follows the decision and the evidence, not a quota.
- A narrow comparison or single diagnostic may be shorter. A framework may be longer if each paragraph adds a distinct decision-relevant point.
- Prefer **3–6 body sections**. The number of sections should vary with the content family rather than repeat a fixed template.
- Each section should normally contain **1–2 paragraphs**. A third paragraph is acceptable only when a concrete scenario or trade-off genuinely needs it.
- Keep most paragraphs to roughly **50–100 words**. Split or rewrite dense paragraphs rather than stacking multiple ideas inside them.
- The opening should normally be **under 110 words** and make the central claim immediately.
- The closing should normally be **under 120 words** and end with a diagnostic, decision rule, or concrete question.
- Excerpts should normally be **25–40 words**.
- Delete throat-clearing, repeated framing, obvious transitions, and sentences that merely restate the previous sentence.
- Prefer one memorable business implication over three weaker supporting explanations.
- Every paragraph must earn its space by doing at least one of these: sharpen the diagnosis, quantify the consequence, expose a trade-off, explain causality, or improve the reader's next decision.

When two sentences communicate the same idea, keep the stronger one.

---

### Thesis card

The thesis card is a complete editorial idea, not a slogan. In most cases it should be **5–12 words** and fit comfortably on one or two lines. If the first summary item is too terse, combine it with the next criterion rather than leaving a three-word fragment.

The thesis card must not duplicate the article title or the closing statement verbatim. It should sharpen the framing; the closing should translate that framing into a diagnostic or decision rule.


## Body sections — format

### Subtitles

Each section: short **bold** subtitle, then 1–3 paragraphs.
Do not make every section the same length. Weight sections by importance.
Lightweight markdown only — no HTML, no ## heading levels.

### Selective emphasis

Use **bold** inside body paragraphs as a scanning aid.

The purpose is to create visual anchors for busy readers without turning the article into a highlighted document.

Bold:
- the central diagnosis or contradiction
- a quantified consequence or economically relevant figure
- an important trade-off, risk, or limitation
- the decision rule or implication the reader should remember

Guidelines:
- normally **1–3 short bold phrases per section**
- prefer phrases or one strong sentence, not entire paragraphs
- do not bold generic transitions or obvious statements
- the article should still read naturally if every bold phrase is removed
- use emphasis consistently across EN / ES / CA versions

A reader scanning only the bold phrases should be able to recover the article's core argument.


### Density

Some sections carry more weight than others. Let the content determine the length. A section that makes one precise point can be one paragraph. A section that describes a consequence chain will be longer. Uniform section length is a sign of template-following.

---

## Closing

End with a specific diagnostic, decision framework, or reframing — not a summary.

The closing must give the reader something concrete: a question to ask in their next meeting, a test to apply to their current situation, or a reframing of something they thought they understood.

Not acceptable:
"The right approach requires investment, organisational alignment, and a clear understanding of the problem."

Not acceptable:
"The question is whether your organisation is prepared to make this change."

Acceptable:
"The fastest diagnostic for a struggling forecasting system is not to look at the model — it is to sit with the planning team for one week and observe every override. If overrides are frequent and undocumented, the model is not trusted. If they are rare, the model is either genuinely good or the planners have stopped engaging with it. Both patterns are diagnostic. Neither is visible in an accuracy report."

---

## What the article should NOT be

- A textbook explanation of a concept
- A list of best practices that could be found in any industry report
- A summary of what experts generally agree on
- An article with no claims that anyone could challenge
- An article where every section is the same length and weight
- An article where the structure is announced rather than embedded in the prose


---

## Presentation variability

The website shell is consistent, but the article must not feel machine-stamped.

The 30-second summary is adaptive:
- 1 item: one strong thesis / statement;
- 2 items: a direct comparison;
- 3 items: a compact decision triad;
- 4 items: a diagnostic or failure-mode matrix;
- 5–6 items: a framework or sequence;
- up to 8 items only when each item earns its place.

Do not force the article into three cards.

Body structure should also follow the family:
- point of view: thesis → evidence → implication;
- comparison: alternatives → criteria → trade-offs → decision rule;
- failure mode: symptom → mechanism → consequence → correction;
- decision guide: signals → thresholds → constraints → recommendation;
- framework: steps → requirements → limitations → application;
- diagnostic: observable signals → tests → interpretation → next action.

The visual template remains recognisable. The narrative should not.
