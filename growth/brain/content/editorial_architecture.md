# SC-Analytics — Editorial Architecture

This document is the canonical editorial architecture for SC-Analytics.

It defines what SC-Analytics may talk about, how topic entities are interpreted, which sources may be used for real project claims, and how editorial subject matter remains independent from channel, format and visual design.

The GitHub version of this document is the machine-readable source used by the growth/editorial system. The Google Drive document with the same title is a human-readable mirror. They must stay aligned.

## 1. Core operating principle

SC-Analytics uses one editorial system with multiple outputs.

The system must decide in this order:

1. What are we talking about?
2. What is the useful angle?
3. What evidence or project facts support it?
4. How should it be structured?
5. How should it be represented visually?
6. Where should it be published?

Do not start from a channel or a template.

A topic is not a post. A project is not a post. A technology is not a post. They are source material from which a defensible editorial angle can be developed.

## 2. Project truth source

Real SC-Analytics projects must never be invented.

Canonical project source:

- Repository: `sastree14/Portfolio_SC_Analytics`

When public content refers to an SC-Analytics project, client outcome, metric, implementation, tool, architecture, lesson or result, the factual basis must come from that repository or from another explicitly approved evidence source.

The editorial system may:

- select a real project;
- extract a business problem, architecture, method, tool, metric, trade-off or lesson;
- adapt the narrative to LinkedIn, the website, a marketplace or GitHub;
- anonymise information when required;
- create multiple editorial angles from the same project.

The editorial system must not:

- invent projects;
- invent client results;
- invent tools or methods used in a project;
- infer a metric that is not documented;
- transform a public-source example into an SC-Analytics client claim.

A single project can produce many content pieces. The project remains the evidence source; each content piece is a separate interpretation or communication layer.

## 3. Editorial pillars

Every primary content idea should belong to one of these seven pillars.

### 3.1 Projects & Proof

Real work, systems, implementations, lessons and outcomes grounded in the SC-Analytics portfolio.

Typical material:

- project architecture;
- business problem;
- implementation choices;
- model or method selection;
- trade-offs;
- metrics and results;
- lessons learned;
- before/after operating model;
- reusable technical or business insight.

Primary evidence source: `Portfolio_SC_Analytics`.

### 3.2 Industries & Use Cases

Business problems and decision opportunities where data science, analytics, AI, optimisation or decision systems can create value.

Examples include logistics, retail, e-commerce, manufacturing, banking, insurance, financial services, healthcare, pharma, telecom, energy, hospitality, transportation, professional services, SaaS and other relevant sectors.

The industry is context, not the idea itself.

Prefer a concrete operating or economic problem over generic content such as "how data science helps logistics".

### 3.3 Data Science Explained

Concepts and distinctions explained in a way that helps a business or technical decision.

Examples:

- Data Science vs Data Analysis;
- AI vs Machine Learning;
- forecasting vs prediction;
- dashboard vs decision system;
- automation vs AI agent;
- correlation vs causality;
- optimisation vs simulation.

Avoid textbook definitions. Explain what changes in practice, when the distinction matters and what decision it affects.

### 3.4 Models, Methods & Decision Science

Models, algorithms and quantitative methods used to describe, predict, simulate, optimise, measure risk or support decisions.

The universe is intentionally broad and extensible.

Subdomains include:

- statistics and probability;
- regression and classification;
- time series and forecasting;
- ARIMA, SARIMA, ETS, VAR, state-space and related models;
- machine learning;
- deep learning;
- tree-based models, boosting, SVMs and clustering;
- anomaly detection;
- Monte Carlo simulation;
- discrete-event and scenario simulation;
- optimisation and operations research;
- linear programming, MILP and nonlinear optimisation;
- routing, scheduling, assignment and facility-location problems;
- Value at Risk, Expected Shortfall and stress testing;
- portfolio and risk models;
- Markov models;
- queueing;
- game theory;
- causal inference and experimentation;
- reinforcement learning;
- other relevant analytical or decision methods.

A method may be explained, compared, challenged, connected to a use case or linked to a real project.

### 3.5 Technology, Platforms & Business Systems

