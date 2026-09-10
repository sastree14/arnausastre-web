from __future__ import annotations

from urllib.parse import quote_plus

from .brain import load_brain
from .config import load_config
from .llm import get_llm
from .models import ApprovalItem, CompanyCandidate, PersonCandidate, new_id, to_dict
from .research import BraveResearchClient, dedupe_hits
from .storage import get_store


def _discover_people(company: CompanyCandidate, roles: list[str], search: BraveResearchClient, llm) -> list[dict]:
    """Discover public decision-maker references without scraping LinkedIn.

    Search-engine results may contain a LinkedIn profile URL. The agent stores that URL but never fetches
    or scrapes the LinkedIn page itself.
    """
    queries = []
    for role in roles[:3]:
        queries.append(f'"{company.name}" "{role}"')
        queries.append(f'"{company.name}" {role} LinkedIn')
    hits = []
    for query in queries[:6]:
        hits.extend(search.search(query, count=5))
    hits = dedupe_hits(hits)[:20]
    if not hits:
        return []
    return llm.json(
        "You identify B2B decision makers strictly from supplied public search snippets. Do not invent names or roles.",
        f"""Identify at most 3 people who plausibly work at {company.name} in one of these roles: {roles}.
Return JSON array with: name, role, linkedin_url, public_source_url, relevance_score (0-10), evidence.
Only return a person when the supplied result explicitly supports their name and company/role association.
A LinkedIn URL may be copied from the search result URL, but do not claim information that would require scraping it.

RESULTS:
{[{'title': h.title, 'url': h.url, 'snippet': h.snippet} for h in hits]}
""",
    )


def _draft_outreach(mode: str, company: CompanyCandidate, person: dict | None, brain: str, llm) -> str:
    person_context = person or {}
    return str(llm.json(
        "You write concise founder-led B2B outreach for Arnau Sastre, Founder of SC-Analytics. No hype and no invented familiarity.",
        f"""Prepare one personalized first-contact message for this candidate.
Return JSON object with key `message` only.
Mode: {mode}
Company: {company.name}
Website: {company.website}
Industry: {company.industry}
Observed capabilities: {company.capabilities}
Observed gaps/opportunity: {company.capability_gaps}
Qualification reason: {company.score_reason}
Person: {person_context}

For partnership mode, lead with complementarity and a credible reason to collaborate, not a client pitch.
For lead mode, lead with the observable business context/problem and a low-friction conversation, not a generic Data Science pitch.
Maximum ~100 words. Do not pretend to have inspected private systems or know facts that are not supplied.

SC-ANALYTICS BRAIN:
{brain}
""",
    ).get("message", "")).strip()


