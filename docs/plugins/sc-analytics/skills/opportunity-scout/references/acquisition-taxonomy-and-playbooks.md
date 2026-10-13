# SC-Analytics — Acquisition research taxonomy and contact playbooks
Updated 2026-10-13. Authoritative extension to the current commercial-operating-policy.md, not a replacement.

## Core instruction: search by demand, not a small predefined service list
The user should not have to repeat all acquisition lanes in each chat. Unless a search is explicitly scoped, interpret requests like "buscar oportunidades / empresas / partners / clientes / LinkedIn / freelancers" as a multi-lane commercial-research workflow; ask no follow-up just because the desired lane is broad. Rank and surface the most credible sublanes, not an indiscriminate scrape. Expand or narrow according to explicit user criteria.

Canonical lanes:
1. Direct clients in traditional operational firms: accounting/finance/FP&A, multi-location restaurants, healthcare operations, education, property management, B2B services, manufacturers, logistics and distribution, energy, SMEs with administrative complexity. Operational needs are hypotheses unless proven by named buyer. No assumption that they lack an internal team.
2. Referral partners: agencies, boutiques, advisors, integrators with customer access but complementarity beyond their core.
3. Technical or capability partners: ERP/CRM/BI/software studios with specific quantitative gaps in optimization, OR, simulation, forecasting or statistical modeling. Recognize existing competence, never pitch their own advertised service back at them.
4. Delivery partners / subcontractor networks: firms that actually supply end clients/projects to qualified providers; distinguish from vendor programs expecting SC-Analytics to bring a customer or resell software.
5. LinkedIn explicit freelance/contract/B2B jobs: Python, ML, AI, agents, automation, data engineering, BI, forecasting, mathematical optimization, OR, applied finance; prioritize Spain/EEA, plausible remote options. Check the opening and eligibility; keep immutable LinkedIn job ID, publication date, closure status and source. Match individual-versus-team requirement.
6. LinkedIn hiring alternative: firm seeking employees rather than a freelance. Clearly label external delivery as unconfirmed alternative, not express freelance demand.
7. Historical freelance buyers, consultancies and recruiters: find repeated contract postings or prior freelancer engagements; do not assert an actual engagement merely from a job ad. Keep closed ads as history and point to company/recruiter for future placements, not as open jobs.
8. Upwork and other marketplaces for external specialist work; protect against duplicate jobs, prior submissions and client restrictions.
9. Public RFP/procurement and explicit implementation-partner or supplier onboarding programs, subject to jurisdiction/eligibility.
10. Commercial signals: funding, operational expansions, new facilities, acquisition integration, hiring for process bottlenecks, international expansion, compliance/reporting changes, fragmented workflows, data transformation.
11. PE/search funds, M&A advisers, vertical SaaS/software implementers and channel brokers who may open multiple end clients.
12. Existing CMI records never contacted: periodically re-qualify on fit/current signals before continually adding new firms; do not label uncontacted as new.

CMI display facets should use existing company relationship_type enum: direct_client, hiring_alternative, referral_partner, technical_partner, delivery_partner, unknown. LinkedIn B2B / freelance is a SOURCE / OPPORTUNITY facet, not a new company relationship_type value. A company may have multiple LinkedIn jobs but one canonical company identity. Research source is distinct from contact channel.

## Non-negotiable exclusion: confidential/NDA-provided examples
When the user supplies leads, company names, contacts, application forms or submissions from an intermediary under NDA, use them only to infer anonymized, aggregated industry, company size, buyer role, recurring workflow, buying signal and offer patterns. Never use any named entities, domains, names, emails, URLs or other identifiers from that confidential source for outreach, independent re-contact, CMI import, prospecting seed matching, direct prospect recommendations or dedup lists. Do not expose or reuse those identities in any outbound action. Search for independent organizations through public sources, with distinct provenance.

## Proof standard and prioritization
For every surfaced new company/job provide (when obtainable): canonical domain/name, sector, rough size, country, factual evidence (dated URL), signal (explicit vs inferred), gap *outside their core*, proposed SC-Analytics offering, decision-maker role, verified public contact method + link, recommended approach, next step, contact status, risk, score and confidence. Do not invent missing emails or phone numbers. Rank practical SME buyers with meaningful volume and economic case; a five-person operation may have no viable budget even with a good use case.