Tools and systems that matter to analytics, AI, planning, data infrastructure, automation and business operations.

This pillar is not limited to tools currently used by SC-Analytics.

SC-Analytics may discuss a technology that is not present in the portfolio when the content is based on reliable research and does not imply first-hand implementation experience that does not exist.

Subdomains include:

- cloud: AWS, Microsoft Azure, Google Cloud and related services;
- databases, warehouses and data platforms: PostgreSQL, Supabase, Oracle, ClickHouse, Snowflake, BigQuery, Redshift, Databricks and others;
- analytical languages and environments: Python, R, SQL, MATLAB, Julia and others;
- BI and visualisation: Power BI, Tableau, Looker, Qlik, R Shiny, Streamlit and others;
- planning, EPM and CPM: Anaplan, SAP Analytics Cloud, Board, Oracle EPM, Workday Adaptive Planning and others;
- ERP and enterprise systems: SAP, Oracle, Microsoft Dynamics, NetSuite, Odoo and others;
- automation and orchestration: Prefect, Airflow, GitHub Actions, n8n, Make, Zapier and others;
- AI and ML platforms: OpenAI, Anthropic, Azure AI, Vertex AI, AWS Bedrock, Hugging Face, MLflow and others.

This list is illustrative, not exhaustive.

### 3.6 Data & AI Today

Current developments in data, analytics, AI, software, regulation, infrastructure and business adoption.

The news is not the content.

A current event should only become content when SC-Analytics can identify a useful implication, trade-off, decision or business consequence.

Possible output: publish, research more or ignore.

### 3.7 Consulting & Decision Insights

The business and organisational layer around analytical work.

Examples:

- why analytics projects fail;
- when not to build machine learning;
- build vs buy;
- implementation scope and MVP design;
- ROI and measurement;
- adoption after go-live;
- governance;
- ownership;
- incentives;
- KPI design;
- data quality;
- process redesign;
- automation prioritisation;
- decision latency;
- operating-model bottlenecks;
- when a dashboard is the wrong solution.

This pillar should make SC-Analytics sound like a consultancy that understands operating decisions, not only technology.

## 4. Topic entities are not editorial angles

The system must separate the subject from the way it is discussed.

Examples of topic entities:

- AWS;
- Azure;
- SARIMA;
- XGBoost;
- Monte Carlo;
- Value at Risk;
- Anaplan;
- SAP;
- Supabase.

An entity alone is not a publishable idea.

A useful idea combines an entity with an angle, a business question or another entity.

Examples:

- AWS vs Azure for a small analytics team;
- ARIMA vs XGBoost for demand forecasting;
- when Monte Carlo simulation is useful in business planning;
- what Value at Risk tells you and what it does not;
- Anaplan vs SAP Analytics Cloud for different planning problems;
- PostgreSQL vs Supabase for different operating requirements.

Cross-category comparisons are allowed and encouraged when they help a real decision.

## 5. Content families

A content family is the primary narrative structure of a piece. It is not the topic, channel, visual style or commercial objective.

The canonical v2 families are:

### 5.1 Explain / Understand — `explain_understand`

Use when the purpose is to make a concept, distinction or mechanism understandable in a way that improves a decision.

Typical structure:

Concept or confusion → mechanism → why it matters → practical implication.

Examples:

- What Value at Risk actually measures.
- Data Science vs Data Analysis in practice.
- What SARIMA captures that a generic regression does not.

Avoid textbook definitions that do not change a decision.

### 5.2 Compare — `compare`

Use when two or more approaches, tools, methods or operating choices need to be contrasted.

Typical structure:

Decision context → comparison criteria → trade-offs → conditions where each option fits.

Examples:

- Azure vs AWS for an analytics team.
- ARIMA vs XGBoost for demand forecasting.
- Anaplan vs SAP Analytics Cloud.

A comparison should help a real choice; it should not become a feature checklist with no conclusion.

### 5.3 Decision Guide — `decision_guide`

Use when the reader needs a rule for choosing whether, when or how to use something.

Typical structure:

Decision → conditions → trade-offs → decision rule → practical next step.

Examples:

