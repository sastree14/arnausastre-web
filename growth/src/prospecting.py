from __future__ import annotations

import re
from urllib.parse import quote_plus, urlparse

from .brain import load_brain
from .config import load_config
from .llm import get_llm
from .models import ApprovalItem, CompanyCandidate, PersonCandidate, new_id, to_dict
from .research import BraveResearchClient, dedupe_hits
from .storage import get_store


SERVICES = [
    "Demand forecasting & planning",
    "Optimization & operations research",
    "Machine learning / AI systems",
    "AI automation & agents",
    "Financial / risk analytics",
    "Decision dashboards & management analytics",
    "Data engineering & analytical foundations",
]

PARTNER_MODELS = [
    "consulting-extension",
    "specialist-overflow",
    "white-label-delivery",
    "referral-channel",
    "recruitment-channel",
    "technology-implementation-partner",
]

NON_OFFICIAL_COMPANY_HOSTS = {
    "linkedin.com",
    "jooble.org",
    "indeed.com",
    "glassdoor.com",
    "infojobs.net",
    "talent.com",
    "jobtoday.com",
    "investinspain.org",
    "catalonia.com",
    "crunchbase.com",
    "pitchbook.com",
    "wikipedia.org",
}

DIRECT_CLIENT_IDEAL_MAX_EMPLOYEES = 250
DIRECT_CLIENT_LARGE_EMPLOYEE_THRESHOLD = 500
DIRECT_CLIENT_MIN_SCORE = 5.5
DIRECT_CLIENT_STRETCH_MIN_SCORE = 6.5
DIRECT_CLIENT_LARGE_MIN_SCORE = 7.5
DIRECT_CLIENT_MICRO_MAX_EMPLOYEES = 9
DIRECT_CLIENT_MICRO_MIN_SCORE = 6.5


def _employee_upper_bound(value: str) -> int | None:
    raw = str(value or "").strip().lower()
    if not raw:
        return None
    numbers = []
    for token in re.findall(r"\d[\d.,\s]*", raw):
        digits = re.sub(r"\D", "", token)
        if digits:
            numbers.append(int(digits))
    if not numbers:
        return None
    upper = max(numbers)
    if "+" in raw:
        upper += 1
    return upper


def _direct_client_size_allowed(employee_range: str, score: float) -> bool:
    """Use headcount only to prioritize, never as a hard discovery exclusion.

    Small and mid-market companies remain easier default buyers, but a large
    organization can still contain a business unit, specialist gap or bounded
    project where external Data/AI work creates material value.
    """
    employee_upper = _employee_upper_bound(employee_range)
    if employee_upper is None:
        return score >= DIRECT_CLIENT_MIN_SCORE
    if employee_upper > DIRECT_CLIENT_LARGE_EMPLOYEE_THRESHOLD:
        return score >= DIRECT_CLIENT_LARGE_MIN_SCORE
    if employee_upper > DIRECT_CLIENT_IDEAL_MAX_EMPLOYEES:
        return score >= DIRECT_CLIENT_STRETCH_MIN_SCORE
    if employee_upper <= DIRECT_CLIENT_MICRO_MAX_EMPLOYEES:
        return score >= DIRECT_CLIENT_MICRO_MIN_SCORE
    return score >= DIRECT_CLIENT_MIN_SCORE


def _direct_client_business_allowed(raw: dict, score: float) -> bool:
    """Filter on business economics and likely internal Data Science capacity.

    The desired universe is deliberately broad (well above 1,000 potential
    Spanish/EU targets), so missing headcount or a missing named executive is
    not itself a reason to throw away a company.
    """
    if score < DIRECT_CLIENT_MIN_SCORE:
        return False

    business_fit = str(raw.get("business_model_fit", "")).strip().lower()
    operational_leverage = str(raw.get("operational_leverage", "")).strip().lower()
    data_team_likelihood = str(raw.get("internal_data_team_likelihood", "")).strip().lower()
    enterprise_risk = str(raw.get("enterprise_risk", "")).strip().lower()
    specialist_gap = str(raw.get("specialist_gap", "")).strip().lower()

    if business_fit in {"excluded", "weak"}:
        return False
    if operational_leverage == "weak":
        return False
    # Enterprise scale is a prioritization penalty, not an automatic rejection.
    # Keep only evidence-backed large-company opportunities where a bounded
    # specialist gap or external-capacity need is plausible.
    if enterprise_risk == "high":
        return score >= 8.0 and specialist_gap == "clear" and operational_leverage == "strong"

    # Mature internal Data Science capacity reduces default fit, but specialist
    # optimisation/forecasting/ML/automation gaps can still justify outreach.
    if data_team_likelihood == "high":
        return score >= 8.0 and specialist_gap == "clear"

    if data_team_likelihood == "medium" and score < 6.5:
        return False

    return True


