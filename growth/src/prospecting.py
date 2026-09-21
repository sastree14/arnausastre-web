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

DIRECT_CLIENT_IDEAL_MAX_EMPLOYEES = 200
DIRECT_CLIENT_HARD_MAX_EMPLOYEES = 500
DIRECT_CLIENT_MIN_SCORE = 6.0
DIRECT_CLIENT_STRETCH_MIN_SCORE = 8.0


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
    employee_upper = _employee_upper_bound(employee_range)
    if employee_upper is None:
        return False
    if employee_upper > DIRECT_CLIENT_HARD_MAX_EMPLOYEES:
        return False
    if employee_upper > DIRECT_CLIENT_IDEAL_MAX_EMPLOYEES and score < DIRECT_CLIENT_STRETCH_MIN_SCORE:
        return False
    return score >= DIRECT_CLIENT_MIN_SCORE


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
        roles = roles or ["CEO", "Founder", "COO", "Head of Operations", "CFO", "CTO"]
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
        target = """Find END-CLIENT/OPERATING SMEs and lower-mid-market companies, not consultancies/agencies/data vendors.
SC-Analytics should plausibly be able to become their primary external Data/Analytics/AI specialist rather than one vendor among dozens.
HEADCOUNT IS A CORE ICP FILTER:
- ideal: 10-200 employees;
- acceptable stretch: 201-500 employees only with unusually strong fit;
- exclude companies above 500 employees, global enterprises and household-name multinationals;
- employee size must be supported by the supplied public evidence; if a numeric employee range/count is not supported, do not return the candidate.
Diversify across ecommerce/retail, manufacturing, wholesale/distribution, regional logistics operators, food, healthcare groups, hospitality/travel, financial services and growing B2B companies.
Look for observable operational complexity: expansion, inventory, demand, capacity, pricing, planning, finance/risk, resource allocation, reporting or repetitive workflows where one SC-Analytics capability could improve an actual decision."""
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
- choose operating/end-client companies with a plausible business decision/process SC-Analytics could improve;
- target companies where SC-Analytics could realistically act as the main external Data/Analytics/AI provider;
- IDEAL HEADCOUNT: 10-200 employees;
- HARD MAXIMUM: 500 employees. Never select a candidate above 500 employees;
- candidates in the 201-500 range require materially stronger fit than candidates below 200;
- exclude global enterprises, household-name multinationals and large corporate groups even when one local unit appears relevant;
- employee_range is REQUIRED, must contain a numeric range/count, and must be grounded in supplied public evidence; if size is unclear, DO NOT select the candidate;
- candidates with 201-500 employees must have score >= 8.0 and a particularly strong fit;
- exclude consultancies, marketing agencies, ERP vendors, data/AI service firms and recruitment companies;
- diversify industries;
- recommended_service: choose the ONE SC-Analytics capability most relevant from {SERVICES};
- partnership_model and partnership_value must be empty strings."""
    return f"""From the public search results below, select up to {pool_target} credible NEW company candidates so a downstream process can build one company + one decision-maker pair per requested lead.
Return a JSON array. Each item must contain:
name, website, country, industry, employee_range, source_url, capabilities (array), capability_gaps (array), score (0-10), score_reason, recommended_roles (array), recommended_service, partnership_model, partnership_value.

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
    requested = max(1, min(int(limit), 50))
    pool_target = max(requested * 5, 50)

    query_plan = llm.json(
        "You are a B2B research planner. Never instruct scraping LinkedIn.",
        _query_prompt(mode, existing_websites, brain),
    )
    queries = [str(q) for q in _as_list(query_plan)[:12]]
    if mode == "lead":
        queries.extend([
            'Spain SME ecommerce retailer inventory logistics expansion employees',
            'Spain SME manufacturer production planning capacity growth employees',
            'Spain SME wholesale distributor inventory warehouses employees',
            'Spain regional logistics operator fleet capacity expansion employees',
            'Spain SME healthcare clinics group expansion operations employees',
            'Spain SME hospitality hotel group expansion revenue operations employees',
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
    for query in queries[:22]:
        hits.extend(search.search(query, count=12))
    hits = dedupe_hits(hits)[: max(pool_target * 5, 280)]

    raw_candidates = llm.json(
        "You are a strict professional-network researcher. Score conservatively and never invent missing facts." if mode == "network" else "You are a strict B2B qualification analyst. Score conservatively and never invent missing facts.",
        _qualification_prompt(mode, pool_target, existing_websites, brain, hits),
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

        employee_range = str(raw.get("employee_range", "")).strip()
        score = float(raw.get("score", 0) or 0)
        if mode == "lead":
            # Headcount is a hard ICP gate, not a soft prompt. Unknown size used to
            # let enterprise names through (for example global logistics groups).
            # Prefer fewer, verifiable prospects over a full list with weak fit.
            if not _direct_client_size_allowed(employee_range, score):
                continue

        company_extra = {
            "recommended_service": "" if mode == "network" else str(raw.get("recommended_service", "")).strip(),
            "partnership_model": str(raw.get("partnership_model", "")).strip() if mode == "partner" else "",
            "partnership_value": str(raw.get("partnership_value", "")).strip() if mode == "partner" else "",
        }
        candidate = CompanyCandidate(
            company_id=new_id("company"),
            tenant_id=tenant_id,
            name=str(raw.get("name", "")).strip(),
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
        primary_raw = _discover_primary_person(candidate, roles, search, llm, mode)
        if not primary_raw:
            continue

        company_row = to_dict(candidate)
        company_row.update(company_extra)
        stored_candidate = store.upsert("companies", company_row, key="tenant_id,website")
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
