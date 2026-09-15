from __future__ import annotations

from urllib.parse import quote_plus, urlparse

from .brain import load_brain
from .config import load_config
from .llm import get_llm
from .models import ApprovalItem, CompanyCandidate, PersonCandidate, new_id, to_dict
from .research import BraveResearchClient, dedupe_hits
from .storage import get_store


def _linkedin_company_url(company_name: str, search: BraveResearchClient, llm) -> str:
    hits = dedupe_hits(search.search(f'site:linkedin.com/company "{company_name}"', count=8))[:8]
    linkedin_hits = [h for h in hits if "linkedin.com/company/" in h.url]
    if not linkedin_hits:
        return ""
    response = llm.json(
        "You select an official company LinkedIn page strictly from supplied public search results. Never invent URLs.",
        f"""Company: {company_name}
Select the one result that clearly represents this exact company.
Return JSON object with key linkedin_url only. Return an empty string if the match is not sufficiently supported.
RESULTS:
{[{'title': h.title, 'url': h.url, 'snippet': h.snippet} for h in linkedin_hits]}
""",
    )
    url = str(response.get("linkedin_url", "")).strip()
    return url if "linkedin.com/company/" in url else ""


def _discover_primary_person(company: CompanyCandidate, roles: list[str], search: BraveResearchClient, llm) -> dict | None:
    roles = roles or ["CEO", "Founder", "COO", "Head of Operations", "CTO"]
    role_query = " OR ".join(f'"{role}"' for role in roles[:5])
    queries = [
        f'site:linkedin.com/in "{company.name}" ({role_query})',
        f'"{company.name}" ({role_query}) LinkedIn',
    ]
    hits = []
    for query in queries:
        hits.extend(search.search(query, count=10))
    hits = dedupe_hits(hits)[:24]
    if not hits:
        return None
    response = llm.json(
        "You identify one B2B decision maker strictly from supplied public search snippets. Never invent a person, role or URL.",
        f"""Find the SINGLE best decision maker for a Data/AI/analytics/operations conversation at {company.name}.
Preferred roles: {roles}.
The person must have a supplied public result that supports their association with the company AND a LinkedIn profile URL.
Return one JSON object with: name, role, linkedin_url, public_source_url, relevance_score (0-10), evidence.
If no candidate satisfies those requirements, return {{}}.
Do not fetch or infer anything from inside LinkedIn; search-result titles/snippets are the only LinkedIn evidence allowed.

RESULTS:
{[{'title': h.title, 'url': h.url, 'snippet': h.snippet} for h in hits]}
""",
    )
    if not isinstance(response, dict):
        return None
    name = str(response.get("name", "")).strip()
    role = str(response.get("role", "")).strip()
    linkedin_url = str(response.get("linkedin_url", "")).strip()
    if not name or not role or "linkedin.com/in/" not in linkedin_url:
        return None
    return response


def _public_company_context(company: CompanyCandidate, search: BraveResearchClient) -> list[dict]:
    domain = urlparse(company.website).netloc.removeprefix("www.")
    queries = [
        f'"{company.name}" {company.industry} operations growth',
        f'site:{domain} forecasting OR optimization OR automation OR analytics OR planning',
    ]
    hits = []
    for query in queries:
        hits.extend(search.search(query, count=6))
    return [
        {"title": h.title, "url": h.url, "snippet": h.snippet}
        for h in dedupe_hits(hits)[:12]
        if "linkedin.com" not in h.url
    ]


def _role_angle(role: str, industry: str) -> str:
    normalized = role.lower()
    if any(token in normalized for token in ["ceo", "founder", "owner", "managing", "director general", "gerente general"]):
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


