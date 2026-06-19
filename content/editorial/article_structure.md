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

## Rule 5 — Practical experience register

At least one section must read as if it comes from direct project experience.

The register is: "this is what we have seen repeatedly across multiple engagements" — not "this is what the literature says" or "this is theoretically possible."

Markers of this register:
- Specific failure modes, not general risk categories
- Resistance patterns that arise at a particular stage (during scoping, at go-live, three months after deployment)
- Decisions that people routinely make incorrectly, and the specific reason they make them
- The gap between what the implementation plan says and what happens in practice

---

## Body sections — format

### Subtitles

Each section: short **bold** subtitle, then 1–3 paragraphs.
Do not make every section the same length. Weight sections by importance.
Lightweight markdown only — no HTML, no ## heading levels.

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
