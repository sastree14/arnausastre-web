"""Persistent scout exclusions shared by fresh discovery and signal research.

A known entity is follow-up work, never a fresh suggestion. Explicit
include_existing permits enrichment, but cannot reopen a closed relationship.
"""
from urllib.parse import unquote, urlsplit
import re
import unicodedata

TERMINAL_STATUSES = {'declined', 'rejected', 'discarded', 'do_not_contact', 'closed', 'lost', 'archived'}


def canonical_domain(value: str) -> str:
    raw = str(value or '').strip()
    if not raw:
        return ''
    try:
        host = urlsplit(raw if '://' in raw else 'https://' + raw).hostname or ''
        return host.lower().removeprefix('www.').rstrip('.').encode('idna').decode('ascii')
    except (ValueError, UnicodeError):
        return ''


def normalized_name(value: str) -> str:
    value = unicodedata.normalize('NFKD', str(value or '')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '', value.lower())


def canonical_linkedin_profile(value: str) -> str:
    try:
        parsed = urlsplit(str(value or '').strip())
        host = (parsed.hostname or '').lower()
        if host != 'linkedin.com' and not host.endswith('.linkedin.com'):
            return ''
        parts = [unquote(p).lower() for p in parsed.path.split('/') if p]
        if len(parts) < 2 or parts[0] != 'in':
            return ''
        return 'https://www.linkedin.com/in/' + parts[1]
    except ValueError:
        return ''


def company_matches(row: dict, website: str, name: str) -> bool:
    domain = canonical_domain(website)
    row_domain = canonical_domain(row.get('canonical_domain') or row.get('website', ''))
    return bool((domain and domain == row_domain) or (normalized_name(name) and normalized_name(name) == normalized_name(row.get('name', ''))))


def find_existing_company(rows: list[dict], website: str, name: str) -> dict | None:
    return next((row for row in rows if company_matches(row, website, name)), None)


def may_discover(existing: dict | None, *, include_existing: bool = False) -> bool:
    if existing is None:
        return True
    if str(existing.get('status', '')).lower() in TERMINAL_STATUSES or str(existing.get('contact_status', '')).lower() in TERMINAL_STATUSES:
        return False
    if existing.get('completed_at'):
        return False
    # An explicit follow-up operation, never exclude=false alone, permits revisit.
    return include_existing


def find_existing_person(rows: list[dict], person: dict) -> dict | None:
    profile = canonical_linkedin_profile(person.get('linkedin_url', ''))
    name = normalized_name(person.get('name', ''))
    for row in rows:
        row_profile = canonical_linkedin_profile(row.get('canonical_linkedin_url') or row.get('linkedin_url', ''))
        if profile and profile == row_profile:
            return row
        if name and name == normalized_name(row.get('name', '')) and row.get('company_id') == person.get('company_id'):
            return row
    return None


def preserve_existing_record(existing: dict | None, proposed: dict) -> dict:
    """Merge enrichment while retaining identities, lifecycle and contact data."""
    if not existing:
        return proposed
    result = {**existing, **proposed}
    for key in ('company_id', 'person_id', 'created_at', 'status', 'contact_status', 'linkedin_status', 'completed_at', 'exclude_from_discovery', 'relationship_type', 'notes', 'email', 'phone'):
        if key in existing:
            result[key] = existing[key]
    return result
