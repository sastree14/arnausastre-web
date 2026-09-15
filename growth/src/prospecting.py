from __future__ import annotations

from urllib.parse import quote_plus, urlparse

from .brain import load_brain
from .config import load_config
from .llm import get_llm
from .models import ApprovalItem, CompanyCandidate, PersonCandidate, new_id, to_dict
from .research import BraveResearchClient, dedupe_hits
from .storage import get_store


def _website_key(value: str) -> str:
    raw = str(value or "").strip()
    if not raw:
        return ""
    try:
        host = urlparse(raw if "://" in raw else f"https://{raw}").netloc.lower().removeprefix("www.")
        return host.rstrip("/")
    except ValueError:
        return raw.rstrip("/").lower()


def _linkedin_company_search_url(company_name: str) -> str:
    return "https://www.linkedin.com/search/results/companies/?keywords=" + quote_plus(company_name)


def _linkedin_people_search_url(name: str, company_name: str) -> str:
    return "https://www.linkedin.com/search/results/people/?keywords=" + quote_plus(f"{name} {company_name}")


def _linkedin_company_url(company_name: str, search: BraveResearchClient, llm) -> str:
    hits = dedupe_hits(search.search(f'site:linkedin.com/company "{company_name}"', count=10))[:10]
    linkedin_hits = [h for h in hits if "linkedin.com/company/" in h.url]
    if linkedin_hits:
        response = llm.json(
            "You select an official company LinkedIn page strictly from supplied public search results. Never invent URLs.",
            f"""Company: {company_name}
Select the one result that clearly represents this exact company.
Return JSON object with key linkedin_url only. Return an empty string if the match is not sufficiently supported.
RESULTS:
{[{'title': h.title, 'url': h.url, 'snippet': h.snippet} for h in linkedin_hits]}
""",
        )
        if isinstance(response, dict):
            url = str(response.get("linkedin_url", "")).strip()
            if "linkedin.com/company/" in url:
                return url
    # We always give the operator a LinkedIn action path even when public search
    # cannot safely resolve the canonical company page.
    return _linkedin_company_search_url(company_name)


def _discover_primary_person(company: CompanyCandidate, roles: list[str], search: BraveResearchClient, llm) -> dict | None:
    roles = roles or ["CEO", "Founder", "COO", "Head of Operations", "CFO", "CTO"]
    role_query = " OR ".join(f'"{role}"' for role in roles[:6])
    domain = _website_key(company.website)
    queries = [
        f'site:linkedin.com/in "{company.name}" ({role_query})',
        f'"{company.name}" ({role_query})',
        f'"{company.name}" CEO OR founder OR COO OR CFO OR CTO LinkedIn',
    ]
    if domain:
        queries.append(f'site:{domain} CEO OR founder OR management OR team OR director')

    hits = []
    for query in queries:
        hits.extend(search.search(query, count=10))
    hits = dedupe_hits(hits)[:35]
    if not hits:
        return None

    response = llm.json(
        "You identify one B2B decision maker strictly from supplied public search snippets. Never invent a person, company association or role.",
        f"""Find the SINGLE best decision maker for a Data/AI/analytics/operations conversation at {company.name}.
Preferred roles: {roles}.
Return one JSON object with: name, role, linkedin_url, public_source_url, relevance_score (0-10), evidence.
Requirements:
- name and company/role association must be supported by the supplied results;
- prefer a direct linkedin.com/in profile when one is present;
- linkedin_url may be empty when no direct profile is supported; the system will then build a LinkedIn people-search link;
- public_source_url should point to the strongest supplied supporting result;
- return {{}} if you cannot support a real named decision maker.
Do not fetch or infer facts from inside LinkedIn; search-result titles/snippets are the only LinkedIn evidence allowed.

RESULTS:
{[{'title': h.title, 'url': h.url, 'snippet': h.snippet} for h in hits]}
""",
    )
    if not isinstance(response, dict):
        return None
    name = str(response.get("name", "")).strip()
    role = str(response.get("role", "")).strip()
    if not name or not role:
        return None
    linkedin_url = str(response.get("linkedin_url", "")).strip()
    if "linkedin.com/in/" not in linkedin_url:
        linkedin_url = _linkedin_people_search_url(name, company.name)
    response["linkedin_url"] = linkedin_url
    return response


def _public_company_context(company: CompanyCandidate, search: BraveResearchClient) -> list[dict]:
    domain = _website_key(company.website)
    queries = [f'"{company.name}" {company.industry} operations growth']
    if domain:
        queries.append(f'site:{domain} forecasting OR optimization OR automation OR analytics OR planning OR expansion')
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
Company LinkedIn/action URL: {company.linkedin_url}
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