- When Monte Carlo is worth the additional complexity.
- When not to use machine learning.
- When a company should move beyond Excel for planning.

### 5.4 Diagnose — `diagnose`

Use when the purpose is to identify symptoms, root causes or signals that reveal a deeper operating problem.

Typical structure:

Observed symptom → diagnostic mechanism → root cause → test or question to validate it.

Examples:

- Signs a forecasting system is not trusted.
- Why a reporting process can look functional while remaining operationally broken.

### 5.5 Failure Modes & Mistakes — `failure_modes_mistakes`

Use when the value comes from showing how implementations, models, processes or decisions fail in practice.

Typical structure:

Common approach → failure mechanism → consequence → prevention or better decision rule.

Examples:

- Why ML projects fail after deployment.
- Common mistakes in planning implementations.
- Why bad assumptions make Monte Carlo look more sophisticated than it is.

### 5.6 Framework / Playbook — `framework_playbook`

Use when SC-Analytics can give the reader a reusable sequence, evaluation model or operating framework.

Typical structure:

Decision problem → framework → stages/criteria → application → limitations.

Examples:

- How to evaluate a forecasting system.
- A practical data-maturity framework.
- A framework for deciding what to automate first.

### 5.7 Case / Project Proof — `case_project_proof`

Use for approved real work grounded in `Portfolio_SC_Analytics`.

Typical structure:

Business problem → constraints → reasoning → system/solution → evidence/result → reusable lesson.

The project is the evidence source. Never invent project facts, metrics, tools or outcomes.

### 5.8 System / Architecture — `system_architecture`

Use when understanding how components interact is the main value.

Typical structure:

Inputs → data/process layer → logic/models → decision/application layer → outputs/feedback.

Examples:

- A forecasting-to-inventory decision architecture.
- How an Azure analytics stack can be structured.
- How CRM, delivery, finance and metrics connect in an operating system.

### 5.9 Evidence / Measurement — `evidence_measurement`

Use when the central question is what the data shows or how success should be evaluated.

Typical structure:

Question → evidence/metric → interpretation → trade-off → decision implication.

Examples:

- Forecast accuracy vs inventory cost.
- Which metrics actually show decision quality.
- Model performance vs business performance.

### 5.10 Transformation — `transformation`

Use when the value comes from showing a change in an operating model, process or decision system.

Typical structure:

Before → friction/cost → intervention → after → measurable or operational difference.

Examples:

- Manual reporting → connected decision system.
- Fragmented workflow → automated exception-based process.

### 5.11 Current Development / Implication — `current_development_implication`

Use for current events, releases, regulation or market changes when there is a meaningful implication for operators.

Typical structure:

Development → what actually changed → business implication → trade-off → practical takeaway.

The news is not the content. Reject pieces that merely repeat an announcement.

### 5.12 Point of View / Contrarian — `point_of_view_contrarian`

Use when SC-Analytics has a clear, defensible position that challenges a common assumption or reframes a decision.

Typical structure:

Common belief → position → reasoning → boundary conditions → implication.

Examples:

- Most companies do not need AI agents for every workflow.
- A dashboard is often the wrong solution.
- More model complexity does not guarantee a better decision.

Contrarian does not mean provocative for engagement. Nuance and evidence are mandatory.

### Retired v1 families

The following v1 labels should not be used as primary families in new content:

- `educational`: too broad; map to Explain, Decision Guide, Framework or another specific family.
- `insight`: too vague; every strong piece should contain an insight.
- `opinion`: map to Point of View / Contrarian.
- `contrarian`: map to Point of View / Contrarian.
- `current_affairs`: map to Current Development / Implication.
- `case`: map to Case / Project Proof.
- `commercial`: commercial intent is an objective, not a narrative family.

Legacy content may retain old labels for historical compatibility, but new generation uses the v2 families.

## 6. Editorial angles

An angle is the specific lens applied to a topic inside a content family.

Families are controlled. Angles are deliberately open and extensible.

Useful recurring angles include:

