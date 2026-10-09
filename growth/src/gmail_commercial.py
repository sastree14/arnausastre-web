"""Conservative, deterministic Gmail evidence. Never sends mail or guesses identities."""
from __future__ import annotations
import base64
import re
from email.utils import getaddresses
from urllib.parse import urlparse

CONSUMER_DOMAINS = {'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'proton.me', 'protonmail.com', 'live.com', 'aol.com'}


def addresses(value):
    return [email.lower().strip() for _, email in getaddresses([value]) if '@' in email]


def domain(value):
    raw = str(value or '').strip().lower()
    if '@' in raw:
        return raw.rsplit('@', 1)[1]
    return (urlparse(raw if '://' in raw else '//'+raw).hostname or '').removeprefix('www.')


def body_text(payload):
    """Decode inline text only; do not fetch attachments or execute HTML."""
    text = []
    if payload.get('mimeType') == 'text/plain':
        data = (payload.get('body') or {}).get('data', '')
        try:
            text.append(base64.urlsafe_b64decode(data + '=' * (-len(data) % 4)).decode('utf-8', errors='replace'))
        except (ValueError, TypeError):
            pass
    for part in payload.get('parts') or []:
        text.append(body_text(part))
    return '\n'.join(text)[:20000]


def message_kind(row):
    if 'SENT' in row.get('labels', []) or row.get('sender_email') == row.get('account_email'):
        return 'sent'
    headers = row.get('metadata', {}).get('headers', {})
    text = (row.get('subject', '') + '\n' + row.get('body', row.get('snippet', ''))).lower()
    sender = row.get('sender_email', '')
    if 'mailer-daemon' in sender or 'postmaster@' in sender or 'delivery-status' in headers.get('content-type', ''):
        return 'bounce'
    if re.search(r'out of office|automatic reply|fuera de (la )?oficina|vacation|on leave|absent du bureau', text):
        return 'out_of_office'
    automatic = headers.get('auto-submitted', '').lower() not in ('', 'no') or headers.get('precedence', '').lower() in ('bulk', 'list', 'junk')
    if automatic or re.search(r'thank you for contacting|we have received your|hemos recibido (tu|su)|acknowledge receipt|application (has been )?received', text):
        return 'automatic_ack'
    return 'human_reply'


def resolve_company(row, companies, people):
    emails = set(row.get('recipients', []) if message_kind(row) == 'sent' else [row.get('sender_email', '')])
    emails.discard(row.get('account_email', ''))
    exact = {p.get('company_id') for p in people if str(p.get('email') or '').lower() in emails and p.get('company_id')}
    exact.update(c.get('company_id') for c in companies if str(c.get('email') or '').lower() in emails)
    exact.discard(None)
    if len(exact) == 1:
        return next(iter(exact)), 'exact_email'
    if exact:
        return None, 'ambiguous_email'
    domains = {domain(e) for e in emails} - CONSUMER_DOMAINS
    matches = {c.get('company_id') for c in companies if {domain(c.get('canonical_domain')), domain(c.get('domain')), domain(c.get('website')), domain(c.get('email'))} & domains}
    matches.discard(None)
    return (next(iter(matches)), 'canonical_domain') if len(matches) == 1 else (None, 'ambiguous_domain' if matches else 'unmatched')


def thread_state(rows):
    """Latest human action wins. Auto replies never become interest or meetings."""
    human = [r for r in rows if message_kind(r) in ('sent', 'human_reply')]
    if not human:
        return None
    latest = max(human, key=lambda r: r['received_at'])
    return {'status': 'waiting_reply' if message_kind(latest) == 'sent' else 'pending_reply', 'occurred_at': latest['received_at'], 'message_key': latest['message_key']}
