from __future__ import annotations

from urllib.parse import quote_plus

from .brain import load_brain
from .config import load_config
from .llm import get_llm
from .models import ApprovalItem, CompanyCandidate, PersonCandidate, new_id, to_dict
from .research import BraveResearchClient, dedupe_hits
from .storage import get_store


def _discover_people(company: CompanyCandidate, roles: list[str], search: BraveResearchClient, llm) -> list[dict]:
    """Discover public decision-maker references without scraping LinkedIn."""
    queries = []
    for role in roles[:4]:
        queries.append(f'"{company.name}" "{role}"')
        queries.append(f'"{company.name}" {role} LinkedIn')
    hits = []
    for query in queries[:8]:
        hits.extend(search.search(query, count=6))
    hits = dedupe_hits(hits)[:28]
    if not hits:
        return []
    return llm.json(
        "You identify B2B decision makers strictly from supplied public search snippets. Do not invent names or roles.",
        f"""Identify at most 4 people who plausibly work at {company.name} in one of these roles: {roles}.
Return JSON array with: name, role, linkedin_url, public_source_url, relevance_score (0-10), evidence.
Only return a person when the supplied result explicitly supports their name and company/role association.
A LinkedIn URL may be copied from the search result URL, but do not claim information that would require scraping it.
Prioritize people who can sponsor or materially influence a Data/AI/analytics/operations project.

RESULTS:
{[{'title': h.title, 'url': h.url, 'snippet': h.snippet} for h in hits]}
""",
    )


def _role_angle(role: str, industry: str) -> str:
    normalized = role.lower()
    if any(token in normalized for token in ["ceo", "founder", "owner", "managing", "director general"]):
        return "Decision quality, growth and scalability"
    if any(token in normalized for token in ["operations", "supply", "logistic", "planning", "inventory", "procurement"]):
        return "Operational efficiency, forecasting and optimization"
    if any(token in normalized for token in ["cfo", "finance", "financial", "controller", "risk"]):
        return "Financial visibility, risk and decision quality"
    if any(token in normalized for token in ["data", "analytics", "ai", "technology", "cto", "cio", " it"]):
        return "Data/AI capability, automation and integration"
    if any(token in normalized for token in ["sales", "marketing", "growth", "commercial"]):
        return "Commercial forecasting, segmentation and automation"
    return f"Decision improvement in {industry}" if industry else "Decision improvement with Data/AI"


def _draft_outreach(mode: str, company: CompanyCandidate, person: dict | None, brain: str, llm) -> dict[str, str]:
    person_context = person or {}
    response = llm.json(
        "You write concise founder-led B2B outreach for Arnau Sastre, Founder of SC-Analytics. No hype, pressure or invented familiarity.",
        f"""Prepare one personalized first-contact message for this candidate.
Return JSON object with keys `message` and `angle` only.
Mode: {mode}
Company: {company.name}
Website: {company.website}
Industry: {company.industry}
Observed capabilities: {company.capabilities}
Observed gaps/opportunity: {company.capability_gaps}
Qualification reason: {company.score_reason}
Person: {person_context}

Use ethical persuasion only: specificity, relevance to the person's role, a credible business observation, a low-friction next step and clear autonomy. Do not infer personal vulnerabilities or sensitive traits. Do not manufacture urgency, social proof, familiarity or private knowledge.
For partnership mode, lead with complementarity and a credible reason to collaborate, not a client pitch.
For lead mode, lead with the observable business context/problem. Position a free discovery call as a way to identify opportunities, bottlenecks, deficits, scalability constraints or process improvements; make it explicit that there is no obligation and that SC-Analytics will say so if there is no clear value.
Maximum ~110 words.

SC-ANALYTICS BRAIN:
{brain}
""",
    )
    message = str(response.get("message", "")).strip()
    angle = str(response.get("angle", "")).strip()
    if not angle and person_context:
        angle = _role_angle(str(person_context.get("role", "")), company.industry)
    return {"message": message, "angle": angle}


def _linkedin_search_url(company: CompanyCandidate, roles: list[str]) -> str:
    return "https://www.linkedin.com/search/results/people/?keywords=" + quote_plus(
        f"{company.name} {' OR '.join(roles)}"
    )


