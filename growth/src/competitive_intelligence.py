from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from urllib.parse import urlparse

from .brain import load_brain
from .config import load_config
from .llm import get_llm
from .models import new_id
from .research import BraveResearchClient, dedupe_hits
from .storage import get_store


DISCOVERY_QUERIES = [
    'Spain boutique data analytics consultancy AI business intelligence forecasting optimization',
    'Barcelona boutique data AI analytics consulting business decisions',
    'Madrid boutique AI data consultancy SME automation analytics',
    'Spain specialist data science consulting forecasting supply chain optimization SME',
    'Europe boutique analytics consultancy business first data AI small team',
    'Spain boutique AI automation consultancy business processes measurable results',
]

MEGA_FIRMS = {
    'accenture', 'bain', 'bcg', 'boston consulting group', 'capgemini', 'cognizant',
    'deloitte', 'ey', 'ernst young', 'globant', 'ibm', 'infosys', 'kpmg', 'mckinsey',
    'ntt data', 'pwc', 'pricewaterhousecoopers', 'tata consultancy services', 'tcs', 'wipro',
}

EVENT_TYPES = {
    'positioning', 'service_launch', 'pricing', 'case_study', 'hiring', 'partnership',
    'funding', 'expansion', 'content_campaign', 'leadership', 'technology', 'website_change', 'other',
}


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')


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
        for key in ('competitors', 'results', 'items', 'events'):
            nested = value.get(key)
            if isinstance(nested, list):
                return nested
    return []


def _score(value) -> float:
    try:
        return round(max(0.0, min(10.0, float(value or 0))), 1)
    except (TypeError, ValueError):
        return 0.0


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
            return datetime.fromisoformat(f'{raw}T00:00:00+00:00').isoformat()
        except ValueError:
            return None


def _is_mega_firm(name: str, website: str) -> bool:
    normalized = f'{name} {_website_key(website)}'.lower()
    return any(firm in normalized for firm in MEGA_FIRMS)


def _fingerprint(competitor_id: str, event_type: str, title: str, source_url: str) -> str:
    raw = '|'.join([
        competitor_id.strip().lower(),
        event_type.strip().lower(),
        title.strip().lower(),
        source_url.rstrip('/').strip().lower(),
    ])
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()[:24]


def _competition_brain() -> str:
    return load_brain([
        'company/identity.md',
        'company/positioning.md',
        'company/services.md',
        'company/principles.md',
        'commercial/icp.md',
    ])


