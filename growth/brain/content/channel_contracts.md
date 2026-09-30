# SC-Analytics — Channel Contracts

This document defines how one Canonical Content Object is adapted to each publication surface.

The canonical idea remains unchanged. The channel contract decides what to emphasize, how much depth to expose, and what the natural commercial next step is.

## Core rule

One content object can produce multiple outputs, but outputs are not copies of each other.

Each output must preserve:

- the canonical thesis;
- the evidence and uncertainty;
- the Commercial Spine;
- the target buyer;
- the project provenance policy when project proof is used.

Each output may change:

- title and hook;
- narrative order;
- amount of technical detail;
- CTA wording;
- visual specification;
- length;
- proof depth.

## 1. LinkedIn post

Purpose: executive discovery, authority and qualified commercial interest.

Primary reader: CEO, COO, CFO, business leader or functional owner. Technical readers are secondary.

Narrative contract:

1. Buyer problem or recognisable operating symptom.
2. Business consequence.
3. SC-Analytics point of view or decision rule.
4. Useful framework, comparison, proof or project insight.
5. Business meaning.
6. Natural next step when justified.

Rules:

- business value first;
- no feature dump;
- no long technology list;
- no textbook opening;
- no generic motivational hook;
- no forced hard-sales CTA;
- technical depth should be optional, not required to understand the post;
- for project-led content, link conceptually to the case study or technical proof rather than reproducing the README.

A reader should understand why the subject matters even if they never open the technical implementation.

## 2. LinkedIn article

Purpose: founder-led long-form authority with more reasoning than a post but less website structure than a permanent reference article.

Contract:

- strong business thesis;
- clear sections;
- evidence and trade-offs;
- SC-Analytics judgement;
- practical implication;
- natural commercial adjacency;
- no SEO padding;
- no copy-paste of the website article.

## 3. Website article

Purpose: durable authority, search/reference value and conversion.

Narrative contract:

1. Hero / title and executive thesis.
2. Business context and problem.
3. Analysis or explanation.
4. Evidence.
5. Framework, comparison, architecture or method when relevant.
6. Implications for the buyer.
7. Practical takeaway.
8. Contextual commercial conversion block.

Rules:

- the article must be useful as a standalone reference;
- technical depth is allowed when it serves the decision;
- evidence must remain attributable;
- the conversion block should connect to a service, project or conversation naturally;
- do not turn the article into a sales landing page.

## 4. Website project / case study

Purpose: demonstrate that SC-Analytics can solve a class of business problem and provide a bridge from executive value to technical proof.

Narrative contract:

1. Executive hero.
2. Business problem.
3. Business consequence.
4. What was built.
5. Architecture.
6. Approach and key decisions.
7. Evidence / results.
8. Transformation or operating value.
9. Technical overview.
10. Business takeaway.
11. Explore technical implementation.
12. Relevant service / conversation next step.

Project rule:

- `Portfolio_SC_Analytics` is the factual and technical source of truth;
- the website is the business/technical case-study layer;
- the case study must never invent a client, metric or deployment state;
- when the project manifest says `client_claim_allowed: false`, describe it as portfolio implementation/capability proof, not named client work.

The case study should be understandable by a CEO and credible to a technical reviewer.

## 5. Marketplace project

Purpose: fast capability proof for a buyer evaluating whether SC-Analytics can perform similar work.

Narrative contract:

1. Problem.
2. What we built.
3. Business value / decision supported.
4. Evidence or result.
5. Relevant stack.
6. Proof link or technical depth when the marketplace permits it.

Rules:

- concise;
- proof-heavy;
- no generic company biography;
- no unsupported client language;
- technology appears as evidence of fit, not as the headline;
- optimize for the buyer asking: "Can this team build what I need?"

## 6. GitHub / Portfolio

Purpose: technical proof, inspection and reproducibility.

This is not a marketing renderer.

The portfolio should expose:

- architecture;
- implementation;
- technologies;
- code;
- validation;
- metrics;
- examples;
- limitations;
- principal execution path.

The editorial system points technical readers here rather than forcing technical depth into executive content.

## Commercial hierarchy

Across public outputs, prefer:

```text
Buyer problem
→ Business consequence
→ SC-Analytics judgement
→ Solution / framework
→ Proof
→ Optional technical depth
→ Natural next step
```

The amount of detail changes by channel; the commercial logic does not.

## Source hierarchy for project-led content

```text
LinkedIn
Executive discovery
        ↓
Website project
Business + technical case study
        ↓
Portfolio_SC_Analytics
Technical/factual proof
```

## Visual relationship

Channel contracts do not choose a final visual language.

They may specify visual needs or semantics. The separate visual decision layer chooses:

- Carousel / Diagnostic;
- Dataviz;
- Architecture / Diagram;
- Before / After;
- Project Visual;
- Text-only;

and then visual language A/B/C/D.

Do not embed visual-style decisions into the canonical content object or channel contract.
