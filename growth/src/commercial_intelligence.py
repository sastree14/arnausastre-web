from __future__ import annotations

from datetime import datetime, timezone
from urllib.parse import urlparse

from .brain import load_brain
from .config import load_config
from .llm import get_llm
from .models import CompanyCandidate, PersonCandidate, new_id, to_dict
from .prospecting import (
    _discover_primary_person,
    _display_plan,
    _draft_outreach,
    _linkedin_company_url,
)
from .research import BraveResearchClient, dedupe_hits, domain
from .storage import get_store


TRIGGER_QUERIES = [
    'Spain company "Demand Planner" hiring OR vacancy',
    'Spain company "Head of Supply Chain" hiring OR appointed',
    'Spain company "FP&A Manager" hiring OR vacancy',
    'Spain company "AI Engineer" hiring OR data team expansion',
    'Spain company opens new warehouse logistics expansion',
    'Spain company new distribution center expansion',
    'Spain company international expansion new market operations',
    'Spain company funding round growth expansion 2026',
    'Spain company ERP migration Dynamics SAP Odoo implementation',
    'Spain retailer ecommerce expansion inventory warehouse 2026',
    'Spain manufacturer capacity expansion production plant 2026',
    'Spain logistics fleet expansion new hub 2026',
]

OFFER_KEYS = {
    'Demand Forecasting & Inventory Sprint',
    'AI Automation Assessment',
    'FP&A / Cash Flow Forecasting System',
    'Operations Optimization Sprint',
    'Data & BI Audit',
}


def _website_key(value: str) -> str:
    raw = str(value or '').strip()
    if not raw:
        return ''
    try:
        parsed = urlparse(raw if '://' in raw else f'https://{raw}')
        return parsed.netloc.lower().removeprefix('www.').rstrip('/')
    except ValueError:
        return ''


def _as_list(value) -> list:
    if isinstance(value, list):
        return value
    if isinstance(value, dict):
        for key in ('signals', 'results', 'candidates'):
            nested = value.get(key)
            if isinstance(nested, list):
                return nested
    return []


def _normalize_offer(value: str) -> str:
    value = str(value or '').strip()
    return value if value in OFFER_KEYS else ''


def _observed_at(value: str) -> str | None:
    raw = str(value or '').strip()
    if not raw:
        return None
    try:
        parsed = datetime.fromisoformat(raw.replace('Z', '+00:00'))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.isoformat()
    except ValueError:
        try:
            parsed = datetime.fromisoformat(f'{raw}T00:00:00+00:00')
            return parsed.isoformat()
        except ValueError:
            return None


def _public_business_phone(company_name: str, website: str, search: BraveResearchClient, llm) -> tuple[str, str]:
    host = _website_key(website)
    queries = [f'"{company_name}" teléfono contacto', f'"{company_name}" phone contact']
    if host:
        queries.insert(0, f'site:{host} contacto teléfono OR phone')
    hits = []
    for query in queries:
        hits.extend(search.search(query, count=6))
    hits = dedupe_hits(hits)[:12]
    if not hits:
        return '', ''

    response = llm.json(
        'Extract only a clearly public business/company phone number from supplied search snippets. Never invent a number and never infer a private mobile number.',
        f'''Company: {company_name}
Website: {website}
Return one JSON object with phone and source_url. The phone must be visibly supported by the supplied result and be a company/business contact number. If uncertain return empty strings.
RESULTS:
{[{'title': h.title, 'url': h.url, 'snippet': h.snippet} for h in hits]}''',
    )
    if not isinstance(response, dict):
        return '', ''
    phone = str(response.get('phone', '')).strip()
    source_url = str(response.get('source_url', '')).strip()
    allowed = {h.url for h in hits}
    if not phone or source_url not in allowed:
        return '', ''
    return phone, source_url