def _queue_manual_action(store, *, tenant_id: str, action_type: str, target_id: str, summary: str, payload: dict) -> None:
    payload = dict(payload)
    payload["execution_mode"] = "manual_linkedin_action"
    store.insert(
        "approvals",
        to_dict(ApprovalItem(
            approval_id=new_id("approval"),
            tenant_id=tenant_id,
            action_type=action_type,  # type: ignore[arg-type]
            target_id=target_id,
            summary=summary,
            payload=payload,
        )),
    )


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
        f"""Generate 6 distinct public-web search queries to find {mode} candidates for SC-Analytics.
Return JSON array of strings only. Cover different ICP slices instead of repeating the same query: Spain/EU SMEs and mid-market firms where forecasting, optimization, Data Science or AI automation can improve a real business decision or process. Prefer companies showing operational complexity, growth, multi-location operations, inventory/supply chain, finance/risk, pricing, reporting or workflow automation needs.
Use normal public web search syntax, not LinkedIn scraping instructions.

BRAIN:
{brain}
""",
    )
    hits = []
    for query in query_plan[:6]:
        hits.extend(search.search(str(query), count=10))
    hits = dedupe_hits(hits)[: max(limit * 6, 60)]

    raw_candidates = llm.json(
        "You are a strict B2B qualification analyst. Score conservatively and never invent missing facts.",
        f"""From the public search results below, select at most {limit} credible company candidates.
Return a JSON array. Each item: name, website, country, industry, employee_range, source_url,
capabilities (array), capability_gaps (array), score (0-10), score_reason, recommended_roles (array).
A partnership candidate should have client overlap and complementary gaps. A direct lead should have
an identifiable business problem or complexity that SC-Analytics can plausibly address. Explain the business signal behind the score. Do not infer unsupported facts; use empty strings when unknown. Do not use LinkedIn as evidence beyond supplied search-result snippets.

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

        existing_company = store.filter("companies", tenant_id=tenant_id, website=candidate.website)
        if existing_company:
            current = existing_company[0]
            candidate.company_id = current.get("company_id", candidate.company_id)
            candidate.status = current.get("status", candidate.status)
            candidate.created_at = current.get("created_at", candidate.created_at)
        stored_candidate = store.upsert("companies", to_dict(candidate), key="tenant_id,website")
        candidate.company_id = stored_candidate.get("company_id", candidate.company_id)

        roles = [str(r) for r in (raw.get("recommended_roles") or [])][:4]
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
            existing_person = store.filter("people", tenant_id=tenant_id, company_id=candidate.company_id, name=name)
            if existing_person:
                current = existing_person[0]
                person.person_id = current.get("person_id", person.person_id)
                person.status = current.get("status", person.status)
                person.created_at = current.get("created_at", person.created_at)
            person_dict = to_dict(person)
            person_dict["evidence"] = str(raw_person.get("evidence", "")).strip()
            person_dict["notes"] = (existing_person[0].get("notes", "") if existing_person else "")
            person_dict["recommended_message"] = (existing_person[0].get("recommended_message", "") if existing_person else "")
            person_dict["outreach_angle"] = (existing_person[0].get("outreach_angle", "") if existing_person else "")
            person_dict["completed_at"] = (existing_person[0].get("completed_at") if existing_person else None)
            stored_person = store.upsert("people", person_dict, key="tenant_id,company_id,name")
            people.append(stored_person)

        threshold = cfg["growth"]["minimum_partner_score" if mode == "partner" else "minimum_lead_score"]
        if candidate.score >= float(threshold):
            primary_person = people[0] if people else None
            target_id = (primary_person or {}).get("person_id", candidate.company_id)
            search_url = _linkedin_search_url(candidate, roles)
            common_payload = {
                "company_id": candidate.company_id,
                "company": candidate.name,
                "website": candidate.website,
                "source_url": candidate.source_url,
                "person": primary_person,
                "recommended_roles": roles,
                "linkedin_search_url": search_url,
            }

            if primary_person:
                _queue_manual_action(
                    store,
                    tenant_id=tenant_id,
                    action_type="connect_person",
                    target_id=target_id,
                    summary=f"Connect/follow: {primary_person.get('name')} at {candidate.name}",
                    payload=common_payload,
                )

            outreach = _draft_outreach(mode, candidate, primary_person, brain, llm)
            message = outreach.get("message", "")
            angle = outreach.get("angle", "")
            if primary_person:
                store.update("people", "person_id", target_id, {
                    "recommended_message": message,
                    "outreach_angle": angle,
                })
                primary_person["recommended_message"] = message
                primary_person["outreach_angle"] = angle

            outreach_payload = dict(common_payload)
            outreach_payload["message"] = message
            outreach_payload["outreach_angle"] = angle
            _queue_manual_action(
                store,
                tenant_id=tenant_id,
                action_type="contact_partner" if mode == "partner" else "send_message",
                target_id=target_id,
                summary=f"Message {mode} candidate: {candidate.name} ({candidate.score:.1f}/10)",
                payload=outreach_payload,
            )

        enriched = to_dict(candidate)
        enriched["people"] = people
        output.append(enriched)
    return output