- when to use;
- when not to use;
- X vs Y;
- why it fails;
- common mistakes;
- hidden cost;
- trade-offs;
- limitations;
- risks;
- what actually matters;
- what people misunderstand;
- myth vs reality;
- simple vs complex;
- build vs buy;
- manual vs automated;
- traditional vs modern;
- model vs business outcome;
- technical vs business perspective;
- short term vs long term;
- small company vs large company;
- prototype vs production;
- implementation;
- adoption;
- ROI / economic impact;
- measurement;
- decision quality;
- scalability;
- cost;
- time to value;
- maturity level;
- industry lens;
- project lens;
- executive lens;
- technical lens;
- what changed;
- what comes next.

Do not create a new content family merely because a new angle appears.

Examples:

- Topic: Monte Carlo simulation; family: Decision Guide; angle: when to use / complexity proportionality.
- Topic: Azure + AWS; family: Compare; angle: cost, ecosystem and company context.
- Topic: SARIMA + XGBoost; family: Compare; angle: classical time series vs machine learning.
- Topic: Anaplan; family: Failure Modes & Mistakes; angle: implementation complexity.
- Topic: Value at Risk; family: Explain / Understand; angle: what it measures vs what it misses.

A canonical content idea should therefore be representable as:

`pillar + topic entity/entities + family + angle + business question + thesis + evidence`.

## 7. Editorial diversity

Diversity should come from combining pillars, entities, industries, methods, tools, business problems and angles — not from creating dozens of top-level pillars.

The system should avoid becoming dominated by one fashionable category such as generative AI.

The portfolio is an important source of ideas, but it is not the boundary of the editorial universe.

Likewise, public research can expand the editorial universe, but it cannot be used to fabricate SC-Analytics experience.

## 8. Independent dimensions

These dimensions must remain separate:

- Editorial pillar: what domain the idea belongs to.
- Topic entity: the specific method, technology, industry, project or business problem.
- Editorial angle/content family: how the idea is framed.
- Content structure: how the argument is developed.
- Visual format: how the idea is represented.
- Visual language: the SC-Analytics visual system applied to it.
- Channel: where it is published.

Do not use one dimension as a substitute for another.

For example:

- "comparison" is not an editorial pillar;
- "LinkedIn" is not a visual style;
- "Dataviz" is not a topic;
- "AWS" is not a content family;
- "Technical Blueprint" is not a channel.

## 9. Current output channels

The common editorial system may feed:

- Arnau personal LinkedIn;
- SC-Analytics LinkedIn;
- SC-Analytics website articles;
- SC-Analytics website project/case-study pages;
- marketplaces and external portfolio surfaces;
- GitHub/portfolio documentation and visual assets.

Not every approved idea should be adapted to every channel.

Channel selection happens after the canonical content idea is defined.

## 10. Current visual layer

The visual system is a separate layer from the editorial taxonomy.

Current reusable visual families include:

- Carousel / Diagnostic;
- Dataviz;
- Architecture / Diagram;
- Before / After.

Current visual languages include:

- A — Dark Editorial;
- B — Off-White Executive;
- C — Technical Blueprint;
- D — Analytical Report.

The final mapping rules between editorial angles, visual families and channels are defined separately as the system evolves.

## 11. Source hierarchy

Use the most authoritative relevant source for each type of claim.

1. Real SC-Analytics project facts: `Portfolio_SC_Analytics`.
2. SC-Analytics positioning, principles, voice and strategy: `growth/brain/`.
3. Current external facts: reliable public sources with provenance.
4. Mutable editorial state, briefs, approvals and metrics: Supabase.
5. Human-facing strategic mirror: Google Drive.

Google Drive is not an independent competing taxonomy. It mirrors the canonical architecture and may contain historical planning material.

## 12. Historical material

Previous topic banks, spreadsheets, taxonomies and content lists may remain available as historical idea sources.

They must not override this architecture.

If an older document conflicts with this file, this file governs the v2 editorial system until it is intentionally revised.


## 13. Canonical content model

The canonical editorial taxonomy in this file classifies ideas.

The structured content object used before channel rendering is defined separately in:

- `growth/brain/content/canonical_content_model.md`

Machine validation contract:

- `growth/schemas/canonical_content_object.schema.json`

The canonical content object must be created before channel-specific copy, CTA wording or visual rendering decisions are treated as final.
