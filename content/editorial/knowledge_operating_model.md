# SC-Analytics Knowledge — Operating Model

## Purpose

The Knowledge bank is a controlled editorial asset, not an autoblog.

The 200 canonical article families live in `content/article-bank`. Each family has ES, CA and EN variants. Articles are reviewed privately before they can enter the publication queue.

## Publication states

1. **Canonical bank / private preview**
   - source: repository JSON;
   - visible only inside `/growth-admin/articles`;
   - does not require Supabase publication state;
   - never appears in the public sitemap or public Knowledge routes.

2. **Needs review**
   - materialized in Supabase as `needs_review`;
   - no publication date;
   - approval remains `pending`.

3. **Approved / scheduled**
   - only after human review;
   - the three language variants form one family;
   - a publication slot is assigned from the editorial order.

4. **Published**
   - publisher changes all three language variants to `published`;
   - `published_at` is set;
   - public Knowledge routes become available;
   - sitemap/public fetch sees the family.

Do not publish and then hide an article. A staged article should remain non-public until the publication state changes.

## Adaptive article presentation

The website shell stays consistent: hero, 30-second summary, sticky contents, body, business implication and next actions.

The 30-second summary changes by content family:

- `point_of_view_contrarian` → one strong thesis statement;
- `compare` → two-column comparison by default; true three-way comparisons use a triad;
- `decision_guide` → three decision anchors;
- `failure_modes_mistakes` → four-card matrix;
- `framework_playbook` → five-item framework;
- `diagnose` → four diagnostic signals;
- `evidence_measurement` → three evidence anchors;
- `system_architecture` → four architecture anchors.

The renderer supports 1–8 items. The article does not need a unique page design; the content determines the layout.

## Service mapping

Every article leads to a service family before the generic contact CTA.

- Forecasting & Planning → `/services#forecasting-planning`
- Inventory & Supply Chain → `/services#optimisation`
- Optimization & OR → `/services#optimisation`
- Machine Learning → `/services#machine-learning`
- AI & Automation → `/services#ai-automation`
- Analytics & Decision Intelligence → `/services#analytics-bi`
- Data Engineering & Architecture → `/services#analytics-bi`
- Cloud & Platforms → `/services#analytics-bi`
- Finance, Risk & Pricing → mapped by topic to forecasting, machine learning or simulation/modelling
- Simulation & Business Systems → mapped by topic to simulation, analytics, planning or AI

A case study is optional. A service destination is mandatory.

## Editorial publication order

The canonical sequence groups articles by cluster. The publication sequence deliberately does not.

The first pass interleaves all ten clusters so the public Knowledge feed does not publish twenty consecutive articles on the same subject.

Within each 20-article cluster, the local order is:

`1, 5, 9, 13, 17, 4, 8, 12, 16, 20, 2, 6, 10, 14, 18, 3, 7, 11, 15, 19`

This means:
- publish one anchor from each sub-arc first;
- then publish decision/framework endings;
- then deepen with supporting analysis and comparisons.

The first 20 publication slots therefore are:

1. KB-001 · Forecasting & Planning
2. KB-021 · Inventory & Supply Chain
3. KB-041 · Optimization & OR
4. KB-061 · Machine Learning
5. KB-081 · AI & Automation
6. KB-101 · Analytics & Decision Intelligence
7. KB-121 · Data Engineering & Architecture
8. KB-141 · Cloud & Platforms
9. KB-161 · Finance, Risk & Pricing
10. KB-181 · Simulation & Business Systems
11. KB-005 · Forecasting & Planning
12. KB-025 · Inventory & Supply Chain
13. KB-045 · Optimization & OR
14. KB-065 · Machine Learning
15. KB-085 · AI & Automation
16. KB-105 · Analytics & Decision Intelligence
17. KB-125 · Data Engineering & Architecture
18. KB-145 · Cloud & Platforms
19. KB-165 · Finance, Risk & Pricing
20. KB-185 · Simulation & Business Systems

This order is editorially final enough to review and preview. Quantitative search-demand data can later adjust priority without changing the underlying architecture.

## Experience register

SC-Analytics may use restrained first-hand language where real practical experience exists: forecasting/demand, ML, scoring/risk, AI agents/automation, dashboards/CMI, reporting and planning systems.

Never invent:
- a client;
- a metric;
- a project outcome;
- a deployment;
- an industry-specific implementation.

Where direct experience is not established, write as analysis and judgement.

## SEO model

SEO is built around:
- one clear search intent per article;
- native title/description per language;
- canonical localized URLs;
- `hreflang`/language alternates and x-default;
- crawlable contextual links to related analysis;
- direct service links;
- Article structured data;
- public sitemap only after publication.

The internal `seo_keywords` arrays are editorial metadata. They are not emitted as a ranking mechanism.

Quantitative keyword volume/difficulty and SERP competition should be added from Semrush when API units are available.


## CMI review and activation

The CMI now exposes the canonical Knowledge bank at `/growth-admin/articles`.

Review workflow:

1. Open any article family.
2. Switch between ES, CA and EN in the same preview.
3. Review the exact public renderer, including the article-specific 30-second summary layout.
4. Approve the whole ES/CA/EN family in one action, or mark the family for changes.
5. An approved family remains private. Approval alone never publishes it.
6. Either schedule that family from its preview or wait until all 200 families are approved.
7. When all 200 are approved, the bank page unlocks the gated bulk scheduler. The operator chooses the first local publication time and cadence; the system applies the predefined editorial order to all families.
8. The due publisher only publishes rows whose status is `scheduled` and whose scheduled time has arrived.

This deliberately separates four concepts that must not be conflated:

`reviewed` → `approved` → `scheduled` → `published`

There is no "publish everything and hide it" phase.