Use source freshness. LinkedIn public listings with an Apply button are not proof applications remain open for that account. Explicitly closed jobs must never be recommended as open applications. An employer named in a recruiter ad may be confidential: do not invent the end client.
Deduplicate against full CMI by canonical domain; separate opportunity by platform and stable job ID; persist surfaced qualified matches; preserve uncontacted, contacted, rejection and do-not-contact state.

## Per-company expert next-action decision tree
A. Existing warm correspondence, booked meeting or requested proposal: continue existing thread, read latest response and date; do not pitch cold.
B. Explicit job is open and requires formal apply: evaluate exact qualifications, individual/team fit and eligibility; apply through the official job workflow. A LinkedIn connection may be a secondary relationship action, never a substitute for required application.
C. Official supplier/partner registration: use official program first; if program requires you to bring a customer, label reseller/byo-client, not project-originating partner.
D. Direct operational SME with verified phone and named department: phone gatekeeper to ask for finance/operations buyer; use neutral process hypothesis and ask 30-minute discovery; if unable to reach, follow with concise personalized professional email.
E. B2B professional service: published work email to founder/head of operations, or a call if only front desk. Distinguish sales inquiry from customer service.
F. Technical partner: leader of solutions/delivery/partnerships, narrow specific capability outside advertised core; ask whether they need specialist input on a project; no generalized IA/analytics pitch.
G. Recruiter/staffing: job/recruiter first; prove qualifications and rate availability; discuss recurring contract supply, not referral commissions.
H. LinkedIn person without existing direct contact: brief connection referencing a factual shared opportunity; do not assume invitation accepted; after accepted, short no-pressure message or direct email if company publishes a better channel.
I. Prior explicit rejection, NDA/protected identity or do_not_contact: no contact. Historical closed jobs: company/recruiter research only.

For every selected high-priority prospect, supply an outreach action card:
- primary channel with rationale and exact source (phone + role, verified email, LinkedIn named person's URL, partner portal, application URL);
- backup channel;
- one or two company-specific evidence-led opening sentences;
- realistic 30-minute CTA;
- call script or concise email/LinkedIn draft when helpful;
- time/sequence of follow-up only as a recommendation, not scheduled unless user asks;
- caveats such as current team already does X, job closed, no company budget confirmed, procurement constraints.

Suggested phone script: "Hola, soy Arnau de SC-Analytics, consultora especializada de Barcelona. He visto que [public, verifiable business context]. Trabajamos con empresas en [very specific, hypothesized process improvement]. No presupongo que tengáis ese problema: ¿quién coordina [operations/finance]? Si tiene sentido, podemos comentar el caso en una llamada de 30 minutos sin compromiso." Adapt to role and local language. The purpose of a gatekeeper call is to reach the right department, not a hard sale. Never state speculative savings or deficiencies as facts.

## Read/write contract and UI
CMI acts as durable memory: company ID, relationship category and contact state; opportunities by ID/source; signals by evidence; people and verified channels; actions and exact next step. Research may be logged as researched/uncontacted; it must NOT be logged as email sent, call completed, LinkedIn invitation accepted or applied.
Presentation inside Clients and Partners:
- Selector: All, Direct Clients, LinkedIn Freelance/B2B, Hiring Alternative, Referral, Technical, Delivery, Unclassified
- Search and status filters
- Company detail: evidence, proposal hypothesis, phone/email/source, buyer role, primary/backup channel, opening/call script, follow-up and timeline
- LinkedIn job detail: exact URL/ID, contract nature, status/open verification, individual/team, source and job-specific action
- Keep historical signals without recreating companies.
Existing CMI job signals may be held in commercial_signals with metadata.linkedin_job_id and source_url; CRM opportunity source='linkedin' may link via source_signal_id. Do not create a separate duplicate company per signal.
No automatic outbound, mass application, schedule or credential assumptions. Programming recurring research or alerts is a separate, user-approved phase.
