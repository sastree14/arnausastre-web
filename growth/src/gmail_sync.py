from __future__ import annotations

import os
import re
from datetime import datetime, timedelta, timezone
from email.utils import parseaddr, parsedate_to_datetime

from .gmail_commercial import addresses, body_text, message_kind, resolve_company, thread_state
from typing import Any
from urllib.parse import quote

import requests

from .integrations import decrypt_secret, encrypt_secret
from .llm import get_llm
from .storage import get_store

TENANT_ID = "sc-analytics"
GMAIL_PROVIDER = "gmail"
ACCOUNT_TYPE = "mailbox"
ALLOWED_CATEGORIES = {"client", "lead", "partner", "finance", "legal", "operations", "team", "calendar", "account", "other", "low_value"}


def _now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _parse_time(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return parsed.replace(tzinfo=timezone.utc) if parsed.tzinfo is None else parsed.astimezone(timezone.utc)
    except ValueError:
        return None


def _connection_access_token(connection: dict[str, Any], store: Any) -> str:
    expires = _parse_time(connection.get("token_expires_at"))
    if expires and expires > datetime.now(timezone.utc):
        return decrypt_secret(str(connection.get("access_token_ciphertext") or ""))
    metadata = dict(connection.get("metadata") or {})
    encrypted_refresh = str(metadata.get("refresh_token_ciphertext") or "")
    if not encrypted_refresh:
        raise RuntimeError(f"Gmail connection {connection.get('provider_subject')} has no refresh token")
    client_id = (os.environ.get("GOOGLE_CLIENT_ID") or os.environ.get("GOOGLE_OAUTH_CLIENT_ID") or "").strip()
    client_secret = (os.environ.get("GOOGLE_CLIENT_SECRET") or os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET") or "").strip()
    if not client_id or not client_secret:
        raise RuntimeError("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required for Gmail sync")
    response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={"client_id": client_id, "client_secret": client_secret, "refresh_token": decrypt_secret(encrypted_refresh), "grant_type": "refresh_token"},
        timeout=30,
    )
    if response.status_code >= 400:
        raise RuntimeError(f"Google token refresh failed {response.status_code}: {response.text[:300]}")
    payload = response.json()
    token = str(payload.get("access_token") or "")
    if not token:
        raise RuntimeError("Google token refresh returned no access token")
    try:
        expires_in = max(60, int(payload.get("expires_in") or 3600))
    except (TypeError, ValueError):
        expires_in = 3600
    expires_at = (datetime.now(timezone.utc) + timedelta(seconds=expires_in)).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    connection_id = str(connection.get("connection_id") or "").strip()
    if connection_id:
        changes = {"access_token_ciphertext": encrypt_secret(token), "token_expires_at": expires_at, "updated_at": _now()}
        store.update("integration_connections", "connection_id", connection_id, changes)
        connection.update(changes)
    return token


def _header(message: dict[str, Any], name: str) -> str:
    headers = ((message.get("payload") or {}).get("headers") or [])
    for row in headers:
        if str(row.get("name") or "").lower() == name.lower():
            return str(row.get("value") or "")
    return ""


def _received_at(message: dict[str, Any]) -> str:
    raw = _header(message, "Date")
    if raw:
        try:
            value = parsedate_to_datetime(raw)
            if value.tzinfo is None:
                value = value.replace(tzinfo=timezone.utc)
            return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
        except Exception:
            pass
    internal = str(message.get("internalDate") or "")
    if internal.isdigit():
        return datetime.fromtimestamp(int(internal) / 1000, tz=timezone.utc).isoformat().replace("+00:00", "Z")
    return _now()


def _normalize_message(account: str, message: dict[str, Any]) -> dict[str, Any]:
    sender_name, sender_email = parseaddr(_header(message, "From"))
    recipients = addresses(_header(message, "To")) + addresses(_header(message, "Cc"))
    external_id = str(message.get("id") or "")
    return {
        "message_key": f"gmail:{account}:{external_id}",
        "tenant_id": TENANT_ID,
        "provider": "gmail",
        "account_email": account,
        "external_message_id": external_id,
        "thread_id": str(message.get("threadId") or ""),
        "sender_name": sender_name,
        "sender_email": sender_email.lower(),
        "recipients": recipients,
        "subject": _header(message, "Subject").strip(),
        "snippet": str(message.get("snippet") or "").strip(),
        "received_at": _received_at(message),
        "unread": "UNREAD" in (message.get("labelIds") or []),
        "labels": list(message.get("labelIds") or []),
        "metadata": {"history_id": message.get("historyId"), "headers": {str(h.get("name", "")).lower(): str(h.get("value", "")) for h in (message.get("payload") or {}).get("headers", [])}},
        "body": body_text(message.get("payload") or {}),
    }


def _heuristic(row: dict[str, Any]) -> dict[str, Any]:
    text = f"{row.get('sender_email', '')} {row.get('subject', '')} {row.get('snippet', '')}".lower()
    high = ("invoice", "payment", "proposal", "contract", "meeting", "calendar", "upwork", "client", "project", "interview", "legal", "bank", "overdue", "security alert", "verification")
    low = ("unsubscribe", "newsletter", "weekly digest", "promotion", "sale", "marketing update", "notification settings")
    score = 7 if any(word in text for word in high) else 2 if any(word in text for word in low) else 5
    category = "finance" if any(word in text for word in ("invoice", "payment", "bank", "overdue")) else "calendar" if any(word in text for word in ("meeting", "calendar")) else "other"
    return {"relevance_score": score, "category": category, "relevance_reason": "Clasificación heurística", "summary": row.get("snippet", "")[:260], "recommended_action": "Revisar" if score >= 5 else "Sin acción"}


def _classify(rows: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    if not rows:
        return {}
    compact = [{"message_key": row["message_key"], "account": row["account_email"], "from": row["sender_email"], "subject": row["subject"], "snippet": row["snippet"][:500], "unread": row["unread"]} for row in rows]
    try:
        result = get_llm(profile="fast").json(
            "You triage the founder inbox for SC-Analytics. Return JSON only and be conservative: important business mail must not be hidden.",
            f"""Classify each email for a central business inbox. Score relevance from 0 to 10.
High relevance: clients, leads, partners, proposals, projects, payments, invoices, banking, legal, contracts, meetings, hiring/interviews, account/security issues, direct human business messages and anything requiring a decision.
Low relevance: generic newsletters, promotions, social notifications, product marketing, automated digests and subscriptions unless they contain a concrete business issue.
Categories: client, lead, partner, finance, legal, operations, team, calendar, account, other, low_value.
Return {{"items":[{{"message_key":"...","relevance_score":0-10,"category":"...","relevance_reason":"short","summary":"one sentence","recommended_action":"short action"}}]}}.
Do not invent facts beyond subject/snippet.

MESSAGES:
{compact}""",
        )
        items = result.get("items", []) if isinstance(result, dict) else []
        output: dict[str, dict[str, Any]] = {}
        for item in items if isinstance(items, list) else []:
            if not isinstance(item, dict):
                continue
            key = str(item.get("message_key") or "")
            if not key:
                continue
            category = str(item.get("category") or "other")
            if category not in ALLOWED_CATEGORIES:
                category = "other"
            try:
                score = max(0.0, min(10.0, float(item.get("relevance_score", 0) or 0)))
            except (TypeError, ValueError):
                score = 0.0
            output[key] = {"relevance_score": score, "category": category, "relevance_reason": str(item.get("relevance_reason") or "")[:300], "summary": str(item.get("summary") or "")[:500], "recommended_action": str(item.get("recommended_action") or "")[:300]}
        return output
    except Exception:
        return {row["message_key"]: _heuristic(row) for row in rows}



def _commercial_rpc(store: Any, name: str, payload: dict[str, Any]) -> Any:
    if hasattr(store, 'rpc'):
        return store.rpc(name, payload)
    if not getattr(store, 'url', None) or not getattr(store, 'headers', None):
        raise RuntimeError('Commercial memory requires Supabase RPC; local sync cannot claim persistence')
    response = requests.post(f'{store.url}/rest/v1/rpc/{name}', headers=store.headers, json=payload, timeout=30)
    store._check(response)
    return response.json()


def sync_gmail(limit_per_account: int = 100, newer_than_days: int = 14) -> dict[str, Any]:
    """Read bounded incremental pages and whole selected threads, never mark read or send.

    Page cursor is retained on partial failure; timestamp moves only on a complete scan.
    Existing message IDs are replayed through the idempotent commercial event RPC.
    """
    store = get_store()
    connections = [r for r in store.list('integration_connections') if r.get('tenant_id') == TENANT_ID and str(r.get('provider', '')).lower() == GMAIL_PROVIDER and str(r.get('account_type', '')).lower() in ('mailbox', 'personal', 'corporate') and not (r.get('metadata') or {}).get('disconnected')]
    existing = {r['message_key']: r for r in store.list('crm_inbox_messages')}
    snapshot = _commercial_rpc(store, 'mcp_commercial_memory_snapshot', {'p_company_id': None, 'p_limit': 250}) or {}
    companies, people = snapshot.get('companies', []), snapshot.get('people', [])
    counts = {'accounts': len(connections), 'new_messages': 0, 'new_relevant': 0, 'commercial_events': 0, 'unmatched': 0, 'already_linked': 0, 'errors': [], 'runs': []}
    for connection in connections:
        account = str(connection.get('provider_subject') or '').lower().strip()
        if not account:
            continue
        started = _now()
        metadata = dict(connection.get('metadata') or {})
        prior = dict(metadata.get('gmail_sync') or {})
        last = _parse_time(prior.get('last_success_at'))
        lower = last - timedelta(hours=24) if last else datetime.now(timezone.utc) - timedelta(days=max(1, newer_than_days))
        query = prior.get('query') if prior.get('next_page_token') else f'after:{int(lower.timestamp())} -in:trash -in:spam'
        cursor = prior.get('next_page_token')
        window_started = prior.get('window_started_at') if cursor else started
        limit = max(1, min(250, int(limit_per_account)))
        run = {'account': account, 'started_at': started, 'query': query, 'scanned': 0, 'complete': False}
        try:
            token = _connection_access_token(connection, store)
            headers = {'Authorization': f'Bearer {token}'}
            threads_seen = set()
            fetched = {}
            while run['scanned'] < limit:
                params = {'q': query, 'maxResults': min(100, limit - run['scanned'])}
                if cursor:
                    params['pageToken'] = cursor
                listing = requests.get('https://gmail.googleapis.com/gmail/v1/users/me/messages', headers=headers, params=params, timeout=30)
                listing.raise_for_status()
                page = listing.json()
                # Keep input cursor until every message on this page persists successfully.
                for ref in page.get('messages', []):
                    thread_id = str(ref.get('threadId') or '')
                    if not thread_id:
                        raise RuntimeError('Gmail message reference missing threadId')
                    if thread_id not in threads_seen:
                        response = requests.get(f'https://gmail.googleapis.com/gmail/v1/users/me/threads/{thread_id}', headers=headers, params={'format': 'full'}, timeout=30)
                        response.raise_for_status()
                        for message in response.json().get('messages', []):
                            row = _normalize_message(account, message)
                            if row['external_message_id']:
                                fetched[row['message_key']] = row
                        threads_seen.add(thread_id)
                    run['scanned'] += 1
                # Chronological order prevents older hydrated context replacing latest state.
                for row in sorted(fetched.values(), key=lambda r: r['received_at']):
                    previous = existing.get(row['message_key'])
                    decision = _heuristic(row) if not previous else {k: previous.get(k) for k in ('relevance_score', 'category', 'relevance_reason', 'summary', 'recommended_action')}
                    score = float(decision.get('relevance_score') or 0)
                    kind = message_kind(row)
                    company_id, match = resolve_company(row, companies, people)
                    row['metadata'].update({'commercial_kind': kind, 'company_match': match, 'company_id': company_id})
                    stored = {**(previous or {}), **row, **decision, 'status': (previous or {}).get('status') or ('relevant' if score >= 5 else 'low_value'), 'updated_at': _now()}
                    # Inbox stores only snippet; full body is used transiently for classification.
                    stored.pop('body', None)
                    if not previous:
                        stored['created_at'] = _now()
                        counts['new_messages'] += 1
                        counts['new_relevant'] += int(score >= 5)
                    store.upsert('crm_inbox_messages', stored, key='message_key')
                    if company_id:
                        event_payload = _event_payload(row, company_id, kind)
                        counterpart_emails = set(row['recipients'] if kind == 'sent' else [row['sender_email']])
                        person_ids = {p.get('person_id') for p in people if p.get('company_id') == company_id and str(p.get('email') or '').lower() in counterpart_emails and p.get('person_id')}
                        if len(person_ids) == 1:
                            event_payload['event']['person_id'] = next(iter(person_ids))
                        existing_events = store.filter('interactions', tenant_id=TENANT_ID, idempotency_key=row['message_key'])
                        if existing_events:
                            _validate_existing_event(existing_events, row, company_id)
                            counts['already_linked'] += 1
                        else:
                            _commercial_rpc(store, 'mcp_commercial_memory_mutate', {'p_payload': event_payload})
                            counts['commercial_events'] += 1
                    else:
                        counts['unmatched'] += 1
                    existing[row['message_key']] = stored
                fetched.clear()
                cursor = page.get('nextPageToken')
                if not cursor:
                    run['complete'] = True
                    break
            state = {**prior, 'query': query, 'next_page_token': cursor, 'last_run_at': started, 'last_error': None, 'last_run': run, 'window_started_at': window_started}
            if run['complete']:
                state['last_success_at'] = window_started
        except Exception as exc:
            run['error'] = str(exc)[:400]
            counts['errors'].append({'account': account, 'error': run['error']})
            state = {**prior, 'query': query, 'next_page_token': cursor, 'last_run_at': started, 'last_error': run['error'], 'last_run': run, 'window_started_at': window_started}
        metadata['gmail_sync'] = state
        store.update('integration_connections', 'connection_id', connection['connection_id'], {'metadata': metadata, 'updated_at': _now()})
        counts['runs'].append(run)
    return counts


def _event_payload(row, company_id, kind):
    event_types = {'sent': 'email_sent', 'human_reply': 'human_reply', 'automatic_ack': 'auto_ack', 'out_of_office': 'out_of_office', 'bounce': 'bounce'}
    event = {
        'company_id': company_id, 'idempotency_key': row['message_key'], 'channel': 'email',
        'direction': 'outbound' if kind == 'sent' else 'inbound',
        'event_type': event_types[kind], 'occurred_at': row['received_at'],
        'summary': (row['subject'] + ': ' + row['snippet'])[:500],
        'source': 'gmail', 'external_message_id': row['external_message_id'], 'external_thread_id': row['thread_id'],
        'evidence': {'url': f"https://mail.google.com/mail/u/?authuser={quote(row['account_email'], safe='')}#all/{row['thread_id']}", 'account_email': row['account_email'], 'sender_email': row['sender_email'], 'recipients': row['recipients'], 'auto_ack': kind not in ('sent', 'human_reply'), 'observed': True, 'correspondence_status': 'waiting_reply' if kind == 'sent' else 'pending_reply' if kind == 'human_reply' else None},
    }
    if kind in ('sent', 'human_reply'):
        event['commercial_status'] = 'awaiting_reply' if kind == 'sent' else 'replied'
    return {'action': 'event', 'event': event}


def _validate_existing_event(events, row, company_id):
    """Existing canonical events are immutable; presentation differences are harmless."""
    if len(events) != 1:
        raise RuntimeError('Ambiguous Gmail idempotency key in commercial memory')
    event = events[0]
    if event.get('external_message_id') != row['external_message_id'] or event.get('external_thread_id') != row['thread_id'] or event.get('company_id') != company_id:
        raise RuntimeError('Gmail commercial event identity conflict; existing event was not modified')