def research_companies(mode: str = "partner", limit: int = 10) -> list[dict]:
    cfg = load_config()
    tenant_id = cfg["company"]["tenant_id"]
    brain = load_brain([
        "company/services.md",
        "commercial/icp.md",
        "commercial/channels.md",
        "company/principles.md",
        "voice/arnau_voice.md",
        "voice/forbidden_language.md",
    ])
    search = BraveResearchClient()
    llm = get_llm()

    query_plan = llm.json(
        "You are a B2B research planner. Never instruct scraping LinkedIn.",
        f"""Generate 4 public-web search queries to find {mode} candidates for SC-Analytics.
Return JSON array of strings only. Focus Spain/EU companies where Data Science, forecasting,
optimization or AI automation can complement existing services. Use normal web search syntax,
not LinkedIn scraping instructions.

BRAIN:
{brain}
""",
    )
    hits = []
    for query in query_plan[:4]:
        hits.extend(search.search(str(query), count=8))
    hits = dedupe_hits(hits)[: max(limit * 4, 30)]

    raw_candidates = llm.json(
        "You are a strict B2B qualification analyst. Score conservatively and never invent missing facts.",
        f"""From the public search results below, select at most {limit} credible company candidates.
Return a JSON array. Each item: name, website, country, industry, employee_range, source_url,
capabilities (array), capability_gaps (array), score (0-10), score_reason, recommended_roles (array).
A partnership candidate should have client overlap and complementary gaps. A direct lead should have
an identifiable business problem that SC-Analytics can plausibly address. Do not infer facts that are
not supported by snippets; use empty strings when unknown. Do not use LinkedIn as evidence beyond what
appears in the supplied search result snippet.

SC-ANALYTICS BRAIN:
{brain}

SEARCH RESULTS:
{[{'title': h.title, 'url': h.url, 'snippet': h.snippet} for h in hits]}
""",
    )

    store = get_store()
    output: list[dict] = []
    for raw in raw_candidates[:limit]:
        candidate = CompanyCandidate(
            company_id=new_id("company"),
            tenant_id=tenant_id,
            name=str(raw.get("name", "")).strip(),
            website=str(raw.get("website", "")).strip(),
            country=str(raw.get("country", "")).strip(),
            industry=str(raw.get("industry", "")).strip(),
            employee_range=str(raw.get("employee_range", "")).strip(),
            source_url=str(raw.get("source_url", "")).strip(),
            fit_type=mode,
            score=float(raw.get("score", 0) or 0),
            score_reason=str(raw.get("score_reason", "")).strip(),
            capabilities=list(raw.get("capabilities") or []),
            capability_gaps=list(raw.get("capability_gaps") or []),
        )
        if not candidate.name or not candidate.website:
            continue
        stored_candidate = store.upsert("companies", to_dict(candidate), key="tenant_id,website")
        candidate.company_id = stored_candidate.get("company_id", candidate.company_id)

        roles = [str(r) for r in (raw.get("recommended_roles") or [])][:3]
        people_raw = _discover_people(candidate, roles, search, llm)
        people: list[dict] = []
        for raw_person in people_raw:
            name = str(raw_person.get("name", "")).strip()
            role = str(raw_person.get("role", "")).strip()
            if not name or not role:
                continue
            person = PersonCandidate(
                person_id=new_id("person"),
                tenant_id=tenant_id,
                company_id=candidate.company_id,
                name=name,
                role=role,
                linkedin_url=str(raw_person.get("linkedin_url", "")).strip(),
                public_source_url=str(raw_person.get("public_source_url", "")).strip(),
                relevance_score=float(raw_person.get("relevance_score", candidate.score) or candidate.score),
            )
            person_dict = to_dict(person)
            person_dict["evidence"] = str(raw_person.get("evidence", "")).strip()
            store.insert("people", person_dict)
            people.append(person_dict)

        threshold = cfg["growth"]["minimum_partner_score" if mode == "partner" else "minimum_lead_score"]
        if candidate.score >= float(threshold):
            primary_person = people[0] if people else None
            message = _draft_outreach(mode, candidate, primary_person, brain, llm)
            action_type = "contact_partner" if mode == "partner" else "send_message"
            approval = ApprovalItem(
                approval_id=new_id("approval"),
                tenant_id=tenant_id,
                action_type=action_type,
                target_id=(primary_person or {}).get("person_id", candidate.company_id),
                summary=f"Review {mode} candidate: {candidate.name} ({candidate.score:.1f}/10)",
                payload={
                    "company_id": candidate.company_id,
                    "company": candidate.name,
                    "website": candidate.website,
                    "source_url": candidate.source_url,
                    "person": primary_person,
                    "message": message,
                    "recommended_roles": roles,
                    "linkedin_search_url": "https://www.linkedin.com/search/results/people/?keywords=" + quote_plus(f"{candidate.name} {' OR '.join(roles)}"),
                    "execution_mode": "manual_linkedin_action",
                },
            )
            store.insert("approvals", to_dict(approval))
        enriched = to_dict(candidate)
        enriched["people"] = people
        output.append(enriched)
    return output
