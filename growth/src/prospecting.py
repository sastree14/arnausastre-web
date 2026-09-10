from __future__ import annotations

from urllib.parse import quote_plus

from .brain import load_brain
from .config import load_config
from .llm import get_llm
from .models import ApprovalItem, CompanyCandidate, PersonCandidate, new_id, to_dict
from .research import BraveResearchClient, dedupe_hits
from .storage import get_store


def research_companies(mode: str = "partner", limit: int = 10) -> list[dict]:
    cfg = load_config()
    tenant_id = cfg["company"]["tenant_id"]
    brain = load_brain([
        "company/services.md",
        "commercial/icp.md",
        "commercial/channels.md",
        "company/principles.md",
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
    hits = dedupe_hits(hits)[: max(limit * 3, 20)]

    raw_candidates = llm.json(
        "You are a strict B2B qualification analyst. Score conservatively and never invent missing facts.",
        f"""From the public search results below, select at most {limit} credible company candidates.
Return a JSON array. Each item: name, website, country, industry, employee_range, source_url,
capabilities (array), capability_gaps (array), score (0-10), score_reason, recommended_roles (array).
A partnership candidate should have client overlap and complementary gaps. A direct lead should have
an identifiable business problem that SC-Analytics can plausibly address. Do not infer facts that are
not supported by snippets; use empty strings when unknown.

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
        store.upsert("companies", to_dict(candidate), key="website")
        roles = list(raw.get("recommended_roles") or [])[:3]
        for role in roles:
            person = PersonCandidate(
                person_id=new_id("person"),
                tenant_id=tenant_id,
                company_id=candidate.company_id,
                name="",
                role=str(role),
                public_source_url=candidate.source_url,
                relevance_score=candidate.score,
            )
            store.insert("people", to_dict(person))

        threshold = cfg["growth"]["minimum_partner_score" if mode == "partner" else "minimum_lead_score"]
        if candidate.score >= float(threshold):
            action_type = "contact_partner" if mode == "partner" else "send_message"
            approval = ApprovalItem(
                approval_id=new_id("approval"),
                tenant_id=tenant_id,
                action_type=action_type,
                target_id=candidate.company_id,
                summary=f"Review {mode} candidate: {candidate.name} ({candidate.score:.1f}/10)",
                payload={
                    "company": candidate.name,
                    "website": candidate.website,
                    "source_url": candidate.source_url,
                    "recommended_roles": roles,
                    "linkedin_search_url": "https://www.linkedin.com/search/results/people/?keywords=" + quote_plus(f"{candidate.name} {' OR '.join(roles)}"),
                },
            )
            store.insert("approvals", to_dict(approval))
        output.append(to_dict(candidate))
    return output