def _draft_outreach(mode: str, company: CompanyCandidate, person: dict, brain: str, search: BraveResearchClient, llm) -> dict[str, str | dict]:
    public_context = _public_company_context(company, search)
    response = llm.json(
        "You are a senior B2B outbound strategist writing as Arnau Sastre, Founder of SC-Analytics. Be specific, evidence-led, concise and human. Never manipulate, pressure or invent familiarity.",
        f"""Build a LinkedIn contact plan for this exact person and company.
Return one JSON object with these keys:
- contact_reason: one sentence explaining why this person is worth contacting now
- business_signal: one concrete public observation grounded ONLY in supplied evidence
- service_hypothesis: one plausible SC-Analytics problem/use-case hypothesis, explicitly framed as a hypothesis rather than a fact
- angle: short commercial angle
- recommended_action: one of follow, connect, connect_then_message, message
- sc_analytics_action: one of invite_to_follow_after_connection, invite_to_follow, none
- connection_note: personalized LinkedIn invitation note, max 250 characters; no generic pitch
- message: first message after connection, 65-120 words
- follow_up: one follow-up, 35-70 words, adding a useful angle instead of guilt or pressure
- language: es or en

Mode: {mode}
Company: {company.name}
Website: {company.website}
Company LinkedIn: {company.linkedin_url}
Country: {company.country}
Industry: {company.industry}
Observed capabilities: {company.capabilities}
Observed gaps/opportunity: {company.capability_gaps}
Qualification reason: {company.score_reason}
Person: {person}
Public company context: {public_context}

Rules:
1. Personalize from a specific observable company signal, the person's role and a relevant SC-Analytics capability. Do not use empty flattery such as 'I came across your profile'.
2. Never claim you know their internal systems, pain, budget, priorities or private information.
3. Use ethical persuasion: relevance, specificity, useful insight, low friction, autonomy and credible curiosity. Never use artificial scarcity, fear, guilt, deceptive social proof or sensitive personal traits.
4. For Spain, prefer natural Spanish unless public context strongly indicates English; otherwise use English.
5. Do not jump directly to a hard sell. The goal is a reply. If appropriate, position a free discovery call as a no-obligation way to identify bottlenecks, deficits, scalability opportunities or decision improvements.
6. The connection note and first message must feel materially different from generic outreach and must reference the supplied business context.

SC-ANALYTICS BRAIN:
{brain}
""",
    )
    if not isinstance(response, dict):
        response = {}
    angle = str(response.get("angle", "")).strip() or _role_angle(str(person.get("role", "")), company.industry)
    return {
        "contact_reason": str(response.get("contact_reason", "")).strip(),
        "business_signal": str(response.get("business_signal", "")).strip(),
        "service_hypothesis": str(response.get("service_hypothesis", "")).strip(),
        "angle": angle,
        "recommended_action": str(response.get("recommended_action", "connect_then_message")).strip() or "connect_then_message",
        "sc_analytics_action": str(response.get("sc_analytics_action", "invite_to_follow_after_connection")).strip() or "invite_to_follow_after_connection",
        "connection_note": str(response.get("connection_note", "")).strip()[:250],
        "message": str(response.get("message", "")).strip(),
        "follow_up": str(response.get("follow_up", "")).strip(),
        "language": str(response.get("language", "es")).strip() or "es",
        "research_context": {
            "public_context": public_context,
            "business_signal": str(response.get("business_signal", "")).strip(),
            "service_hypothesis": str(response.get("service_hypothesis", "")).strip(),
        },
    }


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
    store = get_store()

    existing_companies = store.filter("companies", tenant_id=tenant_id)
    existing_websites = {str(row.get("website", "")).rstrip("/").lower() for row in existing_companies if row.get("website")}
    requested = max(1, min(int(limit), 50))
    pool_target = max(requested * 3, 30)

    query_plan = llm.json(
        "You are a B2B research planner. Never instruct scraping LinkedIn.",
        f"""Generate 8 distinct public-web search queries to find NEW {mode} candidates for SC-Analytics.
Return JSON array of strings only. Cover different ICP slices instead of repeating the same query: Spain/EU SMEs and mid-market firms where forecasting, optimization, Data Science or AI automation can improve a real business decision or process. Prefer companies showing operational complexity, growth, multi-location operations, inventory/supply chain, finance/risk, pricing, reporting or workflow automation needs.
Avoid these already stored websites: {sorted(existing_websites)[:120]}.
Use normal public web search syntax, not LinkedIn scraping instructions.

BRAIN:
{brain}
""",
    )
    hits = []
    for query in list(query_plan)[:8]:
        hits.extend(search.search(str(query), count=12))
    hits = dedupe_hits(hits)[: max(pool_target * 4, 120)]

    raw_candidates = llm.json(
        "You are a strict B2B qualification analyst. Score conservatively and never invent missing facts.",
        f"""From the public search results below, select up to {pool_target} credible NEW company candidates so that a downstream process can keep searching until it has {requested} LinkedIn-ready leads.
Return a JSON array. Each item: name, website, country, industry, employee_range, source_url,
capabilities (array), capability_gaps (array), score (0-10), score_reason, recommended_roles (array).
A partnership candidate should have client overlap and complementary gaps. A direct lead should have an identifiable business problem or operational complexity that SC-Analytics can plausibly address. Explain the observable business signal behind the score. Do not infer unsupported facts; use empty strings when unknown.
Exclude already stored websites: {sorted(existing_websites)[:120]}.

SC-ANALYTICS BRAIN:
{brain}

SEARCH RESULTS:
{[{'title': h.title, 'url': h.url, 'snippet': h.snippet} for h in hits]}
""",
    )

    output: list[dict] = []
    seen_websites = set(existing_websites)
    for raw in list(raw_candidates):
        if len(output) >= requested:
            break
        website = str(raw.get("website", "")).strip()
        normalized_website = website.rstrip("/").lower()
        if not raw.get("name") or not website or normalized_website in seen_websites:
            continue

        candidate = CompanyCandidate(
            company_id=new_id("company"),
            tenant_id=tenant_id,
            name=str(raw.get("name", "")).strip(),
            website=website,
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
        roles = [str(r) for r in (raw.get("recommended_roles") or [])][:5]

        candidate.linkedin_url = _linkedin_company_url(candidate.name, search, llm)
        if not candidate.linkedin_url:
            continue
        primary_raw = _discover_primary_person(candidate, roles, search, llm)
        if not primary_raw:
            continue

        stored_candidate = store.upsert("companies", to_dict(candidate), key="tenant_id,website")
        candidate.company_id = stored_candidate.get("company_id", candidate.company_id)
        seen_websites.add(normalized_website)

        person = PersonCandidate(
            person_id=new_id("person"),
            tenant_id=tenant_id,
            company_id=candidate.company_id,
            name=str(primary_raw.get("name", "")).strip(),
            role=str(primary_raw.get("role", "")).strip(),
            linkedin_url=str(primary_raw.get("linkedin_url", "")).strip(),
            public_source_url=str(primary_raw.get("public_source_url", "")).strip(),
            relevance_score=float(primary_raw.get("relevance_score", candidate.score) or candidate.score),
        )
        person_dict = to_dict(person)
        person_dict.update({
            "email": "",
            "source": "prospecting",
            "evidence": str(primary_raw.get("evidence", "")).strip(),
            "notes": "",
            "completed_at": None,
        })
        stored_person = store.upsert("people", person_dict, key="tenant_id,company_id,name")
        target_id = stored_person.get("person_id", person.person_id)

        outreach = _draft_outreach(mode, candidate, stored_person, brain, search, llm)
        person_updates = {
            "recommended_message": outreach.get("message", ""),
            "outreach_angle": outreach.get("angle", ""),
            "connection_note": outreach.get("connection_note", ""),
            "follow_up_message": outreach.get("follow_up", ""),
            "recommended_action": outreach.get("recommended_action", "connect_then_message"),
            "sc_analytics_action": outreach.get("sc_analytics_action", "invite_to_follow_after_connection"),
            "contact_reason": outreach.get("contact_reason", ""),
            "research_context": outreach.get("research_context", {}),
        }
        store.update("people", "person_id", target_id, person_updates)
        stored_person.update(person_updates)

        search_url = _linkedin_search_url(candidate, roles)
        common_payload = {
            "company_id": candidate.company_id,
            "company": candidate.name,
            "company_linkedin_url": candidate.linkedin_url,
            "website": candidate.website,
            "source_url": candidate.source_url,
            "person": stored_person,
            "recommended_roles": roles,
            "linkedin_search_url": search_url,
            "connection_note": outreach.get("connection_note", ""),
            "follow_up_message": outreach.get("follow_up", ""),
            "contact_reason": outreach.get("contact_reason", ""),
            "outreach_angle": outreach.get("angle", ""),
            "recommended_action": outreach.get("recommended_action", "connect_then_message"),
            "sc_analytics_action": outreach.get("sc_analytics_action", "invite_to_follow_after_connection"),
        }

        _queue_manual_action(
            store,
            tenant_id=tenant_id,
            action_type="connect_person",
            target_id=target_id,
            summary=f"LinkedIn: {stored_person.get('name')} at {candidate.name}",
            payload=common_payload,
        )
        outreach_payload = dict(common_payload)
        outreach_payload["message"] = outreach.get("message", "")
        _queue_manual_action(
            store,
            tenant_id=tenant_id,
            action_type="contact_partner" if mode == "partner" else "send_message",
            target_id=target_id,
            summary=f"Message {mode} candidate: {candidate.name} ({candidate.score:.1f}/10)",
            payload=outreach_payload,
        )

        enriched = to_dict(candidate)
        enriched["people"] = [stored_person]
        enriched["requested_batch_size"] = requested
        output.append(enriched)

    return output