def discover_competitors(limit: int = 8, focus: str = '') -> list[dict]:
    cfg = load_config()
    tenant_id = cfg['company']['tenant_id']
    search = BraveResearchClient()
    llm = get_llm(profile='balanced')
    store = get_store()
    requested = max(1, min(int(limit), 20))

    queries = list(DISCOVERY_QUERIES)
    if focus.strip():
        queries.insert(0, f'Spain Europe boutique consultancy {focus.strip()} data AI analytics')

    hits = []
    for query in queries:
        hits.extend(search.search(query, count=10))
    hits = dedupe_hits(hits)[:120]
    allowed_urls = {hit.url for hit in hits}

    result = llm.json(
        'You are a competitive-intelligence analyst for a small specialist Data, Analytics and AI consultancy. Use only the supplied public search evidence. Never invent company size, capabilities, positioning or claims.',
        f'''Identify up to {requested * 2} relevant competitors or close peers for SC-Analytics.

SC-Analytics is a specialist consultancy focused on business-first data, forecasting, optimization, analytics, AI/ML, automation and decision systems. Its principle is to understand the business problem before building technology.

Selection rules:
- Prefer independent boutique or specialist consultancies and small/mid-sized firms that are realistically comparable.
- Strongly prefer teams whose public philosophy is business-first, practical, measurable, custom and close to delivery.
- Exclude Big Four, global systems integrators, mega-consultancies and firms obviously operating at a radically different scale (for example Deloitte, Accenture, Capgemini, NTT DATA, IBM, PwC, KPMG, EY, McKinsey, BCG, Bain, Cognizant, Infosys, TCS, Wipro).
- Spain is preferred, then nearby Europe.
- A competitor may be direct or adjacent. Direct means meaningful overlap in Data/Analytics/AI/forecasting/optimization/automation consulting. Adjacent means partial overlap worth monitoring.
- If employee count is not explicitly evidenced, use an honest qualitative value such as "boutique / size not verified" rather than inventing a number.
- Do not select a firm unless its website/source is present in the supplied results.

Return a JSON array with:
name, website, country, city, employee_range, category (direct|adjacent), positioning, services (array), philosophy_fit (0-10), market_overlap (0-10), relevance_score (0-10), why_relevant, differentiation, primary_source_url, linkedin_url.

Optional focus: {focus or 'none'}

SC-ANALYTICS BRAIN:
{_competition_brain()}

SEARCH RESULTS:
{[{'title': h.title, 'url': h.url, 'snippet': h.snippet, 'query': h.query} for h in hits]}''',
    )

    existing = store.filter('competitors', tenant_id=tenant_id)
    by_domain = {_website_key(row.get('website', '')): row for row in existing if _website_key(row.get('website', ''))}
    now = _utc_now()
    output: list[dict] = []

    for raw in _as_list(result):
        if len(output) >= requested or not isinstance(raw, dict):
            continue
        name = str(raw.get('name', '')).strip()
        website = str(raw.get('website', '')).strip()
        source_url = str(raw.get('primary_source_url', '')).strip()
        if not name or not website or not source_url or source_url not in allowed_urls:
            continue
        if _is_mega_firm(name, website):
            continue
        domain_key = _website_key(website)
        if not domain_key:
            continue
        relevance = _score(raw.get('relevance_score'))
        philosophy = _score(raw.get('philosophy_fit'))
        overlap = _score(raw.get('market_overlap'))
        if relevance < 6.0 or max(philosophy, overlap) < 5.5:
            continue

        previous = by_domain.get(domain_key)
        row = {
            'competitor_id': str(previous.get('competitor_id')) if previous else new_id('competitor'),
            'tenant_id': tenant_id,
            'name': name,
            'website': website,
            'country': str(raw.get('country', '')).strip(),
            'city': str(raw.get('city', '')).strip(),
            'employee_range': str(raw.get('employee_range', '')).strip() or 'boutique / size not verified',
            'category': str(raw.get('category', 'direct')).strip() if str(raw.get('category', 'direct')).strip() in {'direct', 'adjacent'} else 'adjacent',
            'positioning': str(raw.get('positioning', '')).strip(),
            'services': [str(item).strip() for item in (raw.get('services') or []) if str(item).strip()][:10],
            'philosophy_fit': philosophy,
            'market_overlap': overlap,
            'relevance_score': relevance,
            'why_relevant': str(raw.get('why_relevant', '')).strip(),
            'differentiation': str(raw.get('differentiation', '')).strip(),
            'primary_source_url': source_url,
            'linkedin_url': str(raw.get('linkedin_url', '')).strip(),
            'status': str(previous.get('status', 'active')) if previous else 'active',
            'is_monitored': bool(previous.get('is_monitored', False)) if previous else False,
            'monitoring_frequency': str(previous.get('monitoring_frequency', 'daily')) if previous else 'daily',
            'last_discovered_at': now,
            'last_checked_at': previous.get('last_checked_at') if previous else None,
            'last_change_at': previous.get('last_change_at') if previous else None,
            'created_at': previous.get('created_at') or now if previous else now,
            'updated_at': now,
        }
        stored = store.upsert('competitors', row, key='tenant_id,website')
        by_domain[domain_key] = stored
        output.append(stored)
    return output


