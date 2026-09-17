from __future__ import annotations

import os
import re
from datetime import datetime, timedelta, timezone
from email.utils import parseaddr, parsedate_to_datetime
from typing import Any

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
    client_id = os.environ.get("GOOGLE_CLIENT_ID", "").strip()
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET", "").strip()
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
    recipients = [address.strip() for address in re.split(r"[,;]", _header(message, "To")) if address.strip()]
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
        "metadata": {"history_id": message.get("historyId")},
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


def sync_gmail(limit_per_account: int = 50, newer_than_days: int = 14) -> dict[str, Any]:
    store = get_store()
    connections = [row for row in store.list("integration_connections") if row.get("tenant_id") == TENANT_ID and row.get("provider") == GMAIL_PROVIDER and row.get("account_type") == ACCOUNT_TYPE and not (row.get("metadata") or {}).get("disconnected")]
    existing = {str(row.get("message_key")): row for row in store.list("crm_inbox_messages")}
    fetched: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []

    for connection in connections:
        account = str(connection.get("provider_subject") or "").strip().lower()
        if not account:
            continue
        try:
            token = _connection_access_token(connection, store)
            headers = {"Authorization": f"Bearer {token}"}
            listing = requests.get("https://gmail.googleapis.com/gmail/v1/users/me/messages", headers=headers, params={"q": f"newer_than:{max(1, newer_than_days)}d", "maxResults": max(1, min(100, limit_per_account))}, timeout=30)
            if listing.status_code >= 400:
                raise RuntimeError(f"Gmail list failed {listing.status_code}: {listing.text[:300]}")
            for ref in listing.json().get("messages", []) or []:
                message_id = str(ref.get("id") or "")
                if not message_id:
                    continue
                response = requests.get(f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}", headers=headers, params={"format": "metadata", "metadataHeaders": ["From", "To", "Subject", "Date"]}, timeout=30)
                if response.status_code >= 400:
                    continue
                row = _normalize_message(account, response.json())
                previous = existing.get(row["message_key"])
                if previous:
                    store.upsert("crm_inbox_messages", {**previous, **row, "updated_at": _now()}, key="message_key")
                else:
                    fetched.append(row)
        except Exception as exc:
            errors.append({"account": account, "error": str(exc)[:400]})

    classified: dict[str, dict[str, Any]] = {}
    for start in range(0, len(fetched), 25):
        classified.update(_classify(fetched[start:start + 25]))
    relevant = 0
    for row in fetched:
        decision = classified.get(row["message_key"]) or _heuristic(row)
        score = float(decision.get("relevance_score", 0) or 0)
        if score >= 5:
            relevant += 1
        store.upsert("crm_inbox_messages", {**row, **decision, "status": "relevant" if score >= 5 else "low_value", "created_at": _now(), "updated_at": _now()}, key="message_key")

    return {"accounts": len(connections), "new_messages": len(fetched), "new_relevant": relevant, "errors": errors}