def run_commercial_signal_scan(limit: int = 12) -> list[dict]:
    cfg = load_config()
    tenant_id = cfg['company']['tenant_id']
    search = BraveResearchClient()
    llm = get_llm()
    store = get_store()
    brain = load_brain([
        'company/services.md',
        'commercial/icp.md',
        'commercial/channels.md',
        'company/principles.md',
        'voice/arnau_voice.md',
        'voice/forbidden_language.md',
    ])

    requested = max(1, min(int(limit), 40))
    hits = []
    for query in TRIGGER_QUERIES:
        hits.extend(search.search(query, count=10))
    hits = dedupe_hits(hits)[:220]

    classified = llm.json(
        'You are a trigger-based B2B sales intelligence analyst. Use only supplied public search evidence. Never invent a company event, date, role or pain point.',
        f'''Select up to {requested * 2} strong commercial signals for SC-Analytics from the search results.
Return a JSON array. Each item must contain:
company_name, website, country, industry, signal_type, title, summary, source_url, observed_at, evidence, strength (0-10), recommended_service, recommended_offer, suggested_roles (array).

Allowed signal_type examples: hiring_supply_chain, hiring_fpa, hiring_ai, hiring_operations, funding, warehouse_expansion, network_expansion, international_expansion, erp_migration, new_management, capacity_growth, process_scaling, reporting_growth.
Allowed recommended_offer values exactly:
- Demand Forecasting & Inventory Sprint
- AI Automation Assessment
- FP&A / Cash Flow Forecasting System
- Operations Optimization Sprint
- Data & BI Audit

Rules:
- A signal must describe something happening now/recently, not merely a generic company description.
- strength reflects both evidence quality and commercial relevance for SC-Analytics.
- recommended_service is the technical capability; recommended_offer is the packaged entry offer.
- suggested_roles should name 2-4 decision-maker roles appropriate to the event.
- Never claim the company has a private/internal problem. Frame the commercial opportunity as a hypothesis from the observable signal.
- Prefer Spain/EU operating companies where a focused discovery could plausibly lead to forecasting, optimization, financial planning, Data/BI or AI automation work.

SC-ANALYTICS BRAIN:
{brain}

SEARCH RESULTS:
{[{'title': h.title, 'url': h.url, 'snippet': h.snippet, 'query': h.query} for h in hits]}''',
    )

    hit_urls = {h.url for h in hits}
    existing_companies = store.filter('companies', tenant_id=tenant_id)
    by_domain = {
        _website_key(str(row.get('website', ''))): row
        for row in existing_companies
        if _website_key(str(row.get('website', '')))
    }
    output: list[dict] = []

    for raw in _as_list(classified):
        if len(output) >= requested:
            break
        if not isinstance(raw, dict):
            continue

        source_url = str(raw.get('source_url', '')).strip()
        website = str(raw.get('website', '')).strip()
        company_name = str(raw.get('company_name', '')).strip()
        if not source_url or source_url not in hit_urls or not website or not company_name:
            continue

        strength = float(raw.get('strength', 0) or 0)
        if strength < 6.5:
            continue

        website_key = _website_key(website)
        existing = by_domain.get(website_key)
        if existing and str(existing.get('fit_type') or 'lead') == 'partner':
            continue

        offer = _normalize_offer(str(raw.get('recommended_offer', '')))
        service = str(raw.get('recommended_service', '')).strip()
        suggested_roles = [str(role).strip() for role in (raw.get('suggested_roles') or []) if str(role).strip()][:4]
        company_extra = {
            'recommended_service': service,
            'partnership_model': '',
            'partnership_value': '',
        }

        candidate = CompanyCandidate(
            company_id=str(existing.get('company_id')) if existing else new_id('company'),
            tenant_id=tenant_id,
            name=company_name,
            website=website,
            country=str(raw.get('country', '')).strip(),
            industry=str(raw.get('industry', '')).strip(),
            employee_range=str(existing.get('employee_range', '')) if existing else '',
            source_url=source_url,
            fit_type='lead',
            score=max(float(existing.get('score', 0) or 0), strength) if existing else strength,
            score_reason=str(raw.get('evidence', '')).strip(),
            capabilities=list(existing.get('capabilities') or []) if existing else [],
            capability_gaps=[str(raw.get('summary', '')).strip()] if raw.get('summary') else [],
        )
        candidate.linkedin_url = str(existing.get('linkedin_url', '')).strip() if existing else ''
        if not candidate.linkedin_url:
            candidate.linkedin_url = _linkedin_company_url(company_name, search, llm)

        company_row = to_dict(candidate)
        company_row.update({
            'status': str(existing.get('status', 'candidate')) if existing else 'candidate',
            'notes': str(existing.get('notes', '')) if existing else '',
            'completed_at': existing.get('completed_at') if existing else None,
            'recommended_service': service or (str(existing.get('recommended_service', '')) if existing else ''),
            'recommended_offer': offer or (str(existing.get('recommended_offer', '')) if existing else ''),
            'partnership_model': '',
            'partnership_value': '',
        })
        stored_company = store.upsert('companies', company_row, key='tenant_id,website')
        candidate.company_id = str(stored_company.get('company_id') or candidate.company_id)
        by_domain[website_key] = stored_company

        phone, phone_source_url = _public_business_phone(company_name, website, search, llm) if strength >= 8 else ('', '')
        if phone:
            store.update('companies', 'company_id', candidate.company_id, {
                'phone': phone,
                'phone_source_url': phone_source_url,
            })

        primary_raw = _discover_primary_person(candidate, suggested_roles, search, llm, 'lead')
        person_id = ''
        if primary_raw:
            person = PersonCandidate(
                person_id=new_id('person'),
                tenant_id=tenant_id,
                company_id=candidate.company_id,
                name=str(primary_raw.get('name', '')).strip(),
                role=str(primary_raw.get('role', '')).strip(),
                linkedin_url=str(primary_raw.get('linkedin_url', '')).strip(),
                public_source_url=str(primary_raw.get('public_source_url', '')).strip(),
                relevance_score=float(primary_raw.get('relevance_score', strength) or strength),
            )
            person_payload = to_dict(person)
            person_payload.update({
                'email': '',
                'phone': phone,
                'phone_source_url': phone_source_url,
                'phone_kind': 'company_public' if phone else '',
                'source': 'commercial_signal',
                'evidence': str(primary_raw.get('evidence', '')).strip(),
                'notes': '',
                'recommended_offer': offer,
                'completed_at': None,
            })
            stored_person = store.upsert('people', person_payload, key='tenant_id,company_id,name')
            person_id = str(stored_person.get('person_id') or person.person_id)

            outreach = _draft_outreach('lead', candidate, stored_person, company_extra, brain, search, llm)
            display_plan = _display_plan(outreach, 'lead', company_extra)
            store.update('people', 'person_id', person_id, {
                'recommended_message': display_plan,
                'outreach_angle': str(outreach.get('angle', '')).strip(),
                'connection_note': str(outreach.get('connection_note', '')).strip(),
                'follow_up_message': str(outreach.get('follow_up', '')).strip(),
                'recommended_action': str(outreach.get('recommended_action', 'connect_then_message')).strip(),
                'sc_analytics_action': str(outreach.get('sc_analytics_action', 'invite_to_follow_after_connection')).strip(),
                'contact_reason': str(outreach.get('contact_reason', '')).strip(),
                'research_context': {
                    **dict(outreach.get('research_context') or {}),
                    'signal_type': str(raw.get('signal_type', '')).strip(),
                    'signal_source_url': source_url,
                    'recommended_offer': offer,
                },
                'personal_hook': str(outreach.get('personal_hook', '')).strip(),
                'open_question': str(outreach.get('open_question', '')).strip(),
                'recommended_service': str(outreach.get('recommended_service', '')).strip() or service,
                'recommended_offer': offer,
            })

        signal = {
            'signal_id': new_id('signal'),
            'tenant_id': tenant_id,
            'company_id': candidate.company_id,
            'company_name': company_name,
            'website': website,
            'signal_type': str(raw.get('signal_type', '')).strip() or 'market_signal',
            'title': str(raw.get('title', '')).strip() or company_name,
            'summary': str(raw.get('summary', '')).strip(),
            'source_url': source_url,
            'source_domain': domain(source_url),
            'observed_at': _observed_at(str(raw.get('observed_at', ''))),
            'strength': strength,
            'evidence': str(raw.get('evidence', '')).strip(),
            'recommended_service': service,
            'recommended_offer': offer,
            'suggested_roles': suggested_roles,
            'phone': phone,
            'phone_source_url': phone_source_url,
            'status': 'new',
            'metadata': {'person_id': person_id},
            'created_at': datetime.now(timezone.utc).isoformat(),
        }
        stored_signal = store.upsert('commercial_signals', signal, key='tenant_id,source_url')
        output.append(stored_signal)

    return output
