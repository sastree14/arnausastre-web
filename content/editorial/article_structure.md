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

The title must make a specific claim or promise that is not obvious.

Bad: "The Importance of Demand Forecasting"
Bad: "Understanding Machine Learning in Business"
Good: "Why demand forecasting fails before the algorithm is even chosen"
Good: "The hidden cost of route optimisation that never appears on a P&L"

## Excerpt

1–2 sentences. Direct and specific.

The excerpt must state the central argument of the article, not describe what the article is about.

Bad: "In this article, we explore the challenges of demand forecasting in retail."
Bad: "Forecasting is critical for modern businesses."
Good: "Most retail demand forecasting failures happen before any model is trained — in the way the problem is defined and the data is assembled. This article explains what to look for and what it costs when it goes wrong."

## Opening section

The first section must make a substantive, non-obvious point immediately.

It must not:
- Restate the title
- Describe what the article will cover
- Begin with a general statement about the industry

It must:
- State the central argument directly
- Establish why the conventional framing of the problem is incomplete or wrong
- Give the reader an immediate reason to keep reading

## Body sections

### Format

Each section: short **bold** subtitle, then 1–3 paragraphs.
Do not make all sections the same length. Weight the sections by importance.
Lightweight markdown only — no HTML, no heading levels (no ##).

### Required elements (at least one of each)

**1. A concrete business scenario**

Must be specific enough to be recognisable. Can be anonymised.

Format: [type of company] + [specific size or context] + [concrete situation] + [what happened or what was at stake]

Not acceptable:
"A mid-size retailer found that their forecast accuracy was poor."

Acceptable:
"A grocery chain with 340 stores and a 90,000-SKU assortment was running a weekly S&OP process where 60% of planner time was spent correcting the system's output on promotional items — items that represented 12% of SKUs but 38% of revenue. The forecast wasn't wrong on average. It was systematically wrong on the items that mattered most."

**2. A genuine trade-off**

Not "X has benefits and challenges."
A trade-off is: doing X produces Y, and Y creates Z, which means a specific person or process has to handle something they might not be prepared for.

Not acceptable:
"Prediction intervals are useful but can be complex."

Acceptable:
"Prediction intervals solve a real problem — they communicate that a forecast of 1,200 units might be anywhere from 900 to 1,500. But in practice, sales and operations teams trained on point forecasts don't know what to do with a range. They either ignore the interval and use the midpoint, or they lose confidence in the system entirely. The technical solution is correct; the organisational change required to make it useful is where most implementations stall."

**3. An operational implication**

What does this mean for a specific person in a specific situation?

Not acceptable:
"Organisations should invest in better data infrastructure."

Acceptable:
"For a planning team running a weekly S&OP cycle, this means the model retraining schedule needs to be aligned with the planning horizon — not with data engineering convenience. Retraining monthly when the planning cycle is weekly means the model is always catching up. In seasonal businesses, this gap is where the most expensive errors occur."

**4. A recommendation that is specific enough to be wrong**

Vague recommendations are useless. A recommendation is only useful if someone could follow it and verify whether it worked.

Not acceptable:
"Companies should focus on data quality before model complexity."

Acceptable:
"Before selecting a forecasting model, map every data source to the decision it supports. If you cannot draw a line from a data field to a specific planning decision, the field is probably not improving forecast quality — it is adding noise. In our experience, most demand forecasting datasets can be reduced to 40-60% of their features with no meaningful loss in accuracy, and a significant gain in model stability."

## Closing

End with a specific insight or decision framework — not a summary.

The closing must give the reader something to do or think about, not confirm what they already read.

Not acceptable:
"Forecasting is complex, but with the right approach, companies can achieve significant improvements."

Not acceptable:
"The question is whether your organisation is ready to take this seriously."

Acceptable:
"The fastest diagnostic for a struggling forecasting system is not to look at the model — it is to sit with the planning team for one week and observe every time they override the system output. If overrides are frequent, the model is not trusted. If they are infrequent, the model is either genuinely good or the planners have stopped engaging with it. Both patterns tell you something. Neither is visible in an accuracy report."

## What the article should NOT be

- A textbook explanation of a concept
- A list of best practices anyone could find in a Google search
- A summary of what experts generally agree on
- An article that would fit equally well on any analytics consultancy's blog

The article should be recognisably SC-Analytics: specific, opinionated, grounded in operational reality, and more interested in how to think about a problem than in appearing comprehensive.