def _verify_direct_client_size(company_name: str, website: str, search: BraveResearchClient, llm) -> dict:
    """Second-pass size verification so strong SME prospects are not lost just
    because the broad discovery snippets omitted headcount.

    Returns only evidence-backed scale information. Unknown remains unknown.
    """
    domain = _website_key(website)
    queries = [
        f'"{company_name}" employees company size',
        f'"{company_name}" employees Spain',
        f'"{company_name}" "1-10" OR "2-10" OR "11-50" OR "51-200" OR "201-500"',
        f'"{company_name}" autónomo OR "self-employed" OR microempresa OR SME',
        f'site:linkedin.com/company "{company_name}" employees',
    ]
    if domain:
        queries.extend([
            f'site:{domain} employees OR team OR "our people" OR plantilla',
            f'site:{domain} "about us" OR nosotros OR equipo',
        ])
    hits = []
    for query in queries:
        hits.extend(search.search(query, count=8))
    hits = dedupe_hits(hits)[:30]
    if not hits:
        return {"employee_range": "", "classification": "unknown", "source_url": "", "evidence": ""}

    result = llm.json(
        "Verify company size conservatively using only the supplied public snippets. Never guess an exact headcount.",
        f"""Company: {company_name}
Website: {website}

Return one JSON object with:
- employee_range: explicit numeric count/range only when directly supported; otherwise empty string
- classification: one of solo_or_micro, under_250, from_251_to_500, over_500, likely_sme, unknown
- source_url: strongest supplied URL supporting the classification
- evidence: one concise evidence sentence

Rules:
- over_500 if supplied evidence clearly indicates >500 employees or a large/global enterprise;
- solo_or_micro for a supported self-employed/sole proprietor or <=9 employee business;
- under_250 / from_251_to_500 only when numeric evidence supports it;
- likely_sme only when public evidence explicitly describes the company as SME/small/mid-sized and there is no evidence of enterprise scale;
- unknown if evidence is insufficient or conflicting;
- do not infer size from revenue, brand familiarity or website design.

RESULTS:
{[{'title': h.title, 'url': h.url, 'snippet': h.snippet} for h in hits]}
""",
    )
    if not isinstance(result, dict):
        return {"employee_range": "", "classification": "unknown", "source_url": "", "evidence": ""}
    allowed_urls = {h.url for h in hits}
    source_url = str(result.get("source_url", "")).strip()
    if source_url and source_url not in allowed_urls:
        source_url = ""
    classification = str(result.get("classification", "unknown")).strip()
    if classification not in {"solo_or_micro", "under_250", "from_251_to_500", "over_500", "likely_sme", "unknown"}:
        classification = "unknown"
    return {
        "employee_range": str(result.get("employee_range", "")).strip(),
        "classification": classification,
        "source_url": source_url,
        "evidence": str(result.get("evidence", "")).strip(),
    }


def _website_key(value: str) -> str:
    raw = str(value or "").strip()
    if not raw:
        return ""
    try:
        host = urlparse(raw if "://" in raw else f"https://{raw}").netloc.lower().removeprefix("www.")
        return host.rstrip("/")
    except ValueError:
        return raw.rstrip("/").lower()


def _company_name_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").lower())


def _is_non_official_company_host(value: str) -> bool:
    host = _website_key(value)
    return any(host == blocked or host.endswith("." + blocked) for blocked in NON_OFFICIAL_COMPANY_HOSTS)


def _resolve_official_website(company_name: str, suggested_website: str, search: BraveResearchClient, llm) -> str:
    """Keep evidence URLs separate from the company's canonical website."""
    suggested = str(suggested_website or "").strip()
    if suggested and not _is_non_official_company_host(suggested):
        return suggested

    hits = []
    for query in [
        f'"{company_name}" official website Spain',
        f'"{company_name}" empresa web oficial',
    ]:
        hits.extend(search.search(query, count=8))
    candidates = [h for h in dedupe_hits(hits) if not _is_non_official_company_host(h.url)][:12]
    if not candidates:
        return suggested

    result = llm.json(
        "Select the official website for the named company strictly from the supplied public search results. Never invent a domain.",
        f"""Company: {company_name}
Return JSON with official_website only. Use an empty string if none is sufficiently supported.

RESULTS:
{[{'title': h.title, 'url': h.url, 'snippet': h.snippet} for h in candidates]}
""",
    )
    if isinstance(result, dict):
        selected = str(result.get("official_website", "")).strip()
        allowed = {h.url for h in candidates}
        if selected in allowed:
            parsed = urlparse(selected if "://" in selected else f"https://{selected}")
            if parsed.scheme and parsed.netloc:
                return f"{parsed.scheme}://{parsed.netloc}/"
    return suggested


def _linkedin_company_search_url(company_name: str) -> str:
    return "https://www.linkedin.com/search/results/companies/?keywords=" + quote_plus(company_name)


def _linkedin_people_search_url(name: str, company_name: str) -> str:
    return "https://www.linkedin.com/search/results/people/?keywords=" + quote_plus(f"{name} {company_name}")


def _linkedin_search_url(company: CompanyCandidate, roles: list[str]) -> str:
    return "https://www.linkedin.com/search/results/people/?keywords=" + quote_plus(
        f"{company.name} {' OR '.join(roles)}"
    )


def _linkedin_company_url(company_name: str, search: BraveResearchClient, llm) -> str:
    hits = dedupe_hits(search.search(f'site:linkedin.com/company "{company_name}"', count=10))[:10]
    linkedin_hits = [h for h in hits if "linkedin.com/company/" in h.url]
    if linkedin_hits:
        response = llm.json(
            "Select the official company LinkedIn page strictly from the supplied public search results. Never invent URLs.",
            f"""Company: {company_name}
Return JSON with linkedin_url only. Return an empty string if the match is not sufficiently supported.
RESULTS:
{[{'title': h.title, 'url': h.url, 'snippet': h.snippet} for h in linkedin_hits]}
""",
        )
        if isinstance(response, dict):
            url = str(response.get("linkedin_url", "")).strip()
            if "linkedin.com/company/" in url:
                return url
    return _linkedin_company_search_url(company_name)