def _display_plan(outreach: dict[str, str | dict]) -> str:
    arnau_action = str(outreach.get("recommended_action", "connect_then_message")).replace("_", " ")
    sc_action = str(outreach.get("sc_analytics_action", "invite_to_follow_after_connection")).replace("_", " ")
    connection_note = str(outreach.get("connection_note", "")).strip()
    message = str(outreach.get("message", "")).strip()
    follow_up = str(outreach.get("follow_up", "")).strip()
    reason = str(outreach.get("contact_reason", "")).strip()
    parts = [
        f"Arnau · acción recomendada: {arnau_action}",
        f"SC-Analytics · acción recomendada: {sc_action}",
    ]
    if reason:
        parts.append(f"Por qué contactar: {reason}")
    if connection_note:
        parts.append(f"Nota de conexión:\n{connection_note}")
    if message:
        parts.append(f"Primer mensaje:\n{message}")
    if follow_up:
        parts.append(f"Follow-up:\n{follow_up}")
    return "\n\n".join(parts)


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


def _as_list(value) -> list:
    if isinstance(value, list):
        return value
    if isinstance(value, dict):
        for key in ("candidates", "companies", "results", "queries"):
            nested = value.get(key)
            if isinstance(nested, list):
                return nested
    return []


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
    existing_websites = {_website_key(str(row.get("website", ""))) for row in existing_companies if row.get("website")}
    requested = max(1, min(int(limit), 50))
    pool_target = max(requested * 5, 50)

    query_plan = llm.json(
        "You are a B2B research planner. Never instruct scraping LinkedIn.",
        f"""Generate 10 distinct public-web search queries to find NEW {mode} candidates for SC-Analytics.
Return JSON array of strings only.
For direct lead mode, prioritize END-CLIENT/OPERATING companies rather than consultancies, agencies, ERP vendors, data firms or AI service providers. Cover several ICP slices in Spain/EU: ecommerce/retail, manufacturing, wholesale/distribution, logistics operators, food, healthcare networks, travel/hospitality, multi-location businesses and growing B2B companies. Look for observable signals such as expansion, inventory complexity, planning, pricing, operations, supply chain, reporting, workforce/resource allocation or repetitive workflows.
For partner mode, complementary consultancies/software/service providers are appropriate.
Avoid these already stored domains: {sorted(existing_websites)[:120]}.
Use normal public web search syntax, not LinkedIn scraping instructions.

BRAIN:
{brain}
""",
    )

    static_lead_queries = [
        'Spain ecommerce retailer inventory logistics expansion company',
        'Spain manufacturer production planning capacity growth company',
        'Spain wholesale distributor inventory warehouses company',
        'Spain logistics operator fleet capacity expansion company',
        'Spain food distributor demand planning warehouses company',
        'Spain retail chain new stores operations company',
        'Spain healthcare clinics group expansion operations company',
        'Spain hospitality hotel group expansion revenue operations company',
        'Spain B2B company rapid growth operations automation',
        'Spain marketplace ecommerce multi warehouse company',
    ]
    queries = [str(q) for q in _as_list(query_plan)[:10]]
    if mode == "lead":
        queries.extend(static_lead_queries)

    hits = []
    for query in queries[:20]:
        hits.extend(search.search(query, count=12))
    hits = dedupe_hits(hits)[: max(pool_target * 5, 250)]

    raw_candidates = llm.json(
        "You are a strict B2B qualification analyst. Score conservatively and never invent missing facts.",
        f"""From the public search results below, select up to {pool_target} credible NEW company candidates so a downstream process can build {requested} company-person pairs.
Return a JSON array. Each item: name, website, country, industry, employee_range, source_url,
capabilities (array), capability_gaps (array), score (0-10), score_reason, recommended_roles (array).

Mode: {mode}
For lead mode:
- choose operating/end-client companies with a plausible business decision or process that SC-Analytics could improve;
- DO NOT choose consultancies, marketing agencies, ERP vendors, data/AI service firms or companies whose core offer substantially overlaps SC-Analytics unless the supplied evidence clearly shows a separate internal use case;
- diversify industries rather than returning ten versions of the same profile.
For partner mode, complementary providers are allowed.
Explain the observable public signal behind the score. Do not infer unsupported facts; use empty strings when unknown.
Exclude these stored domains: {sorted(existing_websites)[:120]}.

SC-ANALYTICS BRAIN:
{brain}

SEARCH RESULTS:
{[{'title': h.title, 'url': h.url, 'snippet': h.snippet} for h in hits]}
""",
    )

    output: list[dict] = []
    seen_websites = set(existing_websites)
    for raw in _as_list(raw_candidates):
        if len(output) >= requested:
            break
        if not isinstance(raw, dict):
            continue
        website = str(raw.get("website", "")).strip()
        normalized_website = _website_key(website)
        if not raw.get("name") or not website or not normalized_website or normalized_website in seen_websites:
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
        roles = [str(r) for r in (raw.get("recommended_roles") or [])][:6]

        candidate.linkedin_url = _linkedin_company_url(candidate.name, search, llm)
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
        display_plan = _display_plan(outreach)
        person_updates = {
            "recommended_message": display_plan,
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
        outreach_payload["message"] = str(outreach.get("message", ""))
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