def refresh_competitor(competitor_id: str, max_events: int = 8) -> dict:
    cfg = load_config()
    tenant_id = cfg['company']['tenant_id']
    store = get_store()
    rows = store.filter('competitors', competitor_id=competitor_id)
    if not rows:
        raise ValueError(f'Competitor not found: {competitor_id}')
    competitor = rows[0]
    name = str(competitor.get('name', '')).strip()
    website = str(competitor.get('website', '')).strip()
    host = _website_key(website)
    search = BraveResearchClient()
    llm = get_llm(profile='balanced')

    queries = [
        f'"{name}" latest news services partnership hiring expansion 2026',
        f'"{name}" new service case study client AI data analytics 2026',
        f'"{name}" pricing positioning announcement 2026',
    ]
    if host:
        queries.extend([
            f'site:{host} 2026 new service OR case OR partnership OR client',
            f'site:{host} 2026 hiring OR team OR expansion OR launch',
        ])

    hits = []
    for query in queries:
        hits.extend(search.search(query, count=8))
    hits = dedupe_hits(hits)[:70]
    allowed_urls = {hit.url for hit in hits}
    existing = store.filter('competitor_events', competitor_id=competitor_id)
    existing_urls = {str(row.get('source_url', '')).rstrip('/') for row in existing}
    existing_fingerprints = {str(row.get('fingerprint', '')) for row in existing}

    result = llm.json(
        'You monitor a named competitor using public evidence only. Report concrete observable movements, not generic company descriptions. Never invent a date, client, service, hiring move, price, partnership or strategy.',
        f'''Company being monitored:
{competitor}

From the supplied search results, identify up to {max(1, min(int(max_events), 12))} material movements worth tracking.
A movement must be new/recent and commercially meaningful: positioning change, service launch, pricing, case study, hiring, partnership, funding, expansion, content campaign, leadership, technology or website change.
Do not treat an evergreen homepage description as a movement unless the evidence clearly indicates a new change.
If no defensible new movement exists, return an empty array.

For every event return:
event_type, title, summary, evidence, source_url, observed_at, significance (0-10), impact_for_sc, recommended_response.
impact_for_sc and recommended_response are analysis, not factual claims about the competitor. Keep them concise and practical.
source_url must exactly match one supplied result URL.

SEARCH RESULTS:
{[{'title': h.title, 'url': h.url, 'snippet': h.snippet, 'query': h.query} for h in hits]}''',
    )

    now = _utc_now()
    new_events: list[dict] = []
    for raw in _as_list(result):
        if not isinstance(raw, dict):
            continue
        source_url = str(raw.get('source_url', '')).strip()
        title = str(raw.get('title', '')).strip()
        event_type = str(raw.get('event_type', 'other')).strip().lower()
        if event_type not in EVENT_TYPES:
            event_type = 'other'
        if not title or not source_url or source_url not in allowed_urls:
            continue
        fingerprint = _fingerprint(competitor_id, event_type, title, source_url)
        if fingerprint in existing_fingerprints or source_url.rstrip('/') in existing_urls:
            continue
        significance = _score(raw.get('significance'))
        if significance < 4.0:
            continue
        event = {
            'event_id': new_id('competitor_event'),
            'tenant_id': tenant_id,
            'competitor_id': competitor_id,
            'event_type': event_type,
            'title': title,
            'summary': str(raw.get('summary', '')).strip(),
            'evidence': str(raw.get('evidence', '')).strip(),
            'source_url': source_url,
            'observed_at': _observed_at(str(raw.get('observed_at', ''))),
            'significance': significance,
            'impact_for_sc': str(raw.get('impact_for_sc', '')).strip(),
            'recommended_response': str(raw.get('recommended_response', '')).strip(),
            'fingerprint': fingerprint,
            'created_at': now,
        }
        stored = store.upsert('competitor_events', event, key='tenant_id,competitor_id,fingerprint')
        new_events.append(stored)
        existing_fingerprints.add(fingerprint)
        existing_urls.add(source_url.rstrip('/'))

    changes = {'last_checked_at': now, 'updated_at': now}
    if new_events:
        changes['last_change_at'] = now
    updated = store.update('competitors', 'competitor_id', competitor_id, changes)
    return {
        'competitor_id': competitor_id,
        'company': name,
        'checked_at': now,
        'new_events': new_events,
        'new_event_count': len(new_events),
        'competitor': updated or {**competitor, **changes},
    }


def refresh_monitored_competitors(limit: int = 20) -> list[dict]:
    cfg = load_config()
    tenant_id = cfg['company']['tenant_id']
    store = get_store()
    monitored = [
        row for row in store.filter('competitors', tenant_id=tenant_id)
        if bool(row.get('is_monitored')) and str(row.get('status', 'active')) == 'active'
    ][:max(1, min(int(limit), 50))]
    results: list[dict] = []
    for competitor in monitored:
        try:
            results.append(refresh_competitor(str(competitor['competitor_id'])))
        except Exception as exc:
            results.append({
                'competitor_id': competitor.get('competitor_id'),
                'company': competitor.get('name'),
                'status': 'failed',
                'error': str(exc),
            })
    return results