def _discover_primary_person(company: CompanyCandidate, roles: list[str], search: BraveResearchClient, llm, mode: str) -> dict | None:
    if mode == "partner":
        roles = roles or ["Founder", "CEO", "Managing Partner", "Partner", "Head of Consulting", "Business Development", "Head of Recruitment"]
    elif mode == "network":
        roles = roles or ["Founder", "Data Scientist", "ML Engineer", "AI Engineer", "Head of Data", "Analytics Lead", "Operations Research", "Technical Creator"]
    else:
        roles = roles or ["Owner", "Founder", "CEO", "Gerente", "COO", "Head of Operations", "CFO"]
    role_query = " OR ".join(f'"{role}"' for role in roles[:7])
    domain = _website_key(company.website)
    queries = [
        f'site:linkedin.com/in "{company.name}" ({role_query})',
        f'"{company.name}" ({role_query})',
        f'"{company.name}" founder OR CEO OR partner OR director LinkedIn',
    ]
    if domain:
        queries.append(f'site:{domain} founder OR CEO OR partner OR management OR team OR director')

    hits = []
    for query in queries:
        hits.extend(search.search(query, count=10))
    hits = dedupe_hits(hits)[:40]
    if not hits:
        return None

    identity_instruction = (
        "Identify one real professional peer strictly from supplied public search snippets. Never invent a person, role or organization association."
        if mode == "network"
        else "Identify one real B2B decision maker strictly from supplied public search snippets. Never invent a person, role or company association."
    )
    response = llm.json(
        identity_instruction,
        f"""Find the SINGLE best person at {company.name} for this commercial mode: {mode}.
Preferred roles: {roles}.
Return JSON with: name, role, linkedin_url, public_source_url, relevance_score (0-10), evidence.
Requirements:
- name plus company/role association must be supported by supplied results;
- prefer a direct linkedin.com/in profile when supplied;
- linkedin_url may be empty if no direct profile is supported; the system will build a LinkedIn people-search link;
- public_source_url must be the strongest supplied supporting result;
- return {{}} if no real named decision maker is supported.
Do not infer facts from inside LinkedIn beyond supplied public search titles/snippets.

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


def _public_company_context(company: CompanyCandidate, search: BraveResearchClient, mode: str) -> list[dict]:
    domain = _website_key(company.website)
    if mode == "partner":
        queries = [
            f'"{company.name}" consulting services clients digital transformation analytics',
            f'"{company.name}" partnership clients consulting recruitment data',
        ]
        if domain:
            queries.append(f'site:{domain} services OR consulting OR analytics OR Power BI OR data OR recruitment OR partners')
    elif mode == "network":
        queries = [
            f'"{company.name}" data AI analytics engineering research community',
            f'"{company.name}" conference meetup podcast article machine learning analytics',
        ]
        if domain:
            queries.append(f'site:{domain} data OR AI OR analytics OR research OR engineering OR events')
    else:
        queries = [
            f'"{company.name}" {company.industry} operations growth expansion',
            f'"{company.name}" supply chain planning pricing capacity automation',
        ]
        if domain:
            queries.append(f'site:{domain} forecasting OR optimization OR automation OR analytics OR planning OR expansion')
    hits = []
    for query in queries:
        hits.extend(search.search(query, count=7))
    return [
        {"title": h.title, "url": h.url, "snippet": h.snippet}
        for h in dedupe_hits(hits)[:16]
        if "linkedin.com" not in h.url
    ]


def _public_person_context(person: dict, company: CompanyCandidate, search: BraveResearchClient) -> list[dict]:
    name = str(person.get("name", "")).strip()
    role = str(person.get("role", "")).strip()
    if not name:
        return []
    domain = _website_key(company.website)
    queries = [
        f'"{name}" "{company.name}" {role} interview project appointment',
        f'"{name}" "{company.name}" conference article podcast project',
    ]
    if domain:
        queries.append(f'site:{domain} "{name}"')
    hits = []
    for query in queries:
        hits.extend(search.search(query, count=6))
    return [
        {"title": h.title, "url": h.url, "snippet": h.snippet}
        for h in dedupe_hits(hits)[:12]
    ]


def _role_angle(role: str, industry: str) -> str:
    normalized = role.lower()
    if any(token in normalized for token in ["ceo", "founder", "owner", "managing", "director general", "gerente general"]):
        return "Decisión, crecimiento y escalabilidad"
    if any(token in normalized for token in ["operations", "supply", "logistic", "planning", "inventory", "procurement"]):
        return "Forecasting, planificación y eficiencia operativa"
    if any(token in normalized for token in ["cfo", "finance", "financial", "controller", "risk"]):
        return "Forecasting financiero, riesgo y control"
    if any(token in normalized for token in ["data", "analytics", "ai", "technology", "cto", "cio", " it"]):
        return "Data/AI, automatización e integración"
    if any(token in normalized for token in ["sales", "marketing", "growth", "commercial"]):
        return "Forecasting comercial, segmentación y automatización"
    return f"Mejora de decisiones en {industry}" if industry else "Mejora de decisiones con Data/AI"


def _draft_outreach(mode: str, company: CompanyCandidate, person: dict, company_extra: dict, brain: str, search: BraveResearchClient, llm) -> dict[str, str | dict]:
    company_context = _public_company_context(company, search, mode)
    person_context = _public_person_context(person, company, search)

    if mode == "network":
        response = llm.json(
            "You are a professional relationship strategist writing as Arnau Sastre. Build genuine peer-to-peer networking outreach. Never turn the person into a sales lead, never pressure, and never invent familiarity.",
            f"""Build a LinkedIn relationship plan for this exact professional.
Return one JSON object with:
- contact_reason: why this person is relevant to Arnau's professional network
- business_signal: one public professional signal grounded ONLY in supplied evidence
- personal_hook: one specific public professional detail worth referencing naturally; empty if unsupported
- recommended_service: empty string
- service_hypothesis: empty string
- angle: a short relationship angle focused on shared interests, learning, contribution or future collaboration
- open_question: one genuine open question about their work, field or current technical interests
- recommended_action: one of follow, connect, connect_then_message
- sc_analytics_action: normally invite_to_follow_after_connection; use invite_to_follow only when there is already a natural interaction/context; use none only when an invitation would clearly be premature
- connection_note: personalized invitation, max 250 characters, with NO pitch
- message: first message after connection, 55-110 words, conversational and non-commercial
- follow_up: optional follow-up, 35-70 words, only if it adds something useful
- language: es or en

Person: {person}
Professional context / organization: {company.name}
Website: {company.website}
Country: {company.country}
Industry: {company.industry}
Why this context was selected: {company.score_reason}
Public organization context: {company_context}
Public person context: {person_context}

GOAL:
Arnau is a mathematician and statistician and founder of SC-Analytics. He wants to become better known inside the Data/AI/analytics/optimization ecosystem by building real professional relationships: learning from peers, following good work, exchanging ideas, contributing when useful, and leaving the door open to future collaborations. This is NOT client acquisition.

RULES:
1. Mention Arnau and SC-Analytics naturally as context, not as a service pitch.
2. Do not propose a discovery call, audit, free consultation, commercial offer or sales meeting.
3. Prefer a thoughtful comment/follow/connect path over immediate messaging when evidence supports it.
4. Use the personal_hook only if supported by public professional evidence.
5. End the first message with the open question or a natural equivalent.
6. No empty flattery, engagement bait, fake familiarity, guilt, scarcity or pressure.
7. Building the SC-Analytics page audience is a real objective, but sequence matters: first create context through following/connecting/conversation, then invite the person to follow SC-Analytics. Do not put the company-page invitation inside the first cold connection note.
8. Default to natural Spanish for Spain unless evidence supports English.
9. Never use private or sensitive personal information.

SC-ANALYTICS BRAIN:
{brain}
""",
        )
        if not isinstance(response, dict):
            response = {}
        return {
            "contact_reason": str(response.get("contact_reason", "")).strip(),
            "business_signal": str(response.get("business_signal", "")).strip(),
            "personal_hook": str(response.get("personal_hook", "")).strip(),
            "recommended_service": "",
            "service_hypothesis": "",
            "angle": str(response.get("angle", "")).strip() or "Relación profesional y aprendizaje mutuo",
            "open_question": str(response.get("open_question", "")).strip(),
            "recommended_action": str(response.get("recommended_action", "connect_then_message")).strip() or "connect_then_message",
            "sc_analytics_action": str(response.get("sc_analytics_action", "invite_to_follow_after_connection")).strip() or "invite_to_follow_after_connection",
            "connection_note": str(response.get("connection_note", "")).strip()[:250],
            "message": str(response.get("message", "")).strip(),
            "follow_up": str(response.get("follow_up", "")).strip(),
            "language": str(response.get("language", "es")).strip() or "es",
            "research_context": {
                "public_company_context": company_context,
                "public_person_context": person_context,
                "business_signal": str(response.get("business_signal", "")).strip(),
                "personal_hook": str(response.get("personal_hook", "")).strip(),
                "open_question": str(response.get("open_question", "")).strip(),
                "networking_goal": "professional_recognition_relationships_learning_future_collaboration",
            },
        }

    partner_block = ""
    if mode == "partner":
        partner_block = f"""
This is a PARTNER conversation, not an end-client sales pitch.
Potential partnership model: {company_extra.get('partnership_model', '')}
Potential partnership value: {company_extra.get('partnership_value', '')}
The objective is to explore whether SC-Analytics can extend their delivery capability, absorb specialist/overflow projects, work white-label, receive referrals, or support recruitment/channel demand when the evidence supports it.
"""

    response = llm.json(
        "You are a senior B2B relationship strategist writing as Arnau Sastre. Arnau is a Mathematician and Statistician and Founder of SC-Analytics. Write specific, evidence-led, human outreach. Never manipulate, pressure or invent familiarity.",
        f"""Build a LinkedIn contact plan for this exact person and company.
Return one JSON object with:
- contact_reason: one sentence explaining why this exact person is worth contacting now
- business_signal: one concrete public company observation grounded ONLY in supplied evidence
- personal_hook: one SPECIFIC public professional detail about this person that can be mentioned naturally (a project, appointment, interview, responsibility, article, event, public professional milestone). If not supported, return an empty string. Never use private life, family, health, politics, religion or any sensitive/personal trait.
- recommended_service: choose EXACTLY ONE from {SERVICES}, selecting the service most likely to matter given role + sector + evidence
- service_hypothesis: one plausible problem/use-case hypothesis, explicitly framed as a hypothesis rather than a fact
- angle: short commercial/relationship angle
- open_question: one genuinely open question that is easy for the person to answer and reveals useful commercial context; it must NOT be a yes/no question
- recommended_action: one of follow, connect, connect_then_message, message
- sc_analytics_action: one of invite_to_follow_after_connection, invite_to_follow, none
- connection_note: personalized invitation, max 250 characters; no generic pitch
- message: first message after connection, 80-145 words
- follow_up: one follow-up, 45-85 words, adding value instead of guilt or pressure
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
Candidate recommended service: {company_extra.get('recommended_service', '')}
Person: {person}
Public company context: {company_context}
Public person context: {person_context}
{partner_block}

NON-NEGOTIABLE RULES:
1. The first message must naturally introduce Arnau as a mathematician and statistician and founder of SC-Analytics (or the natural equivalent in English).
2. Use personal_hook in the message when it is supported. It must sound like Arnau actually looked at the person's public professional work, not like mail-merge personalization.
3. Tailor the commercial proposition to ONE primary SC-Analytics service, not a list of everything we do.
4. The message MUST end with the open_question exactly or with a natural equivalent that remains open-ended.
5. The call-to-action may propose a short exploratory/informational call, with no cost and no commitment, framed as a way to see whether there is real mutual value. Do not say 'nothing to lose' literally.
6. Do not claim to know internal systems, pain, budget, priorities or private information.
7. Use ethical persuasion only: specificity, credible relevance, useful hypothesis, low friction and autonomy. No artificial scarcity, fear, guilt, fake social proof or sensitive traits.
8. For Spain, default to natural Spanish unless evidence strongly supports English; otherwise use English.
9. No empty flattery such as 'I came across your profile' or 'your impressive background'.
10. Connection note, first message and follow-up must not be generic variants of the same sentence.

SC-ANALYTICS BRAIN:
{brain}
""",
    )
    if not isinstance(response, dict):
        response = {}
    angle = str(response.get("angle", "")).strip() or _role_angle(str(person.get("role", "")), company.industry)
    recommended_service = str(response.get("recommended_service", "")).strip() or str(company_extra.get("recommended_service", "")).strip()
    return {
        "contact_reason": str(response.get("contact_reason", "")).strip(),
        "business_signal": str(response.get("business_signal", "")).strip(),
        "personal_hook": str(response.get("personal_hook", "")).strip(),
        "recommended_service": recommended_service,
        "service_hypothesis": str(response.get("service_hypothesis", "")).strip(),
        "angle": angle,
        "open_question": str(response.get("open_question", "")).strip(),
        "recommended_action": str(response.get("recommended_action", "connect_then_message")).strip() or "connect_then_message",
        "sc_analytics_action": str(response.get("sc_analytics_action", "invite_to_follow_after_connection")).strip() or "invite_to_follow_after_connection",
        "connection_note": str(response.get("connection_note", "")).strip()[:250],
        "message": str(response.get("message", "")).strip(),
        "follow_up": str(response.get("follow_up", "")).strip(),
        "language": str(response.get("language", "es")).strip() or "es",
        "research_context": {
            "public_company_context": company_context,
            "public_person_context": person_context,
            "business_signal": str(response.get("business_signal", "")).strip(),
            "personal_hook": str(response.get("personal_hook", "")).strip(),
            "service_hypothesis": str(response.get("service_hypothesis", "")).strip(),
            "recommended_service": recommended_service,
            "open_question": str(response.get("open_question", "")).strip(),
            "partnership_model": company_extra.get("partnership_model", ""),
            "partnership_value": company_extra.get("partnership_value", ""),
        },
    }


def _display_plan(outreach: dict[str, str | dict], mode: str, company_extra: dict) -> str:
    arnau_action = str(outreach.get("recommended_action", "connect_then_message")).replace("_", " ")
    sc_action = str(outreach.get("sc_analytics_action", "invite_to_follow_after_connection")).replace("_", " ")
    parts = [
        f"Arnau · acción recomendada: {arnau_action}",
        f"SC-Analytics · acción recomendada: {sc_action}",
    ]
    if mode == "partner" and company_extra.get("partnership_model"):
        parts.append(f"Modelo de partnership: {company_extra.get('partnership_model')}")
    if mode == "network":
        parts.append("Objetivo: relación profesional, reconocimiento, aprendizaje y colaboración futura; no venta directa.")
    for label, key in [
        ("Por qué contactar", "contact_reason"),
        ("Detalle profesional personal", "personal_hook"),
        ("Servicio a priorizar", "recommended_service"),
        ("Pregunta abierta", "open_question"),
        ("Nota de conexión", "connection_note"),
        ("Primer mensaje", "message"),
        ("Follow-up", "follow_up"),
    ]:
        value = str(outreach.get(key, "")).strip()
        if value:
            parts.append(f"{label}:\n{value}")
    return "\n\n".join(parts)


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


def _lead_discovery_queries(existing_count: int) -> list[str]:
    """Rotate regions x operating models so repeated runs do not exhaust the
    same nationally ranked companies. The matrix intentionally represents a
    universe far larger than a single 10/50-result run.
    """
    regions = [
        "Barcelona", "Madrid", "Valencia", "Alicante", "Murcia", "Zaragoza",
        "Bilbao", "Sevilla", "Malaga", "Girona", "Tarragona", "Lleida",
        "Navarra", "Galicia", "Asturias", "Castilla y Leon", "Castilla-La Mancha",
        "Balearic Islands", "Canary Islands", "Basque Country",
    ]
    templates = [
        "{region} ecommerce brand online store inventory demand planning",
        "{region} manufacturer production planning factory scheduling optimization",
        "{region} wholesale distributor importer warehouse inventory analytics",
        "{region} logistics 3PL fleet warehouse route optimization",
        "{region} restaurant group multiple locations reservations inventory analytics",
        "{region} hotel aparthotel tourism operator bookings pricing forecasting",
        "{region} dental veterinary physiotherapy clinic appointments capacity planning",
        "{region} academy training company scheduling students automation",
        "{region} property management holiday rentals bookings operations analytics",
        "{region} maintenance installation field service technicians scheduling optimization",
        "{region} food distributor inventory demand planning forecasting",
        "{region} autónomo online business bookings orders automation",
    ]
    matrix = [template.format(region=region) for region in regions for template in templates]
    if not matrix:
        return []
    # Move through the matrix as the database grows instead of always querying
    # the same first page of the same sectors/cities.
    start = (max(0, int(existing_count)) * 11) % len(matrix)
    rotated = matrix[start:] + matrix[:start]
    return rotated[:24]


def _query_prompt(mode: str, existing_websites: set[str], brain: str) -> str:
    if mode == "partner":
        target = """Find complementary PARTNER/CHANNEL companies, not ordinary end clients. Prioritize Spain/EU:
- strategy, operations or management consultancies whose technical delivery often stops at BI/Power BI/reporting;
- boutique statistics/R/BI/data firms that may receive projects beyond their capacity or capability;
- digital transformation, ERP/CRM, software or automation consultancies that lack deep Data Science, forecasting, optimization or ML delivery;
- recruitment/staffing/talent firms that receive Data/AI project or contractor demand and could route work to SC-Analytics;
- agencies/advisories with strong client access but incomplete technical depth.
A good partner should gain something concrete: sell larger/deeper projects, avoid saying no to specialist work, add white-label technical delivery, handle overflow, or create a referral/subcontracting channel.
Avoid full-stack Data Science/AI consultancies whose offer substantially duplicates SC-Analytics unless the evidence shows a clear complementary niche."""
    elif mode == "network":
        target = """Find professional PEER NETWORK contexts in Spain/EU where a real named person is likely to be active in Data Science, AI/ML, analytics, operations research, forecasting, optimization, data engineering or technical entrepreneurship.
This is NOT lead generation and NOT partner sourcing. The objective is to find approachable peers worth following and knowing because they publish, speak, build, research, organize communities, share technical work or are active practitioners/founders in the field.
Prioritize boutiques/startups, technical communities, specialist firms, research/innovation teams and visible practitioners over celebrities or huge corporate executives.
Prefer evidence of public professional activity: articles, talks, meetups, podcasts, open source, technical writing, conference participation, community leadership or product/research work.
The organization is context only; it is not a sales target."""
    else:
        target = """Find END-CLIENT operating businesses where external Data/Analytics/AI systems can create measurable value and where an internal Data Science team is unlikely or incomplete.
The target universe must be intentionally broad enough to sustain AT LEAST 1,000 plausible prospects across Spain/EU. Include self-employed professionals/autónomos, microbusinesses, SMEs, mid-market companies and larger organisations when the economics make sense.
BUSINESS OPPORTUNITY MATTERS MORE THAN HEADCOUNT OR SECTOR ASSUMPTIONS:
- 1-250 employees is a high-priority segment, not a hard boundary;
- 251-500 employees are fully acceptable when there is meaningful leverage;
- >500 employees and large/global companies are lower-priority, but DO NOT automatically reject them when a business unit, specialist modelling gap, overflow need or bounded external project is plausible;
- unknown headcount is acceptable;
- do NOT reject a company because the first search result omits employee count;
- actively look for non-obvious opportunities: data can improve planning, allocation, pricing, reporting, scheduling, risk or workflows even when the company is not in an obvious "data-heavy" industry.
Prioritize business models where advanced analytics is useful but a dedicated Data Science team is improbable:
- ecommerce brands and marketplace sellers;
- manufacturers, workshops and production businesses;
- wholesalers, distributors, importers and regional logistics/3PL operators;
- food businesses, restaurant groups, hospitality, aparthotels and tourism operators;
- clinics, dental/veterinary/physio groups and appointment-based service businesses;
- academies, training companies and subscription/member businesses;
- property managers, holiday-rental operators and real-estate operating businesses;
- maintenance, installation, field-service, fleet and route-based companies;
- professional/financial/administrative service firms with repetitive reporting or workflow volume;
- autonomous professionals with enough bookings, orders, inventory, quotes, customers or recurring administration to benefit from automation/decision systems.
Exclude Data/AI consultancies, BI/ERP vendors, software vendors, recruitment firms and agencies whose core product overlaps SC-Analytics; route those to PARTNER mode instead.
Look for either a concrete trigger OR evergreen operational leverage: inventory, demand, bookings, staffing, routing, capacity, pricing, scheduling, cash-flow, risk, reporting, repetitive workflows, multi-location operations or high transaction volume."""
    return f"""Generate 12 distinct public-web search queries to find NEW {mode} candidates for SC-Analytics.
Return JSON array of strings only.
{target}
Avoid these already stored domains: {sorted(existing_websites)[:150]}.
Use normal public web search syntax, never LinkedIn scraping instructions.

BRAIN:
{brain}
"""


def _qualification_prompt(mode: str, pool_target: int, existing_websites: set[str], brain: str, hits: list) -> str:
    if mode == "partner":
        rules = f"""For PARTNER mode, each candidate must be a plausible complementary channel. Return additional keys:
- partnership_model: choose one from {PARTNER_MODELS}
- partnership_value: one concise sentence explaining what they gain commercially/operationally from working with SC-Analytics
- recommended_service: choose the ONE SC-Analytics capability that best fills their likely gap from {SERVICES}
- recommended_roles: prioritize Founder/CEO/Managing Partner/Partner/Head of Consulting/Delivery/Business Development/Recruitment.
Do not choose a partner merely because it is another consultancy; explain the actual complementary gap or channel logic."""
    elif mode == "network":
        rules = """For NETWORK mode:
- the company/organization is only the professional context used to find ONE real person;
- prioritize contexts where a named practitioner/founder/creator can be supported by public evidence;
- recommended_roles should prioritize Founder, Data Scientist, ML/AI Engineer, Head of Data, Analytics Lead, Operations Research specialist, technical creator, researcher, speaker or community organizer;
- score reflects professional relevance + evidence of public activity + realistic approachability, NOT buying intent;
- recommended_service must be an empty string;
- partnership_model and partnership_value must be empty strings;
- employee_range may be empty; company size is not an ICP constraint here;
- avoid politicians, celebrities and generic corporate executives with no visible connection to the technical ecosystem."""
    else:
        rules = f"""For DIRECT CLIENT mode:
- choose operating/end-client businesses with a plausible decision/process SC-Analytics could improve;
- the PRIMARY criterion is business-model leverage + probability that the company does NOT have a mature internal Data Science team;
- include autónomos and 1-9 employee microbusinesses when recurring bookings/orders/inventory/scheduling/reporting/administration create enough leverage to justify a system;
- 1-250 employees is a high-priority segment; 251-500 requires slightly stronger evidence; >500 is lower-priority but NOT automatically excluded;
- unknown headcount is acceptable;
- for large/global enterprises, keep candidates only when supplied evidence supports a specific business-unit opportunity, specialist gap, overflow need or bounded project where external expertise is credible;
- exclude consultancies, marketing agencies, ERP/BI/software vendors, Data/AI service firms and recruitment companies from DIRECT CLIENT mode;
- a current expansion/hiring/news trigger is valuable but NOT mandatory: stable operational complexity can itself be a valid signal;
- prefer organizations where SC-Analytics could become the main external analytics/automation specialist rather than compete with a large in-house data department;
- score should combine economic leverage, evidence quality, likely external-buying fit and approachability. Do not reward company size by itself;
- employee_range should contain a numeric range/count only when supported; otherwise leave it empty;
- return business_model_fit: one of strong, medium, weak, excluded;
- return operational_leverage: one of strong, medium, weak;
- return internal_data_team_likelihood: one of low, medium, high, unknown;
- return enterprise_risk: one of low, medium, high;
- return specialist_gap: one of clear, possible, none, unknown;
- recommended_service: choose the ONE SC-Analytics capability most relevant from {SERVICES};
- partnership_model and partnership_value must be empty strings."""
    return f"""From the public search results below, select up to {pool_target} credible NEW company candidates so a downstream process can build one company + one decision-maker pair per requested lead.
Return a JSON array. Each item must contain:
name, website, country, industry, employee_range, source_url, capabilities (array), capability_gaps (array), score (0-10), score_reason, recommended_roles (array), recommended_service, partnership_model, partnership_value.
For DIRECT CLIENT mode also return business_model_fit, operational_leverage, internal_data_team_likelihood, enterprise_risk and specialist_gap.
IMPORTANT: website must be the company's official website/home domain when supported. source_url is the public evidence/article/job posting that triggered the candidate; never put a job board/news article in website when an official company site is supported.

Mode: {mode}
{rules}
Explain the observable public signal behind the score. Never invent unsupported facts. Use empty strings when unknown.
Exclude stored domains: {sorted(existing_websites)[:150]}.

SC-ANALYTICS BRAIN:
{brain}

SEARCH RESULTS:
{[{'title': h.title, 'url': h.url, 'snippet': h.snippet} for h in hits]}
"""


def research_companies(mode: str = "partner", limit: int = 10) -> list[dict]:
    mode = mode if mode in {"lead", "partner", "network"} else "lead"
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
    existing_names = {_company_name_key(str(row.get("name", ""))) for row in existing_companies if row.get("name")}
    requested = max(1, min(int(limit), 50))
    pool_target = max(requested * 5, 50)

    query_plan = llm.json(
        "You are a B2B research planner. Never instruct scraping LinkedIn.",
        _query_prompt(mode, existing_websites, brain),
    )
    queries = [str(q) for q in _as_list(query_plan)[:12]]
    if mode == "lead":
        queries.extend(_lead_discovery_queries(len(existing_companies)))
        queries.extend([
            'Spain marketplace seller ecommerce operations inventory autónomo',
            'Spain small financial advisory recurring reporting automation SME',
            'Spain professional services company repetitive reporting workflow automation SME',
            'Spain growing B2B company manual Excel reporting operations SME',
        ])
    elif mode == "network":
        queries.extend([
            'Spain data science founder speaker analytics podcast',
            'Barcelona machine learning engineer meetup speaker data',
            'Spain operations research optimization practitioner conference',
            'Spain AI founder technical blog machine learning',
            'Barcelona data analytics community organizer speaker',
            'Spain forecasting data science practitioner article',
            'Spain data engineering founder technical community',
            'Spain applied AI analytics startup founder technical',
        ])
    else:
        queries.extend([
            'Spain operations consulting Power BI digital transformation consultancy partner',
            'Spain management consultancy Power BI analytics consulting SME',
            'Spain boutique statistics R consulting data analytics company',
            'Spain ERP CRM consultancy analytics Power BI partner',
            'Spain recruitment staffing data science AI projects consultancy',
            'Spain technology consultancy business intelligence without data science',
            'Barcelona management operations consultancy digital transformation Power BI',
            'Spain freelance recruitment data analytics contractors staffing',
        ])

    hits = []
    for query in queries[:40]:
        hits.extend(search.search(query, count=12))
    hits = dedupe_hits(hits)[: max(pool_target * 5, 280)]

    raw_candidates = llm.json(
        "You are a strict professional-network researcher. Score conservatively and never invent missing facts." if mode == "network" else "You are a strict B2B qualification analyst. Score conservatively and never invent missing facts.",
        _qualification_prompt(mode, pool_target, existing_websites, brain, hits),
    )

    output: list[dict] = []
    seen_websites = set(existing_websites)
    seen_names = set(existing_names)
    for raw in _as_list(raw_candidates):
        if len(output) >= requested:
            break
        if not isinstance(raw, dict):
            continue
        company_name = str(raw.get("name", "")).strip()
        if not company_name:
            continue
        name_key = _company_name_key(company_name)
        if not name_key or name_key in seen_names:
            continue

        website = _resolve_official_website(company_name, str(raw.get("website", "")).strip(), search, llm)
        normalized_website = _website_key(website)
        if not website or not normalized_website or normalized_website in seen_websites:
            continue

        employee_range = str(raw.get("employee_range", "")).strip()
        score = float(raw.get("score", 0) or 0)
        size_verification = {"classification": "", "source_url": "", "evidence": ""}
        if mode == "lead":
            if not _direct_client_business_allowed(raw, score):
                continue

            # Headcount enriches prioritisation but never becomes a categorical
            # rejection by itself. Large-company evidence simply raises the
            # quality threshold required to keep the opportunity.
            if employee_range:
                if not _direct_client_size_allowed(employee_range, score):
                    continue
                size_verification = {
                    "classification": "verified_numeric",
                    "source_url": str(raw.get("source_url", "")).strip(),
                    "evidence": f"Employee range from discovery evidence: {employee_range}",
                }
            else:
                size_verification = _verify_direct_client_size(
                    str(raw.get("name", "")).strip(),
                    website,
                    search,
                    llm,
                )
                verified_range = str(size_verification.get("employee_range", "")).strip()
                classification = str(size_verification.get("classification", "unknown"))
                if classification == "over_500" and score < DIRECT_CLIENT_LARGE_MIN_SCORE:
                    continue
                if verified_range:
                    employee_range = verified_range
                    if not _direct_client_size_allowed(employee_range, score):
                        continue

        company_extra = {
            "recommended_service": "" if mode == "network" else str(raw.get("recommended_service", "")).strip(),
            "partnership_model": str(raw.get("partnership_model", "")).strip() if mode == "partner" else "",
            "partnership_value": str(raw.get("partnership_value", "")).strip() if mode == "partner" else "",
            "notes": (
                "Prospecting qualification — "
                f"business_fit={str(raw.get('business_model_fit', '')).strip() or 'unknown'}; "
                f"operational_leverage={str(raw.get('operational_leverage', '')).strip() or 'unknown'}; "
                f"internal_data_team={str(raw.get('internal_data_team_likelihood', '')).strip() or 'unknown'}; "
                f"enterprise_risk={str(raw.get('enterprise_risk', '')).strip() or 'unknown'}; "
                f"size={employee_range or str(size_verification.get('classification', 'unknown'))}; "
                f"size_evidence={str(size_verification.get('evidence', '')).strip() or 'pending'}"
            ) if mode == "lead" else "",
        }
        candidate = CompanyCandidate(
            company_id=new_id("company"),
            tenant_id=tenant_id,
            name=company_name,
            website=website,
            country=str(raw.get("country", "")).strip(),
            industry=str(raw.get("industry", "")).strip(),
            employee_range=employee_range,
            source_url=str(raw.get("source_url", "")).strip(),
            fit_type=mode,
            score=score,
            score_reason=str(raw.get("score_reason", "")).strip(),
            capabilities=list(raw.get("capabilities") or []),
            capability_gaps=list(raw.get("capability_gaps") or []),
        )
        roles = [str(r) for r in (raw.get("recommended_roles") or [])][:7]
        candidate.linkedin_url = _linkedin_company_url(candidate.name, search, llm)

        # Persist a valid company BEFORE person enrichment. A missing public
        # executive profile should never erase a commercially valid target.
        company_row = to_dict(candidate)
        company_row.update(company_extra)
        stored_candidate = store.upsert("companies", company_row, key="tenant_id,website")
        candidate.company_id = stored_candidate.get("company_id", candidate.company_id)
        seen_websites.add(normalized_website)
        seen_names.add(name_key)

        primary_raw = _discover_primary_person(candidate, roles, search, llm, mode)
        if not primary_raw:
            enriched = dict(company_row)
            enriched["company_id"] = candidate.company_id
            enriched["people"] = []
            enriched["decision_maker_status"] = "pending_enrichment"
            enriched["requested_batch_size"] = requested
            output.append(enriched)
            continue

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
            "source": "partner_prospecting" if mode == "partner" else "networking" if mode == "network" else "prospecting",
            "evidence": str(primary_raw.get("evidence", "")).strip(),
            "notes": "",
            "completed_at": None,
        })
        stored_person = store.upsert("people", person_dict, key="tenant_id,company_id,name")
        target_id = stored_person.get("person_id", person.person_id)

        outreach = _draft_outreach(mode, candidate, stored_person, company_extra, brain, search, llm)
        display_plan = _display_plan(outreach, mode, company_extra)
        person_updates = {
            "recommended_message": display_plan,
            "outreach_angle": outreach.get("angle", ""),
            "connection_note": outreach.get("connection_note", ""),
            "follow_up_message": outreach.get("follow_up", ""),
            "recommended_action": outreach.get("recommended_action", "connect_then_message"),
            "sc_analytics_action": outreach.get("sc_analytics_action", "invite_to_follow_after_connection"),
            "contact_reason": outreach.get("contact_reason", ""),
            "research_context": outreach.get("research_context", {}),
            "personal_hook": outreach.get("personal_hook", ""),
            "open_question": outreach.get("open_question", ""),
            "recommended_service": outreach.get("recommended_service", company_extra.get("recommended_service", "")),
        }
        store.update("people", "person_id", target_id, person_updates)
        stored_person.update(person_updates)

        search_url = _linkedin_search_url(candidate, roles)
        common_payload = {
            "mode": mode,
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
            "personal_hook": outreach.get("personal_hook", ""),
            "open_question": outreach.get("open_question", ""),
            "recommended_service": outreach.get("recommended_service", ""),
            "outreach_angle": outreach.get("angle", ""),
            "recommended_action": outreach.get("recommended_action", "connect_then_message"),
            "sc_analytics_action": outreach.get("sc_analytics_action", "invite_to_follow_after_connection"),
            "partnership_model": company_extra.get("partnership_model", ""),
            "partnership_value": company_extra.get("partnership_value", ""),
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
            summary=f"{'Partner' if mode == 'partner' else 'Network' if mode == 'network' else 'Lead'} outreach: {candidate.name} ({candidate.score:.1f}/10)",
            payload=outreach_payload,
        )

        enriched = company_row
        enriched["people"] = [stored_person]
        enriched["requested_batch_size"] = requested
        output.append(enriched)

    return output
